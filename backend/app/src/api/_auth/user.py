from datetime import datetime
from app.src.dict import UserDict
from app.src.utils._auth.initialize import db
def user(id: str) -> UserDict:
    try:
        # Query users by username
        user_ref = db.collection('users').document(id).get()
        
        if not user_ref.exists:
            raise ValueError(f"User with id {id} does not exist")
        
        # Get the first (and should be only) user document
        user_doc = user_ref
        user = user_doc.to_dict()

        return UserDict(
            id=user_ref.id,  # Use the stored ID from the document
            username=user.get('username', ''),
            created_at=user.get('created_at', datetime.now()),
            updated_at=user.get('updated_at', datetime.now()),
            bio=user.get('bio', ''),
            email=user.get('email')
        )

    except ValueError as e:
        raise e
    except Exception as e:
        raise ValueError(f"User fetch failed: {str(e)}")
