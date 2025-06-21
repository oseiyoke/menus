import { useEffect, useState, useCallback, RefObject } from 'react';

interface KeyboardAwareModalState {
  modalStyle: React.CSSProperties;
  backdropStyle: React.CSSProperties;
  isKeyboardVisible: boolean;
}

/**
 * Hook that manages modal positioning and animations in response to keyboard visibility.
 * Provides styles for both the modal and backdrop to ensure smooth transitions.
 */
export function useKeyboardAwareModal(isOpen: boolean): KeyboardAwareModalState {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [modalTransform, setModalTransform] = useState('translateY(100%)');
  const [backdropOpacity, setBackdropOpacity] = useState('0');

  const updateKeyboardMetrics = useCallback(() => {
    if (typeof window === 'undefined') return;

    if ('visualViewport' in window && window.visualViewport) {
      const viewport = window.visualViewport;
      const windowHeight = window.innerHeight;
      const viewportHeight = viewport.height;
      const offsetTop = viewport.offsetTop || 0;
      
      // Calculate keyboard height
      const calculatedHeight = windowHeight - viewportHeight - offsetTop;
      
      // Consider keyboard visible if height is more than 100px
      const keyboardIsVisible = calculatedHeight > 100;
      
      setKeyboardHeight(keyboardIsVisible ? calculatedHeight : 0);
      setIsKeyboardVisible(keyboardIsVisible);
    } else {
      // Fallback for older browsers
      const windowHeight = window.innerHeight;
      const threshold = windowHeight * 0.75; // If window shrinks by more than 25%, assume keyboard
      
      if (document.documentElement.clientHeight < threshold) {
        const estimatedKeyboardHeight = windowHeight - document.documentElement.clientHeight;
        setKeyboardHeight(estimatedKeyboardHeight);
        setIsKeyboardVisible(true);
      } else {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    }
  }, []);

  // Handle body scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const body = document.body;
    const scrollY = window.scrollY;

    // Prevent body scroll
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflowY = 'scroll'; // Preserve scrollbar width
    
    // Store original scroll position
    body.dataset.scrollY = String(scrollY);

    // Prevent iOS bounce
    const preventTouchMove = (e: TouchEvent) => {
      // Allow scrolling within the modal content
      const target = e.target as HTMLElement;
      const isScrollable = target.closest('[data-scrollable="true"]');
      
      if (!isScrollable) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventTouchMove, { passive: false });

    return () => {
      // Restore body scroll
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      body.style.overflowY = '';

      const originalScrollY = parseInt(body.dataset.scrollY || '0', 10);
      window.scrollTo(0, originalScrollY);
      delete body.dataset.scrollY;

      document.removeEventListener('touchmove', preventTouchMove);
    };
  }, [isOpen]);

  // Handle keyboard detection
  useEffect(() => {
    if (!isOpen) return;

    updateKeyboardMetrics();

    // Visual viewport API (modern browsers)
    if ('visualViewport' in window && window.visualViewport) {
      const viewport = window.visualViewport;
      viewport.addEventListener('resize', updateKeyboardMetrics);
      viewport.addEventListener('scroll', updateKeyboardMetrics);

      return () => {
        viewport.removeEventListener('resize', updateKeyboardMetrics);
        viewport.removeEventListener('scroll', updateKeyboardMetrics);
      };
    } else {
      // Fallback listeners
      window.addEventListener('resize', updateKeyboardMetrics);
      window.addEventListener('orientationchange', updateKeyboardMetrics);

      return () => {
        window.removeEventListener('resize', updateKeyboardMetrics);
        window.removeEventListener('orientationchange', updateKeyboardMetrics);
      };
    }
  }, [isOpen, updateKeyboardMetrics]);

  // Handle modal animation
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure smooth animation
      requestAnimationFrame(() => {
        setModalTransform('translateY(0)');
        setBackdropOpacity('0.3');
      });
    } else {
      setModalTransform('translateY(100%)');
      setBackdropOpacity('0');
    }
  }, [isOpen]);

  // Use CSS env() for safe area - it's handled in CSS not JS
  const safeAreaBottom = 20; // Base padding, CSS will add safe area on top

  // Calculate modal styles
  const modalStyle: React.CSSProperties = {
    transform: modalTransform,
    // Add padding for keyboard and safe area
    paddingBottom: isKeyboardVisible ? `${keyboardHeight + 10}px` : `${safeAreaBottom}px`,
    // Ensure modal doesn't go too high when keyboard is visible
    maxHeight: isKeyboardVisible ? 'calc(100vh - 100px)' : '90vh',
  };

  const backdropStyle: React.CSSProperties = {
    opacity: backdropOpacity,
  };

  return {
    modalStyle,
    backdropStyle,
    isKeyboardVisible,
  };
} 