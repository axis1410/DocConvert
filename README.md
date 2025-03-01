# Unicode Text Converter

This Python script converts regular text in a Word document to similar-looking Unicode characters while preserving all document formatting.

## Features

- Preserves document formatting (fonts, styles, tables, etc.)
- Shows which words were changed during conversion
- Automatically handles existing output files
- Maintains case sensitivity

## Requirements

- Python 3.x
- python-docx
- pypandoc

## Installation

1. Install Python from [python.org](https://www.python.org/downloads/)

   - Make sure to check "Add Python to PATH" during installation
2. Install pandoc from 
3. Install required packages:

```bash
pipinstallpython-docxpypandoc
```


## Usage

1. Place your Word document in the same folder as the script
2. Rename your document to `ADR Environment.docx` or modify the `input_file` name in the script
3. Run the script:

```
python convert.py
```
