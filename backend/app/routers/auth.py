from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
from bson import ObjectId
from app.database.mongodb import get_database
from app.models.schemas import UserCreate, UserLogin, UserResponse, Token
from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    verify_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_user_by_email(email: str):
    """Get user by email from database."""
    db = await get_database()
    user = await db.users.find_one({"email": email})
    if user:
        user["id"] = str(user["_id"])
        return user
    return None

async def authenticate_user(email: str, password: str):
    """Authenticate user with email and password."""
    user = await get_user_by_email(email)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    email = verify_token(token)
    if email is None:
        raise credentials_exception
    
    user = await get_user_by_email(email)
    if user is None:
        raise credentials_exception
    
    return user

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    """Register a new user."""
    db = await get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    from datetime import datetime
    user_dict = {
        "email": user_data.email,
        "name": user_data.name,
        "hashed_password": hashed_password,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "preferences": {}
    }
    
    result = await db.users.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)
    
    # Remove password from response
    del user_dict["hashed_password"]
    if "_id" in user_dict:
        del user_dict["_id"]
    
    return UserResponse(**user_dict)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login user and return access token."""
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    """Get current user information."""
    # Remove password from response
    del current_user["hashed_password"]
    if "_id" in current_user:
        del current_user["_id"]
    
    # Ensure created_at is a datetime object
    if current_user.get("created_at") is None:
        from datetime import datetime
        current_user["created_at"] = datetime.utcnow()
    
    return UserResponse(**current_user)

@router.post("/logout")
async def logout():
    """Logout user (client should discard token)."""
    return {"message": "Successfully logged out"}

@router.get("/verify-token")
async def verify_user_token(current_user: dict = Depends(get_current_user)):
    """Verify if the current token is valid."""
    return {"valid": True, "user": current_user["email"]}
