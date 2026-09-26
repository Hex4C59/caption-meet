# 双机验收就绪状态复核（WI-004）

[English](2026-09-26-two-device-readiness.md) | 中文

- 类型：执行报告
- 状态：只读就绪复核已执行；实体媒体验收未验证
- 日期：2026-09-26，本轮始于 17:36 UTC
- 翻译状态：Machine Draft
- 权威原文：[英文报告](2026-09-26-two-device-readiness.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-09-26
- 权威性：当前就绪证据，不代表媒体验收或门禁关闭
- 相关：[ACTIVE](../../ACTIVE.md)、[上轮执行](2026-09-26-physical-media-handoff.md)、[LAN 步骤](../../scripts/baseline/LAN.md)

## 授权与设备条件

已记录本次针对同 LAN 两台真实电脑的服务启停、配置/开发证书、必要小范围夹具修复和受影响
回归授权。WI-004 保持 Build/WIP=1，第三台十分钟验收仍待验证。

本轮只询问了一次当前电脑数量、系统和同 LAN 条件，交接时尚未收到新答复。
最后确认的条件仍为 Ubuntu 服务器与仅远程连接的 Windows，不在同 LAN。
这不表示设备条件已改变，也不冒充用户再次确认设备不可用。

没有尝试实体媒体，没有收到逐端原始统计。服务启动和安装临时信任等待真实设备条件成立。
没有用重复自动媒体测试代替实体电脑，也未扩展隧道、公网或 TURN 工作。

## 实际证据

本轮证据目录为 `build/wi004-two-device-20260926T1736/`，保留已有目录及失败证据。

| 结果 | 证据 |
|---|---|
| 通过：网卡/IP 仍是 `enp94s0f0`、`10.10.16.135/27` | `readiness.json`，实际执行 `ip -brief -4 addr` |
| 通过：TCP 19080/19081、UDP 19000 无监听 | `readiness.json`，实际执行 `ss -lntup` |
| 通过：已有 CA/leaf 有效、SAN 与 IP 匹配、链验证退出 0 | `readiness.json`；有效至 2026-10-03 16:53:26 UTC |
| 通过：向导、交接、夹具与 SFU 产物仍匹配旧证据 | `artifact-and-trust-audit.json`；ACTIVE 的变化是本轮记录 |
| 通过：上次隔离 CA 仍已撤销 | 同一审核：专用 NSS 列表为空，查询证书明确不存在；没有新增导入/删除 |
| 未验证：实体媒体及生命周期 | 在核查的 baseline 构建路径中未发现实体统计或交互向导记录 |

现有 manifest、证书、向导及系统对应的交接说明在 IP/有效期不变时可复用，无需再复制一套
夹具或生成新证书。Alice/Bob 完整 URL、公开 CA/指纹、Ubuntu/Windows 信任范围和撤销、
原始 JSON 回传方式仍见 `build/wi004-physical-20260926/DEVICE-HANDOFF.md`。
留存的 trust-manifest 不代表 `trust-data` 仍受信。

无需启动媒体服务即可复现本次只读检查：

```bash
ip -brief -4 addr
ss -lntup | rg ':(19000|19080|19081)\b'
openssl verify \
  -CAfile build/wi004-physical-20260926/run/tls/ca.crt \
  -verify_ip 10.10.16.135 \
  build/wi004-physical-20260926/run/tls/server.crt
```

`rg` 无匹配时退出 1 表示没有这些监听，不是媒体测试失败。
证书链验证不能证明浏览器受信、远端可达、WSS 或媒体通过。

## 收尾与缺失证据

本轮没有启动 SFU/HTTPS/浏览器/采集进程，也没有新增证书信任，因此没有新增自有服务或信任
需要撤销；旧清理证据保留。没有改变应用/C++、私钥、静态允许范围、防火墙、路由器、生产
超时、VoiceAgent/ASR 或上游归属；未提交、推送或关闭门禁。

`repository-checks.json` 保存依赖、文档与空白检查结果。文档检查仍有已知无关问题：
`.agents/skills/setup-ts-deep-modules/SKILL.md` 指向不存在的 `./src/packages/README.md`。
CTest 注册与上游 TypeScript 构建错误单列为已有问题，本轮未重跑。
没有实现变更需要媒体/C++/sanitizer 回归；旧通过结果只作为历史证据。

仍缺：两台可用同 LAN 电脑的确认，各端系统/Chrome 版本、真实预览、双向人工声音/变化画面、
开始/中间/结束原始 JSON、同报告 ID/SSRC 增量与实际选中 SFU candidate，以及连续证据保存后的
仅信令重连不断流、退出采集停止和同 ID 重入。三机十分钟六方向仍单独未验证。

下一最小动作仍是设备条件成立后启动已有专用夹具，执行双机向导；不要因设备条件未确认而
再跑一轮完整自动预检或启动其他实现工作项。
