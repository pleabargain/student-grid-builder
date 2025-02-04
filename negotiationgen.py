"""
Negotiation Scenario Generator using llama3.2 model
- Uses Ollama Python package to generate negotiation scenarios
- Uses Pydantic for data validation
- Includes error handling and validation
- Supports logging with rotation
- Requires: pip install -U ollama pydantic python-json-logger
"""

import json
import datetime
import re
import traceback
from typing import Dict, List, Optional, Tuple, Any
import sys
import logging
from logging.handlers import TimedRotatingFileHandler
import time
import os
from ollama import chat
from pydantic import BaseModel, Field

# Pydantic models for negotiation structure
class Topic(BaseModel):
    title: str
    description: str
    context: str
    industry: Optional[str] = None
    expectedTimeframe: Optional[str] = None

class Party(BaseModel):
    id: str
    name: str
    role: str
    interests: List[str]
    constraints: List[str]
    authorityLevel: Optional[str] = Field(None, pattern="^(full|limited|consultant)$")

class ConflictPoint(BaseModel):
    id: str
    description: str
    severity: str = Field(..., pattern="^(low|medium|high|critical)$")
    impact: str
    relatedPoints: Optional[List[str]] = None

class Position(BaseModel):
    party1Position: str
    party2Position: str

class AcceptableRange(BaseModel):
    minimum: str
    maximum: str
    preferredOutcome: str

class NegotiablePoint(BaseModel):
    id: str
    topic: str
    currentPosition: Position
    acceptableRange: AcceptableRange
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")
    flexibility: Optional[str] = Field(None, pattern="^(rigid|moderate|flexible)$")

class NonNegotiablePoint(BaseModel):
    id: str
    description: str
    rationale: str
    impact: Optional[str] = None

class WalkawayCondition(BaseModel):
    condition: str
    threshold: str
    reasoning: Optional[str] = None

class WalkawayConditions(BaseModel):
    party1Conditions: List[WalkawayCondition]
    party2Conditions: List[WalkawayCondition]

# New models for tactics and strategies
class LongTermObjective(BaseModel):
    objective: str
    importance: str = Field(..., pattern="^(critical|high|medium|low)$")
    timeframe: str

class RelationshipGoals(BaseModel):
    desiredOutcome: str = Field(..., pattern="^(strengthen|maintain|professional-distance|terminate)$")
    futureInteractions: Optional[str] = None

class Strategy(BaseModel):
    overallApproach: str = Field(..., pattern="^(competitive|collaborative|accommodating|compromising|avoiding)$")
    longTermObjectives: List[LongTermObjective]
    relationshipGoals: RelationshipGoals

class OpeningApproach(BaseModel):
    initialOffer: str
    anchoringStrategy: str

class ConcessionStage(BaseModel):
    stage: str
    possibleConcessions: List[str]
    triggerConditions: List[str]

class ConcessionPlan(BaseModel):
    sequence: List[ConcessionStage]
    pacing: str

class PersuasionTechnique(BaseModel):
    technique: str = Field(..., pattern="^(reciprocity|social-proof|authority|scarcity|consistency|liking)$")
    applicationContext: str
    fallbackOptions: Optional[List[str]] = None

class InformationGathering(BaseModel):
    keyQuestions: List[str]
    observationFocus: List[str]

class DeadlockBreaker(BaseModel):
    approach: str
    conditions: str
    risks: str

class Tactics(BaseModel):
    openingApproach: OpeningApproach
    concessionPlan: ConcessionPlan
    persuasionTechniques: List[PersuasionTechnique]
    informationGathering: InformationGathering
    deadlockBreakers: List[DeadlockBreaker]

class NegotiationScenario(BaseModel):
    negotiationId: str
    topic: Topic
    parties: List[Party]
    conflictPoints: List[ConflictPoint]
    negotiablePoints: List[NegotiablePoint]
    nonNegotiablePoints: List[NonNegotiablePoint]
    walkawayConditions: WalkawayConditions
    strategies: Optional[Strategy] = None
    tactics: Optional[Tactics] = None

class NegotiationGenError(Exception):
    """Base exception class for negotiation generation errors"""
    def __init__(self, message: str, error_type: str = "GENERAL_ERROR"):
        self.message = message
        self.error_type = error_type
        super().__init__(self.message)

class APIError(NegotiationGenError):
    """Exception raised for API-related errors"""
    def __init__(self, message: str, status_code: Optional[int] = None):
        error_type = f"API_ERROR_{status_code}" if status_code else "API_ERROR"
        super().__init__(message, error_type)
        self.status_code = status_code

class JSONError(NegotiationGenError):
    """Exception raised for JSON processing errors"""
    def __init__(self, message: str):
        super().__init__(message, "JSON_ERROR")

class ValidationError(NegotiationGenError):
    """Exception raised for negotiation validation errors"""
    def __init__(self, message: str):
        super().__init__(message, "VALIDATION_ERROR")

class SchemaValidationError(NegotiationGenError):
    """Exception for schema validation failures"""
    def __init__(self, message: str, field: str):
        error_type = f"SCHEMA_VALIDATION_ERROR_{field.upper()}"
        super().__init__(message, error_type)
        self.field = field

def setup_logging():
    """Configure logging with enhanced error tracking and rotation"""
    logger = logging.getLogger('negotiationgen')
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
        'negotiationgen.log',
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

def validate_tactics_and_strategies(negotiation: Dict) -> bool:
    """Specific validation for tactics and strategies
    
    Args:
        negotiation (Dict): Negotiation data to validate
        
    Returns:
        bool: True if valid
        
    Raises:
        SchemaValidationError: If validation fails for non-null fields
    """
    try:
        # Only validate if the fields exist and are not None
        if negotiation.get('tactics') is not None:
            try:
                Tactics.model_validate(negotiation['tactics'])
            except Exception as e:
                logger.error(
                    "Tactics validation error",
                    extra={
                        'error_details': str(e),
                        'failed_fields': e.errors() if hasattr(e, 'errors') else None
                    }
                )
                raise SchemaValidationError(str(e), 'tactics')
                
        if negotiation.get('strategies') is not None:
            try:
                Strategy.model_validate(negotiation['strategies'])
            except Exception as e:
                logger.error(
                    "Strategies validation error",
                    extra={
                        'error_details': str(e),
                        'failed_fields': e.errors() if hasattr(e, 'errors') else None
                    }
                )
                raise SchemaValidationError(str(e), 'strategies')
                
        # If fields are missing or None, log a warning but don't fail validation
        if negotiation.get('tactics') is None or negotiation.get('strategies') is None:
            logger.warning(
                "Optional fields missing",
                extra={
                    'missing_fields': {
                        'tactics': negotiation.get('tactics') is None,
                        'strategies': negotiation.get('strategies') is None
                    }
                }
            )
            
        return True
        
    except SchemaValidationError:
        # Re-raise schema validation errors
        raise
    except Exception as e:
        # Handle unexpected errors
        logger.error(
            "Unexpected error in tactics/strategies validation",
            extra={
                'error_type': type(e).__name__,
                'error_message': str(e)
            }
        )
        raise SchemaValidationError(str(e), 'tactics_strategies')

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

def generate_negotiation(system_prompt: str, max_retries: int = 3) -> Dict:
    """Generate a negotiation scenario using Ollama chat with enhanced error handling
    
    Args:
        system_prompt (str): Additional prompt instructions
        max_retries (int): Maximum number of retry attempts
        
    Returns:
        Dict: Generated negotiation data in dictionary format
        
    Raises:
        APIError: If API connection or response is invalid
        JSONError: If JSON processing fails
        ValidationError: If negotiation data is invalid
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
                            "Generate a negotiation scenario with the following context:\n"
                            f"{system_prompt}"
                        )
                    }
                ],
                model='llama3.2',
                format=NegotiationScenario.model_json_schema()
            )
            
            # Log API performance
            elapsed = time.time() - start_time
            logger.debug(f"API request completed in {elapsed:.2f} seconds")
            
            # Log the raw response for debugging
            logger.debug(f"Raw API response: {response.message.content}")
            
            try:
                # Use Pydantic to validate the response
                negotiation_data = NegotiationScenario.model_validate_json(
                    response.message.content
                ).model_dump()
                
                # Additional validation for tactics and strategies
                validate_tactics_and_strategies(negotiation_data)
                
                return negotiation_data
                
            except SchemaValidationError as e:
                logger.error(
                    f"Schema validation error in field {e.field}: {e.message}",
                    extra={'field': e.field}
                )
                raise
            except Exception as e:
                raise ValidationError(f"Invalid negotiation data structure: {str(e)}")
            
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
                    raise NegotiationGenError(f"Failed to generate negotiation: {str(e)}")

def validate_negotiation(negotiation: Dict) -> bool:
    """Validate the negotiation JSON structure using Pydantic
    
    Args:
        negotiation (Dict): Negotiation data to validate
        
    Returns:
        bool: True if valid
        
    Raises:
        ValidationError: If validation fails
    """
    try:
        # Use Pydantic model to validate the negotiation data
        NegotiationScenario.model_validate(negotiation)
        
        # Additional validation for tactics and strategies
        validate_tactics_and_strategies(negotiation)
        
        return True
        
    except SchemaValidationError as e:
        logger.error(
            f"Schema validation error in field {e.field}: {e.message}",
            extra={'field': e.field}
        )
        raise
        
    except ValidationError as e:
        logger.error(
            f"Negotiation validation error: {str(e)}",
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
    """Main function to run the negotiation generator with enhanced error handling"""
    start_time = time.time()
    process_id = os.getpid()
    logger.info(f"Starting negotiation generation process (PID: {process_id})")
    
    try:
        # Get number of scenarios to generate
        while True:
            try:
                num_scenarios = int(input("How many negotiation scenarios would you like to generate? "))
                if num_scenarios > 0:
                    break
                logger.warning(
                    f"User entered invalid number: {num_scenarios}",
                    extra={'user_input': num_scenarios}
                )
                print("Please enter a positive number.")
            except ValueError as e:
                logger.warning(
                    "User entered non-numeric value",
                    extra={'error': str(e)}
                )
                print("Please enter a valid number.")

        # Generate scenarios
        successful_generations = 0
        total_attempts = 0
        generated_files = []
        
        for i in range(num_scenarios):
            logger.info(f"Generating scenario {i+1}/{num_scenarios}...")
            generation_start = time.time()
            attempts = 0
            max_attempts = 3
            
            while attempts < max_attempts:
                try:
                    total_attempts += 1
                    system_prompt = """
Generate a negotiation scenario following this exact JSON structure:
{
  "negotiationId": "A unique identifier",
  "topic": {
    "title": "Brief negotiation title",
    "description": "Detailed description",
    "context": "Background information",
    "industry": "Relevant industry",
    "expectedTimeframe": "Expected duration"
  },
  "parties": [
    {
      "id": "party1",
      "name": "First party name",
      "role": "Their role",
      "interests": ["Key interests"],
      "constraints": ["Their limitations"],
      "authorityLevel": "full|limited|consultant"
    },
    {
      "id": "party2",
      "name": "Second party name",
      "role": "Their role",
      "interests": ["Key interests"],
      "constraints": ["Their limitations"],
      "authorityLevel": "full|limited|consultant"
    }
  ],
  "conflictPoints": [
    {
      "id": "conflict1",
      "description": "Point of conflict",
      "severity": "low|medium|high|critical",
      "impact": "Impact description",
      "relatedPoints": ["Related issues"]
    }
  ],
  "negotiablePoints": [
    {
      "id": "point1",
      "topic": "Negotiation point",
      "currentPosition": {
        "party1Position": "First party's stance",
        "party2Position": "Second party's stance"
      },
      "acceptableRange": {
        "minimum": "Minimum acceptable",
        "maximum": "Maximum acceptable",
        "preferredOutcome": "Ideal outcome"
      },
      "priority": "low|medium|high",
      "flexibility": "rigid|moderate|flexible"
    }
  ],
  "nonNegotiablePoints": [
    {
      "id": "nonNeg1",
      "description": "Non-negotiable point",
      "rationale": "Why it's non-negotiable",
      "impact": "Impact on negotiation"
    }
  ],
  "walkawayConditions": {
    "party1Conditions": [
      {
        "condition": "Deal-breaker condition",
        "threshold": "Specific limit",
        "reasoning": "Why this is a deal-breaker"
      }
    ],
    "party2Conditions": [
      {
        "condition": "Deal-breaker condition",
        "threshold": "Specific limit",
        "reasoning": "Why this is a deal-breaker"
      }
    ]
  },
  "strategies": {
    "overallApproach": "competitive|collaborative|accommodating|compromising|avoiding",
    "longTermObjectives": [
      {
        "objective": "Long-term goal",
        "importance": "critical|high|medium|low",
        "timeframe": "Expected timeline"
      }
    ],
    "relationshipGoals": {
      "desiredOutcome": "strengthen|maintain|professional-distance|terminate",
      "futureInteractions": "Expected future dynamics"
    }
  },
  "tactics": {
    "openingApproach": {
      "initialOffer": "Opening position",
      "anchoringStrategy": "How to anchor the negotiation"
    },
    "concessionPlan": {
      "sequence": [
        {
          "stage": "Stage description",
          "possibleConcessions": ["Potential concessions"],
          "triggerConditions": ["When to make concessions"]
        }
      ],
      "pacing": "Timing strategy"
    },
    "persuasionTechniques": [
      {
        "technique": "reciprocity|social-proof|authority|scarcity|consistency|liking",
        "applicationContext": "When/how to apply",
        "fallbackOptions": ["Alternative approaches"]
      }
    ],
    "informationGathering": {
      "keyQuestions": ["Important questions to ask"],
      "observationFocus": ["What to watch for"]
    },
    "deadlockBreakers": [
      {
        "approach": "How to break deadlock",
        "conditions": "When to use this approach",
        "risks": "Potential downsides"
      }
    ]
  }
}

Guidelines:
- Generate realistic business negotiation scenarios
- Ensure logical consistency between parties
- Make all points and positions realistic and detailed
- Use appropriate severity levels and priorities
- Ensure walkaway conditions align with party interests
- Include comprehensive tactics and strategies
- Make sure negotiation approaches match the context
"""
                    scenario = generate_negotiation(system_prompt)
                    
                    # Validate the generated scenario
                    if validate_negotiation(scenario):
                        # Create unique filename for this scenario
                        timestamp = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
                        title = scenario["topic"]["title"]
                        safe_title = re.sub(r'[^\w\-]', '_', title)
                        filename = f"{safe_title}_{timestamp}.json"
                        
                        # Save individual scenario to file wrapped in scenarios array
                        try:
                            with open(filename, 'w', encoding='utf-8') as f:
                                json.dump({"scenarios": [scenario]}, f, indent=2, ensure_ascii=False)
                            generated_files.append(filename)
                            successful_generations += 1
                            generation_time = time.time() - generation_start
                            logger.info(
                                f"Successfully generated scenario {i+1} "
                                f"in {generation_time:.2f} seconds and saved to {filename}"
                            )
                            break
                        except IOError as e:
                            logger.error(
                                f"Failed to save scenario to file: {str(e)}",
                                exc_info=True,
                                stack_info=True
                            )
                            print(f"Error saving scenario {i+1}. Check error.log for details.")
                            attempts += 1
                            continue
                        
                except (APIError, JSONError, ValidationError, SchemaValidationError) as e:
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
                            f"Failed to generate scenario {i+1} after {max_attempts} attempts",
                            exc_info=True,
                            stack_info=True
                        )
                        print(f"Failed to generate scenario {i+1}. Check error.log for details.")
                        sys.exit(1)
            
        # Log final statistics
        total_time = time.time() - start_time
        logger.info(
            "Negotiation generation completed",
            extra={
                'statistics': {
                    'total_time': f"{total_time:.2f}s",
                    'scenarios_requested': num_scenarios,
                    'scenarios_generated': successful_generations,
                    'total_attempts': total_attempts,
                    'success_rate': f"{(successful_generations/total_attempts)*100:.1f}%"
                }
            }
        )
        
        print(f"\nSuccessfully generated {successful_generations} scenarios.")
        print("Files generated:")
        for file in generated_files:
            print(f"- {file}")

    except KeyboardInterrupt:
        elapsed_time = time.time() - start_time
        logger.info(
            f"Operation cancelled by user after {elapsed_time:.2f} seconds",
            extra={'partial_completion': successful_generations}
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
                'partial_completion': successful_generations
            }
        )
        print("An unexpected error occurred. Check error.log for details.")
        sys.exit(1)

if __name__ == "__main__":
    main()
