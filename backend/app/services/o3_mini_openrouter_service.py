from openai import OpenAI
from dotenv import load_dotenv
from app.utils.format_message import format_user_message
import tiktoken
import os
import aiohttp
import json
from typing import Literal, AsyncGenerator

load_dotenv()


class OpenRouterO3Service:
    def __init__(self):
        self.default_client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
        )
        self.encoding = tiktoken.get_encoding("o200k_base")
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"

    def call_o3_api(
        self,
        system_prompt: str,
        data: dict,
        api_key: str | None = None,
        reasoning_effort: Literal["low", "medium", "high"] = "low",
    ) -> str:
        """
        Makes an API call to OpenRouter O3 and returns the response.

        Args:
            system_prompt (str): The instruction/system prompt
            data (dict): Dictionary of variables to format into the user message
            api_key (str | None): Optional custom API key

        Returns:
            str: O3's response text
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
                "HTTP-Referer": "https://gitdiagram.com",  # Optional. Site URL for rankings on openrouter.ai.
                "X-Title": "gitdiagram",  # Optional. Site title for rankings on openrouter.ai.
            },
            model="openai/o3-mini",  # Can be configured as needed
            reasoning_effort=reasoning_effort,  # Can be adjusted based on needs
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            max_completion_tokens=12000,  # Adjust as needed
            temperature=0.2,
        )

        if completion.choices[0].message.content is None:
            raise ValueError("No content returned from OpenRouter O3")

        return completion.choices[0].message.content

    async def call_o3_api_stream(
        self,
        system_prompt: str,
        data: dict,
        api_key: str | None = None,
        reasoning_effort: Literal["low", "medium", "high"] = "low",
    ) -> AsyncGenerator[str, None]:
        """
        Makes a streaming API call to OpenRouter O3 and yields the responses.

        Args:
            system_prompt (str): The instruction/system prompt
            data (dict): Dictionary of variables to format into the user message
            api_key (str | None): Optional custom API key

        Yields:
            str: Chunks of O3's response text
        """
        # Create the user message with the data
        user_message = format_user_message(data)

        headers = {
            "HTTP-Referer": "https://gitdiagram.com",
            "X-Title": "gitdiagram",
            "Authorization": f"Bearer {api_key or self.default_client.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": "openai/o3-mini",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "max_tokens": 12000,
            "temperature": 0.2,
            "stream": True,
            "reasoning_effort": reasoning_effort,
        }

        buffer = ""
        async with aiohttp.ClientSession() as session:
            async with session.post(
                self.base_url, headers=headers, json=payload
            ) as response:
                async for line in response.content:
                    line = line.decode("utf-8").strip()
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
                            # Skip any non-JSON lines (like the OPENROUTER PROCESSING comments)
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
