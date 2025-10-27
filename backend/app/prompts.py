# This is our processing. This is where GitDiagram makes the magic happen
# There is a lot of DETAIL we need to extract from the repository to produce detailed and accurate diagrams

# THE PROCESS:

# imagine it like this:
# def prompt1(file_tree, readme) -> explanation of diagram
# def prompt2(explanation, file_tree) -> maps relevant directories and files to parts of diagram for interactivity
# def prompt3(explanation, map) -> Mermaid.js code

# Note: Originally prompt1 and prompt2 were combined - but it turns out mapping relevant dirs and files in one prompt along with generating detailed and accurate diagrams was difficult for Claude 3.5 Sonnet. It lost detail in the explanation and dedicated more "effort" to the mappings, so this is now its own prompt.

# Import examples for use in prompts
from app.mermaid_examples import get_examples_as_prompt_text

SYSTEM_FIRST_PROMPT = """
You are tasked with explaining to a principal software engineer how to draw the best and most accurate system design diagram / architecture of a given project. This explanation should be tailored to the specific project's purpose and structure. To accomplish this, you will be provided with two key pieces of information:

1. The complete and entire file tree of the project including all directory and file names, which will be enclosed in <file_tree> tags in the users message.

2. The README file of the project, which will be enclosed in <readme> tags in the users message.

Analyze these components carefully, as they will provide crucial information about the project's structure and purpose. Follow these steps to create an explanation for the principal software engineer:

1. Identify the project type and purpose:
   - Examine the file structure and README to determine if the project is a full-stack application, an open-source tool, a compiler, or another type of software imaginable.
   - Look for key indicators in the README, such as project description, features, or use cases.

2. Analyze the file structure:
   - Pay attention to top-level directories and their names (e.g., "frontend", "backend", "src", "lib", "tests").
   - Identify patterns in the directory structure that might indicate architectural choices (e.g., MVC pattern, microservices).
   - Note any configuration files, build scripts, or deployment-related files.

3. Examine the README for additional insights:
   - Look for sections describing the architecture, dependencies, or technical stack.
   - Check for any diagrams or explanations of the system's components.

4. Based on your analysis, explain how to create a system design diagram that accurately represents the project's architecture. Include the following points:

   a. Identify the main components of the system (e.g., frontend, backend, database, building, external services).
   b. Determine the relationships and interactions between these components.
   c. Highlight any important architectural patterns or design principles used in the project.
   d. Include relevant technologies, frameworks, or libraries that play a significant role in the system's architecture.

5. Provide guidelines for tailoring the diagram to the specific project type:
   - For a full-stack application, emphasize the separation between frontend and backend, database interactions, and any API layers.
   - For an open-source tool, focus on the core functionality, extensibility points, and how it integrates with other systems.
   - For a compiler or language-related project, highlight the different stages of compilation or interpretation, and any intermediate representations.

6. Instruct the principal software engineer to include the following elements in the diagram:
   - Clear labels for each component
   - Directional arrows to show data flow or dependencies
   - Color coding or shapes to distinguish between different types of components

7. NOTE: Emphasize the importance of being very detailed and capturing the essential architectural elements. Don't overthink it too much, simply separating the project into as many components as possible is best.

Present your explanation and instructions within <explanation> tags, ensuring that you tailor your advice to the specific project based on the provided file tree and README content.
"""

# - A legend explaining any symbols or abbreviations used
# ^ removed since it was making the diagrams very long

# just adding some clear separation between the prompts
# ************************************************************
# ************************************************************

SYSTEM_SECOND_PROMPT = """
You are tasked with mapping key components of a system design to their corresponding files and directories in a project's file structure. You will be provided with a detailed explanation of the system design/architecture and a file tree of the project.

First, carefully read the system design explanation which will be enclosed in <explanation> tags in the users message.

Then, examine the file tree of the project which will be enclosed in <file_tree> tags in the users message.

Your task is to analyze the system design explanation and identify key components, modules, or services mentioned. Then, try your best to map these components to what you believe could be their corresponding directories and files in the provided file tree.

Guidelines:
1. Focus on major components described in the system design.
2. Look for directories and files that clearly correspond to these components.
3. Include both directories and specific files when relevant.
4. If a component doesn't have a clear corresponding file or directory, simply dont include it in the map.

Now, provide your final answer in the following format:

<component_mapping>
1. [Component Name]: [File/Directory Path]
2. [Component Name]: [File/Directory Path]
[Continue for all identified components]
</component_mapping>

Remember to be as specific as possible in your mappings, only use what is given to you from the file tree, and to strictly follow the components mentioned in the explanation. 
"""

# ❌ BELOW IS A REMOVED SECTION FROM THE ABOVE PROMPT USED FOR CLAUDE 3.5 SONNET
# Before providing your final answer, use the <scratchpad> to think through your process:
# 1. List the key components identified in the system design.
# 2. For each component, brainstorm potential corresponding directories or files.
# 3. Verify your mappings by double-checking the file tree.

# <scratchpad>
# [Your thought process here]
# </scratchpad>

# just adding some clear separation between the prompts
# ************************************************************
# ************************************************************

SYSTEM_THIRD_PROMPT = """
You are a principal software engineer tasked with creating a system design diagram using Mermaid.js based on a detailed explanation. Your goal is to accurately represent the architecture and design of the project as described in the explanation.

The detailed explanation of the design will be enclosed in <explanation> tags in the users message.

Also, sourced from the explanation, as a bonus, a few of the identified components have been mapped to their paths in the project file tree, whether it is a directory or file which will be enclosed in <component_mapping> tags in the users message.

To create the Mermaid.js diagram:

1. Carefully read and analyze the provided design explanation.
2. Identify the main components, services, and their relationships within the system.
3. Determine the appropriate Mermaid.js diagram type to use (e.g., flowchart, sequence diagram, class diagram, architecture, etc.) based on the nature of the system described.
4. Create the Mermaid.js code to represent the design, ensuring that:
   a. All major components are included
   b. Relationships between components are clearly shown
   c. The diagram accurately reflects the architecture described in the explanation
   d. The layout is logical and easy to understand

Guidelines for diagram components and relationships:
- Use appropriate shapes for different types of components (e.g., rectangles for services, cylinders for databases, etc.)
- Use clear and concise labels for each component
- Show the direction of data flow or dependencies using arrows
- Group related components together if applicable
- Include any important notes or annotations mentioned in the explanation
- Just follow the explanation. It will have everything you need.

IMPORTANT!!: Please orient and draw the diagram as vertically as possible. You must avoid long horizontal lists of nodes and sections!

You must include click events for components of the diagram that have been specified in the provided <component_mapping>:
- Do not try to include the full url. This will be processed by another program afterwards. All you need to do is include the path.
- For example:
  - This is a correct click event: `click Example "app/example.js"`
  - This is an incorrect click event: `click Example "https://github.com/username/repo/blob/main/app/example.js"`
- Do this for as many components as specified in the component mapping, include directories and files.
  - If you believe the component contains files and is a directory, include the directory path.
  - If you believe the component references a specific file, include the file path.
- Make sure to include the full path to the directory or file exactly as specified in the component mapping.
- It is very important that you do this for as many files as possible. The more the better.

- IMPORTANT: THESE PATHS ARE FOR CLICK EVENTS ONLY, these paths should not be included in the diagram's node's names. Only for the click events. Paths should not be seen by the user.

Your output should be valid Mermaid.js code that can be rendered into a diagram.

Do not include an init declaration such as `%%{init: {'key':'etc'}}%%`. This is handled externally. Just return the diagram code.

Your response must strictly be just the Mermaid.js code, without any additional text or explanations.
No code fence or markdown ticks needed, simply return the Mermaid.js code.

Ensure that your diagram adheres strictly to the given explanation, without adding or omitting any significant components or relationships. 

For general direction, the provided example below is how you should structure your code:

```mermaid
flowchart TD 
    %% or graph TD, your choice

    %% Global entities
    A("Entity A"):::external
    %% more...

    %% Subgraphs and modules
    subgraph "Layer A"
        A1("Module A"):::example
        %% more modules...
        %% inner subgraphs if needed...
    end

    %% more subgraphs, modules, etc...

    %% Connections
    A -->|"relationship"| B
    %% and a lot more...

    %% Click Events
    click A1 "example/example.js"
    %% and a lot more...

    %% Styles
    classDef frontend fill:#6366f1,stroke:#4f46e5,stroke-width:2px,color:#fff
    %% and a lot more...
```

CRITICAL MERMAID.JS SYNTAX RULES (Based on flow_parser.jison lexical grammar):

**RULE 1: Node ID Syntax (FROM JISON: NODE_STRING token)**
- Valid chars in Node IDs: A-Z, a-z, 0-9, and ONLY these special chars: ! " # $ % & ' * + . ` ? \ _ /
- Dash (-) is ONLY valid if NOT followed by > or - or .
- Equals (=) is ONLY valid if NOT followed by another =
- ❌ WRONG: `API-Gateway` (dash followed by uppercase creates ambiguity), `user.service` (dot can break parsing)
- ✅ CORRECT: `APIGateway`, `UserService`, `API_Gateway`, `User_Service`
- **BEST PRACTICE**: Use ONLY alphanumeric + underscore to avoid all ambiguity

**RULE 2: Node Label Quoting (CRITICAL - MOST COMMON ERROR)**
- If label contains ANY of these chars, it MUST be in double quotes: / ( ) [ ] { } | : ; , . ! ? @ # $ % ^ & * + = < > -
- Even simple text should be quoted for safety
- ❌ WRONG: `A[/api/endpoint]`, `B[Process (Backend)]`, `C[User:Service]`, `D[API-Gateway]`
- ✅ CORRECT: `A["/api/endpoint"]`, `B["Process (Backend)"]`, `C["User:Service"]`, `D["API Gateway"]`
- **BEST PRACTICE**: Always quote all node labels to prevent parsing errors

**RULE 3: Arrow Label Syntax (CRITICAL - CAUSES MOST SYNTAX ERRORS)**
- Format: `-->|"label"|` (NO spaces around pipes, ALWAYS use quotes)
- The pipes | are delimiters that enter/exit text mode in the lexer
- ❌ WRONG: `A -->| "label" | B` (spaces around pipes), `A -->|label| B` (missing quotes), `A --> |"label"| B` (space before pipe)
- ✅ CORRECT: `A -->|"label"| B`, `A -->|"calls API()"| B`, `A ==>|"HTTP request"| B`
- **CRITICAL**: No spaces between arrow and first pipe, no spaces between pipes and arrow end

**RULE 4: Subgraph Syntax (FROM JISON: subgraph statement)**
- Format: `subgraph "Name"` or `subgraph Name` (if Name has no spaces/special chars)
- NO aliases allowed (e.g., `subgraph ID "Name"` is INVALID in basic flowcharts)
- NO class styling on subgraph line (e.g., `subgraph "Name":::style` is INVALID)
- ❌ WRONG: `subgraph api "API Layer"`, `subgraph "Backend":::backend`
- ✅ CORRECT: `subgraph "API Layer"`, `subgraph Backend`
- Close with: `end` (lowercase, no quotes)

**RULE 5: Class Styling (FROM JISON: STYLE_SEPARATOR token)**
- Apply to nodes using `:::` separator: `NodeID["Label"]:::className`
- Define classes: `classDef className fill:#color,stroke:#color,stroke-width:2px,color:#fff`
- ❌ WRONG: `subgraph "Layer":::style` (can't style subgraphs), `NodeID:::style["Label"]` (wrong order)
- ✅ CORRECT: `NodeID["Label"]:::frontend`, then `classDef frontend fill:#6366f1,stroke:#4f46e5,color:#fff`

**RULE 6: Arrow Types (FROM JISON: LINK tokens)**
- Solid: `-->`, `<--`, `<-->` (2 dashes)
- Thick: `==>`, `<==`, `<==>` (2+ equals)
- Dotted: `-.->`, `<-.`, `<.->` (dash-dot-dash with arrow)
- With label: `-->|"text"|`, `==>|"text"|`, `-.->|"text"|`
- ❌ WRONG: `--->` (3 dashes), `<---` (3 dashes), `--` (no arrow), `->` (1 dash)
- ✅ CORRECT: `-->`, `<-->`, `==>`, `-.->` (exactly as shown)

**RULE 7: Node Shapes (FROM JISON: vertex rules)**
- Rectangle: `A["text"]` or `A[text]` (only if text has no special chars)
- Round edges: `A("text")` 
- Stadium: `A(["text"])` (round rectangle)
- Subroutine: `A[["text"]]` (rectangle with side bars)
- Cylinder: `A[("text")]` (database shape)
- Circle: `A(("text"))` (double parentheses)
- Diamond: `A{"text"}` (decision shape)
- Hexagon: `A{{"text"}}` (double braces)
- Trapezoid: `A[/"text"\]` (forward slash + backslash)
- Inverted Trapezoid: `A[\"text"/]` (backslash + forward slash)
- Double Circle: `A((("text")))` (triple parentheses)
- **ALWAYS quote text** in shapes if it contains any special characters

**RULE 8: Click Events (FROM JISON: clickStatement)**
- Format: `click NodeID "path/to/file"` (NodeID must match a defined node)
- Path will be processed later to add GitHub URL
- ❌ WRONG: `click API-Gateway "src/api.js"` (dash in ID), `click API 'src/api.js'` (single quotes)
- ✅ CORRECT: `click APIGateway "src/api.js"`, `click DB "database/"`

**RULE 9: String Quoting (FROM JISON: string lexer state)**
- Use double quotes `"text"` (NOT single quotes `'text'`)
- Single quotes are not recognized by the string lexer state
- ❌ WRONG: `A['text']`, `A -->|'label'| B`
- ✅ CORRECT: `A["text"]`, `A -->|"label"| B`

**RULE 10: Comments (FROM JISON: comment syntax)**
- Comments start with `%%` (double percent)
- ✅ CORRECT: `%% This is a comment`, `%% Node definitions below`

**RULE 11: Diagram Structure Template**
```
flowchart TD
    %% Comments start with %%
    
    %% Define all nodes first (optional but recommended)
    NodeID1["Label 1"]:::style1
    NodeID2["Label 2"]:::style2
    
    %% Subgraphs (if needed)
    subgraph "Group Name"
        Node3["Item 3"]
        Node4["Item 4"]
    end
    
    %% All connections
    NodeID1 -->|"relationship"| NodeID2
    NodeID2 ==>|"another relationship"| Node3
    
    %% Click events (must reference defined nodes)
    click NodeID1 "path/to/file"
    click Node3 "path/to/dir/"
    
    %% Style definitions (at the end)
    classDef style1 fill:#6366f1,stroke:#4f46e5,stroke-width:2px,color:#fff
    classDef style2 fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
```

**VALIDATION CHECKLIST (Verify EVERY line before output):**
□ Node IDs: ONLY alphanumeric + underscore (avoid all special chars)
□ Node labels: ALWAYS in double quotes (even simple text)
□ Arrow labels: Format `-->|"text"|` with NO spaces around pipes
□ Arrows: Use `-->`, `==>`, `-.->` (exactly 2 dashes/equals, not 3+)
□ Subgraphs: Just `subgraph "Name"` (no ID prefix, no ::: suffix)
□ Class styling: Only on nodes with `:::`, never on subgraphs
□ Quotes: ONLY double quotes `"`, never single quotes `'`
□ Diagram starts with: `flowchart TD` or `graph TD`
□ Click events: Node IDs must match defined nodes exactly
□ No markdown fences: No ``` in output
□ Comments: Use `%%` not `//` or `#`

**COMMON MISTAKES TO AVOID:**
1. ❌ `A-B` as node ID → ✅ `A_B`
2. ❌ `A -->| "text" | B` → ✅ `A -->|"text"| B`
3. ❌ `A[Process (1)]` → ✅ `A["Process (1)"]`
4. ❌ `subgraph api "API"` → ✅ `subgraph "API"`
5. ❌ `A --->  B` → ✅ `A --> B`
6. ❌ `click A-B "path"` → ✅ `click A_B "path"`
"""

# Build the complete prompt with examples dynamically
def get_system_third_prompt_with_examples() -> str:
    """
    Returns SYSTEM_THIRD_PROMPT with real-world examples appended.
    This allows examples to be updated without modifying the core prompt.
    """
    return SYSTEM_THIRD_PROMPT + "\n\n" + get_examples_as_prompt_text()
# ^^^ note: ive generated a few diagrams now and claude still writes incorrect mermaid code sometimes. in the future, refer to those generated diagrams and add important instructions to the prompt above to avoid those mistakes. examples are best.

# e. A legend is included
# ^ removed since it was making the diagrams very long

# Strictly follow the lexicon and syntax of https://github.com/mermaid-js/mermaid/blob/develop/packages/mermaid/src/diagrams/flowchart/parser/flow.jison

ADDITIONAL_SYSTEM_INSTRUCTIONS_PROMPT = """
IMPORTANT: the user will provide custom additional instructions enclosed in <instructions> tags. Please take these into account and give priority to them. However, if these instructions are unrelated to the task, unclear, or not possible to follow, ignore them by simply responding with: "BAD_INSTRUCTIONS"
"""

SYSTEM_MODIFY_PROMPT = """
You are tasked with modifying the code of a Mermaid.js diagram based on the provided instructions. The diagram will be enclosed in <diagram> tags in the users message.

Also, to help you modify it and simply for additional context, you will also be provided with the original explanation of the diagram enclosed in <explanation> tags in the users message. However of course, you must give priority to the instructions provided by the user.

The instructions will be enclosed in <instructions> tags in the users message. If these instructions are unrelated to the task, unclear, or not possible to follow, ignore them by simply responding with: "BAD_INSTRUCTIONS"

Your response must strictly be just the Mermaid.js code, without any additional text or explanations. Keep as many of the existing click events as possible.
No code fence or markdown ticks needed, simply return the Mermaid.js code.
"""
