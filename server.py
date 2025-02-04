from flask import Flask, jsonify, render_template
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

@app.route('/')
def index():
    try:
        with open('students.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return render_template('index.html', students=data['students'])
    except Exception as e:
        logger.error(f"Error loading student data: {str(e)}")
        return jsonify({"error": "Failed to load student data"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
