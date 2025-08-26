import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MeshStandardMaterial, DoubleSide } from 'three';

// Professional Fabric Material System
export const createFabricMaterial = (
  garmentType: string, 
  color: string, 
  designTexture?: THREE.Texture
) => {
  const material = new MeshStandardMaterial({
    color: color,
    side: DoubleSide,
  });

  // Fabric-specific material properties
  switch (garmentType) {
    case 'hoodie':
    case 'zip-hoodie':
    case 'pullover':
      // Fleece/Cotton blend properties
      material.roughness = 0.95;
      material.metalness = 0.0;
      material.normalScale = new THREE.Vector2(0.3, 0.3);
      break;
      
    case 'polo':
    case 'button-shirt':
      // Cotton pique/poplin properties
      material.roughness = 0.75;
      material.metalness = 0.05;
      material.normalScale = new THREE.Vector2(0.2, 0.2);
      break;
      
    case 'performance-shirt':
      // Athletic/synthetic blend
      material.roughness = 0.4;
      material.metalness = 0.15;
      // material.clearcoat = 0.1; // Available in Three.js r144+
      break;
      
    case 'denim-jacket':
      // Denim properties
      material.roughness = 0.85;
      material.metalness = 0.0;
      material.normalScale = new THREE.Vector2(0.5, 0.5);
      break;
      
    case 'bomber':
      // Nylon/polyester properties
      material.roughness = 0.3;
      material.metalness = 0.2;
      // material.clearcoat = 0.3; // Available in Three.js r144+
      break;
      
    default:
      // Standard cotton t-shirt
      material.roughness = 0.8;
      material.metalness = 0.02;
      material.normalScale = new THREE.Vector2(0.25, 0.25);
  }

  return material;
};

// Enhanced T-Shirt Geometry with Professional Proportions
export const createTShirtGeometry = (garmentType: string): THREE.ExtrudeGeometry => {
  const shape = new THREE.Shape();
  
  switch (garmentType) {
    case 'tank':
      // Tank top with narrow shoulder straps
      shape.moveTo(-0.9, -1.8);
      shape.lineTo(-0.9, 0.6);
      shape.lineTo(-1.0, 0.8);
      shape.lineTo(-1.0, 1.2);
      shape.lineTo(-0.5, 1.2);
      shape.lineTo(-0.5, 1.6);
      shape.lineTo(0.5, 1.6);
      shape.lineTo(0.5, 1.2);
      shape.lineTo(1.0, 1.2);
      shape.lineTo(1.0, 0.8);
      shape.lineTo(0.9, 0.6);
      shape.lineTo(0.9, -1.8);
      shape.lineTo(-0.9, -1.8);
      break;
      
    case 'hoodie':
    case 'zip-hoodie':
    case 'pullover':
      // Hoodie with hood extension and kangaroo pocket area
      shape.moveTo(-1.5, -1.9);
      shape.lineTo(-1.5, 0.4);
      shape.lineTo(-1.7, 0.7);
      shape.lineTo(-1.7, 1.3);
      shape.lineTo(-0.8, 1.3);
      shape.lineTo(-0.8, 1.9); // Hood extension
      shape.lineTo(0.8, 1.9);
      shape.lineTo(0.8, 1.3);
      shape.lineTo(1.7, 1.3);
      shape.lineTo(1.7, 0.7);
      shape.lineTo(1.5, 0.4);
      shape.lineTo(1.5, -1.9);
      shape.lineTo(-1.5, -1.9);
      break;
      
    case 'long-sleeve-tee':
      // Long sleeve with extended arm coverage
      shape.moveTo(-1.3, -1.7);
      shape.lineTo(-1.3, 0.6);
      shape.lineTo(-2.0, 0.9); // Extended sleeve
      shape.lineTo(-2.0, 1.4);
      shape.lineTo(-0.7, 1.4);
      shape.lineTo(-0.7, 1.6);
      shape.lineTo(0.7, 1.6);
      shape.lineTo(0.7, 1.4);
      shape.lineTo(2.0, 1.4);
      shape.lineTo(2.0, 0.9);
      shape.lineTo(1.3, 0.6);
      shape.lineTo(1.3, -1.7);
      shape.lineTo(-1.3, -1.7);
      break;
      
    case 'polo':
      // Polo with collar and button placket
      shape.moveTo(-1.25, -1.7);
      shape.lineTo(-1.25, 0.7);
      shape.lineTo(-1.6, 1.0);
      shape.lineTo(-1.6, 1.3);
      shape.lineTo(-0.7, 1.3);
      shape.lineTo(-0.7, 1.8); // Collar extension
      shape.lineTo(0.7, 1.8);
      shape.lineTo(0.7, 1.3);
      shape.lineTo(1.6, 1.3);
      shape.lineTo(1.6, 1.0);
      shape.lineTo(1.25, 0.7);
      shape.lineTo(1.25, -1.7);
      shape.lineTo(-1.25, -1.7);
      break;
      
    case 'button-shirt':
      // Dress shirt with formal proportions
      shape.moveTo(-1.4, -1.8);
      shape.lineTo(-1.4, 0.6);
      shape.lineTo(-1.8, 0.9);
      shape.lineTo(-1.8, 1.4);
      shape.lineTo(-0.6, 1.4);
      shape.lineTo(-0.6, 1.9); // Collar
      shape.lineTo(0.6, 1.9);
      shape.lineTo(0.6, 1.4);
      shape.lineTo(1.8, 1.4);
      shape.lineTo(1.8, 0.9);
      shape.lineTo(1.4, 0.6);
      shape.lineTo(1.4, -1.8);
      shape.lineTo(-1.4, -1.8);
      break;
      
    default:
      // Classic t-shirt silhouette
      shape.moveTo(-1.2, -1.7);
      shape.lineTo(-1.2, 0.7);
      shape.lineTo(-1.6, 1.0);
      shape.lineTo(-1.6, 1.3);
      shape.lineTo(-0.7, 1.3);
      shape.lineTo(-0.7, 1.6);
      shape.lineTo(0.7, 1.6);
      shape.lineTo(0.7, 1.3);
      shape.lineTo(1.6, 1.3);
      shape.lineTo(1.6, 1.0);
      shape.lineTo(1.2, 0.7);
      shape.lineTo(1.2, -1.7);
      shape.lineTo(-1.2, -1.7);
  }

  const extrudeSettings = {
    depth: 0.15,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 4,
    bevelSize: 0.04,
    bevelThickness: 0.03,
    curveSegments: 16,
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

// Professional Cap Geometry with Realistic Proportions
export const createCapGeometry = (capType: string): { crown: THREE.SphereGeometry; bill: THREE.CylinderGeometry } => {
  const crown = new THREE.SphereGeometry(0.85, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6);
  const bill = new THREE.CylinderGeometry(0.35, 0.45, 0.06, 16);
  
  // Adjust based on cap type
  switch (capType) {
    case 'snapback':
      crown.scale(1, 0.8, 1); // Flatter profile
      break;
    case 'trucker-hat':
      crown.scale(1.1, 0.9, 1.1); // Wider, mesh-style
      break;
    default:
      // Standard baseball cap
      break;
  }
  
  return { crown, bill };
};

// Enhanced Jacket Geometry
export const createJacketGeometry = (jacketType: string): THREE.ExtrudeGeometry => {
  const shape = new THREE.Shape();
  
  switch (jacketType) {
    case 'denim-jacket':
      // Denim jacket with collar and pockets
      shape.moveTo(-1.6, -1.5);
      shape.lineTo(-1.6, 0.5);
      shape.lineTo(-2.1, 0.8);
      shape.lineTo(-2.1, 1.5);
      shape.lineTo(-0.8, 1.5);
      shape.lineTo(-0.8, 2.0); // Collar
      shape.lineTo(0.8, 2.0);
      shape.lineTo(0.8, 1.5);
      shape.lineTo(2.1, 1.5);
      shape.lineTo(2.1, 0.8);
      shape.lineTo(1.6, 0.5);
      shape.lineTo(1.6, -1.5);
      shape.lineTo(-1.6, -1.5);
      break;
      
    case 'bomber':
      // Bomber jacket with ribbed cuffs (simplified)
      shape.moveTo(-1.4, -1.4);
      shape.lineTo(-1.4, 0.6);
      shape.lineTo(-1.9, 0.9);
      shape.lineTo(-1.9, 1.4);
      shape.lineTo(-0.6, 1.4);
      shape.lineTo(-0.6, 1.7);
      shape.lineTo(0.6, 1.7);
      shape.lineTo(0.6, 1.4);
      shape.lineTo(1.9, 1.4);
      shape.lineTo(1.9, 0.9);
      shape.lineTo(1.4, 0.6);
      shape.lineTo(1.4, -1.4);
      shape.lineTo(-1.4, -1.4);
      break;
      
    default:
      return createTShirtGeometry('t-shirt');
  }
  
  const extrudeSettings = {
    depth: 0.18,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 5,
    bevelSize: 0.05,
    bevelThickness: 0.04,
    curveSegments: 20,
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

// Realistic Design Overlay Component
export const DesignOverlay = ({ 
  designTexture, 
  garmentType, 
  position = [0, 0, 0.065],
  scale = 1 
}: {
  designTexture: THREE.Texture;
  garmentType: string;
  position?: [number, number, number];
  scale?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Calculate proper design dimensions based on garment type
  const getDesignDimensions = (): [number, number] => {
    const baseSize = 1.4 * scale;
    
    switch (garmentType) {
      case 'tank':
        return [baseSize * 0.8, baseSize * 0.8];
      case 'hoodie':
      case 'zip-hoodie':
      case 'pullover':
        return [baseSize * 1.2, baseSize * 1.2];
      case 'long-sleeve-tee':
        return [baseSize * 1.1, baseSize * 1.1];
      case 'polo':
      case 'button-shirt':
        return [baseSize * 1.0, baseSize * 1.0];
      case 'cap':
      case 'snapback':
      case 'trucker-hat':
        return [baseSize * 0.5, baseSize * 0.3];
      case 'beanie':
        return [baseSize * 0.6, baseSize * 0.4];
      default:
        return [baseSize, baseSize];
    }
  };

  // Enhanced design material with fabric interaction
  const designMaterial = useMemo(() => {
    const material = new MeshStandardMaterial({
      map: designTexture,
      transparent: true,
      alphaTest: 0.1,
      roughness: 0.7,
      metalness: 0.0,
    });
    
    // Blend design with fabric lighting
    material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <output_fragment>',
        `
        #include <output_fragment>
        // Enhance design integration with fabric
        gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * 1.1, 0.2);
        `
      );
    };
    
    return material;
  }, [designTexture]);

  // Subtle animation for realism
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.z = position[2] + Math.sin(state.clock.elapsedTime * 0.5) * 0.002;
    }
  });

  const [width, height] = getDesignDimensions();

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[width, height]} />
      <primitive object={designMaterial} />
    </mesh>
  );
};