import { useState, useCallback, useEffect } from 'react';

interface SafariCompatibilityOptions {
  maxCanvasSize?: number;
  enableFallback?: boolean;
  detectDevice?: boolean;
}

interface DeviceInfo {
  isSafari: boolean;
  isIOS: boolean;
  isMobile: boolean;
  supportsWebGL: boolean;
  maxCanvasSize: number;
}

export const useSafariCompatibility = (options: SafariCompatibilityOptions = {}) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isSafari: false,
    isIOS: false,
    isMobile: false,
    supportsWebGL: false,
    maxCanvasSize: 4096
  });

  const detectDevice = useCallback(() => {
    const userAgent = navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isMobile = /Mobi|Android/i.test(userAgent) || isIOS;
    
    // Test WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const supportsWebGL = !!gl;
    
    // Test max canvas size for iOS/Safari
    let maxCanvasSize = options.maxCanvasSize || 4096;
    if (isIOS) {
      // iOS has stricter canvas size limits
      maxCanvasSize = Math.min(maxCanvasSize, 2048);
    }
    
    setDeviceInfo({
      isSafari,
      isIOS,
      isMobile,
      supportsWebGL,
      maxCanvasSize
    });
  }, [options.maxCanvasSize]);

  useEffect(() => {
    if (options.detectDevice !== false) {
      detectDevice();
    }
  }, [detectDevice, options.detectDevice]);

  const loadImageSafely = useCallback(async (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Only set crossOrigin for external URLs
      if (src.startsWith('http') && !src.includes(window.location.hostname)) {
        img.crossOrigin = 'anonymous';
      }
      
      img.onload = () => resolve(img);
      img.onerror = () => {
        // Create fallback image
        const fallbackImg = new Image();
        fallbackImg.width = 100;
        fallbackImg.height = 100;
        resolve(fallbackImg);
      };
      
      img.src = src;
    });
  }, []);

  const isCanvasTainted = useCallback((canvas: HTMLCanvasElement): boolean => {
    try {
      canvas.toDataURL();
      return false;
    } catch (e) {
      return true;
    }
  }, []);

  const exportCanvasSafely = useCallback(async (
    canvas: HTMLCanvasElement,
    format: 'png' | 'jpeg' = 'png',
    quality = 0.9
  ): Promise<string | null> => {
    try {
      // Check if canvas is tainted
      if (isCanvasTainted(canvas)) {
        console.warn('Canvas is tainted, cannot export');
        return null;
      }
      
      // Use blob for Safari compatibility
      if (deviceInfo.isSafari || deviceInfo.isIOS) {
        return new Promise((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve(url);
            } else {
              resolve(null);
            }
          }, `image/${format}`, quality);
        });
      }
      
      // Standard data URL for other browsers
      return canvas.toDataURL(`image/${format}`, quality);
    } catch (error) {
      console.error('Canvas export failed:', error);
      return null;
    }
  }, [deviceInfo, isCanvasTainted]);

  const downloadSafely = useCallback((url: string, filename: string) => {
    if (deviceInfo.isIOS) {
      // iOS doesn't support programmatic downloads well
      // Open in new window for user to save manually
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL if it was created
      if (url.startsWith('blob:')) {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } else {
      // Standard download for other platforms
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
      
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    }
  }, [deviceInfo]);

  const getOptimalCanvasSize = useCallback((width: number, height: number) => {
    const maxSize = deviceInfo.maxCanvasSize;
    const ratio = Math.min(maxSize / width, maxSize / height);
    
    if (ratio < 1) {
      return {
        width: Math.floor(width * ratio),
        height: Math.floor(height * ratio),
        scale: ratio
      };
    }
    
    return { width, height, scale: 1 };
  }, [deviceInfo]);

  return {
    deviceInfo,
    loadImageSafely,
    isCanvasTainted,
    exportCanvasSafely,
    downloadSafely,
    getOptimalCanvasSize,
    detectDevice
  };
};