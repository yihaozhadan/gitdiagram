"""
Common Mermaid syntax examples showing incorrect vs correct patterns.
These examples are used in prompts to help AI models generate valid Mermaid diagrams.
Add new examples as you encounter common errors in production.
"""

# Each example is a tuple of (description, incorrect_code, correct_code, explanation)
MERMAID_SYNTAX_EXAMPLES = [
    # Arrow label spacing errors
    (
        "Arrow labels with spaces around pipes",
        """A -->| "sends data" | B""",
        """A -->|"sends data"| B""",
        "No spaces allowed around pipes in arrow labels. The pipe | is a lexer delimiter."
    ),
    
    (
        "Arrow labels with space before pipe",
        """A --> |"HTTP request"| B""",
        """A -->|"HTTP request"| B""",
        "No space between arrow and first pipe."
    ),
    
    # Node ID errors
    (
        "Node IDs with dashes",
        """API-Gateway["API Gateway"]
API-Gateway --> Backend""",
        """APIGateway["API Gateway"]
APIGateway --> Backend""",
        "Node IDs should only contain alphanumeric characters and underscores. Dashes can cause parsing ambiguity."
    ),
    
    (
        "Node IDs with dots",
        """user.service["User Service"]
user.service --> database""",
        """UserService["User Service"]
UserService --> database""",
        "Dots in node IDs can break parsing. Use underscores or camelCase instead."
    ),
    
    # Label quoting errors
    (
        "Unquoted labels with special characters",
        """A[API Gateway]
B[User: Admin]
C[Process (v2)]""",
        """A["API Gateway"]
B["User: Admin"]
C["Process (v2)"]""",
        "Labels containing spaces, colons, parentheses, or other special characters must be quoted."
    ),
    
    (
        "Single quotes instead of double quotes",
        """A['Frontend']
B['Backend']
A -->|'calls'| B""",
        """A["Frontend"]
B["Backend"]
A -->|"calls"| B""",
        "Mermaid's lexer only recognizes double quotes, not single quotes."
    ),
    
    # Arrow syntax errors
    (
        "Three or more dashes in arrows",
        """A ---> B
C <--- D""",
        """A --> B
C <-- D""",
        "Arrows must use exactly 2 dashes (-->) or 2 equals (==>), not 3 or more."
    ),
    
    (
        "Single dash arrows",
        """A -> B
C <- D""",
        """A --> B
C <-- D""",
        "Single dash arrows are not valid. Use exactly 2 dashes."
    ),
    
    # Subgraph errors
    (
        "Subgraph with ID prefix",
        """subgraph api "API Layer"
    A["Service"]
end""",
        """subgraph "API Layer"
    A["Service"]
end""",
        "Basic flowcharts don't support subgraph ID prefixes. Use just the name."
    ),
    
    (
        "Subgraph with class styling",
        """subgraph "Backend":::backend
    A["Service"]
end""",
        """subgraph "Backend"
    A["Service"]:::backend
end""",
        "Cannot apply class styling directly to subgraphs. Style the nodes inside instead."
    ),
    
    # Complex real-world examples
    (
        "Multiple errors in one diagram",
        """graph TD
    API-Gateway[API Gateway]
    user.service[User Service]
    API-Gateway -->| "authenticates" | user.service
    user.service ---> Database""",
        """graph TD
    APIGateway["API Gateway"]
    UserService["User Service"]
    APIGateway -->|"authenticates"| UserService
    UserService --> Database""",
        "Fixed: node IDs (removed dashes/dots), arrow spacing (removed spaces around pipes), arrow syntax (2 dashes not 3), and quoted labels."
    ),
    
    (
        "Subgraph with multiple issues",
        """flowchart TD
    subgraph frontend "Frontend Layer":::blue
        UI[User Interface]
        Router[App Router]
    end
    UI -->| 'navigates' | Router""",
        """flowchart TD
    subgraph "Frontend Layer"
        UI["User Interface"]:::blue
        Router["App Router"]:::blue
    end
    UI -->|"navigates"| Router""",
        "Fixed: removed subgraph ID prefix and class styling, moved styling to nodes, changed single quotes to double quotes, removed spaces in arrow label."
    ),
    
    # Production errors from lumi project (2025-10-23)
    (
        "Subgraph with curly braces instead of proper syntax",
        """subgraph "Frontend Layer" {
    WebUI["Web UI"]
    Editor["Editor"]
}""",
        """subgraph "Frontend Layer"
    WebUI["Web UI"]
    Editor["Editor"]
end""",
        "Subgraphs must close with 'end' keyword, not curly braces. Curly braces {} are not valid in Mermaid flowchart syntax."
    ),
    
    (
        "Arrow labels without pipe delimiters",
        """A --> B "sends data"
C -->> D "bidirectional sync"
E --> F "processes" """,
        """A -->|"sends data"| B
C -->|"bidirectional sync"| D
E -->|"processes"| F""",
        "Arrow labels must be enclosed in pipe delimiters: -->|\"text\"|. The format 'arrow space text' is not valid syntax."
    ),
    
    (
        "Undefined classDef referenced in node styling",
        """flowchart TD
    A["Node"]:::editor
    B["Node"]:::storage
    
    classDef frontend fill:#6366f1
    classDef backend fill:#dd1c37""",
        """flowchart TD
    A["Node"]:::editor
    B["Node"]:::storage
    
    classDef frontend fill:#6366f1
    classDef backend fill:#dd1c37
    classDef editor fill:#9b59b6
    classDef storage fill:#16a085""",
        "All class names used in :::className must be defined with classDef. Using undefined classes causes rendering errors."
    ),
    
    (
        "Inline node definition with arrow (production error)",
        """ElectronApp --> FileService["Desktop File Access"]:::backend""",
        """FileService["Desktop File Access"]:::backend
ElectronApp --> FileService""",
        "Define nodes separately before using them in connections. Inline node definitions with styling can cause parsing issues. Define the node first, then create the connection."
    ),
    
    # Production errors from glances project (2025-10-23)
    (
        "Reusing same node ID for multiple nodes (CRITICAL)",
        """A(init)[glances/__init__.py]:::core
A(main)[glances/main.py]:::core
A(client)[glances/client.py]:::core
A(config)[glances/config.py]:::core""",
        """init["glances/__init__.py"]:::core
main["glances/main.py"]:::core
client["glances/client.py"]:::core
config["glances/config.py"]:::core""",
        "Each node must have a UNIQUE ID. Using 'A' for all nodes causes them to overwrite each other. The parser only recognizes the last definition. Use descriptive, unique IDs for each node."
    ),
    
    (
        "Mismatched brackets in node definition",
        """A(test_webui][tests/test_webui.py]:::infra""",
        """test_webui["tests/test_webui.py"]:::infra""",
        "Node shape syntax must have matching brackets. Cannot mix parentheses and square brackets. Use A[\"text\"] for rectangle, A(\"text\") for rounded, or A([\"text\"]) for stadium shape."
    ),
    
    (
        "Malformed arrow labels with unclosed quotes and pipes",
        """client -->|"Client Engine| A(client)[engine]
amps -->"|Plugin API| A(client)
cpu -->|"Hardware data| A(client)""",
        """client -->|"Client Engine"| engine["engine"]
amps -->|"Plugin API"| client
cpu -->|"Hardware data"| client""",
        "Arrow labels must have matching quotes and pipes: -->|\"text\"|. Missing closing quote or pipe causes parser to fail. Also avoid reusing node IDs - each node needs a unique identifier."
    ),
    
    (
        "Non-Mermaid text after diagram code",
        """flowchart TD
    A["Node"]
    B["Node"]
This Mermaid.js diagram accurately represents...
1. **Color-coded component groups**:
- Core engine (blue)""",
        """flowchart TD
    A["Node"]
    B["Node"]""",
        "Mermaid diagrams must contain ONLY valid Mermaid syntax. Any documentation, descriptions, or explanatory text must be removed or placed in comments using %%. Text after the diagram causes parsing errors."
    ),
    
    # Production errors from ghostty project (2025-10-23)
    (
        "Invalid 'Connect' syntax for connections",
        """Connect "A1 -->|Core APIs| B1"
Connect "A3 -->|Glyphs| MetalRenderer"
Connect "A7 -->|Lifecycle| macOS" """,
        """A1 -->|"Core APIs"| B1
A3 -->|"Glyphs"| MetalRenderer
A7 -->|"Lifecycle"| macOS_platform["macOS Platform"]""",
        "There is no 'Connect' keyword in Mermaid. Connections are created directly using arrow syntax: NodeA -->|\"label\"| NodeB. The word 'Connect' is not valid Mermaid syntax."
    ),
    
    (
        "Class names with dashes (hyphens)",
        """A["Node"]:::top-level
B["Node"]:::core-full
C["Node"]:::my-class

classDef core fill:#4CAF50""",
        """A["Node"]:::toplevel
B["Node"]:::corefull
C["Node"]:::myclass

classDef toplevel fill:#9c27b0
classDef corefull fill:#4CAF50
classDef myclass fill:#607d8b""",
        "Class names in :::className should not contain dashes/hyphens. Use camelCase or remove dashes. Also ensure all referenced classes are defined with classDef."
    ),
    
    (
        "Invalid 'orient' statement in flowchart",
        """flowchart TD
A["Node"]
B["Node"]
orient TD
A --> B""",
        """flowchart TD
A["Node"]
B["Node"]
A --> B""",
        "The 'orient' keyword is not valid in Mermaid flowcharts. Direction is specified in the flowchart declaration: 'flowchart TD' (top-down), 'flowchart LR' (left-right), etc. Remove any 'orient' statements."
    ),
    
    (
        "Trailing period at end of diagram",
        """flowchart TD
A["Node"]
B["Node"]
A --> B
end.""",
        """flowchart TD
A["Node"]
B["Node"]
A --> B
end""",
        "Mermaid diagrams should not end with punctuation like periods, commas, or semicolons. The diagram ends naturally after the last statement or 'end' keyword."
    ),
    
    # Production errors from pouchdb project (2025-10-23)
    (
        "Subgraph with both ID and label syntax",
        """subgraph "src/" [Core Source]
    A["Node"]
end""",
        """subgraph "Core Source"
    A["Node"]
end""",
        "Subgraphs cannot have both an ID prefix and a label in square brackets. Use either 'subgraph id' or 'subgraph \"label\"', not both. The [label] syntax is not valid in basic flowcharts."
    ),
    
    (
        "Node IDs with underscores",
        """Build_Scripts["bin/"]
Test_ActiveTasks["test.js"]
Cross_Platform["Dependencies"]""",
        """BuildScripts["bin/"]
TestActiveTasks["test.js"]
CrossPlatform["Dependencies"]""",
        "While underscores in node IDs are technically valid, they can cause issues in some contexts and reduce readability. Use camelCase instead: BuildScripts, TestActiveTasks, CrossPlatform."
    ),
    
    (
        "Undefined node references in connections",
        """A["Node A"]
B["Node B"]
A --> B
B --> C
C --> UndefinedNode""",
        """A["Node A"]
B["Node B"]
C["Node C"]
UndefinedNode["Undefined Node"]
A --> B
B --> C
C --> UndefinedNode""",
        "All nodes referenced in connections must be defined first. Define each node with its label before using it in arrows. Undefined node references cause rendering errors."
    ),
    
    (
        "Colons in node IDs",
        """Security:SSL["SSL Security"]
Security:Crypto["Crypto"]
Security:SSL --> Security:Crypto""",
        """SecuritySSL["SSL Security"]
SecurityCrypto["Crypto"]
SecuritySSL --> SecurityCrypto""",
        "Node IDs cannot contain colons (:). Colons are special characters in Mermaid syntax. Use camelCase or underscores instead: SecuritySSL, SecurityCrypto."
    ),

    (
        "Arrow target node syntax",
        "Changes --> Change Log",
        """Changes --> ChangeLog["Change Log"]""",
        "Arrow target node name can not have space unless it has alias. Use ChangeLog instead of Change Log."
    ),
]


def get_examples_as_prompt_text() -> str:
    """
    Format examples as text suitable for inclusion in AI prompts.
    
    Returns:
        Formatted string with all examples
    """
    prompt_text = "**COMMON SYNTAX ERRORS AND CORRECTIONS:**\n\n"
    
    for i, (description, incorrect, correct, explanation) in enumerate(MERMAID_SYNTAX_EXAMPLES, 1):
        prompt_text += f"**Example {i}: {description}**\n\n"
        prompt_text += f"❌ INCORRECT:\n```\n{incorrect}\n```\n\n"
        prompt_text += f"✅ CORRECT:\n```\n{correct}\n```\n\n"
        prompt_text += f"💡 Why: {explanation}\n\n"
        prompt_text += "---\n\n"
    
    return prompt_text


def get_examples_count() -> int:
    """Get the total number of examples."""
    return len(MERMAID_SYNTAX_EXAMPLES)


def add_example(description: str, incorrect: str, correct: str, explanation: str) -> None:
    """
    Helper function to add a new example (for interactive use).
    
    Args:
        description: Brief description of the error type
        incorrect: The incorrect Mermaid code
        correct: The corrected Mermaid code
        explanation: Why the incorrect version fails and how the fix works
    """
    MERMAID_SYNTAX_EXAMPLES.append((description, incorrect, correct, explanation))
    print(f"Added example: {description}")
    print(f"Total examples: {len(MERMAID_SYNTAX_EXAMPLES)}")
