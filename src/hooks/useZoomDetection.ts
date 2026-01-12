'use client';

import { useState, useEffect } from 'react';
import { detectZoomLevel, getZoomPercentage, type ZoomLevel } from '@/utils/zoomDetection';

/**
 * React Hook for detecting browser zoom level
 * @returns Object containing zoom information
 */
export function useZoomDetection() {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('normal');
  const [zoomPercentage, setZoomPercentage] = useState<number>(100);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  useEffect(() => {
    const updateZoom = () => {
      const level = detectZoomLevel();
      const percentage = getZoomPercentage();
      
      setZoomLevel(level);
      setZoomPercentage(percentage);
      setIsZoomed(percentage > 110);
    };

    // Initial detection
    updateZoom();

    // Listen for resize events (zoom triggers resize)
    window.addEventListener('resize', updateZoom);
    
    // Also listen for visual viewport changes (more reliable for zoom)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateZoom);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateZoom);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateZoom);
      }
    };
  }, []);

  return {
    zoomLevel,
    zoomPercentage,
    isZoomed,
    isNormal: zoomLevel === 'normal',
    is125: zoomLevel === 'zoomed-125',
    is150: zoomLevel === 'zoomed-150',
    isHigh: zoomLevel === 'zoomed-high',
  };
}
