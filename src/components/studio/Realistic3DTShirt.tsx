import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useStudioStore } from '@/lib/studio/store';
import { TSHIRT_COLORS } from './Enhanced2DMockup';

// Create realistic T-shirt geometry with proper holes
const createRealistic3DTShirtGeometry = (): THREE.BufferGeometry => {
  const group = new THREE.Group();
  
  // Main body shape
  const bodyShape = new THREE.Shape();
  
  // T-shirt outline with realistic proportions
  bodyShape.moveTo(-3, -4); // Bottom left
  bodyShape.lineTo(-3, 1); // Left side up
  bodyShape.quadraticCurveTo(-3, 2.5, -2, 3); // Left armpit curve
  bodyShape.lineTo(-1.5, 3.2); // Left shoulder
  bodyShape.quadraticCurveTo(-0.8, 3.4, 0, 3.5); // Neck curve left
  bodyShape.quadraticCurveTo(0.8, 3.4, 1.5, 3.2); // Neck curve right
  bodyShape.lineTo(2, 3); // Right shoulder
  bodyShape.quadraticCurveTo(3, 2.5, 3, 1); // Right armpit curve
  bodyShape.lineTo(3, -4); // Right side down
  bodyShape.lineTo(-3, -4); // Bottom

  // Neck hole
  const neckHole = new THREE.Path();
  neckHole.moveTo(-0.8, 3.4);
  neckHole.quadraticCurveTo(0, 2.8, 0.8, 3.4);
  neckHole.quadraticCurveTo(0, 3.6, -0.8, 3.4);
  bodyShape.holes.push(neckHole);

  // Left arm hole
  const leftArmHole = new THREE.Path();
  leftArmHole.moveTo(-3, 1);
  leftArmHole.quadraticCurveTo(-3.5, 2, -3, 3);
  leftArmHole.quadraticCurveTo(-2.5, 2, -3, 1);
  bodyShape.holes.push(leftArmHole);

  // Right arm hole
  const rightArmHole = new THREE.Path();
  rightArmHole.moveTo(3, 1);
  rightArmHole.quadraticCurveTo(3.5, 2, 3, 3);
  rightArmHole.quadraticCurveTo(2.5, 2, 3, 1);
  bodyShape.holes.push(rightArmHole);

  const extrudeSettings = {
    depth: 0.1,
    bevelEnabled: true,
    bevelSegments: 8,
    steps: 2,
    bevelSize: 0.02,
    bevelThickness: 0.01,
    curveSegments: 16
  };

  return new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
};

// Create fabric material with realistic properties
const createFabricMaterial = (color: string, designTexture?: THREE.Texture): THREE.Material => {
  const colorObj = new THREE.Color(color);
  
  return new THREE.MeshStandardMaterial({
    color: colorObj,
    roughness: 0.8, // Cotton-like roughness
    metalness: 0.1,
    map: designTexture,
    side: THREE.DoubleSide,
    transparent: !!designTexture,
    alphaTest: designTexture ? 0.1 : 0,
    normalScale: new THREE.Vector2(0.1, 0.1), // Subtle fabric texture
  });
};

interface Realistic3DTShirtProps {
  designTexture?: THREE.Texture;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export const Realistic3DTShirt: React.FC<Realistic3DTShirtProps> = ({
  designTexture,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1]
}) => {
  const { doc } = useStudioStore();
  
  const geometry = useMemo(() => createRealistic3DTShirtGeometry(), []);
  
  const material = useMemo(() => {
    const currentColor = TSHIRT_COLORS.find(color => color.id === doc.canvas.garmentColor) || TSHIRT_COLORS[0];
    return createFabricMaterial(currentColor.hex, designTexture);
  }, [doc.canvas.garmentColor, designTexture]);

  return (
    <mesh 
      geometry={geometry} 
      material={material}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    />
  );
};

export { createRealistic3DTShirtGeometry, createFabricMaterial };