from app.src.utils._auth.initialize import db
from app.src.utils._auth.jwt import create_access_token, create_refresh_token
from datetime import datetime
from app.src.dict import LoginRequest, UserDict, AuthResponse
import bcrypt


def login(req: LoginRequest) -> AuthResponse:
    try:
        email = req.email
        password = req.password

        existing_users = db.collection('users').where('email', '==', email).get()
        if len(existing_users) == 0:
            raise ValueError('User with this email does not exist')

        user_doc = existing_users[0]
        user_data = user_doc.to_dict()

        stored_password = user_data.get('password', '')
        if not bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8')):
            raise ValueError("Invalid password")

        user = UserDict(
            id=user_data.get('id'),
            username=user_data.get('username'),
            email=email,
            created_at=user_data.get('created_at', datetime.now()),
            updated_at=user_data.get('updated_at', datetime.now())
        )

        token_data = {"id": user.id, "email": user.email, "username": user.username}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        return AuthResponse(user=user, access_token=access_token, refresh_token=refresh_token)

    except ValueError as e:
        raise e
    except Exception as e:
        raise ValueError(f"Login failed: {str(e)}")