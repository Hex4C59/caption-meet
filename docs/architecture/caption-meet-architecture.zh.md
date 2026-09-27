# CaptionMeet 架构

[English](caption-meet-architecture.md) | 中文

- 翻译状态：Machine Draft
- 权威原文：[caption-meet-architecture.md](caption-meet-architecture.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-09-26

- 类型：架构
- 状态：Proposed
- 更新：2026-09-26
- 权威：拟议模块边界、依赖规则、契约和资源所有权；不构成实现批准
- 相关：[PRD](../product-requirements.zh.md)、[gate](../reference/architecture-gates.zh.md)、[ADR 0001](../decisions/0001-vendor-rtcpilot-in-tree.zh.md)、[架构治理](../guides/architecture-governance.zh.md)

> **当前适用范围（2026-09-26）：** 本文保留适用于已确认局域网三人会议范围的约束，并明确标出待决定的会议设计。模块仍为 Planned/Proposed，契约仍为 Outline。完整[历史陪练设计](../archive/2026-09-26-coaching-architecture.zh.md)保留已被取代的 Practice API、单真人流程和 AI 语音回复路径，仅用于设计追溯或旧能力兼容。[PRD](../product-requirements.zh.md)负责产品范围，[ACTIVE](../../ACTIVE.md)负责唯一当前 WI 与执行条件。WI-002–WI-004 已取得的证据汇总于 §2。

<a id="task-reading-guide"></a>

## 按任务阅读导航

这里是任务到章节的唯一路由索引，AGENTS 和文档索引引用此处，不重复维护。保留原有章节编号。用标题检索和限定范围读取所选章节，链接到一份文档不意味着必须全文加载。

涉及架构的任务先读 §1（状态/范围）、§3（标识）、§6（依赖不变量），再按下列任务选择，重叠任务取并集。纯文案/翻译修改读受影响段落和双语规则即可，不必加载全部架构路由。

- **浏览器会议流程：** §4.1–4.3、C-01/C-02/C-06、§8 的浏览器所有权、§9 相关状态/清理。用户可见工作还须读 PRD，不能从本提案推导已验收。
- **业务服务 / 准入：** §4.4、§5.3–5.4、C-01/C-02/C-06、§8–10；非本地部署前核对 `gate-session-admission`。
- **会话清理 / 重连 / 退出：** §5.1、§5.5–5.6、C-02/C-05/C-06、§8–9；读取 §11 生命周期验收与 `gate-sfu-lifecycle`。
- **RTP / RTCP / 转发 / 缓冲所有权：** §5.6–5.7、C-03/C-05、§8–10、§11 媒体验收；核对 `gate-media-capacity`。
- **VoiceAgent / 识别适用性 / 旧 AI 输出：** §5.8–5.10、C-03–C-06、§8–10、§11 语音测试；补读仓内配置指南的 `voice_agent` 章节及受影响桥接源码，核对 `gate-voice-agent-bridge`。
- **信令 / WHIP / 房间命令：** §5.2–5.5、C-02/C-05/C-06、§8–10、§11 WHIP 回归验收；核对信令和准入 gate。
- **集群 / 传统流媒体：** §5.11 以及受影响的房间/传输/路由模块，C-03/C-05/C-06、§8–10。沿真实调用者/被调用者取证，单节点提案不是集群认证。
- **新公开接口 / 模块抽取：** 受影响的 §4/§5 模块、§6、对应 C-01–C-06、§8–9；涉及信任、队列、持久化时补 §10。读取消费者和边界测试，不只看新接口。
- **构建 / 依赖 / 上游升级：** §2、§6、§11–12、[ADR 0001](../decisions/0001-vendor-rtcpilot-in-tree.zh.md)、相关 CMake/配置/测试；核对构建和边界 gate。

架构变更先扫描[治理指南英文维度索引](../guides/architecture-governance.md#index-dimensions-at-a-glance)及检查项标题，再细读适用维度。生命周期任务通常涉及所有权、并发、错误、清理、测试；API 任务涉及接口、依赖、契约、兼容；安全/持久化变更增加对应维度。用证据报告适用项 pass/gap/N/A。不要修改生成的治理指南来重复产品路由。

契约引用其他不变量、所有权跨模块、回调长于调用者、源码与 Proposed 设计冲突时必须扩读。证据/缺口见 §2/§12，相关 gate 见 [gate 登记](../reference/architecture-gates.zh.md)。覆盖受影响生产者、消费者、所有者、失败路径和测试后停止扩读。路由不豁免内核/协作要求，也不把 Outline 契约变成 Living。

## 1. 结论与范围

保留 **模块化 C++ SFU 单体 + 规划中的浏览器客户端 + 可选薄业务服务 + 经 RTCPilot 集成的外部 VoiceAgent** 方向。RTCPilot 在 `third_party/RTCPilot` 内持续开发，不恢复兄弟仓依赖；保留上游许可证与来源。纯识别适用性尚未验证，改换集成策略须作出明确决策。

内部模块边界是编译与所有权边界，不意味着拆成网络服务。先保持现有单 libuv 事件循环。不引入通用事件总线、服务定位器、微服务群、共享可变会话仓库，也不重写 ASR/LLM/TTS。

本提案**不决定**浏览器和业务服务的语言、框架。Node 文档工具不代表产品选型；只有以后采用 TypeScript，相关指南才适用。现有 SFU 构建基线为 C++17。

**成熟度：** 架构方向与 **Outline** 契约。本文提出的模块 API 不因写入文档就成为 Living 或已经实现。PRD 保持 Draft。ADR 0001 只确认仓内维护策略，没有确认本次重设计、生产安全或功能可用性。

### 1.1 目标架构总览（Proposed）

| 边界 | 当前适用内容 | 待决定的会议设计 |
|------|--------------|------------------|
| 浏览器 — `apps/web` | Planned 展示、应用协调与实时适配；不得持有供应商密钥 | 设备预览/入会流程、应用 API、字幕投影 |
| 可信产品控制 — 可选 `server` | Planned；媒体不经业务服务；SFU 必须校验准入 | 是否需要独立服务；会议/链接权威、人数上限与空会议定时器协调 |
| SFU — `third_party/RTCPilot` | 仓内实现已有基线实测（§2）；拟议内部边界见 §5 | 模块抽取、准入强制及完整生命周期保证 |
| VoiceAgent — 经 RTCPilot bridge 连接的外部服务 | 现有集成规则；不内嵌 ASR/LLM/TTS 实现 | 三路独立输入、纯识别模式、interim/final 语义及故障隔离 |

浏览器媒体经 SFU，不绕过它直连对端，也不由业务服务中转。本概览不定义新 API、已实现所有者或 Web/server 技术栈。会议创建、准入和字幕须先明确各自契约才能实现。[旧图](../archive/2026-09-26-coaching-architecture.zh.md#11-目标架构总览proposed)描述已被取代的陪练/AI 输出提案，不是会议目标。

## 2. 现状证据与缺口

以下路径相对于 `third_party/RTCPilot/`：

- `src/RTCPilot.cpp`：组合入口使用 `uv_default_loop()`，创建网络监听与可选集群/传统流媒体服务；主路径尚未建立完整、有序的退出排空流程。
- `src/ws_message/ws_message_session.cpp`、`src/webrtc_room/room_mgr.cpp`：JSON/protoo 分派，包含 `join`、`push`、`pull`、`heartbeat`、`textMessage`。
- `src/webrtc_room/room.hpp` / `room.cpp`：`Room` 同时处理成员、SDP、包路由、集群回调、语音文本和 AI RTP 发布，是首要拆分位置。
- `src/webrtc_room/webrtc_server.cpp`：静态 username/address 表仍持有会话。WI-003 已复现并修复仅遍历地址表的不活动到期路径：到期扫描现在覆盖 username 表，并移除所有匹配索引。该聚焦修复没有实现 §5.5 的唯一所有者注册表，也未证明按房间整体清理安全；`RemoveSessionByRoomId` 仍是 [WI-003 报告](../reports/2026-09-26-pre-stun-expiry.zh.md#修改边界)明确未验证的路径。
- `src/webrtc_room/webrtc_session.*`、`media_pusher.cpp`、`media_puller.hpp`：传输、安全、轨道资源存在交叠的共享所有权及借用回调指针。
- `src/webrtc_room/voice_agent/voice_agent.cpp`：外部 JSON/WebSocket 适配器，由音频 pusher 创建；AI 输出目前由房间级状态协调。把 conversation ID 缩为整数不适合作为通用标识契约。
- `src/net/udp/udp_pub.hpp`、`src/utils/timer.cpp`、`src/webrtc_room/pilot_message_client.*`：未完成 I/O、定时器和请求回调需要明确的取消与生命周期保证。
- `CMakeLists.txt`：大可执行目标和宽泛头文件可见性，尚无强制模块边界。`tests/` 包含 TCC、timer、protoo 和聚焦的 `webrtc_session_expiry_test`；已记录的运行中 CTest 仍发现零个测试。

以上结构性结论是保留的检查证据；下列报告提供了范围更窄的实际执行结果：

| 证据 | 已证明内容 | 限制 |
|------|------------|------|
| [WI-002 基线](../reports/2026-09-26-meeting-baseline.zh.md) | 新目录 Debug 构建与三个直接测试；修复同 ID 发布/响应回调行为；602.362 秒合成三浏览器、六方向媒体运行 | 同机浏览器；固定上游客户端生产构建仍有 11 个 TypeScript 错误；不证明优雅退出 |
| [WI-003 到期修复](../reports/2026-09-26-pre-stun-expiry.zh.md) | 先复现再修复 pre-STUN 问题；回收索引、所观测对象及定时器；聚焦 ASan/UBSan 回归与浏览器对照通过 | 仅覆盖所测路径，不是全 SFU 所有权、泄漏或退出审计 |
| [WI-004 LAN 基线](../reports/2026-09-26-lan-media-baseline.zh.md)及[续跑](../reports/2026-09-26-physical-media-handoff.zh.md) | 正常 HTTPS/WSS 信任、静态/私有文件边界、本地合成/假设备媒体及采集状态检查 | 真实跨电脑媒体、硬件和人工观察仍未验证 |
| [WI-004 就绪复查](../reports/2026-09-26-two-device-readiness.zh.md) | 只读产物、端口及 TLS 复查；保留现有 fixture/交接材料 | 不构成实体验收；当前设备条件和下一步见 [ACTIVE](../../ACTIVE.md) |

`apps/web`、`server` 仍为占位；基线浏览器 fixture 不是产品 UI。上述报告都未验证字幕、真实 VoiceAgent 互通、弱网行为或完整会议验收。执行证据不能绕过既定验收流程关闭 gate，文档检查与媒体证据也须区分。

## 3. 领域标识与不变量

- 产品会议标识、入会链接有效性和 SFU 房间生命周期是不同概念。其映射和权威所有者仍未决定（C-01）；历史 `PracticeSessionId` 及其服务所有权不是会议 API。
- `RoomId`：SFU 成员与路由作用域。`ParticipantId`：该作用域内经准入的身份；浏览器自报 ID 不能视为授权。
- `TransportId`：一条协商后的 WebRTC 传输。`PublicationId`：一条发布轨道。`SubscriptionId`：一个接收者的订阅。SSRC 不作为持久发布标识。
- `Generation`：参与者连接的本地递增代次；重连产生新代次，旧回调不得修改替代实例。
- 上游确有提供时的桥接标识：`ConversationId` 保持不透明字符串，禁止 `atoi()`。历史 `TurnId`、`EventSequence` 是本地关联提案，不是上游保证，也不是已定义的字幕段/修订 schema（C-04）。

跨会话句柄携带作用域与代次。查找失败或代次过期应拒绝操作，不得自动重建房间。发布只属于一个参与者；订阅只属于一个接收者；两者均不拥有传输对象。

**已被取代的陪练假设：** 每房间一位真人与一条 AI 对话是先前产品提案。已确认会议范围改为最多三位真人、独立字幕、不提供 AI 语音回复。这不证明现有桥接已经支持纯识别会议，该集成能力仍需验证。

## 4. 产品侧模块（Planned）

<a id="41-练习-ui--appsweb-展示层"></a>

### 4.1 浏览器展示 — `apps/web`（Planned）

保留的职责：经应用边界完成渲染、用户意图和临时视图状态。不解析 protoo，不保留供应商密钥，不管理 SFU 房间，不把显示的字幕当作持久事实。真实会议 UI API 未定；[练习 UI](../archive/2026-09-26-coaching-architecture.zh.md#41-练习-ui--appsweb-展示层)属于历史设计。

<a id="42-练习控制器--appsweb-应用层"></a>

### 4.2 浏览器应用协调 — `apps/web`（Planned）

保留的职责：本地生命周期协调及可释放事件订阅，依赖窄业务/实时端口，不拥有 DOM 或 WebRTC 对象。启动失败须补偿释放资源；重复/非法操作须有明确结果；本地离开/清理须幂等。

[旧练习操作与状态列表](../archive/2026-09-26-coaching-architecture.zh.md#42-练习控制器--appsweb-应用层)已被取代，不能改名后当作会议 API。会议预览/准入、重连、字幕投影和结束状态仍须按 PRD 与 C-01/C-04 定义。

### 4.3 实时客户端 — `apps/web` 浏览器适配层

拟议所有者：浏览器 `MediaStream`、采集轨道、`RTCPeerConnection`、信令 socket、播放绑定和重连定时器。只有该边界理解浏览器 WebRTC 与 RTCPilot 线协议，将协议 DTO 转为应用事件，不能签发成员权限。

断开须停止所拥有的轨道、移除监听、关闭 peer/socket 并释放播放绑定。仅面向音频的 `publishMicrophone()` 及[旧操作列表](../archive/2026-09-26-coaching-architecture.zh.md#43-实时客户端--appsweb-浏览器适配层)没有定义所需摄像头/预览生命周期。实验采集 fixture 提供证据（§2），不代表产品适配器已经实现或会议 API 已获批准。

<a id="44-练习服务--server-可选可信控制面"></a>

### 4.4 可信产品控制 — `server`（可选，Planned）

会议/链接状态与准入协调是否需要独立服务仍未决定。[练习服务](../archive/2026-09-26-coaching-architecture.zh.md#44-练习服务--server-可选可信控制面)、主题查询和 `createPractice` 操作属于历史，不能据此指定会议所有者或端点。

保留信任约束：调用身份来自已校验上下文，不能信任浏览器自报。若采用入房描述，只包含允许的信令地址、房间/参与者作用域、有效期和受限准入凭证，不含供应商密钥，也不接受浏览器指定任意上游地址。必须有相应 SFU 校验器；仅签发 token 不构成强制授权。未来远程关闭须经过已认证控制边界或有界过期机制，不跨进程修改共享房间 map。

当前 fixture 不要求数据库。已明确授权的可信 LAN fixture 使用固定配置，尚无经验证的成员授权；不属于已认证或生产部署。会议人数上限、链接失效和 60 秒空会议定时器仍需产品契约与所有者（C-01）。

## 5. SFU 模块边界（Proposed）

拟议 SFU 模块都保留在 `third_party/RTCPilot` 内。以下名称是逻辑模块及未来构建目标名，不代表目录已经存在。§5.1–5.7 保留拟议控制/媒体边界；§5.8–5.10 区分桥接约束与已被取代的陪练输出设计。任何抽取均须另行确认范围，并保留可执行入口。

### 5.1 运行时装配 — `runtime`

拥有事件循环、校验后的不可变配置、监听器、模块实例和退出协调器。构造具体适配器并注入依赖。公开生命周期：`start(config)`、`stop(deadline)`。

只有该模块知道全部具体实现；不包含房间策略、SDP 操作或逐包转发。向消费者提供只读配置切片，不到处注入全局配置单例。

### 5.2 信令入口 — `signaling`

拥有 WebSocket/HTTP 解析、连接关联、响应序列化和入口大小/速率限制。准入校验后调用房间命令，通过连接作用域的 sink 接收类型化结果/事件。

protoo 和 WHIP 是同一组用例的不同适配器，不写房间 map，不拥有媒体会话。WHIP 资源标识一个发布，删除它不能删除其他参与者或整个房间。

### 5.3 准入 — `admission`

实现 `authorizeJoin(credential, requestedScope, now)`，返回不可变 `AdmissionGrant` 或错误。grant 限定参与者、房间、发布/订阅权限、有效期；后续命令校验连接绑定的 grant 与代次。

拥有验签材料及重放/过期策略，不拥有房间资源或产品账号。除明确本地开发模式外，校验失败必须拒绝。该能力受安全 gate 约束，并非已验证的 RTCPilot 现有功能。

### 5.4 房间控制 — `room_control`

拥有成员、发布/订阅元数据和房间状态。公开操作：`join`、`publish`、`subscribe`、`leave`、`heartbeat`、`snapshot`。输入是类型化命令和已校验上下文，不是任意 JSON/方法字符串。

编排 session、routing、voice 端口。拥有逻辑房间句柄，不拥有 socket、RTP 队列、SDP 解析细节或 VoiceAgent WebSocket。处理类型化完成事件，回调中不携带可修改的 `Room*`。

### 5.5 会话注册表 — `session_registry`

是 WebRTC 会话的**唯一生命周期所有者**，通过不透明句柄索引。操作：`createTransport`、`negotiate`、`findTransport`、`closeTransport`、`closeParticipant`、`closeRoom`。

username/address 表只是指向主注册表的非拥有索引，不分别持有 `shared_ptr`。首次 STUN 前即登记，并有协商截止时间。关闭时先移除全部索引、拒绝新操作，再排空在途工作。

房间控制拥有意图，注册表拥有真实传输生命周期。`closeRoom` 不直接删除房间；它在所属传输排空后报告完成，再由房间控制移除成员状态。

### 5.6 RTC 传输 — `rtc_transport`

拥有一个会话的 ICE/DTLS/SRTP、协商 SDP 状态、接收/发送轨道引擎及网络请求作用域。实现协商、安全发送、关闭；发出 transport-ready/failed/closed 和校验后的媒体回调。

不理解产品提示词、房间成员存储、集群路由、VoiceAgent JSON。UDP 监听器由 runtime 共享持有；传输只拥有自己的注册与在途操作，不拥有监听器本身。

### 5.7 媒体路由 — `media_router`

只拥有发布到订阅者的路由元数据，不拥有会话。操作：`attachPublication`、`attachSubscription`、`detachPublication`、`detachSubscription`、`forwardPacket`。

依赖窄的 packet-source/sink 端口。现有 `MediaPusher` 接收引擎与 `MediaPuller` 发送引擎仍由传输持有；路由只保存带代次校验的非拥有端点句柄。路由修改在媒体循环串行化；房间控制须在销毁传输端点前移除路由。

逐包路径禁止 JSON、持久化、业务查询和 AI 网络请求。RTCP 反馈通过传输能力端口路由，不能任意访问另一个会话内部。

<a id="58-语音会话--voice_session"></a>

### 5.8 语音会话 — 会议适配待定

[陪练语音会话设计](../archive/2026-09-26-coaching-architecture.zh.md#58-语音会话--voice_session)同时承担对话、文本序列与 AI 输出所有权。这一组合属于历史，不定义会议识别所有者，也不要求字幕依赖 AI 发布器。

保留按参与者绑定（房间、参与者、源发布、代次）、取消和迟到事件拒绝约束。一个参与者断开只能取消与其绑定的工作；识别失败不得中断通话。不在本仓内实现 ASR/LLM/TTS。三路独立输入、字幕顺序/finality 与真实识别生命周期需要桥接证据及契约后才能调整本模块（C-04）。

### 5.9 VoiceAgent 适配器 — `voice_adapter`

保留的拟议边界：拥有外部 WebSocket、codec/协议转换、抖动缓冲资源、心跳和有界重连；向外提供类型化事件而非供应商 JSON。不创建虚拟房间用户，不修改房间 map。协议升级应集中在这里及 fixture 测试，不散落到 UI 与包路由。

现有桥接映射 `input_audio_buffer.append`、`input.transcript`、`response.text`、`conversation.start`、`conversation.end`、`tts_opus_data`。这些协议消息不证明纯识别模式、interim/final 字幕、取消或重放保证。[历史接口](../archive/2026-09-26-coaching-architecture.zh.md#59-voiceagent-适配器--voice_adapter)包含不属于会议需求的回复/输出事件。验证识别子集时保留外部集成规则。

<a id="510-ai-发布器--ai_publisher"></a>

### 5.10 AI 发布器 — 仅用于历史兼容

AI 语音回复不在会议范围内。[AI 发布器提案](../archive/2026-09-26-coaching-architecture.zh.md#510-ai-发布器--ai_publisher)保留虚拟发布、队列、RTP、唯一流标识、codec 校验与 pacing 设计，供历史/旧能力维护使用；它不是必需的会议模块或实现任务。

无关抽取不能顺手删除上游既有 AI 输出。若触及该路径，仍须保持帧/定时器单一所有者、普通 publication 端口、有界队列及取消约束（C-03/C-05 和 §8–9），不能从本地丢弃推导上游合成已取消。

### 5.11 可选适配器 — 集群与传统流媒体

集群发现/控制通过可取消的房间控制端口接入；relay 实现 packet source/sink。不得绕过准入或直接修改私有房间 map。集群客户端拥有 pending 请求记录，房间作用域拥有取消句柄。

RTMP/HTTP-FLV/WebSocket-FLV 作为可选边缘适配器，不进入首版会议范围。抽取模块时保留现有能力，不顺手重做或删除。节点间加密/授权尚未验证，单节点验收不代表集群可生产部署。

## 6. 依赖规则与强制检查

1. UI 依赖应用边界；应用协调依赖业务/实时端口；浏览器、网络适配器实现这些端口，由组合入口装配。会议操作名与产品状态所有权仍待 §4/C-01 确定。
2. 信令依赖 admission 和 room-control 公开契约。房间控制依赖 session/routing/voice **端口**，不依赖具体 WebSocket、HTTP、供应商实现。
3. 注册表依赖 RTC 传输；传输依赖 RTP/RTCP、SDP、加密和网络原语，禁止依赖房间控制。路由依赖媒体值类型与端点端口，不持有具体 `WebRtcSession`。
4. 语音 adapter 依赖外部协议/网络原语。历史陪练拆分中，voice session 依赖 adapter/publisher 端口，publisher 依赖媒体发布与时钟/调度端口；维护旧输出时保留该方向，不据此把 publisher 纳入会议识别。禁止互相包含实现头文件。
5. 反向运行时通知使用定义在消费者边界的类型化 sink。存在回调不等于允许反向 include 或循环所有权。
6. DTO 在所属公开契约旁唯一定义。跨语言线协议使用中立、版本化 schema；不要为几个字段建立庞大的 `shared` 包。`json`、`uv_*`、可变 SDP 等私有库类型留在适配器内。
7. 拟议 CMake target 仅公开明确的头文件目录及链接依赖。新模块不用递归全局 include；增加消费者编译测试与禁止 include 检查。实现前，边界强制执行仍是缺口。
8. 禁止通用 `invoke(method, payload)`、可修改 map getter、全局服务查找、暴露所有内部方法的大接口。增加公开 API 必须说明具体消费者、更新契约并补测试。

## 7. 契约目录（全部 Outline）

以下 ID 是本文件稳定审阅锚点。有对应实现、边界测试及已确认范围后才能成为 Living。C-01/C-04 明确需要会议适配；C-02/C-03/C-05/C-06 保留适用约束。操作名称是语义提案，不是已发布 C++ ABI 或 HTTP 端点。

<a id="c-01-练习生命周期"></a>

### C-01 产品生命周期 — 会议契约待定

[练习生命周期契约](../archive/2026-09-26-coaching-architecture.zh.md#c-01-练习生命周期)属于历史。主题校验、Practice ID 和练习服务所有权不是会议契约。会议创建/链接权威、人数上限、重连席位所有权，以及准入与 60 秒空会议定时器的原子关系仍未决定；这里不指定所有者或端点。

保留适用的操作约束：写操作须有有界去重及明确冲突行为；重复结束/清理须幂等。远程超时代表**结果未知**，不保证回滚；允许重试创建前须定义查询/对账路径。产品已结束与 SFU 已排空仍是不同事实，远程关闭不得跨进程直接修改共享内存。

PRD 要求结束后的旧链接拒绝准入且不重建会议，并在结束时清空字幕。当前 SFU 不活动/空房间定时器没有实现这些产品语义。进程重启行为、首次入会前的链接有效期及字幕状态所有者仍需决定。

### C-02 房间命令与快照

所有者：房间控制，信令只翻译线协议。公共上下文包含 request ID、room ID、participant ID、generation、admission grant、deadline。publish 携带限长 SDP offer；subscribe 携带目标 publication 和接收者 offer。结果仅包含该操作的标识/answer/状态，不暴露内部指针。

join 要求房间 open 且作用域授权；publish/subscribe 要求有效成员和权限，subscribe 还要求目标发布存活。成功安装元数据前必须建立可明确拥有的传输/路由资源；部分失败须补偿释放。重复 leave 成功；heartbeat 不得复活已关闭成员。按身份/代次/request ID 对写操作做有界去重，不假称现有协议已经保证。

SDP answer 只意味着接受协商，**不等于** ICE/DTLS 连通；ready 是独立事件。不自动换新 request ID 重试非幂等 publish。重连获得新代次及完整快照，不保证重放事件；快照和后续订阅需要共同的 sequence barrier，避免两者之间丢事件。

### C-03 媒体缓冲区转移

所有者：转移前归分配器/生产传输。同步 packet 回调借用只读视图，有效期只到返回。队列接收唯一所有权或不可变引用计数缓冲区，绝不保留借用指针。转发借用输入，每个异步输出须显式持有/复制，发送完成或取消时释放。

每个队列定义最大字节数、包数、年龄。超限返回 `Backpressure` 或执行带指标的明确实时丢弃策略，禁止静默无界积压；禁止不考虑 codec 的随意丢包。统计记录丢失，不承诺媒体 exactly-once 或无损。

<a id="c-04-语音事件与-ai-输出"></a>

### C-04 语音关联 — 字幕契约待定

保留房间、参与者、源发布与连接代次的作用域关联；仅在上游实际提供时保留其不透明 ID。拒绝无法归属或过期的事件，不猜测说话者。本地序号/turn ID 是本地元数据，不是供应商保证。会议识别/字幕状态所有者及事件 schema 仍未决定。

顺序限于单连接/代次，不假定多桥全序或重放。重连作废旧识别作用域，不重发故障期间音频。未验证 finality 的文本不得升级为最终字幕。PRD 要求临时字幕可修订、最终字幕固定及逐人隔离；段标识、顺序和上游字段映射仍属于须在实现前定义并验证的拟议细节。

用 fixture 与真实互通验证输入 codec、时钟、声道和帧长；不支持的参数明确失败。[旧输出契约](../archive/2026-09-26-coaching-architecture.zh.md#c-04-语音事件与-ai-输出)、Opus/48 kHz/20 ms 假设、轮次结束与播放排空的区分，以及 `discardTurn` 语义属于旧 AI 输出，不是会议字幕。本地丢弃不能证明上游取消；纯识别适用性仍受 voice bridge gate 约束。

### C-05 取消与关闭

所有者：创建资源的模块。每个异步命令都有请求作用域、单调 deadline 和 generation；在所属 loop 完成一次：成功、失败或取消。超时停止等待并取消本地作用域，不能宣称撤销了远程副作用。

close 幂等，先进入 closing，再断入口；拒绝新工作、作废回调、取消 timer/request、排空网络完成回调，最后确认 closed。迟到回调释放缓冲区但不访问已销毁对象。pending UDP send 捕获裸指针不算取消策略。从回调内关闭须等当前回调退栈后再销毁。

### C-06 错误与兼容信封

边界错误包含稳定 code、安全 message、request 关联及重试分类。拟议错误码：`InvalidArgument`、`Unauthorized`、`Forbidden`、`NotFound`、`InvalidState`、`Conflict`、`StaleGeneration`、`DeadlineExceeded`、`Cancelled`、`Backpressure`、`UpstreamUnavailable`、`UnsupportedCodec`、`ProtocolMismatch`、`Internal`。

公开错误不能包含密钥、完整 SDP、原始供应商消息或音频。adapter 映射到旧线协议响应，不顺手更名现有 protoo 方法/事件。现有本地事件包括 `userLeave`、`userDisconnect`，文档用词不能证明兼容 `userLeft`。

产品自有网络契约包含 major version，不兼容 major 应拒绝。新增内部类型不等于给外部 VoiceAgent 协议版本化。每次破坏性线协议修改须固定对端版本、提供兼容测试、记录发布决策后再部署。

## 8. 所有权与生命周期规则

以下是拟议所有权约束，不描述已经完成的模块抽取。WI-003 修复一条既有到期路径，没有建立下列完整所有权模型。

- Runtime 拥有监听器、loop、模块实例、crypto/log 基础设施；监听器不属于房间。
- 房间控制拥有房间、成员、逻辑发布/订阅记录；其他模块拿不透明句柄，不拥有房间指针。
- 注册表唯一拥有传输；username/address 只是索引。传输拥有 DTLS/SRTP、轨道引擎、pending 网络作用域。
- 媒体路由只拥有路由，不延长传输生命周期，不复活已关闭端点。
- 仅针对历史陪练/旧输出设计：房间控制拥有语音会话集合；每个会话唯一拥有 adapter 与 AI publisher，后者拥有全部输出帧及 pacing 任务。会议识别和字幕状态所有权须另行确定（§5.8/C-04），不得双写。
- 网络 adapter 拥有 pending 请求表；发起的房间/语音作用域持有取消句柄，不拥有请求表。
- 每次观察注册返回释放 token，由订阅者拥有；发布者不得调用已释放观察者。
- 浏览器 realtime adapter 拥有设备/网络资源；外部 VoiceAgent 拥有模型/供应商运行态。历史练习服务的元数据所有权不能指定会议/链接状态所有者，该所有者仍未决定（C-01）。禁止跨域双写。

生命周期所有权优先用 `unique_ptr`。`shared_ptr` 仅用于真正共享的不可变缓冲区或明确的完成状态，不能代替生命周期设计。借用引用只用于更短的同步生命周期；异步任务使用代次校验句柄或弱取消状态。公开边界中的每个裸指针须说明借用/转移语义。

## 9. 并发、状态与退出

房间、会话索引、路由、语音状态的修改全部留在所属 libuv loop。禁止在其上执行阻塞文件/数据库、模型任务、慢日志或等待。未来 worker 接收不可变输入，带代次发回完成事件，不直接改房间 map；不能加一把锁就称整个模块线程安全。

拟议 SFU 状态：房间为 open、draining、closed；传输为 negotiating、connecting、connected、closing、closed，失败记录原因并进入 closing。这不是产品会议状态机。历史陪练语音状态列表保留在[快照](../archive/2026-09-26-coaching-architecture.zh.md#9-并发状态与退出)，会议识别转移须在 C-04 中调整。stopped 实例不复用，替代实例产生新代次。非法转移返回 `InvalidState` 或文档明确的幂等无操作。

拟议参与者清理：停止其入口/准入上下文；作废代次；取消绑定语音工作，移除该参与者的发布/订阅路由；取消该参与者作用域的请求；关闭其传输；排空回调；移除成员元数据，不影响其他参与者。SFU 房间为空且没有在途工作属于资源清理条件，不允许据此跳过 PRD 的 60 秒空会议宽限期。产品结束、链接失效和字幕清空如何协调仍未决定（C-01）。

拟议进程退出顺序（已记录的 SIGTERM 测试未证明该流程）：

1. 停止接收新信令/HTTP 请求，房间进入 draining。
2. 停止语音入口/重试，取消集群/控制请求，断开路由生产者。
3. 清空所拥有的语音队列；如启用旧 AI 输出，还须取消其 pacing。取消房间定时器，关闭 session 与协议客户端。
4. loop、crypto、日志仍存活时排空 pending send/close 回调；设置有界退出 deadline，报告强制退出。
5. 关闭剩余监听器与 timer handle；确认无意外活跃 handle，再关闭 loop。
6. 所有传输用户退出后销毁 crypto，最后 flush/join 日志线程。

崩溃不能保证优雅确认。重启丢失内存会话状态，客户端不能假定连接已恢复。会议链接/重启语义在 C-01 中仍未决定；这不授权持久化字幕或引入练习存储。

## 10. 安全、容量与隐私

TLS 不等于成员授权。SFU 入口校验凭证，publish/subscribe 校验权限，拒绝冒充 room/user。限制 join、SDP、文本请求速率，解析/分配前校验载荷大小。供应商地址、密钥路径来自可信部署配置，不受浏览器控制。

VoiceAgent 传输安全仍有缺口：检查到的桥接建立非 TLS 连接。在 TLS 或安全传输验证前，只部署在明确可信的本地/私网边界；不能从浏览器 DTLS/SRTP 推导集群 UDP 已加密。

要求方向：默认不持久化音频/字幕；字幕 UI 为临时投影，会议结束清空字幕（PRD REQ-010/011）。这不是已验证的合规结论：现有字幕正文日志及供应商留存仍有缺口。未来录音/历史在首版范围之外，须明确留存、同意、删除、访问控制要求及存储所有者，不顺手添加数据库。

按房间/连接限制参与者数、pending 请求数、SDP/文本字节和语音输入年龄；若启用旧 AI 输出，也须有界。产品要求三人硬上限、识别故障隔离和不留存故障音频，强制实现尚不存在。[旧 spike 数值](../archive/2026-09-26-coaching-architecture.zh.md#10-安全容量与隐私)属于历史假设，不是当前设置或会议服务保证。WI-003 保留实际 35 秒传输不活动超时，它不同于协商截止时间及产品 60 秒空会议定时器。须先定义溢出行为、测量字幕延迟与预算限制，再宣称容量保证。

日志在所属边界记录一次生命周期变化、关联和安全错误码。观测 active/pre-STUN 会话、pending 回调、队列深度/年龄、丢帧、字幕延迟、退出时长。默认不记录供应商 token、原始 SDP、音频、字幕正文；标识也须限制留存，指标不等于允许保留对话。

## 11. 迁移顺序与可执行验收

保留现有线协议、源码布局和单节点行为。[旧抽取顺序](../archive/2026-09-26-coaching-architecture.zh.md#11-迁移顺序与可执行验收)包含必需的 AI 发布器抽取，属于历史，不是当前执行队列。每个后续实现切片都须独立确认范围及 PRD 影响。当前工作与授权见 [ACTIVE](../../ACTIVE.md)。

- **已有基线：** 保留 WI-002 Debug/直接测试与浏览器证据、WI-003 到期回归及聚焦 sanitizer 证据、WI-004 自动 LAN/安全/采集检查。CTest 注册和上游浏览器生产构建仍有缺口，不能把空 CTest 套件称为通过。
- **当前实体验收：** WI-004 仍需先两台浏览器实体电脑，再三台十分钟，取得各端原始统计与人工音视频观察。本地自动浏览器不能满足该边界。
- **产品接入前：** 解决 C-01/C-04 和 PRD 拟议细节中的会议契约与所有者。规划字幕适配器或改换策略前，验证外部桥接纯识别适用性和三路输入隔离。不自动选择 Web/server 技术栈或开展 AI 回复工作。
- **实现生命周期/控制边界时：** 证明单一所有权、作用域取消、带在途回调的房间关闭及关闭后不再访问，保留已有 pre-STUN 回归。协议/SDP/媒体 fixture 须维持信令行为与 WHIP 发布隔离。有序退出与操作系统终止进程须分开验证。
- **实现识别集成时：** 用 fake 外部端点验证交错/迟到事件、interim/final、故障隔离、队列溢出和 codec 不匹配。真实解码及供应商行为通过单独、受限的真实服务验收验证。付费调用前按 REQ-012 记录成本模型和预算限制，并取得相应执行授权；验证供应商留存后才能宣称完整满足 REQ-011。

适当使用边界 fake：clock/scheduler、transport sink、admission verifier 和外部 VoiceAgent endpoint。更广泛所有权变更需要超出 WI-003 聚焦测试的 ASan/UBSan、重复开关与泄漏/handle 检查。只有真实 worker 跨线程时才需要 TSan，不能替代 loop-affinity 测试。弱网/容量任务必须记录条件，对比同等吞吐、CPU、内存与延迟基线；已有本地媒体结果不是服务指标。

## 12. 治理评估与待验证 gate

| 维度 | 评估与证据 | 剩余缺口 |
|------|------------|----------|
| 需求/范围 | **文档对齐 pass：** §1/§4/C-01/C-04 区分会议需求与[历史陪练](../archive/2026-09-26-coaching-architecture.zh.md) | 产品尚未实现；PRD 为 Draft |
| 模块拆分/接口 | **gap：** §4–5 为 Planned/Proposed；C-01–C-06 为 Outline | 会议/链接/字幕所有者和 API 未定；现有 `Room` 仍混合多项职责 |
| 依赖/兼容 | **gap：** §6、C-06 保留窄接口及线协议兼容约束；WI-002 提供固定客户端证据 | CMake include 仍宽；没有消费者编译/禁止 include 检查；更广泛对端未验证 |
| 所有权/并发/生命周期 | **gap，含聚焦 pass：** [WI-003](../reports/2026-09-26-pre-stun-expiry.zh.md)证明 pre-STUN 修复与目标 sanitizer 路径 | 传输唯一所有权、在途回调、按房间整体清理及有序退出未验证 |
| 源码/构建/测试 | **源码边界 pass；已取得构建证据：** ADR 0001、`UPSTREAM.md`、[WI-002](../reports/2026-09-26-meeting-baseline.zh.md)及 [WI-004](../reports/2026-09-26-lan-media-baseline.zh.md) | CTest 零注册测试；上游客户端 11 个 TypeScript 错误；实体验收待完成 |
| 安全/容量/隐私 | **gap，含有界 fixture 证据：** WI-004 验证正常 TLS 与服务边界 | 成员授权、安全 VoiceAgent 传输、识别队列/finality、字幕正文日志、供应商留存/成本、弱网限制 |
| 持久化/UI 交付 | **本次文档变更 N/A：** 未新增存储或产品行为 | 后续会议/字幕工作须定义所有者及验证清空，不宣称产品已交付 |

在 [gate 登记](../reference/architecture-gates.zh.md)跟踪 `gate-sfu-build`、`gate-sfu-boundaries`、`gate-sfu-lifecycle`、`gate-session-admission`、`gate-media-capacity` 及信令/语音桥 gate。本文不改变任何 gate 状态。实现前须结合证据明确 C-01/C-04；当前最小下一步仍是在既定条件下完成 WI-004 实体验收。
