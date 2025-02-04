# System Patterns

## Architecture Overview

The Student Dialog Builder follows a simple but effective web application architecture:

1. **Server Layer (Flask)**
   - Single endpoint (/) handling GET requests
   - JSON file-based data storage
   - Error logging with rotation
   - Template rendering with Jinja2

2. **Data Layer**
   - JSON Schema validation
   - Structured student profile data
   - File-based persistence

3. **Presentation Layer**
   - Responsive grid layout
   - CSS-based card components
   - Dynamic tag rendering
   - Category-based information grouping

## Key Technical Decisions

### 1. Flask Framework
- **Why**: Lightweight, easy to set up, perfect for single-page applications
- **Benefits**:
  * Simple routing system
  * Built-in template engine
  * Easy error handling
  * Development server included

### 2. JSON Data Storage
- **Why**: Simple, human-readable, schema-validated data format
- **Benefits**:
  * No database setup required
  * Easy to version control
  * Schema enforcement
  * Simple to modify and extend

### 3. CSS Grid Layout
- **Why**: Modern, responsive layout system
- **Benefits**:
  * Automatic responsive behavior
  * Clean, maintainable CSS
  * Flexible card sizing
  * Gap handling built-in

### 4. Error Logging
- **Why**: Centralized error tracking and debugging
- **Implementation**:
  * RotatingFileHandler for log management
  * Structured log format
  * Exception capture and logging

## Data Patterns

### Student Profile Schema
```json
{
  "name": "string",
  "verbs": ["string"],
  "adjectives": ["string"],
  "categories": {
    "character": [{"text": "string", "emoji": "string"}],
    "business": [{"text": "string", "emoji": "string"}],
    "psychology": [{"text": "string", "emoji": "string"}],
    "desires": [{"text": "string", "emoji": "string"}]
  }
}
```

### Category Pattern
Each category follows the pattern:
```json
{
  "text": "Human readable description",
  "emoji": "Visual indicator"
}
```

## UI Patterns

### Card Component
- Consistent padding and spacing
- Box shadow for depth
- Rounded corners
- White background
- Light border

### Tag System
- Pill-shaped design
- Light background
- Flexible wrapping
- Consistent spacing

### Category Display
- Title in bold
- Items in flex container
- Emoji + text combination
- Consistent spacing between items

## Error Handling Pattern

1. Try-Except Block:
```python
try:
    # Operation
except Exception as e:
    logger.error(f"Error message: {str(e)}")
    return error_response
```

2. Log Format:
```
timestamp - name - level - message
```

## Future-Proof Patterns

1. **Extensible Data Schema**
   - Categories can be added/modified
   - New profile attributes can be included
   - Emoji system can be expanded

2. **Responsive Design**
   - Grid adapts to screen size
   - Card components are flexible
   - Text wraps appropriately

3. **Error Management**
   - Centralized logging
   - Structured error responses
   - Debug-friendly messages
