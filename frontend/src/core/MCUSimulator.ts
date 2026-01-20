// 单片机模拟器核心引擎
import type { MCUState, GPIOPin, Register, Timer, LCDDisplay, ExecutionResult } from '../types/mcu'

export class MCUSimulator {
  private state: MCUState
  private intervalId: number | null = null
  private executionCallback: ((state: MCUState) => void) | null = null

  constructor() {
    this.state = this.initializeState()
  }

  private initializeState(): MCUState {
    return {
      running: false,
      frequency: 16000000, // 16MHz
      registers: this.initializeRegisters(),
      gpio: this.initializeGPIO(),
      timers: this.initializeTimers(),
      serial: [],
      lcd: this.initializeLCD(),
      temperature: 25.0,
      motorSpeed: 0,
      motorDirection: 'stop'
    }
  }

  private initializeRegisters(): Register[] {
    return [
      { name: 'PORTA', address: 0x00, value: 0x00, description: 'Port A 数据寄存器' },
      { name: 'PORTB', address: 0x01, value: 0x00, description: 'Port B 数据寄存器' },
      { name: 'PORTC', address: 0x02, value: 0x00, description: 'Port C 数据寄存器' },
      { name: 'DDRA', address: 0x03, value: 0x00, description: 'Port A 方向寄存器' },
      { name: 'DDRB', address: 0x04, value: 0x00, description: 'Port B 方向寄存器' },
      { name: 'DDRC', address: 0x05, value: 0x00, description: 'Port C 方向寄存器' },
      { name: 'TCCR0', address: 0x06, value: 0x00, description: '定时器0控制寄存器' },
      { name: 'TCNT0', address: 0x07, value: 0x00, description: '定时器0计数器' },
      { name: 'UCSRA', address: 0x08, value: 0x00, description: 'USART控制状态寄存器A' },
      { name: 'UCSRB', address: 0x09, value: 0x00, description: 'USART控制状态寄存器B' },
      { name: 'UDR', address: 0x0A, value: 0x00, description: 'USART数据寄存器' },
      { name: 'ADCL', address: 0x0B, value: 0x00, description: 'ADC数据寄存器低位' },
      { name: 'ADCH', address: 0x0C, value: 0x00, description: 'ADC数据寄存器高位' },
    ]
  }

  private initializeGPIO(): GPIOPin[] {
    const pins: GPIOPin[] = []
    const ports = ['A', 'B', 'C']

    ports.forEach((port, portIndex) => {
      for (let i = 0; i < 8; i++) {
        pins.push({
          id: portIndex * 8 + i,
          mode: 'input',
          state: false,
          name: `P${port}${i}`
        })
      }
    })

    return pins
  }

  private initializeTimers(): Timer[] {
    return [
      { id: 0, enabled: false, counter: 0, period: 1000, prescaler: 1 },
      { id: 1, enabled: false, counter: 0, period: 1000, prescaler: 1 },
    ]
  }

  private initializeLCD(): LCDDisplay {
    const buffer: string[][] = []
    for (let i = 0; i < 2; i++) {
      buffer.push(new Array(16).fill(' '))
    }
    return {
      width: 16,
      height: 2,
      buffer,
      backlight: true
    }
  }

  // 执行用户代码
  executeCode(code: string): ExecutionResult {
    try {
      // 创建安全的执行环境
      const context = this.createExecutionContext()

      // 使用Function构造器执行代码
      const func = new Function(...Object.keys(context), code)
      func(...Object.values(context))

      return {
        success: true,
        output: '代码执行成功',
        state: this.state
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  private createExecutionContext() {
    return {
      // GPIO操作
      pinMode: (pin: number, mode: 'input' | 'output') => {
        if (pin >= 0 && pin < this.state.gpio.length) {
          this.state.gpio[pin].mode = mode
          this.notifyStateChange()
        }
      },
      digitalWrite: (pin: number, value: boolean) => {
        if (pin >= 0 && pin < this.state.gpio.length) {
          this.state.gpio[pin].state = value
          this.notifyStateChange()
        }
      },
      digitalRead: (pin: number): boolean => {
        if (pin >= 0 && pin < this.state.gpio.length) {
          return this.state.gpio[pin].state
        }
        return false
      },

      // 寄存器操作
      writeRegister: (address: number, value: number) => {
        const reg = this.state.registers.find(r => r.address === address)
        if (reg) {
          reg.value = value & 0xFF
          this.notifyStateChange()
        }
      },
      readRegister: (address: number): number => {
        const reg = this.state.registers.find(r => r.address === address)
        return reg ? reg.value : 0
      },

      // 串口操作
      serialWrite: (data: string) => {
        this.state.serial.push({
          timestamp: Date.now(),
          direction: 'tx',
          data
        })
        this.notifyStateChange()
      },

      // LCD操作
      lcdClear: () => {
        for (let i = 0; i < this.state.lcd.height; i++) {
          this.state.lcd.buffer[i] = new Array(this.state.lcd.width).fill(' ')
        }
        this.notifyStateChange()
      },
      lcdPrint: (row: number, col: number, text: string) => {
        if (row >= 0 && row < this.state.lcd.height) {
          for (let i = 0; i < text.length && col + i < this.state.lcd.width; i++) {
            this.state.lcd.buffer[row][col + i] = text[i]
          }
          this.notifyStateChange()
        }
      },

      // 温度传感器
      readTemperature: (): number => {
        return this.state.temperature
      },

      // 电机控制
      setMotor: (speed: number, direction: 'cw' | 'ccw' | 'stop') => {
        this.state.motorSpeed = Math.max(0, Math.min(255, speed))
        this.state.motorDirection = direction
        this.notifyStateChange()
      },

      // 延时函数
      delay: (ms: number) => {
        // 在实际应用中，这里应该使用异步延时
        // 为了演示，我们只是记录延时
        console.log(`延时 ${ms}ms`)
      },

      // 工具函数
      console: {
        log: (...args: any[]) => {
          this.state.serial.push({
            timestamp: Date.now(),
            direction: 'tx',
            data: args.join(' ')
          })
          this.notifyStateChange()
        }
      }
    }
  }

  private notifyStateChange() {
    if (this.executionCallback) {
      this.executionCallback(this.state)
    }
  }

  // 启动模拟器
  start() {
    this.state.running = true
    this.notifyStateChange()
  }

  // 停止模拟器
  stop() {
    this.state.running = false
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.notifyStateChange()
  }

  // 重置模拟器
  reset() {
    this.stop()
    this.state = this.initializeState()
    this.notifyStateChange()
  }

  // 获取当前状态
  getState(): MCUState {
    return this.state
  }

  // 设置状态变化回调
  onStateChange(callback: (state: MCUState) => void) {
    this.executionCallback = callback
  }

  // 模拟温度变化
  simulateTemperatureChange(delta: number) {
    this.state.temperature += delta
    this.state.temperature = Math.max(-40, Math.min(125, this.state.temperature))
    this.notifyStateChange()
  }

  // 模拟GPIO输入
  simulateGPIOInput(pin: number, value: boolean) {
    if (pin >= 0 && pin < this.state.gpio.length && this.state.gpio[pin].mode === 'input') {
      this.state.gpio[pin].state = value
      this.notifyStateChange()
    }
  }
}
