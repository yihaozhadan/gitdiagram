# How to Add Mermaid Syntax Examples

## Quick Start (30 seconds)

1. **Open:** `backend/app/mermaid_examples.py`
2. **Find:** `MERMAID_SYNTAX_EXAMPLES = [`
3. **Add your example:**
   ```python
   (
       "Your error description",
       """Bad code""",
       """Good code""",
       "Why it matters"
   ),
   ```
4. **Save** and **restart backend**
5. **Done!** The AI will now reference your example

## Detailed Steps

### Step 1: Identify the Error

When you see "Syntax error in text", note:
- What the incorrect code looks like
- What caused the error
- How to fix it

### Step 2: Open the Examples File

```bash
backend/app/mermaid_examples.py
```

### Step 3: Add Your Example

Scroll to `MERMAID_SYNTAX_EXAMPLES` list and add a new tuple:

```python
MERMAID_SYNTAX_EXAMPLES = [
    # ... existing examples ...
    
    # Your new example here
    (
        "Brief description",
        """❌ Incorrect code here""",
        """✅ Correct code here""",
        "Explanation here"
    ),
]
```

### Step 4: Use the Template

Copy from `backend/app/example_template.txt`:

```python
    (
        "Node ID with dash causing parse error",
        """flowchart TD
    API-Gateway["API Gateway"]
    API-Gateway --> Backend""",
        """flowchart TD
    APIGateway["API Gateway"]
    APIGateway --> Backend""",
        "Dashes in node IDs can be confused with arrow syntax. Use underscores or camelCase instead."
    ),
```

### Step 5: Save and Restart

```bash
# If using Docker
docker-compose restart backend

# If running locally
# Stop and restart your Python server
```

### Step 6: Test

Generate a new diagram and verify the AI avoids the error.

## Example Categories

### Arrow Syntax
```python
(
    "Arrow label with spaces around pipes",
    """A -->| "text" | B""",
    """A -->|"text"| B""",
    "No spaces around pipes. The pipe | is a lexer delimiter."
),
```

### Node IDs
```python
(
    "Node ID with dash",
    """API-Gateway["Gateway"]""",
    """APIGateway["Gateway"]""",
    "Dashes in IDs cause ambiguity. Use underscores."
),
```

### Labels
```python
(
    "Unquoted label with colon",
    """A[User: Admin]""",
    """A["User: Admin"]""",
    "Colons require quotes."
),
```

### Subgraphs
```python
(
    "Subgraph with ID prefix",
    """subgraph api "API Layer"
    Node
end""",
    """subgraph "API Layer"
    Node
end""",
    "No ID prefix in basic flowcharts."
),
```

## Real-World Example

### Scenario
User reports: "My diagram shows 'Syntax error in text'"

Their code:
```mermaid
flowchart TD
    user.service[User Service]
    user.service -->| "authenticates" | auth
```

### Issues Found
1. Dot in node ID: `user.service`
2. Spaces around pipes: `-->| "authenticates" |`

### Add to Examples

```python
(
    "Production error 2025-10-23: User service with multiple issues",
    """flowchart TD
    user.service[User Service]
    user.service -->| "authenticates" | auth""",
    """flowchart TD
    UserService["User Service"]
    UserService -->|"authenticates"| auth""",
    "Fixed node ID (removed dot) and arrow spacing (removed spaces around pipes). Reported in production."
),
```

## File Structure

```
backend/app/
├── mermaid_examples.py          ← EDIT THIS to add examples
├── example_template.txt         ← Copy templates from here
├── EXAMPLES_README.md           ← Full documentation
├── QUICK_ADD_EXAMPLE.md         ← Quick reference
└── prompts.py                   ← Uses examples automatically
```

## Verification

After adding an example, verify it's working:

```python
# In Python REPL or script
from app.mermaid_examples import get_examples_count, get_examples_as_prompt_text

# Check count
print(f"Total examples: {get_examples_count()}")

# Preview how it appears in prompts
print(get_examples_as_prompt_text())
```

## Best Practices

✅ **DO:**
- Use real production errors
- Include 2-3 lines of context
- Explain WHY it fails
- Test after adding
- Commit with descriptive message

❌ **DON'T:**
- Make up theoretical errors
- Show only single line
- Use vague explanations
- Mix too many errors
- Forget to restart backend

## Troubleshooting

### Example not appearing?
1. Check syntax in `mermaid_examples.py`
2. Restart backend server
3. Verify import in `prompts.py`

### Syntax error in examples file?
- Check for unmatched quotes
- Check for missing commas
- Check for unclosed parentheses

### Too many examples?
- Keep top 15-20 most common
- Remove duplicates
- Consolidate similar cases

## Resources

- **Full Guide:** `backend/app/EXAMPLES_README.md`
- **Quick Reference:** `backend/app/QUICK_ADD_EXAMPLE.md`
- **Template:** `backend/app/example_template.txt`
- **System Overview:** `EXAMPLES_SYSTEM_SUMMARY.md`

## Questions?

Check the comprehensive guide in `backend/app/EXAMPLES_README.md`

---

**Remember:** Every error you document helps prevent future mistakes! 🎯
