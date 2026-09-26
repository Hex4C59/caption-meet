中文: [English](README.md)

# RTCPilot

RTCPilot 是一个使用现代 C++ 实现的开源 WebRTC SFU（Selective Forwarding Unit，选择性转发单元）。

## 本仓库产品方向

在本工作区中，基于上游 [RTCPilot](https://github.com/runner365/RTCPilot) 的面向用户产品方向为 **AI 语音陪练**（实时语音 + VoiceAgent）。说明见 [产品方向.md](产品方向.md)；产品工程见 [voice-coach](../../README.md)。

## 主要特点
- 高性能的 WebRTC SFU，用于实时媒体转发。
- 跨平台支持：Windows 11、Linux（推荐 Debian）和 macOS。
- 支持 SFU 集群，便于横向扩展部署。
- 使用现代 C++ 开发，需 C++17 或更高版本进行编译。

## 仓库结构（节选）
- `src/` — SFU 以及辅助库的 C++ 源代码。
- `pilot_center/` — 使用 Python 编写的集群管理服务，负责 SFU 注册与信息转发。
- `3rdparty/`, `win_3rdparty/` — 第三方依赖和平台相关构建辅助文件。

## 在浏览器中查看运行时架构图

架构图文件为 `artifacts/rtcpilot-runtime.html`。安装 Python 3 后，在仓库根目录执行：

```bash
python3 -u -m http.server 0 --bind 127.0.0.1 --directory ./artifacts
```

也可以在任意目录使用本机的绝对路径启动（仓库位置不同时请调整路径）：

```bash
python3 -u -m http.server 0 --bind 127.0.0.1 --directory /home/aimsl/code/Cpp/RTCPilot/artifacts
```

- 端口 `0` 表示由系统自动分配空闲端口，避免 `Address already in use` 错误。
- 启动后查看终端输出中的实际端口号。例如显示 `Serving HTTP on 127.0.0.1 port 44123 ...`，则访问 [http://127.0.0.1:44123/rtcpilot-runtime.html](http://127.0.0.1:44123/rtcpilot-runtime.html)。每次启动的端口可能不同，请替换为实际端口。
- 保持终端运行；按 `Ctrl+C` 停止服务。该命令只启动架构图静态文件服务，不启动 RTCPilot SFU。
- 如果通过 SSH 使用远程 Cursor，在“端口 / Ports”面板转发实际端口，再用本机浏览器访问转发地址下的 `/rtcpilot-runtime.html`。

## WebRTC JS 客户端
- 浏览器端开源示例：[https://github.com/runner365/webrtc_js_client](https://github.com/runner365/webrtc_js_client)

## 支持的平台与构建方式
### Windows 11（Visual Studio）
- 推荐：Visual Studio Community 2022（在 17.14.16 版本上有测试）。
- 打开仓库中的 Visual Studio 解决方案 `RTCPilot.sln`，选择 x64 的 Debug/Release 配置并进行构建。
- 请确保所需的第三方库（OpenSSL、libuv、libsrtp、yaml-cpp 等）已放置在 `win_3rdparty` 或已在系统中安装。

### Linux（推荐 Debian）
- 要求：支持 C++17 的编译器（gcc/clang）、`cmake` 以及常规构建工具。
- 示例构建步骤：

```bash
sudo apt update
sudo apt install -y build-essential cmake git libssl-dev
mkdir build && cd build
cmake .. 
make -j 2
```

### macOS
- 使用 CMake 构建（可采用 Xcode 或 clang 工具链）。
- 示例：

```bash
mkdir build && cd build
cmake ..
make -j 2
```

## 集群与 `pilot_center`
- `pilot_center` 目录包含用于集群管理的 Python 服务。
- 该服务负责 SFU 节点的注册，并在服务间转发 SFU 信息，以支持集群发现与调度。
- 请参考 `pilot_center/requirements.txt` 和 `pilot_center/pilot_center.py` 获取快速启动说明。

## RTCPilot接入语音代理（`voice_agent`）
RTCPilot SFU支持接入语音代理（`voice_agent`），用于处理与AI大模型的语音交互。

**Voice Agent** 是一个先进的「实时语音对话 AI」智能体。voice_agent服务的开源地址: [https://github.com/runner365/VoiceAgent](https://github.com/runner365/VoiceAgent)

接入VoiceAgent的步骤如下：
1. 部署VoiceAgent服务，确保其正常运行。
2. 在RTCPilot配置文件中启用语音代理功能（`enable: true`）。
3. 配置VoiceAgent服务的IP地址、端口和注册路径前缀（`agent_ip`、`agent_port`、`subpath`）。
```yaml
voice_agent:
  enable: true
  agent_ip: "192.168.1.221"
  agent_port: 5555
  subpath: "/voiceagent"
```

详细见配置文件 `config_guide.md`（中文）和 `config_guide_en.md`（英文）中`voice_agent`部分。

## 配置
- 项目使用 YAML 文件进行配置（例如 `RTCPilot/config.yaml`）。
- 在运行前请根据网络、日志和 SFU 参数需求调整配置文件。
- 详细配置说明：请参阅 [config_guide.md](config_guide.md)（中文）和 [config_guide_en.md](config_guide_en.md)（英文）。

## 依赖要求
- 支持 C++17 或更新的编译器。
- 推荐使用 CMake 3.10 及以上进行跨平台构建。
- 平台相关的本地依赖：OpenSSL、libsrtp、libuv、yaml-cpp 等。详见 `3rdparty` 和 `win_3rdparty` 目录。



