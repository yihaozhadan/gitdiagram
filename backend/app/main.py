from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import analyze

app = FastAPI()

# Make sure this middleware is added before any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://gitdiagram.com", "http://localhost:3000"],
    allow_credentials=True,
    # Be explicit about allowed methods
    allow_methods=["GET"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

app.include_router(analyze.router)

# Root route


@app.get("/")
async def hello():
    return {"message": "Welcome to the GitDiagram API!"}
