import React, { useMemo, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ViewportManager } from '../../lib/studio/garmentScaling';

// Enhanced Level of Detail (LOD) System with Distance-Based Quality
export interface LODGeometry {
  high: THREE.BufferGeometry;
  medium: THREE.BufferGeometry;
  low: THREE.BufferGeometry;
  distances: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface LODConfig {
  enableLOD: boolean;
  autoQuality: boolean;
  maxTriangles: {
    high: number;
    medium: number;
    low: number;
  };
  distances: {
    high: number;
    medium: number;
    far: number;
  };
}

// Performance-optimized garment renderer with LOD
export const OptimizedGarmentRenderer: React.FC<{
  geometry: LODGeometry;
  material: THREE.Material;
  position?: [number, number, number];
  rotation?: [number, number, number];
  cameraPosition?: THREE.Vector3;
}> = ({ geometry, material, position = [0, 0, 0], rotation = [0, 0, 0], cameraPosition }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const lodRef = useRef<THREE.LOD>(null);
  
  // Create LOD system for smooth performance
  const lodObject = useMemo(() => {
    const lod = new THREE.LOD();
    
    // High detail for close viewing
    const highDetailMesh = new THREE.Mesh(geometry.high, material);
    lod.addLevel(highDetailMesh, 0);
    
    // Medium detail for mid-range viewing
    const mediumDetailMesh = new THREE.Mesh(geometry.medium, material);
    lod.addLevel(mediumDetailMesh, 5);
    
    // Low detail for distant viewing
    const lowDetailMesh = new THREE.Mesh(geometry.low, material);
    lod.addLevel(lowDetailMesh, 15);
    
    return lod;
  }, [geometry, material]);
  
  // Update LOD based on camera distance
  useFrame(({ camera }) => {
    if (lodRef.current) {
      lodRef.current.update(camera);
    }
  });
  
  return (
    <primitive 
      ref={lodRef}
      object={lodObject} 
      position={position}
      rotation={rotation}
    />
  );
};

// Enhanced Geometry Cache with Memory Management
export class GeometryCache {
  private static cache = new Map<string, THREE.BufferGeometry>();
  private static lodCache = new Map<string, LODGeometry>();
  private static materialCache = new Map<string, THREE.Material>();
  private static lastAccess = new Map<string, number>();
  private static readonly MAX_CACHE_SIZE = 50;
  private static readonly CACHE_TIMEOUT = 30000; // 30 seconds

  static getGeometry(key: string, generator: () => THREE.BufferGeometry): THREE.BufferGeometry {
    this.updateAccess(key);
    
    if (!this.cache.has(key)) {
      this.cleanupCache();
      this.cache.set(key, generator());
    }
    return this.cache.get(key)!;
  }
  
  static getLODGeometry(
    key: string, 
    garmentType: string,
    generators: {
      high: () => THREE.BufferGeometry;
      medium: () => THREE.BufferGeometry;
      low: () => THREE.BufferGeometry;
    }
  ): LODGeometry {
    this.updateAccess(key);
    
    if (!this.lodCache.has(key)) {
      this.cleanupCache();
      
      // Get optimized distances based on garment type and viewport
      const distances = this.calculateOptimalDistances(garmentType);
      
      this.lodCache.set(key, {
        high: generators.high(),
        medium: generators.medium(),
        low: generators.low(),
        distances
      });
    }
    return this.lodCache.get(key)!;
  }

  private static calculateOptimalDistances(garmentType: string) {
    const scale = ViewportManager.getCurrentScale(garmentType);
    const deviceType = ViewportManager.getDeviceType();
    
    // Adjust LOD distances based on garment scale and device
    const baseDistances = {
      high: 2,
      medium: 6,
      low: 15
    };

    const scaleFactor = 1 / scale;
    const deviceMultiplier = deviceType === 'mobile' ? 1.5 : 1;

    return {
      high: baseDistances.high * scaleFactor * deviceMultiplier,
      medium: baseDistances.medium * scaleFactor * deviceMultiplier,
      low: baseDistances.low * scaleFactor * deviceMultiplier
    };
  }

  private static updateAccess(key: string) {
    this.lastAccess.set(key, Date.now());
  }

  private static cleanupCache() {
    const now = Date.now();
    
    // Remove expired entries
    for (const [key, lastAccess] of this.lastAccess.entries()) {
      if (now - lastAccess > this.CACHE_TIMEOUT) {
        this.cache.delete(key);
        this.lodCache.delete(key);
        this.materialCache.delete(key);
        this.lastAccess.delete(key);
      }
    }

    // Limit cache size
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.lastAccess.entries())
        .sort(([, a], [, b]) => a - b);
      
      const toRemove = entries.slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.3));
      toRemove.forEach(([key]) => {
        this.cache.delete(key);
        this.lodCache.delete(key);
        this.materialCache.delete(key);
        this.lastAccess.delete(key);
      });
    }
  }
  
  static clearCache() {
    this.cache.clear();
    this.lodCache.clear();
    this.materialCache.clear();
    this.lastAccess.clear();
  }

  static getCacheStats() {
    return {
      geometries: this.cache.size,
      lodGeometries: this.lodCache.size,
      materials: this.materialCache.size,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private static estimateMemoryUsage(): number {
    let bytes = 0;
    for (const geometry of this.cache.values()) {
      bytes += this.estimateGeometrySize(geometry);
    }
    for (const lod of this.lodCache.values()) {
      bytes += this.estimateGeometrySize(lod.high);
      bytes += this.estimateGeometrySize(lod.medium);
      bytes += this.estimateGeometrySize(lod.low);
    }
    return bytes;
  }

  private static estimateGeometrySize(geometry: THREE.BufferGeometry): number {
    let size = 0;
    const attributes = geometry.attributes;
    for (const name in attributes) {
      const attribute = attributes[name];
      size += attribute.array.byteLength;
    }
    if (geometry.index) {
      size += geometry.index.array.byteLength;
    }
    return size;
  }
}

// Material optimization for batched rendering
export class MaterialOptimizer {
  private static materials = new Map<string, THREE.Material>();
  
  static getOptimizedMaterial(
    baseColor: string,
    garmentType: string,
    designTexture?: THREE.Texture
  ): THREE.Material {
    const key = `${baseColor}-${garmentType}-${designTexture?.uuid || 'none'}`;
    
    if (!this.materials.has(key)) {
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(baseColor),
        roughness: this.getRoughnessForGarment(garmentType),
        metalness: this.getMetalnessForGarment(garmentType),
        map: designTexture,
        side: THREE.DoubleSide,
        transparent: !!designTexture,
        alphaTest: designTexture ? 0.1 : 0
      });
      
      this.materials.set(key, material);
    }
    
    return this.materials.get(key)!;
  }
  
  private static getRoughnessForGarment(garmentType: string): number {
    const type = garmentType.toLowerCase();
    
    if (type.includes('denim')) return 0.9;
    if (type.includes('leather') || type.includes('bomber')) return 0.3;
    if (type.includes('performance') || type.includes('athletic')) return 0.4;
    if (type.includes('cotton') || type.includes('tee') || type.includes('shirt')) return 0.8;
    if (type.includes('fleece') || type.includes('hoodie')) return 0.95;
    
    return 0.8; // Default cotton-like
  }
  
  private static getMetalnessForGarment(garmentType: string): number {
    const type = garmentType.toLowerCase();
    
    if (type.includes('performance') || type.includes('athletic')) return 0.2;
    if (type.includes('bomber') || type.includes('jacket')) return 0.1;
    
    return 0.05; // Default fabric
  }
}

// Render batching for multiple garments
export const BatchedGarmentRenderer: React.FC<{
  garments: Array<{
    id: string;
    geometry: THREE.BufferGeometry;
    material: THREE.Material;
    position: [number, number, number];
    rotation: [number, number, number];
  }>;
}> = ({ garments }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Batch similar materials for better performance
  const batchedGarments = useMemo(() => {
    const batches = new Map<string, typeof garments>();
    
    garments.forEach(garment => {
      const materialKey = garment.material.uuid;
      if (!batches.has(materialKey)) {
        batches.set(materialKey, []);
      }
      batches.get(materialKey)!.push(garment);
    });
    
    return Array.from(batches.values());
  }, [garments]);
  
  return (
    <group ref={groupRef}>
      {batchedGarments.map((batch, batchIndex) => (
        <group key={batchIndex}>
          {batch.map((garment) => (
            <mesh
              key={garment.id}
              geometry={garment.geometry}
              material={garment.material}
              position={garment.position}
              rotation={garment.rotation}
              castShadow
              receiveShadow
            />
          ))}
        </group>
      ))}
    </group>
  );
};

// Performance monitoring and optimization hints
export const PerformanceMonitor: React.FC = () => {
  const statsRef = useRef<{ fps: number; drawCalls: number; triangles: number }>({
    fps: 60,
    drawCalls: 0,
    triangles: 0
  });
  
  useFrame(({ gl }) => {
    const info = gl.info;
    statsRef.current = {
      fps: Math.round(1000 / performance.now()),
      drawCalls: info.render.calls,
      triangles: info.render.triangles
    };
    
    // Auto-optimization based on performance
    if (statsRef.current.fps < 30) {
      console.warn('Performance degraded. Consider enabling LOD or reducing geometry complexity.');
    }
  });
  
  return null;
};