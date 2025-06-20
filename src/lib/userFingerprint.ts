// Simple, privacy-focused fingerprinting for anonymous starring
export function getUserFingerprint(): string {
  if (typeof window === 'undefined') return 'server';
  
  // Check if we already have a fingerprint stored
  let fingerprint = localStorage.getItem('menu_user_fp');
  
  if (!fingerprint) {
    // Generate a simple, privacy-friendly fingerprint
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillText('MenuApp', 0, 10);
    }
    
    const fingerprint_data = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    fingerprint = btoa(fingerprint_data).slice(0, 32);
    localStorage.setItem('menu_user_fp', fingerprint);
  }
  
  return fingerprint;
} 