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
          const diff = window.innerHeight - vv.height - vv.offsetTop;
          setOffset(diff > 0 ? diff : 0);
        } else {
          // Fallback: if viewport got smaller, guess the offset
          const diff = window.innerHeight - document.documentElement.clientHeight;
          setOffset(diff > 0 ? diff : 0);
        }
      } catch (e) {
        // noop – defensive coding for SSR/older browsers
      }
    };

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

    window.addEventListener('resize', computeOffset);
    return () => window.removeEventListener('resize', computeOffset);
  }, []);

  return offset;
} 