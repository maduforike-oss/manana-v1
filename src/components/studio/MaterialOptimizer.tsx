import * as THREE from 'three';
import { ViewportManager } from '../../lib/studio/garmentScaling';

export interface MaterialConfig {
  baseColor: string;
  garmentType: string;
  fabricType: string;
  printMethod: string;
  designTexture?: THREE.Texture;
  environmentLighting?: boolean;
  highQuality?: boolean;
}

// Advanced Material Optimizer with Fabric Simulation
export class MaterialOptimizer {
  private static materials = new Map<string, THREE.Material>();
  private static textureCache = new Map<string, THREE.Texture>();
  private static readonly MAX_TEXTURE_SIZE = 1024;

  static getOptimizedMaterial(config: MaterialConfig): THREE.Material {
    const cacheKey = this.generateCacheKey(config);
    
    if (!this.materials.has(cacheKey)) {
      const material = this.createMaterial(config);
      this.materials.set(cacheKey, material);
    }
    
    return this.materials.get(cacheKey)!;
  }

  private static generateCacheKey(config: MaterialConfig): string {
    return [
      config.baseColor,
      config.garmentType,
      config.fabricType,
      config.printMethod,
      config.designTexture?.uuid || 'none',
      config.environmentLighting ? 'env' : 'basic',
      config.highQuality ? 'hq' : 'standard'
    ].join('-');
  }

  private static createMaterial(config: MaterialConfig): THREE.Material {
    const deviceType = ViewportManager.getDeviceType();
    const isHighQuality = config.highQuality && deviceType !== 'mobile';

    // Get fabric properties
    const fabricProps = this.getFabricProperties(config.fabricType);
    
    // Optimize texture if present
    const optimizedTexture = config.designTexture 
      ? this.optimizeTexture(config.designTexture, config.printMethod)
      : undefined;

    if (isHighQuality && config.environmentLighting) {
      return this.createPBRMaterial(config, fabricProps, optimizedTexture);
    } else {
      return this.createStandardMaterial(config, fabricProps, optimizedTexture);
    }
  }

  private static createPBRMaterial(
    config: MaterialConfig,
    fabricProps: FabricProperties,
    designTexture?: THREE.Texture
  ): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(config.baseColor),
      roughness: fabricProps.roughness,
      metalness: fabricProps.metalness,
      clearcoat: fabricProps.clearcoat,
      clearcoatRoughness: fabricProps.clearcoatRoughness,
      transmission: fabricProps.transmission,
      thickness: fabricProps.thickness,
      map: designTexture,
      normalMap: fabricProps.normalMap,
      roughnessMap: fabricProps.roughnessMap,
      side: THREE.DoubleSide,
      transparent: !!designTexture || fabricProps.transparent,
      alphaTest: designTexture ? 0.1 : 0,
      envMapIntensity: 0.8,
      // Advanced fabric simulation
      sheen: fabricProps.sheen,
      sheenColor: fabricProps.sheenColor,
      sheenRoughness: fabricProps.sheenRoughness
    });
  }

  private static createStandardMaterial(
    config: MaterialConfig,
    fabricProps: FabricProperties,
    designTexture?: THREE.Texture
  ): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.baseColor),
      roughness: fabricProps.roughness,
      metalness: fabricProps.metalness,
      map: designTexture,
      side: THREE.DoubleSide,
      transparent: !!designTexture,
      alphaTest: designTexture ? 0.1 : 0,
      flatShading: ViewportManager.getDeviceType() === 'mobile' // Flat shading on mobile for performance
    });
  }

  private static optimizeTexture(
    texture: THREE.Texture,
    printMethod: string
  ): THREE.Texture {
    const cacheKey = `${texture.uuid}-${printMethod}`;
    
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    const optimizedTexture = texture.clone();
    
    // Apply print method effects
    switch (printMethod) {
      case 'screen-print':
        optimizedTexture.magFilter = THREE.NearestFilter;
        optimizedTexture.minFilter = THREE.LinearMipmapNearestFilter;
        break;
      case 'dtg':
        optimizedTexture.magFilter = THREE.LinearFilter;
        optimizedTexture.minFilter = THREE.LinearMipmapLinearFilter;
        break;
      case 'vinyl':
        optimizedTexture.magFilter = THREE.NearestFilter;
        optimizedTexture.minFilter = THREE.NearestFilter;
        break;
      case 'embroidery':
        optimizedTexture.magFilter = THREE.LinearFilter;
        optimizedTexture.minFilter = THREE.LinearMipmapLinearFilter;
        // Add slight bump effect for embroidery
        break;
    }

    // Optimize for device performance
    const deviceType = ViewportManager.getDeviceType();
    if (deviceType === 'mobile') {
      // Reduce texture size on mobile
      optimizedTexture.repeat.set(0.8, 0.8);
      optimizedTexture.generateMipmaps = false;
    }

    // Set texture wrapping and filters for better performance
    optimizedTexture.wrapS = THREE.ClampToEdgeWrapping;
    optimizedTexture.wrapT = THREE.ClampToEdgeWrapping;
    optimizedTexture.flipY = false;

    this.textureCache.set(cacheKey, optimizedTexture);
    return optimizedTexture;
  }

  private static getFabricProperties(fabricType: string): FabricProperties {
    const baseProps: Record<string, FabricProperties> = {
      cotton: {
        roughness: 0.8,
        metalness: 0.05,
        clearcoat: 0,
        clearcoatRoughness: 1,
        transmission: 0,
        thickness: 0,
        transparent: false,
        normalMap: null,
        roughnessMap: null,
        sheen: 0.1,
        sheenColor: new THREE.Color(0.9, 0.9, 0.9),
        sheenRoughness: 0.8
      },
      polyester: {
        roughness: 0.4,
        metalness: 0.1,
        clearcoat: 0.2,
        clearcoatRoughness: 0.8,
        transmission: 0,
        thickness: 0,
        transparent: false,
        normalMap: null,
        roughnessMap: null,
        sheen: 0.3,
        sheenColor: new THREE.Color(0.95, 0.95, 0.95),
        sheenRoughness: 0.6
      },
      blend: {
        roughness: 0.6,
        metalness: 0.08,
        clearcoat: 0.1,
        clearcoatRoughness: 0.9,
        transmission: 0,
        thickness: 0,
        transparent: false,
        normalMap: null,
        roughnessMap: null,
        sheen: 0.2,
        sheenColor: new THREE.Color(0.92, 0.92, 0.92),
        sheenRoughness: 0.7
      },
      fleece: {
        roughness: 0.95,
        metalness: 0.02,
        clearcoat: 0,
        clearcoatRoughness: 1,
        transmission: 0,
        thickness: 0,
        transparent: false,
        normalMap: null,
        roughnessMap: null,
        sheen: 0.05,
        sheenColor: new THREE.Color(0.85, 0.85, 0.85),
        sheenRoughness: 0.95
      },
      denim: {
        roughness: 0.9,
        metalness: 0.1,
        clearcoat: 0,
        clearcoatRoughness: 1,
        transmission: 0,
        thickness: 0,
        transparent: false,
        normalMap: null,
        roughnessMap: null,
        sheen: 0,
        sheenColor: new THREE.Color(0.1, 0.1, 0.4),
        sheenRoughness: 1
      },
      performance: {
        roughness: 0.3,
        metalness: 0.15,
        clearcoat: 0.4,
        clearcoatRoughness: 0.6,
        transmission: 0,
        thickness: 0,
        transparent: false,
        normalMap: null,
        roughnessMap: null,
        sheen: 0.4,
        sheenColor: new THREE.Color(0.98, 0.98, 0.98),
        sheenRoughness: 0.4
      },
      leather: {
        roughness: 0.6,
        metalness: 0.05,
        clearcoat: 0.8,
        clearcoatRoughness: 0.3,
        transmission: 0,
        thickness: 0,
        transparent: false,
        normalMap: null,
        roughnessMap: null,
        sheen: 0.1,
        sheenColor: new THREE.Color(0.8, 0.7, 0.6),
        sheenRoughness: 0.7
      }
    };

    return baseProps[fabricType] || baseProps.cotton;
  }

  static clearCache() {
    this.materials.clear();
    this.textureCache.clear();
  }

  static getCacheStats() {
    return {
      materials: this.materials.size,
      textures: this.textureCache.size
    };
  }

  // Batch material creation for multiple garments
  static createMaterialBatch(configs: MaterialConfig[]): THREE.Material[] {
    return configs.map(config => this.getOptimizedMaterial(config));
  }

  // Material preloading for common combinations
  static preloadCommonMaterials() {
    const commonConfigs: MaterialConfig[] = [
      { baseColor: '#ffffff', garmentType: 't-shirt', fabricType: 'cotton', printMethod: 'dtg' },
      { baseColor: '#000000', garmentType: 't-shirt', fabricType: 'cotton', printMethod: 'dtg' },
      { baseColor: '#ffffff', garmentType: 'hoodie', fabricType: 'fleece', printMethod: 'dtg' },
      { baseColor: '#000000', garmentType: 'hoodie', fabricType: 'fleece', printMethod: 'dtg' },
      { baseColor: '#4169e1', garmentType: 'cap', fabricType: 'cotton', printMethod: 'embroidery' }
    ];

    // Pre-generate materials in a non-blocking way with fallback
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        commonConfigs.forEach(config => this.getOptimizedMaterial(config));
      });
    } else {
      // Fallback for browsers without requestIdleCallback (Safari, older browsers)
      setTimeout(() => {
        commonConfigs.forEach(config => this.getOptimizedMaterial(config));
      }, 16);
    }
  }
}

interface FabricProperties {
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  transmission: number;
  thickness: number;
  transparent: boolean;
  normalMap: THREE.Texture | null;
  roughnessMap: THREE.Texture | null;
  sheen: number;
  sheenColor: THREE.Color;
  sheenRoughness: number;
}

// Initialize common materials on load
MaterialOptimizer.preloadCommonMaterials();