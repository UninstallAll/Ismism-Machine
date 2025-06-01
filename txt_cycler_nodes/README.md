# Prompt Cycler Node for ComfyUI

这个ComfyUI节点可以按行读取文本文件中的提示词，并按照设定的使用次数自动切换。

## 功能特点

1. 按照分段读取输入txt文件，每一行作为单独的提示词
2. 自动切换：用过一行提示词后，按照设定的使用次数切换到下一行提示词输入
3. 显示剩余使用次数：在使用过程中会逐渐递减显示剩余使用次数
4. 可选循环模式：当读完所有提示词后，可以选择是否重新从第一个提示词开始

## 安装方法

1. 将`txt_cycler_nodes`文件夹复制到ComfyUI的`custom_nodes`目录下
2. 重启ComfyUI

## 使用方法

1. 在ComfyUI中，从节点菜单中选择"prompt"类别，找到"Prompt Cycler"节点
2. 设置以下参数：
   - `text_file`: 提示词文本文件的路径
   - `uses_per_prompt`: 每个提示词使用的次数
   - `enable_loop`: 是否启用循环模式（读完所有提示词后重新开始）
   - `show_status_in_prompt`: 是否在提示词中显示状态信息（行号和剩余使用次数）

## 提示词文件格式

提示词文件中的每一行将被视为一个单独的提示词，例如：

```
第一个提示词
第二个提示词
第三个提示词
```

空行会被自动忽略。

## 输出

节点有三个输出：
- `prompt`: 当前的提示词文本
- `remaining_uses`: 当前提示词剩余的使用次数
- `current_line`: 当前正在使用的提示词行号

## 显示剩余使用次数

有两种方式可以显示剩余使用次数和当前行号：

1. **在提示词中显示**：启用`show_status_in_prompt`选项，状态信息将直接添加到提示词前面，格式为`[Line: 当前行/总行数 | Uses: 剩余次数/总次数]`

2. **使用显示节点**：使用"Prompt Cycler Display"节点，将Prompt Cycler的`remaining_uses`和`current_line`输出连接到显示节点的输入，并设置总行数和总使用次数。

## 示例工作流

### 基本用法
将Prompt Cycler节点的`prompt`输出连接到KSampler的提示词输入，这样每次生成图像时都会按照设定自动切换提示词。

### 显示状态信息
1. 将Prompt Cycler的`remaining_uses`和`current_line`输出连接到Prompt Cycler Display节点
2. 设置总行数和总使用次数
3. 使用Text节点显示状态信息 