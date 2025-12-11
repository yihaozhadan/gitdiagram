"""
Test script to verify Mermaid code extraction from AI responses.
This simulates the extraction logic used in generate.py
"""

import re

def extract_mermaid_code(ai_response: str, debug: bool = True) -> tuple[str, bool]:
    """
    Extract Mermaid code from AI response.
    
    Args:
        ai_response: Full AI response including thinking, explanation, etc.
        debug: Print debug information
        
    Returns:
        Tuple of (extracted_code, success)
    """
    # Extract Mermaid code from markdown code fence if present
    mermaid_pattern = r'```(?:mermaid)?\s*\n(.*?)```'
    mermaid_match = re.search(mermaid_pattern, ai_response, re.DOTALL)
    
    if mermaid_match:
        # Extract the content between code fences
        full_diagram = mermaid_match.group(1).strip()
        if debug:
            print(f"✅ Extracted Mermaid code from markdown fence ({len(full_diagram)} chars)")
        return full_diagram, True
    else:
        # No code fence found
        if debug:
            print("❌ No markdown fence found")
        return "", False


def test_extraction():
    """Test various AI response formats."""
    
    print("=" * 70)
    print("TESTING MERMAID CODE EXTRACTION")
    print("=" * 70)
    
    # Test 1: AI response with thinking, explanation, and mapping
    test1 = """<think> Let me analyze... </think>
<explanation>
This is the explanation of the system.
</explanation>
<component_mapping>
1. Component A: path/to/a
2. Component B: path/to/b
</component_mapping>

```mermaid
flowchart TD
    A["Node A"]
    B["Node B"]
    A --> B
```"""
    
    print("\n📝 TEST 1: Full AI response with tags")
    print("-" * 70)
    extracted, success = extract_mermaid_code(test1)
    if success:
        print(f"Extracted code:\n{extracted}")
        print(f"Starts with valid type: {extracted.startswith(('flowchart', 'graph'))}")
    else:
        print("FAILED")
    
    # Test 2: AI response with underscore arrows (should be extracted, then fixed by validator)
    test2 = """```mermaid
flowchart TD
    A["Frontend"]
    B["Backend"]
    A __> B
    B _._> C
```"""
    
    print("\n📝 TEST 2: Mermaid code with underscore arrows")
    print("-" * 70)
    extracted, success = extract_mermaid_code(test2)
    if success:
        print(f"Extracted code:\n{extracted}")
        print(f"Contains underscore arrows: {'__>' in extracted or '_._>' in extracted}")
        print("(These will be fixed by the validator)")
    else:
        print("FAILED")
    
    # Test 3: Plain Mermaid code without fence
    test3 = """flowchart TD
    A["Node A"]
    B["Node B"]
    A --> B"""
    
    print("\n📝 TEST 3: Plain Mermaid code without fence")
    print("-" * 70)
    extracted, success = extract_mermaid_code(test3)
    if not success:
        print("No fence found (expected)")
        print("Fallback: would clean fence markers")
    
    # Test 4: Code fence without 'mermaid' keyword
    test4 = """Some text before

```
flowchart TD
    A --> B
```

Some text after"""
    
    print("\n📝 TEST 4: Code fence without 'mermaid' keyword")
    print("-" * 70)
    extracted, success = extract_mermaid_code(test4)
    if success:
        print(f"Extracted code:\n{extracted}")
        print(f"Starts with valid type: {extracted.startswith(('flowchart', 'graph'))}")
    else:
        print("FAILED")
    
    # Test 5: Complex real-world example
    test5 = """<think>
I need to create a comprehensive diagram showing the main process, renderer process, and all subsystems.
</think>

<explanation>
This is a desktop markdown editor with Electron architecture.
Key components include:
- Main Process (file operations, menus)
- Renderer Process (Vue.js UI)
- Editor engines (Milkdown, Vditor)
- Theme system
- Plugin architecture
</explanation>

<component_mapping>
1. Main Process: src/main/
2. Renderer Process: src/renderer/
3. Milkdown Editor: src/renderer/components/MilkdownEditor.vue
4. Theme Manager: src/utils/themeManager.ts
</component_mapping>

```mermaid
flowchart TD
    %% Main Process
    subgraph "Main Process Layer"
        mainEntry["src/main/index.ts"]:::main
        menuManager["src/main/menu.ts"]:::main
        ipcBridge["src/main/ipcBridge.ts"]:::main
        
        mainEntry --> menuManager
        mainEntry --> ipcBridge
    end
    
    %% Renderer Process
    subgraph "Renderer Process Layer"
        appComponent["src/renderer/App.vue"]:::frontend
        milkdownEditor["MilkdownEditor"]:::editor
        
        appComponent --> milkdownEditor
    end
    
    %% Communication
    ipcBridge <-->|"IPC"| appComponent
    
    %% Styles
    classDef main fill:#6366f1,stroke:#4f46e5,color:#fff
    classDef frontend fill:#10b981,stroke:#059669,color:#fff
    classDef editor fill:#8b5cf6,stroke:#7c3aed,color:#fff
```"""
    
    print("\n📝 TEST 5: Complex real-world example")
    print("-" * 70)
    extracted, success = extract_mermaid_code(test5)
    if success:
        print(f"Extracted code length: {len(extracted)} chars")
        print(f"First 100 chars: {extracted[:100]}...")
        print(f"Contains subgraphs: {'subgraph' in extracted}")
        print(f"Contains classDef: {'classDef' in extracted}")
        print(f"Starts with valid type: {extracted.startswith(('flowchart', 'graph'))}")
    else:
        print("FAILED")
    
    print("\n" + "=" * 70)
    print("EXTRACTION TESTS COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    test_extraction()
