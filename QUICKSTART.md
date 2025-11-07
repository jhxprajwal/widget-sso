# Widget OTT Exchange - Quick Start

## What Was Done

The widget OTT (One-Time Token) exchange flow has been fully implemented in this repository. The parent website can now securely authenticate the embedded Understand Tech widget using SSO.

## Files Modified

### Backend
- ✅ `backend/main.py` - Enhanced `/widget/get-ott` endpoint with proper error handling and Accept-Language header

### Frontend
- ✅ `frontend/src/App.jsx` - Exported API_BASE_URL for reuse
- ✅ `frontend/src/pages/Home.jsx` - Implemented complete OTT fetch and postMessage flow
- ✅ `frontend/src/pages/Home.css` - Added error and loading state styles

### Documentation
- ✅ `SETUP.md` - Updated with widget integration steps
- ✅ `WIDGET_INTEGRATION_TEST.md` - Complete testing guide
- ✅ `IMPLEMENTATION_SUMMARY.md` - Technical implementation details
- ✅ `QUICKSTART.md` - This file

## Configuration Needed

### 1. Backend Environment Variables

Edit `backend/.env` and add:

```env
# Widget Integration (Required)
WIDGET_API_KEY=your_team_widget_api_key_from_understand_tech
UT_API_BASE_URL=https://staging.understand.tech

# Or for production:
# UT_API_BASE_URL=https://app.understand.tech
```

### 2. Frontend Widget Configuration

Edit `frontend/src/pages/Home.jsx` (lines 6-7):

```javascript
const WIDGET_URL = 'https://app.understand.tech'  // Change if needed
const MODEL_ID = 'Your Assistant Name'            // Change to your model ID
```

## How to Run

### Start Backend
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```
Backend runs on: `http://localhost:8000`

### Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

## How It Works

1. **User logs in** via Microsoft SSO on parent site
2. **Home page loads** with widget iframe
3. **Frontend fetches OTT** from backend `/widget/get-ott`
4. **Backend calls UT API** `/widget/ott` with Widget API Key
5. **UT API returns signed OTT** (60-second expiry)
6. **Frontend sends OTT** to iframe via postMessage
7. **Widget iframe exchanges OTT** for session cookie (UT handles this)
8. **Widget is authenticated** and ready for chat

## Verify It's Working

### Check 1: Backend Logs
Should see successful OTT fetch:
```
POST /widget/get-ott
Response: 200 OK
```

### Check 2: Browser Console
Should see OTT being sent to iframe (if you add console.log):
```javascript
Sending OTT to iframe: { type: 'UT_OTT', ott: '...' }
```

### Check 3: Network Tab
- Request to `/widget/get-ott` → 200 OK
- Response contains `{ "ott": "...", "expires_in": 60 }`

### Check 4: Cookies
- Open DevTools → Application → Cookies
- Look for `ut_session` cookie under widget domain
- Should be HttpOnly, Secure (if HTTPS), Partitioned

### Check 5: Widget Interface
- Widget should show chat interface (not login button)
- You can send messages and get responses

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "Widget API key not configured" | Add `WIDGET_API_KEY` to backend `.env` |
| "Failed to obtain OTT" | Check `UT_API_BASE_URL` and verify key is correct |
| OTT not reaching iframe | Verify `WIDGET_URL` matches iframe's actual origin |
| Widget not authenticated | Check for `ut_session` cookie; enable 3rd party cookies |
| "Not authenticated" on /widget/get-ott | Ensure you're logged in via Microsoft SSO first |

## Testing

For complete testing guide, see `WIDGET_INTEGRATION_TEST.md`

**Quick Test**:
1. ✅ Login with Microsoft
2. ✅ See your name/email on home page
3. ✅ Widget iframe loads
4. ✅ No errors in console
5. ✅ Widget shows chat interface

## Security Features

✅ Widget API Key never exposed to browser  
✅ OTT is single-use (replay protection)  
✅ OTT expires in 60 seconds  
✅ OTT is origin-bound  
✅ Session cookie is HttpOnly  
✅ Origin validation on all requests  

## Next Steps

1. **Get your Widget API Key** from Understand Tech team
2. **Configure environment variables** as shown above
3. **Test the flow** using the verification steps
4. **Deploy to staging** for further testing
5. **Review security** before production deployment

## Documentation Index

- `README.md` - Widget SSO concept overview
- `SETUP.md` - Complete setup instructions
- `WIDGET_INTEGRATION_TEST.md` - Testing guide with troubleshooting
- `IMPLEMENTATION_SUMMARY.md` - Technical details and API reference
- `QUICKSTART.md` - This file
- `seqdia.md` - Sequence diagram of the flow

## Support

If you encounter issues:
1. Check `WIDGET_INTEGRATION_TEST.md` troubleshooting section
2. Verify all environment variables are set
3. Check browser console and network logs
4. Review backend logs for UT API errors
5. Ensure you're using the correct Widget API Key for your team

---

**Ready to start!** Just configure your environment variables and run both servers.

