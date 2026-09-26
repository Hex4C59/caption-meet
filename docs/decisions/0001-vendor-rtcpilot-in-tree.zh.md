# ADR 0001：在 `third_party/RTCPilot` 内 vendor RTCPilot

[English](0001-vendor-rtcpilot-in-tree.md) | 中文

- 翻译状态：Human Reviewed
- 权威原文：[0001-vendor-rtcpilot-in-tree.md](0001-vendor-rtcpilot-in-tree.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-09-26

- 类型：架构决策
- 状态：Accepted
- 创建：2026-09-21
- Gate：`gate-repo-layout`

## 背景

CaptionMeet 需要可定制的 WebRTC SFU 与 `voice_agent` 对接。维护者希望在**本仓库内**演进 RTCPilot，而不是维护兄弟目录检出并通过上游 PR 提交改动。

## 决策

1. 在 **`third_party/RTCPilot/`** 保留完整 RTCPilot 源码树（不含 `.git` 与本地构建产物）。
2. 在 **`third_party/RTCPilot/UPSTREAM.md`** 记录来源（上游 URL、导入 commit、日期）。
3. 保留 RTCPilot **LICENSE** 与 README 致谢；修改文件视为基于上游的维护者分支。
4. **`scripts/check-deps.sh`** 校验仓内路径，不再依赖 `../RTCPilot`。
5. VoiceAgent 仍为外部部署服务，除非未来 ADR 另行规定。

## 后果

- 克隆体积增大；不得在 `third_party/RTCPilot` 下提交 `build/` 等产物。
- 文档与 Agent 以 `third_party/RTCPilot` 为本产品的 **SFU 权威代码位置**。
- 与上游 RTCPilot 同步须手动操作，并在 `UPSTREAM.md` 记录。

## 曾考虑的方案

- 仅兄弟仓 `../RTCPilot` — 维护者工作流不采用。
- Git submodule — 不采用；维护者要求直接复制在树内。
