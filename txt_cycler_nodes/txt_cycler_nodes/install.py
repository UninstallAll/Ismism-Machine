import os
import shutil
import sys
import argparse

def install_node(comfyui_path=None):
    """
    Install the Prompt Cycler Node to ComfyUI custom_nodes directory
    """
    # Get the directory of this script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # If ComfyUI path is not provided, try to guess it or ask the user
    if not comfyui_path:
        possible_paths = [
            os.path.join(os.path.dirname(current_dir), "ComfyUI"),
            "C:\\ComfyUI",
            os.path.join(os.path.expanduser("~"), "ComfyUI"),
            "/opt/ComfyUI",
            os.path.join(os.path.expanduser("~"), "Documents", "ComfyUI"),
        ]
        
        for path in possible_paths:
            if os.path.exists(path) and os.path.isdir(path):
                comfyui_path = path
                break
        
        if not comfyui_path:
            comfyui_path = input("Please enter the path to your ComfyUI installation: ")
    
    # Validate the ComfyUI path
    if not os.path.exists(comfyui_path):
        print(f"Error: The path {comfyui_path} does not exist.")
        return False
    
    # Check if the custom_nodes directory exists, create it if not
    custom_nodes_path = os.path.join(comfyui_path, "custom_nodes")
    if not os.path.exists(custom_nodes_path):
        os.makedirs(custom_nodes_path)
    
    # Create the target directory
    target_dir = os.path.join(custom_nodes_path, "prompt_cycler")
    if os.path.exists(target_dir):
        print(f"Warning: The directory {target_dir} already exists. Overwriting...")
        shutil.rmtree(target_dir)
    
    os.makedirs(target_dir)
    
    # Copy the necessary files
    files_to_copy = ["prompt_cycler_node.py", "__init__.py", "README.md", "example_prompts.txt"]
    for file in files_to_copy:
        src_file = os.path.join(current_dir, file)
        if os.path.exists(src_file):
            shutil.copy2(src_file, target_dir)
            print(f"Copied {file} to {target_dir}")
        else:
            print(f"Warning: Could not find {file}")
    
    print("\nInstallation complete!")
    print(f"The Prompt Cycler Node has been installed to {target_dir}")
    print("\nPlease restart ComfyUI to use the node.")
    
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Install Prompt Cycler Node for ComfyUI")
    parser.add_argument("--comfyui-path", help="Path to ComfyUI installation")
    args = parser.parse_args()
    
    install_node(args.comfyui_path) 