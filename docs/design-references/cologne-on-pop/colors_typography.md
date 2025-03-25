# 色彩与排版参考指南

基于Cologne on Pop GmbH网站的设计风格，以下是我们项目的色彩和排版规范。

## 色彩系统

### 主色调

| 色彩 | Hex值 | 用途 |
|------|-------|------|
| 深蓝黑 | `#0A0E17` | 主背景色，创造深邃感 |
| 靛蓝 | `#1E3A8A` | 次要背景色，用于区域划分 |
| 天蓝 | `#0EA5E9` | 主强调色，用于互动元素和重点内容 |

### 辅助色

| 色彩 | Hex值 | 用途 |
|------|-------|------|
| 紫红 | `#C026D3` | 次要强调色，用于创造视觉冲击 |
| 薄荷绿 | `#10B981` | 成功状态和积极反馈 |
| 珊瑚红 | `#F43F5E` | 警告和错误状态 |

### 中性色调

| 色彩 | Hex值 | 用途 |
|------|-------|------|
| 纯白 | `#FFFFFF` | 文本和前景元素（深色背景上） |
| 浅灰 | `#F1F5F9` | 次要文本和分隔线（深色背景上） |
| 中灰 | `#94A3B8` | 禁用状态和非重点内容 |
| 深灰 | `#334155` | 文本和前景元素（浅色背景上） |

### 渐变色

```
主渐变（从左到右或从上到下）:
#1E3A8A → #0EA5E9  // 蓝色渐变，用于主要按钮和强调区域

次要渐变:
#C026D3 → #0EA5E9  // 紫蓝渐变，用于特殊强调和视觉焦点
```

## 排版系统

### 字体选择

#### 标题字体: Playfair Display
- 用途：主标题、章节标题、重点内容
- 风格：优雅的衬线字体，具有艺术感和历史底蕴
- 权重变体：Regular (400)、Medium (500)、Bold (700)

#### 正文字体: Inter
- 用途：正文内容、导航、按钮、标签
- 风格：现代无衬线字体，可读性强，干净利落
- 权重变体：Light (300)、Regular (400)、Medium (500)、Semi-Bold (600)

### 字体大小

| 元素 | 字体 | 大小（桌面） | 大小（移动） | 行高 | 权重 |
|------|------|------------|------------|------|------|
| 主标题 (h1) | Playfair Display | 4rem (64px) | 2.5rem (40px) | 1.1 | Bold (700) |
| 次级标题 (h2) | Playfair Display | 3rem (48px) | 2rem (32px) | 1.2 | Bold (700) |
| 章节标题 (h3) | Playfair Display | 2rem (32px) | 1.5rem (24px) | 1.3 | Medium (500) |
| 小标题 (h4) | Inter | 1.5rem (24px) | 1.25rem (20px) | 1.4 | Semi-Bold (600) |
| 正文大 | Inter | 1.125rem (18px) | 1rem (16px) | 1.6 | Regular (400) |
| 正文标准 | Inter | 1rem (16px) | 0.875rem (14px) | 1.6 | Regular (400) |
| 辅助文本 | Inter | 0.875rem (14px) | 0.75rem (12px) | 1.5 | Light (300) |
| 按钮文本 | Inter | 1rem (16px) | 0.875rem (14px) | 1 | Medium (500) |
| 导航链接 | Inter | 1rem (16px) | 0.875rem (14px) | 1 | Medium (500) |

### 排版细节

#### 标题处理
- 主标题可以使用更大的字母间距 (tracking: +0.02em)
- 重要标题可以使用小型大写字母 (small-caps) 效果
- 某些标题可以使用线性渐变文本效果

#### 段落设置
- 段落间距: 1.5em
- 最大行宽: 75ch (约为75个字符)，确保可读性
- 首行缩进: 不使用，而是使用段落间距区分
- 对齐方式: 正文使用左对齐，特殊区块可以居中

#### 排版特效
- 强调文本: 使用特殊色彩或背景而非仅使用斜体
- 引用块: 使用大字体、轻量级和独特的行高
- 列表: 使用自定义项目符号，与整体设计风格一致

## 响应式设计考虑

- 在较小屏幕上，减小字体大小但保持比例关系
- 移动设备上增加行高，提高可读性
- 标题在移动设备上可能需要多行显示，确保断行美观
- 确保在所有设备上的最小字体大小不小于12px

## CSS实现示例

```css
/* 导入字体 */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Inter:wght@300;400;500;600&display=swap');

:root {
  /* 颜色变量 */
  --color-background: #0A0E17;
  --color-background-alt: #1E3A8A;
  --color-primary: #0EA5E9;
  --color-secondary: #C026D3;
  --color-success: #10B981;
  --color-danger: #F43F5E;
  --color-white: #FFFFFF;
  --color-light-gray: #F1F5F9;
  --color-mid-gray: #94A3B8;
  --color-dark-gray: #334155;
  
  /* 排版变量 */
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
  --line-height-tight: 1.1;
  --line-height-normal: 1.6;
  --line-height-loose: 2;
}

/* 标题样式 */
h1, h2, h3 {
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--color-white);
  margin-bottom: 0.5em;
}

h1 {
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: var(--line-height-tight);
  letter-spacing: 0.02em;
}

h2 {
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.2;
}

h3 {
  font-size: clamp(1.5rem, 3vw, 2rem);
  line-height: 1.3;
  font-weight: 500;
}

/* 正文样式 */
body {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: 1rem;
  line-height: var(--line-height-normal);
  color: var(--color-white);
  background-color: var(--color-background);
}

p {
  margin-bottom: 1.5em;
  max-width: 75ch;
}

/* 按钮样式 */
.btn {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 1rem;
  padding: 0.75em 1.5em;
  border-radius: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(90deg, var(--color-background-alt), var(--color-primary));
  color: var(--color-white);
  border: none;
}
```

通过遵循这个色彩和排版系统，我们可以确保项目具有一致、专业和视觉吸引力的设计，同时保持与Cologne on Pop GmbH设计风格的一致性。 