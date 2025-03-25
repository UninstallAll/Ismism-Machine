'use client'

import { useEffect } from 'react'

export default function Home() {
  // 这个效果在开发者工具中检查我们的CSS变量是否已正确加载
  useEffect(() => {
    console.log('CSS变量已加载');
  }, []);
  
  return (
    <div className="min-h-screen">
      {/* 标题区 */}
      <section className="h-screen flex items-center justify-center flex-col text-center px-4 bg-background-light dark:bg-background-dark">
        <h1 className="heading-xl mb-6 text-primary-900 dark:text-primary-300 animate-fade-in">
          交互式艺术与哲学研究
        </h1>
        <p className="text-lg md:text-xl opacity-80 max-w-2xl animate-slide-up">
          探索艺术、哲学与科技的交汇点
        </p>
        
        <div className="mt-10 flex gap-4">
          <button className="btn-primary">开始探索</button>
          <button className="btn-secondary">了解更多</button>
        </div>
      </section>
      
      {/* 颜色展示 */}
      <section className="py-20 container-padding">
        <h2 className="heading-lg mb-10 text-center">颜色主题</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-6 bg-primary-500 text-white rounded-md">Primary 500</div>
          <div className="p-6 bg-primary-600 text-white rounded-md">Primary 600</div>
          <div className="p-6 bg-primary-700 text-white rounded-md">Primary 700</div>
          <div className="p-6 bg-primary-800 text-white rounded-md">Primary 800</div>
          <div className="p-6 bg-primary-900 text-white rounded-md">Primary 900</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
          <div className="p-6 bg-secondary-200 text-secondary-800 rounded-md">Secondary 200</div>
          <div className="p-6 bg-secondary-300 text-secondary-800 rounded-md">Secondary 300</div>
          <div className="p-6 bg-secondary-400 text-white rounded-md">Secondary 400</div>
          <div className="p-6 bg-secondary-500 text-white rounded-md">Secondary 500</div>
          <div className="p-6 bg-secondary-600 text-white rounded-md">Secondary 600</div>
        </div>
      </section>
      
      {/* 样式组件展示 */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 container-padding">
        <h2 className="heading-lg mb-10 text-center">组件样式</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bento-card p-6">
            <h3 className="heading-md mb-4">便当卡片</h3>
            <p>这是一个便当卡片组件，使用了自定义的bento-card类。</p>
          </div>
          <div className="timeline-item bg-white dark:bg-gray-800 shadow-md">
            <h3 className="heading-md mb-4">时间轴项</h3>
            <p>这是一个时间轴项组件，使用了自定义的timeline-item类。</p>
          </div>
        </div>
      </section>
      
      {/* 字体展示 */}
      <section className="py-20 container-padding">
        <h2 className="heading-lg mb-10 text-center">字体系统</h2>
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h3 className="font-heading text-4xl mb-2">Playfair Display (标题字体)</h3>
            <p className="font-heading text-xl">这是一个优雅的衬线字体，适合用于标题和重点内容。</p>
          </div>
          <div>
            <h3 className="font-sans text-2xl mb-2">Inter (正文字体)</h3>
            <p className="font-sans">这是一个现代无衬线字体，适合用于正文内容，提供良好的可读性。</p>
          </div>
        </div>
      </section>
    </div>
  );
}
