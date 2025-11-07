# Widget OTT Exchange Implementation Summary

## What Was Implemented

This implementation adds secure OTT (One-Time Token) exchange for embedding the Understand Tech widget in a parent website with SSO authentication.

## Files Changed

### Backend Changes

#### `backend/main.py` (lines 191-257)
**Endpoint**: `POST /widget/get-ott`

**Improvements**:
- Added `Accept-Language: en` header (required by UT API)
- Added timeout (10 seconds) for UT API calls
- Improved error handling with better error messages
- Added validation for `UT_API_BASE_URL` configuration
- Proper exception handling for network errors and timeouts

**Flow**:
1. Validates user authentication (JWT cookie)
2. Validates configuration (WIDGET_API_KEY, UT_API_BASE_URL)
3. Calls UT API `/widget/ott` with:
   - Authorization header: `Bearer <WIDGET_API_KEY>`
   - Body: `{ model_id, origin, user_email }`
4. Returns OTT to frontend

### Frontend Changes

#### `frontend/src/App.jsx` (line 7)
**Change**: Exported `API_BASE_URL` constant
```javascript
export const API_BASE_URL = 'https://backend-smoky-delta.vercel.app'
```
Allows Home.jsx to import and use the same backend URL.

#### `frontend/src/pages/Home.jsx` (complete rewrite)
**New Features**:
1. Widget configuration constants:
   ```javascript
   const WIDGET_URL = 'https://app.understand.tech'
   const MODEL_ID = 'Ydol Chatbot'
   ```

2. State management:
   - `widgetReady`: Tracks if OTT has been sent
   - `widgetError`: Stores any error messages

3. OTT fetch and exchange logic in `useEffect`:
   - Fetches OTT from backend on component mount
   - Waits for iframe to load
   - Sends OTT via postMessage to iframe
   - Validates message origin for security
   - Optional: Listens for 'UT_READY' handshake from iframe

4. Dynamic iframe:
   - Uses ref for postMessage access
   - Loads WIDGET_URL (no API key in URL)
   - Includes clipboard permissions
   - Displays loading state while authenticating
   - Shows error messages if OTT fetch fails

#### `frontend/src/pages/Home.css` (additions)
**New Styles**:
- `.widget-placeholder`: Added `flex-direction: column` and `position: relative`
- `.widget-error`: Red error message box
- `.widget-loading`: Overlay loading indicator

## Security Features

1. **Widget API Key Protection**:
   - Never exposed to browser
   - Only used in backend API calls
   - Sent as Bearer token in Authorization header

2. **OTT Security**:
   - Short-lived (60 seconds)
   - Single-use (replay protection via jti)
   - HMAC-signed
   - Origin-bound
   - Team and assistant validated

3. **PostMessage Security**:
   - Validates sender origin
   - Uses targetOrigin parameter (not wildcard)
   - Only sends OTT data (no sensitive info)

4. **Session Cookie** (set by UT API):
   - HttpOnly (not accessible to JavaScript)
   - Secure (HTTPS only in production)
   - SameSite=None (for iframe context)
   - Partitioned (for third-party context)
   - Bound to team ID and assistant ID

## Configuration Required

### Backend Environment Variables

Add to `backend/.env`:
```env
# Required for widget integration
WIDGET_API_KEY=your_team_widget_api_key_here
UT_API_BASE_URL=https://staging.understand.tech
```

### Frontend Configuration

Edit constants in `frontend/src/pages/Home.jsx`:
```javascript
const WIDGET_URL = 'https://app.understand.tech'  // Your widget domain
const MODEL_ID = 'Your Assistant Name'             // Your model/assistant ID
```

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User Authentication (Microsoft SSO)                          │
│    ┌──────┐    Login     ┌─────────┐   OAuth   ┌──────────┐   │
│    │ User │─────────────>│ Backend │──────────>│Microsoft │   │
│    └──────┘              └─────────┘           └──────────┘   │
│                               │                       │         │
│                               │<──────────────────────┘         │
│                               │  auth_token (JWT cookie)        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 2. Load Home Page with Widget                                   │
│    ┌──────────┐ load /home  ┌──────────┐                       │
│    │ Frontend │─────────────>│  React   │                       │
│    │ (Browser)│              │  Home    │                       │
│    └──────────┘              └──────────┘                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 3. OTT Request                                                   │
│    ┌──────────┐              ┌─────────┐                        │
│    │ Frontend │ POST /widget │ Backend │                        │
│    │          │   /get-ott   │         │                        │
│    │          │─────────────>│         │                        │
│    │          │ credentials  │         │                        │
│    │          │   include    │         │                        │
│    └──────────┘              └─────────┘                        │
│                                   │                              │
│                                   │ POST /widget/ott             │
│                                   │ Bearer <WIDGET_API_KEY>      │
│                                   │                              │
│                                   v                              │
│                              ┌─────────┐                         │
│                              │  UT API │                         │
│                              └─────────┘                         │
│                                   │                              │
│                                   │ Validate:                    │
│                                   │ - Widget API Key             │
│                                   │ - Team exists                │
│                                   │ - Assistant SSO enabled      │
│                                   │ - Origin allowed             │
│                                   │                              │
│                                   │ Generate OTT:                │
│                                   │ - jti (unique ID)            │
│                                   │ - exp (60s from now)         │
│                                   │ - tid (team ID)              │
│                                   │ - aid (assistant ID)         │
│                                   │ - origin                     │
│                                   │ - HMAC signature             │
│                                   │                              │
│    ┌──────────┐              ┌─────────┐                        │
│    │ Frontend │<─────────────│ Backend │<── { ott, expires_in } │
│    └──────────┘   { ott }    └─────────┘                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 4. PostMessage to Iframe                                         │
│    ┌──────────┐ postMessage  ┌────────┐                         │
│    │ Frontend │─────────────>│ Iframe │                         │
│    │  (Parent)│  {           │(Widget)│                         │
│    │          │   type:      │        │                         │
│    │          │   'UT_OTT',  │        │                         │
│    │          │   ott        │        │                         │
│    │          │  }           │        │                         │
│    └──────────┘ targetOrigin └────────┘                         │
│                 = WIDGET_URL                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 5. OTT Exchange (Inside Iframe - UT Code)                       │
│    ┌────────┐              ┌─────────┐                          │
│    │ Iframe │ POST /widget │  UT API │                          │
│    │(Widget)│  /exchange   │         │                          │
│    │        │    -ott      │         │                          │
│    │        │─────────────>│         │                          │
│    │        │ credentials  │         │                          │
│    │        │   include    │         │                          │
│    │        │ Origin header│         │                          │
│    └────────┘              └─────────┘                          │
│                                 │                                │
│                                 │ Validate:                      │
│                                 │ - HMAC signature valid         │
│                                 │ - Not expired (< 60s)          │
│                                 │ - Not used before (jti check)  │
│                                 │ - Origin matches               │
│                                 │ - Team/assistant still valid   │
│                                 │                                │
│                                 │ Actions:                       │
│                                 │ - Mark jti as used             │
│                                 │ - Create session               │
│                                 │ - Set HttpOnly cookie          │
│                                 │                                │
│    ┌────────┐              ┌─────────┐                          │
│    │ Iframe │<─────────────│  UT API │                          │
│    │        │ Set-Cookie:  │         │                          │
│    │        │  ut_session  │         │                          │
│    │        │  (HttpOnly,  │         │                          │
│    │        │   Secure,    │         │                          │
│    │        │   Partitioned│         │                          │
│    │        │   SameSite=  │         │                          │
│    │        │   None)      │         │                          │
│    └────────┘              └─────────┘                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 6. Widget Authenticated - Ready for Chat                        │
│    ┌────────┐              ┌─────────┐                          │
│    │ Widget │ POST /api    │  UT API │                          │
│    │  Chat  │  /model/chat │  (Chat) │                          │
│    │   UI   │─────────────>│         │                          │
│    │        │ credentials: │         │                          │
│    │        │   include    │         │                          │
│    │        │ (sends       │         │                          │
│    │        │  ut_session  │         │                          │
│    │        │  cookie)     │         │                          │
│    │        │              │         │                          │
│    │        │<─────────────│         │                          │
│    │        │ Chat response│         │                          │
│    └────────┘              └─────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

## API Reference

### Backend API

#### POST `/widget/get-ott`
**Auth**: Requires `auth_token` cookie (JWT)

**Request Body**:
```json
{
  "model_id": "Assistant Name",
  "origin": "https://your-site.com"
}
```

**Response** (200):
```json
{
  "ott": "eyJqa...base64.signature",
  "expires_in": 60
}
```

**Errors**:
- 401: Not authenticated or invalid token
- 400: Missing model_id
- 500: Widget API key not configured
- 502: Failed to connect to UT API
- 504: UT API timeout

### UT API (Called by Backend)

#### POST `/widget/ott`
**Auth**: `Authorization: Bearer <WIDGET_API_KEY>`

**Headers**:
- `Accept-Language: en`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "model_id": "assistant_id",
  "origin": "https://parent-site.com",
  "user_email": "user@company.com"
}
```

**Response** (200):
```json
{
  "ott": "eyJqa...base64.signature",
  "expires_in": 60
}
```

### UT API (Called by Widget Iframe)

#### POST `/widget/exchange-ott`
**Auth**: None (OTT in body)

**Headers**:
- `Origin: https://parent-site.com` (browser-set)
- `Content-Type: application/json`

**Request Body**:
```json
{
  "ott": "eyJqa...base64.signature"
}
```

**Response** (200):
```json
{
  "detail": "ok"
}
```

**Sets Cookie**: `ut_session=<session_token>; HttpOnly; Secure; SameSite=None; Partitioned`

## Testing

See `WIDGET_INTEGRATION_TEST.md` for complete testing guide.

**Quick Test**:
1. Login via Microsoft SSO
2. Navigate to /home
3. Check browser console for OTT fetch
4. Check DevTools → Network for `/widget/get-ott` call
5. Check DevTools → Application → Cookies for `ut_session`
6. Verify widget displays chat interface

## Troubleshooting

**Common Issues**:

1. **"Widget API key not configured"**
   - Add `WIDGET_API_KEY` to backend `.env`

2. **"Failed to obtain OTT from UT API"**
   - Check `UT_API_BASE_URL` is correct
   - Verify WIDGET_API_KEY matches team's key
   - Check assistant requires SSO

3. **OTT not reaching iframe**
   - Verify `WIDGET_URL` matches iframe origin
   - Check iframe loaded before postMessage
   - Verify no CORS errors in console

4. **Widget not authenticated**
   - Check for `ut_session` cookie
   - Enable third-party cookies in browser
   - Verify OTT exchanged within 60 seconds

## Production Considerations

1. **Environment Variables**:
   - Use production UT API URL
   - Rotate Widget API Key if leaked
   - Use strong JWT_SECRET

2. **CORS**:
   - Update `allow_origins` in backend to production domains
   - Never use `*` with credentials

3. **Cookies**:
   - Always use `Secure` flag in production (HTTPS)
   - Consider cookie domain settings

4. **Monitoring**:
   - Log OTT requests (team_id, model_id, origin)
   - Alert on high OTT exchange failures
   - Track OTT replay attempts

5. **Rate Limiting**:
   - Limit OTT requests per user
   - Prevent OTT generation abuse

## Support

For issues or questions:
1. Check `WIDGET_INTEGRATION_TEST.md` troubleshooting section
2. Review browser console and network logs
3. Check backend logs for UT API errors
4. Verify environment variables are set correctly

