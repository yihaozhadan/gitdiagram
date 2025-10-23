"""
Mermaid diagram validation and auto-correction utilities.
Helps ensure generated Mermaid diagrams follow proper syntax.
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
    
    # 1. Fix arrow syntax - remove spaces around pipes
    # Pattern: -->| "text" | becomes -->|"text"|
    arrow_pattern = r'(-->|<--|<-->|\.\.>|\-\.\->)\s*\|\s*"([^"]+)"\s*\|'
    if re.search(arrow_pattern, fixed):
        fixed = re.sub(arrow_pattern, r'\1|"\2"|', fixed)
        fixes_applied.append("Fixed arrow label spacing (removed spaces around pipes)")
    
    # 2. Fix subgraph class styling - remove ::: from subgraph lines
    subgraph_pattern = r'(subgraph\s+[^:\n]+)(:::[^\n]+)'
    if re.search(subgraph_pattern, fixed):
        fixed = re.sub(subgraph_pattern, r'\1', fixed)
        fixes_applied.append("Removed invalid class styling from subgraph declarations")
    
    # 3. Fix node IDs with special characters (dashes, dots)
    # This is complex - we'll flag it but not auto-fix to avoid breaking references
    node_id_pattern = r'^[\s]*([A-Za-z0-9_-]+[\.\-][A-Za-z0-9_\.\-]*)\['
    problematic_ids = re.findall(node_id_pattern, fixed, re.MULTILINE)
    if problematic_ids:
        # Replace dashes and dots with underscores in node IDs
        for old_id in set(problematic_ids):
            new_id = old_id.replace('-', '_').replace('.', '_')
            # Replace all occurrences (in definitions, connections, and click events)
            fixed = re.sub(r'\b' + re.escape(old_id) + r'\b', new_id, fixed)
        fixes_applied.append(f"Fixed node IDs with special characters: {', '.join(set(problematic_ids))}")
    
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
    
    # 7. Fix common wrong arrow syntax
    if '--->' in fixed:
        fixed = fixed.replace('--->', '-->')
        fixes_applied.append("Fixed arrow syntax (---> to -->)")
    if '<---' in fixed:
        fixed = fixed.replace('<---', '<--')
        fixes_applied.append("Fixed arrow syntax (<--- to <--)")
    
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
    
    # 9. Remove any remaining markdown code fences
    if '```mermaid' in fixed or '```' in fixed:
        fixed = fixed.replace('```mermaid', '').replace('```', '')
        fixes_applied.append("Removed markdown code fences")
    
    # 10. Clean up excessive whitespace
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
    
    # Check 4: Node IDs with special chars
    problematic_ids = re.findall(r'^[\s]*([A-Za-z0-9_]+[\.\-][A-Za-z0-9_\.\-]*)\[', diagram, re.MULTILINE)
    if problematic_ids:
        warnings.append(f"Node IDs contain special characters: {', '.join(set(problematic_ids))}")
    
    # Check 5: Unquoted special characters
    special_chars = r'[/\(\)\[\]\{\}:;,\.!?@#$%^&*+=<>|]'
    if re.search(r'[A-Za-z0-9_]+\[([^\]"]+' + special_chars + r'[^\]"]*)\]', diagram):
        issues.append("Node labels contain special characters without quotes")
    
    return {
        'valid': len(issues) == 0,
        'issues': issues,
        'warnings': warnings,
        'issue_count': len(issues),
        'warning_count': len(warnings)
    }
