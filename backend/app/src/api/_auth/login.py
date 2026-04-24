from app.src.utils._auth.initialize import db
from datetime import datetime
from app.src.dict import LoginRequest, UserDict
import bcrypt


def login(req: LoginRequest):
    try:
        email = req.email
        password = req.password
        # check if user already exists
        existing_users = db.collection('users').where('email', '==', email).get()
        if len(existing_users) == 0:
            raise ValueError('User with this email does not exist')

        # Get the first (and should be only) user
        user_doc = existing_users[0]
        user_data = user_doc.to_dict()

        # Verify password
        stored_password = user_data.get('password', '')
        if not bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8')):
            raise ValueError("Invalid password")

        return UserDict(
            id=user_data.get('id', ''),
            username=user_data.get('username', ''),
            email=email,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )

    except ValueError as e:
        raise e
    except Exception as e:
        raise ValueError(f"Login failed: {str(e)}")