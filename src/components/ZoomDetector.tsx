'use client';

import { useEffect } from 'react';
import { setupZoomListener, logZoomInfo } from '@/utils/zoomDetection';

/**
 * ZoomDetector Component
 * Automatically detects browser zoom and applies appropriate CSS classes
 * Add this component to your root layout
 */
export default function ZoomDetector({ debug = false }: { debug?: boolean }) {
  useEffect(() => {
    // Set up zoom detection
    const cleanup = setupZoomListener();

    // Log zoom info in development mode
    if (debug && process.env.NODE_ENV === 'development') {
      logZoomInfo();
      
      // Log again when zoom changes
      const handleResize = () => {
        setTimeout(() => logZoomInfo(), 100);
      };
      window.addEventListener('resize', handleResize);
      
      return () => {
        cleanup();
        window.removeEventListener('resize', handleResize);
      };
    }

    return cleanup;
  }, [debug]);

  // This component doesn't render anything
  return null;
}
