# CaptionMeet 架构

[English](caption-meet-architecture.md) | 中文

- 翻译状态：Machine Draft
- 权威原文：[caption-meet-architecture.md](caption-meet-architecture.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-10-14
- 类型：架构
- 状态：Proposed；Rust 方向已确认，实现设计未定
- 更新：2026-10-14
- 权威：已确认约束与实现前待解决的问题
- 相关：[PRD](../product-requirements.zh.md)、[ADR 0002](../decisions/0002-rust-source-transition.zh.md)、[ACTIVE](../../ACTIVE.md)、[gate](../reference/architecture-gates.zh.md)

## 当前状态

维护者选择全部自行维护的应用代码使用 Rust，包括浏览器应用、后端和选择性转发单元（SFU）。C/C++ 实现已按 ADR 0002 删除。`apps/web` 与 `server` 仍为占位；工作区没有 Rust 应用、可运行的 SFU 或 Rust 运行验收证据。

Rust 框架、WebRTC 库、通信协议、crate 布局和进程边界均未选定。现有 JavaScript/Python 文档工具及实验夹具留待后续迁移。历史 RTCPilot 文档描述的是已删除的实现。

<a id="task-reading-guide"></a>

## 按任务阅读导航

完成内核、AGENTS、ACTIVE、README 基础阅读后，提出或修改应用代码前须全文读取[协作指南](../guides/agent-collaboration.zh.md)。

| 任务 | 读取与解决的问题 |
|------|------------------|
| 用户可见会议行为 | [PRD 需求与验收](../product-requirements.zh.md#需求与验收)、[领域术语](../../CONTEXT.md)及下文相关约束 |
| 模块、依赖、接口或所有权 | 下文职责与未决设计；先扫描[治理索引](../guides/architecture-governance.md#index-dimensions-at-a-glance)，再全文读取受影响维度 |
| 媒体、信令、准入或生命周期 | 定义相关 Rust 契约、所有者、取消与失败行为；核对相应[未关闭 gate](../reference/architecture-gates.zh.md) |
| 识别与字幕 | PRD REQ-005 至 REQ-012、下文字幕关联和外部运行时问题；验证上游实际契约 |
| 构建与测试 | 下文验证要求；报告运行结果前先建立 Rust 构建/测试基线 |
| 历史证据或协议调查 | [归档索引](../archive/README.zh.md)与[报告索引](../reports/README.zh.md)；旧接口和命令不构成当前实现授权 |

消费者、信任、所有权或失败路径跨出拟定范围时继续扩读。当前 WI 及批准记录由 ACTIVE 维护。本提纲不选定依赖，也不批准实现。

## 已确认约束

- 产品范围仍为同一局域网上三人使用电脑端 Chrome 进行音视频会议，显示正确归属的中文字幕。[Draft PRD](../product-requirements.zh.md)负责用户可见需求与验收。
- 浏览器媒体通过 WebRTC 与 SFU。Rust 替代已删除的 C++ 实现；旧 protoo 协议和 libuv 执行模型不自动成为 Rust 约束。
- 调用方提供的昵称和 ID 不代表授权。可信所有者须执行成员校验、三人上限与会议链接生命周期。
- 服务商凭据不得进入浏览器产物、存储或日志。字幕只在会中临时存在，会议结束后清空；识别故障须保留通话能力。
- 语音运行时保持外置。声称可用或启动计费调用前，验证仅识别模式、独立输入、留存与费用上限。
- 保留上游许可证和来源。生产构建须通过仓库内源码或可复现依赖配置声明依赖。

## 待设计的职责

这些是计划职责，不代表已实现模块、已发布接口，也不决定进程或 crate 布局。

| 职责 | 计划工作 | 当前状态 |
|------|----------|----------|
| 浏览器应用 | 预览/采集设备、协调入会退会、展示参会者媒体与临时字幕、释放浏览器资源 | `apps/web` 占位；框架及浏览器接入未定 |
| 可信会议控制 | 创建/结束会议、验证准入、执行人数与链接期限、协调空会议计时 | `server` 占位；权威状态及进程位置未定 |
| SFU/媒体 | 协商传输、转发参会者音视频、限制队列并清理传输资源 | Rust 实现和库未定 |
| 语音接入 | 将识别绑定到参会者/连接、转换外部事件、隔离故障与取消 | 保持外部运行时；替代 Rust 契约未定 |

## 待解决的契约、所有权和生命周期

功能进入实现前，记录受影响操作、数据、错误、顺序与测试。特别是：

- 区分会议、参会者、传输、发布流与订阅身份。为每条记录和资源确定所有者，拒绝已被替代或取消连接的事件。
- 定义准入与链接失效、重连名额归属、并发入会、连续空会议 60 秒计时及重启行为。结束后的链接不能重新创建会议。
- 基于已验证上游语义，定义字幕的参会者/连接身份、片段身份、修订、最终状态及顺序。识别恢复后只处理新语音，不补传故障期间音频。
- 选择状态变更的串行化方式，以及任务、计时器、订阅和队列的取消与排空方式。清理归单一所有者；关闭一个参会者不能停止其他人。
- 根据测量设置队列、消息体和待处理工作的上限，明确溢出及超时行为。服务商地址和凭据属于可信部署配置，浏览器不能指定任意上游访问。

原 C-01 至 C-06 仅保留在[归档 C++ 架构](../archive/2026-10-14-cpp-meeting-architecture.zh.md#7-契约目录全部-outline)，不构成当前 Rust 契约。

## 验证要求

后续 Rust 工作项须独立建立可复现构建、接口测试及运行证据。通过受影响公开接口验证浏览器互通、独立媒体流、重连/退会/重入、到期与取消竞争，以及资源清理。

识别替身可验证修订、交错、过期事件、取消、有界队列和故障隔离。真实解码、服务商行为、留存和费用须单独受限验证。合成输入或本机浏览器结果须与实体多机验收分开，保留 PRD 的三台电脑验收要求。

当前 `npm test` 检查文档规则。历史 C++ 构建、直接测试和浏览器报告不能验证 Rust。[运行 gate](../reference/architecture-gates.zh.md)保持未关闭；本文件不关闭任何 gate。

## 历史参考

- [旧 C++ 会议架构](../archive/2026-10-14-cpp-meeting-architecture.zh.md)。
- [已执行 C++ 基线方案](../archive/2026-10-14-cpp-meeting-baseline-spike.zh.md)。
- [原 ACTIVE 详细记录](../archive/2026-10-14-pre-doc-cleanup-active.md)。
- [C++ 报告及其边界](../reports/README.zh.md)、[旧实验夹具指南](../../scripts/baseline/README.md)。
- [ADR 0001](../decisions/0001-vendor-rtcpilot-in-tree.zh.md) 的源码维护决策已被 ADR 0002 替代；署名要求仍有效。
