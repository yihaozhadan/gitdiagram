from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.routers import generate, modify, cache
from app.core.limiter import limiter
from typing import cast
from starlette.exceptions import ExceptionMiddleware
from api_analytics.fastapi import Analytics
import os


app = FastAPI()


origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "https://gitdiagram.com",
    "https://gitdiagram.util-kit.com",
    "http://frontend:3000",
    "http://api:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

API_ANALYTICS_KEY = os.getenv("API_ANALYTICS_KEY")
if API_ANALYTICS_KEY:
    app.add_middleware(Analytics, api_key=API_ANALYTICS_KEY)

app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded, cast(ExceptionMiddleware, _rate_limit_exceeded_handler)
)

app.include_router(generate.router)
app.include_router(modify.router)
app.include_router(cache.router)


@app.get("/")
# @limiter.limit("100/day")
async def root(request: Request):
    return {"message": "Hello from GitDiagram API!"}
