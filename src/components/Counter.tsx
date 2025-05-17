import { useState } from 'react'

interface CounterProps {
  initialValue?: number
  label?: string
}

export default function Counter({ initialValue = 0, label = '计数器' }: CounterProps) {
  const [count, setCount] = useState(initialValue)

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-lg font-medium">{label}: {count}</p>
      <div className="flex gap-2">
        <button 
          onClick={() => setCount(count - 1)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          减少
        </button>
        <button 
          onClick={() => setCount(count + 1)}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          增加
        </button>
      </div>
    </div>
  )
} 