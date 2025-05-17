#!/bin/bash

echo "=================================================="
echo "        主义主义机 - 安装与运行工具 (Unix/Linux)"
echo "=================================================="
echo

# 检查Node.js安装
check_nodejs() {
  if ! command -v node &> /dev/null; then
    echo "未找到Node.js"
    return 1
  fi

  echo "已检测到Node.js版本:"
  node -v
  return 0
}

# 安装依赖并启动开发环境
install_and_start() {
  echo
  echo "正在安装依赖..."
  npm install

  if [ $? -ne 0 ]; then
    echo "依赖安装失败，请检查错误信息"
    read -p "按Enter键继续..."
    return 1
  fi

  echo
  echo "启动开发服务器..."
  npm run dev
  return 0
}

# 构建项目
build_project() {
  echo
  echo "正在构建项目..."
  npm run build

  if [ $? -ne 0 ]; then
    echo "构建失败，请检查错误信息"
    read -p "按Enter键继续..."
    return 1
  fi

  echo
  echo "构建完成！构建文件位于 dist 目录"
  read -p "按Enter键继续..."
  return 0
}

# 预览构建结果
preview_build() {
  echo
  if [ ! -d "dist" ]; then
    echo "构建文件夹不存在，请先构建项目"
    read -p "按Enter键继续..."
    return 1
  fi

  echo "启动预览服务器..."
  npm run preview
  return 0
}

# 使用Docker启动开发环境
docker_dev() {
  echo
  if ! command -v docker &> /dev/null; then
    echo "未找到Docker，请确保已安装Docker"
    echo "可以从 https://www.docker.com/products/docker-desktop 下载安装"
    read -p "按Enter键继续..."
    return 1
  fi

  echo "使用Docker Compose启动开发环境..."
  docker-compose up
  return 0
}

# 构建Docker镜像并运行
docker_build() {
  echo
  if ! command -v docker &> /dev/null; then
    echo "未找到Docker，请确保已安装Docker"
    echo "可以从 https://www.docker.com/products/docker-desktop 下载安装"
    read -p "按Enter键继续..."
    return 1
  fi

  echo "构建Docker镜像..."
  docker build -t ismism-machine:latest .

  if [ $? -ne 0 ]; then
    echo "Docker镜像构建失败"
    read -p "按Enter键继续..."
    return 1
  fi

  echo "运行Docker容器..."
  docker run -d -p 80:80 --name ismism-machine ismism-machine:latest

  if [ $? -ne 0 ]; then
    echo "Docker容器启动失败"
    read -p "按Enter键继续..."
    return 1
  fi

  echo
  echo "Docker容器启动成功，请访问 http://localhost 查看应用"
  read -p "按Enter键继续..."
  return 0
}

# 检查Node.js安装
check_nodejs
if [ $? -ne 0 ]; then
  echo "未检测到Node.js，请先安装Node.js（推荐v18.12.1或更高版本）"
  echo "可以从 https://nodejs.org 下载安装，或使用nvm管理Node.js版本"
  read -p "按Enter键继续..."
  exit 1
fi

# 主菜单循环
while true; do
  clear
  echo "请选择要执行的操作:"
  echo
  echo "[1] 安装依赖并启动开发环境"
  echo "[2] 构建项目"
  echo "[3] 预览构建结果"
  echo "[4] 使用Docker启动开发环境"
  echo "[5] 构建Docker镜像并运行"
  echo "[0] 退出"
  echo

  read -p "请输入数字选择操作: " choice

  case $choice in
    1) install_and_start ;;
    2) build_project ;;
    3) preview_build ;;
    4) docker_dev ;;
    5) docker_build ;;
    0) exit 0 ;;
    *) 
      echo "无效的选择，请重新输入"
      sleep 2
      ;;
  esac
done 