from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()


class ClaudeService:
    def __init__(self):
        self.client = Anthropic()

    def call_claude_api(self, prompt: str) -> str:
        """
        Makes an API call to Claude and returns the response.

        Args:
            prompt (str): The prompt to send to Claude

        Returns:
            str: Claude's response text
        """
        message = self.client.messages.create(
            model="claude-3-5-sonnet-latest",
            max_tokens=8192,
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

    def count_tokens(self, prompt: str) -> int:
        """
        Counts the number of tokens in a prompt.

        Args:
            prompt (str): The prompt to count tokens for

        Returns:
            int: Number of input tokens
        """
        response = self.client.messages.count_tokens(
            model="claude-3-5-sonnet-latest",
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        return response.input_tokens
