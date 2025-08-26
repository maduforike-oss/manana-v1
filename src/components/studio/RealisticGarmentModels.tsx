import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStudioStore } from '../../lib/studio/store';

interface RealisticGarmentModelProps {
  garmentType: string;
  garmentColor: string;
  designTexture?: THREE.Texture;
}

// Professional T-Shirt Geometry with realistic proportions
const createTShirtGeometry = (size: string = 'M'): THREE.BufferGeometry => {
  const sizeMultipliers = {
    'XS': 0.85, 'S': 0.92, 'M': 1.0, 'L': 1.08, 'XL': 1.16, 'XXL': 1.24
  };
  const multiplier = sizeMultipliers[size as keyof typeof sizeMultipliers] || 1.0;

  // Create realistic t-shirt shape with proper torso proportions
  const shape = new THREE.Shape();
  
  // Start at bottom left
  shape.moveTo(-6 * multiplier, -8);
  
  // Left side seam with slight curve
  shape.quadraticCurveTo(-6.2 * multiplier, -4, -5.8 * multiplier, 0);
  shape.quadraticCurveTo(-5.5 * multiplier, 3, -4.5 * multiplier, 5.5);
  
  // Left shoulder slope
  shape.quadraticCurveTo(-3.8 * multiplier, 6.8, -2.5 * multiplier, 7.2);
  
  // Neckline curve
  shape.quadraticCurveTo(-1.2 * multiplier, 7.5, 0, 7.8);
  shape.quadraticCurveTo(1.2 * multiplier, 7.5, 2.5 * multiplier, 7.2);
  
  // Right shoulder
  shape.quadraticCurveTo(3.8 * multiplier, 6.8, 4.5 * multiplier, 5.5);
  shape.quadraticCurveTo(5.5 * multiplier, 3, 5.8 * multiplier, 0);
  shape.quadraticCurveTo(6.2 * multiplier, -4, 6 * multiplier, -8);
  
  // Bottom hem
  shape.lineTo(-6 * multiplier, -8);

  // Add sleeve holes
  const leftSleeveHole = new THREE.Path();
  leftSleeveHole.moveTo(-4.5 * multiplier, 5.5);
  leftSleeveHole.quadraticCurveTo(-7 * multiplier, 4, -7.5 * multiplier, 1);
  leftSleeveHole.quadraticCurveTo(-7 * multiplier, -1, -5.5 * multiplier, 0);
  leftSleeveHole.quadraticCurveTo(-4.8 * multiplier, 2, -4.5 * multiplier, 5.5);
  shape.holes.push(leftSleeveHole);

  const rightSleeveHole = new THREE.Path();
  rightSleeveHole.moveTo(4.5 * multiplier, 5.5);
  rightSleeveHole.quadraticCurveTo(7 * multiplier, 4, 7.5 * multiplier, 1);
  rightSleeveHole.quadraticCurveTo(7 * multiplier, -1, 5.5 * multiplier, 0);
  rightSleeveHole.quadraticCurveTo(4.8 * multiplier, 2, 4.5 * multiplier, 5.5);
  shape.holes.push(rightSleeveHole);

  const extrudeSettings = {
    depth: 0.3 * multiplier,
    bevelEnabled: true,
    bevelSegments: 8,
    steps: 2,
    bevelSize: 0.05,
    bevelThickness: 0.02,
    curveSegments: 16
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

// Professional Hoodie Geometry with kangaroo pocket and hood
const createHoodieGeometry = (size: string = 'M'): THREE.BufferGeometry => {
  const sizeMultipliers = {
    'XS': 0.85, 'S': 0.92, 'M': 1.0, 'L': 1.08, 'XL': 1.16, 'XXL': 1.24
  };
  const multiplier = sizeMultipliers[size as keyof typeof sizeMultipliers] || 1.0;

  // Oversized hoodie proportions
  const shape = new THREE.Shape();
  
  // Start at bottom with wider hem
  shape.moveTo(-7.5 * multiplier, -9);
  
  // Relaxed fit sides
  shape.quadraticCurveTo(-7.8 * multiplier, -4, -7.2 * multiplier, 0);
  shape.quadraticCurveTo(-6.8 * multiplier, 4, -5.5 * multiplier, 6.5);
  
  // Shoulder line with drop shoulder
  shape.quadraticCurveTo(-4.2 * multiplier, 7.8, -2.8 * multiplier, 8);
  
  // Hood attachment neckline
  shape.quadraticCurveTo(-1.5 * multiplier, 8.2, 0, 8.5);
  shape.quadraticCurveTo(1.5 * multiplier, 8.2, 2.8 * multiplier, 8);
  
  // Right shoulder
  shape.quadraticCurveTo(4.2 * multiplier, 7.8, 5.5 * multiplier, 6.5);
  shape.quadraticCurveTo(6.8 * multiplier, 4, 7.2 * multiplier, 0);
  shape.quadraticCurveTo(7.8 * multiplier, -4, 7.5 * multiplier, -9);
  
  // Bottom hem
  shape.lineTo(-7.5 * multiplier, -9);

  // Sleeve holes for drop shoulder design
  const leftSleeveHole = new THREE.Path();
  leftSleeveHole.moveTo(-5.5 * multiplier, 6.5);
  leftSleeveHole.quadraticCurveTo(-8.5 * multiplier, 5, -9 * multiplier, 1.5);
  leftSleeveHole.quadraticCurveTo(-8.5 * multiplier, -1.5, -6.5 * multiplier, 0);
  leftSleeveHole.quadraticCurveTo(-5.8 * multiplier, 3, -5.5 * multiplier, 6.5);
  shape.holes.push(leftSleeveHole);

  const rightSleeveHole = new THREE.Path();
  rightSleeveHole.moveTo(5.5 * multiplier, 6.5);
  rightSleeveHole.quadraticCurveTo(8.5 * multiplier, 5, 9 * multiplier, 1.5);
  rightSleeveHole.quadraticCurveTo(8.5 * multiplier, -1.5, 6.5 * multiplier, 0);
  rightSleeveHole.quadraticCurveTo(5.8 * multiplier, 3, 5.5 * multiplier, 6.5);
  shape.holes.push(rightSleeveHole);

  const extrudeSettings = {
    depth: 0.4 * multiplier, // Thicker for fleece
    bevelEnabled: true,
    bevelSegments: 12,
    steps: 3,
    bevelSize: 0.08,
    bevelThickness: 0.03,
    curveSegments: 20
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

// Professional Long Sleeve Geometry
const createLongSleeveGeometry = (size: string = 'M'): THREE.BufferGeometry => {
  const sizeMultipliers = {
    'XS': 0.85, 'S': 0.92, 'M': 1.0, 'L': 1.08, 'XL': 1.16, 'XXL': 1.24
  };
  const multiplier = sizeMultipliers[size as keyof typeof sizeMultipliers] || 1.0;

  // Similar to t-shirt but with extended sleeves
  const shape = new THREE.Shape();
  
  shape.moveTo(-6.2 * multiplier, -8);
  shape.quadraticCurveTo(-6.4 * multiplier, -4, -6 * multiplier, 0);
  shape.quadraticCurveTo(-5.7 * multiplier, 3, -4.7 * multiplier, 5.5);
  shape.quadraticCurveTo(-4 * multiplier, 6.8, -2.7 * multiplier, 7.2);
  shape.quadraticCurveTo(-1.3 * multiplier, 7.5, 0, 7.8);
  shape.quadraticCurveTo(1.3 * multiplier, 7.5, 2.7 * multiplier, 7.2);
  shape.quadraticCurveTo(4 * multiplier, 6.8, 4.7 * multiplier, 5.5);
  shape.quadraticCurveTo(5.7 * multiplier, 3, 6 * multiplier, 0);
  shape.quadraticCurveTo(6.4 * multiplier, -4, 6.2 * multiplier, -8);
  shape.lineTo(-6.2 * multiplier, -8);

  // Extended sleeve holes
  const leftSleeveHole = new THREE.Path();
  leftSleeveHole.moveTo(-4.7 * multiplier, 5.5);
  leftSleeveHole.quadraticCurveTo(-8 * multiplier, 4.5, -9.5 * multiplier, 1.5);
  leftSleeveHole.quadraticCurveTo(-9 * multiplier, -1.5, -6 * multiplier, 0);
  leftSleeveHole.quadraticCurveTo(-5 * multiplier, 2.5, -4.7 * multiplier, 5.5);
  shape.holes.push(leftSleeveHole);

  const rightSleeveHole = new THREE.Path();
  rightSleeveHole.moveTo(4.7 * multiplier, 5.5);
  rightSleeveHole.quadraticCurveTo(8 * multiplier, 4.5, 9.5 * multiplier, 1.5);
  rightSleeveHole.quadraticCurveTo(9 * multiplier, -1.5, 6 * multiplier, 0);
  rightSleeveHole.quadraticCurveTo(5 * multiplier, 2.5, 4.7 * multiplier, 5.5);
  shape.holes.push(rightSleeveHole);

  const extrudeSettings = {
    depth: 0.25 * multiplier,
    bevelEnabled: true,
    bevelSegments: 8,
    steps: 2,
    bevelSize: 0.04,
    bevelThickness: 0.02,
    curveSegments: 16
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

// Professional Polo Geometry with collar and placket
const createPoloGeometry = (size: string = 'M'): THREE.BufferGeometry => {
  const sizeMultipliers = {
    'XS': 0.85, 'S': 0.92, 'M': 1.0, 'L': 1.08, 'XL': 1.16, 'XXL': 1.24
  };
  const multiplier = sizeMultipliers[size as keyof typeof sizeMultipliers] || 1.0;

  const shape = new THREE.Shape();
  
  // Polo shirt with collar opening
  shape.moveTo(-5.8 * multiplier, -8);
  shape.quadraticCurveTo(-6 * multiplier, -4, -5.6 * multiplier, 0);
  shape.quadraticCurveTo(-5.3 * multiplier, 3, -4.3 * multiplier, 5.5);
  shape.quadraticCurveTo(-3.6 * multiplier, 6.8, -2.3 * multiplier, 7.2);
  
  // Collar neckline (wider than crew neck)
  shape.quadraticCurveTo(-1 * multiplier, 7.3, 0, 7.5);
  shape.quadraticCurveTo(1 * multiplier, 7.3, 2.3 * multiplier, 7.2);
  
  shape.quadraticCurveTo(3.6 * multiplier, 6.8, 4.3 * multiplier, 5.5);
  shape.quadraticCurveTo(5.3 * multiplier, 3, 5.6 * multiplier, 0);
  shape.quadraticCurveTo(6 * multiplier, -4, 5.8 * multiplier, -8);
  shape.lineTo(-5.8 * multiplier, -8);

  // Sleeve holes
  const leftSleeveHole = new THREE.Path();
  leftSleeveHole.moveTo(-4.3 * multiplier, 5.5);
  leftSleeveHole.quadraticCurveTo(-6.8 * multiplier, 4, -7.3 * multiplier, 1);
  leftSleeveHole.quadraticCurveTo(-6.8 * multiplier, -1, -5.3 * multiplier, 0);
  leftSleeveHole.quadraticCurveTo(-4.6 * multiplier, 2, -4.3 * multiplier, 5.5);
  shape.holes.push(leftSleeveHole);

  const rightSleeveHole = new THREE.Path();
  rightSleeveHole.moveTo(4.3 * multiplier, 5.5);
  rightSleeveHole.quadraticCurveTo(6.8 * multiplier, 4, 7.3 * multiplier, 1);
  rightSleeveHole.quadraticCurveTo(6.8 * multiplier, -1, 5.3 * multiplier, 0);
  rightSleeveHole.quadraticCurveTo(4.6 * multiplier, 2, 4.3 * multiplier, 5.5);
  shape.holes.push(rightSleeveHole);

  const extrudeSettings = {
    depth: 0.28 * multiplier,
    bevelEnabled: true,
    bevelSegments: 10,
    steps: 2,
    bevelSize: 0.05,
    bevelThickness: 0.02,
    curveSegments: 18
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

// Professional Tank Top Geometry
const createTankGeometry = (size: string = 'M'): THREE.BufferGeometry => {
  const sizeMultipliers = {
    'XS': 0.85, 'S': 0.92, 'M': 1.0, 'L': 1.08, 'XL': 1.16, 'XXL': 1.24
  };
  const multiplier = sizeMultipliers[size as keyof typeof sizeMultipliers] || 1.0;

  const shape = new THREE.Shape();
  
  // Tank top with narrow straps
  shape.moveTo(-5.5 * multiplier, -8);
  shape.quadraticCurveTo(-5.7 * multiplier, -4, -5.3 * multiplier, 0);
  shape.quadraticCurveTo(-5 * multiplier, 3, -4 * multiplier, 5.5);
  
  // Narrow shoulder straps
  shape.quadraticCurveTo(-2.5 * multiplier, 6.8, -1.5 * multiplier, 7);
  shape.quadraticCurveTo(-0.8 * multiplier, 7.2, 0, 7.3);
  shape.quadraticCurveTo(0.8 * multiplier, 7.2, 1.5 * multiplier, 7);
  shape.quadraticCurveTo(2.5 * multiplier, 6.8, 4 * multiplier, 5.5);
  
  shape.quadraticCurveTo(5 * multiplier, 3, 5.3 * multiplier, 0);
  shape.quadraticCurveTo(5.7 * multiplier, -4, 5.5 * multiplier, -8);
  shape.lineTo(-5.5 * multiplier, -8);

  // Large armholes
  const leftArmHole = new THREE.Path();
  leftArmHole.moveTo(-4 * multiplier, 5.5);
  leftArmHole.quadraticCurveTo(-5.5 * multiplier, 4, -6 * multiplier, 1.5);
  leftArmHole.quadraticCurveTo(-5.5 * multiplier, -0.5, -4.5 * multiplier, 0.5);
  leftArmHole.quadraticCurveTo(-4.2 * multiplier, 2.5, -4 * multiplier, 5.5);
  shape.holes.push(leftArmHole);

  const rightArmHole = new THREE.Path();
  rightArmHole.moveTo(4 * multiplier, 5.5);
  rightArmHole.quadraticCurveTo(5.5 * multiplier, 4, 6 * multiplier, 1.5);
  rightArmHole.quadraticCurveTo(5.5 * multiplier, -0.5, 4.5 * multiplier, 0.5);
  rightArmHole.quadraticCurveTo(4.2 * multiplier, 2.5, 4 * multiplier, 5.5);
  shape.holes.push(rightArmHole);

  const extrudeSettings = {
    depth: 0.2 * multiplier, // Thinner material
    bevelEnabled: true,
    bevelSegments: 6,
    steps: 1,
    bevelSize: 0.03,
    bevelThickness: 0.01,
    curveSegments: 14
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

// Enhanced Cap Geometry with proper structure
const createCapGeometry = (style: string = 'snapback'): THREE.Group => {
  const group = new THREE.Group();
  
  // Crown geometry
  const crownGeometry = new THREE.SphereGeometry(2.8, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
  
  // Bill geometry with proper curve
  const billShape = new THREE.Shape();
  billShape.moveTo(-2.5, 0);
  billShape.quadraticCurveTo(0, 2.8, 2.5, 0);
  billShape.quadraticCurveTo(0, 1.5, -2.5, 0);
  
  const billGeometry = new THREE.ExtrudeGeometry(billShape, {
    depth: 0.1,
    bevelEnabled: true,
    bevelSegments: 8,
    bevelSize: 0.02,
    bevelThickness: 0.01
  });
  
  // Position bill
  billGeometry.translate(0, -0.8, 2.2);
  billGeometry.rotateX(-Math.PI * 0.1);
  
  // Add panel lines for structured caps
  if (style === 'snapback' || style === 'fitted') {
    const panelGeometry = new THREE.CylinderGeometry(2.85, 2.85, 0.02, 6, 1, true);
    group.add(new THREE.Mesh(panelGeometry, new THREE.MeshStandardMaterial({ 
      color: 0x333333, 
      transparent: true, 
      opacity: 0.1 
    })));
  }
  
  group.add(new THREE.Mesh(crownGeometry));
  group.add(new THREE.Mesh(billGeometry));
  
  return group;
};

// Enhanced Tote Bag Geometry
const createToteGeometry = (): THREE.Group => {
  const group = new THREE.Group();
  
  // Main bag body with gusset
  const bodyGeometry = new THREE.BoxGeometry(6, 8, 2);
  const body = new THREE.Mesh(bodyGeometry);
  
  // Handle geometry
  const handleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
  const leftHandle = new THREE.Mesh(handleGeometry);
  leftHandle.position.set(-1.5, 5, 0);
  leftHandle.rotateZ(Math.PI / 2);
  
  const rightHandle = new THREE.Mesh(handleGeometry);
  rightHandle.position.set(1.5, 5, 0);
  rightHandle.rotateZ(Math.PI / 2);
  
  // Reinforcement stitching
  const stitchingGeometry = new THREE.TorusGeometry(0.05, 0.02, 4, 8);
  const leftStitching = new THREE.Mesh(stitchingGeometry, new THREE.MeshStandardMaterial({ color: 0x444444 }));
  leftStitching.position.set(-1.5, 4, 1.1);
  
  const rightStitching = new THREE.Mesh(stitchingGeometry, new THREE.MeshStandardMaterial({ color: 0x444444 }));
  rightStitching.position.set(1.5, 4, 1.1);
  
  group.add(body);
  group.add(leftHandle);
  group.add(rightHandle);
  group.add(leftStitching);
  group.add(rightStitching);
  
  return group;
};

export const RealisticGarmentModel: React.FC<RealisticGarmentModelProps> = ({
  garmentType,
  garmentColor,
  designTexture
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { doc } = useStudioStore();
  
  // Create geometry based on garment type
  const geometry = useMemo(() => {
    const normalizedType = garmentType.toLowerCase().replace(/[^a-z]/g, '');
    
    switch (normalizedType) {
      case 'tshirt':
      case 'tee':
        return createTShirtGeometry('M');
      case 'hoodie':
      case 'hooded':
        return createHoodieGeometry('M');
      case 'longsleeve':
      case 'longsleevetee':
        return createLongSleeveGeometry('M');
      case 'polo':
      case 'poloshirt':
        return createPoloGeometry('M');
      case 'tank':
      case 'tanktop':
      case 'womenstank':
        return createTankGeometry('M');
      default:
        return createTShirtGeometry('M');
    }
  }, [garmentType]);

  // Create realistic fabric material
  const material = useMemo(() => {
    const baseColor = new THREE.Color(garmentColor || '#ffffff');
    
    return new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: 0.8,
      metalness: 0.1,
      map: designTexture,
      normalScale: new THREE.Vector2(0.5, 0.5),
      side: THREE.DoubleSide
    });
  }, [garmentColor, designTexture]);

  // Subtle animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  // Handle special garment types
  if (garmentType.toLowerCase().includes('cap') || garmentType.toLowerCase().includes('hat')) {
    const capGroup = useMemo(() => createCapGeometry('snapback'), []);
    return (
      <group ref={meshRef as any}>
        <primitive object={capGroup} material={material} />
      </group>
    );
  }

  if (garmentType.toLowerCase().includes('tote') || garmentType.toLowerCase().includes('bag')) {
    const toteGroup = useMemo(() => createToteGeometry(), []);
    return (
      <group ref={meshRef as any}>
        <primitive object={toteGroup} material={material} />
      </group>
    );
  }

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} />
  );
};