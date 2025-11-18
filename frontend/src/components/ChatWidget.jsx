import { useState, useEffect, useRef } from 'react'
import './ChatWidget.css'
import { getWidgetUrl } from '../config'

function ChatWidget() {
  const [isVisible, setIsVisible] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isChatCreated, setIsChatCreated] = useState(false)
  const [tooltipVisible, setTooltipVisible] = useState(true)
  const [tooltipText, setTooltipText] = useState('')
  
  const iframeRef = useRef(null)
  const tooltipInnerRef = useRef(null)
  
  const bannerMessage = "Chat with us"
  const widgetUrl = getWidgetUrl()

  // Typewriter effect
  useEffect(() => {
    const typeWriter = (text, delay = 35) => {
      let i = 0
      setTooltipText('')
      
      const typing = () => {
        if (i < text.length) {
          setTooltipText(prev => prev + text.charAt(i))
          i++
          setTimeout(typing, delay)
        }
      }
      typing()
    }

    typeWriter(bannerMessage)
    
    const timer = setTimeout(() => {
      setTooltipVisible(false)
    }, 6000)

    return () => clearTimeout(timer)
  }, [])

  const toggleWidget = () => {
    if (!isVisible) {
      if (!isChatCreated) {
        setIsChatCreated(true)
      }
      setIsVisible(true)
      setTooltipVisible(false)
    } else {
      setIsVisible(false)
      setTooltipVisible(true)
      if (isFullscreen) {
        setIsFullscreen(false)
      }
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <>
      {/* Gray Overlay */}
      {isFullscreen && (
        <div 
          className="gray-overlay"
          style={{
            display: 'block',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 10000
          }}
        />
      )}

      {/* Chat Widget Container */}
      <div 
        id="chat-widget-container"
        className={`chat-widget-container ${isFullscreen ? 'fullscreen' : 'standard'}`}
        style={{
          display: isVisible ? 'block' : 'none',
          zIndex: 10001,
          position: 'fixed',
          bottom: isFullscreen ? 'auto' : '100px',
          right: isFullscreen ? 'auto' : '20px',
          borderRadius: '15px',
          overflow: 'hidden',
          backgroundColor: '#fff',
          width: isFullscreen ? '90vw' : '310px',
          height: isFullscreen ? '90vh' : '500px',
          transition: 'all 0.3s ease-in-out',
          ...(isFullscreen && {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          })
        }}
      >
        {/* Fullscreen/Minimize Button */}
        <button
          onClick={toggleFullscreen}
          style={{
            position: 'absolute',
            top: '8px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#263238',
            zIndex: 1
          }}
        >
          <i className={`fas ${isFullscreen ? 'fa-compress-arrows-alt' : 'fa-expand-arrows-alt'}`}></i>
        </button>

        {/* Chat Iframe */}
        <iframe
          ref={iframeRef}
          id="chat-iframe"
          src={isChatCreated ? widgetUrl : ''}
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          title="Chat Widget"
        />
      </div>

      {/* Chat Widget Toggle Button */}
      <div 
        id="chat-widget-toggle"
        onClick={toggleWidget}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 10002,
          cursor: 'pointer',
          textAlign: 'center'
        }}
      >
        {/* Floating Tooltip Text */}
        {tooltipVisible && !isVisible && (
          <div
            id="tooltip-text"
            style={{
              position: 'absolute',
              bottom: '70px',
              right: '6px',
              maxWidth: '320px',
              color: '#000000',
              fontSize: '14px',
              fontWeight: '500',
              lineHeight: '1.4',
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '18px',
              padding: '10px 16px',
              boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              pointerEvents: 'none',
              zIndex: 1,
              textAlign: 'left',
              whiteSpace: 'normal',
              width: 'max-content',
              animation: 'fadeIn 0.5s ease-in-out'
            }}
          >
            <span ref={tooltipInnerRef}>{tooltipText}</span>
            {/* Tail */}
            <span
              className="bubble-tail"
              style={{
                position: 'absolute',
                bottom: '-8px',
                right: '16px',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid #fff',
                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
              }}
            />
          </div>
        )}

        {/* Gradient Icon */}
        <div
          id="icon-container"
          className="icon-container"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #007BFF, #007BFF)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease'
          }}
        >
          <i className="fas fa-comments" style={{ fontSize: '24px', color: 'white' }}></i>
        </div>
      </div>
    </>
  )
}

export default ChatWidget


