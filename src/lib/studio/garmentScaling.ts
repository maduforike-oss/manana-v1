import * as THREE from 'three';

// Universal Garment Scale Standards - all sizes normalized to 1.0 unit scale
export const GARMENT_SCALE_STANDARDS = {
  // Apparel - Adult Medium baseline (1.0)
  'tshirt': { scale: 1.0, bounds: { width: 12, height: 16, depth: 0.6 }, anchor: 'bottom-center' },
  't-shirt': { scale: 1.0, bounds: { width: 12, height: 16, depth: 0.6 }, anchor: 'bottom-center' },
  'hoodie': { scale: 0.85, bounds: { width: 15, height: 18, depth: 0.8 }, anchor: 'bottom-center' },
  'longsleeve': { scale: 1.0, bounds: { width: 19, height: 16, depth: 0.5 }, anchor: 'bottom-center' },
  'polo': { scale: 1.0, bounds: { width: 12, height: 16, depth: 0.56 }, anchor: 'bottom-center' },
  'crewneck': { scale: 0.9, bounds: { width: 13, height: 16, depth: 0.7 }, anchor: 'bottom-center' },
  'tank': { scale: 1.0, bounds: { width: 12, height: 16, depth: 0.4 }, anchor: 'bottom-center' },
  'vneck': { scale: 1.0, bounds: { width: 12, height: 16, depth: 0.6 }, anchor: 'bottom-center' },
  'button-shirt': { scale: 1.0, bounds: { width: 11, height: 17, depth: 0.44 }, anchor: 'bottom-center' },
  'zip-hoodie': { scale: 0.85, bounds: { width: 15, height: 18, depth: 0.8 }, anchor: 'bottom-center' },
  'pullover': { scale: 0.9, bounds: { width: 13, height: 16, depth: 0.7 }, anchor: 'bottom-center' },
  'bomber': { scale: 0.8, bounds: { width: 14, height: 15, depth: 1.0 }, anchor: 'bottom-center' },
  'denim-jacket': { scale: 0.8, bounds: { width: 14, height: 16, depth: 0.9 }, anchor: 'bottom-center' },
  'womens-tank': { scale: 0.95, bounds: { width: 11, height: 15, depth: 0.4 }, anchor: 'bottom-center' },
  'womens-tee': { scale: 0.95, bounds: { width: 11, height: 15, depth: 0.5 }, anchor: 'bottom-center' },
  'performance': { scale: 1.0, bounds: { width: 12, height: 16, depth: 0.3 }, anchor: 'bottom-center' },
  'onesie': { scale: 0.7, bounds: { width: 9, height: 12, depth: 0.5 }, anchor: 'bottom-center' },
  
  // Headwear - standardized to head proportion
  'cap': { scale: 0.4, bounds: { width: 5.6, height: 4, depth: 5.6 }, anchor: 'center' },
  'snapback': { scale: 0.4, bounds: { width: 5.6, height: 4, depth: 5.6 }, anchor: 'center' },
  'beanie': { scale: 0.35, bounds: { width: 5, height: 3.5, depth: 5 }, anchor: 'center' },
  'trucker': { scale: 0.4, bounds: { width: 5.6, height: 4, depth: 5.6 }, anchor: 'center' },
  
  // Accessories
  'tote': { scale: 0.6, bounds: { width: 8.4, height: 9.6, depth: 1.2 }, anchor: 'bottom-center' },
  'apron': { scale: 0.9, bounds: { width: 10, height: 14, depth: 0.3 }, anchor: 'top-center' },
  
  // Default fallback
  'default': { scale: 1.0, bounds: { width: 12, height: 16, depth: 0.6 }, anchor: 'bottom-center' }
} as const;

export type GarmentAnchor = 'center' | 'bottom-center' | 'top-center';

export interface GarmentBounds {
  width: number;
  height: number;
  depth: number;
}

export interface GarmentStandard {
  scale: number;
  bounds: GarmentBounds;
  anchor: GarmentAnchor;
}

// Viewport Management Class
export class ViewportManager {
  private static readonly MOBILE_BREAKPOINT = 768;
  private static readonly TABLET_BREAKPOINT = 1024;
  
  // Standard viewport padding (percentage of viewport)
  private static readonly PADDING = {
    mobile: 0.15,    // 15% padding on mobile
    tablet: 0.12,    // 12% padding on tablet
    desktop: 0.1     // 10% padding on desktop
  };

  // Camera distance multipliers based on device
  private static readonly CAMERA_DISTANCE = {
    mobile: 1.4,     // Closer for touch interaction
    tablet: 1.2,     // Medium distance
    desktop: 1.0     // Standard distance
  };

  // Get garment standard with fallback
  static getGarmentStandard(garmentType: string): GarmentStandard {
    const type = garmentType.toLowerCase().replace(/[-_\s]/g, '');
    return GARMENT_SCALE_STANDARDS[type as keyof typeof GARMENT_SCALE_STANDARDS] || 
           GARMENT_SCALE_STANDARDS.default;
  }

  // Calculate standardized scale for any garment
  static getStandardizedScale(garmentType: string): number {
    const standard = this.getGarmentStandard(garmentType);
    return standard.scale;
  }

  // Get garment bounds in world units
  static getGarmentBounds(garmentType: string): GarmentBounds {
    const standard = this.getGarmentStandard(garmentType);
    const scale = standard.scale;
    
    return {
      width: standard.bounds.width * scale,
      height: standard.bounds.height * scale,
      depth: standard.bounds.depth * scale
    };
  }

  // Calculate positioning anchor point
  static getAnchorPosition(garmentType: string, bounds: GarmentBounds): THREE.Vector3 {
    const standard = this.getGarmentStandard(garmentType);
    
    switch (standard.anchor) {
      case 'center':
        return new THREE.Vector3(0, 0, 0);
      case 'bottom-center':
        return new THREE.Vector3(0, -bounds.height / 2, 0);
      case 'top-center':
        return new THREE.Vector3(0, bounds.height / 2, 0);
      default:
        return new THREE.Vector3(0, 0, 0);
    }
  }

  // Get device type based on viewport
  static getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width < this.MOBILE_BREAKPOINT) return 'mobile';
    if (width < this.TABLET_BREAKPOINT) return 'tablet';
    return 'desktop';
  }

  // Calculate optimal camera position for garment
  static calculateCameraPosition(garmentType: string, viewportSize: { width: number; height: number }): {
    position: THREE.Vector3;
    target: THREE.Vector3;
    fov: number;
    near: number;
    far: number;
    minDistance: number;
    maxDistance: number;
  } {
    const deviceType = this.getDeviceType();
    const bounds = this.getGarmentBounds(garmentType);
    const anchor = this.getAnchorPosition(garmentType, bounds);
    
    // Calculate distance based on garment size and device
    const maxDimension = Math.max(bounds.width, bounds.height);
    const baseCameraDistance = maxDimension * 0.8;
    const deviceMultiplier = this.CAMERA_DISTANCE[deviceType];
    const cameraDistance = baseCameraDistance * deviceMultiplier;
    
    // Calculate optimal camera position
    const position = new THREE.Vector3(0, anchor.y * 0.2, cameraDistance);
    const target = anchor.clone();
    
    // Device-specific camera settings
    const settings = {
      mobile: {
        fov: 50,
        near: 0.1,
        far: 1000,
        minDistance: cameraDistance * 0.6,
        maxDistance: cameraDistance * 3.0
      },
      tablet: {
        fov: 45,
        near: 0.1,
        far: 1000,
        minDistance: cameraDistance * 0.5,
        maxDistance: cameraDistance * 2.5
      },
      desktop: {
        fov: 40,
        near: 0.1,
        far: 1000,
        minDistance: cameraDistance * 0.4,
        maxDistance: cameraDistance * 2.0
      }
    };

    return {
      position,
      target,
      ...settings[deviceType]
    };
  }

  // Calculate responsive scale factors
  static getResponsiveScale(garmentType: string): {
    baseScale: number;
    mobileScale: number;
    tabletScale: number;
    desktopScale: number;
  } {
    const baseScale = this.getStandardizedScale(garmentType);
    
    return {
      baseScale,
      mobileScale: baseScale * 0.9,   // Slightly smaller on mobile
      tabletScale: baseScale * 0.95,  // Slightly smaller on tablet
      desktopScale: baseScale         // Full scale on desktop
    };
  }

  // Get current scale based on device
  static getCurrentScale(garmentType: string): number {
    const deviceType = this.getDeviceType();
    const scales = this.getResponsiveScale(garmentType);
    
    switch (deviceType) {
      case 'mobile': return scales.mobileScale;
      case 'tablet': return scales.tabletScale;
      case 'desktop': return scales.desktopScale;
      default: return scales.baseScale;
    }
  }
}

// Enhanced Bounding Box Utility Class
export class BoundingBoxManager {
  // Create visible bounding box for alignment assistance
  static createBoundingBox(bounds: GarmentBounds, color: string = '#00ff00'): THREE.LineSegments {
    const geometry = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(bounds.width, bounds.height, bounds.depth)
    );
    
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.6,
      linewidth: 2
    });
    
    return new THREE.LineSegments(geometry, material);
  }

  // Create enhanced snap-to-grid overlay
  static createSnapGrid(bounds: GarmentBounds, gridSize: number = 1): THREE.GridHelper {
    const size = Math.max(bounds.width, bounds.depth) * 1.5;
    const divisions = Math.floor(size / gridSize);
    
    const grid = new THREE.GridHelper(size, divisions, 0x888888, 0xcccccc);
    grid.material.transparent = true;
    grid.material.opacity = 0.3;
    grid.position.y = -bounds.height / 2; // Position at garment base
    
    return grid;
  }

  // Create enhanced measurement rulers with tick marks
  static createRulers(bounds: GarmentBounds): THREE.Group {
    const group = new THREE.Group();
    
    // Horizontal ruler with tick marks
    const hRulerGeometry = new THREE.BufferGeometry();
    const hRulerPoints: THREE.Vector3[] = [];
    
    // Main horizontal line
    hRulerPoints.push(new THREE.Vector3(-bounds.width / 2, -bounds.height / 2 - 1.5, 0));
    hRulerPoints.push(new THREE.Vector3(bounds.width / 2, -bounds.height / 2 - 1.5, 0));
    
    // Tick marks for width
    for (let x = -bounds.width / 2; x <= bounds.width / 2; x += 2) {
      hRulerPoints.push(new THREE.Vector3(x, -bounds.height / 2 - 1.5, 0));
      hRulerPoints.push(new THREE.Vector3(x, -bounds.height / 2 - 1, 0));
    }
    
    hRulerGeometry.setFromPoints(hRulerPoints);
    
    // Vertical ruler with tick marks
    const vRulerGeometry = new THREE.BufferGeometry();
    const vRulerPoints: THREE.Vector3[] = [];
    
    // Main vertical line
    vRulerPoints.push(new THREE.Vector3(-bounds.width / 2 - 1.5, -bounds.height / 2, 0));
    vRulerPoints.push(new THREE.Vector3(-bounds.width / 2 - 1.5, bounds.height / 2, 0));
    
    // Tick marks for height
    for (let y = -bounds.height / 2; y <= bounds.height / 2; y += 2) {
      vRulerPoints.push(new THREE.Vector3(-bounds.width / 2 - 1.5, y, 0));
      vRulerPoints.push(new THREE.Vector3(-bounds.width / 2 - 1, y, 0));
    }
    
    vRulerGeometry.setFromPoints(vRulerPoints);
    
    const rulerMaterial = new THREE.LineBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.8
    });
    
    group.add(new THREE.LineSegments(hRulerGeometry, rulerMaterial));
    group.add(new THREE.LineSegments(vRulerGeometry, rulerMaterial));
    
    return group;
  }

  // Snap position to grid
  static snapToGrid(position: THREE.Vector3, gridSize: number): THREE.Vector3 {
    return new THREE.Vector3(
      Math.round(position.x / gridSize) * gridSize,
      Math.round(position.y / gridSize) * gridSize,
      Math.round(position.z / gridSize) * gridSize
    );
  }

  // Check if point is within garment bounds
  static isWithinBounds(position: THREE.Vector3, bounds: GarmentBounds): boolean {
    return Math.abs(position.x) <= bounds.width / 2 &&
           Math.abs(position.y) <= bounds.height / 2 &&
           Math.abs(position.z) <= bounds.depth / 2;
  }

  // Clamp position to stay within bounds
  static clampToBounds(position: THREE.Vector3, bounds: GarmentBounds): THREE.Vector3 {
    return new THREE.Vector3(
      Math.max(-bounds.width / 2, Math.min(bounds.width / 2, position.x)),
      Math.max(-bounds.height / 2, Math.min(bounds.height / 2, position.y)),
      Math.max(-bounds.depth / 2, Math.min(bounds.depth / 2, position.z))
    );
  }

  // Create corner markers for precise positioning
  static createCornerMarkers(bounds: GarmentBounds): THREE.Group {
    const group = new THREE.Group();
    const markerSize = 0.5;
    const markerGeometry = new THREE.SphereGeometry(markerSize, 8, 8);
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.7
    });

    // Create markers at key positions
    const positions = [
      [-bounds.width / 2, -bounds.height / 2, 0], // Bottom left
      [bounds.width / 2, -bounds.height / 2, 0],  // Bottom right
      [-bounds.width / 2, bounds.height / 2, 0],  // Top left
      [bounds.width / 2, bounds.height / 2, 0],   // Top right
      [0, 0, 0]                                   // Center
    ];

    positions.forEach(pos => {
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(pos[0], pos[1], pos[2]);
      group.add(marker);
    });

    return group;
  }
}