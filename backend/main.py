from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv

from app.routers import chat, dashboard, data, auth
from app.database import mongodb
from app.core.config import get_settings

load_dotenv()
settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await mongodb.connect_to_mongo()
    yield
    # Shutdown
    await mongodb.close_mongo_connection()

app = FastAPI(
    title="FloatChat API",
    description="AI-powered Ocean Data Analysis API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(data.router, prefix="/api/data", tags=["data"])

@app.get("/")
async def root():
    return {"message": "FloatChat API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )