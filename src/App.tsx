import { useState } from 'react'
import Counter from './components/Counter'
import DraggableDemo from './components/DraggableDemo'

function App() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">主义主义机 (Ismism Machine)</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
              <div className="flex flex-col items-center justify-center mb-8">
                <h2 className="text-2xl mb-4">欢迎使用主义主义机</h2>
                <p className="mb-4">环境配置成功！</p>
                <div className="flex gap-4 items-center">
                  <Counter initialValue={0} label="示例计数器" />
                  <button 
                    onClick={() => setShowDemo(!showDemo)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    {showDemo ? '隐藏拖动演示' : '显示拖动演示'}
                  </button>
                </div>
              </div>
              
              {showDemo && (
                <div className="mt-8 animate-fadeIn">
                  <DraggableDemo />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App 