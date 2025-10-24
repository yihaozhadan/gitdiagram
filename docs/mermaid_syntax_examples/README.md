# Mermaid Syntax Examples - Production Error Collection

This directory contains real production examples of Mermaid diagrams with syntax errors, their fixes, and analyses.

## Purpose

These examples serve as:
1. **Training data** for the AI model (via `backend/app/mermaid_examples.py`)
2. **Documentation** of common errors and their solutions
3. **Testing cases** for validation improvements
4. **Reference** for developers

## Directory Structure

```
mermaid_syntax_examples/
├── README.md                 # This file
├── glances_bad.mmd          # Glances project - bad version
├── glances_fixed.mmd        # Glances project - corrected
├── glances_analysis.md      # Detailed error analysis
├── ghostty_bad.mmd          # Ghostty project - bad version
├── ghostty_fixed.mmd        # Ghostty project - corrected
└── ghostty_analysis.md      # Detailed error analysis
```

## Examples Summary

### 1. Glances Project (System Monitor)
**Date:** 2025-10-23  
**Errors Found:** 94+  
**Severity:** 🔴 CRITICAL

**Key Issues:**
- ❌ Reused node ID "A" for 40+ nodes (CATASTROPHIC)
- ❌ Malformed arrow labels (19 instances)
- ❌ Non-Mermaid text after diagram (35 lines)
- ❌ Mismatched brackets in node definition

**Examples Added to System:** 4
- Reused node IDs
- Mismatched brackets
- Malformed arrow labels
- Non-Mermaid text

**Files:**
- `glances_bad.mmd` - Original with errors
- `glances_fixed.mmd` - Corrected version
- `glances_analysis.md` - Full analysis

---

### 2. Ghostty Project (Terminal Emulator)
**Date:** 2025-10-23  
**Errors Found:** 28  
**Severity:** 🔴 CRITICAL

**Key Issues:**
- ❌ Invalid "Connect" keyword (15 instances)
- ❌ Class names with dashes (5 instances)
- ❌ Invalid "orient" statement
- ❌ Trailing period at end

**Examples Added to System:** 4
- Invalid "Connect" syntax
- Class names with dashes
- Invalid "orient" statement
- Trailing period

**Files:**
- `ghostty_bad.mmd` - Original with errors
- `ghostty_fixed.mmd` - Corrected version
- `ghostty_analysis.md` - Full analysis

---

### 3. PouchDB Project (Database Library)
**Date:** 2025-10-23  
**Errors Found:** 18+  
**Severity:** 🔴 CRITICAL

**Key Issues:**
- ❌ Undefined node references (9+ instances)
- ❌ Subgraph with both ID and label
- ❌ Colons in node IDs (2 instances)
- ❌ Node IDs with underscores (3+ instances)

**Examples Added to System:** 4
- Subgraph with ID and label
- Node IDs with underscores
- Undefined node references
- Colons in node IDs

**Files:**
- `pouchdb_bad.mmd` - Original with errors
- `pouchdb_fixed.mmd` - Corrected version
- `pouchdb_analysis.md` - Full analysis

---

## Error Categories

### Critical Errors (Parser Failures)
1. **Reused Node IDs** - All nodes overwrite each other
2. **Invalid Keywords** - "Connect", "orient" not recognized
3. **Malformed Arrow Labels** - Unclosed quotes/pipes
4. **Non-Mermaid Text** - Plain text breaks parser
5. **Undefined Node References** - Nodes used but never defined
6. **Special Characters in Node IDs** - Colons, dots cause errors

### High Severity Errors (Rendering Issues)
1. **Undefined Classes** - Styling fails
2. **Class Names with Dashes** - May not parse
3. **Mismatched Brackets** - Shape syntax errors
4. **Invalid Subgraph Syntax** - ID + label not allowed

### Medium/Low Errors (Best Practices)
1. **Trailing Punctuation** - Unnecessary periods
2. **Unquoted Subgraph Names** - Works but not ideal
3. **Node IDs with Underscores** - Use camelCase instead

---

## How to Use This Directory

### Adding New Examples

1. **Encounter error** in production
2. **Save bad version:** `project_name_bad.mmd`
3. **Create fixed version:** `project_name_fixed.mmd`
4. **Write analysis:** `project_name_analysis.md`
5. **Add to system:** Update `backend/app/mermaid_examples.py`

### Template for Analysis

```markdown
# Project Name - Mermaid Syntax Error Analysis

**Date:** YYYY-MM-DD
**Source:** `filename.mmd`
**Status:** ✅ Fixed

## Summary
Brief overview of errors found

## Syntax Errors Identified
### 1. Error Name
- Lines affected
- Error example
- Fix example
- Root cause
- Impact

## Examples Added to System
List of examples added

## Statistics
- Errors found
- Errors fixed
- Prevention value
```

---

## Statistics

### Overall
- **Total Projects Analyzed:** 4 (Lumi, Glances, Ghostty, PouchDB)
- **Total Errors Found:** 154+
- **Total Examples Added:** 16
- **Total Examples in System:** 28

### By Severity
- **Critical Errors:** 133 (86%)
- **High Errors:** 17 (11%)
- **Medium/Low Errors:** 4 (3%)

### Most Common Errors
1. **Reused Node IDs** - 40+ instances (Glances)
2. **Malformed Arrow Labels** - 19 instances (Glances)
3. **Invalid "Connect" Keyword** - 15 instances (Ghostty)
4. **Undefined Node References** - 9+ instances (PouchDB)
5. **Undefined Classes** - 8+ instances (Multiple)

---

## Key Learnings

### 1. Node IDs Must Be Unique
**Never** reuse node IDs. Each node needs a unique identifier.

### 2. No "Connect" Keyword
Connections are created directly: `A -->|"label"| B`

### 3. Arrow Labels Need Complete Syntax
Format: `-->|"text"|` with both quotes and both pipes

### 4. Only Mermaid Code Allowed
No documentation or plain text after the diagram

### 5. Class Names Should Be Simple
No dashes, use camelCase: `:::myClass` not `:::my-class`

### 6. All Classes Must Be Defined
Every `:::className` needs a `classDef className ...`

### 7. Direction in Declaration
Use `flowchart TD/LR`, not "orient"

### 8. No Trailing Punctuation
Diagrams end naturally with `end` or last statement

### 9. Define All Nodes Before Connections
Every node referenced in a connection must be defined first

### 10. No Special Characters in Node IDs
Avoid colons, dots, dashes - use alphanumeric camelCase only

### 11. Simple Subgraph Syntax
Use either `subgraph "label"` or `subgraph id`, not both

---

## Impact on AI Model

### Before Examples
- AI might generate reused node IDs
- "Connect" keyword might appear
- Arrow labels might be malformed
- Documentation might be appended
- Undefined node references
- Special characters in node IDs
- Invalid subgraph syntax

### After Examples
- Unique node IDs enforced
- Direct arrow syntax used
- Proper label formatting
- Pure Mermaid code only
- All nodes defined before use
- Clean alphanumeric node IDs
- Correct subgraph syntax

---

## Testing

### Validation Tests
1. **Render bad versions** → Should fail
2. **Render fixed versions** → Should succeed
3. **Compare outputs** → Verify all nodes/connections work

### Regression Tests
Generate new diagrams and check for:
- Unique node IDs
- No "Connect" keyword
- Proper arrow label syntax
- No non-Mermaid text
- Valid class names
- All classes defined
- All nodes defined before connections
- No special characters in node IDs
- Valid subgraph syntax

---

## Future Additions

### Planned Examples
- Sequence diagram errors
- State diagram errors
- Class diagram errors
- Complex nested subgraphs
- Advanced styling issues

### Validation Improvements
- Pre-generation node ID uniqueness check
- "Connect" keyword blocker
- Arrow label syntax validator
- Class definition validator
- Automated text stripping

---

## Contributing

When adding new examples:

1. ✅ Use real production errors
2. ✅ Include complete context
3. ✅ Provide detailed analysis
4. ✅ Add to mermaid_examples.py
5. ✅ Test both bad and fixed versions
6. ✅ Document root causes
7. ✅ Update this README

---

## Resources

- **Main Examples File:** `backend/app/mermaid_examples.py`
- **Validator:** `backend/app/utils/mermaid_validator.py`
- **Prompts:** `backend/app/prompts.py`
- **Grammar Reference:** `backend/app/flow_parser.jison`

---

**Last Updated:** 2025-10-23  
**Total Examples:** 28  
**Projects Analyzed:** 4 (Lumi, Glances, Ghostty, PouchDB)
