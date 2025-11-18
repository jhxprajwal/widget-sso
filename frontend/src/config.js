// Widget configuration from environment variables

export const WIDGET_CONFIG = {
  // Complete widget URL with API key and model ID
  widgetUrl: import.meta.env.VITE_WIDGET_URL || 'http://localhost:5173/?api_key=a5fcf18bb1e8100b0a85e5f8e2d0cdfc7a7002ac379a36a7cf59fc28d97ce2fa&model_id=gtdave',
  
  // Model ID for OTT exchange
  modelId: import.meta.env.VITE_MODEL_ID || 'gtdave',
}

// Helper function to get the widget URL
export const getWidgetUrl = () => WIDGET_CONFIG.widgetUrl

