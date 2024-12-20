# This is our processing. This is where GitDiagram makes the magic happen
# There is a lot of DETAIL we need to extract from the repository to produce detailed and accurate diagrams
# I will immediately put out there that I'm trying to reduce costs. Theoretically, I could, for like 5x better accuracy, include most file content as well which would make for perfect diagrams, but thats too many tokens for my wallet, and would probably greatly increase generation time. (maybe a paid feature?)

# THE PROCESS:

# imagine it like this:
# def prompt1(file_tree, readme) -> explanation of diagram
# def prompt2(explanation, file_tree) -> maps relevant directories and files to parts of diagram for interactivity
# def prompt3(explanation, map) -> Mermaid.js code

# Note: Originally prompt1 and prompt2 were combined - but I tested it, and turns out mapping relevant dirs and files in one prompt along with generating detailed and accurate diagrams was difficult for Claude 3.5 Sonnet. It lost detail in the explanation and dedicated more "effort" to the mappings, so this is now its own prompt.

# This is my first take at prompt engineering so if you have any ideas on optimizations please make an issue on the GitHub!

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
   - A legend explaining any symbols or abbreviations used

7. Emphasize the importance of keeping the diagram at an appropriate level of abstraction, avoiding too much detail while still capturing the essential architectural elements.

Present your explanation and instructions within <explanation> tags, ensuring that you tailor your advice to the specific project based on the provided file tree and README content.
"""

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

Before providing your final answer, use the <scratchpad> to think through your process:
1. List the key components identified in the system design.
2. For each component, brainstorm potential corresponding directories or files.
3. Verify your mappings by double-checking the file tree.

<scratchpad>
[Your thought process here]
</scratchpad>

Now, provide your final answer in the following format:

<component_mapping>
1. [Component Name]: [File/Directory Path]
2. [Component Name]: [File/Directory Path]
[Continue for all identified components]
</component_mapping>

Remember to be as specific as possible in your mappings, only use what is given to you from the file tree, and to strictly follow the components mentioned in the explanation. 
"""

# just adding some clear separation between the prompts
# ************************************************************
# ************************************************************

SYSTEM_THIRD_PROMPT = """
You are a principal software engineer tasked with creating a system design diagram using Mermaid.js based on a detailed explanation. Your goal is to accurately represent the architecture and design of the project as described in the explanation.

The detailed explanation of the design will be enclosed in <explanation> tags in the users message.

And from the explanation, as a bonus, a few of the identified components have been mapped to their paths in the project, whether it is a directory or file which will be enclosed in <component_mapping> tags in the users message.

To create the Mermaid.js diagram:

1. Carefully read and analyze the provided design explanation.
2. Identify the main components, services, and their relationships within the system.
3. Determine the appropriate Mermaid.js diagram type to use (e.g., flowchart, sequence diagram, class diagram, architecture, etc.) based on the nature of the system described.
4. Create the Mermaid.js code to represent the design, ensuring that:
   a. All major components are included
   b. Relationships between components are clearly shown
   c. The diagram accurately reflects the architecture described in the explanation
   d. The layout is logical and easy to understand
   e. A legend is included

Guidelines for diagram components and relationships:
- Use appropriate shapes for different types of components (e.g., rectangles for services, cylinders for databases, etc.)
- Use clear and concise labels for each component
- Show the direction of data flow or dependencies using arrows
- Group related components together if applicable
- Include any important notes or annotations mentioned in the explanation
- Just follow the explanation. It will have everything you need.


You must include click events for components of the diagram that have been specified in the provided component_mapping:
- If it is a directory, it would be a click event to https://github.com/[username]/[repo]/tree/[branch]/<INSERT PATH HERE>
and if it is a file it would be to https://github.com/[username]/[repo]/blob/[branch]/<INSERT PATH HERE>
- Do this for as many components as specified in the component mapping, include directories and files.
- Outline the clickable components in the diagram with a separate color.
- It is very important that you do this for as many files as possible. The more the better.

Your output should be valid Mermaid.js code that can be rendered into a diagram.

Your response must strictly be just the Mermaid.js code, without any additional text or explanations.
No code fence or markdown ticks needed, simply return the Mermaid.js code.

Ensure that your diagram adheres strictly to the given explanation, without adding or omitting any significant components or relationships. 

Important notes:
- In Mermaid.js syntax, we cannot include slashes without being inside quotes. For example: `EX[/api/process]:::api` is a syntax error but `EX["/api/process"]:::api` is valid.
"""
