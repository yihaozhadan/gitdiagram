"""
Tests for Mermaid diagram validation and auto-correction.
"""

import pytest
from app.utils.mermaid_validator import validate_and_fix_mermaid, get_validation_report


class TestMermaidValidator:
    """Test suite for Mermaid validation utilities."""

    def test_fix_arrow_spacing(self):
        """Test fixing arrow label spacing."""
        diagram = """flowchart TD
    A -->| "calls API" | B"""
        
        fixed, fixes = validate_and_fix_mermaid(diagram)
        
        assert '-->|"calls API"|' in fixed
        assert any('arrow label spacing' in fix.lower() for fix in fixes)

    def test_fix_subgraph_styling(self):
        """Test removing invalid subgraph class styling."""
        diagram = """flowchart TD
    subgraph "Frontend Layer":::frontend
        A["Component"]
    end"""
        
        fixed, fixes = validate_and_fix_mermaid(diagram)
        
        assert 'subgraph "Frontend Layer"' in fixed
        assert ':::frontend' not in fixed.split('\n')[1]  # Not on subgraph line
        assert any('subgraph' in fix.lower() for fix in fixes)

    def test_fix_node_ids_with_special_chars(self):
        """Test fixing node IDs with dashes and dots."""
        diagram = """flowchart TD
    API-Gateway["API Gateway"]
    user.service["User Service"]
    API-Gateway --> user.service"""
        
        fixed, fixes = validate_and_fix_mermaid(diagram)
        
        assert 'APIGateway' in fixed
        assert 'user_service' in fixed
        assert 'API-Gateway' not in fixed
        assert 'user.service' not in fixed
        assert any('node id' in fix.lower() for fix in fixes)

    def test_add_quotes_to_node_labels(self):
        """Test adding quotes to node labels with special characters."""
        diagram = """flowchart TD
    A[/api/endpoint]
    B[Process (Backend)]"""
        
        fixed, fixes = validate_and_fix_mermaid(diagram)
        
        assert 'A["/api/endpoint"]' in fixed
        assert 'B["Process (Backend)"]' in fixed
        assert any('node label' in fix.lower() for fix in fixes)

    def test_add_quotes_to_arrow_labels(self):
        """Test adding quotes to arrow labels with special characters."""
        diagram = """flowchart TD
    A -->|calls func()| B
    B -->|sends /data| C"""
        
        fixed, fixes = validate_and_fix_mermaid(diagram)
        
        assert '-->|"calls func()"|' in fixed
        assert '-->|"sends /data"|' in fixed
        assert any('arrow label' in fix.lower() for fix in fixes)

    def test_fix_wrong_arrow_syntax(self):
        """Test fixing wrong arrow syntax."""
        diagram = """flowchart TD
    A ---> B
    C <--- D"""
        
        fixed, fixes = validate_and_fix_mermaid(diagram)
        
        assert '-->' in fixed
        assert '<--' in fixed
        assert '--->' not in fixed
        assert '<---' not in fixed
        assert any('arrow syntax' in fix.lower() for fix in fixes)

    def test_add_missing_diagram_type(self):
        """Test adding missing diagram type declaration."""
        diagram = """A["Node A"]
    B["Node B"]
    A --> B"""
        
        fixed, fixes = validate_and_fix_mermaid(diagram)
        
        assert fixed.strip().startswith('flowchart TD')
        assert any('diagram type' in fix.lower() for fix in fixes)

    def test_remove_markdown_fences(self):
        """Test removing markdown code fences."""
        diagram = """```mermaid
flowchart TD
    A --> B
```"""
        
        fixed, fixes = validate_and_fix_mermaid(diagram)
        
        assert '```' not in fixed
        assert 'flowchart TD' in fixed
        assert any('markdown' in fix.lower() or 'fence' in fix.lower() for fix in fixes)

    def test_validation_report_valid_diagram(self):
        """Test validation report for a valid diagram."""
        diagram = """flowchart TD
    A["Node A"] --> B["Node B"]"""
        
        report = get_validation_report(diagram)
        
        assert report['valid'] is True
        assert report['issue_count'] == 0

    def test_validation_report_invalid_diagram(self):
        """Test validation report for an invalid diagram."""
        diagram = """flowchart TD
    subgraph "Layer":::invalid
        A[/api/endpoint]
    end
    A -->| "label" | B"""
        
        report = get_validation_report(diagram)
        
        assert report['valid'] is False
        assert report['issue_count'] > 0
        assert len(report['issues']) > 0

    def test_complex_diagram_with_multiple_issues(self):
        """Test fixing a complex diagram with multiple issues."""
        diagram = """```mermaid
flowchart TD
    API-Gateway[/api/gateway]
    subgraph "Backend":::backend
        user.service["User Service"]
        API-Gateway -->| "calls service" | user.service
    end
    user.service ---> Database
```"""
        
        fixed, fixes = validate_and_fix_mermaid(diagram)
        
        # Should fix all issues
        assert '```' not in fixed
        assert 'APIGateway' in fixed
        assert 'user_service' in fixed
        assert '-->|"calls service"|' in fixed
        assert '-->' in fixed and '--->' not in fixed
        assert 'subgraph "Backend"' in fixed
        assert ':::backend' not in fixed.split('subgraph')[1].split('\n')[0]
        
        # Should have multiple fixes
        assert len(fixes) >= 4

    def test_preserves_valid_syntax(self):
        """Test that valid syntax is preserved."""
        diagram = """flowchart TD
    A["Node A"]:::style1
    B["Node B"]:::style2
    
    subgraph "Layer 1"
        C["Component C"]
    end
    
    A -->|"connects to"| B
    B --> C
    
    click A "src/a.js"
    
    classDef style1 fill:#6366f1,stroke:#4f46e5,color:#fff"""
        
        fixed, fixes = validate_and_fix_mermaid(diagram)
        
        # Should preserve all valid syntax
        assert 'A["Node A"]:::style1' in fixed
        assert 'subgraph "Layer 1"' in fixed
        assert '-->|"connects to"|' in fixed
        assert 'click A "src/a.js"' in fixed
        assert 'classDef style1' in fixed
        
        # Should have minimal or no fixes
        assert len(fixes) <= 2  # Maybe just whitespace cleanup


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
