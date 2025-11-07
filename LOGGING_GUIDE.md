# Widget OTT Exchange - Logging Guide

## Overview

Comprehensive logging has been added to both the frontend and backend to help you trace the complete OTT exchange flow. This guide explains how to read and interpret the logs.

## Where to Find Logs

### Backend Logs
**Location**: Terminal where you ran `python main.py`

The backend prints logs to stdout (terminal output).

### Frontend Logs
**Location**: Browser Developer Console

1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. All frontend logs will appear here with emoji icons for easy identification

## Log Format

### Emoji Key

| Emoji | Meaning | Where |
|-------|---------|-------|
| 🔑 | Authentication/Token | Backend |
| 🚀 | Flow Started | Frontend |
| 📤 | Outgoing Request | Frontend |
| 📥 | Incoming Response | Frontend/Backend |
| 🌐 | API Call | Backend |
| 📡 | API Response | Backend |
| ✅ | Success | Both |
| ❌ | Error | Both |
| 📋 | Parameters/Details | Backend |
| 📨 | PostMessage Sent | Frontend |
| 📬 | Message Received | Frontend |
| 🖼️ | Iframe Related | Frontend |
| 🏠 | Component Mount | Frontend |
| 👂 | Event Listener | Frontend |
| 🔒 | Security Check | Frontend |
| ⏱️ | Timing/Delay | Frontend |
| ⏳ | Waiting | Frontend |
| 🔄 | Retry/Redo | Frontend |
| ℹ️ | Information | Frontend |
| 🧹 | Cleanup | Frontend |

## Complete Flow with Example Logs

### Step 1: User Authenticates (Microsoft SSO)
This happens before widget loading. No widget-specific logs at this stage.

### Step 2: Home Component Mounts

**Frontend Console:**
```
================================================================================
🏠 [FRONTEND] Home component mounted
   - User: John Doe (john.doe@company.com)
   - Widget URL: https://staging.understand.tech/?api_key=...
   - Model ID: bimbab
================================================================================

🖼️ [FRONTEND] Widget iframe element found, setting up onload handler
   - Widget URL: https://staging.understand.tech/?api_key=...
👂 [FRONTEND] Setting up message listener for widget communication
```

**What this means**: 
- Home page loaded successfully
- User is authenticated
- Iframe element created
- Event listeners set up

### Step 3: Iframe Loads

**Frontend Console:**
```
✅ [FRONTEND] Widget iframe loaded successfully
⏱️ [FRONTEND] Waiting 500ms for iframe to initialize...
▶️ [FRONTEND] Starting OTT fetch...
```

**What this means**:
- Widget iframe finished loading
- Giving iframe time to set up message listeners
- About to fetch OTT from backend

### Step 4: Frontend Requests OTT

**Frontend Console:**
```
================================================================================
🚀 [FRONTEND] Starting Widget OTT Exchange Flow
================================================================================
📤 [FRONTEND] Requesting OTT from backend
   - URL: https://backend-smoky-delta.vercel.app/widget/get-ott
   - model_id: bimbab
   - origin: http://localhost:5173
```

**What this means**:
- Frontend is calling parent backend
- Sending model_id and origin in request

### Step 5: Backend Processes Request

**Backend Terminal:**
```
================================================================================
🔑 [BACKEND] Widget OTT Request Started
================================================================================
✅ [BACKEND] User authenticated: john.doe@company.com
📋 [BACKEND] Request params:
   - model_id: bimbab
   - origin: http://localhost:5173
   - user_email: john.doe@company.com
```

**What this means**:
- Backend received the request
- User authentication verified via JWT cookie
- Parameters logged for debugging

### Step 6: Backend Calls UT API

**Backend Terminal:**
```
🌐 [BACKEND] Calling UT API: POST https://staging.understand.tech/widget/ott
   - Authorization: Bearer a5fcf18bb1e8100b0a85...0cdfc7a700
📡 [BACKEND] UT API Response: 200
✅ [BACKEND] OTT received successfully
   - OTT (preview): eyJqaWQiOiI5ZjdlNjQ5ZmUwND...
   - Expires in: 60 seconds
================================================================================
```

**What this means**:
- Backend successfully called UT API
- UT API validated Widget API Key, team, assistant, origin
- OTT generated and returned (60-second expiry)

### Step 7: Frontend Receives OTT

**Frontend Console:**
```
📥 [FRONTEND] Backend response: 200 OK
✅ [FRONTEND] OTT received successfully
   - OTT (preview): eyJqaWQiOiI5ZjdlNjQ5ZmUwND...
   - Expires in: 60 seconds
```

**What this means**:
- Frontend successfully received OTT from backend
- OTT is now ready to send to iframe

### Step 8: Frontend Sends OTT to Iframe

**Frontend Console:**
```
📨 [FRONTEND] Sending OTT to widget iframe
   - Target origin: https://staging.understand.tech
   - Message type: UT_OTT
   - OTT (preview): eyJqaWQiOiI5ZjdlNjQ5ZmUwND...
✅ [FRONTEND] OTT sent to iframe via postMessage
⏳ [FRONTEND] Waiting for widget to exchange OTT...
   (Widget will call UT API /widget/exchange-ott)
================================================================================
```

**What this means**:
- postMessage sent to iframe with OTT
- Widget iframe (UT code) should receive it
- Widget will now exchange OTT for session cookie

### Step 9: Widget Exchanges OTT (Happens Inside Iframe)

**Note**: This happens in the widget iframe's context (UT's code). You won't see these logs in your console unless you're debugging the widget itself.

The widget (UT side) will:
1. Receive the postMessage
2. Call `POST /widget/exchange-ott` with the OTT
3. UT API validates OTT (signature, expiry, replay, origin)
4. UT API sets `ut_session` cookie
5. Widget is now authenticated

### Step 10: Widget Ready for Chat

At this point, the widget should display the chat interface (not a login button) and be ready to accept messages.

## Troubleshooting with Logs

### Issue: No Backend Logs Appear

**Problem**: You don't see any `[BACKEND]` logs

**Check**:
1. Is the backend running? (`python main.py`)
2. Is the frontend actually calling the backend?
3. Check frontend console for 404 or network errors

### Issue: "Not authenticated" Error

**Backend Log:**
```
❌ [BACKEND] No auth token provided
```

**Solution**: 
- Ensure you're logged in via Microsoft SSO first
- Check that auth_token cookie is set (DevTools → Application → Cookies)

### Issue: "Widget API key not configured"

**Backend Log:**
```
❌ [BACKEND] Widget API key not configured in environment
```

**Solution**:
- Add `WIDGET_API_KEY` to `backend/.env`
- Restart backend server

### Issue: UT API Returns Error

**Backend Log:**
```
📡 [BACKEND] UT API Response: 400
❌ [BACKEND] UT API Error: model_not_found
```

**Possible Causes**:
- model_id doesn't exist
- model_id doesn't belong to your team
- Assistant doesn't have SSO enabled
- Origin not in allowed origins list

**Solution**:
- Verify model_id is correct
- Check UT API logs for more details
- Verify Widget API Key matches team

### Issue: OTT Not Reaching Iframe

**Frontend Log:**
```
❌ [FRONTEND] Iframe contentWindow not available
```

**Solution**:
- Iframe may not have loaded yet
- Check that WIDGET_URL is accessible
- Look for CORS errors in console

### Issue: Origin Mismatch

**Frontend Log:**
```
🔒 [FRONTEND] Ignoring message from unauthorized origin: https://other-site.com
```

**This is normal** if other sites are sending messages. Only messages from WIDGET_URL are accepted.

### Issue: Multiple OTT Requests

If you see the OTT fetch happening multiple times, this could be due to:
1. React StrictMode (normal in development)
2. Component re-rendering
3. Network request retries

Check the timestamps to see if they're happening simultaneously or sequentially.

## Log Levels

### Normal Operation

You should see:
- ✅ Success messages at each step
- 📋 Parameter details
- ⏳ Waiting states

### Expected Warnings

These are normal:
```
🔒 [FRONTEND] Ignoring message from unauthorized origin: ...
```
(Messages from other domains are filtered)

```
🧹 [FRONTEND] Cleaning up widget listeners
```
(Component cleanup on unmount)

### Errors to Investigate

Any `❌` messages indicate problems that need fixing:
```
❌ [BACKEND] UT API Error: ...
❌ [FRONTEND] Failed to get OTT: ...
```

## Performance Monitoring

Track timing between steps:

1. **Component Mount → Iframe Load**: Should be < 2 seconds
2. **Iframe Load → OTT Request**: ~500ms (intentional delay)
3. **OTT Request → OTT Response**: Should be < 2 seconds
4. **OTT Response → PostMessage**: Immediate
5. **Total (Mount → Widget Ready)**: Should be < 5 seconds

If any step takes significantly longer, investigate network issues or API performance.

## Debug Tips

### Enable Network Logging

**Frontend**: Open DevTools → Network tab
- Filter by `get-ott` to see the request/response
- Check Status, Headers, Response

**Backend**: The logs already show API calls and responses

### Check Cookies

**Frontend**: Open DevTools → Application → Cookies
- Look for `auth_token` (parent site authentication)
- Look for `ut_session` (widget authentication) under widget domain

### Check PostMessage

**Frontend Console**: Add this temporarily to see all messages:
```javascript
window.addEventListener('message', (e) => {
  console.log('All messages:', e.origin, e.data)
})
```

### Check Iframe Source

**Frontend Console**:
```javascript
console.log(document.querySelector('iframe')?.src)
```

Should show the WIDGET_URL.

## Clean Logs Mode

If you want cleaner logs without emojis, you can modify the code to remove them. However, emojis make it much easier to scan through logs quickly.

## Log Retention

- **Backend**: Logs are printed to terminal and lost when server restarts
- **Frontend**: Logs persist in browser console until page refresh

For production, consider:
- Sending backend logs to a logging service (e.g., CloudWatch, LogDNA)
- Using browser console APIs to send frontend errors to monitoring

## Summary

**Successful flow should show**:

1. ✅ Home component mounted
2. ✅ Iframe loaded
3. ✅ Backend authenticated user
4. ✅ UT API returned OTT
5. ✅ OTT sent to iframe
6. Widget displays chat interface

**Each step has clear, emoji-marked logs** making it easy to identify where any issue occurs.

---

Happy debugging! 🎉

