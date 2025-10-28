"""
Mermaid diagram validation and auto-correction utilities.
Helps ensure generated Mermaid diagrams follow proper syntax.
Based on flow_parser.jison lexical grammar from Mermaid.js
"""

import re
from typing import Tuple, List


def validate_and_fix_mermaid(diagram: str) -> Tuple[str, List[str]]:
    """
    Validate and auto-fix common Mermaid syntax errors.
    
    Args:
        diagram: Raw Mermaid diagram code
        
    Returns:
        Tuple of (fixed_diagram, list_of_fixes_applied)
    """
    fixes_applied = []
    
    # Handle empty or None input
    if not diagram or not diagram.strip():
        return diagram, ["Warning: Empty diagram provided"]
    
    fixed = diagram
    
    # 1. Fix arrow syntax - remove spaces around pipes (CRITICAL)
    # Pattern: -->| "text" | becomes -->|"text"|
    # Also handles: --> | "text" | (space before pipe)
    arrow_pattern = r'(-->|<--|<-->|==>|<==|<==>|\.\->|<\.-|<\.->)\s*\|\s*"([^"]+)"\s*\|'
    if re.search(arrow_pattern, fixed):
        fixed = re.sub(arrow_pattern, r'\1|"\2"|', fixed)
        fixes_applied.append("Fixed arrow label spacing (removed spaces around pipes)")
    
    # 1b. Fix arrows with spaces before pipe
    arrow_space_pattern = r'(-->|<--|<-->|==>|<==|<==>|\.\->|<\.-|<\.->)\s+(\|"[^"]+"\|)'
    if re.search(arrow_space_pattern, fixed):
        fixed = re.sub(arrow_space_pattern, r'\1\2', fixed)
        fixes_applied.append("Fixed arrow syntax (removed space before pipe)")
    
    # 2. Fix subgraph class styling - remove ::: from subgraph lines
    subgraph_pattern = r'(subgraph\s+[^:\n]+)(:::[^\n]+)'
    if re.search(subgraph_pattern, fixed):
        fixed = re.sub(subgraph_pattern, r'\1', fixed)
        fixes_applied.append("Removed invalid class styling from subgraph declarations")
    
    # 3. Fix node IDs with special characters (dashes, dots)
    # Based on NODE_STRING token: only alphanumeric + underscore is safe
    # Pattern matches node IDs at start of lines or after spaces
    node_id_pattern = r'(?:^|\s)([A-Za-z0-9_]*[\-\.][A-Za-z0-9_\-\.]*)(?=\[|\(|\{|\s|-->|<--|==>|<==|\.\->)'
    problematic_ids = re.findall(node_id_pattern, fixed, re.MULTILINE)
    if problematic_ids:
        # Replace dashes and dots with underscores in node IDs
        for old_id in set(problematic_ids):
            if old_id:  # Skip empty matches
                new_id = old_id.replace('-', '_').replace('.', '_')
                # Replace all occurrences (in definitions, connections, and click events)
                # Use word boundaries to avoid partial replacements
                fixed = re.sub(r'(?<![A-Za-z0-9_])' + re.escape(old_id) + r'(?![A-Za-z0-9_])', new_id, fixed)
        fixes_applied.append(f"Fixed node IDs with special characters: {', '.join([id for id in set(problematic_ids) if id])}")
    
    # 4. Ensure special characters in labels are quoted
    # Check node labels: NodeID[text] should be NodeID["text"] if text has special chars
    special_chars = r'[/\(\)\[\]\{\}:;,\.!?@#$%^&*+=<>|]'
    
    # Pattern for node labels without quotes but with special chars
    node_label_pattern = r'([A-Za-z0-9_]+)\[([^\]"]+' + special_chars + r'[^\]"]*)\]'
    matches = re.findall(node_label_pattern, fixed)
    if matches:
        for node_id, label in matches:
            # Skip if already quoted
            if not (label.startswith('"') and label.endswith('"')):
                old_pattern = f'{node_id}[{label}]'
                new_pattern = f'{node_id}["{label}"]'
                fixed = fixed.replace(old_pattern, new_pattern)
        fixes_applied.append("Added quotes to node labels with special characters")
    
    # 5. Fix arrow labels without quotes but with special chars
    arrow_label_pattern = r'(-->|<--|<-->|\.\.>|\-\.\->)\|([^|"]+' + special_chars + r'[^|"]*)\|'
    matches = re.findall(arrow_label_pattern, fixed)
    if matches:
        for arrow, label in matches:
            if not (label.strip().startswith('"') and label.strip().endswith('"')):
                old_pattern = f'{arrow}|{label}|'
                new_pattern = f'{arrow}|"{label.strip()}"|'
                fixed = fixed.replace(old_pattern, new_pattern)
        fixes_applied.append("Added quotes to arrow labels with special characters")
    
    # 6. Ensure diagram starts with valid type
    valid_starts = ['graph ', 'flowchart ', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram', 'gitGraph', 'journey', 'gantt', 'pie', 'quadrantChart', 'requirementDiagram', 'C4Context']
    first_line = fixed.strip().split('\n')[0].strip()
    if not any(first_line.startswith(start) for start in valid_starts):
        # Try to find and fix
        if 'graph' in first_line.lower() or 'flowchart' in first_line.lower():
            fixed = 'flowchart TD\n' + fixed
            fixes_applied.append("Added missing diagram type declaration")
    
    # 7. Fix common wrong arrow syntax (based on LINK tokens in jison)
    
    # 7a. Fix underscore arrows (CRITICAL - NOT valid Mermaid syntax)
    # Fix thick arrows first (to avoid partial replacements)
    if '__>>' in fixed:
        fixed = fixed.replace('__>>', '==>')
        fixes_applied.append("Fixed underscore thick arrows (__>> to ==>)")
    if '<<__' in fixed:
        fixed = fixed.replace('<<__', '<==')
        fixes_applied.append("Fixed reverse underscore thick arrows (<<__ to <==)")
    
    # Then fix regular arrows
    if '__>' in fixed:
        fixed = fixed.replace('__>', '-->')
        fixes_applied.append("Fixed underscore solid arrows (__> to -->)")
    if '<__' in fixed:
        fixed = fixed.replace('<__', '<--')
        fixes_applied.append("Fixed reverse underscore solid arrows (<__ to <--)")
    
    # Fix dotted arrows
    if '_._>' in fixed:
        fixed = fixed.replace('_._>', '.->')
        fixes_applied.append("Fixed underscore dotted arrows (_._> to .->)")
    if '<_._' in fixed:
        fixed = fixed.replace('<_._', '<-.-')
        fixes_applied.append("Fixed reverse underscore dotted arrows (<_._ to <-.-)")
    
    # 7b. Fix triple-dash arrows
    if '--->' in fixed:
        fixed = fixed.replace('--->', '-->')
        fixes_applied.append("Fixed arrow syntax (---> to -->)")
    if '<---' in fixed:
        fixed = fixed.replace('<---', '<--')
        fixes_applied.append("Fixed arrow syntax (<--- to <--)")
    if '===>' in fixed:
        fixed = fixed.replace('===>', '==>')
        fixes_applied.append("Fixed arrow syntax (===> to ==>)")
    if '<===' in fixed:
        fixed = fixed.replace('<===', '<==')
        fixes_applied.append("Fixed arrow syntax (<=== to <==)")
    
    # 7c. Fix single dash arrows (not valid)
    single_arrow_pattern = r'(?<!-)(?<!\.)\->(?!-)'
    if re.search(single_arrow_pattern, fixed):
        fixed = re.sub(single_arrow_pattern, '-->', fixed)
        fixes_applied.append("Fixed single-dash arrows (-> to -->)")
    
    # 8. Ensure classDef has proper color properties
    classdef_pattern = r'classDef\s+(\w+)\s+([^\n]+)'
    classdefs = re.findall(classdef_pattern, fixed)
    for class_name, properties in classdefs:
        # Check if it has fill, stroke, and color
        has_fill = 'fill:' in properties
        has_stroke = 'stroke:' in properties
        has_color = 'color:' in properties
        
        if not (has_fill and has_stroke):
            # This is a warning, not an auto-fix (too complex)
            fixes_applied.append(f"Warning: classDef '{class_name}' may be missing fill/stroke/color properties")
    
    # 9. Fix single quotes to double quotes (jison only recognizes double quotes)
    # Pattern: Node labels with single quotes
    single_quote_label_pattern = r"([A-Za-z0-9_]+)\['([^']+)'\]"
    if re.search(single_quote_label_pattern, fixed):
        fixed = re.sub(single_quote_label_pattern, r'\1["\2"]', fixed)
        fixes_applied.append("Fixed single quotes to double quotes in node labels")
    
    # Pattern: Arrow labels with single quotes
    single_quote_arrow_pattern = r"(-->|<--|<-->|==>|<==|<==>|\.\->|<\.-|<\.->)\|'([^']+)'\|"
    if re.search(single_quote_arrow_pattern, fixed):
        fixed = re.sub(single_quote_arrow_pattern, r"\1|\"\2\"|" , fixed)
        fixes_applied.append("Fixed single quotes to double quotes in arrow labels")
    
    # 10. Remove any remaining markdown code fences
    if '```mermaid' in fixed or '```' in fixed:
        fixed = fixed.replace('```mermaid', '').replace('```', '')
        fixes_applied.append("Removed markdown code fences")
    
    # 11. Fix subgraph with ID prefix (not allowed in basic flowcharts)
    # Pattern: subgraph id "Name" or subgraph id["Name"]
    subgraph_id_pattern = r'subgraph\s+([A-Za-z0-9_]+)\s+["\[]'
    if re.search(subgraph_id_pattern, fixed):
        # Remove the ID, keep just the name
        fixed = re.sub(r'subgraph\s+[A-Za-z0-9_]+\s+', 'subgraph ', fixed)
        fixes_applied.append("Removed invalid ID prefix from subgraph declarations")
    
    # 12. Ensure all node labels are quoted (best practice)
    # Pattern: NodeID[text] where text has no quotes but should be quoted
    unquoted_label_pattern = r'([A-Za-z0-9_]+)\[([^"\[\]]+)\](?!::)'
    matches = re.findall(unquoted_label_pattern, fixed)
    if matches:
        for node_id, label in matches:
            # Skip if it's already a shape syntax like (text) or {text}
            if not (label.startswith('(') or label.startswith('{') or label.startswith('[')):
                old_pattern = f'{node_id}[{label}]'
                new_pattern = f'{node_id}["{label}"]'
                fixed = fixed.replace(old_pattern, new_pattern)
        fixes_applied.append("Added quotes to unquoted node labels")
    
    # 13. Clean up excessive whitespace
    lines = fixed.split('\n')
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped:  # Keep non-empty lines
            cleaned_lines.append(stripped)
    fixed = '\n'.join(cleaned_lines)
    
    return fixed, fixes_applied


def get_validation_report(diagram: str) -> dict:
    """
    Generate a validation report for a Mermaid diagram.
    
    Args:
        diagram: Mermaid diagram code
        
    Returns:
        Dictionary with validation results
    """
    issues = []
    warnings = []
    
    # Handle empty or None input
    if not diagram or not diagram.strip():
        return {
            'valid': False,
            'issues': ['Diagram is empty'],
            'warnings': [],
            'issue_count': 1,
            'warning_count': 0
        }
    
    # Check 1: Valid diagram type
    valid_starts = ['graph ', 'flowchart ', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram']
    lines = diagram.strip().split('\n')
    first_line = lines[0] if lines else ''
    if not any(first_line.startswith(start) for start in valid_starts):
        issues.append("Missing or invalid diagram type declaration")
    
    # Check 2: Subgraph syntax
    if re.search(r'subgraph\s+[^:\n]+(:::[^\n]+)', diagram):
        issues.append("Subgraph has invalid class styling (:::)")
    
    # Check 3: Arrow spacing
    if re.search(r'(-->|<--|<-->)\s*\|\s*"[^"]+"\s*\|', diagram):
        issues.append("Arrow labels have incorrect spacing around pipes")
    
    # Check 4: Node IDs with special chars (based on NODE_STRING token)
    problematic_ids = re.findall(r'(?:^|\s)([A-Za-z0-9_]*[\-\.][A-Za-z0-9_\-\.]*)(?=\[|\(|\{|\s|-->|<--|==>)', diagram, re.MULTILINE)
    if problematic_ids:
        issues.append(f"Node IDs contain dashes or dots: {', '.join([id for id in set(problematic_ids) if id])}")
    
    # Check 5: Unquoted special characters in labels
    special_chars = r'[/\(\)\[\]\{\}:;,\.!?@#$%^&*+=<>|\-]'
    if re.search(r'[A-Za-z0-9_]+\[([^\]"]+' + special_chars + r'[^\]"]*)\]', diagram):
        issues.append("Node labels contain special characters without quotes")
    
    # Check 6: Single quotes instead of double quotes
    if re.search(r"[A-Za-z0-9_]+\['[^']+'\]", diagram):
        issues.append("Node labels use single quotes (should be double quotes)")
    if re.search(r"(-->|<--|<-->|==>|<==|<==>|\.\->)\|'[^']+'\|", diagram):
        issues.append("Arrow labels use single quotes (should be double quotes)")
    
    # Check 7: Wrong arrow syntax
    # Check 7a: Underscore arrows (CRITICAL - not valid)
    if '__>' in diagram or '<__' in diagram:
        issues.append("Arrows use underscore syntax (__>, <__) which is NOT valid Mermaid syntax")
    if '_._>' in diagram or '<_._' in diagram:
        issues.append("Dotted arrows use underscore syntax (_._>, <_._) which is NOT valid Mermaid syntax")
    
    # Check 7b: 3+ dashes/equals
    if '--->' in diagram or '<---' in diagram:
        issues.append("Arrows use 3+ dashes (should be exactly 2: -->)")
    if '===>' in diagram or '<===' in diagram:
        issues.append("Arrows use 3+ equals (should be exactly 2: ==>)")
    
    # Check 8: Subgraph with ID prefix
    if re.search(r'subgraph\s+[A-Za-z0-9_]+\s+["\[]', diagram):
        issues.append("Subgraph has invalid ID prefix (use: subgraph \"Name\")")
    
    # Check 9: Space before pipe in arrow labels
    if re.search(r'(-->|<--|<-->|==>|<==|<==>|\.\->)\s+\|', diagram):
        issues.append("Arrow labels have space before pipe (should be: -->|\"text\"|)")
    
    return {
        'valid': len(issues) == 0,
        'issues': issues,
        'warnings': warnings,
        'issue_count': len(issues),
        'warning_count': len(warnings)
    }
