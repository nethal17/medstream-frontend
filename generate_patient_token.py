import jwt
from datetime import datetime, timedelta

secret = "your-super-secret-key-change-in-production"
payload = {
    "sub": "968412ca-b6f0-40e7-afc7-9deb75a8aade",
    "role": "patient",
    "roles": ["patient"],
    "type": "access",
    "exp": datetime.utcnow() + timedelta(hours=1)
}
token = jwt.encode(payload, secret, algorithm="HS256")
print(token)
