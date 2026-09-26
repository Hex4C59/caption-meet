# WI-002 构建与浏览器媒体基线

[English](2026-09-26-meeting-baseline.md) | 中文

- 翻译状态：Machine Draft
- 权威原文：[2026-09-26-meeting-baseline.md](2026-09-26-meeting-baseline.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-09-26
- 类型：执行报告
- 状态：已执行，基线通过并保留明确缺口
- 日期：2026-09-26（UTC）
- 决策：spike-only，未关闭任何门禁
- 授权：维护者已批准[基线方案](../plans/meeting-baseline-spike.zh.md)、执行，以及必要的小范围构建、兼容性和测试夹具修复，记录见 [ACTIVE](../../ACTIVE.md)。
- 范围：Debug 构建、直接执行现有测试、隔离浏览器媒体及清理验证。不涉及付费 API、ASR、产品实现、提交或推送。

## 结果

| 检查 | 结果 | 证据 |
|------|------|------|
| 全新 RTCPilot Debug 配置与构建 | 通过 | 使用新的 `build/rtcpilot-meeting-baseline`；原始 SFU 构建成功，修复后重新构建成功。 |
| 三个现有测试程序 | 通过 | 修复前后，TCC、定时器、protoo 均在 30 秒超时限制内以 0 退出。 |
| CTest 测试发现 | 存在缺口 | `Total Tests: 0`；空测试集不能当作测试通过。 |
| 固定版本上游浏览器示例 | 部分通过 | 原始 Vite 界面返回 HTTP 200，未出现页面错误；生产构建出现 11 项 TypeScript 诊断并失败。 |
| 两个独立 Chrome 进程 | 通过 | 两个远端方向均有解码音频、持续变化的渲染视频和增长的媒体计数。 |
| 三个独立 Chrome 进程 | 通过 | 六个远端方向均有音频和视频。 |
| 同 ID 立即重新发布媒体入会 | 首次失败，已修复 | 服务端同时公告了旧发布与新发布；媒体已经建立后的双浏览器复现，在修复后通过。 |
| 仅信令重连及后续通知 | 通过 | 媒体持续传输；重连后的 Charlie 收到 Bob 后续的新发布。 |
| 三浏览器持续观察十分钟 | 通过 | 持续 602.362 秒，19 次周期采样中六个远端方向全部通过。 |
| 最终资源清理及端口释放 | 成功路径通过，失败路径存在缺口 | 成功运行的 26 个传输对象和两个房间均销毁；浏览器及端口已释放。早先失败运行有三个未匹配销毁记录。 |
| 三台真实电脑、真实设备及受信任局域网 HTTPS/WSS | 未验证 | 本机合成媒体不能证明真实设备或真实网络验收通过。 |

## 来源与环境

- 仓库 HEAD：`eb9e05b7973d5b703687d95cae50e9da7c7b2b5e`。保留了原有已修改、未跟踪文档及内置上游源码。
- RTCPilot 引入版本：`b0fb2c4f24cea5e4f5c4b3f84c342857bc7645d8`，见[上游记录](../../third_party/RTCPilot/UPSTREAM.md)。保留归属信息及 LICENSE。
- 浏览器：[runner365/webrtc_js_client，版本 e08c241f2f80518ebe1138d2127215bb11a52a61](https://github.com/runner365/webrtc_js_client/tree/e08c241f2f80518ebe1138d2127215bb11a52a61)。以 detached HEAD 检出至忽略目录 `build/wi002-browser/upstream`，MIT 源码未修改。
- Ubuntu 24.04 x86_64；CMake 3.28.3；GCC 13.3.0；Node 22.22.3；zlib 1.3；已具备 bzip2 开发文件。
- OpenSSL 3.5.4、libuv 1.44.3、yaml-cpp 0.8.0、libsrtp `2.5.0-pre`（安装后的 pkg-config 版本）。
- Google Chrome for Testing 151.0.7922.34、Playwright Core 1.62.1、Vite 7.1.12。使用独立 Chrome 进程并启用沙箱，未关闭证书校验或浏览器安全机制。无头模式默认静音系统音频；PCM 解码与播放状态的测量，不等于物理扬声器可听验证。

| 输入 | SHA-256 |
|------|---------|
| `openssl-3.5.4.tar.gz` | `967311f84955316969bdb1d8d4b983718ef42338639c621ec4c34fddef355e99` |
| `libsrtp.tar.gz` | `12c27353a636d9ab84ee0c63395ad536a3326d89fec614dcb5511ff22d491305` |
| 浏览器 `package-lock.json` | `1d0b68d0c1d664ec4b305827962835f9c351f6f2629ecdb141db1e1aa48f8bf5` |
| 浏览器 MIT `LICENSE` | `06dcddbb6908a0c6dd4a9e8ec822eea41d5a460a53089fecccc8a68049e99241` |

现有 CMake 策略和弃用提示、编译器符号性警告及 OpenSSL Perl 警告没有导致构建失败。
SFU 文本日志的月份比 UTC 小一；本报告以外部 UTC 和事件 JSON 时间戳为准。
这项无关日志缺陷未修改。

## 复现

按[已批准方案](../plans/meeting-baseline-spike.zh.md)中的原始命令执行 Debug 配置、构建和三个带超时的直接测试。
选择全新目录，不删除已有构建。Debug 保留断言，测试端口 9002 必须空闲。
先构建 SFU，再构建测试，以确保依赖已经生成。

[浏览器夹具说明](../../scripts/baseline/README.md)固定源码与依赖版本，并给出原始示例和实验运行器的启动方式。
生成独立配置，在不同终端启动服务：

```bash
node scripts/baseline/prepare-config.mjs build/rtcpilot-meeting-baseline/run
build/rtcpilot-meeting-baseline/RTCPilot build/rtcpilot-meeting-baseline/run/config.json
node scripts/baseline/serve.mjs
WI002_SOAK_SECONDS=600 timeout --kill-after=10s 900s node scripts/baseline/run-browser.mjs
```

生成器拒绝覆盖已有配置。信令绑定 `127.0.0.1:18080`，唯一 UDP candidate 绑定 `127.0.0.1:18000`，不注入丢包。
RTMP、HTTP-FLV、WS-FLV、WHIP、集群、VoiceAgent 和 TTS 均禁用，没有启动识别服务。
DTLS 证书和私钥的绝对路径指向现有测试夹具，不发布私钥内容。首次实际运行使用等价的 `run/config.yaml`。

实际浏览器运行通过 `WI002_CHROME` 选择已缓存 Chrome，结果保存至
`WI002_OUTPUT=build/wi002-browser/evidence/three-browser-soak`。
夹具导入上游 `PCWrap` 和 `ProtooClientWrap`，使用 `/webrtc` 和 `protoo`，所有媒体均经过 SFU。
这不代表选择产品框架或实现产品界面。

## 媒体与修复证据

持续观察从 13:53:16.357 到 14:03:18.719 UTC，共 602.362 秒。
六个远端方向的 19 次周期采样全部通过，所有 25 项场景或采样检查均通过。
协商编码为 Opus/48 kHz 和 H.264/90 kHz，最终 ICE 与 DTLS 均已连接。
以下为每条当前接收连接的最终累计计数：

| 接收端 <- 发送端 | 音频字节 | 视频字节 | 视频解码帧 | 测得频率（Hz） |
|------------------|---------:|---------:|-----------:|---------------:|
| Alice <- Bob | 387563 | 23508573 | 5591 | 662.11 |
| Alice <- Charlie | 487294 | 25093564 | 5574 | 878.91 |
| Bob <- Alice | 374173 | 23877892 | 5614 | 439.45 |
| Bob <- Charlie | 484449 | 25047445 | 5551 | 878.91 |
| Charlie <- Alice | 376422 | 24004331 | 5646 | 439.45 |
| Charlie <- Bob | 387603 | 23508573 | 5591 | 662.11 |

最终远端 PCM RMS 为 0.08060 至 0.08500，十二份入站媒体统计均记录零丢包。
这些是本机回环、合成输入的结果，不是弱网测量或延迟、服务指标。


Alice、Bob、Charlie 分别发布 440、660、880 Hz 合成音频，以及 10 fps 的动态 640x360 画布视频轨道。
各接收端采样远端解码 PCM：RMS 必须大于 0.005，峰值频率与远端发送者相差不超过 20 Hz。
远端视频像素哈希必须变化，渲染及解码帧数、接收音视频字节数必须在采样间增长，DTLS 必须处于已连接状态。
本地预览不能满足这些断言。无头自动化没有证明物理扬声器输出或人工听感。

最初的双端、三端媒体，以及 C 离开后的 A/B 连续通话均通过。
C 立即重新加入时出现音频解复用 SDP 错误。
缩减到双浏览器并先建立媒体后，复现了 `bob advertised audio,audio,video,video`；
服务端事件同时包含确切的两个旧 ID 和两个新 ID，排除了纯客户端重复订阅这一解释。
更早一次未先建立媒体的缩减实验通过，保留它作为时序证据，不将其当作失败复现。

按 `diagnosing-bugs` 流程，修复仅涉及 [room.cpp](../../third_party/RTCPilot/src/webrtc_room/room.cpp)
和 [rtc_user.hpp](../../third_party/RTCPilot/src/webrtc_room/rtc_user.hpp)。
重连时重新绑定响应回调并刷新活动时间，仅在此后的首次成功发布时移除之前的发布及对应路由。
仅信令重连保留媒体，接收订阅保持完整，旧传输仍采用已有超时规则。
线协议名称、WHIP 和外部 VoiceAgent 策略未改变。

回归验证覆盖原始失败、仅信令重连的连续性、重连用户后续接收通知，以及旧传输过期后的媒体。
一般发布失败回滚、同时抢占同一身份、授权及优雅关闭不在本修复范围内。

上游生产构建失败另外定位到 `PCWrap.setRemoteDescription` 声明却未返回 Promise，另有 Vue 类型错误。
夹具等待原生 Promise，并使用 Vite 开发转译。上游原始源码未修改，其生产构建仍失败。

## 保留的产物

- `build/rtcpilot-meeting-baseline/evidence/`：环境及工作区差异快照、配置和构建日志、修复前后各测试日志、CTest 发现结果、修复前源码副本、修复补丁及资源采样。
- `build/rtcpilot-meeting-baseline/run/`：独立配置及结构化、文本日志。原始本地诊断包含临时测试 SDP，不属于产品产物或凭据发布。
- `build/wi002-browser/evidence/`：上游构建失败和界面截图、初始失败、缩减复现、修复后回归及完整三浏览器截图和统计。
- [持久保存的夹具](../../scripts/baseline/README.md)：环境搭建及可执行验证；下载的客户端和生成的二进制仍处于忽略目录。

## 清理与检查

完整运行后，三个浏览器进程均已退出：所有 PeerConnection 已关闭，本地轨道均为
ended，AudioContext 已关闭，远端集合清空。SFU 约在 14:03:54 UTC 完成传输对象
销毁，14:04:24 释放用户，14:05:54.694 销毁空房间。修复后两次运行的房间均已
销毁，26 个新建传输对象均有对应销毁记录（最小回归 7 个，完整运行 19 个）。
这些现有活动与空房超时并不等于产品提出的 60 秒会议结束规则。

SFU 启动时有 14 个文件描述符，三人通话时 19 个，回收后为 16 个，其中包含两个
延迟打开的事件日志。持续观察后段 RSS 稳定为 33316 KiB，回收后为 33204 KiB；
分配器可能保留内存，因此不能据此断言无泄漏。采样及描述符目标已保留。

单独的双浏览器停服实验将 Alice 实际收到的 Bob 音轨保存为
`build/wi002-browser/evidence/server-stop/alice-receives-bob.wav`：96000 个采样，
单声道 48 kHz，2 秒，PCM16，RMS 0.079944，实测 660 Hz。AudioWorklet 采集的
是实际接收轨道，不是根据频率重新合成的声音。
SHA-256：`d84a0207d9be7eadf5f9a37430dcb5fa0065a49b63b7cc877edd9fdf1b602209`。

14:08:09 的 SIGTERM 使本轮 SFU 以 143 退出。两个浏览器均观察到信令断开，
随后完成本地清理。夹具服务器已停止；TCP 18080/18081/18082/9002 和 UDP 18000
均已释放。最后一次生成配置的启动成功，并由三秒超时按预期停止（退出码 124）。
当前没有优雅信号排空处理器，系统终止及端口释放不能证明有序应用关闭。

早先失败实验另有清理证据缺口：25 个传输对象新建，但即使三个房间均已销毁，
仍只看到 22 条对应销毁记录。`initial-cleanup-audit.json` 列出三个未匹配 ID。
结合 `webrtc_server.cpp` 只遍历地址索引的回收逻辑，下一步应验证首个 STUN
之前的超时回收。日志本身不是 sanitizer 或实时注册表的泄漏证明。

| 检查 | 最终结果 |
|------|----------|
| `npm test` | 通过，5/5 项文档测试 |
| `npm run check:deps` | 通过 |
| `git diff --check` 及夹具语法检查 | 通过 |
| `npm run docs:verify` | 失败：已有 `.agents/skills/setup-ts-deep-modules/SKILL.md` 指向 `./src/packages/README.md` 的失效链接 |

首次构建后的文档检查还扫描了解压出的 OpenSSL 构建文件，增加 12 条错误。
本轮只用一行扫描配置排除生成的 `build` 目录，与已有依赖排除方式一致。
已知技能链接既未修改也未隐藏。文档结构通过，完整命令仍失败；没有修改无关技能。

## 下一项最小任务

为已协商但从不发送首个 STUN 的传输增加有界回归，测量超时后的注册表与句柄
数量，再修复这一具体清理路径。依赖证据是已保存的 25/22 失败运行审计、
`WebRtcServer::OnTimer` 仅遍历 `addr2sessions_`、现有 35 秒传输超时，以及本轮
通过的已连接媒体夹具作为对照。不以未经验证的生命周期保证开始字幕或产品开发。
CTest 注册仍是独立构建门禁要求；三台真实电脑及受信任局域网采集仍需后续验收。

治理结论：本轮证明了固定版本本机夹具的来源与协议兼容性；资源所有权、取消及
完整关闭仍有缺口；产品 UI 和持久化改动不适用。此实验不提升任何架构门禁或 PRD
验收状态。
