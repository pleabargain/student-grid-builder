from flask import Flask, jsonify, render_template, request, send_from_directory
import os
import json
import logging
from logging.handlers import RotatingFileHandler

app = Flask(__name__)

# Setup basic logging
handler = logging.FileHandler('error.log')
handler.setLevel(logging.ERROR)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger = logging.getLogger(__name__)
logger.addHandler(handler)

# Serve static files
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    try:
        return send_from_directory('.', path)
    except Exception as e:
        logger.error(f"Error serving file {path}: {str(e)}")
        return jsonify({"error": "File not found"}), 404

@app.route('/log-error', methods=['POST'])
def log_error():
    try:
        error_message = request.get_data(as_text=True)
        logger.error(error_message)
        return jsonify({"status": "success"}), 200
    except Exception as e:
        logger.error(f"Error logging message: {str(e)}")
        return jsonify({"error": "Failed to log error"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
