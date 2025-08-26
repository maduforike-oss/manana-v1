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

// Professional Zip-Up Hoodie Geometry
const createZipHoodieGeometry = (size: string = 'M'): THREE.BufferGeometry => {
  const sizeMultipliers = {
    'XS': 0.85, 'S': 0.92, 'M': 1.0, 'L': 1.08, 'XL': 1.16, 'XXL': 1.24
  };
  const multiplier = sizeMultipliers[size as keyof typeof sizeMultipliers] || 1.0;

  const shape = new THREE.Shape();
  
  // Zip-up hoodie with split front design
  shape.moveTo(-7.5 * multiplier, -9);
  shape.quadraticCurveTo(-7.8 * multiplier, -4, -7.2 * multiplier, 0);
  shape.quadraticCurveTo(-6.8 * multiplier, 4, -5.5 * multiplier, 6.5);
  shape.quadraticCurveTo(-4.2 * multiplier, 7.8, -2.8 * multiplier, 8);
  
  // Split front for zipper (stop at center)
  shape.quadraticCurveTo(-1.5 * multiplier, 8.2, -0.2 * multiplier, 8.5);
  shape.lineTo(-0.2 * multiplier, -9);
  shape.lineTo(-7.5 * multiplier, -9);

  // Add sleeve holes
  const leftSleeveHole = new THREE.Path();
  leftSleeveHole.moveTo(-5.5 * multiplier, 6.5);
  leftSleeveHole.quadraticCurveTo(-8.5 * multiplier, 5, -9 * multiplier, 1.5);
  leftSleeveHole.quadraticCurveTo(-8.5 * multiplier, -1.5, -6.5 * multiplier, 0);
  leftSleeveHole.quadraticCurveTo(-5.8 * multiplier, 3, -5.5 * multiplier, 6.5);
  shape.holes.push(leftSleeveHole);

  const extrudeSettings = {
    depth: 0.4 * multiplier,
    bevelEnabled: true,
    bevelSegments: 12,
    steps: 3,
    bevelSize: 0.08,
    bevelThickness: 0.03,
    curveSegments: 20
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

// Professional V-Neck Geometry
const createVNeckGeometry = (size: string = 'M'): THREE.BufferGeometry => {
  const sizeMultipliers = {
    'XS': 0.85, 'S': 0.92, 'M': 1.0, 'L': 1.08, 'XL': 1.16, 'XXL': 1.24
  };
  const multiplier = sizeMultipliers[size as keyof typeof sizeMultipliers] || 1.0;

  const shape = new THREE.Shape();
  
  shape.moveTo(-6 * multiplier, -8);
  shape.quadraticCurveTo(-6.2 * multiplier, -4, -5.8 * multiplier, 0);
  shape.quadraticCurveTo(-5.5 * multiplier, 3, -4.5 * multiplier, 5.5);
  shape.quadraticCurveTo(-3.8 * multiplier, 6.8, -2.5 * multiplier, 7.2);
  
  // V-neck design - deeper V shape
  shape.quadraticCurveTo(-1.5 * multiplier, 7.0, -0.5 * multiplier, 6.5);
  shape.lineTo(0, 5.8); // Deep V point
  shape.lineTo(0.5 * multiplier, 6.5);
  shape.quadraticCurveTo(1.5 * multiplier, 7.0, 2.5 * multiplier, 7.2);
  
  shape.quadraticCurveTo(3.8 * multiplier, 6.8, 4.5 * multiplier, 5.5);
  shape.quadraticCurveTo(5.5 * multiplier, 3, 5.8 * multiplier, 0);
  shape.quadraticCurveTo(6.2 * multiplier, -4, 6 * multiplier, -8);
  shape.lineTo(-6 * multiplier, -8);

  // Sleeve holes
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

// Professional Button-Up Shirt Geometry
const createButtonShirtGeometry = (size: string = 'M'): THREE.BufferGeometry => {
  const sizeMultipliers = {
    'XS': 0.85, 'S': 0.92, 'M': 1.0, 'L': 1.08, 'XL': 1.16, 'XXL': 1.24
  };
  const multiplier = sizeMultipliers[size as keyof typeof sizeMultipliers] || 1.0;

  const shape = new THREE.Shape();
  
  // More structured, tailored fit
  shape.moveTo(-5.5 * multiplier, -8.5);
  shape.quadraticCurveTo(-5.8 * multiplier, -4, -5.4 * multiplier, 0);
  shape.quadraticCurveTo(-5.1 * multiplier, 3.5, -4.2 * multiplier, 6);
  shape.quadraticCurveTo(-3.5 * multiplier, 7.2, -2.2 * multiplier, 7.5);
  
  // Button-up collar opening (wider than crew neck)
  shape.quadraticCurveTo(-1 * multiplier, 7.8, 0, 8);
  shape.quadraticCurveTo(1 * multiplier, 7.8, 2.2 * multiplier, 7.5);
  
  shape.quadraticCurveTo(3.5 * multiplier, 7.2, 4.2 * multiplier, 6);
  shape.quadraticCurveTo(5.1 * multiplier, 3.5, 5.4 * multiplier, 0);
  shape.quadraticCurveTo(5.8 * multiplier, -4, 5.5 * multiplier, -8.5);
  shape.lineTo(-5.5 * multiplier, -8.5);

  // More fitted sleeve holes
  const leftSleeveHole = new THREE.Path();
  leftSleeveHole.moveTo(-4.2 * multiplier, 6);
  leftSleeveHole.quadraticCurveTo(-6.5 * multiplier, 5, -7 * multiplier, 2);
  leftSleeveHole.quadraticCurveTo(-6.5 * multiplier, -0.5, -5.2 * multiplier, 0.5);
  leftSleeveHole.quadraticCurveTo(-4.5 * multiplier, 3, -4.2 * multiplier, 6);
  shape.holes.push(leftSleeveHole);

  const rightSleeveHole = new THREE.Path();
  rightSleeveHole.moveTo(4.2 * multiplier, 6);
  rightSleeveHole.quadraticCurveTo(6.5 * multiplier, 5, 7 * multiplier, 2);
  rightSleeveHole.quadraticCurveTo(6.5 * multiplier, -0.5, 5.2 * multiplier, 0.5);
  rightSleeveHole.quadraticCurveTo(4.5 * multiplier, 3, 4.2 * multiplier, 6);
  shape.holes.push(rightSleeveHole);

  const extrudeSettings = {
    depth: 0.22 * multiplier, // Thinner dress shirt material
    bevelEnabled: true,
    bevelSegments: 10,
    steps: 2,
    bevelSize: 0.03,
    bevelThickness: 0.015,
    curveSegments: 18
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

// Professional Denim Jacket Geometry
const createDenimJacketGeometry = (size: string = 'M'): THREE.BufferGeometry => {
  const sizeMultipliers = {
    'XS': 0.85, 'S': 0.92, 'M': 1.0, 'L': 1.08, 'XL': 1.16, 'XXL': 1.24
  };
  const multiplier = sizeMultipliers[size as keyof typeof sizeMultipliers] || 1.0;

  const shape = new THREE.Shape();
  
  // Structured denim jacket with button front
  shape.moveTo(-6.5 * multiplier, -8);
  shape.quadraticCurveTo(-6.8 * multiplier, -4, -6.3 * multiplier, 0);
  shape.quadraticCurveTo(-5.9 * multiplier, 4, -4.8 * multiplier, 6.5);
  shape.quadraticCurveTo(-3.9 * multiplier, 7.5, -2.5 * multiplier, 7.8);
  
  // Jacket collar/lapel area
  shape.quadraticCurveTo(-1.2 * multiplier, 8, 0, 8.2);
  shape.quadraticCurveTo(1.2 * multiplier, 8, 2.5 * multiplier, 7.8);
  
  shape.quadraticCurveTo(3.9 * multiplier, 7.5, 4.8 * multiplier, 6.5);
  shape.quadraticCurveTo(5.9 * multiplier, 4, 6.3 * multiplier, 0);
  shape.quadraticCurveTo(6.8 * multiplier, -4, 6.5 * multiplier, -8);
  shape.lineTo(-6.5 * multiplier, -8);

  // Jacket sleeve holes (structured)
  const leftSleeveHole = new THREE.Path();
  leftSleeveHole.moveTo(-4.8 * multiplier, 6.5);
  leftSleeveHole.quadraticCurveTo(-7.8 * multiplier, 5.5, -8.5 * multiplier, 2);
  leftSleeveHole.quadraticCurveTo(-7.8 * multiplier, -1, -6 * multiplier, 0);
  leftSleeveHole.quadraticCurveTo(-5.2 * multiplier, 3, -4.8 * multiplier, 6.5);
  shape.holes.push(leftSleeveHole);

  const rightSleeveHole = new THREE.Path();
  rightSleeveHole.moveTo(4.8 * multiplier, 6.5);
  rightSleeveHole.quadraticCurveTo(7.8 * multiplier, 5.5, 8.5 * multiplier, 2);
  rightSleeveHole.quadraticCurveTo(7.8 * multiplier, -1, 6 * multiplier, 0);
  rightSleeveHole.quadraticCurveTo(5.2 * multiplier, 3, 4.8 * multiplier, 6.5);
  shape.holes.push(rightSleeveHole);

  const extrudeSettings = {
    depth: 0.35 * multiplier, // Thicker denim material
    bevelEnabled: true,
    bevelSegments: 12,
    steps: 3,
    bevelSize: 0.06,
    bevelThickness: 0.025,
    curveSegments: 20
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

// Professional Bomber Jacket Geometry
const createBomberGeometry = (size: string = 'M'): THREE.BufferGeometry => {
  const sizeMultipliers = {
    'XS': 0.85, 'S': 0.92, 'M': 1.0, 'L': 1.08, 'XL': 1.16, 'XXL': 1.24
  };
  const multiplier = sizeMultipliers[size as keyof typeof sizeMultipliers] || 1.0;

  const shape = new THREE.Shape();
  
  // Modern bomber silhouette
  shape.moveTo(-6.8 * multiplier, -7.5);
  shape.quadraticCurveTo(-7.2 * multiplier, -3, -6.7 * multiplier, 1);
  shape.quadraticCurveTo(-6.3 * multiplier, 4.5, -5.2 * multiplier, 6.8);
  shape.quadraticCurveTo(-4.2 * multiplier, 7.7, -2.8 * multiplier, 7.9);
  
  // Bomber crew neck
  shape.quadraticCurveTo(-1.3 * multiplier, 8.1, 0, 8.3);
  shape.quadraticCurveTo(1.3 * multiplier, 8.1, 2.8 * multiplier, 7.9);
  
  shape.quadraticCurveTo(4.2 * multiplier, 7.7, 5.2 * multiplier, 6.8);
  shape.quadraticCurveTo(6.3 * multiplier, 4.5, 6.7 * multiplier, 1);
  shape.quadraticCurveTo(7.2 * multiplier, -3, 6.8 * multiplier, -7.5);
  shape.lineTo(-6.8 * multiplier, -7.5);

  // Bomber sleeve holes (drop shoulder style)
  const leftSleeveHole = new THREE.Path();
  leftSleeveHole.moveTo(-5.2 * multiplier, 6.8);
  leftSleeveHole.quadraticCurveTo(-8.2 * multiplier, 5.8, -9 * multiplier, 2.5);
  leftSleeveHole.quadraticCurveTo(-8.2 * multiplier, -0.5, -6.2 * multiplier, 0.5);
  leftSleeveHole.quadraticCurveTo(-5.5 * multiplier, 3.5, -5.2 * multiplier, 6.8);
  shape.holes.push(leftSleeveHole);

  const rightSleeveHole = new THREE.Path();
  rightSleeveHole.moveTo(5.2 * multiplier, 6.8);
  rightSleeveHole.quadraticCurveTo(8.2 * multiplier, 5.8, 9 * multiplier, 2.5);
  rightSleeveHole.quadraticCurveTo(8.2 * multiplier, -0.5, 6.2 * multiplier, 0.5);
  rightSleeveHole.quadraticCurveTo(5.5 * multiplier, 3.5, 5.2 * multiplier, 6.8);
  shape.holes.push(rightSleeveHole);

  const extrudeSettings = {
    depth: 0.32 * multiplier,
    bevelEnabled: true,
    bevelSegments: 10,
    steps: 2,
    bevelSize: 0.055,
    bevelThickness: 0.022,
    curveSegments: 18
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

// Professional Crewneck Geometry
const createCrewneckGeometry = (size: string = 'M'): THREE.BufferGeometry => {
  const sizeMultipliers = {
    'XS': 0.85, 'S': 0.92, 'M': 1.0, 'L': 1.08, 'XL': 1.16, 'XXL': 1.24
  };
  const multiplier = sizeMultipliers[size as keyof typeof sizeMultipliers] || 1.0;

  const shape = new THREE.Shape();
  
  // Classic sweatshirt proportions
  shape.moveTo(-7 * multiplier, -8.5);
  shape.quadraticCurveTo(-7.3 * multiplier, -4, -6.8 * multiplier, 0);
  shape.quadraticCurveTo(-6.4 * multiplier, 3.8, -5.3 * multiplier, 6.2);
  shape.quadraticCurveTo(-4.3 * multiplier, 7.4, -2.9 * multiplier, 7.7);
  
  // Ribbed crewneck (tight around neck)
  shape.quadraticCurveTo(-1.5 * multiplier, 7.9, 0, 8.1);
  shape.quadraticCurveTo(1.5 * multiplier, 7.9, 2.9 * multiplier, 7.7);
  
  shape.quadraticCurveTo(4.3 * multiplier, 7.4, 5.3 * multiplier, 6.2);
  shape.quadraticCurveTo(6.4 * multiplier, 3.8, 6.8 * multiplier, 0);
  shape.quadraticCurveTo(7.3 * multiplier, -4, 7 * multiplier, -8.5);
  shape.lineTo(-7 * multiplier, -8.5);

  // Crewneck sleeve holes
  const leftSleeveHole = new THREE.Path();
  leftSleeveHole.moveTo(-5.3 * multiplier, 6.2);
  leftSleeveHole.quadraticCurveTo(-8.3 * multiplier, 5.2, -9 * multiplier, 1.8);
  leftSleeveHole.quadraticCurveTo(-8.3 * multiplier, -1.2, -6.3 * multiplier, 0);
  leftSleeveHole.quadraticCurveTo(-5.6 * multiplier, 3, -5.3 * multiplier, 6.2);
  shape.holes.push(leftSleeveHole);

  const rightSleeveHole = new THREE.Path();
  rightSleeveHole.moveTo(5.3 * multiplier, 6.2);
  rightSleeveHole.quadraticCurveTo(8.3 * multiplier, 5.2, 9 * multiplier, 1.8);
  rightSleeveHole.quadraticCurveTo(8.3 * multiplier, -1.2, 6.3 * multiplier, 0);
  rightSleeveHole.quadraticCurveTo(5.6 * multiplier, 3, 5.3 * multiplier, 6.2);
  shape.holes.push(rightSleeveHole);

  const extrudeSettings = {
    depth: 0.38 * multiplier, // Thick sweatshirt material
    bevelEnabled: true,
    bevelSegments: 12,
    steps: 3,
    bevelSize: 0.07,
    bevelThickness: 0.028,
    curveSegments: 20
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

// Professional Performance Shirt Geometry
const createPerformanceShirtGeometry = (size: string = 'M'): THREE.BufferGeometry => {
  const sizeMultipliers = {
    'XS': 0.85, 'S': 0.92, 'M': 1.0, 'L': 1.08, 'XL': 1.16, 'XXL': 1.24
  };
  const multiplier = sizeMultipliers[size as keyof typeof sizeMultipliers] || 1.0;

  const shape = new THREE.Shape();
  
  // Athletic, fitted cut
  shape.moveTo(-5.5 * multiplier, -8);
  shape.quadraticCurveTo(-5.8 * multiplier, -4, -5.3 * multiplier, 0);
  shape.quadraticCurveTo(-4.9 * multiplier, 3.2, -4 * multiplier, 5.8);
  shape.quadraticCurveTo(-3.2 * multiplier, 7, -2 * multiplier, 7.3);
  
  // Athletic crew neck
  shape.quadraticCurveTo(-1 * multiplier, 7.5, 0, 7.7);
  shape.quadraticCurveTo(1 * multiplier, 7.5, 2 * multiplier, 7.3);
  
  shape.quadraticCurveTo(3.2 * multiplier, 7, 4 * multiplier, 5.8);
  shape.quadraticCurveTo(4.9 * multiplier, 3.2, 5.3 * multiplier, 0);
  shape.quadraticCurveTo(5.8 * multiplier, -4, 5.5 * multiplier, -8);
  shape.lineTo(-5.5 * multiplier, -8);

  // Athletic sleeve holes (more fitted)
  const leftSleeveHole = new THREE.Path();
  leftSleeveHole.moveTo(-4 * multiplier, 5.8);
  leftSleeveHole.quadraticCurveTo(-6.2 * multiplier, 4.5, -6.8 * multiplier, 1.5);
  leftSleeveHole.quadraticCurveTo(-6.2 * multiplier, -0.8, -4.8 * multiplier, 0.2);
  leftSleeveHole.quadraticCurveTo(-4.2 * multiplier, 2.8, -4 * multiplier, 5.8);
  shape.holes.push(leftSleeveHole);

  const rightSleeveHole = new THREE.Path();
  rightSleeveHole.moveTo(4 * multiplier, 5.8);
  rightSleeveHole.quadraticCurveTo(6.2 * multiplier, 4.5, 6.8 * multiplier, 1.5);
  rightSleeveHole.quadraticCurveTo(6.2 * multiplier, -0.8, 4.8 * multiplier, 0.2);
  rightSleeveHole.quadraticCurveTo(4.2 * multiplier, 2.8, 4 * multiplier, 5.8);
  shape.holes.push(rightSleeveHole);

  const extrudeSettings = {
    depth: 0.18 * multiplier, // Thin performance material
    bevelEnabled: true,
    bevelSegments: 6,
    steps: 1,
    bevelSize: 0.025,
    bevelThickness: 0.012,
    curveSegments: 14
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

// Professional Women's Fitted Tee Geometry
const createWomensFittedTeeGeometry = (size: string = 'M'): THREE.BufferGeometry => {
  const sizeMultipliers = {
    'XS': 0.82, 'S': 0.89, 'M': 1.0, 'L': 1.07, 'XL': 1.14, 'XXL': 1.21
  };
  const multiplier = sizeMultipliers[size as keyof typeof sizeMultipliers] || 1.0;

  const shape = new THREE.Shape();
  
  // Fitted feminine silhouette
  shape.moveTo(-5.2 * multiplier, -8);
  shape.quadraticCurveTo(-5.5 * multiplier, -4, -5 * multiplier, -1);
  shape.quadraticCurveTo(-4.5 * multiplier, 1.5, -4.8 * multiplier, 3.5); // Fitted waist
  shape.quadraticCurveTo(-4.2 * multiplier, 5.2, -3.5 * multiplier, 6.5);
  shape.quadraticCurveTo(-2.8 * multiplier, 7.2, -1.8 * multiplier, 7.4);
  
  // Feminine neckline
  shape.quadraticCurveTo(-0.9 * multiplier, 7.6, 0, 7.8);
  shape.quadraticCurveTo(0.9 * multiplier, 7.6, 1.8 * multiplier, 7.4);
  
  shape.quadraticCurveTo(2.8 * multiplier, 7.2, 3.5 * multiplier, 6.5);
  shape.quadraticCurveTo(4.2 * multiplier, 5.2, 4.8 * multiplier, 3.5);
  shape.quadraticCurveTo(4.5 * multiplier, 1.5, 5 * multiplier, -1);
  shape.quadraticCurveTo(5.5 * multiplier, -4, 5.2 * multiplier, -8);
  shape.lineTo(-5.2 * multiplier, -8);

  // Feminine sleeve holes
  const leftSleeveHole = new THREE.Path();
  leftSleeveHole.moveTo(-3.5 * multiplier, 6.5);
  leftSleeveHole.quadraticCurveTo(-5.8 * multiplier, 5.5, -6.3 * multiplier, 2.5);
  leftSleeveHole.quadraticCurveTo(-5.8 * multiplier, 0, -4.3 * multiplier, 0.8);
  leftSleeveHole.quadraticCurveTo(-3.7 * multiplier, 3.5, -3.5 * multiplier, 6.5);
  shape.holes.push(leftSleeveHole);

  const rightSleeveHole = new THREE.Path();
  rightSleeveHole.moveTo(3.5 * multiplier, 6.5);
  rightSleeveHole.quadraticCurveTo(5.8 * multiplier, 5.5, 6.3 * multiplier, 2.5);
  rightSleeveHole.quadraticCurveTo(5.8 * multiplier, 0, 4.3 * multiplier, 0.8);
  rightSleeveHole.quadraticCurveTo(3.7 * multiplier, 3.5, 3.5 * multiplier, 6.5);
  shape.holes.push(rightSleeveHole);

  const extrudeSettings = {
    depth: 0.25 * multiplier,
    bevelEnabled: true,
    bevelSegments: 8,
    steps: 2,
    bevelSize: 0.04,
    bevelThickness: 0.018,
    curveSegments: 16
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

// Enhanced Beanie Geometry
const createBeanieGeometry = (): THREE.BufferGeometry => {
  // Realistic knit beanie shape
  const beanieGeometry = new THREE.SphereGeometry(1.2, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.65);
  
  // Add slight elongation for realistic beanie shape
  const vertices = beanieGeometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 3) {
    vertices[i + 1] *= 1.1; // Stretch Y slightly
  }
  beanieGeometry.attributes.position.needsUpdate = true;
  
  return beanieGeometry;
};

// Enhanced Snapback Cap Geometry
const createSnapbackGeometry = (): THREE.Group => {
  const group = new THREE.Group();
  
  // Structured crown with flat top
  const crownGeometry = new THREE.CylinderGeometry(1.1, 1.2, 0.7, 16);
  
  // Flat bill geometry
  const billShape = new THREE.Shape();
  billShape.moveTo(-1.4, 0);
  billShape.lineTo(1.4, 0);
  billShape.quadraticCurveTo(1.2, 1.8, 0, 2);
  billShape.quadraticCurveTo(-1.2, 1.8, -1.4, 0);
  
  const billGeometry = new THREE.ExtrudeGeometry(billShape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelSegments: 6,
    bevelSize: 0.02,
    bevelThickness: 0.01
  });
  
  billGeometry.translate(0, -0.35, 1.1);
  
  // Add panel lines for structured look
  const panelGeometry = new THREE.CylinderGeometry(1.25, 1.25, 0.02, 6, 1, true);
  
  group.add(new THREE.Mesh(crownGeometry));
  group.add(new THREE.Mesh(billGeometry));
  group.add(new THREE.Mesh(panelGeometry, new THREE.MeshStandardMaterial({ 
    color: 0x333333, 
    transparent: true, 
    opacity: 0.1 
  })));
  
  return group;
};

// Enhanced Tote Bag Geometry with Professional Details
const createToteGeometry = (): THREE.Group => {
  const group = new THREE.Group();
  
  // Main bag body with realistic proportions
  const bodyGeometry = new THREE.BoxGeometry(2.8, 3.2, 0.4);
  const body = new THREE.Mesh(bodyGeometry);
  
  // Professional canvas handles
  const handleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.6, 8);
  
  const leftHandle = new THREE.Mesh(handleGeometry);
  leftHandle.position.set(-0.6, 2.2, 0);
  leftHandle.rotateZ(Math.PI / 2);
  
  const rightHandle = new THREE.Mesh(handleGeometry);
  rightHandle.position.set(0.6, 2.2, 0);
  rightHandle.rotateZ(Math.PI / 2);
  
  // Handle attachment reinforcement
  const reinforcementGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8);
  
  const leftReinforcement1 = new THREE.Mesh(reinforcementGeometry);
  leftReinforcement1.position.set(-0.6, 1.8, 0.22);
  
  const leftReinforcement2 = new THREE.Mesh(reinforcementGeometry);
  leftReinforcement2.position.set(-0.6, 1.8, -0.22);
  
  const rightReinforcement1 = new THREE.Mesh(reinforcementGeometry);
  rightReinforcement1.position.set(0.6, 1.8, 0.22);
  
  const rightReinforcement2 = new THREE.Mesh(reinforcementGeometry);
  rightReinforcement2.position.set(0.6, 1.8, -0.22);
  
  // Bottom gusset for structure
  const gussetGeometry = new THREE.BoxGeometry(2.6, 0.4, 0.3);
  const gusset = new THREE.Mesh(gussetGeometry);
  gusset.position.set(0, -1.8, 0);
  
  group.add(body);
  group.add(leftHandle);
  group.add(rightHandle);
  group.add(leftReinforcement1);
  group.add(leftReinforcement2);
  group.add(rightReinforcement1);
  group.add(rightReinforcement2);
  group.add(gusset);
  
  return group;
};

export const RealisticGarmentModel: React.FC<RealisticGarmentModelProps> = ({
  garmentType,
  garmentColor,
  designTexture
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { doc } = useStudioStore();
  
  // Performance-optimized geometry cache
  const geometry = useMemo(() => {
    const normalizedType = garmentType.toLowerCase().replace(/[^a-z-]/g, '');
    
    switch (normalizedType) {
      case 'tshirt':
      case 'tee':
      case 't-shirt':
        return createTShirtGeometry('M');
        
      case 'hoodie':
      case 'hooded':
        return createHoodieGeometry('M');
        
      case 'ziphoodie':
      case 'zip-hoodie':
      case 'zipuphoodie':
        return createZipHoodieGeometry('M');
        
      case 'longsleeve':
      case 'longsleevetee':
      case 'long-sleeve-tee':
        return createLongSleeveGeometry('M');
        
      case 'polo':
      case 'poloshirt':
      case 'polo-shirt':
        return createPoloGeometry('M');
        
      case 'tank':
      case 'tanktop':
      case 'tank-top':
      case 'womenstank':
        return createTankGeometry('M');
        
      case 'vneck':
      case 'v-neck':
      case 'vnecktshirt':
        return createVNeckGeometry('M');
        
      case 'buttonshirt':
      case 'button-shirt':
      case 'button-up-shirt':
      case 'buttonup':
        return createButtonShirtGeometry('M');
        
      case 'denimjacket':
      case 'denim-jacket':
        return createDenimJacketGeometry('M');
        
      case 'bomber':
      case 'bomberjacket':
      case 'bomber-jacket':
        return createBomberGeometry('M');
        
      case 'crewneck':
      case 'pullover':
      case 'sweatshirt':
        return createCrewneckGeometry('M');
        
      case 'performance':
      case 'performanceshirt':
      case 'performance-shirt':
      case 'athletic':
        return createPerformanceShirtGeometry('M');
        
      case 'womensfittedtee':
      case 'womens-fitted-tee':
      case 'womensfitted':
      case 'womenstee':
      case 'womens-tee':
        return createWomensFittedTeeGeometry('M');
        
      case 'beanie':
        return createBeanieGeometry();
        
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

  // Handle special garment types with professional models
  if (garmentType.toLowerCase().includes('cap') || 
      garmentType.toLowerCase().includes('hat') || 
      garmentType.toLowerCase().includes('snapback') ||
      garmentType.toLowerCase().includes('trucker')) {
    const capGroup = useMemo(() => createSnapbackGeometry(), []);
    return (
      <group ref={meshRef as any}>
        <primitive object={capGroup} material={material} />
      </group>
    );
  }

  if (garmentType.toLowerCase().includes('beanie')) {
    return (
      <mesh ref={meshRef} geometry={geometry} material={material} />
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