# Backend API

FastAPI backend for Widget SSO parent website.

## Quick Start

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp env.example .env
# Edit .env with your credentials

# Run server
python main.py
```

Server runs at `http://localhost:8080`

## API Endpoints

### Authentication

- `GET /auth/login` - Get Microsoft OAuth URL
- `GET /auth/callback` - OAuth callback handler
- `GET /auth/user` - Get current user info
- `POST /auth/logout` - Logout current user

### Widget Integration

- `POST /widget/get-ott` - Get One-Time Token for widget (requires authentication)

## Environment Variables

See `env.example` for all required configuration.

