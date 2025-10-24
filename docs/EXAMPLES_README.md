# Mermaid Syntax Examples - User Guide

## Overview

This system allows you to continuously improve Mermaid diagram generation by adding real-world examples of syntax errors and their corrections. The AI model will reference these examples when generating diagrams.

## File Structure

```
backend/app/
├── mermaid_examples.py          # Contains all examples (EDIT THIS FILE)
├── prompts.py                   # Uses examples in prompts
├── routers/generate.py          # Applies examples during generation
└── EXAMPLES_README.md           # This guide
```

## How to Add New Examples

### Method 1: Edit `mermaid_examples.py` Directly (Recommended)

Open `backend/app/mermaid_examples.py` and add a new tuple to the `MERMAID_SYNTAX_EXAMPLES` list:

```python
MERMAID_SYNTAX_EXAMPLES = [
    # ... existing examples ...
    
    # Your new example
    (
        "Brief description of the error",
        """Incorrect Mermaid code here""",
        """Correct Mermaid code here""",
        "Explanation of why the incorrect version fails and how the fix works"
    ),
]
```

### Example Template

```python
(
    "Description of the error type",
    """flowchart TD
    A[Bad Syntax]
    A --> B""",
    """flowchart TD
    A["Good Syntax"]
    A --> B""",
    "Explanation: Why this matters and what was fixed"
),
```

### Method 2: Use the Helper Function (Interactive)

If you're in a Python REPL or script:

```python
from app.mermaid_examples import add_example

add_example(
    description="Your error description",
    incorrect="Bad code here",
    correct="Good code here",
    explanation="Why this matters"
)
```

**Note:** This only adds to memory. You must manually save to `mermaid_examples.py` to persist.

## Real-World Example Workflow

### 1. Encounter an Error in Production

User generates a diagram that throws "Syntax error in text":

```mermaid
flowchart TD
    API-Gateway[API Gateway]
    API-Gateway -->| "sends request" | Backend
```

### 2. Identify the Issues

- Node ID has dash: `API-Gateway`
- Spaces around pipes in arrow label: `-->| "sends request" |`

### 3. Add to Examples

Edit `mermaid_examples.py`:

```python
(
    "Real production error: API Gateway with multiple issues",
    """flowchart TD
    API-Gateway[API Gateway]
    API-Gateway -->| "sends request" | Backend""",
    """flowchart TD
    APIGateway["API Gateway"]
    APIGateway -->|"sends request"| Backend""",
    "Fixed node ID (removed dash) and arrow label spacing (removed spaces around pipes). This was causing parsing errors in production."
),
```

### 4. Restart the Backend

The new example will be included in prompts automatically:

```bash
# If using Docker
docker-compose restart backend

# If running locally
# Stop and restart your FastAPI server
```

### 5. Test

Generate a new diagram and verify the AI model avoids the same mistakes.

## Example Categories

Organize examples by error type for clarity:

### Arrow Syntax Errors
- Spaces around pipes
- Wrong number of dashes
- Single quotes instead of double quotes

### Node ID Errors
- Dashes in IDs
- Dots in IDs
- Special characters

### Label Errors
- Unquoted special characters
- Single quotes
- Missing quotes

### Subgraph Errors
- ID prefixes
- Class styling on subgraph line

### Complex Real-World Cases
- Multiple errors in one diagram
- Production failures

## Best Practices

### 1. Use Real Production Examples
✅ **Good:** Actual errors from your logs
❌ **Bad:** Made-up theoretical cases

### 2. Keep Examples Focused
✅ **Good:** One or two related errors per example
❌ **Bad:** 10 different errors in one example

### 3. Provide Clear Explanations
✅ **Good:** "Dashes in node IDs cause parsing ambiguity with arrow syntax"
❌ **Bad:** "This is wrong"

### 4. Show Context
✅ **Good:** Include surrounding code (2-3 lines)
❌ **Bad:** Just the single problematic line

### 5. Test After Adding
- Restart backend
- Generate a diagram
- Verify the error is avoided

## Viewing Current Examples

### Check How Many Examples Exist

```python
from app.mermaid_examples import get_examples_count
print(f"Total examples: {get_examples_count()}")
```

### Preview Examples as Prompt Text

```python
from app.mermaid_examples import get_examples_as_prompt_text
print(get_examples_as_prompt_text())
```

This shows exactly what the AI model sees.

## Example Format in Prompts

When included in prompts, examples appear as:

```
**COMMON SYNTAX ERRORS AND CORRECTIONS:**

**Example 1: Arrow labels with spaces around pipes**

❌ INCORRECT:
```
A -->| "sends data" | B
```

✅ CORRECT:
```
A -->|"sends data"| B
```

💡 Why: No spaces allowed around pipes in arrow labels. The pipe | is a lexer delimiter.

---
```

## Maintenance

### Regular Review
- Every month, review examples
- Remove duplicates
- Consolidate similar cases
- Update explanations based on new insights

### Performance Monitoring
- Track error rates before/after adding examples
- Identify which examples are most effective
- Remove examples that don't help

### Version Control
- Commit `mermaid_examples.py` changes with descriptive messages
- Example: `git commit -m "Add example for subgraph ID prefix error from issue #123"`

## Troubleshooting

### Examples Not Appearing in Prompts

1. Check import in `prompts.py`:
   ```python
   from app.mermaid_examples import get_examples_as_prompt_text
   ```

2. Verify function is called in `generate.py`:
   ```python
   system_prompt_with_examples = get_system_third_prompt_with_examples()
   ```

3. Restart backend server

### Syntax Errors in Examples File

- Python will fail to import if there's a syntax error
- Check for:
  - Unmatched quotes
  - Missing commas between tuples
  - Unclosed parentheses

### Examples Too Long

If prompts become too large:
- Consolidate similar examples
- Remove less common error types
- Keep only the most impactful examples (top 10-15)

## Advanced: Dynamic Example Selection

Future enhancement: Select examples based on detected error patterns.

```python
def get_relevant_examples(error_type: str) -> str:
    """Get only examples relevant to a specific error type."""
    relevant = [ex for ex in MERMAID_SYNTAX_EXAMPLES if error_type in ex[0].lower()]
    # Format and return
```

## Questions?

- Check existing examples in `mermaid_examples.py`
- Review the grammar rules in `prompts.py`
- See validation logic in `utils/mermaid_validator.py`

## Quick Reference

| Task | File to Edit |
|------|-------------|
| Add new example | `mermaid_examples.py` |
| Change example format | `mermaid_examples.py` (function `get_examples_as_prompt_text`) |
| Disable examples | `generate.py` (use `SYSTEM_THIRD_PROMPT` instead) |
| View examples in prompt | Run `get_examples_as_prompt_text()` |

---

**Remember:** The goal is continuous improvement. Every real error you encounter is an opportunity to teach the AI model and prevent future mistakes!
