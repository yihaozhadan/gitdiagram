from fastapi import APIRouter
from dotenv import load_dotenv
from app.services.github_service import GitHubService
from app.services.claude_service import ClaudeService
import os
from app.prompts import FIRST_PROMPT, SECOND_PROMPT, THIRD_PROMPT

load_dotenv()

router = APIRouter(prefix="/generate", tags=["Claude"])

# Initialize services
github_token = os.getenv("github_pat")  # might hit rate limit on just my token
github_service = GitHubService(github_token)
claude_service = ClaudeService()


@router.get("")
async def generate(username: str, repo: str):
    try:
        # Get default branch first
        default_branch = github_service.get_default_branch(username, repo)
        if not default_branch:
            default_branch = "main"  # fallback value

        # get file tree and README content
        file_tree = github_service.get_github_file_paths_as_list(
            username, repo)
        readme = github_service.get_github_readme(username, repo)

        # fill in placeholders for first prompt
        prompt1 = FIRST_PROMPT.format(file_tree=file_tree, readme=readme)

        # get the explanation for sysdesign from claude
        explanation = claude_service.call_claude_api(prompt1)
        explanation_text = explanation[0].text

        # fill in placeholder into second prompt
        prompt2 = SECOND_PROMPT.format(
            explanation=explanation_text, file_tree=file_tree)

        full_second_response = claude_service.call_claude_api(prompt2)
        full_second_response_text = full_second_response[0].text

        # Extract component mapping from the response
        start_tag = "<component_mapping>"
        end_tag = "</component_mapping>"
        component_mapping_text = full_second_response_text[
            full_second_response_text.find(start_tag):
            full_second_response_text.find(end_tag)
        ]

        # fill in placeholder for third prompt
        prompt3 = THIRD_PROMPT.format(
            explanation=explanation_text, component_mapping=component_mapping_text)

        # get mermaid.js code from claude
        mermaid_code = claude_service.call_claude_api(prompt3)
        mermaid_code_text = mermaid_code[0].text

        # Process the diagram text before sending to client
        processed_diagram = mermaid_code_text\
            .replace("[username]", username)\
            .replace("[repo]", repo)\
            .replace("[branch]", default_branch)

        return {"response": processed_diagram}
    except Exception as e:
        return {"error": str(e)}
