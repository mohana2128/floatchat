from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class QueryType(str, Enum):
    TEMPERATURE = "temperature"
    SALINITY = "salinity"
    DEPTH = "depth"
    CURRENT = "current"
    ANOMALY = "anomaly"
    SUMMARY = "summary"

class ChatMessage(BaseModel):
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    data: Optional[Dict[str, Any]] = None
    visualizations: Optional[List[Dict[str, Any]]] = None
    suggestions: Optional[List[str]] = None

class DataQuery(BaseModel):
    query_type: QueryType
    parameters: Dict[str, Any]
    location: Optional[Dict[str, float]] = None
    time_range: Optional[Dict[str, datetime]] = None
    depth_range: Optional[Dict[str, float]] = None

class OceanData(BaseModel):
    float_id: str
    timestamp: datetime
    latitude: float
    longitude: float
    temperature: Optional[float] = None
    salinity: Optional[float] = None
    pressure: Optional[float] = None
    depth: Optional[float] = None

class User(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    name: str
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    preferences: Optional[Dict[str, Any]] = None

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    is_active: bool
    created_at: datetime
    preferences: Optional[Dict[str, Any]] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class SavedQuery(BaseModel):
    id: Optional[str] = None
    user_id: str
    query: str
    response: ChatResponse
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
class Dashboard(BaseModel):
    id: Optional[str] = None
    user_id: str
    name: str
    config: Dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)