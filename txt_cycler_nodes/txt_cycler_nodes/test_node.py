import os
import sys
from wildcard_prompt_cycler_node import WildcardPromptCyclerNode

def test_node():
    """Test the WildcardPromptCyclerNode functionality"""
    # Create a test instance
    node = WildcardPromptCyclerNode()
    
    # Get current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Create a test file if it doesn't exist
    test_file_path = os.path.join(current_dir, "test_prompts.txt")
    wildcards_dir = os.path.join(current_dir, "wildcards")
    
    # Create test wildcards directory if it doesn't exist
    if not os.path.exists(wildcards_dir):
        os.makedirs(wildcards_dir)
    
    # Create a test wildcard file
    test_wildcard_path = os.path.join(wildcards_dir, "test.txt")
    with open(test_wildcard_path, "w", encoding="utf-8") as f:
        f.write("Test wildcard 1\nTest wildcard 2\nTest wildcard 3")
    
    # Create a test prompts file
    with open(test_file_path, "w", encoding="utf-8") as f:
        f.write("Test prompt 1\nTest prompt with $test$ wildcard\nTest prompt 3")
    
    # Test the node
    result = node.process(
        text_file=test_file_path,
        uses_per_prompt=1,
        enable_loop=True,
        reset_counter=False,
        wildcards_dir=wildcards_dir,
        seed=42
    )
    
    # Print the result
    print("Node output:", result)
    print("Output type:", type(result))
    print("Output length:", len(result))
    print("Output content type:", type(result[0]))
    print("Output content:", repr(result[0]))
    
    # Clean up test files
    os.remove(test_file_path)
    os.remove(test_wildcard_path)
    if os.path.exists(wildcards_dir) and len(os.listdir(wildcards_dir)) == 0:
        os.rmdir(wildcards_dir)

if __name__ == "__main__":
    test_node() 