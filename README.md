# widget-sso

This repository contains a full-stack demo website that serves as a **parent website** for embedding the Understand Tech widget with SSO authentication.

## What's Included

- **Backend**: FastAPI (Python) with Microsoft OAuth SSO
- **Frontend**: React + Vite with modern UI
- **Documentation**: Complete setup guide and architecture documentation

## Quick Start

See [SETUP.md](SETUP.md) for detailed installation and configuration instructions.

## Project Structure

```
widget-sso/
├── backend/          # FastAPI Python backend
├── frontend/         # React frontend
├── SETUP.md         # Setup instructions
└── README.md        # This file + Widget SSO concept
```

---

# Widget SSO Integration Concept

Here's a clear, functional (non-code) explanation you can hand to your devs so they understand how the widget + SSO flow works end-to-end, including what each party does and why it's secure.
Functional overview
Goal: Allow a customer to embed an Understand Tech assistant (chat widget) in their website (an <iframe>), protected by the customer’s SSO, without exposing any secrets in the browser.
 How: The parent site proves it’s trusted using a server-side Widget API Key. The server issues a short-lived OTT (One-Time Token) to the browser, which the iframe exchanges for a secure session cookie. All chat API calls then use that cookie.
Actors & responsibilities
Parent Website (browser): hosts the iframe. Receives a one-time token (OTT) from its own backend and forwards it to the iframe via postMessage.
Parent Backend (server): holds the Widget API Key (never sent to the browser). Calls UT /widget/ott to obtain the OTT.
Understand Tech Backend (UT API):
/widget/ott: validates the customer (Widget API Key), creates & signs an OTT.
/widget/exchange-ott: verifies OTT, sets a secure session cookie for the iframe.
Chat APIs: require that session cookie (SSO gate).
Assistant (iframe app): on load, waits for an OTT from the parent; exchanges it; then chats.
Why it’s secure (in practice)
The Widget API Key never leaves the parent backend. Browsers only see the OTT.
OTTs are HMAC-signed, short-lived (e.g., 60s), single-use, and bound to the parent site’s origin.
The iframe session is a HttpOnly cookie (not readable by JS), bound to the assistant (aid) and team (tid).
Optional allowed origins per team prevent unknown sites from embedding.
Happy-path flows
A) Iframe with SSO when the user is not already SSO’d
Parent browser loads the page with the iframe.
Parent browser asks its backend for an OTT:
Backend → UT /widget/ott (Authorization: Bearer <TEAM_WIDGET_API_KEY>; body includes model_id, origin).
UT verifies key, team, model, origin → returns { ott, expires_in }.
Parent browser postMessage({type:'UT_OTT', ott}) to the iframe.
Iframe calls UT /widget/exchange-ott with credentials: 'include':
UT verifies OTT (signature, expiry, origin, replay) → sets HttpOnly session cookie (partitioned for iframe).
Returns ok.
Iframe can now call chat APIs with credentials: 'include' — the cookie gates access.
If SSO login is required: the iframe (or your top-level app) can trigger /sso/login/public which redirects to the IdP. On callback, UT sets the same server session cookie and redirects back. After that, chat works.
B) Iframe when the user is already SSO’d on the parent site
Same as above. The difference is the parent backend may include an email hint in /widget/ott if you want (optional); but no re-auth happens inside the iframe. The OTT → session cookie exchange is enough.
What each API guarantees (functional contract)
POST /widget/ott (Parent backend → UT)
Input: model_id, origin, optional user_email; header: Authorization: Bearer <TEAM_WIDGET_API_KEY>.
Validates: assistant is SSO-protected, team exists, widget API key matches stored hash, origin allowed.
Returns: { ott, expires_in }.
Security: OTT is single-use, expires quickly, origin-bound.
POST /widget/exchange-ott (Iframe → UT, with Origin header)
Input: { ott }.
Validates: signature, TTL, not used before (jti), origin matches, team/assistant still valid.
Action: marks jti used; creates UT session (aid/tid bound); sets HttpOnly cookie (Partitioned/SameSite for iframe).
Returns: { detail: "ok" }.
GET /api/sso/session/validate (optional)
Reads session cookie; returns who you are bound as (aid/tid), or 401 if missing/invalid.
Frontend can use this to decide whether to show the login button or the chat box.
Chat APIs (Iframe → UT)
Must be called with credentials: 'include'.
UT checks cookie → must exist and include the same aid as the requested assistant; else 403/401.
Frontend responsibilities (high level)
Parent page (browser):
On load, call your own backend to get { ott }.
Send OTT to iframe:
iframeEl.contentWindow.postMessage({ type: 'UT_OTT', ott }, iframeOrigin);
(Optional) Listen for 'UT_READY' messages from iframe to know when it’s ready to receive the OTT.
Iframe app (assistant UI):
Add a window.addEventListener('message', ...):
When { type: 'UT_OTT', ott } arrives → fetch('/widget/exchange-ott', { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ott }) }).
On success: you’re authenticated → enable chat UI.
All fetches to UT must include credentials: 'include'.
If /api/sso/session/validate returns 401, show “Sign in to continue” and call /sso/login/public (mode=iframe if you use the popup + postMessage flow).
CORS & cookies (dev vs prod)
Dev (localhost):
API runs on http://localhost:8000, frontend on http://localhost:5173.
CORS on API: allow_origins=['http://localhost:5173'], allow_credentials=True.
Cookie for top flow: SameSite=Lax, secure=False, domain omitted.
Cookie for iframe: set Partitioned + SameSite=None (Chrome supports partitioned cookies). In pure HTTP localhost, you can’t set Secure; that’s fine for dev.
Prod (HTTPS):
Always set Secure; SameSite=None for iframe cookies (plus Partitioned).
allow_origins must list the real customer origins (no * when credentials:'include').
Consider an origin allowlist in team SSO config (allowed_origins).
Operational notes
Widget API Key is per team. Store only sha256 hash in sso_company_info.
 Provision it at SSO setup time and give the raw key to the customer’s backend only.
OTTs are stored in a small collection (ott_used) by their jti to block replay.
The session cookie payload is bound to tid and aid. Chat guard enforces matching aid to prevent cross-assistant use.
Expire OTTs quickly (60s is good) and rotate Widget API Keys if leaked.
Logging: log team_id, model_id, and origin for /widget/ott and /widget/exchange-ott to trace embeds.
Quick acceptance checklist
 /widget/ott rejects wrong/absent Authorization or unknown origin.
 /widget/exchange-ott rejects reused OTT (replay) and mismatched origin.
 After exchange, /api/sso/session/validate returns ok with the correct aid/tid.
 Chat API works only when credentials:'include' and aid matches cookie.
 No Widget API Key ever appears in browser DevTools or network logs.
 Clearing cookies forces a fresh OTT+exchange before chat works again.
That’s the functional story the team can build against and QA.
