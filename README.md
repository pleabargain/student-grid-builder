# Student Grid Builder

# repo
https://github.com/pleabargain/student-grid-builder


# motivation
Keep language fresh and interesting for students. Lots of verbs and adjectives in the javascript. You can add more verbs and adjectives to the javascript file if you like. There's probably a way to make this more dynamic but it works and that's all that matters at this point.

A dynamic web application that creates a visual grid of student cards, each featuring randomly assigned verbs and adjectives. The application helps create engaging student profiles with unique descriptive words while ensuring no repetition in the assigned attributes.

## Features

- **Dynamic Student Cards**: Create cards for students with automatically assigned unique verbs and adjectives
- **Interactive Grid Layout**: Responsive grid design that adapts to different screen sizes
- **Data Persistence**: Student data is automatically saved in the browser's localStorage
- **JSON Import/Export**:
  - View current student data in JSON format
  - Import student data from JSON files
  - Export functionality through JSON view
- **Word Uniqueness**: Ensures no repetition in assigned verbs and adjectives across student cards
- **Delete Functionality**: Remove student cards with a smooth fade-out animation

## Setup

1. Clone this repository or download the files
2. No build process required - this is a vanilla JavaScript application
3. To serve the files, you can use any local server. Here are some options:

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

4. Open your browser and navigate to `http://localhost:8000`

## Usage

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

The application expects JSON data in the following format:

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

- If verbs or adjectives are not provided in the JSON, they will be randomly generated
- The application validates JSON data on import and ensures proper structure

## Technical Details

- Built with vanilla JavaScript - no frameworks required
- Uses CSS Grid for responsive layout
- Implements localStorage for data persistence
- Features smooth animations for card removal
- Includes error handling for JSON import/export
