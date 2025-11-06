from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
import httpx
import os
from dotenv import load_dotenv
import secrets

load_dotenv()

app = FastAPI()

# Session middleware for storing auth state
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET", secrets.token_urlsafe(32))
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://staging.understand.tech", "https://app.understand.tech" , "https://frontend-lovat-pi-76.vercel.app"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Microsoft OAuth configuration
MICROSOFT_CLIENT_ID = os.getenv("MICROSOFT_CLIENT_ID")
MICROSOFT_CLIENT_SECRET = os.getenv("MICROSOFT_CLIENT_SECRET")
MICROSOFT_TENANT_ID = os.getenv("MICROSOFT_TENANT_ID")
REDIRECT_URI = os.getenv("REDIRECT_URI")

# Widget API configuration (for future OTT requests)
WIDGET_API_KEY = os.getenv("WIDGET_API_KEY")
UT_API_BASE_URL = os.getenv("UT_API_BASE_URL")


@app.get("/")
async def root():
    return {"message": "Parent Website Backend"}


@app.get("/auth/login")
async def login(request: Request):
    """Initiate Microsoft OAuth flow"""
    state = secrets.token_urlsafe(16)
    request.session["oauth_state"] = state
    
    auth_url = (
        f"https://login.microsoftonline.com/{MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize?"
        f"client_id={MICROSOFT_CLIENT_ID}"
        f"&response_type=code"
        f"&redirect_uri={REDIRECT_URI}"
        f"&response_mode=query"
        f"&scope=openid email profile"
        f"&state={state}"
    )
    
    return {"auth_url": auth_url}


@app.get("/auth/callback")
async def auth_callback(request: Request, code: str = None, state: str = None):
    """Handle Microsoft OAuth callback"""
    if not code:
        raise HTTPException(status_code=400, detail="No authorization code provided")
    
    # Verify state to prevent CSRF
    session_state = request.session.get("oauth_state")
    if not session_state or session_state != state:
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    
    # Exchange code for token
    token_url = f"https://login.microsoftonline.com/{MICROSOFT_TENANT_ID}/oauth2/v2.0/token"
    
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            token_url,
            data={
                "client_id": MICROSOFT_CLIENT_ID,
                "client_secret": MICROSOFT_CLIENT_SECRET,
                "code": code,
                "redirect_uri": REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
    
    if token_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to obtain access token")
    
    token_data = token_response.json()
    access_token = token_data.get("access_token")
    
    # Get user info
    async with httpx.AsyncClient() as client:
        user_response = await client.get(
            "https://graph.microsoft.com/v1.0/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
    
    if user_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to get user info")
    
    user_data = user_response.json()
    
    # Store user info in session
    request.session["user"] = {
        "email": user_data.get("mail") or user_data.get("userPrincipalName"),
        "name": user_data.get("displayName"),
        "id": user_data.get("id"),
    }
    
    # Redirect back to frontend
    return RedirectResponse(url="http://localhost:5173/home")


@app.get("/auth/user")
async def get_user(request: Request):
    """Get current user from session"""
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


@app.post("/auth/logout")
async def logout(request: Request):
    """Logout user"""
    request.session.clear()
    return {"message": "Logged out successfully"}


@app.post("/widget/get-ott")
async def get_widget_ott(request: Request):
    """
    Get OTT (One-Time Token) from Understand Tech API
    This will be called by the frontend after authentication
    to obtain a token for the widget iframe
    """
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if not WIDGET_API_KEY:
        raise HTTPException(status_code=500, detail="Widget API key not configured")
    
    body = await request.json()
    model_id = body.get("model_id")
    origin = body.get("origin", "http://localhost:5173")
    
    if not model_id:
        raise HTTPException(status_code=400, detail="model_id is required")
    
    # Call UT API to get OTT
    async with httpx.AsyncClient() as client:
        ott_response = await client.post(
            f"{UT_API_BASE_URL}/widget/ott",
            headers={
                "Authorization": f"Bearer {WIDGET_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model_id": model_id,
                "origin": origin,
                "user_email": user.get("email"),
            },
        )
    
    if ott_response.status_code != 200:
        raise HTTPException(
            status_code=ott_response.status_code,
            detail=f"Failed to obtain OTT: {ott_response.text}"
        )
    
    return ott_response.json()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

