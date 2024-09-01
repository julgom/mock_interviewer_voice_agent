from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
from werkzeug.utils import secure_filename
import os
from PyPDF2 import PdfReader

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def input_pdf_text(uploaded_file):
    try:
        reader = PdfReader(uploaded_file)
        text = ""
        for page_num in range(len(reader.pages)):
            page = reader.pages[page_num]
            text += page.extract_text() or ""  # Ensure that None values are handled
        
        return text
    except Exception as e:
        print(f"An error occurred while reading the PDF: {e}")
        return ""

@app.route('/process-file', methods=['POST'])
def process_file():
    if 'file' not in request.files or 'type' not in request.form:
        return jsonify({'error': 'File or type not specified'}), 400

    file = request.files['file']
    file_type = request.form['type']

    if file and file.filename.endswith('.pdf'):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Extract text from the PDF
        text = input_pdf_text(filepath)
        
        # Clean up file
        os.remove(filepath)

        return jsonify({'text': text})

    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(debug=True)
