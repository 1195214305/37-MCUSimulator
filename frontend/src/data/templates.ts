// 单片机项目模板
import type { ProjectTemplate } from '../types/mcu'

export const projectTemplates: ProjectTemplate[] = [
  {
    id: 'led-blink',
    name: 'LED闪烁控制',
    description: '控制LED灯以不同频率闪烁，学习GPIO输出和定时器基础',
    icon: '💡',
    category: 'basic',
    code: `// LED闪烁控制程序
// 使用PA0引脚控制LED

// 初始化
pinMode(0, 'output');  // PA0设置为输出模式

let ledState = false;
let counter = 0;

// 主循环
function loop() {
  counter++;

  // 每500次循环切换LED状态
  if (counter >= 500) {
    ledState = !ledState;
    digitalWrite(0, ledState);
    console.log('LED状态: ' + (ledState ? '开' : '关'));
    counter = 0;
  }
}

// 启动循环
setInterval(loop, 1);
`
  },
  {
    id: 'temperature-monitor',
    name: '温度监测系统',
    description: '读取温度传感器数据并在LCD上显示，学习ADC和LCD控制',
    icon: '🌡️',
    category: 'sensor',
    code: `// 温度监测系统
// 读取温度传感器并显示在LCD上

// 初始化LCD
lcdClear();
lcdPrint(0, 0, 'Temperature:');

let updateCounter = 0;

function loop() {
  updateCounter++;

  // 每1000次循环更新一次显示
  if (updateCounter >= 1000) {
    // 读取温度
    const temp = readTemperature();

    // 显示在LCD第二行
    const tempStr = temp.toFixed(1) + ' C';
    lcdPrint(1, 0, tempStr + '        ');

    // 串口输出
    console.log('当前温度: ' + tempStr);

    // 温度报警
    if (temp > 30) {
      digitalWrite(0, true);  // PA0 LED亮起报警
      console.log('警告: 温度过高!');
    } else {
      digitalWrite(0, false);
    }

    updateCounter = 0;
  }
}

setInterval(loop, 1);
`
  },
  {
    id: 'motor-control',
    name: '电机速度控制',
    description: '使用PWM控制直流电机转速和方向，学习PWM和电机驱动',
    icon: '⚙️',
    category: 'control',
    code: `// 电机速度控制程序
// 使用PWM控制电机转速

// 初始化
pinMode(0, 'output');  // PA0: 电机使能
pinMode(1, 'output');  // PA1: 方向控制

let speed = 0;
let direction = 'cw';  // 顺时针
let increasing = true;

function loop() {
  // 渐变速度
  if (increasing) {
    speed += 5;
    if (speed >= 255) {
      speed = 255;
      increasing = false;
    }
  } else {
    speed -= 5;
    if (speed <= 0) {
      speed = 0;
      increasing = true;
      // 切换方向
      direction = direction === 'cw' ? 'ccw' : 'cw';
      digitalWrite(1, direction === 'cw');
      console.log('方向切换: ' + direction);
    }
  }

  // 设置电机
  setMotor(speed, direction);

  // 输出状态
  if (speed % 50 === 0) {
    console.log('速度: ' + speed + ', 方向: ' + direction);
  }

  delay(20);
}

setInterval(loop, 20);
`
  },
  {
    id: 'lcd-display',
    name: 'LCD动态显示',
    description: '在LCD上显示滚动文字和动画效果，学习LCD编程技巧',
    icon: '📺',
    category: 'display',
    code: `// LCD动态显示程序
// 显示滚动文字和实时时钟

// 初始化
lcdClear();

const message = 'Hello MCU Simulator! ';
let scrollPos = 0;
let seconds = 0;

function loop() {
  // 第一行: 滚动文字
  const displayText = message.substring(scrollPos) + message.substring(0, scrollPos);
  lcdPrint(0, 0, displayText.substring(0, 16));

  scrollPos++;
  if (scrollPos >= message.length) {
    scrollPos = 0;
  }

  // 第二行: 时间显示
  seconds++;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeStr = 'Time: ' +
    (mins < 10 ? '0' : '') + mins + ':' +
    (secs < 10 ? '0' : '') + secs;
  lcdPrint(1, 0, timeStr);

  delay(200);
}

setInterval(loop, 200);
`
  },
  {
    id: 'serial-communication',
    name: '串口通信',
    description: '通过串口发送和接收数据，学习UART通信协议',
    icon: '📡',
    category: 'communication',
    code: `// 串口通信程序
// 发送传感器数据到上位机

// 初始化
let counter = 0;
let dataPacket = 0;

function loop() {
  counter++;

  // 每1000次循环发送一次数据
  if (counter >= 1000) {
    dataPacket++;

    // 读取各种传感器数据
    const temp = readTemperature();
    const gpio0 = digitalRead(0) ? 1 : 0;
    const gpio1 = digitalRead(1) ? 1 : 0;

    // 构建数据包
    const data = {
      packet: dataPacket,
      temperature: temp.toFixed(2),
      gpio: [gpio0, gpio1],
      timestamp: Date.now()
    };

    // 发送JSON格式数据
    serialWrite(JSON.stringify(data));
    console.log('发送数据包 #' + dataPacket);

    // LED指示
    digitalWrite(2, true);
    delay(50);
    digitalWrite(2, false);

    counter = 0;
  }
}

// 初始化指示灯
pinMode(2, 'output');

setInterval(loop, 1);
`
  }
]

export function getTemplateById(id: string): ProjectTemplate | undefined {
  return projectTemplates.find(t => t.id === id)
}

export function getTemplatesByCategory(category: string): ProjectTemplate[] {
  return projectTemplates.filter(t => t.category === category)
}
