import os
import sys

def validate_node():
    """
    验证节点的定义和输出是否符合 ComfyUI 的要求
    """
    # 导入节点类
    from wildcard_prompt_cycler_node import WildcardPromptCyclerNode
    
    # 验证节点定义
    print("节点定义验证：")
    print(f"RETURN_TYPES: {WildcardPromptCyclerNode.RETURN_TYPES}")
    print(f"RETURN_TYPES 类型: {type(WildcardPromptCyclerNode.RETURN_TYPES)}")
    print(f"RETURN_NAMES: {WildcardPromptCyclerNode.RETURN_NAMES}")
    print(f"RETURN_NAMES 类型: {type(WildcardPromptCyclerNode.RETURN_NAMES)}")
    print(f"FUNCTION: {WildcardPromptCyclerNode.FUNCTION}")
    print(f"CATEGORY: {WildcardPromptCyclerNode.CATEGORY}")
    
    # 创建节点实例
    node = WildcardPromptCyclerNode()
    
    # 设置测试参数
    test_file = "test_prompts.txt"
    with open(test_file, "w", encoding="utf-8") as f:
        f.write("Test prompt 1\nTest prompt 2\nTest prompt 3")
    
    # 调用 process 方法
    result = node.process(
        text_file=test_file,
        uses_per_prompt=1,
        enable_loop=True,
        reset_counter=False,
        wildcards_dir="wildcards",
        seed=42
    )
    
    # 验证返回值
    print("\n节点输出验证：")
    print(f"结果: {result}")
    print(f"结果类型: {type(result)}")
    print(f"结果长度: {len(result)}")
    print(f"第一个元素: {result[0]}")
    print(f"第一个元素类型: {type(result[0])}")
    
    # 清理测试文件
    os.remove(test_file)

if __name__ == "__main__":
    validate_node() 