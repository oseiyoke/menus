import { useEffect } from 'react';

/**
 * Hook to lock/unlock body scroll when modals are open
 * Prevents background scrolling and iOS bounce effects
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const body = document.body;
    const html = document.documentElement;

    if (isLocked) {
      // Save current scroll position
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      // Apply lock styles
      body.classList.add('modal-open');
      body.style.top = `-${scrollY}px`;
      body.style.left = `-${scrollX}px`;

      // Store scroll position for restoration
      body.dataset.scrollY = scrollY.toString();
      body.dataset.scrollX = scrollX.toString();

      // Prevent iOS rubber band scrolling
      const preventDefault = (e: TouchEvent) => {
        if (e.touches.length > 1) return;
        e.preventDefault();
      };

      document.addEventListener('touchmove', preventDefault, { passive: false });

      return () => {
        document.removeEventListener('touchmove', preventDefault);
      };
    } else {
      // Remove lock styles
      body.classList.remove('modal-open');
      
      // Restore scroll position
      const scrollY = parseInt(body.dataset.scrollY || '0', 10);
      const scrollX = parseInt(body.dataset.scrollX || '0', 10);
      
      body.style.top = '';
      body.style.left = '';
      
      window.scrollTo(scrollX, scrollY);
      
      // Clean up data attributes
      delete body.dataset.scrollY;
      delete body.dataset.scrollX;
    }
  }, [isLocked]);
} 