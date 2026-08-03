# 局域网 HTTPS/WSS 与媒体基线（WI-004）

[English](2026-09-26-lan-media-baseline.md) | 中文

- 翻译状态: Machine Draft
- 权威原文: [2026-09-26-lan-media-baseline.md](2026-09-26-lan-media-baseline.md)
- 原文版本: Uncommitted baseline
- 最近同步: 2026-09-26
- 类型: 执行报告
- 状态: 自动化基线已执行；实体设备验收待完成
- 日期: 2026-09-26
- 权威范围: 测试夹具的实际观测证据，不代表产品验收或关卡关闭
- 相关文档: [WI-002](2026-09-26-meeting-baseline.zh.md)、[WI-003](2026-09-26-pre-stun-expiry.zh.md)、[命令](../../scripts/baseline/LAN.md)、[ACTIVE](../../ACTIVE.md)

## 结果与授权

已获批准的局域网配置、HTTPS/WSS 服务、隔离浏览器信任和原生摄像头/麦克风采集测试夹具均可运行。使用现有 SFU 的自动化检查通过。维护者明确表示，其他实体电脑暂时不可用。两台电脑互通、三台电脑连续十分钟媒体、实际麦克风/摄像头表现和人工听音仍然**未经验证**。WI-004 保持 Build、WIP=1，未关闭任何关卡。

本轮遵循配置、开发 TLS、测试夹具修改和有限兼容性/回归验证的明确授权。WI-004 无需修改 C++。传输默认超时仍为 35 秒。未调用付费 API，未启用 VoiceAgent/ASR，未实现准入或产品 UI，未修改全局信任、防火墙或路由器，未提交或推送 Git。保留了此前修改和 WI-002/WI-003 证据。

## 实现与信任边界

- `prepare-config.mjs` 保留原有 loopback 命令行和默认值。共用配置生成器接受监听/候选地址、端口和嵌套的 WSS 证书路径；不能覆盖已有输出。
- `prepare-lan.mjs` 要求本机已分配的私有 IPv4 和新的运行目录。生成有效期七天、包含精确 IP SAN 的 CA/服务器证书，再分别写入配置及 URL/证书清单。
- `serve-lan.mjs` 通过 Node HTTPS 仅提供内存中的 Vite 构建产物，不映射文件系统，也不暴露 Vite 开发端点。私钥权限为 0600，所在目录权限为 0700。局域网配置关闭无关服务及常规事件/SDP 日志。
- `prepare-browser-trust.mjs` 仅将公开 CA 导入被忽略的 `build/` 下新建的 NSS 数据库。Chrome 使用进程专属的 `XDG_DATA_HOME` 和独立配置。若旧路径 `~/.pki/nssdb` 已存在，脚本会拒绝继续，因为该路径会覆盖隔离设置。用户原有信任及系统信任保持不变。
- 设备模式增加预览、明确加入、离开、重试和同页重加。预览不建立信令或 peer connection。取消后才返回的采集资源会被停止。权限拒绝、设备缺失或设备占用错误均可恢复。合成媒体模式保留原有媒体断言。
- 设备证据只包含有界统计、汇总音频能量和帧计数，不包含录音、音频采样或视频像素。统计包含选中的 candidate pair，并去除 ICE username fragment 字段。十分钟采集/导出功能支持后续人工验收；本轮未执行十分钟实体设备观察。

这些工具用于可信局域网测试。TLS 不提供成员身份授权。固定版本的上游辅助代码、MIT 许可证及源码均保留在 `build/wi002-browser/upstream`，版本为 `e08c241f2f80518ebe1138d2127215bb11a52a61`。Vite 能打包本测试夹具，不代表上游 Vue/TypeScript 应用通过类型检查。

## 执行环境

| 项目 | 实际观测值 |
|------|------------|
| 平台 | Ubuntu 24.04 x86_64；Node 22.22.3；CMake 3.28.3；GCC 13.3 |
| 浏览器 | Chrome for Testing 151.0.7922.34，Playwright-core 1.62.1；启用沙箱 |
| 新 Debug 构建 | `build/wi004-debug` |
| 局域网运行目录 / 证据 | `build/wi004/run` / `build/wi004/evidence` |
| 网卡 | `enp94s0f0`，`10.10.16.135/27` |
| 页面 | `https://10.10.16.135:19081/browser.html` |
| 信令 | `wss://10.10.16.135:19080/webrtc` |
| 媒体 | `10.10.16.135:19000/UDP`，RTCPilot host candidate |
| 隔离信任 | `build/wi004/trust-data/pki/nssdb` |
| 保留的 loopback 配置 | `127.0.0.1`，HTTP 18081 / WS 18080 / UDP 18000 |

该 IP 在执行时属于本机；本机访问自己的局域网地址，不能证明另一台电脑可达。清单提供不同的 Alice/Bob/Charlie URL，带有 `media=devices`、房间和 WSS 端点。

证书 SAN 为 `IP Address:10.10.16.135`。叶证书用于 HTTPS 和 SFU 原生 WSS 的服务器认证，与上游 WebRTC DTLS 凭据分开。有效期截至 2026-10-03，精确时间见 `run/lan.json`。

```text
CA SHA-256:
5E:3F:D5:A9:6C:45:18:FE:AA:FB:27:64:29:1E:A6:7E:9F:C0:65:04:14:1D:52:53:B7:0F:ED:00:C7:EF:86:5F
Leaf SHA-256:
8B:F0:9C:28:DB:B1:F1:12:27:0F:E2:4C:B0:6E:81:85:6F:CA:4F:D8:86:96:55:5D:94:83:D0:AE:4E:CE:DB:F8
```

设置信任时，只能分发公开的 `build/wi004/run/ca.crt`。两份私钥都不得进入静态内容、日志或 Git。IP 变化或证书到期后，应生成新的运行/信任目录并更新向导，不能复用旧指纹。`libnss3-tools` 版本 `2:3.98-1ubuntu0.2` 仅解包到本地 `build/wi004/tools`，没有安装系统软件包。

## 已通过的检查

下列路径均相对于 `build/wi004/evidence/`。

| 检查 | 实际结果与证据 |
|------|----------------|
| 全新 Debug 配置/构建 | 退出码 0，`debug-configure.log`、`debug-build.log` |
| 原有三个直接运行的测试 | `timer_test`、`rtcp_tcc_fb_test`、`ws_protoo_client_test` 均在 30 秒超时限制内以 0 退出；日志与测试同名 |
| 聚焦的 C++ 生命周期测试 | `webrtc_session_expiry_test` 在 30 秒超时限制内以 0 退出 |
| 真实信令 WI-003 回归 | `pre-stun-loopback/result.json` 的四阶段全部通过：无首个 STUN 超时回收、拒绝迟到 STUN、重复回收、延迟首个 STUN/活跃连接续期 |
| 浏览器正常证书校验 | 未信任 CA 时返回 `ERR_CERT_AUTHORITY_INVALID`；隔离信任后得到 HTTPS 200、TLS 1.3、安全上下文及 WSS 打开/关闭码 1000。见 `browser-trust/result.json`；原有信任库元数据未变 |
| HTTPS/私钥/配置边界 | 错误 CA/主机名被拒绝；资源正常加载；私有文件、配置、源码和 Vite 路径返回 404；POST 返回 405。见 `tls-boundary-final/result.json` |
| 局域网合成媒体 | 两/三浏览器、仅信令重连、退出后其余媒体继续、同 ID 重加及后续通知均通过；最终持续观察 47.331 秒。见 `lan-media-final/result.json` |
| 保留的 loopback 媒体 | 相同媒体/重连阶段通过；持续观察 47.366 秒。见 `loopback-media/result.json` |
| 原生采集流程 | 使用 Chrome 模拟硬件的九阶段通过：权限拒绝/重试、预览隔离、受控的设备缺失/占用错误、取消、加入/重加及拒绝混合内容。见 `permissions-final/result.json` |
| 原生采集传输 | 模拟硬件通过 getUserMedia 采集后，两/三浏览器媒体与重连用例通过；持续观察 12.366 秒。见 `lan-fake-devices/result.json`；仅统计，无截图/WAV |
| 原生采集独立诊断 | 在有效的 loopback 和 LAN 200 页面上，十二项权限/采集断言通过。见 `native-capture-investigation/native-control.json` |
| 合成媒体夹具的响应式布局 | 375px/1120px 布局无横向溢出；检查了远端画面变化及清理。见 `viewports/result.json` 和合成画面截图 |
| 人工操作向导 | 模板库未修改，CA/URL 匹配，四阶段及 `bash -n` 通过。见 `device-wizard-static-checks.json`；未执行交互验收 |

最终 LAN 三浏览器阶段的六个接收方向均选中 `10.10.16.135:19000/UDP` 上的 SFU。远端解码 PCM 的 RMS 约为 0.0810-0.0852，测得音调为 439.45、662.11 和 878.91 Hz。各方向的接收音频/视频字节与解码帧持续增加，渲染像素变化，传输已连接。这是远端数字媒体证据，不代表通过扬声器进行的人工听音。

WI-003 回归直接观察索引、对象身份和定时器。无 STUN 超时后，用户名/地址计数及跟踪的存活传输对象均归零；注册定时器从 7 回到相应已加入房间的基线 5。重复回收和活跃连接清理也回到该基线。浏览器运行记录了 peer 关闭、track 结束、audio context 关闭和远端条目归零。进程/端口清理另行记录；进程终止不代表优雅关闭验收。由于未修改 C++ 生命周期，本轮无需新增 sanitizer 运行；聚焦的 ASan/UBSan 通过结果仍属于 WI-003 证据。

## 失败与未验证项

最初的权限测试驱动将异步 predicate 传入固定版本 Playwright 的轮询实现，后者把 Promise 本身当作成功，导致测试失败。现已改为有界的 Node 端轮询，并等待每次 snapshot 完成。初始失败保留在 `permissions/` 和 `permissions-repeat/`，最终成功另行保存。

早期原生采集探针访问了不存在的路由，落到 Chrome 错误文档。该页面的 `NotSupportedError` 不能证明真实 HTTPS 页面的采集失败。有效 200 页面的对照检查在不修改 TLS 或浏览器安全设置的情况下通过；反证见 `native-capture-investigation/`。

原有问题单独保留：CTest 发现零个测试（`ctest-discovery.log`）；固定版本上游 TypeScript 构建此前有 11 个错误（WI-002，本轮未重跑或修复）；无关技能链接 `.agents/skills/setup-ts-deep-modules/SKILL.md` 指向 `./src/packages/README.md`，仍是已知文档检查失败项。未修改无关技能。

未验证：第二/第三台实体电脑的可达性和媒体、真实硬件权限/设备差异、人工声音及摄像头动态画面确认、三台电脑连续十分钟稳定性、弱网、准入和通用优雅关闭。Shellcheck 不可用；向导只经过语法/结构检查，没有交互执行。

## 复现与下一步

构建、证书生成、启停、信任检查及媒体命令见 [LAN.md](../../scripts/baseline/LAN.md)。只有证书/IP 仍有效时才可复用当前配置；重复运行应使用新的输出目录。四个直接运行的二进制测试：

```bash
for test in timer_test rtcp_tcc_fb_test ws_protoo_client_test webrtc_session_expiry_test; do
  timeout --kill-after=5s 30s "build/wi004-debug/$test" || exit "$?"
done
```

执行完整生命周期验证前，先停止普通 loopback SFU；测试驱动自行管理其 SFU/GDB。保留 loopback 测试夹具服务运行：

```bash
WI003_BINARY=build/wi004-debug/RTCPilot WI003_CONFIG=build/wi004/loopback/config.json \
WI003_FULL=1 WI003_OUTPUT=build/wi004/evidence/pre-stun-repeat \
  timeout --signal=TERM --kill-after=10s 270s node scripts/baseline/run-pre-stun.mjs
```

下一项最小工作是 WI-004 尚未完成的实体设备部分：先两台电脑，再三台连续十分钟。前置条件包括可用设备、可达的私有地址、有效且正常受信任的 TLS、通过的 SFU/采集回归，以及各设备统计和人工观察。设备就绪后运行已准备的 `bash build/wi004/device-acceptance.sh`。它记录 PASS/FAIL/PENDING、候选地址、计数器增量、重连/重加和清理，本身不修改信任库。其记录仍需审核，不能据此通过产品关卡。不要仅凭自动化结果开始会议/字幕实现。

## 补充采集与导出对照

额外的导出冒烟探针最初直接调用 `chromium.launch`，选中了 `chromium-headless-shell`，与仓库测试驱动明确指定的完整 Chrome 可执行文件不同。原生采集在该环境中失败。只将可执行文件选择改为与测试驱动一致，探针即通过。这是探针/环境差异，不是放宽浏览器安全设置的理由，也不否定已通过的完整 Chrome 媒体运行。`stats-export/result.json` 保留失败；`stats-export-final/result.json` 和 `export.json` 证明统计采集可以启动，下载内容不含 ICE username fragment，并在离开时停止。这项短时对照不验证实体设备连续十分钟运行。

## Loopback 边界修复与完成检查

最终审查复现了原 loopback Vite 服务的一个边界问题：允许读取整个仓库，会导致新 TLS 目录内的无害 `.key` 占位文件也能通过 `/@fs` 获取。没有请求真实私钥。`loopback-boundary-before.json` 保留 HTTP 200 和失败断言。只修改 `serve.mjs` 一行，将允许目录缩小为夹具和固定上游检出目录；`loopback-boundary-after.json` 记录相同占位文件返回 HTTP 403，页面和模块仍返回 HTTP 200。可复现探针为 `build/wi004/evidence/loopback-boundary-probe.mjs`；原 before/after 输出已保留，重复探测时应使用新的输出路径。

修复后，`loopback-media-restricted/result.json` 的双端/三端、仅信令重连、退出后继续媒体、同 ID 重入及后续通知阶段全部通过，持续观察 12.343 秒。该结果补充而不覆盖此前 loopback 证据。LAN 服务原本只提供受限内存产物，无需再次修改。

`repository-checks.json` 记录 `npm test`（5/5）、`npm run check:deps`、全部夹具语法、向导语法、Git 空白及私钥忽略/索引检查通过。`npm run docs:verify` 仅因上述既有技能链接失败；结构检查零错误/警告，没有其他 i18n 错误。补充检查确认 19 个任务文件无空白问题、双语报告命令块一致，且证据日志/JSON 和本报告不含私钥 PEM 文本。产物哈希保存在证据旁，不包含私钥。

`cleanup.json` 和 `loopback-restricted-cleanup.json` 记录自有服务/浏览器已停止、端口已释放，后者还在最后回归结束后成功重新绑定 loopback 端口。交接时所有 LAN/loopback 服务均已停止；设备可用后按 LAN.md 重启。这验证进程和端口释放，不代表通用 SFU 优雅停机。既有门禁与实体设备验收仍未关闭。

`final-checks.json` 记录最终 `serve.mjs` 哈希、再次执行的文档/语法检查，以及所有回归结束后的完整进程和端口审计。
