# Prompt Cycler Node for ComfyUI

这个ComfyUI节点可以按行读取文本文件中的提示词，并按照设定的使用次数自动切换。

## 功能特点

1. 按照分段读取输入txt文件，每一行作为单独的提示词
2. 自动切换：用过一行提示词后，按照设定的使用次数切换到下一行提示词输入
3. 直接在提示词中显示剩余使用次数倒计时
4. 可选循环模式：当读完所有提示词后，可以选择是否重新从第一个提示词开始
5. 可以连接VAE解码器输出，在图像生成完成后自动减少使用次数

## 安装方法

1. 将`txt_cycler_nodes`文件夹复制到ComfyUI的`custom_nodes`目录下
2. 重启ComfyUI

## 使用方法

1. 在ComfyUI中，从节点菜单中选择"prompt"类别，找到"Prompt Cycler"节点
2. 设置以下参数：
   - `text_file`: 提示词文本文件的路径
   - `uses_per_prompt`: 每个提示词使用的次数
   - `enable_loop`: 是否启用循环模式（读完所有提示词后重新开始）
   - `reset_counter`: 是否重置计数器（重新从第一个提示词开始）

## 提示词文件格式

提示词文件中的每一行将被视为一个单独的提示词，例如：

```
第一个提示词
第二个提示词
第三个提示词
```

空行会被自动忽略。

## 剩余使用次数倒计时显示

节点会直接在提示词后面显示剩余使用次数和当前行号，格式为：
```
提示词内容 [Line: 当前行/总行数 | Remaining: 剩余次数/总次数]
```

这样你可以直接看到当前使用的是哪一行提示词，以及还剩多少次使用次数。

## 与VAE解码器连接

要实现图像生成完成后自动减少使用次数，可以使用"Prompt Cycler Trigger"节点：

1. 将VAE解码器的图像输出连接到"Prompt Cycler Trigger"节点的`images`输入
2. 将"Prompt Cycler Trigger"节点的`trigger`输出连接到"Prompt Cycler"节点的`trigger_next`输入
3. 每当有图像通过VAE解码器生成完成，使用次数就会自动减少1

## 示例工作流

### 基本用法
将Prompt Cycler节点的`prompt`输出连接到KSampler的提示词输入，这样每次生成图像时都会按照设定自动切换提示词。

### 自动减少使用次数
1. 将VAE解码器的图像输出连接到Prompt Cycler Trigger节点
2. 将Prompt Cycler Trigger的trigger输出连接到Prompt Cycler的trigger_next输入
3. 这样每生成一张图像，使用次数就会自动减少1，当使用次数减少到0时，会自动切换到下一行提示词 