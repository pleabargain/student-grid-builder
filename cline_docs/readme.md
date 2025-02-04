# Student Dialog Builder Documentation

## Project Overview
The Student Dialog Builder is a web application that manages and displays student profiles with rich metadata including actions (verbs), characteristics (adjectives), and categorized traits with emoji indicators. The system uses a Flask backend to serve student data through a responsive grid-based interface.

## System Architecture

```mermaid
graph TD
    A[Client Browser] -->|HTTP Request| B[Flask Server]
    B -->|Read| C[students.json]
    B -->|Validate Against| D[schema-students.json]
    B -->|Render| E[index.html template]
    E -->|Response| A
```

## Key User Workflows

```mermaid
graph TD
    A[Start] -->|Access / Route| B[Flask Server]
    B -->|Load Student Data| C{Data Load Success?}
    C -->|Yes| D[Render Template]
    C -->|No| E[Return Error Response]
    D -->|Display| F[Student Grid]
    F -->|For Each Student| G[Display Profile Card]
    G -->|Show| H[Name & Tags]
    G -->|Show| I[Categorized Traits]
```

## Data Flow

```mermaid
graph TD
    A[students.json] -->|JSON Data| B[Flask Server]
    C[schema-students.json] -->|Validation Schema| B
    B -->|Jinja2 Template| D[index.html]
    D -->|Rendered HTML| E[Browser Display]
    E -->|Grid Layout| F[Student Cards]
    F -->|Display| G[Name/Tags]
    F -->|Display| H[Categories]
    H -->|Show| I[Character]
    H -->|Show| J[Business]
    H -->|Show| K[Psychology]
    H -->|Show| L[Desires]
```

## Setup Instructions

1. Prerequisites:
   - Python 3.x
   - Flask

2. Installation:
   ```bash
   pip install flask
   ```

3. Running the Application:
   ```bash
   python server.py
   ```

4. Access the application:
   - Open a browser and navigate to `http://localhost:5000`

## Project Structure
```
student-dialog-builder/
├── server.py              # Flask application server
├── schema-students.json   # JSON schema for data validation
├── students.json          # Student data
├── templates/
│   └── index.html        # HTML template for student grid
└── error.log             # Application error logs
```

## Error Handling
- All errors are logged to error.log
- Log format: `timestamp - name - level - message`
- Errors include stack traces and context
