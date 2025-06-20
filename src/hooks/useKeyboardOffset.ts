import { useEffect, useState } from 'react';

/**
 * Returns the pixel distance by which the on-screen keyboard shrinks the visual viewport.
 * On platforms that do not support `visualViewport`, it falls back to window resize events.
 */
export function useKeyboardOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const computeOffset = () => {
      try {
        if (typeof window === 'undefined') return;

        if ('visualViewport' in window && window.visualViewport) {
          const vv = window.visualViewport;
          const windowHeight = window.innerHeight;
          const viewportHeight = vv.height;
          const offsetTop = vv.offsetTop || 0;
          
          // Calculate the difference, accounting for any offset
          const diff = windowHeight - viewportHeight - offsetTop;
          
          // Only consider it an offset if it's significant (> 100px to avoid false positives)
          setOffset(diff > 100 ? diff : 0);
        } else {
          // Fallback: if viewport got smaller significantly, guess the offset
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.clientHeight;
          const diff = windowHeight - documentHeight;
          
          // Only consider significant differences to avoid false positives
          setOffset(diff > 100 ? diff : 0);
        }
      } catch (e) {
        // noop – defensive coding for SSR/older browsers
        setOffset(0);
      }
    };

    // Initial computation
    computeOffset();

    // Attach listeners
    if ('visualViewport' in window && window.visualViewport) {
      const vv = window.visualViewport;
      vv.addEventListener('resize', computeOffset);
      vv.addEventListener('scroll', computeOffset);
      
      return () => {
        vv.removeEventListener('resize', computeOffset);
        vv.removeEventListener('scroll', computeOffset);
      };
    }

    // Fallback for browsers without visual viewport support
    window.addEventListener('resize', computeOffset);
    window.addEventListener('orientationchange', computeOffset);
    
    return () => {
      window.removeEventListener('resize', computeOffset);
      window.removeEventListener('orientationchange', computeOffset);
    };
  }, []);

  return offset;
} 