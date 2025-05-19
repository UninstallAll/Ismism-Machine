# 艺术主义数据库

这个本地测试数据库包含时间轴上所有艺术主义的信息和图片资源。

## 文件结构

- `artStyles.json` - 包含所有艺术主义的详细信息，包括标题、年份、描述、艺术家等
- `connections.json` - 包含艺术主义之间的关系和影响
- `imageSearchUrls.json` - 示例图片URL，可用于下载或显示艺术作品
- `images/` - 按艺术风格组织的图片文件夹
  - `impressionism/` - 印象派艺术作品图片
  - `cubism/` - 立体主义艺术作品图片
  - `surrealism/` - 超现实主义艺术作品图片
  - 等等...

## 如何使用

### 添加图片

对于每个艺术主义，你可以在对应的文件夹中添加相关的图片:

1. 导航到相应的文件夹，例如 `images/impressionism/`
2. 将图片保存为 `[艺术家名]_[作品名].jpg` 格式

### 使用数据

你可以通过以下方式使用此数据:

```javascript
// 读取艺术风格数据
const artStyles = require('./data/artStyles.json');

// 读取连接数据
const connections = require('./data/connections.json');

// 显示特定风格信息
const impressionism = artStyles.find(style => style.id === 'impressionism');
console.log(impressionism.title);  // 输出: 印象派
```

## 数据格式

### 艺术风格对象

```json
{
  "id": "cubism",
  "title": "立体主义",
  "year": 1907,
  "description": "将对象分解为几何形状，从多个角度同时表现",
  "artists": ["毕加索", "布拉克"],
  "styleMovement": "cubism",
  "influences": ["塞尚", "非洲艺术"],
  "influencedBy": ["印象派"],
  "tags": ["立体主义", "法国", "20世纪初"]
}
```

### 连接对象

```json
{
  "source": "impressionism",
  "target": "cubism",
  "type": "influence"
}
```

## 搜索和扩展

你可以通过替换 `imageSearchUrls.json` 中的示例URL来添加真实的图片链接，然后使用脚本下载这些图片到对应文件夹。 