import requests
from dotenv import load_dotenv
from app.utils.format_message import format_user_message

load_dotenv()


class OllamaService:
    def __init__(self):
        self.base_url = "http://host.docker.internal:11434"  # Default Ollama API URL
        self.default_model = "mistral"  # Default model, can be changed

    def call_ollama_api(
        self, system_prompt: str, data: dict, model: str | None = None
    ) -> str:
        """
        Makes an API call to Ollama and returns the response.

        Args:
            system_prompt (str): The instruction/system prompt
            data (dict): Dictionary of variables to format into the user message
            model (str | None): Optional model name to use (defaults to self.default_model)

        Returns:
            str: Ollama's response text
        """
        # Create the user message with the data
        user_message = format_user_message(data)

        # Prepare the request payload
        payload = {
            "model": model or self.default_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "stream": False,
            "options": {
                "temperature": 0
            }
        }

        try:
            # Make the API call
            response = requests.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=300  # Increased timeout for large models
            )
            response.raise_for_status()
            
            # Extract and return the response text
            result = response.json()
            if not result.get("message") or not result["message"].get("content"):
                raise ValueError("Invalid response format from Ollama")
            return result["message"]["content"]
        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"Failed to connect to Ollama service: {str(e)}")
        except (KeyError, ValueError) as e:
            raise RuntimeError(f"Invalid response from Ollama service: {str(e)}")
        except Exception as e:
            raise RuntimeError(f"Unexpected error calling Ollama service: {str(e)}")

    def count_tokens(self, prompt: str) -> int:
        """
        Counts the number of tokens in a prompt using Ollama's tokenizer.

        Args:
            prompt (str): The prompt to count tokens for

        Returns:
            int: Approximate number of input tokens
        """
        # Ollama doesn't provide a direct token counting endpoint
        # This is a rough approximation: 4 characters per token
        return len(prompt) // 4
