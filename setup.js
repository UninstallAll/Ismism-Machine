#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

console.log(`${colors.blue}====================================${colors.reset}`);
console.log(`${colors.blue}主义主义机(Ismism Machine)环境配置${colors.reset}`);
console.log(`${colors.blue}====================================${colors.reset}`);

// 检查Node.js版本
try {
  const nodeVersion = process.version;
  console.log(`${colors.green}✓${colors.reset} 检测到Node.js版本: ${nodeVersion}`);
  
  const versionNum = nodeVersion.slice(1).split('.')[0];
  if (parseInt(versionNum) < 14) {
    console.log(`${colors.yellow}⚠ 警告: 建议使用Node.js 14.x或更高版本${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}✗ 无法检测Node.js版本: ${error.message}${colors.reset}`);
  process.exit(1);
}

// 检查package.json是否存在
try {
  if (!fs.existsSync(path.join(process.cwd(), 'package.json'))) {
    console.error(`${colors.red}✗ 未找到package.json文件${colors.reset}`);
    process.exit(1);
  }
  console.log(`${colors.green}✓${colors.reset} 找到package.json文件`);
} catch (error) {
  console.error(`${colors.red}✗ 检查package.json时出错: ${error.message}${colors.reset}`);
  process.exit(1);
}

// 安装依赖
try {
  console.log(`${colors.blue}正在安装依赖...${colors.reset}`);
  execSync('npm install', { stdio: 'inherit' });
  console.log(`${colors.green}✓${colors.reset} 依赖安装完成`);
} catch (error) {
  console.error(`${colors.red}✗ 依赖安装失败: ${error.message}${colors.reset}`);
  process.exit(1);
}

// 创建基本目录结构（如果不存在）
const directories = ['src', 'public', 'src/components', 'src/assets'];
directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`${colors.green}✓${colors.reset} 创建目录: ${dir}`);
    } catch (error) {
      console.error(`${colors.red}✗ 无法创建目录 ${dir}: ${error.message}${colors.reset}`);
    }
  } else {
    console.log(`${colors.green}✓${colors.reset} 目录已存在: ${dir}`);
  }
});

// 创建基本配置文件
const createConfigFiles = () => {
  // 创建tsconfig.json（如果不存在）
  if (!fs.existsSync(path.join(process.cwd(), 'tsconfig.json'))) {
    try {
      const tsconfig = {
        "compilerOptions": {
          "target": "ES2020",
          "useDefineForClassFields": true,
          "lib": ["ES2020", "DOM", "DOM.Iterable"],
          "module": "ESNext",
          "skipLibCheck": true,
          "moduleResolution": "bundler",
          "allowImportingTsExtensions": true,
          "resolveJsonModule": true,
          "isolatedModules": true,
          "noEmit": true,
          "jsx": "react-jsx",
          "strict": true,
          "noUnusedLocals": true,
          "noUnusedParameters": true,
          "noFallthroughCasesInSwitch": true
        },
        "include": ["src"],
        "references": [{ "path": "./tsconfig.node.json" }]
      };
      
      fs.writeFileSync(
        path.join(process.cwd(), 'tsconfig.json'),
        JSON.stringify(tsconfig, null, 2)
      );
      console.log(`${colors.green}✓${colors.reset} 创建配置文件: tsconfig.json`);
    } catch (error) {
      console.error(`${colors.red}✗ 无法创建tsconfig.json: ${error.message}${colors.reset}`);
    }
  }

  // 创建tsconfig.node.json（如果不存在）
  if (!fs.existsSync(path.join(process.cwd(), 'tsconfig.node.json'))) {
    try {
      const tsconfigNode = {
        "compilerOptions": {
          "composite": true,
          "skipLibCheck": true,
          "module": "ESNext",
          "moduleResolution": "bundler",
          "allowSyntheticDefaultImports": true
        },
        "include": ["vite.config.ts"]
      };
      
      fs.writeFileSync(
        path.join(process.cwd(), 'tsconfig.node.json'),
        JSON.stringify(tsconfigNode, null, 2)
      );
      console.log(`${colors.green}✓${colors.reset} 创建配置文件: tsconfig.node.json`);
    } catch (error) {
      console.error(`${colors.red}✗ 无法创建tsconfig.node.json: ${error.message}${colors.reset}`);
    }
  }

  // 创建vite.config.ts（如果不存在）
  if (!fs.existsSync(path.join(process.cwd(), 'vite.config.ts'))) {
    try {
      const viteConfig = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
`;
      
      fs.writeFileSync(
        path.join(process.cwd(), 'vite.config.ts'),
        viteConfig
      );
      console.log(`${colors.green}✓${colors.reset} 创建配置文件: vite.config.ts`);
    } catch (error) {
      console.error(`${colors.red}✗ 无法创建vite.config.ts: ${error.message}${colors.reset}`);
    }
  }

  // 创建postcss.config.js（如果不存在）
  if (!fs.existsSync(path.join(process.cwd(), 'postcss.config.js'))) {
    try {
      const postcssConfig = `
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
      
      fs.writeFileSync(
        path.join(process.cwd(), 'postcss.config.js'),
        postcssConfig
      );
      console.log(`${colors.green}✓${colors.reset} 创建配置文件: postcss.config.js`);
    } catch (error) {
      console.error(`${colors.red}✗ 无法创建postcss.config.js: ${error.message}${colors.reset}`);
    }
  }

  // 创建tailwind.config.js（如果不存在）
  if (!fs.existsSync(path.join(process.cwd(), 'tailwind.config.js'))) {
    try {
      const tailwindConfig = `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
      
      fs.writeFileSync(
        path.join(process.cwd(), 'tailwind.config.js'),
        tailwindConfig
      );
      console.log(`${colors.green}✓${colors.reset} 创建配置文件: tailwind.config.js`);
    } catch (error) {
      console.error(`${colors.red}✗ 无法创建tailwind.config.js: ${error.message}${colors.reset}`);
    }
  }
};

// 创建配置文件
createConfigFiles();

console.log(`${colors.blue}====================================${colors.reset}`);
console.log(`${colors.green}环境配置完成!${colors.reset}`);
console.log(`${colors.blue}运行开发服务器: ${colors.yellow}npm run dev${colors.reset}`);
console.log(`${colors.blue}构建项目: ${colors.yellow}npm run build${colors.reset}`);
console.log(`${colors.blue}====================================${colors.reset}`); 