```mermaid

sequenceDiagram
    autonumber

    participant PF as 🌐 Parent FE (Customer Page)
    participant PB as 🖥️ Parent BE (Customer Server)
    participant IF as 🪟 Iframe FE (Widget Assistant)
    participant UA as 🔒 UT API (Understand Tech)
    participant IdP as 🔑 Identity Provider (SSO)

    %% --- INITIAL LOGIN ON PARENT ---
    PF->>PB: (1) User logs in via SSO on parent site
    PB->>IdP: (2) Redirect user to IdP for login
    IdP-->>PB: (3) /callback?code=... (SSO complete)
    PB-->>PF: (4) Set parent session cookie (user authenticated)

    %% --- LOAD PAGE WITH WIDGET ---
    PF->>PB: (5) Request One-Time Token (OTT) for widget
    PB->>UA: (6) POST /widget/ott  (Bearer WIDGET_API_KEY)
    UA->>UA: Validate key, team, assistant, origin
    UA-->>PB: (7) Return { ott, expires_in }
    PB-->>PF: (8) Return OTT to parent FE
    PF-->>IF: (9) postMessage { type=UT_OTT, ott }

    %% --- SILENT AUTHENTICATION IN IFRAME ---
    IF->>UA: (10) POST /widget/exchange-ott  (credentials include)
    UA->>UA: Verify HMAC, expiry, replay, origin
    UA->>UA: Mint session token bound to team and assistant
    UA-->>IF: (11) Set cookie ut_session (HttpOnly + Secure + Partitioned)

    %% --- IF COOKIE MISSING → SILENT SSO FLOW ---
    Note over IF,UA: If no valid ut_session<br/>→ perform silent SSO (prompt=none)
    IF->>UA: (12) GET /api/sso/login/public?mode=iframe
    UA->>IdP: (13) Redirect silently to IdP (prompt=none)
    IdP-->>UA: (14) /api/auth/callback?code=...
    UA->>UA: (15) Verify ID token and mint ut_session
    UA-->>IF: (16) Cookie refreshed silently

    %% --- NORMAL CHAT USE ---
    IF->>UA: (17) GET /api/sso/session/validate  (credentials include)
    UA-->>IF: (18) { ok:true, user:"john@company.com" }
    IF->>UA: (19) POST /apiKey/model/chat_sse_post_v2  (credentials include)
    UA-->>IF: (20) Stream chat response