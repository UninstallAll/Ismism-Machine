#!/bin/bash

echo "=================================================="
echo "        Ismism Machine - Installation Tool (Unix/Linux)"
echo "=================================================="
echo

# Check Node.js installation
check_nodejs() {
  if ! command -v node &> /dev/null; then
    echo "Node.js not found"
    return 1
  fi

  echo "Node.js version detected:"
  node -v
  return 0
}

# Install dependencies and start development environment
install_and_start() {
  echo
  echo "Installing dependencies..."
  npm install

  if [ $? -ne 0 ]; then
    echo "Dependency installation failed. Please check error messages"
    read -p "Press Enter to continue..."
    return 1
  fi

  echo
  echo "Starting development server..."
  npm run dev
  return 0
}

# Build project
build_project() {
  echo
  echo "Building project..."
  npm run build

  if [ $? -ne 0 ]; then
    echo "Build failed. Please check error messages"
    read -p "Press Enter to continue..."
    return 1
  fi

  echo
  echo "Build complete! Build files are in the dist directory"
  read -p "Press Enter to continue..."
  return 0
}

# Preview build result
preview_build() {
  echo
  if [ ! -d "dist" ]; then
    echo "Build directory does not exist. Please build the project first"
    read -p "Press Enter to continue..."
    return 1
  fi

  echo "Starting preview server..."
  npm run preview
  return 0
}

# Start development environment using Docker
docker_dev() {
  echo
  if ! command -v docker &> /dev/null; then
    echo "Docker not found. Please ensure Docker is installed"
    echo "Download from https://www.docker.com/products/docker-desktop"
    read -p "Press Enter to continue..."
    return 1
  fi

  echo "Starting development environment using Docker Compose..."
  docker-compose up
  return 0
}

# Build Docker image and run
docker_build() {
  echo
  if ! command -v docker &> /dev/null; then
    echo "Docker not found. Please ensure Docker is installed"
    echo "Download from https://www.docker.com/products/docker-desktop"
    read -p "Press Enter to continue..."
    return 1
  fi

  echo "Building Docker image..."
  docker build -t ismism-machine:latest .

  if [ $? -ne 0 ]; then
    echo "Docker image build failed"
    read -p "Press Enter to continue..."
    return 1
  fi

  echo "Running Docker container..."
  docker run -d -p 80:80 --name ismism-machine ismism-machine:latest

  if [ $? -ne 0 ]; then
    echo "Docker container startup failed"
    read -p "Press Enter to continue..."
    return 1
  fi

  echo
  echo "Docker container started successfully. Visit http://localhost to view the application"
  read -p "Press Enter to continue..."
  return 0
}

# Check Node.js installation
check_nodejs
if [ $? -ne 0 ]; then
  echo "Node.js not detected. Please install Node.js (recommended v18.12.1 or higher)"
  echo "Download from https://nodejs.org or use nvm to manage Node.js versions"
  read -p "Press Enter to continue..."
  exit 1
fi

# Main menu loop
while true; do
  clear
  echo "Please select an operation:"
  echo
  echo "[1] Install dependencies and start development environment"
  echo "[2] Build project"
  echo "[3] Preview build result"
  echo "[4] Start development environment using Docker"
  echo "[5] Build Docker image and run"
  echo "[0] Exit"
  echo

  read -p "Enter number to select operation: " choice

  case $choice in
    1) install_and_start ;;
    2) build_project ;;
    3) preview_build ;;
    4) docker_dev ;;
    5) docker_build ;;
    0) exit 0 ;;
    *) 
      echo "Invalid selection, please try again"
      sleep 2
      ;;
  esac
done 