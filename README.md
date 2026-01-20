# MCU Simulator - 单片机模拟器

一个基于Web的交互式单片机模拟器，支持多种经典单片机项目的在线编程和实时仿真。

## 本项目由[阿里云ESA](https://www.aliyun.com/product/esa)提供加速、计算和保护

![阿里云ESA](https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png)

## 项目简介

MCU Simulator 是一个功能完整的单片机在线模拟器，让用户无需硬件即可学习和实践单片机编程。项目提供了5个经典的单片机应用场景，涵盖了从基础GPIO控制到复杂的传感器和通信系统。

### 核心特性

- **5种经典项目模板**
  - 💡 LED闪烁控制 - 学习GPIO输出和定时器基础
  - 🌡️ 温度监测系统 - 掌握ADC和LCD显示技术
  - ⚙️ 电机速度控制 - 理解PWM和电机驱动原理
  - 📺 LCD动态显示 - 实现滚动文字和实时时钟
  - 📡 串口通信 - 学习UART数据传输协议

- **真实硬件模拟**
  - 24个GPIO引脚实时状态显示
  - 13个可读写寄存器（PORTA/B/C, DDR, Timer, USART等）
  - 16x2字符LCD显示屏
  - 温度传感器模拟
  - 直流电机控制
  - 串口数据收发

- **专业开发环境**
  - Monaco Editor代码编辑器（VS Code同款）
  - 语法高亮和智能提示
  - 实时代码执行和状态反馈
  - 完整的调试信息输出

- **AI编程助手**
  - 集成千问API支持
  - 用户可配置自己的API Key
  - 智能代码建议和问题解答

## 技术栈

### 前端
- **React 18** + **TypeScript** - 类型安全的现代前端框架
- **Vite** - 极速的构建工具
- **Tailwind CSS** - 实用优先的CSS框架
- **Monaco Editor** - 专业的代码编辑器
- **Lucide React** - 精美的图标库

### 边缘计算
- **ESA Pages** - 静态资源托管
- **ESA Edge Functions** - 边缘函数计算
- **千问API** - AI能力集成

## How We Use Edge

本项目充分利用了阿里云ESA的边缘计算能力，实现了高性能、低延迟的用户体验：

### 1. 边缘函数 - AI能力集成

我们在边缘函数中集成了千问API，实现了AI编程助手功能：

```javascript
// functions/index.js
async function handleQwenAPI(request, corsHeaders) {
  const { prompt, apiKey } = await request.json()

  // 在边缘节点直接调用千问API
  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen-turbo',
      input: { messages: [...] }
    })
  })

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}
```

**边缘函数的优势：**
- ⚡ **低延迟** - 在离用户最近的边缘节点处理请求，减少网络往返时间
- 🔒 **安全性** - API Key在边缘函数中处理，不暴露给前端
- 🌍 **全球加速** - 自动选择最优节点，全球用户都能获得快速响应
- 💰 **成本优化** - 边缘计算按需付费，无需维护专用服务器

### 2. 静态资源加速

前端应用通过ESA Pages部署，所有静态资源（HTML、CSS、JS、图片）都通过ESA的全球CDN网络分发：

- 自动缓存优化
- 智能压缩传输
- HTTP/2和HTTP/3支持
- 全球节点就近访问

### 3. 边缘路由

通过`esa.jsonc`配置，实现了灵活的路由策略：

```json
{
  "entry": "./functions/index.js",
  "assets": {
    "directory": "./frontend/dist"
  }
}
```

- `/api/*` 路由到边缘函数处理
- 其他请求返回静态资源
- 单页应用路由支持

### 4. 为什么边缘计算不可替代

对于单片机模拟器这类应用，边缘计算提供了传统架构无法比拟的优势：

1. **实时性要求** - 用户编写代码后期望立即看到执行结果，边缘节点的低延迟至关重要
2. **全球用户** - 教育类应用面向全球用户，边缘网络确保各地用户体验一致
3. **AI集成** - 边缘函数可以安全地调用第三方AI服务，无需暴露凭证
4. **弹性扩展** - 无需担心服务器容量，ESA自动处理流量波动

## 项目结构

```
37_MCUSimulator_单片机模拟器/
├── frontend/                 # 前端代码
│   ├── src/
│   │   ├── core/            # 核心模拟引擎
│   │   │   └── MCUSimulator.ts
│   │   ├── types/           # TypeScript类型定义
│   │   │   └── mcu.ts
│   │   ├── data/            # 项目模板数据
│   │   │   └── templates.ts
│   │   ├── App.tsx          # 主应用组件
│   │   ├── App.css          # 样式文件
│   │   └── index.css        # 全局样式
│   ├── public/              # 静态资源
│   ├── package.json
│   └── vite.config.ts
├── functions/                # 边缘函数
│   └── index.js             # 统一入口
├── esa.jsonc                # ESA配置文件
└── README.md                # 项目说明
```

## 本地开发

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
cd frontend
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `frontend/dist` 目录。

## 使用指南

### 1. 选择项目模板

在左侧面板选择一个项目模板，代码编辑器会自动加载对应的示例代码。

### 2. 编写/修改代码

使用Monaco编辑器编写或修改单片机代码。支持的API包括：

- `pinMode(pin, mode)` - 设置GPIO引脚模式
- `digitalWrite(pin, value)` - 写入GPIO引脚状态
- `digitalRead(pin)` - 读取GPIO引脚状态
- `writeRegister(address, value)` - 写入寄存器
- `readRegister(address)` - 读取寄存器
- `serialWrite(data)` - 串口发送数据
- `lcdClear()` - 清空LCD显示
- `lcdPrint(row, col, text)` - LCD显示文字
- `readTemperature()` - 读取温度传感器
- `setMotor(speed, direction)` - 控制电机

### 3. 运行代码

点击"运行"按钮执行代码，观察：
- GPIO引脚状态变化（LED灯效果）
- LCD显示内容
- 串口输出信息
- 系统状态监控

### 4. 配置AI助手（可选）

1. 点击右上角设置按钮
2. 输入你的千问API Key
3. 保存后即可使用AI编程助手功能

## 教育价值

### 创意卓越
- 将传统硬件学习搬到Web端，降低学习门槛
- 赛博朋克风格UI设计，避免常见的"AI味儿"
- 实时可视化反馈，让抽象概念具象化

### 应用价值
- **教育场景** - 学校、培训机构可直接使用，无需购买硬件
- **自学工具** - 爱好者可随时随地学习单片机编程
- **快速原型** - 工程师可快速验证算法逻辑
- **部署即用** - 无需安装，打开浏览器即可使用

### 技术探索
- **完整边缘生态** - 使用ESA Pages + 边缘函数 + AI集成
- **真实模拟** - 实现了真实的寄存器、GPIO、定时器等硬件特性
- **高性能** - 利用边缘计算实现低延迟、高并发
- **可扩展** - 架构设计支持添加更多单片机型号和外设

## 技术亮点

1. **真实的硬件抽象** - 不是简单的动画演示，而是真正模拟了单片机的寄存器、GPIO、定时器等硬件特性
2. **安全的代码执行** - 使用Function构造器创建隔离的执行环境，防止恶意代码
3. **响应式设计** - 完美适配桌面和移动设备
4. **边缘AI集成** - 在边缘函数中安全调用千问API，提供智能编程辅助

## 未来规划

- [ ] 支持更多单片机型号（STM32、ESP32等）
- [ ] 添加更多外设模拟（I2C、SPI、ADC等）
- [ ] 实现代码调试功能（断点、单步执行）
- [ ] 支持项目保存和分享
- [ ] 添加更多教学案例和教程

## 开源协议

MIT License

## 致谢

感谢阿里云ESA团队提供的强大边缘计算平台，让这个项目得以实现。

---

**立即体验：** [部署后的URL]

**GitHub仓库：** https://github.com/1195214305/37 MCUSimulator

**反馈与建议：** 欢迎提Issue或PR
