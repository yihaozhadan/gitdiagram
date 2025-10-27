from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from app.services.github_service import GitHubService
from app.services.openrouter_service import OpenRouterService
from app.services.ollama_service import OllamaService
from app.prompts import (
    SYSTEM_FIRST_PROMPT,
    SYSTEM_SECOND_PROMPT,
    SYSTEM_THIRD_PROMPT,
    get_system_third_prompt_with_examples,
)
from pydantic import BaseModel
from functools import lru_cache
import json
import asyncio
import re
import os

# Get debug mode from environment variable
DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'

from app.services.claude_service import ClaudeService
from app.services.groq_service import GroqService
from app.services.openai_service import OpenAIService
from app.utils.mermaid_validator import validate_and_fix_mermaid, get_validation_report
# from app.core.limiter import limiter

load_dotenv()

router = APIRouter(prefix="/generate", tags=["Claude", "Ollama", "Groq", "OpenAI", "OpenRouter"])

# Initialize services
# Initialize all available services
SERVICES = {
    "claude": ClaudeService(),
    "ollama": OllamaService(),
    "groq": GroqService(),
    "openai": OpenAIService(),
    "openrouter": OpenRouterService()
}

# Default models for each service (read from environment variables with fallbacks)
DEFAULT_MODELS = {
    "claude": os.getenv("DEFAULT_MODEL_CLAUDE", "claude-3-opus"),
    "ollama": os.getenv("DEFAULT_MODEL_OLLAMA", "mistral"),
    "groq": os.getenv("DEFAULT_MODEL_GROQ", "mixtral-8x7b-32768"),
    "openai": os.getenv("DEFAULT_MODEL_OPENAI", "gpt-4"),
    "openrouter": os.getenv("DEFAULT_MODEL_OPENROUTER", "minimax/minimax-m2:free")
}

def get_service(service_name: str):
    """Get the service instance by name"""
    if service_name not in SERVICES:
        raise ValueError(f"Service {service_name} not found. Available services: {list(SERVICES.keys())}")
    return SERVICES[service_name]


# cache github data to avoid double API calls
@lru_cache(maxsize=100)
def get_cached_github_data(username: str, repo: str, github_pat: str | None = None):
    # Create a new service instance for each call with the appropriate PAT
    current_github_service = GitHubService(pat=github_pat)

    default_branch = current_github_service.get_default_branch(username, repo)
    if not default_branch:
        default_branch = "main"  # fallback value

    file_tree = current_github_service.get_github_file_paths_as_list(username, repo)
    readme = current_github_service.get_github_readme(username, repo)

    return {"default_branch": default_branch, "file_tree": file_tree, "readme": readme}


class ApiRequest(BaseModel):
    username: str
    repo: str
    instructions: str = ""
    api_key: str | None = None
    github_pat: str | None = None
    service: str = "openrouter"  # Default to OpenRouter
    model: str | None = None  # If None, will use service's default model


def process_click_events(diagram: str, username: str, repo: str, branch: str) -> str:
    """
    Process click events in Mermaid diagram to include full GitHub URLs.
    Detects if path is file or directory and uses appropriate URL format.
    """

    def replace_path(match):
        # Extract the path from the click event
        path = match.group(2).strip("\"'")

        # Determine if path is likely a file (has extension) or directory
        is_file = "." in path.split("/")[-1]

        # Construct GitHub URL
        base_url = f"https://github.com/{username}/{repo}"
        path_type = "blob" if is_file else "tree"
        full_url = f"{base_url}/{path_type}/{branch}/{path}"

        # Return the full click event with the new URL
        return f'click {match.group(1)} "{full_url}"'

    # Match click events: click ComponentName "path/to/something"
    click_pattern = r'click ([^\s"]+)\s+"([^"]+)"'
    return re.sub(click_pattern, replace_path, diagram)


@router.post("/stream")
async def generate_stream(request: Request, body: ApiRequest):
    if len(body.instructions) > 1000:
        return {"error": "Instructions exceed maximum length of 1000 characters"}

    try:
        async def event_generator():
            try:
                # Get cached github data
                if DEBUG:
                    print("\n[DEBUG] Phase 1: Fetching GitHub data...")

                github_data = get_cached_github_data(
                    body.username, body.repo, body.github_pat
                )
                default_branch = github_data["default_branch"]
                file_tree = github_data["file_tree"]
                readme = github_data["readme"]

                if DEBUG:
                    print(f"[DEBUG] Default branch: {default_branch}")
                    print(f"[DEBUG] Number of files: {len(file_tree)}")
                    print(f"[DEBUG] README length: {len(readme) if readme else 0} chars")

                # Send initial status
                yield f"data: {json.dumps({'status': 'started', 'message': 'Starting generation process...'})}\n\n"
                await asyncio.sleep(0.1)

                # Get the requested service and model
                try:
                    service = get_service(body.service)
                    # Use default model if API key is empty, otherwise use specified model or service default
                    if not body.api_key or body.api_key.strip() == "":
                        model = DEFAULT_MODELS[body.service]
                    else:
                        model = body.model if body.model and body.model.strip() else DEFAULT_MODELS[body.service]
                    if hasattr(service, '__init__') and 'model' in str(service.__init__.__code__.co_varnames):
                        service = type(service)(model=model)
                except ValueError as e:
                    yield f"data: {json.dumps({'error': str(e)})}\n\n"
                    return

                # # Token count check for services that support it
                # combined_content = f"{file_tree}\n{readme}"
                # if hasattr(service, 'count_tokens'):
                #     token_count = service.count_tokens(combined_content)
                #     if token_count > 200000:  # Context limit
                #         yield f"data: {json.dumps({'error': f'Repository content exceeds maximum token limit of 200k tokens (got {token_count} tokens). Please try a smaller repository.'})}\n\n"
                #         return

                # Phase 2: Generate initial explanation
                if DEBUG:
                    print("\n[DEBUG] Phase 2: Generating initial explanation...")

                first_system_prompt = SYSTEM_FIRST_PROMPT
                if body.instructions:
                    first_system_prompt = f"{SYSTEM_FIRST_PROMPT}\n\nAdditional instructions: {body.instructions}"

                try:
                    explanation = ""
                    if hasattr(service, 'call_api_stream'):
                        async for chunk in service.call_api_stream(
                            system_prompt=first_system_prompt,
                            data={
                                "file_tree": file_tree,
                                "readme": readme or "No README found",
                            },
                            api_key=body.api_key,
                        ):
                            explanation += chunk
                            yield f"data: {json.dumps({'status': 'explanation_chunk', 'chunk': chunk})}\n\n"
                    else:
                        # Fallback to non-streaming API
                        explanation = await service.call_api(
                            system_prompt=first_system_prompt,
                            data={
                                "file_tree": file_tree,
                                "readme": readme or "No README found",
                            },
                            api_key=body.api_key,
                        )
                        yield f"data: {json.dumps({'status': 'explanation_chunk', 'chunk': explanation})}\n\n"
                except Exception as e:
                    yield f"data: {json.dumps({'error': f'Error calling {body.service} service: {str(e)}'})}\n\n"
                    return

                # Phase 2: Get component mapping
                if DEBUG:
                    print("\n[DEBUG] Phase 2: Getting component mapping...")

                yield f"data: {json.dumps({'status': 'mapping_sent', 'message': f'Sending mapping request to {body.service}...'})}\n\n"
                await asyncio.sleep(0.1)
                yield f"data: {json.dumps({'status': 'mapping', 'message': 'Generating component mapping...'})}\n\n"

                try:
                    mapping = ""
                    if hasattr(service, 'call_api_stream'):
                        async for chunk in service.call_api_stream(
                            system_prompt=SYSTEM_SECOND_PROMPT,
                            data={"explanation": explanation, "file_tree": file_tree},
                            api_key=body.api_key,
                        ):
                            mapping += chunk
                            yield f"data: {json.dumps({'status': 'mapping_chunk', 'chunk': chunk})}\n\n"
                    else:
                        # Fallback to non-streaming API
                        mapping = await service.call_api(
                            system_prompt=SYSTEM_SECOND_PROMPT,
                            data={"explanation": explanation, "file_tree": file_tree},
                            api_key=body.api_key,
                        )
                        if DEBUG:
                            print("\n[DEBUG] Phase 2 Response:")
                            print(mapping[:200] + "..." if len(mapping) > 200 else mapping)
                        yield f"data: {json.dumps({'status': 'mapping_chunk', 'chunk': mapping})}\n\n"
                except Exception as e:
                    yield f"data: {json.dumps({'error': f'Error calling {body.service} service: {str(e)}'})}\n\n"
                    return

                # Extract component mapping
                try:
                    # Use regex to find content between component_mapping tags, including the tags
                    component_mapping_match = re.search(r'<component_mapping>(.*?)</component_mapping>', mapping, re.DOTALL)
                    component_mapping_text = component_mapping_match.group(0) if component_mapping_match else mapping
                except Exception as e:
                    yield f"data: {json.dumps({'error': f'Error extracting component mapping: {str(e)}'})}\n\n"
                    return

                # Phase 3: Generate Mermaid diagram
                if DEBUG:
                    print("\n[DEBUG] Phase 3: Generating Mermaid diagram...")

                yield f"data: {json.dumps({'status': 'diagram_sent', 'message': f'Sending diagram request to {body.service}...'})}\n\n"
                await asyncio.sleep(0.1)
                yield f"data: {json.dumps({'status': 'diagram', 'message': 'Starting diagram generation...'})}\n\n"

                try:
                    # Use the enhanced prompt with real-world examples
                    system_prompt_with_examples = get_system_third_prompt_with_examples()
                    
                    diagram_chunks = []
                    if hasattr(service, 'call_api_stream'):
                        async for chunk in service.call_api_stream(
                            system_prompt=system_prompt_with_examples,
                            data={
                                "explanation": explanation,
                                "component_mapping": component_mapping_text,
                                "instructions": body.instructions,
                            },
                            api_key=body.api_key,
                        ):
                            diagram_chunks.append(chunk)
                            yield f"data: {json.dumps({'status': 'diagram_chunk', 'chunk': chunk})}\n\n"
                    else:
                        # Fallback to non-streaming API
                        diagram = await service.call_api(
                            system_prompt=system_prompt_with_examples,
                            data={
                                "explanation": explanation,
                                "component_mapping": component_mapping_text,
                                "instructions": body.instructions,
                            },
                            api_key=body.api_key,
                        )
                        diagram_chunks.append(diagram)
                        yield f"data: {json.dumps({'status': 'diagram_chunk', 'chunk': diagram})}\n\n"
                except Exception as e:
                    yield f"data: {json.dumps({'error': f'Error calling {body.service} service: {str(e)}'})}\n\n"
                    return

                # Process final diagram
                if DEBUG:
                    print("\n[DEBUG] Final processing...")
                    print("[DEBUG] Raw Mermaid code:")
                    if diagram_chunks:
                        print(diagram_chunks[0])
                    else:
                        print("[DEBUG] No diagram chunks received!")

                # Check if we have diagram content
                if not diagram_chunks:
                    yield f"data: {json.dumps({'error': 'AI did not generate any diagram content. Please try again.'})}\n\n"
                    return

                # Clean up Mermaid code
                full_diagram = ''.join(diagram_chunks)
                
                if not full_diagram.strip():
                    yield f"data: {json.dumps({'error': 'Generated diagram is empty. Please try again with different instructions.'})}\n\n"
                    return
                
                full_diagram = full_diagram.replace("```mermaid", "").replace("```", "")
                full_diagram = re.sub(r"^\s*graph\s+[A-Za-z]+\s*$", "graph TD", full_diagram, flags=re.MULTILINE)

                if "BAD_INSTRUCTIONS" in full_diagram:
                    yield f"data: {json.dumps({'error': 'Invalid or unclear instructions provided'})}\n\n"
                    return
                
                # Validate and auto-fix Mermaid syntax
                if DEBUG:
                    print("\n[DEBUG] Validating and fixing Mermaid syntax...")
                
                try:
                    validation_report = get_validation_report(full_diagram)
                    if DEBUG:
                        print(f"[DEBUG] Validation report: {validation_report}")
                    
                    full_diagram, fixes_applied = validate_and_fix_mermaid(full_diagram)
                except Exception as validation_error:
                    if DEBUG:
                        print(f"[DEBUG] Validation error: {str(validation_error)}")
                    # Continue without validation if it fails
                    fixes_applied = []
                
                if DEBUG and fixes_applied:
                    print(f"[DEBUG] Applied fixes: {fixes_applied}")
                
                # Send fixes info to client if any were applied
                if fixes_applied:
                    yield f"data: {json.dumps({'status': 'fixes_applied', 'fixes': fixes_applied})}\n\n"
                
                # Process click events to add GitHub URLs (after validation)
                full_diagram = process_click_events(
                    full_diagram, body.username, body.repo, default_branch
                )
                
                # Final validation check
                if not full_diagram.strip().startswith(('graph ', 'flowchart ', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram')):
                    yield f"data: {json.dumps({'error': 'Invalid Mermaid diagram syntax - must start with a valid diagram type'})}\n\n"
                    return

                # Send final result with model info
                yield f"data: {json.dumps({
                    'status': 'complete',
                    'diagram': full_diagram,
                    'explanation': explanation,
                    'mapping': component_mapping_text,
                    'model_used': model,
                    'service_used': body.service
                })}\n\n"

            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "X-Accel-Buffering": "no",  # Hint to Nginx
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )
    except Exception as e:
        return {"error": str(e)}
