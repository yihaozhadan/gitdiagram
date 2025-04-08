from openai import OpenAI
from dotenv import load_dotenv
from app.utils.format_message import format_user_message
import tiktoken
import os
from typing import Literal, AsyncGenerator

load_dotenv()


class OpenAIService:
    def __init__(self, model: str | None = None):
        self.default_client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
        )
        self.encoding = tiktoken.get_encoding("o200k_base")  # Encoder for OpenAI models
        self.base_url = "https://api.openai.com/v1/chat/completions"
        self.model = model or os.getenv("OPENAI_MODEL")

    def call_api(
        self,
        system_prompt: str,
        data: dict,
        api_key: str | None = None,
        reasoning_effort: Literal["low", "medium", "high"] = "low",
    ) -> str:
        """
        Makes an API call to OpenAI and returns the response.

        Args:
            system_prompt (str): The instruction/system prompt
            data (dict): Dictionary of variables to format into the user message
            api_key (str | None): Optional custom API key
            reasoning_effort (str): Effort level for reasoning (only used for compatibility)

        Returns:
            str: Model's response text
        """
        # Create the user message with the data
        user_message = format_user_message(data)

        # Use custom client if API key provided, otherwise use default
        client = OpenAI(api_key=api_key) if api_key else self.default_client

        try:
            print(
                f"Making non-streaming API call to {self.model} with API key: {'custom key' if api_key else 'default key'}"
            )

            completion = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                max_tokens=12000,
                temperature=0.2,
            )

            if completion.choices[0].message.content is None:
                raise ValueError(f"No content returned from {self.model}")

            return completion.choices[0].message.content

        except Exception as e:
            print(f"Error in OpenAI API call: {str(e)}")
            raise

    async def call_api_stream(
        self,
        system_prompt: str,
        data: dict,
        api_key: str | None = None,
        reasoning_effort: Literal["low", "medium", "high"] = "low",
    ) -> AsyncGenerator[str, None]:
        """
        Makes a streaming API call to OpenAI and yields the responses.

        Args:
            system_prompt (str): The instruction/system prompt
            data (dict): Dictionary of variables to format into the user message
            api_key (str | None): Optional custom API key
            reasoning_effort (str): Effort level for reasoning (only used for compatibility)

        Yields:
            str: Chunks of model's response text
        """
        # Create the user message with the data
        user_message = format_user_message(data)

        # Use custom client if API key provided, otherwise use default
        client = OpenAI(api_key=api_key) if api_key else self.default_client

        try:
            stream = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                max_tokens=12000,
                temperature=0.2,
                stream=True,
            )

            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            print(f"Error in OpenAI streaming API call: {str(e)}")
            raise

    def count_tokens(self, prompt: str) -> int:
        """
        Counts the number of tokens in a prompt.

        Args:
            prompt (str): The prompt to count tokens for

        Returns:
            int: Number of input tokens
        """
        num_tokens = len(self.encoding.encode(prompt))
        return num_tokens
