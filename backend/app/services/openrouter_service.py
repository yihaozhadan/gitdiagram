from openai import OpenAI
from dotenv import load_dotenv
from app.utils.format_message import format_user_message
import tiktoken
import os
import json
import certifi
import ssl
import httpx
from typing import Literal, AsyncGenerator
from openai import OpenAI
import tiktoken
from dotenv import load_dotenv

load_dotenv()


class OpenRouterService:
    def __init__(self, model: str | None = None):

        self.default_client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
            http_client=httpx.Client(
                verify=False  # Disable SSL verification for development
                # verify=certifi.where()  # Use this in production
            )
        )
        self.encoding = tiktoken.get_encoding("o200k_base")
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.model = model or os.getenv("OPENROUTER_MODEL")

    def call_api(
        self,
        system_prompt: str,
        data: dict,
        api_key: str | None = None,
        reasoning_effort: Literal["low", "medium", "high"] = "low",
    ) -> str:
        """
        Makes an API call to OpenRouter and returns the response.

        Args:
            system_prompt (str): The instruction/system prompt
            data (dict): Dictionary of variables to format into the user message
            api_key (str | None): Optional custom API key
            reasoning_effort (str): Effort level for reasoning, one of "low", "medium", "high"

        Returns:
            str: Model's response text
        """
        # Create the user message with the data
        user_message = format_user_message(data)

        # Use custom client if API key provided, otherwise use default
        client = (
            OpenAI(base_url="https://openrouter.ai/api/v1", api_key=api_key)
            if api_key
            else self.default_client
        )

        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "https://util-kit.com",  # Site URL for rankings
                "X-Title": "util-kit",  # Site title for rankings
            },
            model=self.model,
            reasoning_effort=reasoning_effort,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            max_completion_tokens=12000,
            temperature=0.2,
        )

        if completion.choices[0].message.content is None:
            raise ValueError("No content returned from OpenRouter")

        return completion.choices[0].message.content

    async def call_api_stream(
        self,
        system_prompt: str,
        data: dict,
        api_key: str | None = None,
        reasoning_effort: Literal["low", "medium", "high"] = "low",
    ) -> AsyncGenerator[str, None]:
        """
        Makes a streaming API call to OpenRouter and yields the responses.

        Args:
            system_prompt (str): The instruction/system prompt
            data (dict): Dictionary of variables to format into the user message
            api_key (str | None): Optional custom API key
            reasoning_effort (str): Effort level for reasoning

        Yields:
            str: Chunks of model's response text
        """
        # Create the user message with the data
        user_message = format_user_message(data)

        headers = {
            "HTTP-Referer": "https://util-kit.com",
            "X-Title": "util-kit",
            "Authorization": f"Bearer {api_key or self.default_client.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "max_tokens": 12000,
            "temperature": 0.2,
            "stream": True,
            "reasoning_effort": reasoning_effort,
        }

        async with httpx.AsyncClient(
            verify=False,  # Disable SSL verification for development
            # verify=certifi.where()  # Use this in production
        ) as client:
            async with client.stream(
                'POST',
                self.base_url,
                headers=headers,
                json=payload,
                timeout=60.0
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        if line == "data: [DONE]":
                            break
                        try:
                            data = json.loads(line[6:])
                            if (
                                content := data.get("choices", [{}])[0]
                                .get("delta", {})
                                .get("content")
                            ):
                                yield content
                        except json.JSONDecodeError:
                            # Skip any non-JSON lines
                            continue

    def count_tokens(self, prompt: str) -> int:
        """
        Counts the number of tokens in a prompt.
        Note: This is a rough estimate as OpenRouter may not provide direct token counting.

        Args:
            prompt (str): The prompt to count tokens for

        Returns:
            int: Estimated number of input tokens
        """
        num_tokens = len(self.encoding.encode(prompt))
        return num_tokens
