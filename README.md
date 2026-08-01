# 🎬 VideoFrame Studio - 高清视频截图与帧标注工具

<p align="center">
  <b>一款纯前端运行的高清视频截图、逐帧微调、定时批量抽帧、画面标注与电影胶片连环画生成神器。</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License MIT">
  <img src="https://img.shields.io/badge/HTML5-Canvas-orange.svg" alt="HTML5 Canvas">
  <img src="https://img.shields.io/badge/JavaScript-ES6+-yellow.svg" alt="ES6">
  <img src="https://img.shields.io/badge/Privacy-100%25%20Local-green.svg" alt="Privacy First">
</p>

---

## 🌟 核心亮点 (Features)

- 📸 **0 损耗原画质提取**：基于 HTML5 Canvas 2D 低级帧渲染，以视频原始分辨率 (1080P / 4K) 导出截图，不受网页播放器缩放影响。
- ⏱️ **毫秒级逐帧微调**：支持上一帧 (`←`) / 下一帧 (`→`) 步进微调，自定义 FPS (24/25/30/60) 与 0.25x ~ 4x 播放倍速。
- ⏱️ **批量 / 定时抽帧**：支持按固定时间间隔（如每 2 秒）或指定总张数自动轮询抓取全片帧，带进度实时提示。
- 🎞️ **电影胶片连环画生成器**：自动生成带视频元数据标题与时间戳角标的 3x3 九宫格或自定义行列连环画长图。
- ✂️ **画图标注与马赛克编辑**：内置画笔、箭头、矩形框、圆形框、文字插入、敏感区域马赛克模糊及 6 色调色盘，支持撤销与重置。
- 📋 **剪贴板直复制 & ZIP 打包**：单击直接复制图片至系统剪贴板（微信/Word/Telegram 无缝 `Ctrl+V` 粘贴），支持全画廊一键打包导出 `.zip`。
- 🔒 **100% 本地隐私安全**：无需上传视频至任何后端服务器，所有计算均在浏览器本地内存完成，安全无泄露。

---

## 🖥️ 界面预览与软件演示

软件支持**明亮莫兰迪蓝灰主题 (Soft Slate & Mist Theme)**，具备视网膜屏高对比度与舒适护眼体验。

内附**一键生成范例 Demo 视频**功能，无需上传本地文件即可直接体验所有截图与标注工具！

---

## 🛠️ 技术栈 (Tech Stack)

- **核心逻辑**：原生 HTML5 Video API, ES6 JavaScript, Canvas 2D Engine
- **设计系统**：Vanilla CSS Custom Properties (Design Tokens), Translucent Glassmorphic Layout
- **矢量图标**：[Lucide Icons](https://lucide.dev/)
- **压缩打包**：[JSZip](https://stuk.github.io/jszip/)

---

## 🚀 快速开始 (Quick Start)

### 方法一：直接双击运行
1. 下载或克隆本仓库到本地。
2. 双击打开 `index.html` 即可在浏览器中直接使用！

### 方法二：本地 HTTP 服务器运行
在项目根目录运行任意静态 Web 服务器：

```bash
# 使用 Python 启动
python -m http.server 8080

# 或使用 Node.js serve
npx serve .
```

打开浏览器访问 `http://localhost:8080` 即可。

---

## ⌨️ 快捷键指南 (Keyboard Shortcuts)

| 按键 | 功能说明 |
| :--- | :--- |
| <kbd>Space</kbd> | 播放 / 暂停视频 |
| <kbd>S</kbd> 或 <kbd>C</kbd> | 立即截取当前帧原画质图片 |
| <kbd>←</kbd> / <kbd>→</kbd> | 精确后退 / 前进 1 帧 (依当前 FPS 模式) |
| <kbd>Shift</kbd> + <kbd>←</kbd> / <kbd>→</kbd> | 快退 / 快进 1 秒 |
| <kbd>B</kbd> | 打开批量 / 定时截图弹窗 |

---

## 📂 项目目录结构 (Directory Structure)

```text
video-frame-studio/
├── index.html            # 主页面结构与 Modal 弹窗
├── css/
│   └── styles.css        # 莫兰迪蓝灰设计系统与组件样式
├── js/
│   ├── app.js            # 主控逻辑、视频加载与快捷键绑定
│   ├── capture.js        # Canvas 高清帧抓取、定时批量提取、胶片拼图生成
│   ├── annotator.js      # Canvas 图片标注（画笔/箭头/矩形/文字/马赛克）
│   └── gallery.js        # 截图列表管理、ZIP 打包导出、剪贴板复制
└── README.md             # 项目说明文档
```

---

## 📄 开源协议 (License)

本项目采用 [MIT License](LICENSE) 开源协议。
