import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Level of Detail (LOD) System for Performance Optimization
export interface LODGeometry {
  high: THREE.BufferGeometry;
  medium: THREE.BufferGeometry;
  low: THREE.BufferGeometry;
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

// Geometry cache for instant garment switching
export class GeometryCache {
  private static cache = new Map<string, THREE.BufferGeometry>();
  private static lodCache = new Map<string, LODGeometry>();
  
  static getGeometry(key: string, generator: () => THREE.BufferGeometry): THREE.BufferGeometry {
    if (!this.cache.has(key)) {
      this.cache.set(key, generator());
    }
    return this.cache.get(key)!;
  }
  
  static getLODGeometry(key: string, generators: {
    high: () => THREE.BufferGeometry;
    medium: () => THREE.BufferGeometry;
    low: () => THREE.BufferGeometry;
  }): LODGeometry {
    if (!this.lodCache.has(key)) {
      this.lodCache.set(key, {
        high: generators.high(),
        medium: generators.medium(),
        low: generators.low()
      });
    }
    return this.lodCache.get(key)!;
  }
  
  static clearCache() {
    this.cache.clear();
    this.lodCache.clear();
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