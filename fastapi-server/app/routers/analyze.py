from fastapi import APIRouter
import anthropic
from dotenv import load_dotenv
from app.services.github_service import GitHubService
import os
from app.prompts import FIRST_PROMPT, SECOND_PROMPT

load_dotenv()

router = APIRouter(prefix="/analyze", tags=["Claude"])

client = anthropic.Anthropic()

# Initialize GitHubService with your GitHub token
github_token = os.getenv("github_pat")  # might hit rate limit on just my token
github_service = GitHubService(github_token)


def call_claude_api(prompt: str) -> str:
    message = client.messages.create(
        model="claude-3-5-sonnet-latest",
        max_tokens=8000,
        temperature=0,
        system="",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ]
    )
    return message.content


@router.get("/")
async def analyze(owner: str, repo: str):
    try:
        # get file tree and README content
        file_tree = github_service.get_github_file_paths_as_list(owner, repo)
        readme = github_service.get_github_readme(owner, repo)

        # fill in placeholders for first prompt
        prompt1 = FIRST_PROMPT.format(file_tree=file_tree, readme=readme)

        # get the explanation for sysdesign from claude
        explanation = call_claude_api(prompt1)

        # fill in placeholder into second prompt
        prompt2 = SECOND_PROMPT.format(explanation=explanation)

        # get mermaid.js code from claude
        mermaid_code = call_claude_api(prompt2)

        return {"response": mermaid_code}
    except Exception as e:
        return {"error": str(e)}
