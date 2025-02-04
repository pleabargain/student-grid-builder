# Product Context

## Purpose
The Negotiation Generator is designed to create realistic, detailed negotiation scenarios for training, simulation, and analysis purposes. It leverages the llama3.2 language model to generate comprehensive negotiation scenarios that follow a structured schema.

## Problems Solved
1. **Training Data Generation**
   - Creates diverse negotiation scenarios for training purposes
   - Generates consistent, well-structured data
   - Provides realistic negotiation contexts

2. **Scenario Complexity**
   - Handles multi-party negotiations
   - Manages conflicting interests
   - Generates realistic constraints and conditions

3. **Data Quality**
   - Ensures schema compliance
   - Validates logical consistency
   - Maintains realistic relationships between elements

## Core Functionality

### Generation Engine
- Uses llama3.2 model via Ollama
- Implements structured prompting
- Handles complex JSON generation

### Validation System
- Schema validation using Pydantic
- Logical consistency checks
- Error handling and recovery

### Output Management
- JSON file generation
- Error logging
- Progress tracking

## Expected Behavior
1. Accept user input for scenario parameters
2. Generate complete negotiation scenario
3. Validate against schema
4. Save to structured output
5. Provide error handling and logging

## Success Criteria
- Generated scenarios match schema
- Content is logically consistent
- Error handling is robust
- Performance is reliable
- Output is useful for training/simulation
