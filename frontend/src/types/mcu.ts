// 单片机模拟器类型定义

// GPIO引脚状态
export interface GPIOPin {
  id: number
  mode: 'input' | 'output'
  state: boolean
  name: string
}

// 寄存器
export interface Register {
  name: string
  address: number
  value: number
  description: string
}

// 定时器
export interface Timer {
  id: number
  enabled: boolean
  counter: number
  period: number
  prescaler: number
}

// 串口数据
export interface SerialData {
  timestamp: number
  direction: 'tx' | 'rx'
  data: string
}

// LCD显示
export interface LCDDisplay {
  width: number
  height: number
  buffer: string[][]
  backlight: boolean
}

// 单片机状态
export interface MCUState {
  running: boolean
  frequency: number
  registers: Register[]
  gpio: GPIOPin[]
  timers: Timer[]
  serial: SerialData[]
  lcd: LCDDisplay
  temperature: number
  motorSpeed: number
  motorDirection: 'cw' | 'ccw' | 'stop'
}

// 项目模板
export interface ProjectTemplate {
  id: string
  name: string
  description: string
  icon: string
  code: string
  category: 'basic' | 'sensor' | 'control' | 'display' | 'communication'
}

// 代码执行结果
export interface ExecutionResult {
  success: boolean
  output: string
  error?: string
  state?: Partial<MCUState>
}
