from fastapi import APIRouter, Request, HTTPException
from dotenv import load_dotenv
from app.services.github_service import GitHubService
from app.services.claude_service import ClaudeService
from app.core.limiter import limiter
import os
from app.prompts import SYSTEM_FIRST_PROMPT, SYSTEM_SECOND_PROMPT, SYSTEM_THIRD_PROMPT, ADDITIONAL_SYSTEM_INSTRUCTIONS_PROMPT
from anthropic._exceptions import RateLimitError
from pydantic import BaseModel

load_dotenv()

router = APIRouter(prefix="/generate", tags=["Claude"])

# Initialize services
github_token = os.getenv("github_pat")  # might hit rate limit on just my token
github_service = GitHubService(github_token)
claude_service = ClaudeService()


class GenerateRequest(BaseModel):
    username: str
    repo: str
    instructions: str


class CostRequest(BaseModel):
    username: str
    repo: str


@router.post("")
@limiter.limit("1/minute;5/day")
async def generate(request: Request, body: GenerateRequest):
    try:
        # Check instructions length
        if len(body.instructions) > 1000:
            return {"error": "Instructions exceed maximum length of 1000 characters"}

        # Get default branch first
        default_branch = github_service.get_default_branch(
            body.username, body.repo)
        if not default_branch:
            default_branch = "main"  # fallback value

        # get file tree and README content
        file_tree = github_service.get_github_file_paths_as_list(
            body.username, body.repo)
        readme = github_service.get_github_readme(body.username, body.repo)

        # Check combined token count
        combined_content = f"{file_tree}\n{readme}"
        token_count = claude_service.count_tokens(combined_content)
        if token_count > 50000:
            return {
                "error": f"File tree and README combined exceeds token limit (50,000). Current size: {token_count} tokens"
            }

        # Prepare system prompts with instructions if provided
        first_system_prompt = SYSTEM_FIRST_PROMPT
        third_system_prompt = SYSTEM_THIRD_PROMPT
        if body.instructions:
            first_system_prompt = first_system_prompt + \
                "\n" + ADDITIONAL_SYSTEM_INSTRUCTIONS_PROMPT
            third_system_prompt = third_system_prompt + \
                "\n" + ADDITIONAL_SYSTEM_INSTRUCTIONS_PROMPT

        # get the explanation for sysdesign from claude
        explanation = claude_service.call_claude_api(
            system_prompt=first_system_prompt,
            data={
                "file_tree": file_tree,
                "readme": readme,
                "instructions": body.instructions
            }
        )

        # Check for BAD_INSTRUCTIONS response
        if "BAD_INSTRUCTIONS" in explanation:
            return {"error": "Invalid or unclear instructions provided"}

        full_second_response = claude_service.call_claude_api(
            system_prompt=SYSTEM_SECOND_PROMPT,
            data={
                "explanation": explanation,
                "file_tree": file_tree
            }
        )

        # Extract component mapping from the response
        start_tag = "<component_mapping>"
        end_tag = "</component_mapping>"
        component_mapping_text = full_second_response[
            full_second_response.find(start_tag):
            full_second_response.find(end_tag)
        ]

        # get mermaid.js code from claude
        mermaid_code = claude_service.call_claude_api(
            system_prompt=third_system_prompt,
            data={
                "explanation": explanation,
                "component_mapping": component_mapping_text,
                "instructions": body.instructions
            }
        )

        # Check for BAD_INSTRUCTIONS response
        if "BAD_INSTRUCTIONS" in mermaid_code:
            return {"error": "Invalid or unclear instructions provided"}

        # Process the diagram text before sending to client
        processed_diagram = mermaid_code\
            .replace("[username]", body.username)\
            .replace("[repo]", body.repo)\
            .replace("[branch]", default_branch)

        return {"response": processed_diagram}
    except RateLimitError as e:
        raise HTTPException(
            status_code=429,
            detail="Service is currently experiencing high demand. Please try again in a few minutes."
        )
    except Exception as e:
        return {"error": str(e)}


@router.post("/cost")
@limiter.limit("5/minute")
async def get_generation_cost(request: Request, body: CostRequest):
    try:
        # Get file tree and README content
        file_tree = github_service.get_github_file_paths_as_list(
            body.username, body.repo)
        readme = github_service.get_github_readme(body.username, body.repo)

        # Calculate combined token count
        file_tree_tokens = claude_service.count_tokens(file_tree)
        readme_tokens = claude_service.count_tokens(readme)

        # Calculate approximate cost
        # Input cost: $3 per 1M tokens ($0.000003 per token)
        # Output cost: $15 per 1M tokens ($0.000015 per token)
        # Estimate output tokens as roughly equal to input tokens
        input_cost = ((file_tree_tokens * 2 + readme_tokens) + 3000) * \
            0.000003  # 3 API calls
        output_cost = 3500 * 0.000015  # Estimated output tokens
        estimated_cost = input_cost + output_cost

        # Format as currency string
        cost_string = f"${estimated_cost:.2f} USD"
        return {"cost": cost_string}
    except Exception as e:
        return {"error": str(e)}
