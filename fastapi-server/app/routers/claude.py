from fastapi import APIRouter
import anthropic
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/hello", tags=["Claude"])

client = anthropic.Anthropic()


@router.get("/send")
async def send_message(prompt: str):
    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
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
        return {"response": message.content}
    except Exception as e:
        return {"error": str(e)}
