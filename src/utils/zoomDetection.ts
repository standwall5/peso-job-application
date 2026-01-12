/**
 * Browser Zoom Detection Utility
 * Detects and responds to browser zoom levels (125%, 150%, etc.)
 */

export type ZoomLevel = 'normal' | 'zoomed-125' | 'zoomed-150' | 'zoomed-high';

/**
 * Detects the current browser zoom level
 * @returns ZoomLevel - The detected zoom level
 */
export function detectZoomLevel(): ZoomLevel {
  // Method 1: Using devicePixelRatio
  const devicePixelRatio = window.devicePixelRatio || 1;
  
  // Method 2: Using window.outerWidth vs window.innerWidth
  const widthRatio = window.outerWidth / window.innerWidth;
  
  // Method 3: Using screen.width vs window.innerWidth
  const screenRatio = screen.width / window.innerWidth;
  
  // Calculate zoom level (average of methods for accuracy)
  const zoomLevel = Math.round(devicePixelRatio * 100) / 100;
  
  // Categorize zoom level
  if (zoomLevel >= 1.75) {
    return 'zoomed-high'; // 175%+
  } else if (zoomLevel >= 1.4) {
    return 'zoomed-150'; // 150%
  } else if (zoomLevel >= 1.15) {
    return 'zoomed-125'; // 125%
  } else {
    return 'normal'; // 100%
  }
}

/**
 * Gets the numeric zoom percentage
 * @returns number - Zoom percentage (e.g., 125 for 125%)
 */
export function getZoomPercentage(): number {
  const devicePixelRatio = window.devicePixelRatio || 1;
  return Math.round(devicePixelRatio * 100);
}

/**
 * Checks if the user is zoomed in beyond normal (>100%)
 * @returns boolean
 */
export function isZoomedIn(): boolean {
  return (window.devicePixelRatio || 1) > 1.1;
}

/**
 * Applies zoom-aware class to document body
 * This allows CSS to respond to zoom levels
 */
export function applyZoomClass(): void {
  const zoomLevel = detectZoomLevel();
  const body = document.body;
  
  // Remove existing zoom classes
  body.classList.remove('zoom-normal', 'zoom-125', 'zoom-150', 'zoom-high');
  
  // Add current zoom class
  switch (zoomLevel) {
    case 'normal':
      body.classList.add('zoom-normal');
      break;
    case 'zoomed-125':
      body.classList.add('zoom-125');
      break;
    case 'zoomed-150':
      body.classList.add('zoom-150');
      break;
    case 'zoomed-high':
      body.classList.add('zoom-high');
      break;
  }
}

/**
 * Sets up zoom detection listener
 * Automatically updates zoom class when user zooms
 */
export function setupZoomListener(): () => void {
  const handleResize = () => {
    applyZoomClass();
  };
  
  // Apply initial zoom class
  applyZoomClass();
  
  // Listen for resize events (zoom triggers resize)
  window.addEventListener('resize', handleResize);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}

/**
 * Gets recommended font size adjustment based on zoom
 * @returns string - CSS font-size value
 */
export function getZoomAwareFontSize(baseSize: number = 16): string {
  const zoomLevel = detectZoomLevel();
  
  switch (zoomLevel) {
    case 'zoomed-125':
      return `${baseSize * 0.95}px`; // Slightly smaller to compensate
    case 'zoomed-150':
      return `${baseSize * 0.9}px`; // More reduction
    case 'zoomed-high':
      return `${baseSize * 0.85}px`; // Even more reduction
    default:
      return `${baseSize}px`;
  }
}

/**
 * Calculates zoom-aware spacing
 * @param baseSpacing - Base spacing in pixels
 * @returns number - Adjusted spacing
 */
export function getZoomAwareSpacing(baseSpacing: number): number {
  const zoomLevel = detectZoomLevel();
  
  switch (zoomLevel) {
    case 'zoomed-125':
      return baseSpacing * 0.9;
    case 'zoomed-150':
      return baseSpacing * 0.8;
    case 'zoomed-high':
      return baseSpacing * 0.7;
    default:
      return baseSpacing;
  }
}

/**
 * Logs zoom information to console (for debugging)
 */
export function logZoomInfo(): void {
  console.log('🔍 Zoom Detection Info:');
  console.log('  Device Pixel Ratio:', window.devicePixelRatio);
  console.log('  Zoom Percentage:', getZoomPercentage() + '%');
  console.log('  Zoom Level:', detectZoomLevel());
  console.log('  Screen Width:', screen.width);
  console.log('  Window Inner Width:', window.innerWidth);
  console.log('  Window Outer Width:', window.outerWidth);
}
