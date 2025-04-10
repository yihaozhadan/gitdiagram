from fastapi import APIRouter, Request, HTTPException
from dotenv import load_dotenv
from anthropic._exceptions import RateLimitError
from app.prompts import SYSTEM_MODIFY_PROMPT
from pydantic import BaseModel

# Import all services
from app.services.claude_service import ClaudeService
from app.services.groq_service import GroqService
from app.services.ollama_service import OllamaService
from app.services.openai_service import OpenAIService
from app.services.openrouter_service import OpenRouterService

load_dotenv()

router = APIRouter(prefix="/modify", tags=["LLM"])

# Initialize all available services
SERVICES = {
    "claude": ClaudeService(),
    "ollama": OllamaService(),
    "groq": GroqService(),
    "openai": OpenAIService(),
    "openrouter": OpenRouterService()
}

# Default models for each service
DEFAULT_MODELS = {
    "claude": "claude-3-opus",
    "ollama": "mistral",
    "groq": "mixtral-8x7b-32768",
    "openai": "gpt-4",
    "openrouter": "openrouter/quasar-alpha"
}

def get_service(service_name: str):
    """Get the service instance by name"""
    if service_name not in SERVICES:
        raise ValueError(f"Service {service_name} not found. Available services: {list(SERVICES.keys())}")
    return SERVICES[service_name]


# Define the request body model


class ModifyRequest(BaseModel):
    instructions: str
    current_diagram: str
    repo: str
    username: str
    explanation: str
    service: str = "openrouter"  # Default to OpenRouter
    model: str | None = None  # If None, will use service's default model


@router.post("")
# @limiter.limit("2/minute;10/day")
async def modify(request: Request, body: ModifyRequest):
    try:
        # Check instructions length
        if not body.instructions or not body.current_diagram:
            return {"error": "Instructions and/or current diagram are required"}
        elif (
            len(body.instructions) > 1000 or len(body.current_diagram) > 100000
        ):  # just being safe
            return {"error": "Instructions exceed maximum length of 1000 characters"}

        # if body.repo in [
        #     "fastapi",
        #     "streamlit",
        #     "flask",
        #     "api-analytics",
        #     "monkeytype",
        # ]:
        #     return {"error": "Example repos cannot be modified"}

        # modified_mermaid_code = claude_service.call_claude_api(
        #     system_prompt=SYSTEM_MODIFY_PROMPT,
        #     data={
        #         "instructions": body.instructions,
        #         "explanation": body.explanation,
        #         "diagram": body.current_diagram,
        #     },
        # )

        # Get the requested service
        service = get_service(body.service)

        # Use specified model or default for the service
        model = body.model or DEFAULT_MODELS[body.service]

        modified_mermaid_code = service.call_api(
            system_prompt=SYSTEM_MODIFY_PROMPT,
            data={
                "instructions": body.instructions,
                "explanation": body.explanation,
                "diagram": body.current_diagram,
            },
            model=model
        )

        # Check for BAD_INSTRUCTIONS response
        if "BAD_INSTRUCTIONS" in modified_mermaid_code:
            return {"error": "Invalid or unclear instructions provided"}

        return {"diagram": modified_mermaid_code}
    except RateLimitError as e:
        raise HTTPException(
            status_code=429,
            detail="Service is currently experiencing high demand. Please try again in a few minutes.",
        )
    except Exception as e:
        return {"error": str(e)}
