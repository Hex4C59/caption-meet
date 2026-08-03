#include "webrtc_room/webrtc_server.hpp"
#include "webrtc_room/webrtc_session.hpp"
#include "utils/byte_crypto.hpp"
#include "utils/event_log.hpp"

#include <cstdio>
#include <map>
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

std::unique_ptr<cpp_streamer::EventLog> g_rtc_event_log;
std::unique_ptr<cpp_streamer::EventLog> g_rtc_stream_log;

namespace cpp_streamer {

// Change only fixture timestamps; production retains its 35-second deadline.
struct WebRtcExpiryTestPeer {
    static void SetAge(WebRtcSession& session, int64_t age_ms) {
        session.alive_ms_ = now_millisec() - age_ms;
    }
    static void Sweep(WebRtcServer& server) { server.OnTimer(); }
    static size_t Usernames() { return WebRtcServer::username2sessions_.size(); }
    static size_t Addresses() { return WebRtcServer::addr2sessions_.size(); }
    static size_t Timers() { return TimerInner::GetInstance()->timers_.size(); }

    static void ClearSessions() {
        WebRtcServer::addr2sessions_.clear();
        WebRtcServer::username2sessions_.clear();
    }
    static void CloseTimerHandle() {
        auto* timer = TimerInner::GetInstance();
        timer->Deinitialize();
        uv_close(reinterpret_cast<uv_handle_t*>(&timer->timer_), nullptr);
    }
    static void DestroyTimerAfterDrain() {
        delete TimerInner::instance_;
        TimerInner::instance_ = nullptr;
    }
};

} // namespace cpp_streamer

using namespace cpp_streamer;

static void Check(bool condition, const char* message) {
    if (!condition) throw std::runtime_error(message);
}

class CloseObserver : public MediaPushPullEventI {
public:
    void OnPushClose(const std::string& id) override { ++closed_pushers[id]; }
    void OnPullClose(const std::string&) override {}
    void OnKeyFrameRequest(const std::string&, const std::string&,
                           const std::string&, uint32_t) override {}
    std::map<std::string, size_t> closed_pushers;
};

struct SessionObservation {
    std::weak_ptr<WebRtcSession> session;
    std::weak_ptr<MediaPusher> pusher;
    std::string pusher_id;
};

static SessionObservation RegisterSession(uv_loop_t* loop, Logger* logger,
        CloseObserver& observer, const std::string& user_id, int64_t age_ms,
        const std::vector<uint64_t>& addresses = {}) {
    auto session = std::make_shared<WebRtcSession>(SRtpType::SRTP_SESSION_TYPE_RECV,
        "expiry-test", user_id, nullptr, &observer, loop, logger);
    RtpSessionParam audio;
    audio.av_type_ = MEDIA_AUDIO_TYPE;
    audio.codec_name_ = "opus";
    audio.clock_rate_ = 48000;
    audio.channel_ = 2;
    audio.payload_type_ = 111;
    audio.ssrc_ = 12345;
    audio.mid_ = 0;
    audio.use_nack_ = false;
    audio.rtx_ssrc_ = 0;
    std::string pusher_id;
    Check(session->AddPusherRtpSession(audio, pusher_id) == 0,
        "failed to create real receive track");
    auto pushers = session->GetMediaPushers();
    Check(pushers.size() == 1, "expected one receive track");
    SessionObservation result{session, pushers.front(), pusher_id};
    WebRtcExpiryTestPeer::SetAge(*session, age_ms);
    if (age_ms == 0) Check(session->IsAlive(), "fresh transport is not alive");
    if (age_ms > 35000) Check(!session->IsAlive(), "aged transport is still alive");
    WebRtcServer::SetUserName2Session(session->GetIceUfrag(), session);
    for (uint64_t address : addresses) WebRtcServer::SetAddr2Session(address, session);
    return result;
}

static void CheckReleased(const SessionObservation& observation,
        const CloseObserver& observer) {
    Check(observation.session.expired(), "expired transport is still owned");
    Check(observation.pusher.expired(), "expired receive track is still owned");
    auto closed = observer.closed_pushers.find(observation.pusher_id);
    Check(closed != observer.closed_pushers.end() && closed->second == 1,
        "publication close callback was not delivered exactly once");
}

static void TestNoStunExpiry(WebRtcServer& server, uv_loop_t* loop,
        Logger* logger, CloseObserver& observer) {
    const size_t timers = WebRtcExpiryTestPeer::Timers();
    const auto observation = RegisterSession(loop, logger, observer, "no-stun", 36000);
    Check(WebRtcExpiryTestPeer::Usernames() == 1, "username registration missing");
    Check(WebRtcExpiryTestPeer::Addresses() == 0, "no-STUN session has an address");
    Check(WebRtcExpiryTestPeer::Timers() == timers + 2,
        "transport and receive-track timers were not registered");
    WebRtcExpiryTestPeer::Sweep(server);
    CheckReleased(observation, observer);
    Check(WebRtcExpiryTestPeer::Usernames() == 0, "expired username remains");
    Check(WebRtcExpiryTestPeer::Addresses() == 0, "unexpected address remains");
    Check(WebRtcExpiryTestPeer::Timers() == timers, "expired timers remain");
}

static void TestMixedSessionsAndAliases(WebRtcServer& server, uv_loop_t* loop,
        Logger* logger, CloseObserver& observer) {
    const size_t timers = WebRtcExpiryTestPeer::Timers();
    const auto active = RegisterSession(loop, logger, observer, "active", 0, {100});
    const auto expired = RegisterSession(loop, logger, observer, "aliases", 36000, {200, 201});
    const auto no_stun = RegisterSession(loop, logger, observer, "no-stun-mixed", 36000);
    Check(WebRtcExpiryTestPeer::Addresses() == 3, "alias setup failed");
    WebRtcExpiryTestPeer::Sweep(server);
    CheckReleased(expired, observer);
    CheckReleased(no_stun, observer);
    Check(!active.session.expired(), "live transport was removed");
    Check(!active.pusher.expired(), "live receive track was removed");
    Check(observer.closed_pushers.count(active.pusher_id) == 0,
        "live publication received a close callback");
    Check(WebRtcExpiryTestPeer::Usernames() == 1, "live username was not preserved");
    Check(WebRtcExpiryTestPeer::Addresses() == 1, "expired address alias remains");
    Check(WebRtcExpiryTestPeer::Timers() == timers + 2,
        "live timers not preserved or expired timers not removed");
    {
        auto session = active.session.lock();
        Check(session != nullptr, "live control disappeared");
        WebRtcExpiryTestPeer::SetAge(*session, 36000);
    }
    WebRtcExpiryTestPeer::Sweep(server);
    CheckReleased(active, observer);
    Check(WebRtcExpiryTestPeer::Usernames() == 0, "final username remains");
    Check(WebRtcExpiryTestPeer::Addresses() == 0, "final address remains");
    Check(WebRtcExpiryTestPeer::Timers() == timers, "final timers remain");
}

static void TestRepeatedCycles(WebRtcServer& server, uv_loop_t* loop,
        Logger* logger, CloseObserver& observer) {
    const size_t timers = WebRtcExpiryTestPeer::Timers();
    for (int cycle = 0; cycle < 20; ++cycle) {
        const auto observation = RegisterSession(loop, logger, observer,
            "cycle-" + std::to_string(cycle), 36000);
        WebRtcExpiryTestPeer::Sweep(server);
        CheckReleased(observation, observer);
        Check(WebRtcExpiryTestPeer::Usernames() == 0, "cycle retained a username");
        Check(WebRtcExpiryTestPeer::Addresses() == 0, "cycle retained an address");
        Check(WebRtcExpiryTestPeer::Timers() == timers, "cycle retained timers");
    }
}

int main() {
    uv_loop_t loop;
    if (uv_loop_init(&loop) != 0) {
        std::fputs("failed to initialize test loop\n", stderr);
        return 1;
    }
    ByteCrypto::Init();
    StreamerTimerInitialize(&loop, 5);
    Logger logger("", LOGGER_ERROR_LEVEL);
    CloseObserver observer;
    int result = 0;
    {
        RtcCandidate candidate(RTC_NET_UDP, "127.0.0.1", "127.0.0.1", 0);
        WebRtcServer server(&loop, &logger, candidate);
        try {
            TestNoStunExpiry(server, &loop, &logger, observer);
            TestMixedSessionsAndAliases(server, &loop, &logger, observer);
            TestRepeatedCycles(server, &loop, &logger, observer);
        } catch (const std::exception& error) {
            std::fprintf(stderr, "webrtc_session_expiry_test: %s\n", error.what());
            result = 1;
        }
        WebRtcExpiryTestPeer::ClearSessions();
    }
    if (WebRtcExpiryTestPeer::Timers() != 0) {
        std::fputs("test teardown retained registered timers\n", stderr);
        result = 1;
    }
    WebRtcExpiryTestPeer::CloseTimerHandle();
    uv_run(&loop, UV_RUN_DEFAULT);
    if (uv_loop_close(&loop) != 0) {
        std::fputs("test teardown retained libuv handles\n", stderr);
        result = 1;
    }
    WebRtcExpiryTestPeer::DestroyTimerAfterDrain();
    ByteCrypto::DeInit();
    if (result == 0) std::puts("webrtc_session_expiry_test: ALL PASSED");
    return result;
}
