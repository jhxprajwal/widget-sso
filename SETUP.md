# Widget SSO Parent Website Setup Guide

This is a full-stack web application that serves as a parent website for embedding the Understand Tech widget with SSO authentication.

## Architecture

- **Frontend**: React + Vite (Port 5173)
- **Backend**: FastAPI + Python (Port 8000)
- **Authentication**: Microsoft OAuth 2.0

## Prerequisites

- Node.js (v16 or higher)
- Python 3.8 or higher
- Microsoft Azure account for OAuth app registration

## Step 1: Microsoft OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** > **App registrations** > **New registration**
3. Configure your app:
   - **Name**: Widget SSO Demo (or your preferred name)
   - **Supported account types**: Choose based on your needs (e.g., "Accounts in any organizational directory")
   - **Redirect URI**: 
     - Type: Web
     - URI: `http://localhost:8000/auth/callback`
4. After registration, note down:
   - **Application (client) ID**
   - **Directory (tenant) ID**
5. Create a client secret:
   - Go to **Certificates & secrets**
   - Click **New client secret**
   - Add a description and choose expiry
   - **Copy the secret value immediately** (you won't be able to see it again)

## Step 2: Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a Python virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file from the example:
```bash
cp env.example .env
```

5. Edit `.env` and fill in your configuration:
```env
MICROSOFT_CLIENT_ID=your_application_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret_value
MICROSOFT_TENANT_ID=your_tenant_id_or_common
REDIRECT_URI=http://localhost:8000/auth/callback

# Generate a random secret for sessions (you can use: python -c "import secrets; print(secrets.token_urlsafe(32))")
SESSION_SECRET=your_random_secret_here

# Widget API Configuration (for future Understand Tech integration)
WIDGET_API_KEY=your_widget_api_key_from_understand_tech
UT_API_BASE_URL=https://api.understandtech.com
```

6. Run the backend server:
```bash
python main.py
```

The backend should now be running at `http://localhost:8000`

## Step 3: Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend should now be running at `http://localhost:5173`

## Step 4: Test the Application

1. Open your browser and go to `http://localhost:5173`
2. You should see the login page
3. Click **"Sign in with Microsoft"**
4. You'll be redirected to Microsoft's login page
5. After successful authentication, you'll be redirected back to the home page
6. The home page displays:
   - Your name and email from Microsoft
   - A welcome message
   - A placeholder for the widget iframe (to be configured later)

## Step 5: Widget Integration (Future)

When you're ready to integrate the Understand Tech widget:

1. Obtain your Widget API Key from Understand Tech
2. Add it to your backend `.env` file
3. In `frontend/src/pages/Home.jsx`, uncomment the OTT fetching logic
4. Configure the iframe URL to point to your widget domain
5. The backend endpoint `/widget/get-ott` will handle fetching the One-Time Token

## Architecture Flow

1. **Login Flow**:
   - User clicks "Sign in with Microsoft"
   - Frontend calls backend `/auth/login`
   - Backend returns Microsoft OAuth URL
   - User is redirected to Microsoft
   - After auth, Microsoft redirects to `/auth/callback`
   - Backend exchanges code for token, stores user in session
   - User is redirected back to frontend home page

2. **Session Management**:
   - Backend uses HTTP-only session cookies
   - Frontend makes authenticated requests with `credentials: 'include'`
   - Session persists until logout

3. **Widget Integration** (when configured):
   - Frontend requests OTT from backend
   - Backend calls Understand Tech API with Widget API Key
   - Backend returns OTT to frontend
   - Frontend sends OTT to widget iframe via postMessage
   - Widget exchanges OTT for session cookie

## Project Structure

```
widget-sso/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── env.example         # Environment variables template
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx    # Login page component
│   │   │   ├── Login.css
│   │   │   ├── Home.jsx     # Home page component
│   │   │   └── Home.css
│   │   ├── App.jsx          # Main app component with routing
│   │   ├── App.css
│   │   ├── main.jsx         # Entry point
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .gitignore
├── README.md               # Widget SSO concept documentation
└── SETUP.md               # This file
```

## Troubleshooting

### Backend Issues

- **Import errors**: Make sure virtual environment is activated and dependencies are installed
- **OAuth errors**: Verify your Microsoft app credentials in `.env`
- **CORS errors**: Check that `allow_origins` in `main.py` matches your frontend URL

### Frontend Issues

- **Can't connect to backend**: Ensure backend is running on port 8000
- **Login redirect fails**: Check that `REDIRECT_URI` in backend `.env` matches Azure app registration
- **Build errors**: Delete `node_modules` and run `npm install` again

### Authentication Issues

- **Redirect URI mismatch**: Make sure the redirect URI in Azure portal exactly matches the one in your `.env`
- **Tenant issues**: Try using "common" as `MICROSOFT_TENANT_ID` for multi-tenant support

## Development Notes

- Both servers must be running simultaneously
- Backend handles authentication and will handle widget OTT requests
- Frontend is a SPA with React Router
- Sessions are stored in-memory (use Redis or database for production)

## Production Deployment

For production:
1. Use proper session storage (Redis, database)
2. Set secure session secrets
3. Update CORS origins to production domains
4. Use HTTPS for all endpoints
5. Update Microsoft OAuth redirect URIs to production URLs
6. Enable secure cookies in production

## Next Steps

- Configure your Widget API Key when ready
- Customize the UI to match your brand
- Add error handling and user feedback
- Implement session persistence with Redis/database
- Add logging and monitoring

