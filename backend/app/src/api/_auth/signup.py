from app.src.utils._auth.initialize import db
from datetime import datetime
from pydantic import BaseModel, field_validator
from app.src.dict import SignupRequest, UserDict
import bcrypt
import re

MIN_USERNAME_LENGTH = 3
MIN_PASSWORD_LENGTH = 8

class SignupUserDict(BaseModel):
    id: str
    username: str
    password: str
    created_at: datetime
    updated_at: datetime
    bio: str = ''
    email: str = ''
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        if len(v) < MIN_USERNAME_LENGTH:
            raise ValueError('Username must be at least 3 characters long')
        return v

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < MIN_PASSWORD_LENGTH:
            raise ValueError('Password must be at least 8 characters long')
        return v
    

def signup(req: SignupRequest):
    try:
        username = req.username
        password = req.password
        email = req.email
        
        # Validate email format
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            raise ValueError('Invalid email found')
        
        # check if user already exists
        existing_users = db.collection('users').where('email', '==', email).get()
        if len(existing_users) > 0:
            raise ValueError('User with this email already exists')

        # Get count of all existing users to generate sequential ID
        user_ref = db.collection('users').get()
        user_doc = db.collection('users').document()
        user_id = user_doc.id    
        
        # Hash the password
        encoded_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        user = SignupUserDict(
            id=user_id,
            username=username,
            password=encoded_password.decode('utf-8'),  # Convert bytes to string for JSON serialization
            created_at=datetime.now(),
            updated_at=datetime.now(),
            bio='',
            email=email
        )
        
        user_doc.set(user.model_dump())
        return UserDict(
            id=user_id,
            username=username,
            email=email,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    except ValueError as e:
        raise e
    except Exception as e:
        raise ValueError(f"Signup failed: {str(e)}")