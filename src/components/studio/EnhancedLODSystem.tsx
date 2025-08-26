import React, { useMemo, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ViewportManager } from '../../lib/studio/garmentScaling';
import { GeometryCache, LODGeometry, LODConfig } from './GarmentOptimization';

// Enhanced LOD Renderer with Performance Monitoring
export const EnhancedLODRenderer: React.FC<{
  garmentType: string;
  geometry: LODGeometry;
  material: THREE.Material;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  config?: Partial<LODConfig>;
}> = ({ 
  garmentType, 
  geometry, 
  material, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  config = {}
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const lodRef = useRef<THREE.LOD>(null);
  const currentLevelRef = useRef<'high' | 'medium' | 'low'>('high');
  const lastFrameTime = useRef(performance.now());
  const frameRate = useRef(60);

  // Default LOD configuration
  const lodConfig: LODConfig = useMemo(() => ({
    enableLOD: true,
    autoQuality: true,
    maxTriangles: {
      high: 10000,
      medium: 5000,
      low: 2000
    },
    distances: {
      high: 3,
      medium: 8,
      far: 20
    },
    ...config
  }), [config]);

  // Create optimized LOD system
  const lodObject = useMemo(() => {
    if (!lodConfig.enableLOD) {
      return new THREE.Mesh(geometry.high, material);
    }

    const lod = new THREE.LOD();
    
    // High detail for close viewing
    const highDetailMesh = new THREE.Mesh(geometry.high, material);
    highDetailMesh.castShadow = true;
    highDetailMesh.receiveShadow = true;
    lod.addLevel(highDetailMesh, 0);
    
    // Medium detail for mid-range viewing
    const mediumDetailMesh = new THREE.Mesh(geometry.medium, material);
    mediumDetailMesh.castShadow = true;
    mediumDetailMesh.receiveShadow = true;
    lod.addLevel(mediumDetailMesh, geometry.distances.medium);
    
    // Low detail for distant viewing
    const lowDetailMesh = new THREE.Mesh(geometry.low, material);
    lowDetailMesh.castShadow = false; // Disable shadows for low detail
    lowDetailMesh.receiveShadow = true;
    lod.addLevel(lowDetailMesh, geometry.distances.low);
    
    return lod;
  }, [geometry, material, lodConfig.enableLOD]);

  // Performance monitoring
  const updatePerformanceMetrics = useCallback(() => {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTime.current;
    frameRate.current = 1000 / deltaTime;
    lastFrameTime.current = currentTime;

    // Auto-adjust quality based on performance
    if (lodConfig.autoQuality && frameRate.current < 30) {
      // Force lower quality if performance is poor
      if (lodRef.current) {
        const camera = new THREE.PerspectiveCamera();
        lodRef.current.update(camera);
      }
    }
  }, [lodConfig.autoQuality]);

  // Update LOD and monitor performance
  useFrame(({ camera }) => {
    if (lodRef.current && lodConfig.enableLOD) {
      lodRef.current.update(camera);
      
      // Determine current LOD level for debugging
      const distance = camera.position.distanceTo(lodRef.current.position);
      if (distance < geometry.distances.medium) {
        currentLevelRef.current = 'high';
      } else if (distance < geometry.distances.low) {
        currentLevelRef.current = 'medium';
      } else {
        currentLevelRef.current = 'low';
      }
    }

    updatePerformanceMetrics();
  });

  // Get current performance stats
  const getPerformanceStats = useCallback(() => ({
    frameRate: Math.round(frameRate.current),
    currentLOD: currentLevelRef.current,
    triangles: getCurrentTriangleCount()
  }), []);

  const getCurrentTriangleCount = useCallback(() => {
    if (!lodRef.current) return 0;
    
    const currentGeometry = getCurrentGeometry();
    if (!currentGeometry) return 0;
    
    return currentGeometry.index 
      ? currentGeometry.index.count / 3 
      : (currentGeometry.attributes.position?.count || 0) / 3;
  }, []);

  const getCurrentGeometry = useCallback(() => {
    switch (currentLevelRef.current) {
      case 'high': return geometry.high;
      case 'medium': return geometry.medium;
      case 'low': return geometry.low;
      default: return geometry.high;
    }
  }, [geometry]);

  if (lodConfig.enableLOD) {
    return (
      <primitive 
        ref={lodRef}
        object={lodObject} 
        position={position}
        rotation={rotation}
        scale={scale}
        userData={{ 
          garmentType, 
          getPerformanceStats,
          lodConfig 
        }}
      />
    );
  }

  return (
    <mesh
      ref={meshRef}
      geometry={geometry.high}
      material={material}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
      userData={{ 
        garmentType, 
        getPerformanceStats,
        lodConfig 
      }}
    />
  );
};

// Smart Geometry Generator with automatic LOD creation
export class SmartGeometryGenerator {
  static generateLODGeometry(
    garmentType: string,
    baseGenerator: () => THREE.BufferGeometry,
    config?: Partial<LODConfig>
  ): LODGeometry {
    const lodConfig: LODConfig = {
      enableLOD: true,
      autoQuality: true,
      maxTriangles: {
        high: 10000,
        medium: 5000,
        low: 2000
      },
      distances: {
        high: 3,
        medium: 8,
        far: 20
      },
      ...config
    };

    const cacheKey = `${garmentType}-lod-v2`;
    
    return GeometryCache.getLODGeometry(cacheKey, garmentType, {
      high: () => this.generateHighDetail(baseGenerator, lodConfig),
      medium: () => this.generateMediumDetail(baseGenerator, lodConfig),
      low: () => this.generateLowDetail(baseGenerator, lodConfig)
    });
  }

  private static generateHighDetail(
    baseGenerator: () => THREE.BufferGeometry,
    config: LODConfig
  ): THREE.BufferGeometry {
    const geometry = baseGenerator();
    return this.optimizeGeometry(geometry, config.maxTriangles.high);
  }

  private static generateMediumDetail(
    baseGenerator: () => THREE.BufferGeometry,
    config: LODConfig
  ): THREE.BufferGeometry {
    const geometry = baseGenerator();
    return this.simplifyGeometry(geometry, config.maxTriangles.medium);
  }

  private static generateLowDetail(
    baseGenerator: () => THREE.BufferGeometry,
    config: LODConfig
  ): THREE.BufferGeometry {
    const geometry = baseGenerator();
    return this.simplifyGeometry(geometry, config.maxTriangles.low);
  }

  private static optimizeGeometry(
    geometry: THREE.BufferGeometry, 
    maxTriangles: number
  ): THREE.BufferGeometry {
    // Optimize geometry for better performance
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    // If triangle count is already under limit, return as-is
    const triangleCount = geometry.index 
      ? geometry.index.count / 3 
      : geometry.attributes.position.count / 3;

    if (triangleCount <= maxTriangles) {
      return geometry;
    }

    return this.simplifyGeometry(geometry, maxTriangles);
  }

  private static simplifyGeometry(
    geometry: THREE.BufferGeometry, 
    targetTriangles: number
  ): THREE.BufferGeometry {
    // Safety check for valid geometry
    if (!geometry || !geometry.attributes.position) {
      console.warn('Invalid geometry provided to simplifyGeometry');
      return geometry.clone();
    }

    // Calculate triangle count safely
    const originalTriangles = geometry.index 
      ? Math.floor(geometry.index.count / 3)
      : Math.floor(geometry.attributes.position.count / 3);

    if (originalTriangles <= targetTriangles) {
      return geometry.clone();
    }

    const decimationRatio = Math.min(1, targetTriangles / originalTriangles);
    
    try {
      if (geometry.index && geometry.index.array) {
        // Indexed geometry decimation
        const indices = Array.from(geometry.index.array);
        const newIndices: number[] = [];
        
        for (let triangleIndex = 0; triangleIndex < indices.length; triangleIndex += 3) {
          if (Math.random() < decimationRatio) {
            const i1 = indices[triangleIndex];
            const i2 = indices[triangleIndex + 1];
            const i3 = indices[triangleIndex + 2];
            
            if (i1 !== undefined && i2 !== undefined && i3 !== undefined) {
              newIndices.push(i1, i2, i3);
            }
          }
        }
        
        const newGeometry = geometry.clone();
        newGeometry.setIndex(newIndices);
        newGeometry.computeVertexNormals();
        return newGeometry;
      } else {
        // Non-indexed geometry decimation
        const positions = Array.from(geometry.attributes.position.array);
        const newPositions: number[] = [];
        
        for (let vertexIndex = 0; vertexIndex < positions.length; vertexIndex += 9) {
          if (Math.random() < decimationRatio) {
            for (let component = 0; component < 9; component++) {
              const value = positions[vertexIndex + component];
              if (value !== undefined) {
                newPositions.push(value);
              }
            }
          }
        }
        
        const newGeometry = new THREE.BufferGeometry();
        newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        newGeometry.computeVertexNormals();
        return newGeometry;
      }
    } catch (error) {
      console.warn('Error in geometry simplification, returning original:', error);
      return geometry.clone();
    }
  }
}

// Performance Monitor Component
export const LODPerformanceMonitor: React.FC<{
  enabled?: boolean;
}> = ({ enabled = process.env.NODE_ENV === 'development' }) => {
  const statsRef = useRef({
    frameRate: 60,
    triangleCount: 0,
    activeLODs: new Map<string, string>()
  });

  useFrame(({ scene, gl }) => {
    if (!enabled) return;

    const renderInfo = gl.info.render;
    statsRef.current.frameRate = Math.round(1000 / performance.now());
    statsRef.current.triangleCount = renderInfo.triangles;

    // Collect LOD information from scene
    scene.traverse((object) => {
      if (object.userData?.garmentType && object.userData?.getPerformanceStats) {
        const stats = object.userData.getPerformanceStats();
        statsRef.current.activeLODs.set(object.userData.garmentType, stats.currentLOD);
      }
    });

    // Log performance warnings
    if (statsRef.current.frameRate < 30) {
      console.warn(`Low FPS detected: ${statsRef.current.frameRate}fps, Triangles: ${statsRef.current.triangleCount}`);
    }
  });

  if (!enabled) return null;

  return (
    <group userData={{ performanceMonitor: true }}>
      {/* This component doesn't render anything visible, just monitors performance */}
    </group>
  );
};