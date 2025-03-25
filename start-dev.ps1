# 启动Next.js开发服务器
$nextProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd ismism-website && npm run dev" -PassThru -WindowStyle Normal

# 等待服务器启动
Write-Host "等待Next.js开发服务器启动..."
Start-Sleep -Seconds 15

# 打开浏览器
Write-Host "正在打开浏览器..."
node open-browser.js

# 等待用户按键退出
Write-Host "`n按任意键退出程序..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null

# 如果用户退出，关闭Node.js进程
Stop-Process -Id $nextProcess.Id -Force
Write-Host "已关闭开发服务器" 