# Frontend

React + Vite frontend for Widget SSO parent website.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Server runs at `http://localhost:5173`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features

- Microsoft SSO authentication
- Protected routes
- Placeholder for widget iframe integration
- Responsive design

## Configuration

### Environment Variables

Create a `.env` file in the frontend directory (see `.env.example`):

```bash
# Widget Configuration
# The complete widget URL including API key and model ID
VITE_WIDGET_URL=http://localhost:5173/?api_key=YOUR_API_KEY&model_id=YOUR_MODEL_ID

# Model ID for OTT exchange
VITE_MODEL_ID=your_model_id
```

**Important:**

- The `VITE_WIDGET_URL` should include the complete URL with API key and model ID as query parameters
- Do not separate the API key from the URL
- The widget URL is used for both the embedded iframe and the floating chat widget

### API Configuration

The backend API URL is hardcoded to `http://localhost:8000`. For production, update the `API_BASE_URL` constant in:

- `src/App.jsx`
- `src/pages/Login.jsx`

Consider using environment variables for different environments.
