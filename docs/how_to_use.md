# How to Use the Website

1. Go to [https://gitdiagram.uti-kit.com/](https://gitdiagram.uti-kit.com/)
2. Enter the URL of the GitHub repository you want to visualize
3. Click the "Generate Diagram" button
4. Wait for the diagram to be generated
5. Click on the diagram to navigate to the relevant source files and directories

Hui Zhou is currently hosting it for free with no rate limits though this is somewhat likely to change in the future.

It is also possible to self-host the app locally or on a cloud provider.

You can try different AI models and configure your own API keys for each provider through the UI.

Please note that if you want to diagram private repositories, you can click on "Private Repos" in the header and follow the instructions by providing a GitHub personal access token with the `repo` scope. It is highly recommended to use a private LLM API key for this purpose.

## Cached Diagrams

The website provides the cached diagrams. If the repository has been diagrammed before, you can click on "View Diagram" to view the diagram. If the repository has not been diagrammed before, you can click on "Generate Diagram" to generate the diagram. If the repository new commits are pushed to main/master branch 24 hours ago, the diagram will be regenerated.

## Issues

Right now it may fails to generate diagrams due to the AI models' context window size, Mermaid diagram source code and syntax errors.

## Contact

You can contact the website owner, Hui Zhou, by submitting an issue on GitHub or by submitting the form on the website.