/**
 * Debounce utility function.
 * Delays invoking func until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean }
): ((...args: Parameters<T>) => void) & { cancel: () => void; flush: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;
  const leading = options?.leading ?? false;
  const trailing = options?.trailing ?? true;

  function invoke() {
    if (lastArgs && trailing) {
      func.apply(lastThis, lastArgs);
    }
    timeoutId = null;
    lastArgs = null;
    lastThis = null;
  }

  function debounced(this: any, ...args: Parameters<T>) {
    lastArgs = args;
    lastThis = this;

    const callNow = leading && !timeoutId;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(invoke, wait);

    if (callNow) {
      func.apply(this, args);
    }
  }

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
    lastThis = null;
  };

  debounced.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      invoke();
    }
  };

  return debounced;
}
