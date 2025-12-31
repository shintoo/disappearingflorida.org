/**
 * Debounce utility function
 * Delays function execution until after wait milliseconds have elapsed
 * since the last time it was invoked.
 */

export function debounce(func, wait = 100) {
  let timeoutId = null;

  const debounced = function (...args) {
    const context = this;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(context, args);
      timeoutId = null;
    }, wait);
  };

  debounced.cancel = function () {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Throttle utility function
 * Ensures function is called at most once per wait milliseconds
 */
export function throttle(func, wait = 100) {
  let lastTime = 0;
  let timeoutId = null;

  return function (...args) {
    const context = this;
    const now = Date.now();

    if (now - lastTime >= wait) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      func.apply(context, args);
      lastTime = now;
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        func.apply(context, args);
        lastTime = Date.now();
        timeoutId = null;
      }, wait - (now - lastTime));
    }
  };
}
