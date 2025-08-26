import React from 'react';
import * as THREE from 'three';

// Create fabric material for different garment types
export const createFabricMaterial = (
  garmentType: string,
  baseColor: string,
  designTexture?: THREE.Texture,
  fabricType: string = 'cotton',
  printMethod: string = 'screen-print'
): THREE.Material => {
  const color = new THREE.Color(baseColor);
  
  // Material properties based on fabric type
  const fabricProperties = {
    cotton: { roughness: 0.8, metalness: 0.1 },
    polyester: { roughness: 0.6, metalness: 0.2 },
    blend: { roughness: 0.7, metalness: 0.15 },
    fleece: { roughness: 0.95, metalness: 0.05 },
    denim: { roughness: 0.9, metalness: 0.1 },
    performance: { roughness: 0.4, metalness: 0.3 }
  };
  
  const props = fabricProperties[fabricType as keyof typeof fabricProperties] || fabricProperties.cotton;
  
  return new THREE.MeshStandardMaterial({
    color,
    roughness: props.roughness,
    metalness: props.metalness,
    map: designTexture,
    side: THREE.DoubleSide,
    transparent: !!designTexture,
    alphaTest: designTexture ? 0.1 : 0
  });
};

// Create T-shirt geometry
export const createTShirtGeometry = (garmentType: string): THREE.BufferGeometry => {
  const shape = new THREE.Shape();
  
  // Basic t-shirt shape
  shape.moveTo(-6, -8);
  shape.quadraticCurveTo(-6.2, -4, -5.8, 0);
  shape.quadraticCurveTo(-5.5, 3, -4.5, 5.5);
  shape.quadraticCurveTo(-3.8, 6.8, -2.5, 7.2);
  shape.quadraticCurveTo(-1.2, 7.5, 0, 7.8);
  shape.quadraticCurveTo(1.2, 7.5, 2.5, 7.2);
  shape.quadraticCurveTo(3.8, 6.8, 4.5, 5.5);
  shape.quadraticCurveTo(5.5, 3, 5.8, 0);
  shape.quadraticCurveTo(6.2, -4, 6, -8);
  shape.lineTo(-6, -8);

  const extrudeSettings = {
    depth: 0.3,
    bevelEnabled: true,
    bevelSegments: 8,
    steps: 2,
    bevelSize: 0.05,
    bevelThickness: 0.02,
    curveSegments: 16
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

// Create cap geometry
export const createCapGeometry = (style: string): { crown: THREE.BufferGeometry; bill: THREE.BufferGeometry | null } => {
  const crown = new THREE.SphereGeometry(2.8, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
  
  const billShape = new THREE.Shape();
  billShape.moveTo(-2.5, 0);
  billShape.quadraticCurveTo(0, 2.8, 2.5, 0);
  billShape.quadraticCurveTo(0, 1.5, -2.5, 0);
  
  const bill = new THREE.ExtrudeGeometry(billShape, {
    depth: 0.1,
    bevelEnabled: true,
    bevelSegments: 8,
    bevelSize: 0.02,
    bevelThickness: 0.01
  });
  
  return { crown, bill };
};

// Create jacket geometry
export const createJacketGeometry = (jacketType: string): THREE.BufferGeometry => {
  const shape = new THREE.Shape();
  
  // Basic jacket shape
  shape.moveTo(-7, -8);
  shape.quadraticCurveTo(-7.3, -4, -6.8, 0);
  shape.quadraticCurveTo(-6.4, 4, -5.3, 6.5);
  shape.quadraticCurveTo(-4.2, 7.8, -2.8, 8);
  shape.quadraticCurveTo(-1.5, 8.2, 0, 8.5);
  shape.quadraticCurveTo(1.5, 8.2, 2.8, 8);
  shape.quadraticCurveTo(4.2, 7.8, 5.3, 6.5);
  shape.quadraticCurveTo(6.4, 4, 6.8, 0);
  shape.quadraticCurveTo(7.3, -4, 7, -8);
  shape.lineTo(-7, -8);

  const extrudeSettings = {
    depth: 0.4,
    bevelEnabled: true,
    bevelSegments: 12,
    steps: 3,
    bevelSize: 0.08,
    bevelThickness: 0.03,
    curveSegments: 20
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

// Design overlay component
export const DesignOverlay: React.FC<{
  designTexture: THREE.Texture;
  garmentType: string;
  position: [number, number, number];
  printMethod?: string;
}> = ({ designTexture, garmentType, position, printMethod = 'screen-print' }) => {
  const material = new THREE.MeshStandardMaterial({
    map: designTexture,
    transparent: true,
    alphaTest: 0.1,
    side: THREE.DoubleSide
  });

  return (
    <mesh position={position} material={material}>
      <planeGeometry args={[4, 4]} />
    </mesh>
  );
};