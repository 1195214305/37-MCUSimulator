import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Settings, Zap, Cpu, Thermometer, Gauge } from 'lucide-react'
import Editor from '@monaco-editor/react'
import { MCUSimulator } from './core/MCUSimulator'
import { projectTemplates } from './data/templates'
import type { MCUState, ProjectTemplate } from './types/mcu'
import './App.css'

function App() {
  const [simulator] = useState(() => new MCUSimulator())
  const [mcuState, setMcuState] = useState<MCUState>(simulator.getState())
  const [code, setCode] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState(localStorage.getItem('qwen_api_key') || '')

  useEffect(() => {
    simulator.onStateChange((state) => {
      setMcuState(state)
    })

    // 加载默认模板
    if (projectTemplates.length > 0) {
      const defaultTemplate = projectTemplates[0]
      setSelectedTemplate(defaultTemplate)
      setCode(defaultTemplate.code)
    }
  }, [simulator])

  const handleRun = () => {
    const result = simulator.executeCode(code)
    if (result.success) {
      simulator.start()
    } else {
      alert('代码执行错误: ' + result.error)
    }
  }

  const handleStop = () => {
    simulator.stop()
  }

  const handleReset = () => {
    simulator.reset()
    if (selectedTemplate) {
      setCode(selectedTemplate.code)
    }
  }

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template)
    setCode(template.code)
    simulator.reset()
  }

  const handleSaveApiKey = () => {
    localStorage.setItem('qwen_api_key', apiKey)
    setShowSettings(false)
    alert('API Key 已保存')
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* 顶部导航栏 */}
      <nav className="glass-effect border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-8 h-8 text-cyber-cyan" />
            <h1 className="text-2xl font-bold">MCU Simulator</h1>
            <span className="text-sm text-gray-400">单片机模拟器</span>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* 设置面板 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="glass-effect p-6 rounded-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">设置</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">千问 API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-cyber-cyan"
                  placeholder="输入你的千问 API Key"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveApiKey}
                  className="flex-1 bg-cyber-cyan text-dark-bg px-4 py-2 rounded-lg font-medium hover:bg-cyber-cyan/80 transition-colors"
                >
                  保存
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-white/10 px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：项目模板 */}
          <div className="lg:col-span-1">
            <div className="glass-effect rounded-xl p-4">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyber-orange" />
                项目模板
              </h2>
              <div className="space-y-2">
                {projectTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'bg-cyber-cyan/20 border border-cyber-cyan'
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{template.icon}</span>
                      <span className="font-medium">{template.name}</span>
                    </div>
                    <p className="text-sm text-gray-400">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 状态监控 */}
            <div className="glass-effect rounded-xl p-4 mt-6">
              <h2 className="text-lg font-bold mb-4">系统状态</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">运行状态</span>
                  <span className={mcuState.running ? 'text-green-400' : 'text-gray-500'}>
                    {mcuState.running ? '运行中' : '已停止'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Thermometer className="w-4 h-4" />
                    温度
                  </span>
                  <span className="text-cyber-cyan">{mcuState.temperature.toFixed(1)}°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    电机速度
                  </span>
                  <span className="text-cyber-orange">{mcuState.motorSpeed}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 中间：代码编辑器 */}
          <div className="lg:col-span-2">
            <div className="glass-effect rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">代码编辑器</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleRun}
                    disabled={mcuState.running}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    运行
                  </button>
                  <button
                    onClick={handleStop}
                    disabled={!mcuState.running}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    停止
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 bg-cyber-orange hover:bg-cyber-orange/80 px-4 py-2 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    重置
                  </button>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden border border-white/10">
                <Editor
                  height="400px"
                  defaultLanguage="javascript"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>

            {/* GPIO 可视化 */}
            <div className="glass-effect rounded-xl p-4 mb-6">
              <h2 className="text-lg font-bold mb-4">GPIO 引脚状态</h2>
              <div className="grid grid-cols-8 gap-2">
                {mcuState.gpio.slice(0, 16).map((pin) => (
                  <div
                    key={pin.id}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        pin.state
                          ? 'bg-cyber-cyan border-cyber-cyan led-on'
                          : 'bg-gray-700 border-gray-600'
                      }`}
                    />
                    <span className="text-xs text-gray-400">{pin.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* LCD 显示 */}
            <div className="glass-effect rounded-xl p-4 mb-6">
              <h2 className="text-lg font-bold mb-4">LCD 显示屏 (16x2)</h2>
              <div className="bg-green-900/30 border-2 border-green-700 rounded-lg p-4 font-mono">
                {mcuState.lcd.buffer.map((row, i) => (
                  <div key={i} className="text-green-400 text-lg tracking-wider">
                    {row.join('')}
                  </div>
                ))}
              </div>
            </div>

            {/* 串口输出 */}
            <div className="glass-effect rounded-xl p-4">
              <h2 className="text-lg font-bold mb-4">串口输出</h2>
              <div className="bg-black/50 rounded-lg p-4 h-40 overflow-y-auto font-mono text-sm">
                {mcuState.serial.slice(-10).map((data, i) => (
                  <div key={i} className="text-green-400">
                    [{new Date(data.timestamp).toLocaleTimeString()}] {data.data}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="mt-12 py-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
          <p>本项目由 <a href="https://www.aliyun.com/product/esa" className="text-cyber-cyan hover:underline">阿里云ESA</a> 提供加速、计算和保护</p>
        </div>
      </footer>
    </div>
  )
}

export default App
