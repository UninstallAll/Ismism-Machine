const { chromium } = require('playwright');

async function openBrowser(url = 'http://localhost:3001') {
  console.log(`正在打开浏览器并访问 ${url}...`);
  
  try {
    // 启动浏览器
    const browser = await chromium.launch({ 
      headless: false,  // 显示浏览器窗口
      args: ['--start-maximized'] // 最大化窗口
    });
    
    // 创建新页面
    const context = await browser.newContext({
      viewport: null // 禁用视口大小限制，与最大化配合
    });
    const page = await context.newPage();
    
    // 导航到Next.js开发服务器
    await page.goto(url);
    
    console.log(`成功打开浏览器并访问 ${url}`);
    
    // 不关闭浏览器，让用户可以继续使用
    console.log('浏览器将保持打开状态，可以手动关闭。');
    
  } catch (error) {
    console.error('打开浏览器时出错:', error);
  }
}

// 如果直接运行脚本，则打开浏览器
if (require.main === module) {
  // 获取命令行参数中的URL，如果没有则使用默认值
  const url = process.argv[2] || 'http://localhost:3001';
  openBrowser(url);
}

module.exports = { openBrowser }; 