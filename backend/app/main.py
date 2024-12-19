from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.routers import generate
from app.core.limiter import limiter
from typing import cast
from starlette.responses import Response
from starlette.exceptions import ExceptionMiddleware

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, cast(
    ExceptionMiddleware, _rate_limit_exceeded_handler))

# Allow requests from your frontend (adjust frontend URL if needed)
origins = [
    "http://localhost:3000",  # Example frontend
    "https://gitdiagram.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(generate.router)

# Root route


@app.get("/")
@limiter.limit("100/day")
async def hello(request: Request):
    return {"message": "Welcome to the GitDiagram API!"}
