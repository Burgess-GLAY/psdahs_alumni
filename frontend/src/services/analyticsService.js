// Analytics Service for tracking user interactions and donations
class AnalyticsService {
  constructor() {
    this.isInitialized = false;
    this.initialize();
  }

  // Initialize analytics (e.g., Google Analytics, custom tracking)
  initialize() {
    if (this.isInitialized) return;
    
    // Initialize your analytics provider here (e.g., Google Analytics, Mixpanel, etc.)
    // Example for Google Analytics:
    if (typeof window !== 'undefined') {
      // Initialize data layer if it doesn't exist
      window.dataLayer = window.dataLayer || [];
      
      // Define gtag function if it doesn't exist
      if (typeof window.gtag === 'undefined') {
        window.gtag = function() {
          window.dataLayer.push(arguments);
        };
        
        // Initialize with default configuration
        window.gtag('js', new Date());
        
        // Initialize with your GA4 Measurement ID
        const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;
        if (measurementId) {
          window.gtag('config', measurementId, {
            send_page_view: true,
            transport_url: 'https://www.google-analytics.com/analytics.js',
          });
        } else {
          console.warn('Google Analytics Measurement ID not found. Analytics will run in debug mode.');
        }
      }
    }
    
    this.isInitialized = true;
    console.log('Analytics service initialized');
  }

  // Track page views
  trackPageView(pagePath, pageTitle) {
    if (!this.isInitialized) return;
    
    const data = {
      event: 'page_view',
      page_path: pagePath,
      page_title: pageTitle,
      timestamp: new Date().toISOString()
    };
    
    // Send to analytics provider
    this.sendToAnalytics(data);
    
    // Also log to console for debugging
    console.log(`Page View: ${pageTitle} (${pagePath})`, data);
  }

  // Track donation events
  trackDonationEvent(eventData) {
    if (!this.isInitialized) return;
    
    const data = {
      event: 'donation',
      ...eventData,
      timestamp: new Date().toISOString()
    };
    
    this.sendToAnalytics(data);
    console.log('Donation Event:', data);
  }

  // Track form interactions
  trackFormInteraction(formId, action, data = {}) {
    if (!this.isInitialized) return;
    
    const eventData = {
      event: 'form_interaction',
      form_id: formId,
      action,
      ...data,
      timestamp: new Date().toISOString()
    };
    
    this.sendToAnalytics(eventData);
    console.log(`Form Interaction (${formId}):`, action, data);
  }

  /**
   * Track a step in the donation funnel
   * @param {string} step - Name of the funnel step (e.g., 'campaign_view', 'amount_selected')
   * @param {Object} data - Additional data to track with the funnel step
   */
  trackFunnelStep(step, data = {}) {
    if (!this.isInitialized) return;
    
    // Handle both old and new signature (step as string or object with stepName)
    const stepName = typeof step === 'string' ? step : (step.stepName || 'unknown_step');
    const eventData = {
      event: 'funnel_step',
      step: stepName,
      event_category: 'donation_funnel',
      event_label: stepName,
      value: 1,
      ...(typeof step === 'object' ? step : {}), // Include all properties if step is an object
      ...data,
      timestamp: new Date().toISOString()
    };
    
    this.sendToAnalytics(eventData);
    console.log(`Funnel Step (${step}):`, data);
  }

  // Track errors
  trackError(error, context = {}) {
    if (!this.isInitialized) return;
    
    const errorData = {
      event: 'error',
      error: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      context,
      timestamp: new Date().toISOString()
    };
    
    this.sendToAnalytics(errorData);
    console.error('Error Tracked:', error, context);
  }

  // Track a custom event
  trackCustomEvent(eventName, eventData = {}) {
    if (!this.isInitialized) return;
    
    // Implementation for Google Analytics
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      try {
        window.gtag('event', eventName, eventData);
      } catch (error) {
        console.error('Error sending event to Google Analytics:', error);
      }
    }
    
    // Log to console for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Event: ${eventName}`, eventData);
    }
  }
  
  /**
   * Track a step in the donation funnel
   * @param {string} stepName - Name of the funnel step (e.g., 'campaign_view', 'amount_selected')
   * @param {Object} data - Additional data to track with the funnel step
   */
  trackFunnelStep(stepName, data = {}) {
    if (!this.isInitialized) return;
    
    const eventData = {
      ...data,
      event_category: 'donation_funnel',
      event_label: stepName,
      value: 1
    };
    
    // Send to analytics
    this.trackCustomEvent(stepName, eventData);
    
    // Also track as a pageview for funnel visualization
    this.trackPageView(`/funnel/${stepName}`, `Funnel: ${stepName}`);
  }

  // Helper method to send data to analytics provider
  sendToAnalytics(data) {
    // In a real implementation, this would send data to your analytics provider
    // For example, with Google Analytics:
    // gtag('event', data.event, data);
    
    // For now, we'll just log to console and potentially send to an API endpoint
    this.logToServer(data);
  }

  // Example method to log analytics to your server
  async logToServer(data) {
    try {
      // In a real implementation, you would send this to your backend API
      // const response = await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // return await response.json();
    } catch (error) {
      console.error('Error logging to analytics server:', error);
    }
  }
}

// Create a singleton instance
export const analyticsService = new AnalyticsService();

// Export a hook for React components
export const useAnalytics = () => {
  return analyticsService;
};

export default analyticsService;
