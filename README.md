# Student Dialog Builder

A dynamic web application that creates engaging student profiles with unique descriptive words and character traits. The system combines a web interface for displaying student cards with a powerful Python-based character generation system using Ollama's llama3.2 model.

## Key Components

- **Web Interface**: Interactive grid of student cards with randomly assigned attributes
- **Character Generator**: Python-based system using Ollama and Pydantic for generating rich character profiles
- **Data Validation**: Robust JSON schema validation using Pydantic models
- **Error Handling**: Comprehensive logging system with file rotation

## Character Generation

The system uses a Python-based character generator (`charactergen.py`) with several key features:

- **Ollama Integration**: Uses llama3.2 model for generating rich character profiles
  > Note: Due to a current limitation, Anthropic's Claude may reference llama2 instead of llama3.2 in conversations, but the system uses llama3.2
- **Pydantic Models**: Ensures strict JSON validation and type safety
- **Structured Output**: Generates detailed character profiles including:
  - Name
  - Action verbs
  - Personality adjectives
  - Categorized traits with emojis
- **Error Handling**: Comprehensive error tracking with rotated log files
- **Retry Logic**: Implements exponential backoff for failed requests

## Web Interface Features

- **Dynamic Student Cards**: Create cards for students with automatically assigned unique verbs and adjectives
- **Interactive Grid Layout**: Responsive grid design that adapts to different screen sizes
- **Data Persistence**: Student data is automatically saved in the browser's localStorage
- **JSON Import/Export**:
  - View current student data in JSON format
  - Import student data from JSON files
  - Export functionality through JSON view
- **Delete Functionality**: Remove student cards with a smooth fade-out animation

## File Structure

- **Frontend**:
  - `index.html`: Main web interface
  - `style.css`: Responsive grid layout and card styling
  - `app.js`: Client-side logic for card management
- **Backend**:
  - `charactergen.py`: Ollama-based character generation system
  - `server.py`: Web server for handling requests
- **Data**:
  - `schema-students.json`: JSON schema for student data
  - `students.json`: Current student data
  - Generated files: `characters_[timestamp].json`
- **Logs**:
  - `charactergen.log`: Main application logs
  - `error.log`: Detailed error tracking

## Setup

1. Clone this repository or download the files
2. Install Python dependencies:
   ```bash
   pip install -U ollama pydantic
   ```
3. Ensure Ollama is installed and running with llama3.2 model
4. For the web interface, use any local server:

   Using Python:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   Using Node.js (first install `http-server` globally):
   ```bash
   npm install -g http-server
   http-server
   ```

   Using PHP:
   ```bash
   php -S localhost:8000
   ```

5. Open your browser and navigate to `http://localhost:8000`

## Usage

### Generating Characters
1. Run the character generator:
   ```bash
   python charactergen.py
   ```
2. Enter the number of characters to generate
3. Generated profiles will be saved to `characters_[timestamp].json`

### Adding Students
1. Enter a student name in the input field
2. Click "Add Student" or press Enter
3. A new card will be created with:
   - Student's name
   - 5 randomly assigned unique verbs
   - 5 randomly assigned unique adjectives

### Importing Student Data
1. Click "Load JSON" button
2. Select a JSON file with the following structure:
```json
{
  "students": [
    {
      "name": "John Smith",
      "verbs": ["reading", "writing", "coding", "learning", "exploring"],
      "adjectives": ["creative", "analytical", "dedicated", "innovative", "resourceful"]
    }
  ]
}
```

### Viewing JSON Data
1. Click "View JSON" button to see the current student data in JSON format
2. Copy the displayed JSON for backup or export purposes

### Removing Students
- Click the "×" button in the top-right corner of any student card
- The card will fade out and be removed from storage

## Data Structure

The application supports two JSON formats:

### Basic Student Format
```json
{
  "students": [
    {
      "name": "Student Name",
      "verbs": ["verb1", "verb2", "verb3", "verb4", "verb5"],
      "adjectives": ["adj1", "adj2", "adj3", "adj4", "adj5"]
    }
  ]
}
```

### Extended Character Format
```json
{
  "name": "Full Name",
  "verbs": ["action1", "action2", "action3"],
  "adjectives": ["trait1", "trait2", "trait3"],
  "categories": {
    "character": [
      {"text": "trait", "emoji": "🌟"},
      {"text": "trait", "emoji": "💫"}
    ],
    "business": [
      {"text": "skill", "emoji": "💼"},
      {"text": "skill", "emoji": "📊"}
    ],
    "psychology": [
      {"text": "trait", "emoji": "🧠"},
      {"text": "trait", "emoji": "💭"}
    ],
    "desires": [
      {"text": "goal", "emoji": "🎯"},
      {"text": "goal", "emoji": "✨"}
    ]
  }
}
```

## Technical Details

- Frontend: Vanilla JavaScript with CSS Grid
- Backend: Python with Ollama and Pydantic
- Data Validation: JSON Schema enforcement
- Storage: localStorage + JSON files
- Logging: Rotating file logs with detailed error tracking
