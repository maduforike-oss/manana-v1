import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ViewportManager } from '../../lib/studio/garmentScaling';
import { GeometryCache } from './GarmentOptimization';

interface SimpleLODGeometry {
  high: THREE.BufferGeometry;
  medium: THREE.BufferGeometry;
  low: THREE.BufferGeometry;
  distances: {
    high: number;
    medium: number;
    low: number;
  };
}

// Simplified LOD Renderer without complex optimization
export const SimpleLODRenderer: React.FC<{
  garmentType: string;
  geometry: SimpleLODGeometry;
  material: THREE.Material;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}> = ({ 
  garmentType, 
  geometry, 
  material, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scale = [1, 1, 1]
}) => {
  const lodRef = useRef<THREE.LOD>(null);

  // Create simple LOD system
  const lodObject = useMemo(() => {
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
    lowDetailMesh.castShadow = false;
    lowDetailMesh.receiveShadow = true;
    lod.addLevel(lowDetailMesh, geometry.distances.low);
    
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
      scale={scale}
      userData={{ garmentType }}
    />
  );
};

// Simple Geometry Generator without complex simplification
export class SimpleGeometryGenerator {
  static generateSimpleLODGeometry(
    garmentType: string,
    baseGenerator: () => THREE.BufferGeometry
  ): SimpleLODGeometry {
    const cacheKey = `${garmentType}-simple-lod`;
    const deviceType = ViewportManager.getDeviceType();
    
    // Get optimized distances based on garment type and viewport
    const distances = this.calculateDistances(garmentType);
    
    const baseGeometry = baseGenerator();
    
    return {
      high: baseGeometry.clone(),
      medium: this.createReducedGeometry(baseGeometry, deviceType === 'mobile' ? 0.7 : 0.8),
      low: this.createReducedGeometry(baseGeometry, deviceType === 'mobile' ? 0.4 : 0.5),
      distances
    };
  }

  private static calculateDistances(garmentType: string) {
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

  private static createReducedGeometry(
    geometry: THREE.BufferGeometry, 
    scaleFactor: number
  ): THREE.BufferGeometry {
    // Simple geometry reduction by scaling detail
    const reduced = geometry.clone();
    
    // Apply scale to reduce visual complexity without modifying topology
    reduced.scale(scaleFactor, scaleFactor, scaleFactor);
    
    // Recompute normals
    reduced.computeVertexNormals();
    reduced.computeBoundingBox();
    reduced.computeBoundingSphere();
    
    return reduced;
  }
}

// Simple Performance Monitor
export const SimplePerformanceMonitor: React.FC = () => {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useFrame(({ gl }) => {
    frameCount.current++;
    const currentTime = performance.now();
    
    // Log performance every 60 frames (roughly once per second at 60fps)
    if (frameCount.current % 60 === 0) {
      const deltaTime = currentTime - lastTime.current;
      const fps = Math.round(60000 / deltaTime);
      
      if (fps < 30) {
        console.warn(`Performance warning: ${fps}fps, Triangles: ${gl.info.render.triangles}`);
      }
      
      lastTime.current = currentTime;
    }
  });

  return null;
};