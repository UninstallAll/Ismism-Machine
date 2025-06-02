#!/bin/bash
echo "Starting Prompt Reverse Engineering Tool..."

# Check if dependencies are already installed
if [ ! -d "venv" ]; then
    echo "First run, creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "Installing dependencies, this may take a few minutes..."
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Start the application
python app.py 