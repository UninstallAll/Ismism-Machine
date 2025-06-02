import sys
import os

# Check for required dependencies
try:
    import torch
    from PIL import Image
    import gradio as gr
except ImportError as e:
    print(f"Error: {e}")
    print("\nMissing required dependencies. Please install them with:")
    print("pip install torch Pillow gradio")
    print("pip install git+https://github.com/pharmapsychotic/clip-interrogator.git")
    sys.exit(1)

# Try to import clip_interrogator
try:
    from clip_interrogator import Config, Interrogator
except ImportError:
    print("Error: Could not import clip_interrogator.")
    print("\nPlease install it with:")
    print("pip install git+https://github.com/pharmapsychotic/clip-interrogator.git")
    sys.exit(1)

# Use simplest possible configuration to maximize compatibility
def create_interrogator():
    try:
        # First try without any parameters
        config = Config()
        print("Using default configuration")
        return Interrogator(config)
    except Exception as e:
        print(f"Error with default config: {e}")
        try:
            # If that fails, try with clip_model_name only
            config = Config(clip_model_name="ViT-B/32")
            print("Using ViT-B/32 configuration")
            return Interrogator(config)
        except Exception as e:
            print(f"Failed to create interrogator: {e}")
            return None

# Load the model once at startup
print("Loading CLIP interrogator model...")
interrogator = create_interrogator()
if interrogator is None:
    print("Failed to initialize model. The application will not work correctly.")

# Process function
def process_image(image):
    if interrogator is None:
        return "Error: Model could not be loaded. Please check console for details."
    
    if image is None:
        return "Please upload an image"
    
    try:
        image = Image.fromarray(image) if not isinstance(image, Image.Image) else image
        image = image.convert("RGB")
        prompt = interrogator.interrogate(image)
        return prompt
    except Exception as e:
        error_msg = f"Error processing image: {str(e)}"
        print(error_msg)
        return error_msg

# Simple Gradio interface
with gr.Blocks(title="Simple Prompt Reverse Engineering Tool") as demo:
    gr.Markdown("# Prompt Reverse Engineering Tool")
    gr.Markdown("Upload an image to automatically generate a prompt description.")
    
    with gr.Row():
        with gr.Column():
            input_image = gr.Image(label="Upload Image")
            submit_btn = gr.Button("Generate Prompt", variant="primary")
        
        with gr.Column():
            output_text = gr.Textbox(label="Generated Prompt", lines=10)
    
    submit_btn.click(
        fn=process_image,
        inputs=input_image,
        outputs=output_text
    )
    
    gr.Markdown("## Instructions")
    gr.Markdown("""
    - Upload an image using the panel on the left
    - Click the "Generate Prompt" button
    - The first image processing may take some time as the model needs to load
    - The generated prompt will appear in the text box on the right
    """)

if __name__ == "__main__":
    try:
        # 自动在默认浏览器中打开界面
        demo.launch(share=True, inbrowser=True)
    except Exception as e:
        print(f"Error launching application: {e}")
        input("Press Enter to exit...")
        sys.exit(1) 