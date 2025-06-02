# Prompt Reverse Engineering Tool

This is a simple web tool that can reverse-generate prompts from images. The tool automatically selects an appropriate model configuration based on your GPU memory.

## Features

- Minimalist project structure (frontend and backend integrated)
- Automatic GPU memory adaptation
- Intuitive web interface
- One-click deployment

## Installation

1. Clone this repository
   ```
   git clone [repository address]
   cd Prompt-Reverse-Engineering
   ```

2. Install dependencies
   ```
   pip install -r requirements.txt
   ```
   Note: Installation may take some time as it needs to download pre-trained models.

## Usage

1. Run the application
   ```
   python app.py
   ```

2. Visit the displayed URL in your browser (usually http://127.0.0.1:7860)

3. Upload an image and click the "Generate Prompt" button

4. Wait for processing to complete, and the system will display the prompts extracted from the image

## Technical Details

- The tool uses CLIP and BLIP models to understand image content
- Based on available GPU memory, it automatically selects the most appropriate model configuration:
  - 6GB and below VRAM: Uses lightweight model (ViT-B/32 + blip-base)
  - 6-11GB VRAM: Uses medium model (ViT-L/14 + blip-base)
  - Above 11GB VRAM: Uses advanced model (ViT-H/14 + blip-large)
- Frontend built with Gradio, clean and intuitive

## FAQ

**Q: Why is the first image processing so slow?**  
A: The first time an image is processed, the model needs to be loaded into memory, which may take some time. Subsequent processing will be faster.

**Q: Can it run on a computer without a GPU?**  
A: Yes, but processing will be very slow and will use the most lightweight model configuration.

**Q: How can I improve the quality of generated prompts?**  
A: If you have more GPU memory, the system will automatically use more advanced models, providing better results.

## License

[Specify license type] 