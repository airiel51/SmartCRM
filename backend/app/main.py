import sys
import os

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.api import api_router
from app.db.init_db import init_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database schema and preloaded data
    print(f"Starting {settings.PROJECT_NAME} API...")
    init_database()
    yield
    print(f"Shutting down {settings.PROJECT_NAME} API...")


app = FastAPI(
    title=f"{settings.PROJECT_NAME} API",
    description="High-performance backend API with asynchronous AI Agent orchestration (LangGraph), Scikit-Learn predictive modeling, and PostgreSQL relational data layer.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Set CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all origins or configured list
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include master API router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["health"])
def root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy"}
