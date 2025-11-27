import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '../services/analyticsService';

/**
 * Custom hook to track donation-related analytics
 * @param {Object} options - Configuration options
 * @param {string} options.pageName - Name of the current page for tracking
 * @param {string} options.campaignId - Current campaign ID (if applicable)
 */
export const useDonationAnalytics = ({ pageName, campaignId } = {}) => {
  const location = useLocation();

  // Track page view when component mounts or location changes
  useEffect(() => {
    const pageTitle = pageName || document.title;
    const pagePath = location.pathname + location.search;
    
    analyticsService.trackPageView(pagePath, pageTitle);
    
    // Track campaign view if campaignId is provided
    if (campaignId) {
      analyticsService.trackFunnelStep('campaign_view', { 
        campaignId,
        page_path: pagePath,
        page_title: pageTitle
      });
    }
  }, [location, pageName, campaignId]);

  // Track donation amount selection
  const trackAmountSelected = (amount, options = {}) => {
    analyticsService.trackFunnelStep('amount_selected', {
      event_value: parseFloat(amount),
      currency: 'USD',
      ...options
    });
  };

  // Track donation method selection
  const trackPaymentMethodSelected = (method, options = {}) => {
    analyticsService.trackFunnelStep('payment_method_selected', {
      payment_method: method,
      ...options
    });
  };

  // Track donation submission
  const trackDonationSubmit = (donationData) => {
    const amount = parseFloat(donationData.amount || 0);
    
    analyticsService.trackDonationEvent({
      ...donationData,
      amount,
      event_action: 'donation_submitted'
    });
    
    analyticsService.trackFunnelStep('donation_submitted', {
      event_value: amount,
      currency: 'USD',
      payment_method: donationData.paymentMethod,
      campaign_id: donationData.campaignId
    });
  };

  // Track donation success
  const trackDonationSuccess = (donationData) => {
    analyticsService.trackDonationEvent({
      ...donationData,
      event_action: 'donation_success'
    });
    
    analyticsService.trackFunnelStep('donation_success', {
      amount: parseFloat(donationData.amount),
      currency: 'USD',
      payment_method: donationData.paymentMethod,
      campaign_id: donationData.campaignId,
      donation_id: donationData.donationId
    });
  };

  // Track donation error
  const trackDonationError = (error, context = {}) => {
    analyticsService.trackError(error, {
      ...context,
      event_action: 'donation_error'
    });
  };

  // Track form field interaction
  const trackFormInteraction = (formId, fieldName, action, value) => {
    analyticsService.trackFormInteraction(formId, action, {
      field: fieldName,
      value: value,
      form_id: formId
    });
  };

  // Track custom donation event
  const trackCustomEvent = (eventName, eventData = {}) => {
    analyticsService.trackCustomEvent(`donation_${eventName}`, {
      ...eventData,
      page: pageName,
      campaign_id: campaignId
    });
  };

  return {
    trackAmountSelected,
    trackPaymentMethodSelected,
    trackDonationSubmit,
    trackDonationSuccess,
    trackDonationError,
    trackFormInteraction,
    trackCustomEvent
  };
};
