from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from app.database import mongodb
from app.routers import auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await mongodb.connect_to_mongo()
    yield
    # Shutdown
    await mongodb.close_mongo_connection()

app = FastAPI(
    title="FloatChat API - Test",
    description="AI-powered Ocean Data Analysis API - Test Version",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include only auth router for now
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])

@app.get("/")
async def root():
    return {"message": "FloatChat API is running - Test Version", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

if __name__ == "__main__":
    uvicorn.run(
        "test_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
