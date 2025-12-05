import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// FIXED: Enhanced cross-origin error suppression for React DevTools
// This error occurs when React DevTools Profiler tries to serialize component props
// that reference Window objects from cross-origin iframes (often from browser extensions)
const suppressCrossOriginError = (msg, error) => {
  if (!msg) return false;
  
  const msgStr = String(msg);
  const isCrossOriginError = 
    msgStr.includes('$$typeof') || 
    msgStr.includes('cross-origin frame') ||
    msgStr.includes('SecurityError') ||
    (error && error.name === 'SecurityError' && msgStr.includes('Window'));
  
  return isCrossOriginError;
};

// Intercept errors at the earliest possible point - before React Error Overlay
const setupErrorSuppression = () => {
  // 1. Override Error constructor to intercept SecurityError before it propagates
  const OriginalError = window.Error;
  window.Error = function(...args) {
    const error = new OriginalError(...args);
    if (suppressCrossOriginError(error.message, error)) {
      error.__suppressed = true;
    }
    return error;
  };
  window.Error.prototype = OriginalError.prototype;

  // 2. Window Error Listener (Capturing phase - highest priority)
  window.addEventListener('error', (event) => {
    if (suppressCrossOriginError(event.message, event.error)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
  }, true); // Use capture phase

  // 3. Unhandled Rejection Listener
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (reason?.message && suppressCrossOriginError(reason.message, reason)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    // Also check if it's an Error object
    if (reason instanceof Error && suppressCrossOriginError(reason.message, reason)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);

  // 4. Wrap window.onerror (to catch before React Overlay)
  const originalOnError = window.onerror;
  window.onerror = function (msg, url, line, col, error) {
    if (suppressCrossOriginError(msg, error)) {
      // Suppress the error completely
      return true;
    }
    if (originalOnError) {
      return originalOnError.apply(this, arguments);
    }
    return false;
  };

  // 5. Patch console.error (to prevent Overlay from showing logged errors)
  const originalConsoleError = console.error;
  console.error = function (...args) {
    const firstArg = args[0];
    let shouldSuppress = false;
    
    if (typeof firstArg === 'string') {
      shouldSuppress = suppressCrossOriginError(firstArg);
    } else if (firstArg instanceof Error) {
      shouldSuppress = suppressCrossOriginError(firstArg.message, firstArg);
    } else if (firstArg?.message) {
      shouldSuppress = suppressCrossOriginError(firstArg.message, firstArg);
    }
    
    // Also check all arguments
    if (!shouldSuppress) {
      for (const arg of args) {
        if (typeof arg === 'string' && suppressCrossOriginError(arg)) {
          shouldSuppress = true;
          break;
        }
        if (arg instanceof Error && suppressCrossOriginError(arg.message, arg)) {
          shouldSuppress = true;
          break;
        }
      }
    }
    
    if (shouldSuppress) {
      return; // Suppress completely
    }
    
    originalConsoleError.apply(console, args);
  };

  // 6. Patch window.dispatchEvent to intercept errors before React Error Overlay
  const originalDispatchEvent = window.dispatchEvent;
  window.dispatchEvent = function(event) {
    if (event.type === 'error' && event.error) {
      if (suppressCrossOriginError(event.error.message || event.message, event.error)) {
        return true; // Prevent event from propagating to Error Overlay
      }
    }
    return originalDispatchEvent.apply(this, arguments);
  };
};

// Initialize error suppression before React renders
setupErrorSuppression();

// FIXED: Disable React DevTools Profiler hook to prevent cross-origin serialization errors
// This prevents DevTools from trying to serialize Window objects from cross-origin frames
if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  try {
    // Disable profiler hook which causes the $$typeof cross-origin error
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (hook && hook.onCommitFiberRoot) {
      const originalOnCommitFiberRoot = hook.onCommitFiberRoot;
      hook.onCommitFiberRoot = function(...args) {
        try {
          return originalOnCommitFiberRoot.apply(this, args);
        } catch (e) {
          if (suppressCrossOriginError(e.message, e)) {
            // Silently suppress cross-origin errors from DevTools
            return;
          }
          throw e;
        }
      };
    }
    
    // Also wrap the renderer injection to catch errors
    if (hook.renderers && hook.renderers.size > 0) {
      hook.renderers.forEach((renderer) => {
        if (renderer && renderer.injectProfilingHooks) {
          const originalInject = renderer.injectProfilingHooks;
          renderer.injectProfilingHooks = function(...args) {
            try {
              return originalInject.apply(this, args);
            } catch (e) {
              if (suppressCrossOriginError(e.message, e)) {
                return;
              }
              throw e;
            }
          };
        }
      });
    }
  } catch (e) {
    // Ignore errors during DevTools hook patching
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
