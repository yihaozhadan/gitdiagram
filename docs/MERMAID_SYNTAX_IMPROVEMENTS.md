# Mermaid Diagram Syntax Improvements

## Overview
This document describes the improvements made to reduce "Syntax error in text" errors when generating Mermaid flowchart diagrams. The improvements leverage the official Mermaid.js lexical grammar file (`flow_parser.jison`) to ensure generated diagrams follow exact syntax rules.

## Changes Made

### 1. Enhanced `backend/app/prompts.py` (SYSTEM_THIRD_PROMPT)

#### Key Improvements:
- **Extracted precise syntax rules from `flow_parser.jison`** lexical grammar
- **Added 11 critical rules** with examples of correct vs incorrect syntax
- **Included validation checklist** that LLMs must verify before output
- **Added common mistakes section** with 6 frequent errors and their fixes

#### Specific Grammar Rules Added:

**RULE 1: Node ID Syntax (FROM JISON: NODE_STRING token)**
- Valid chars: A-Z, a-z, 0-9, and ONLY: ! " # $ % & ' * + . ` ? \ _ /
- Dash (-) only valid if NOT followed by > or - or .
- Best practice: Use ONLY alphanumeric + underscore

**RULE 2: Node Label Quoting (CRITICAL)**
- ALL labels with special chars MUST be in double quotes
- Special chars: / ( ) [ ] { } | : ; , . ! ? @ # $ % ^ & * + = < > -
- Best practice: Always quote all labels

**RULE 3: Arrow Label Syntax (MOST COMMON ERROR)**
- Format: `-->|"label"|` (NO spaces around pipes)
- Pipes | are lexer delimiters that enter/exit text mode
- Critical: No spaces between arrow and pipe

**RULE 4: Subgraph Syntax (FROM JISON: subgraph statement)**
- Format: `subgraph "Name"` (NO aliases, NO class styling)
- Close with: `end`

**RULE 5: Class Styling (FROM JISON: STYLE_SEPARATOR token)**
- Apply to nodes: `NodeID["Label"]:::className`
- Cannot style subgraphs directly

**RULE 6: Arrow Types (FROM JISON: LINK tokens)**
- Solid: `-->`, `<--`, `<-->` (exactly 2 dashes)
- Thick: `==>`, `<==`, `<==>` (exactly 2 equals)
- Dotted: `-.->`, `<-.`, `<.->` (dash-dot-dash)

**RULE 7: Node Shapes (FROM JISON: vertex rules)**
- Rectangle: `A["text"]`
- Round: `A("text")`
- Stadium: `A(["text"])`
- Cylinder: `A[("text")]`
- Circle: `A(("text"))`
- Diamond: `A{"text"}`
- Hexagon: `A{{"text"}}`
- And more...

**RULE 8: Click Events (FROM JISON: clickStatement)**
- Format: `click NodeID "path/to/file"`

**RULE 9: String Quoting (FROM JISON: string lexer state)**
- Use double quotes `"text"` (NOT single quotes)

**RULE 10: Comments**
- Use `%%` (double percent)

**RULE 11: Diagram Structure Template**
- Provided complete template with proper ordering

### 2. Enhanced `backend/app/utils/mermaid_validator.py`

#### New Validation & Auto-Fix Rules:

1. **Enhanced arrow label spacing fix**
   - Now handles: `-->|"text"|`, `--> |"text"|`, `--> | "text" |`
   - Supports all arrow types: `-->`, `==>`, `-.->`, etc.

2. **Improved node ID validation**
   - Better pattern matching based on NODE_STRING token
   - Replaces dashes and dots with underscores
   - Uses word boundaries to avoid partial replacements

3. **Fixed wrong arrow syntax**
   - `--->` → `-->`
   - `====>` → `==>`
   - `->` → `-->` (single dash arrows)

4. **Single quote to double quote conversion**
   - Node labels: `A['text']` → `A["text"]`
   - Arrow labels: `-->|'text'|` → `-->|"text"|`

5. **Subgraph ID prefix removal**
   - `subgraph api "API"` → `subgraph "API"`

6. **Unquoted label detection**
   - Automatically adds quotes to labels without them

7. **Enhanced validation report**
   - 9 comprehensive checks based on jison grammar
   - Detects: single quotes, wrong arrows, subgraph issues, spacing errors

## Expected Impact

### Before:
- Frequent "Syntax error in text" errors
- Common issues:
  - Spaces around pipes in arrow labels
  - Dashes in node IDs
  - Single quotes instead of double quotes
  - Wrong arrow syntax (3+ dashes)
  - Unquoted special characters

### After:
- **Proactive prevention** via enhanced prompts
- **Automatic correction** via improved validator
- **Comprehensive validation** with detailed error reports
- **Grammar-based rules** ensure compliance with Mermaid.js parser

## Technical Details

### Grammar File Reference
All rules are based on:
- **File**: `backend/app/flow_parser.jison`
- **Source**: Mermaid.js official parser grammar
- **Key tokens**: NODE_STRING, LINK, STYLE_SEPARATOR, string lexer states

### Validation Flow
1. **Generation Phase** (`generate.py`):
   - LLM receives enhanced prompts with grammar rules
   - Generates diagram following strict syntax

2. **Validation Phase** (`mermaid_validator.py`):
   - `get_validation_report()` checks for issues
   - `validate_and_fix_mermaid()` auto-corrects common errors
   - Returns fixed diagram + list of applied fixes

3. **Post-Processing** (`generate.py`):
   - Click events get GitHub URLs added
   - Final validation before sending to client

## Testing Recommendations

1. **Test with repositories that previously failed**
2. **Monitor error rates** in production
3. **Collect examples** of any remaining syntax errors
4. **Iterate on prompts** based on real-world failures

## Future Improvements

1. **Add more shape validations** (trapezoid, hexagon syntax)
2. **Validate classDef properties** more strictly
3. **Check node reference consistency** (click events match defined nodes)
4. **Add support for other diagram types** (sequence, class, state diagrams)
5. **Create unit tests** with grammar-based test cases

## Files Modified

- ✅ `backend/app/prompts.py` - Enhanced SYSTEM_THIRD_PROMPT with grammar rules
- ✅ `backend/app/utils/mermaid_validator.py` - Improved validation and auto-fix logic
- 📖 `backend/app/flow_parser.jison` - Reference grammar file (no changes)
- 📖 `backend/app/routers/generate.py` - Uses validator (no changes needed)

## Conclusion

By leveraging the official Mermaid.js grammar file, we've created a comprehensive system that:
1. **Educates the LLM** with precise syntax rules
2. **Validates generated diagrams** against grammar patterns
3. **Auto-corrects common errors** before rendering
4. **Provides detailed feedback** on syntax issues

This should significantly reduce "Syntax error in text" occurrences and improve the overall quality of generated diagrams.
