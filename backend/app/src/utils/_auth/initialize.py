import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import os
import json

load_dotenv()

# Parse the Firebase credentials from environment variable
firebase_creds = os.getenv('FIREBASE_CREDENTIALS')
if firebase_creds:
    # If it's a JSON string, parse it
    try:
        cred_dict = json.loads(firebase_creds)
        cred = credentials.Certificate(cred_dict)
    except json.JSONDecodeError:
        # If it's a file path, use it directly
        cred = credentials.Certificate(firebase_creds)
else:
    raise ValueError("FIREBASE_CREDENTIALS environment variable not found")
firebase_admin.initialize_app(cred)

db = firestore.client()


