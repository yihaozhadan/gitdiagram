# Mermaid Examples System - Implementation Summary

## Overview

Implemented a flexible system for continuously improving Mermaid diagram generation by providing the AI model with real-world examples of syntax errors and their corrections.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Adds Example                         │
│              (Edit mermaid_examples.py)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              mermaid_examples.py                             │
│  - MERMAID_SYNTAX_EXAMPLES list (tuples)                    │
│  - get_examples_as_prompt_text() → formatted string         │
│  - get_examples_count() → int                               │
│  - add_example() → helper function                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    prompts.py                                │
│  - Imports: get_examples_as_prompt_text                     │
│  - Function: get_system_third_prompt_with_examples()        │
│  - Returns: SYSTEM_THIRD_PROMPT + formatted examples        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              routers/generate.py                             │
│  - Phase 3: Generate Mermaid diagram                        │
│  - Calls: get_system_third_prompt_with_examples()          │
│  - AI receives: Grammar rules + Real-world examples         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  AI Model Response                           │
│  - Generates diagram following examples                     │
│  - Avoids documented syntax errors                          │
└─────────────────────────────────────────────────────────────┘
```

## Files Created/Modified

### New Files

1. **`backend/app/mermaid_examples.py`** (NEW)
   - Central repository for all syntax examples
   - Contains 11 initial examples covering common errors
   - Provides formatting functions for use in prompts
   - Easy to extend with new examples

2. **`backend/app/EXAMPLES_README.md`** (NEW)
   - Comprehensive guide for adding examples
   - Best practices and workflows
   - Troubleshooting tips
   - Real-world example walkthrough

3. **`backend/app/QUICK_ADD_EXAMPLE.md`** (NEW)
   - Quick reference for adding examples
   - Copy-paste templates
   - Minimal steps to get started

4. **`EXAMPLES_SYSTEM_SUMMARY.md`** (NEW - this file)
   - Technical overview
   - Architecture diagram
   - Implementation details

### Modified Files

1. **`backend/app/prompts.py`**
   - Added import: `from app.mermaid_examples import get_examples_as_prompt_text`
   - Added function: `get_system_third_prompt_with_examples()`
   - Function dynamically appends examples to SYSTEM_THIRD_PROMPT

2. **`backend/app/routers/generate.py`**
   - Added import: `get_system_third_prompt_with_examples`
   - Modified Phase 3 to use enhanced prompt with examples
   - Line 249: `system_prompt_with_examples = get_system_third_prompt_with_examples()`

## Initial Examples Included

The system ships with 11 examples covering:

1. **Arrow label spacing** (spaces around pipes)
2. **Arrow label spacing** (space before pipe)
3. **Node IDs with dashes**
4. **Node IDs with dots**
5. **Unquoted labels with special characters**
6. **Single quotes instead of double quotes**
7. **Three or more dashes in arrows**
8. **Single dash arrows**
9. **Subgraph with ID prefix**
10. **Subgraph with class styling**
11. **Multiple errors in one diagram** (complex real-world case)
12. **Subgraph with multiple issues** (complex real-world case)

## Example Format

Each example is a 4-tuple:

```python
(
    description: str,      # Brief description of the error
    incorrect: str,        # The incorrect Mermaid code
    correct: str,          # The corrected Mermaid code
    explanation: str       # Why it fails and how to fix it
)
```

## How Examples Appear in Prompts

Examples are formatted as:

```
**COMMON SYNTAX ERRORS AND CORRECTIONS:**

**Example 1: [Description]**

❌ INCORRECT:
```
[incorrect code]
```

✅ CORRECT:
```
[correct code]
```

💡 Why: [explanation]

---
```

## User Workflow

### Adding a New Example

1. **Encounter error** in production
2. **Open** `backend/app/mermaid_examples.py`
3. **Add tuple** to `MERMAID_SYNTAX_EXAMPLES` list
4. **Save** file
5. **Restart** backend server
6. **Test** with new diagram generation

### Example Addition

```python
# In mermaid_examples.py, add to the list:
MERMAID_SYNTAX_EXAMPLES = [
    # ... existing examples ...
    
    (
        "Production error: Database node with colon",
        """DB[Database: PostgreSQL]""",
        """DB["Database: PostgreSQL"]""",
        "Colons require quotes. Found in production on 2025-10-23."
    ),
]
```

## Benefits

### 1. Continuous Improvement
- Learn from real production errors
- Examples accumulate over time
- No code changes needed to add examples

### 2. Concrete Learning
- AI models learn better from examples than rules
- Shows exact before/after patterns
- Includes context and explanation

### 3. Maintainability
- Single file to edit (`mermaid_examples.py`)
- No prompt engineering required
- Clear separation of concerns

### 4. Flexibility
- Easy to add/remove examples
- Can filter examples by category
- Can dynamically select relevant examples

### 5. Documentation
- Examples serve as documentation
- Shows common pitfalls
- Helps onboard new developers

## Technical Details

### Dynamic Prompt Building

```python
# prompts.py
def get_system_third_prompt_with_examples() -> str:
    """
    Returns SYSTEM_THIRD_PROMPT with real-world examples appended.
    This allows examples to be updated without modifying the core prompt.
    """
    return SYSTEM_THIRD_PROMPT + "\n\n" + get_examples_as_prompt_text()
```

### Example Formatting

```python
# mermaid_examples.py
def get_examples_as_prompt_text() -> str:
    """Format examples as text suitable for inclusion in AI prompts."""
    prompt_text = "**COMMON SYNTAX ERRORS AND CORRECTIONS:**\n\n"
    
    for i, (description, incorrect, correct, explanation) in enumerate(MERMAID_SYNTAX_EXAMPLES, 1):
        prompt_text += f"**Example {i}: {description}**\n\n"
        prompt_text += f"❌ INCORRECT:\n```\n{incorrect}\n```\n\n"
        prompt_text += f"✅ CORRECT:\n```\n{correct}\n```\n\n"
        prompt_text += f"💡 Why: {explanation}\n\n"
        prompt_text += "---\n\n"
    
    return prompt_text
```

### Integration Point

```python
# routers/generate.py (Phase 3)
try:
    # Use the enhanced prompt with real-world examples
    system_prompt_with_examples = get_system_third_prompt_with_examples()
    
    diagram_chunks = []
    if hasattr(service, 'call_api_stream'):
        async for chunk in service.call_api_stream(
            system_prompt=system_prompt_with_examples,  # ← Enhanced prompt
            data={
                "explanation": explanation,
                "component_mapping": component_mapping_text,
                "instructions": body.instructions,
            },
            api_key=body.api_key,
        ):
            diagram_chunks.append(chunk)
```

## Future Enhancements

### 1. Category-Based Selection
```python
def get_examples_by_category(category: str) -> str:
    """Get only examples for a specific error category."""
    filtered = [ex for ex in MERMAID_SYNTAX_EXAMPLES 
                if category.lower() in ex[0].lower()]
    return format_examples(filtered)
```

### 2. Error Pattern Detection
```python
def get_relevant_examples(diagram: str) -> str:
    """Analyze diagram and return relevant examples."""
    issues = detect_issues(diagram)
    return get_examples_for_issues(issues)
```

### 3. Example Effectiveness Tracking
```python
def track_example_effectiveness(example_id: int, prevented_error: bool):
    """Track which examples are most effective."""
    # Log to database or metrics system
```

### 4. Automatic Example Generation
```python
def generate_example_from_error(error_diagram: str, fixed_diagram: str):
    """Auto-generate example from validation fixes."""
    # Extract the specific error pattern
    # Create example tuple
    # Suggest to user for approval
```

## Performance Considerations

### Prompt Size
- Current: ~11 examples = ~2-3KB of text
- Recommended max: 20-30 examples
- Monitor token usage in API calls

### Loading Time
- Examples loaded once at import
- No runtime overhead
- Cached in memory

### Maintenance
- Review examples quarterly
- Remove duplicates
- Consolidate similar patterns

## Testing

### Manual Testing
1. Add example
2. Restart backend
3. Generate diagram with similar pattern
4. Verify error is avoided

### Automated Testing (Future)
```python
def test_examples_prevent_errors():
    """Test that examples prevent their documented errors."""
    for desc, incorrect, correct, _ in MERMAID_SYNTAX_EXAMPLES:
        # Generate diagram with similar pattern
        # Verify it matches correct version
        assert generated_matches_correct(correct)
```

## Monitoring

### Metrics to Track
- Error rate before/after adding examples
- Most common error types
- Example effectiveness
- Token usage increase from examples

### Logging
```python
if DEBUG:
    print(f"[DEBUG] Using {get_examples_count()} examples in prompt")
    print(f"[DEBUG] Prompt size: {len(system_prompt_with_examples)} chars")
```

## Rollback Plan

If examples cause issues:

1. **Disable examples temporarily:**
   ```python
   # In generate.py, use original prompt:
   system_prompt=SYSTEM_THIRD_PROMPT  # Instead of get_system_third_prompt_with_examples()
   ```

2. **Remove problematic example:**
   - Edit `mermaid_examples.py`
   - Remove the tuple
   - Restart backend

3. **Revert changes:**
   ```bash
   git revert <commit-hash>
   ```

## Conclusion

This system provides a **flexible, maintainable, and scalable** way to continuously improve Mermaid diagram generation by learning from real-world errors. It requires minimal code changes to add new examples and integrates seamlessly with the existing prompt system.

## Quick Reference

| Task | File | Action |
|------|------|--------|
| Add example | `mermaid_examples.py` | Add tuple to list |
| View examples | `mermaid_examples.py` | Run `get_examples_as_prompt_text()` |
| Disable examples | `generate.py` | Use `SYSTEM_THIRD_PROMPT` |
| Change format | `mermaid_examples.py` | Edit `get_examples_as_prompt_text()` |
| Documentation | `EXAMPLES_README.md` | Read comprehensive guide |
| Quick start | `QUICK_ADD_EXAMPLE.md` | Follow template |

---

**Ready to use!** Start adding examples from production errors to continuously improve diagram quality.
