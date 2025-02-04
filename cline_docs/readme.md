# Negotiation Generator Documentation

## System Overview

```mermaid
graph TD
    A[Start] --> B[Load Configuration]
    B --> C[Initialize Ollama]
    C --> D[Get User Input]
    D --> E[Generate Scenario]
    E --> F{Validate}
    F -->|Valid| G[Save Output]
    F -->|Invalid| E
    G --> H[End]

    subgraph Generation Process
    E --> E1[Generate Topic]
    E1 --> E2[Generate Parties]
    E2 --> E3[Generate Points]
    E3 --> E4[Generate Strategies]
    end
```

## Key Components

### Data Flow
```mermaid
graph LR
    A[User Input] --> B[Ollama LLM]
    B --> C[JSON Output]
    C --> D[Pydantic Validation]
    D --> E[Final Scenario]
```

### Error Handling
```mermaid
graph TD
    A[Operation] --> B{Error?}
    B -->|Yes| C[Log Error]
    C --> D[Retry?]
    D -->|Yes| A
    D -->|No| E[Exit]
    B -->|No| F[Continue]
```

## Setup Instructions

1. Environment Setup
   - Python 3.8+
   - Ollama with llama3.2 model
   - Required Python packages

2. Configuration
   - Logging settings
   - Model parameters
   - Validation rules

3. Usage Guidelines
   - Command line interface
   - Input parameters
   - Output formats
