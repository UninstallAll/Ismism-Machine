import sys
import os
import time

# Check for required dependencies
try:
    import torch
    from PIL import Image
    import gradio as gr
except ImportError as e:
    print(f"Error: {e}")
    print("\nMissing required dependencies. Please install them with:")
    print("pip install torch Pillow gradio transformers timm")
    print("pip install git+https://github.com/pharmapsychotic/clip-interrogator.git")
    print("\nOr run the start.bat script which will handle the installation automatically.")
    sys.exit(1)

# Try to import clip_interrogator, which might fail even if other dependencies are installed
try:
    from clip_interrogator import Config, Interrogator
    # Check clip_interrogator version and available parameters
    import inspect
    config_params = inspect.signature(Config.__init__).parameters
    print(f"Available Config parameters: {list(config_params.keys())}")
    HAS_BLIP_MODEL_PARAM = 'blip_model' in config_params
    print(f"Has 'blip_model' parameter: {HAS_BLIP_MODEL_PARAM}")
except ImportError:
    print("Error: Could not import clip_interrogator.")
    print("\nPlease install it with:")
    print("pip install git+https://github.com/pharmapsychotic/clip-interrogator.git")
    print("\nOr run the start.bat script which will handle the installation automatically.")
    sys.exit(1)

# Model configurations - adapted for different versions of clip-interrogator
def get_config(clip_model_name):
    try:
        if HAS_BLIP_MODEL_PARAM:
            # Old version with blip_model parameter
            if clip_model_name == "ViT-H/14":
                return Config(clip_model_name=clip_model_name, blip_model="blip-large")
            else:
                return Config(clip_model_name=clip_model_name, blip_model="blip-base")
        else:
            # New version without blip_model parameter
            return Config(clip_model_name=clip_model_name)
    except Exception as e:
        print(f"Error creating config with {clip_model_name}: {e}")
        # Try bare minimum config
        return Config()

MODEL_CONFIGS = {
    "lightweight": {
        "description": "Lightweight (6GB VRAM - ViT-B/32)",
        "config": lambda: get_config("ViT-B/32")
    },
    "medium": {
        "description": "Medium (11GB VRAM - ViT-L/14)",
        "config": lambda: get_config("ViT-L/14")
    },
    "advanced": {
        "description": "Advanced (24GB+ VRAM - ViT-H/14)",
        "config": lambda: get_config("ViT-H/14")
    }
}

# GPU Memory Detection
def detect_gpu_memory():
    if torch.cuda.is_available():
        try:
            vram = torch.cuda.get_device_properties(0).total_memory / 1024**3
            print(f"Detected GPU Memory: {vram:.2f}GB")
            if vram <= 6:
                return "lightweight"
            elif vram <= 11:
                return "medium"
            else:
                return "advanced"
        except Exception as e:
            print(f"Error detecting GPU memory: {e}")
    
    print("No GPU detected or unable to determine memory, recommending lightweight configuration")
    return "lightweight"

# Delayed model loading to avoid using large amounts of memory at startup
interrogator = None
current_model_type = None

# Function to load model based on selected configuration
def load_model(model_type):
    global interrogator, current_model_type
    
    # If model is already loaded with the same config, don't reload
    if interrogator is not None and current_model_type == model_type:
        return True
    
    # If a different model was loaded before, clear it to free memory
    if interrogator is not None:
        del interrogator
        torch.cuda.empty_cache()
        interrogator = None
    
    try:
        print(f"Loading {model_type} model configuration...")
        config = MODEL_CONFIGS[model_type]["config"]()
        interrogator = Interrogator(config)
        current_model_type = model_type
        print("Model loading complete")
        return True
    except Exception as e:
        error_msg = f"Error loading model: {str(e)}"
        print(error_msg)
        return False

# Process a single image
def process_single_image(image, model_type):
    if image is None:
        return "Please upload an image"
    
    # Load model if needed
    if not load_model(model_type):
        return "Failed to load model. Try using a lighter model configuration."
    
    try:
        image = image.convert("RGB")
        prompt = interrogator.interrogate(image)
        return prompt
    except Exception as e:
        error_msg = f"Error processing image: {str(e)}"
        print(error_msg)
        return error_msg

# Process batch of images
def process_batch_images(images, model_type, progress=gr.Progress()):
    if not images:
        return "Please upload at least one image"
    
    # Load model if needed
    if not load_model(model_type):
        return "Failed to load model. Try using a lighter model configuration."
    
    results = []
    for i, image in enumerate(progress.tqdm(images)):
        try:
            image_pil = Image.fromarray(image)
            prompt = interrogator.interrogate(image_pil)
            results.append(f"Image {i+1}:\n{prompt}\n\n")
        except Exception as e:
            results.append(f"Image {i+1}: Error processing image: {str(e)}\n\n")
    
    return "".join(results)

# Gradio Frontend
def create_interface():
    # Detect GPU and recommended config on startup
    recommended_config = detect_gpu_memory()
    
    with gr.Blocks(title="Prompt Reverse Engineering Tool") as demo:
        gr.Markdown("# Prompt Reverse Engineering Tool")
        gr.Markdown("Upload images to automatically recognize and generate prompts.")
        
        with gr.Tabs():
            with gr.TabItem("Single Image"):
                with gr.Row():
                    with gr.Column():
                        input_image = gr.Image(type="pil", label="Upload Image")
                        model_dropdown = gr.Dropdown(
                            choices=[config["description"] for config in MODEL_CONFIGS.values()],
                            value=MODEL_CONFIGS[recommended_config]["description"],
                            label="Model Configuration"
                        )
                        submit_btn = gr.Button("Generate Prompt", variant="primary")
                    
                    with gr.Column():
                        output_text = gr.Textbox(label="Generated Prompt", lines=10)
                
                # Map dropdown descriptions back to config keys
                def get_config_key(description):
                    for key, config in MODEL_CONFIGS.items():
                        if config["description"] == description:
                            return key
                    return "lightweight"  # Default fallback
                
                submit_btn.click(
                    fn=lambda img, model_desc: process_single_image(img, get_config_key(model_desc)),
                    inputs=[input_image, model_dropdown],
                    outputs=output_text
                )
            
            with gr.TabItem("Batch Processing"):
                with gr.Row():
                    with gr.Column():
                        input_images = gr.Gallery(label="Uploaded Images")
                        upload_button = gr.UploadButton("Upload Images", file_count="multiple", file_types=["image"])
                        batch_model_dropdown = gr.Dropdown(
                            choices=[config["description"] for config in MODEL_CONFIGS.values()],
                            value=MODEL_CONFIGS[recommended_config]["description"],
                            label="Model Configuration"
                        )
                        batch_submit_btn = gr.Button("Process All Images", variant="primary")
                    
                    with gr.Column():
                        batch_output = gr.Textbox(label="Generated Prompts", lines=20)
                
                def upload_files(files):
                    file_paths = [file.name for file in files]
                    return [file.name for file in files]
                
                upload_button.upload(
                    fn=lambda files: [file for file in files],
                    inputs=upload_button,
                    outputs=input_images
                )
                
                batch_submit_btn.click(
                    fn=lambda imgs, model_desc: process_batch_images(imgs, get_config_key(model_desc)),
                    inputs=[input_images, batch_model_dropdown],
                    outputs=batch_output
                )
        
        gr.Markdown("## Instructions")
        gr.Markdown("""
        - Select a model configuration based on your GPU memory:
          - Lightweight: For systems with 6GB VRAM or less
          - Medium: For systems with 11GB VRAM or less
          - Advanced: For systems with 24GB+ VRAM
        - The first image processing may take some time as the model needs to load
        - Batch processing allows you to upload and process multiple images at once
        """)
    
    return demo

if __name__ == "__main__":
    try:
        demo = create_interface()
        # 自动在默认浏览器中打开界面
        demo.launch(share=True, inbrowser=True)
    except Exception as e:
        print(f"Error launching application: {e}")
        input("Press Enter to exit...")
        sys.exit(1) 