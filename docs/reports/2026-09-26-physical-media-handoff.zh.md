# 实体媒体继续执行与交接（WI-004）

[English](2026-09-26-physical-media-handoff.md) | 中文

- 类型：执行报告
- 状态：独立预检已执行；实体设备验收未验证
- 日期：2026-09-26
- 翻译状态：Machine Draft
- 权威原文：[英文报告](2026-09-26-physical-media-handoff.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-09-26
- 权威性：本轮实际执行证据，不代表产品验收或门禁关闭
- 相关：[ACTIVE](../../ACTIVE.md)、[上一轮 WI-004](2026-09-26-lan-media-baseline.md)、[LAN 操作](../../scripts/baseline/LAN.md)、[WI-003](2026-09-26-pre-stun-expiry.md)、[WI-002](2026-09-26-meeting-baseline.md)

## 结果与授权

已在 ACTIVE 记录本次专用服务启停、配置/开发证书、小范围夹具修复及回归授权。
WI-004 保持 **Build / WIP=1**，没有新增工作项、关闭门禁、提交或推送。

用户确认目前有 Ubuntu 服务器和一台 Windows 主机，但二者**仅远程连接，不在同一 LAN**。
因此没有满足本次要求的两台同局域网电脑。真实双机媒体、人工听音与变化画面、三机十分钟、
实体设备信令重连/退出重入均为**未验证**，收到的实体设备原始 JSON 为零。
确认后继续独立工作，没有反复催促设备，也没有增加隧道、TURN、公网或防火墙/路由器改动。

新产物位于 `build/wi004-physical-20260926/`；已有 WI-002/WI-003/WI-004 证据、
原始失败、构建目录与上游归属全部保留。

## 实际预检

网卡仍为 `enp94s0f0`、`10.10.16.135/27`，三个测试端口启动前空闲。
固定浏览器客户端仍是干净的 `e08c241f2f80518ebe1138d2127215bb11a52a61`，无需重新下载。
增量 Debug 构建退出 0，没有重新编译源码；SFU、生命周期测试和夹具哈希与上轮最终证据一致。
`serve.mjs` 使用上轮 `final-checks.json` 中最后一次收窄允许范围后的哈希核对。
本轮未改应用或 C++ 源码。

在全新目录生成配置和证书，没有覆盖仍有效的旧目录。新 CA/leaf 有效期为
2026-09-26 16:53:26 至 2026-10-03 16:53:26 UTC，SAN 为 `IP Address:10.10.16.135`。

| 项目 | 值 |
|---|---|
| HTTPS | `https://10.10.16.135:19081/browser.html` |
| 原生 SFU WSS | `wss://10.10.16.135:19080/webrtc` |
| 媒体 | `10.10.16.135:19000/UDP` |
| PEM 公开 CA | `build/wi004-physical-20260926/run/ca.crt` |
| Windows DER 公开 CA | `build/wi004-physical-20260926/public-share/voicecoach-ca.cer` |
| CA SHA-256 | `F6:EF:EC:64:A4:49:C7:AF:FD:3F:30:05:44:04:33:FC:3D:94:B8:70:9C:7F:AE:20:C0:FF:93:AA:ED:40:72:39` |
| Leaf SHA-256 | `7A:1A:90:A9:29:2E:E6:04:D3:77:8F:6A:29:56:11:E1:24:36:78:48:03:35:49:85:FD:F8:C8:85:D9:C9:3D:E5` |

预检实际运行于 **16:55:58.620–16:56:20.866 UTC**，Node 22.22.3、完整
Chrome for Testing 151.0.7922.34，启用沙箱与正常 TLS 校验。仅为测试进程指定独立
`XDG_DATA_HOME` 和 profile，HOME/现有 NSS/系统信任不变；不把新 profile 当作证书隔离。

## 通过

以下路径相对本轮 `evidence/`：

| 检查 | 实际证据 |
|---|---|
| 地址、端口、证书、产物及增量构建 | `debug-incremental-build.log`、`preflight/result.json` |
| 正常 HTTPS/WSS 信任 | `preflight/browser-trust/result.json`：未信任 CA 被拒绝；受信 HTTPS 200、TLS 1.3、安全上下文，WSS 打开/关闭 1000；原有信任元数据不变 |
| TLS 与私有文件边界 | `preflight/tls-boundary/result.json`：错误主机名/未信任 CA 拒绝，私钥/配置/源码/开发路由 404，POST 405，禁用无关服务且私钥权限受限 |
| 短时本机媒体 | `preflight/media/result.json`：两个明确使用模拟采集硬件的本机 Chrome，双向通过，soak 12.304 秒；没有真实音视频或截图 |
| 相同 ID/SSRC 增量 | `media-audit-and-trust-cleanup.json`：双向音视频字节/解码帧增长，发布和接收的选中候选均指向 SFU |
| 浏览器清理 | 两端 peers closed、tracks ended、音频上下文关闭、远端条目为零 |
| 设备向导 | `device-wizard-checks.json`：六阶段、Bash 语法、模板库原样和 14 项静态检查通过；未运行交互验收 |
| 仓库检查 | 根测试 5/5、依赖检查、语法和空白检查通过；最终命令/边界/清理记录见 `completion-checks.json` |

最后约 2.23 秒的采样区间：Alice 接收 Bob 的音频/视频字节增量为 **1,324 / 43,000**，
解码帧 **45**；Bob 接收 Alice 为 **1,274 / 41,275**、**46** 帧。
这是同机模拟硬件证据，不能算作人听到声音或真实电脑验收。

## 向导与交接

保留旧向导，新文件为 `build/wi004-physical-20260926/device-acceptance.sh`。
它读取当前 manifest，记录设备/LAN 条件，将不可用项保留 PENDING。
双机补齐开始/中间/结束原始 JSON、candidate 与同报告 ID/SSRC 增量检查，以及连续证据保存后的
仅信令重连、同 ID 重入。三机单独要求至少十分钟、六接收方向人工观察和三端原始统计。

同目录 `DEVICE-HANDOFF.md` 包含三台完整 URL、公开 CA/指纹、服务恢复、Ubuntu
完整 Chrome/XDG 信任与撤销、Windows CurrentUser 信任范围与精确删除，以及通过已有
已认证文件传输或 U 盘回传至 `evidence/physical/<device>/<phase>/` 的步骤。
没有新增上传接口或扩大静态范围；分发目录只有公开 DER CA，已验证其字节和证书一致。

Windows 操作只准备，未在实机执行。CurrentUser Root 会影响该 Windows 用户中读取系统信任的
应用，单独 Chrome profile 不能隔离；指南禁止改 LocalMachine/全局 Root，记录是否本轮新增，
撤销时只定位这张证书。依据为 [Chromium 信任文档](https://chromium.googlesource.com/chromium/src/+/main/net/data/ssl/chrome_root_store/faq.md)
和 [Microsoft 信任库作用域](https://learn.microsoft.com/en-us/windows-hardware/drivers/install/local-machine-and-current-user-certificate-stores)。
当前不同 LAN，无需安装。

## 失败、未验证与已有问题

- **本轮新增执行失败：** 本轮有限构建/TLS/媒体预检无意外失败；证书/私有路由被拒绝属于预期安全检查。
- **仓库检查失败：** `npm run docs:verify` 仍受已知无关技能链接
  `.agents/skills/setup-ts-deep-modules/SKILL.md` → `./src/packages/README.md` 影响，原始输出见 `documentation-check.log`。
- **未验证：** 跨真实电脑 LAN 可达性，真实摄像头/麦克风及权限，双向人听/变化画面，三机十分钟六方向，
  实体信令重连不断流、退出采集指示和无重复远端重入，Windows 实际信任安装/撤销。
- **已有问题，本轮未重跑：** CTest 零注册测试、固定上游 TypeScript 生产构建错误、旧探针失败、
  弱网及完整优雅停机。ShellCheck 不可用，向导静态通过不代表交互/Windows 通过。

本轮没有 C++ 生命周期变更，因此未重复已通过的直接测试、WI-003 完整生命周期、ASan/UBSan
和整套浏览器重连/重入；历史证据继续保留。生产超时仍是 35 秒，VoiceAgent/ASR、字幕、
准入/会议业务和无关服务均未启用。

## 清理与复现

本轮 SFU PID 3771864、HTTPS PID 3771865 已停止，测试浏览器已关闭，TCP 19080/19081
及 UDP 19000 均实际重新绑定成功。SFU 以 SIGTERM 结束，不声称优雅停机已验证。
本轮 CA 已从隔离 NSS 数据库删除，再查询明确不存在；Windows 从未安装。
私钥留在被忽略且受权限保护的目录，不在分发文件/证据中，也没有保存真实音视频。

`run-preflight.mjs` 保存命令、哈希、监听、执行和进程清理。IP/证书仍有效且服务已停止时，
可使用全新的信任/证据目录重复此短预检：

```bash
node scripts/baseline/prepare-browser-trust.mjs \
  build/wi004-physical-20260926/run/ca.crt \
  build/wi004-physical-20260926/trust-repeat-01
WI004_TRUST="$PWD/build/wi004-physical-20260926/trust-repeat-01" \
  node build/wi004-physical-20260926/run-preflight.mjs \
  build/wi004-physical-20260926/evidence/preflight-repeat-01
build/wi004/tools/usr/bin/certutil -D \
  -d "sql:$PWD/build/wi004-physical-20260926/trust-repeat-01/pki/nssdb" -n WI004-Test-CA
```

本轮自动 `trust-data` 已撤销，不能因为 trust-manifest 仍在就认定受信。
IP 变化或证书过期时重新生成新 run 并更新交接值。固定来源恢复见 [LAN 指南](../../scripts/baseline/LAN.md)，
实体操作的完整恢复/信任步骤见本轮本地交接文件。

**下一项最小任务仍属于 WI-004：** 有第二台带真实摄像头/麦克风的同 LAN 电脑后，执行双机向导，
核对双方原始 JSON、系统/Chrome/起止时间与人工观察。第三台可用后再补十分钟六方向。
本轮预检不支持开始会议/字幕开发或关闭门禁。
