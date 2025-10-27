# Mermaid Examples System - Visual Overview

## System Flow

```mermaid
flowchart TD
    User["👤 User<br/>Encounters Syntax Error"]
    
    subgraph "Add Example"
        Edit["📝 Edit mermaid_examples.py<br/>Add tuple to list"]
        Save["💾 Save File"]
        Restart["🔄 Restart Backend"]
    end
    
    subgraph "System Files"
        Examples["📦 mermaid_examples.py<br/>MERMAID_SYNTAX_EXAMPLES list<br/>get_examples_as_prompt_text()"]
        Prompts["📄 prompts.py<br/>get_system_third_prompt_with_examples()"]
        Generate["⚙️ routers/generate.py<br/>Phase 3: Generate Diagram"]
    end
    
    subgraph "AI Generation"
        AI["🤖 AI Model<br/>Receives enhanced prompt"]
        Output["✅ Generated Diagram<br/>Avoids documented errors"]
    end
    
    User --> Edit
    Edit --> Save
    Save --> Restart
    Restart --> Examples
    
    Examples -->|"Formats examples"| Prompts
    Prompts -->|"Enhanced prompt"| Generate
    Generate -->|"Sends to AI"| AI
    AI -->|"Returns diagram"| Output
    Output -->|"Validates"| User
    
    style User fill:#e1f5ff
    style Examples fill:#fff4e6
    style Prompts fill:#fff4e6
    style Generate fill:#fff4e6
    style AI fill:#f3e5f5
    style Output fill:#e8f5e9
```

## File Structure

```
gitdiagram/
├── backend/app/
│   ├── mermaid_examples.py          ⭐ ADD EXAMPLES HERE
│   │   ├── MERMAID_SYNTAX_EXAMPLES  (list of tuples)
│   │   ├── get_examples_as_prompt_text()
│   │   ├── get_examples_count()
│   │   └── add_example()
│   │
│   ├── prompts.py                   🔗 USES EXAMPLES
│   │   ├── SYSTEM_FIRST_PROMPT
│   │   ├── SYSTEM_SECOND_PROMPT
│   │   ├── SYSTEM_THIRD_PROMPT
│   │   └── get_system_third_prompt_with_examples()  ← NEW
│   │
│   ├── routers/generate.py          🔗 APPLIES EXAMPLES
│   │   └── Phase 3: Uses get_system_third_prompt_with_examples()
│   │
│   ├── utils/mermaid_validator.py   ✓ VALIDATES OUTPUT
│   │   ├── validate_and_fix_mermaid()
│   │   └── get_validation_report()
│   │
│   ├── EXAMPLES_README.md           📖 FULL GUIDE
│   ├── QUICK_ADD_EXAMPLE.md         📖 QUICK START
│   └── example_template.txt         📋 TEMPLATES
│
├── EXAMPLES_SYSTEM_SUMMARY.md       📖 TECHNICAL OVERVIEW
└── HOW_TO_ADD_EXAMPLES.md           📖 USER GUIDE
```

## Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant E as mermaid_examples.py
    participant P as prompts.py
    participant G as generate.py
    participant A as AI Model
    participant V as Validator
    
    U->>E: 1. Add example tuple
    Note over E: MERMAID_SYNTAX_EXAMPLES list
    
    U->>G: 2. Request diagram generation
    G->>P: 3. Call get_system_third_prompt_with_examples()
    P->>E: 4. Call get_examples_as_prompt_text()
    E-->>P: 5. Return formatted examples
    P-->>G: 6. Return enhanced prompt
    
    G->>A: 7. Send prompt + examples
    Note over A: AI learns from examples
    A-->>G: 8. Return generated diagram
    
    G->>V: 9. Validate diagram
    V-->>G: 10. Return validated/fixed diagram
    G-->>U: 11. Return final diagram
```

## Example Structure

```python
# In mermaid_examples.py

MERMAID_SYNTAX_EXAMPLES = [
    (
        # 1. Description
        "Brief description of error type",
        
        # 2. Incorrect Code
        """flowchart TD
    BadNode[Label]
    BadNode --> Other""",
        
        # 3. Correct Code
        """flowchart TD
    GoodNode["Label"]
    GoodNode --> Other""",
        
        # 4. Explanation
        "Why it fails and how to fix it"
    ),
    # ... more examples ...
]
```

## How Examples Appear in Prompts

```
SYSTEM_THIRD_PROMPT (grammar rules)
+
**COMMON SYNTAX ERRORS AND CORRECTIONS:**

**Example 1: [Description]**
❌ INCORRECT:
```
[bad code]
```
✅ CORRECT:
```
[good code]
```
💡 Why: [explanation]
---

**Example 2: ...**
[repeat for all examples]
```

## Integration Points

### 1. Import in prompts.py
```python
from app.mermaid_examples import get_examples_as_prompt_text
```

### 2. Function in prompts.py
```python
def get_system_third_prompt_with_examples() -> str:
    return SYSTEM_THIRD_PROMPT + "\n\n" + get_examples_as_prompt_text()
```

### 3. Usage in generate.py
```python
system_prompt_with_examples = get_system_third_prompt_with_examples()
async for chunk in service.call_api_stream(
    system_prompt=system_prompt_with_examples,  # ← Enhanced with examples
    ...
)
```

## Quick Actions

| Action | Command/File |
|--------|-------------|
| **Add Example** | Edit `backend/app/mermaid_examples.py` |
| **View Examples** | Run `get_examples_as_prompt_text()` |
| **Count Examples** | Run `get_examples_count()` |
| **Restart Backend** | `docker-compose restart backend` |
| **Test Changes** | Generate a diagram |
| **Read Guide** | Open `EXAMPLES_README.md` |
| **Quick Start** | Open `QUICK_ADD_EXAMPLE.md` |
| **Copy Template** | Open `example_template.txt` |

## Benefits Visualization

```mermaid
graph LR
    A[Real Error] -->|Document| B[Add Example]
    B -->|Teaches| C[AI Model]
    C -->|Generates| D[Better Diagrams]
    D -->|Prevents| E[Future Errors]
    E -->|Improves| F[User Experience]
    
    style A fill:#ffcdd2
    style B fill:#fff9c4
    style C fill:#c5e1a5
    style D fill:#b2dfdb
    style E fill:#b3e5fc
    style F fill:#c5cae9
```

## Continuous Improvement Loop

```mermaid
flowchart LR
    Error["❌ Error Occurs"]
    Document["📝 Document Example"]
    Learn["🤖 AI Learns"]
    Improve["✅ Quality Improves"]
    Prevent["🛡️ Error Prevented"]
    
    Error --> Document
    Document --> Learn
    Learn --> Improve
    Improve --> Prevent
    Prevent -.->|"Next error"| Error
    
    style Error fill:#ffebee
    style Document fill:#fff3e0
    style Learn fill:#e8f5e9
    style Improve fill:#e3f2fd
    style Prevent fill:#f3e5f5
```

---

## Summary

This system creates a **feedback loop** where:
1. Real errors are documented as examples
2. Examples are automatically included in AI prompts
3. AI learns to avoid documented mistakes
4. Diagram quality continuously improves
5. Fewer errors occur over time

**Start adding examples today!** 🚀
