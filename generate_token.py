import jwt
from datetime import datetime, timedelta

secret = "your-super-secret-key-change-in-production"
payload = {
    "sub": "22222222-2222-4222-8222-222222222222",
    "role": "doctor",
    "roles": ["doctor"],
    "type": "access",
    "exp": datetime.utcnow() + timedelta(hours=1)
}
token = jwt.encode(payload, secret, algorithm="HS256")
print(token)
