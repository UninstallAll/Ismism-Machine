import Counter from './components/Counter'

function App() {
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
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center">
              <h2 className="text-2xl mb-4">欢迎使用主义主义机</h2>
              <p className="mb-4">环境配置成功！</p>
              <Counter initialValue={0} label="示例计数器" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App 