# WI-003：首个 STUN 前的会话过期回收

[English](2026-09-26-pre-stun-expiry.md) | 中文

- 翻译状态：Machine Draft
- 权威原文：[2026-09-26-pre-stun-expiry.md](2026-09-26-pre-stun-expiry.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-09-26
- 类型：执行报告，不是产品验收。
- 授权：本轮诊断、回归、最小 C++ 修复与必要夹具调整，已记录在 [ACTIVE](../../ACTIVE.md)。
- 起始 HEAD：`eb9e05b7973d5b703687d95cae50e9da7c7b2b5e`；保留已有改动，未提交、未推送。
- [WI-002 报告](2026-09-26-meeting-baseline.zh.md)及其 25 个构造、22 个析构的审计保持不变。原先日志数量差异本身不能证明内存泄漏。
- 范围：现有单事件循环 SFU 的活动超时回收。不开发会议产品、字幕或 ASR，不开通付费 API，不更改集成策略，不扩展到完整优雅停机，不关闭 gate。

## 结果

旧代码可重复地保留从未收到 STUN、且已超过 35 秒活动期限的注册会话。
修复后，两类索引、会话、关联媒体对象及定时器均正常回收，现有媒体互通与重连继续工作。

| 检查 | 结果 | 证据 |
|---|---|---|
| 旧二进制真实信令复现，两次 | 预期失败 | 等待约 40 秒后，用户名索引 1、地址索引 0、存活会话 1；定时器 7，未回到基线 5；STUN 调用 0。 |
| 最小真实对象 C++ 回归 | 先失败后通过 | 旧代码退出 1，报 `expired transport is still owned`；修复后退出 0。直接断言 `IsAlive()` 排除了时钟或意外续期假设。 |
| 新目录 Debug 构建 | 通过 | `build/wi003-debug`；保留 WI-002 构建目录。 |
| 首个 STUN 前过期 | 通过 | 两类索引和全部被观测媒体对象归零，定时器回到 5。 |
| 回收后迟到 STUN | 通过 | 采样时已实际进入 STUN 处理函数 15 次，未重建索引或对象，未连接媒体。 |
| 重复创建并回收 | 通过 | 再创建两路真实发布，定时器 9 回到 5；C++ 测试另覆盖 20 次循环。 |
| 过期前首个 STUN 与活动续期 | 通过 | 等待 27 秒才应用 answer；连接后再保持 39 秒，发送音频包增至 2,006，仍存活；关闭并等待后全部回到基线。 |
| 活动与过期会话混合、多地址别名 | 通过 | 保留活动会话、音轨与定时器；清除过期会话两个地址别名；弱引用失效且关闭回调恰好执行一次。 |
| 原有三个测试 | 通过 | `rtcp_tcc_fb_test`、`timer_test`、`ws_protoo_client_test` 均以 30 秒超时直接执行，退出 0。 |
| ASan、UBSan、泄漏检测 | 通过 | 插桩后的真实对象回归退出 0，无 sanitizer 报告。 |
| WI-002 浏览器回归 | 通过 | 双端、三端、仅信令重连、第三方退出后其余继续、同 ID 重入及后续通知；持续观察 47.343 秒，跨过默认超时。 |
| 仓库检查与最终进程清理 | 见完成记录 | 在下方记录最终检查结果。 |

## 根因与证伪

真实 protoo `join`、`push` 将会话加入 `username2sessions_`。夹具先保存服务端返回的 SDP answer，
但不交给 Chrome，因此不会发出首个 STUN；同时继续信令心跳，避免房间和用户超时干扰。

旧 `WebRtcServer::OnTimer` 只扫描 `addr2sessions_`，该索引直到首个 STUN 到达才建立。
因此只有用户名索引的会话根本不会进入 `IsAlive()` 判断。索引中的强引用继续持有 pusher、
RTP 接收、DTLS、ICE 对象及两个定时器注册。

修改生产代码前已在 `build/wi003/evidence/diagnosis-before-fix.md` 保存失败证据和三个可证伪假设：

1. 超时扫描覆盖不全：真实信令和最小测试均确认。
2. 活动时间意外刷新或时钟异常：测试仅调整夹具会话时间，直接证明 `IsAlive()==false` 时旧代码仍不回收。生产时间逻辑未变。
3. 索引外有额外持有者：修复索引清理后弱引用失效，直接观测的对象及定时器回到基线。本次覆盖路径未发现额外持有者。

本轮确认的是具体的资源滞留缺陷；不能反推 WI-002 三个未匹配析构对象都由它导致，
也不宣称整个 SFU 已不存在任何泄漏。

## 修改边界

- `webrtc_server.cpp`：从用户名注册表选出过期对象，按对象身份删除其所有地址和用户名索引；暂时持有过期对象，等索引遍历完成后再执行原有析构和关闭回调。
- `webrtc_server.hpp`、`webrtc_session.hpp`、`timer.hpp`：各增加一个私有测试友元声明，无生产诊断端点或公共时钟、所有权 API。
- `tests/webrtc_session_expiry_test.cpp` 和一个 CMake 目标：复用真实 SFU 源码及依赖，通过局部时间控制、弱引用、回调和计数断言验证回收，测试结束检查 libuv 句柄关闭。未改造整个 CTest 体系。
- `scripts/baseline/pre-stun*` 与 `run-pre-stun.mjs`：真实浏览器信令和 GDB 观测。每次发布持有独立克隆音轨，失败保留证据并清理自有进程。
- 文档：双语报告、复现说明、ACTIVE 与 PRD 追溯。保留 WI-002 同 ID 修复、历史证据及上游归属。

`WebRtcSession::IsAlive()` 默认仍为 **35,000 毫秒**。未重构房间删除、完整优雅停机及其他所有权边界。
`RemoveSessionByRoomId` 仍保留原有按地址遍历实现，本报告不宣称单独验收了该 API。

## 复现与证据

构建、夹具、超时及 sanitizer 命令见 [PRE-STUN.md](../../scripts/baseline/PRE-STUN.md)，
浏览器准备步骤见 [基线 README](../../scripts/baseline/README.md)。固定上游客户端为
`e08c241f2f80518ebe1138d2127215bb11a52a61`，Playwright Core 1.62.1，Chrome for Testing 151.0.7922.34。
环境为 Ubuntu 24.04 x86_64、GCC 13.3、CMake 3.28.3、GDB 15.1、Node 22.22.3。
独立配置关闭 VoiceAgent 和无关监听，仅使用回环信令 18080、媒体 18000。

全部本地证据位于 `build/wi003/evidence/`：

| 路径 | 内容 |
|---|---|
| `pre-stun/result.json`、`pre-stun-red-repeat/result.json` | 两次旧二进制失败、浏览器状态和直接 GDB 观测。 |
| `pre-stun-green/result.json` | 修复后真实信令四阶段、完整采样及客户端清理。 |
| `deterministic-test-commands.json`、`deterministic-{red,green}.log` | 精确编译链接命令；保留原基线对象文件，分别链接旧、新服务端对象，记录先失败后通过。 |
| `expiry-debug-final.log`、`expiry-sanitize-final.log` | 最终独立测试和 sanitizer 执行。 |
| `debug-*.log`、`sanitize-*.log`、`*-test-build*.log` | 新目录构建历史，保留中间失败。 |
| `rtcp_tcc_fb_test.log`、`timer_test.log`、`ws_protoo_client_test.log`、`ctest-discovery.log` | 原有三个直接测试及独立 CTest 发现结果。 |
| `wi002-regression/result.json` | 媒体统计、远端解码 PCM、变化视频、截图、全部回归阶段及清理。 |
| `production-expiry.patch`、`binaries-source.sha256` | 生产代码最小差异及二进制、源码身份。 |

GDB 直接读取注册表、定时器容器，并在构造、析构断点按对象身份跟踪存活情况，去重编译器析构变体，
不调用被调试进程中的函数；`probeErrors` 为空。定时器采样排除了当前执行的服务端定时器，
因此始终在相同边界比较。这不是 libuv 句柄总数，也不是 RSS。

C++ 测试用弱引用独立确认销毁，并检查自己的 libuv 循环完整关闭。ASan、UBSan 覆盖被执行的项目代码路径，
不代表外部依赖全部插桩或完成全服务停机、泄漏审计。媒体回归逐方向要求正确频率的远端 PCM、
变化的视频像素与解码帧、递增的音视频接收字节；不等同于人工听验或真实设备验收。

## 失败、限制与完成记录

- 保留修复前预期失败，没有用通过结果覆盖。
- 新 Debug 源码构建首次因缺少 `unordered_set` 头文件失败，补齐后通过；一次新测试目标调用早于 CMake 重新生成，重跑后通过。这些已解决，不作为遗留故障。
- 已有问题仍在：CTest 发现 **0 个测试**；固定上游浏览器生产构建仍有先前记录的 11 项 TypeScript 错误；不修复无关技能文档的已知失效链接。
- 未验证：三台真实电脑、局域网 HTTPS/WSS 及受信任证书、真实麦克风和摄像头、扬声器人工听验、弱网、广泛停机安全、会议准入、字幕及 ASR。不关闭任何架构门禁。
- 完成检查：`npm test` 5/5 通过，`npm run check:deps` 和 `git diff --check` 通过。`npm run docs:verify` 结构检查为 0 错误，仅剩原有失效链接：`.agents/skills/setup-ts-deep-modules/SKILL.md` 指向缺失的 `./src/packages/README.md`。未修改无关技能。
- 最终驱动复验在 `pre-stun-final/result.json` 中通过。中断测试先发现 Playwright 默认 SIGTERM 处理与驱动清理冲突，已由夹具统一处理信号。`driver-sigterm-fixed/result.json` 记录预期取消（外层 timeout 退出 124），清理无错误，连接和音频资源关闭，未强制杀服务端。该取消实验不计作完整行为测试通过。
- 自有 Chrome、GDB、SFU、Vite 均已停止，18000、18080、18081、9002 无监听。`final-owned-processes.txt`、`final-listening-ports.txt` 为空。SIGTERM 和进程释放不代表完成了应用优雅停机验收。
- 检查日志位于证据目录的 `check-test.log`、`check-check-deps.log`、`check-docs-verify.log` 与 `git-diff-check.log`。

## 下一项最小任务

复用现有夹具建立**局域网 HTTPS/WSS 接入基线**，先从另一台真实电脑访问，再进行计划中的三机验收。
依赖本轮已修复的 Debug 和媒体基线、可达的局域网 candidate、浏览器受信任安全上下文及可用设备。
继续复用固定客户端、关闭 ASR，不立即进入完整会议 UI 或字幕开发；上游构建、CTest 等门禁缺口独立跟踪。
