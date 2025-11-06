import { useRef, useEffect } from 'react'
import './Home.css'

function Home({ user, onLogout }) {
  const iframeRef = useRef(null)

  useEffect(() => {
    // Future: Here you would fetch OTT and send it to the widget iframe
    // Example implementation:
    // const fetchAndSendOTT = async () => {
    //   try {
    //     const response = await fetch('http://localhost:8000/widget/get-ott', {
    //       method: 'POST',
    //       credentials: 'include',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({
    //         model_id: 'your_model_id',
    //         origin: window.location.origin,
    //       }),
    //     })
    //     const data = await response.json()
    //     
    //     // Send OTT to iframe
    //     if (iframeRef.current?.contentWindow) {
    //       iframeRef.current.contentWindow.postMessage(
    //         { type: 'UT_OTT', ott: data.ott },
    //         'https://your-widget-domain.com'
    //       )
    //     }
    //   } catch (error) {
    //     console.error('Failed to get OTT:', error)
    //   }
    // }
    // 
    // fetchAndSendOTT()
  }, [])

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-content">
          <h1 className="nav-title">Widget SSO Demo</h1>
          <div className="nav-user">
            <span className="user-name">{user.name}</span>
            <span className="user-email">{user.email}</span>
            <button className="logout-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="welcome-section">
          <h2>Welcome, {user.name?.split(' ')[0]}! 👋</h2>
          <p className="subtitle">
            You're successfully authenticated via Microsoft SSO
          </p>
        </div>

        <div className="content-grid">
          <div className="info-card">
            <h3>Hello World!</h3>
            <p>
              This is your parent website dashboard. The widget iframe will be
              embedded in the section below once configured.
            </p>
          </div>

          <div className="widget-section">
            <h3>Widget Area</h3>
            <div className="widget-placeholder">
              <div className="placeholder-content">
                <svg
                  className="placeholder-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p>Widget iframe will be inserted here</p>
                <p className="placeholder-note">
                  Configure your widget URL and model_id to enable the chat assistant
                </p>
              </div>
              
              <iframe 
              src="https://staging.understand.tech/?api_key=a5fcf18bb1e8100b0a85e5f8e2d0cdfc7a7002ac379a36a7cf59fc28d97ce2fa&model_id=gtdave"
              width="100%" height="600px" title="Chat Widget"
              className="widget-iframe"
              ></iframe>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home

