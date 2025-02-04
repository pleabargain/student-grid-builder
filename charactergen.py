"""
Character Generator using llama3.2 model
- Uses Ollama Python package to generate character profiles
- Uses Pydantic for data validation
- Includes error handling and validation
- Supports logging with rotation
- Requires: pip install -U ollama pydantic
"""


import json
import datetime
import re
import traceback
from typing import Dict, List, Optional, Tuple
import sys
import logging
from logging.handlers import TimedRotatingFileHandler
import time
import os
from ollama import chat
from pydantic import BaseModel

# Pydantic models for character structure
class CategoryItem(BaseModel):
    text: str
    emoji: str

class Categories(BaseModel):
    character: list[CategoryItem]
    business: list[CategoryItem]
    psychology: list[CategoryItem]
    desires: list[CategoryItem]

class Character(BaseModel):
    name: str
    verbs: list[str]
    adjectives: list[str]
    categories: Categories

class CharacterGenError(Exception):
    """Base exception class for character generation errors"""
    def __init__(self, message: str, error_type: str = "GENERAL_ERROR"):
        self.message = message
        self.error_type = error_type
        super().__init__(self.message)

class APIError(CharacterGenError):
    """Exception raised for API-related errors"""
    def __init__(self, message: str, status_code: Optional[int] = None):
        error_type = f"API_ERROR_{status_code}" if status_code else "API_ERROR"
        super().__init__(message, error_type)
        self.status_code = status_code

class JSONError(CharacterGenError):
    """Exception raised for JSON processing errors"""
    def __init__(self, message: str):
        super().__init__(message, "JSON_ERROR")

class ValidationError(CharacterGenError):
    """Exception raised for character validation errors"""
    def __init__(self, message: str):
        super().__init__(message, "VALIDATION_ERROR")

def setup_logging():
    """Configure logging with enhanced error tracking and rotation"""
    logger = logging.getLogger('charactergen')
    logger.setLevel(logging.DEBUG)
    
    # Create formatters
    file_formatter = logging.Formatter(
        '[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s\n'
        'Context: %(pathname)s:%(lineno)d\n'
        '%(stack_info)s\n'
        '---'
    )
    console_formatter = logging.Formatter('%(message)s')
    
    # Error log handler (time-based rotation)
    error_handler = TimedRotatingFileHandler(
        'error.log',
        when='midnight',
        interval=1,
        backupCount=30,
        encoding='utf-8'
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(file_formatter)
    
    # Main log handler
    file_handler = TimedRotatingFileHandler(
        'charactergen.log',
        when='midnight',
        interval=1,
        backupCount=7,
        encoding='utf-8'
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(file_formatter)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(console_formatter)
    
    # Add handlers to logger
    logger.addHandler(error_handler)
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

logger = setup_logging()

def extract_json_from_response(text: str) -> Tuple[str, bool]:
    """Extract JSON content from a formatted response with improved handling
    
    Args:
        text (str): Raw response text
        
    Returns:
        Tuple[str, bool]: Extracted JSON string and success flag
        
    Raises:
        JSONError: If JSON extraction fails
    """
    # Try to find JSON content between triple backticks with json tag
    json_match = re.search(r'```json\s*(\{[\s\S]*?\})\s*```', text, re.DOTALL)
    if json_match:
        return json_match.group(1), True
        
    # Try to find JSON content between triple backticks without json tag
    json_match = re.search(r'```\s*(\{[\s\S]*?\})\s*```', text, re.DOTALL)
    if json_match:
        return json_match.group(1), True
        
    # Try to find a standalone JSON object
    json_match = re.search(r'(\{[\s\S]*?\})', text, re.DOTALL)
    if json_match:
        json_str = json_match.group(1)
        # Validate it's actually JSON
        try:
            json.loads(json_str)
            return json_str, True
        except json.JSONDecodeError:
            pass
            
    raise JSONError("Could not extract valid JSON content from response")

def generate_character(system_prompt: str, max_retries: int = 3) -> Dict:
    """Generate a character using Ollama chat with enhanced error handling
    
    Args:
        system_prompt (str): Additional prompt instructions
        max_retries (int): Maximum number of retry attempts
        
    Returns:
        Dict: Generated character data in dictionary format
        
    Raises:
        APIError: If API connection or response is invalid
        JSONError: If JSON processing fails
        ValidationError: If character data is invalid
    """
    retry_count = 0
    last_error = None
    
    while retry_count < max_retries:
        try:
            start_time = time.time()
            logger.debug(f"Attempt {retry_count + 1}/{max_retries}: Sending request to Ollama")
            
            # Use ollama.chat() with Pydantic model schema
            response = chat(
                messages=[
                    {
                        'role': 'user',
                        'content': (
                            "Generate a character profile with the following traits:\n"
                            f"{system_prompt}"
                        )
                    }
                ],
                model='llama3.2',
                format=Character.model_json_schema()
            )
            
            # Log API performance
            elapsed = time.time() - start_time
            logger.debug(f"API request completed in {elapsed:.2f} seconds")
            
            # Log the raw response for debugging
            logger.debug(f"Raw API response: {response.message.content}")
            
            try:
                # Use Pydantic to validate the response
                character_data = Character.model_validate_json(response.message.content).model_dump()
                return character_data
                
            except Exception as e:
                raise ValidationError(f"Invalid character data structure: {str(e)}")
            
        except Exception as e:
            last_error = e
            retry_count += 1
            if retry_count < max_retries:
                wait_time = 2 ** retry_count  # Exponential backoff
                logger.warning(
                    f"Error on attempt {retry_count}: {str(e)}. "
                    f"Retrying in {wait_time} seconds..."
                )
                time.sleep(wait_time)
            else:
                logger.error(
                    f"Failed after {max_retries} attempts: {str(e)}",
                    exc_info=True,
                    stack_info=True
                )
                if "connection" in str(e).lower():
                    raise APIError(f"Connection error: {str(e)}")
                else:
                    raise CharacterGenError(f"Failed to generate character: {str(e)}")


def validate_character(character: Dict) -> bool:
    """Validate the character JSON structure using Pydantic
    
    Args:
        character (Dict): Character data to validate
        
    Returns:
        bool: True if valid
        
    Raises:
        ValidationError: If validation fails
    """
    try:
        # Use Pydantic model to validate the character data
        Character.model_validate(character)
        return True
        
    except ValidationError as e:
        logger.error(
            f"Character validation error: {str(e)}",
            exc_info=True,
            stack_info=True
        )
        raise
        
    except Exception as e:
        logger.error(
            f"Unexpected error during validation: {str(e)}",
            exc_info=True,
            stack_info=True
        )
        raise ValidationError(f"Validation failed: {str(e)}")

def main():
    """Main function to run the character generator with enhanced error handling"""
    start_time = time.time()
    process_id = os.getpid()
    logger.info(f"Starting character generation process (PID: {process_id})")
    
    try:
        # Get number of characters to generate
        while True:
            try:
                num_characters = int(input("How many characters would you like to generate? "))
                if num_characters > 0:
                    break
                logger.warning(
                    f"User entered invalid number: {num_characters}",
                    extra={'user_input': num_characters}
                )
                print("Please enter a positive number.")
            except ValueError as e:
                logger.warning(
                    "User entered non-numeric value",
                    extra={'error': str(e)}
                )
                print("Please enter a valid number.")

        # Generate characters
        characters = []
        successful_generations = 0
        total_attempts = 0
        
        for i in range(num_characters):
            logger.info(f"Generating character {i+1}/{num_characters}...")
            generation_start = time.time()
            attempts = 0
            max_attempts = 3
            
            while attempts < max_attempts:
                try:
                    total_attempts += 1
                    system_prompt = """
Generate a character profile following this exact JSON structure:
{
  "name": "A realistic full name",
  "verbs": ["3-4 action words that describe what they do"],
  "adjectives": ["3-4 descriptive words about their personality"],
  "categories": {
    "character": [
      {"text": "A character trait", "emoji": "relevant emoji"},
      {"text": "Another character trait", "emoji": "relevant emoji"}
    ],
    "business": [
      {"text": "A business/professional skill", "emoji": "relevant emoji"},
      {"text": "Another business/professional skill", "emoji": "relevant emoji"}
    ],
    "psychology": [
      {"text": "A psychological trait", "emoji": "relevant emoji"},
      {"text": "Another psychological trait", "emoji": "relevant emoji"}
    ],
    "desires": [
      {"text": "A personal goal or desire", "emoji": "relevant emoji"},
      {"text": "Another personal goal or desire", "emoji": "relevant emoji"}
    ]
  }
}

Guidelines:
- Name should be realistic and professional
- Verbs should be present tense (-s form) describing regular actions
- Adjectives should capture key personality traits
- Each category should have exactly 2 items
- Each item must have relevant text and an appropriate emoji
- Ensure all JSON formatting is exact with proper quotes and commas
"""
                    character = generate_character(system_prompt)
                    
                    # Validate the generated character
                    if validate_character(character):
                        characters.append(character)
                        successful_generations += 1
                        generation_time = time.time() - generation_start
                        logger.info(
                            f"Successfully generated character {i+1} "
                            f"in {generation_time:.2f} seconds"
                        )
                        break
                        
                except (APIError, JSONError, ValidationError) as e:
                    attempts += 1
                    logger.error(
                        f"Error on attempt {attempts}/{max_attempts}: {str(e)}",
                        exc_info=True,
                        stack_info=True
                    )
                    if attempts < max_attempts:
                        print(f"Error occurred, retrying... ({attempts}/{max_attempts})")
                        time.sleep(2 ** attempts)  # Exponential backoff
                    else:
                        logger.error(
                            f"Failed to generate character {i+1} after {max_attempts} attempts",
                            exc_info=True,
                            stack_info=True
                        )
                        print(f"Failed to generate character {i+1}. Check error.log for details.")
                        sys.exit(1)
            
        # Create output filename with timestamp
        timestamp = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"characters_{timestamp}.json"

        # Save to file
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump({"students": characters}, f, indent=2, ensure_ascii=False)
        except IOError as e:
            logger.error(
                f"Failed to save characters to file: {str(e)}",
                exc_info=True,
                stack_info=True
            )
            print("Error saving characters. Check error.log for details.")
            sys.exit(1)

        # Log final statistics
        total_time = time.time() - start_time
        logger.info(
            "Character generation completed",
            extra={
                'statistics': {
                    'total_time': f"{total_time:.2f}s",
                    'characters_requested': num_characters,
                    'characters_generated': successful_generations,
                    'total_attempts': total_attempts,
                    'success_rate': f"{(successful_generations/total_attempts)*100:.1f}%"
                }
            }
        )
        
        print(f"\nSuccessfully generated {successful_generations} characters "
              f"and saved to {filename}")

    except KeyboardInterrupt:
        elapsed_time = time.time() - start_time
        logger.info(
            f"Operation cancelled by user after {elapsed_time:.2f} seconds",
            extra={'partial_completion': len(characters)}
        )
        print("\nOperation cancelled by user.")
        sys.exit(0)
        
    except Exception as e:
        logger.critical(
            "Unexpected error in main process",
            exc_info=True,
            stack_info=True,
            extra={
                'error_type': type(e).__name__,
                'error_message': str(e),
                'partial_completion': len(characters)
            }
        )
        print("An unexpected error occurred. Check error.log for details.")
        sys.exit(1)

if __name__ == "__main__":
    main()
