# Underscore Arrow Syntax Fix

## Problem
AI models were generating invalid Mermaid syntax using underscore arrows (`__>`, `_._>`, etc.) instead of proper dash-based arrows (`-->`, `.->`, etc.).

## Solution Implemented

### 1. Enhanced Prompt Examples (`backend/app/mermaid_examples.py`)
Added Example #11 showing invalid underscore arrow syntax:

```python
(
    "Invalid underscore arrow syntax",
    """A __> B
A _._> C
A __>|"calls"| D""",
    """A --> B
A -.-> C
A -->|"calls"| D""",
    "CRITICAL: Underscore arrows (__>, _._>, etc.) are NOT valid Mermaid syntax..."
)
```

### 2. Updated System Prompt (`backend/app/prompts.py`)
Added explicit warnings in three places:

- **RULE 6**: Added underscore arrows to wrong syntax examples
- **Validation Checklist**: Added checkbox for underscore arrow validation
- **Common Mistakes**: Added example #6 showing `__>` → `-->`

### 3. Post-Processing Validation (`backend/app/utils/mermaid_validator.py`)
Added automatic fixes for all underscore arrow variants:

#### Fixed Patterns:
- `__>` → `-->` (solid arrow)
- `<__` → `<--` (reverse solid)
- `_._>` → `.->` (dotted arrow)
- `<_._` → `<-.-` (reverse dotted)
- `__>>` → `==>` (thick arrow)
- `<<__` → `<==` (reverse thick)

#### Works with Labels:
- `A __>|"text"| B` → `A -->|"text"| B`
- Labels are preserved correctly

## How It Works

### Prevention (AI Prompt Level)
1. System prompt includes explicit rules against underscore arrows
2. Real-world examples show incorrect vs correct syntax
3. Validation checklist reminds AI to avoid underscore syntax

### Correction (Post-Processing Level)
1. After AI generates diagram, validator runs automatically
2. All underscore arrow patterns are detected and fixed
3. Fixes are logged and reported to user
4. Fixed diagram is validated again to ensure correctness

## Testing

All tests pass successfully:

```bash
✅ Fixed underscore solid arrows (__> to -->)
✅ Fixed underscore dotted arrows (_._> to .->)
✅ Fixed underscore thick arrows (__>> to ==>)
✅ Fixed reverse underscore solid arrows (<__ to <--)
✅ Fixed reverse underscore dotted arrows (<_._ to <-.-)
✅ Fixed reverse underscore thick arrows (<<__ to <==)
✅ Arrow labels preserved correctly
```

## Benefits

1. **Dual Protection**: Both prevention (prompts) and correction (post-processing)
2. **Zero User Impact**: Invalid syntax is automatically fixed
3. **Transparent**: Users see what fixes were applied
4. **Comprehensive**: Handles all underscore arrow variants
5. **Label-Safe**: Preserves arrow labels during fixes

## Files Modified

1. `backend/app/mermaid_examples.py` - Added Example #11
2. `backend/app/prompts.py` - Enhanced RULE 6, checklist, and common mistakes
3. `backend/app/utils/mermaid_validator.py` - Added underscore arrow fixes

## Usage

The validation runs automatically in the diagram generation pipeline. No user action required.

If you want to test manually:

```python
from app.utils.mermaid_validator import validate_and_fix_mermaid

diagram = """flowchart TD
    A __> B
    B _._> C"""

fixed_diagram, fixes = validate_and_fix_mermaid(diagram)
print(fixes)  # Shows what was fixed
print(fixed_diagram)  # Shows corrected diagram
```

## Future Improvements

If underscore arrows still appear frequently, consider:

1. Adding more prominent warnings in the system prompt
2. Creating a pre-validation step that rejects diagrams with underscore arrows
3. Tracking which AI models generate this error most often
4. Adding model-specific prompt adjustments
