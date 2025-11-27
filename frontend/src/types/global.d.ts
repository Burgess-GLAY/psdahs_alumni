// Type definitions for Google Analytics gtag.js
declare global {
  interface Window {
    gtag: (
      command: string,
      eventName: string,
      eventParams?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

export {}; // This file needs to be a module
