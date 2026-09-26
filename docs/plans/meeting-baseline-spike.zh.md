# 多人会议基线验证方案

[English](meeting-baseline-spike.md) | 中文

- 翻译状态：Machine Draft
- 权威原文：[meeting-baseline-spike.md](meeting-baseline-spike.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-09-26
- 类型：方案
- 状态：Executed，已记录结果和剩余缺口
- 创建：2026-09-26
- 工作项：WI-002
- 决策：spike-only
- 门禁：`gate-sfu-build`、`gate-rtc-signaling`
- 权威：维护者于 2026-09-26 批准执行及必要的小范围基线修复
- 相关：[已确认范围](../discussions/2026-09-26-meeting-scope.zh.md)、[当前工作](../../ACTIVE.md)、[门禁](../reference/architecture-gates.zh.md)

执行证据：[WI-002 报告](../reports/2026-09-26-meeting-baseline.zh.md)。

## 目标与范围

建立仓库内 C++ SFU 的可复现构建，运行现有测试，再用两个、三个 Chrome
客户端验证双向音频和摄像头视频。建议以一个 10 小时学习周为时间上限，
不代表交付保证。维护者已批准执行，包括必要的小范围构建、兼容性和测试夹具
修复。实际结果单独记录，授权不代表验证成功。整个实验关闭 ASR 和 VoiceAgent，
不开通付费 API，也不扩大到完整产品开发。

三人硬上限、会议链接、空房间 60 秒后结束、字幕以及完整产品界面属于后续实现。
本实验不以缺少这些能力判失败，也不能以基线成功证明这些需求已经实现。

## 仓库证据

- [构建配置](../../third_party/RTCPilot/CMakeLists.txt) 第 5 行使用 C++17，第 63 行定义 `RTCPilot`，第 270、273、302 行定义三个测试目标；第 249 行的 Linux 链接项包括 zlib 和 bzip2。
- [依赖配置](../../third_party/RTCPilot/3rdparty/CMakeLists.txt) 第 7—8 行构建内置 libuv/yaml-cpp，第 40—74 行使用本地 OpenSSL/libsrtp 压缩包。内部构建固定 `make -j 4`，外层并行度不能完全限制并发。
- [TCC](../../third_party/RTCPilot/tests/rtcp_tcc_fb_test.cpp)、[定时器](../../third_party/RTCPilot/tests/timer_test.cpp)、[protoo](../../third_party/RTCPilot/tests/ws_protoo_client_test.cpp) 测试依赖 `assert`。必须使用 Debug，保留断言及写在断言内的操作。根 CMake 未向 CTest 注册这些测试。
- protoo 测试绑定 `127.0.0.1:9002`，读取仓库测试证书和私钥，没有内置截止时间，见其源码第 119—140 行；必须使用下方外部超时。
- [浏览器客户端](../../apps/web/README.md) 仍是占位。[SFU README](../../third_party/RTCPilot/README.md) 第 24 行仅指向外部 `runner365/webrtc_js_client` 示例，本仓库尚未验证兼容客户端的构建。

## 前置检查

执行获准后，在仓库根目录运行并记录输出、退出码。不静默安装缺少的工具，
不终止占用端口的未知进程。确认存在 zlib/bzip2 开发链接库。
使用全新构建目录；若下方路径已存在，另选路径，不删除已有目录。

```bash
git status --short
git rev-parse HEAD
command -v cmake c++ make perl pkg-config node npm
cmake --version
c++ --version
npm run check:deps
sha256sum third_party/RTCPilot/3rdparty/openssl-3.5.4.tar.gz third_party/RTCPilot/3rdparty/libsrtp.tar.gz
ss -lntup
```

## 构建与现有测试

先构建 SFU，确保测试需要的依赖已经生成。逐个执行测试；超时、崩溃或断言失败
都属于失败。CTest 发现结果用于记录注册缺口，不能替代测试执行。

```bash
cmake -S third_party/RTCPilot -B build/rtcpilot-meeting-baseline -DCMAKE_BUILD_TYPE=Debug
cmake --build build/rtcpilot-meeting-baseline --target RTCPilot --parallel 2
cmake --build build/rtcpilot-meeting-baseline --target rtcp_tcc_fb_test timer_test ws_protoo_client_test --parallel 2
timeout --kill-after=5s 30s build/rtcpilot-meeting-baseline/rtcp_tcc_fb_test
timeout --kill-after=5s 30s build/rtcpilot-meeting-baseline/timer_test
timeout --kill-after=5s 30s build/rtcpilot-meeting-baseline/ws_protoo_client_test
ctest --test-dir build/rtcpilot-meeting-baseline -N
```

测试通过仅覆盖现有断言，不能证明生命周期安全、媒体容量或浏览器互通。
注册可靠测试仍是独立的构建门禁要求；空的 CTest 测试集不等于测试通过。

## 浏览器夹具与本地配置

1. 获取并审阅上游示例的固定版本，包括许可证、依赖及实际启动命令，记录提交。将其作为隔离的测试夹具，不据此选择产品框架。生产构建不能依赖未声明的外部源码目录。若没有兼容示例，停止并另行限定最小协议探针任务。
2. 在 `build/rtcpilot-meeting-baseline/run/` 下准备不提交的配置。从[样例配置](../../third_party/RTCPilot/RTCPilot/config.yaml) 出发，将硬编码 candidate 地址改为实验主机的可达地址。保留一个 UDP candidate，关闭丢包注入、RTMP、HTTP-FLV、WS-FLV、WHIP、集群及 VoiceAgent，仅绑定预期的本地实验网卡。
3. 证书、私钥和日志使用绝对路径。即便信令使用普通 WebSocket，DTLS 初始化也需要顶层证书和私钥，见[入口](../../third_party/RTCPilot/src/RTCPilot.cpp)第 85 行。仓库证书仅为测试夹具，不作为最终局域网部署凭据。验证安全上下文中的浏览器采集能力；真实局域网验收需要受信任 HTTPS/WSS，不通过关闭浏览器安全限制完成。
4. 夹具连接 `/webrtc` 并使用 `protoo` 子协议，见[信令服务](../../third_party/RTCPilot/src/ws_message/ws_message_server.cpp)第 17—37 行。需支持 `join`、音视频 `push`、按发布标识 `pull`、成员与发布通知及心跳；参考[协议示例](../../third_party/RTCPilot/ws_design.md)和[心跳处理](../../third_party/RTCPilot/src/webrtc_room/room_mgr.cpp)第 353 行。

上述资产就绪后，才使用准备好的配置启动 SFU；[入口](../../third_party/RTCPilot/src/RTCPilot.cpp)
第 48 行接收配置路径。浏览器启动命令以已审阅夹具为准，不预设技术栈。

```bash
build/rtcpilot-meeting-baseline/RTCPilot build/rtcpilot-meeting-baseline/run/config.yaml
```

## 互通步骤

1. 两个隔离的电脑端 Chrome 实例使用独立参会者标识加入同一房间，发布麦克风和摄像头，并双向订阅。
2. 确认远端画面持续变化、远端测试语音可辨认，不能只看到本地预览。记录实际协商的音视频编码、ICE/DTLS 状态，以及各远端发布持续增加的接收字节数和解码帧数。
3. 加入第三个客户端，每人接收另外两人的音视频。第三人退出再加入，原有两人保持通话。建议观察 10 分钟；这是实验窗口，不是最终稳定性指标。
4. 本机多个实例可使用不同合成媒体夹具，避免设备争用；人工听感验证使用耳机。三台真实局域网电脑的最终验收独立进行，不能以本机多个标签页代替。
5. 关闭客户端及实验服务器，确认对应端口释放。记录失败与退出结果，不凭单次运行成功宣称内存安全。

## 证据、停点与门禁

保存源码版本和工作区差异摘要、工具版本、依赖哈希、命令及退出码、脱敏配置、
客户端版本与启动方式、Chrome 版本、脱敏 SDP/统计摘要，以及双端和三端结果矩阵。
报告不保留私钥或真实会议音视频。

前置条件缺失、构建或测试失败、客户端不可用或不兼容、所需端口被占用、
浏览器信任或采集未就绪、任意方向音频或视频不通时停止。保留最小复现，
提出聚焦修复，不在失败基线上叠加字幕工作。达到建议时间上限后报告已有证据与
未决问题，不将时间用尽当作完成。

执行前，构建可复现性与信令互通仍是缺口。本方案或一次通话成功都不关闭门禁；
CTest 注册、经审阅的证据及[门禁关闭流程](../reference/architecture-gates.zh.md)仍须满足。
本实验不认证准入、生命周期、容量或字幕集成，也不选定框架、改变集成策略或新增 Accepted ADR。
