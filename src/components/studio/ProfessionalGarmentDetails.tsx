import React, { useMemo } from 'react';
import * as THREE from 'three';

// Professional construction details for realistic garments
export interface GarmentDetails {
  seams: THREE.BufferGeometry[];
  hardware: THREE.BufferGeometry[];
  labels: THREE.BufferGeometry[];
  stitching: THREE.BufferGeometry[];
}

// Create realistic seam lines for garments
export const createSeamLines = (garmentType: string): THREE.BufferGeometry[] => {
  const seams: THREE.BufferGeometry[] = [];
  
  switch (garmentType.toLowerCase()) {
    case 'hoodie':
    case 'zip-hoodie':
      // Side seams
      seams.push(createVerticalSeam(-3.5, -8, 6.5, 0.02));
      seams.push(createVerticalSeam(3.5, -8, 6.5, 0.02));
      
      // Shoulder seams
      seams.push(createShoulderSeam(-4.5, 5.5, 2.5, 0.015));
      seams.push(createShoulderSeam(4.5, 5.5, -2.5, 0.015));
      
      // Hood seam
      seams.push(createCurvedSeam([
        { x: -2.8, y: 8, z: 0.1 },
        { x: 0, y: 8.5, z: 0.1 },
        { x: 2.8, y: 8, z: 0.1 }
      ], 0.015));
      break;
      
    case 't-shirt':
    case 'tee':
      // Side seams
      seams.push(createVerticalSeam(-3, -8, 5.5, 0.015));
      seams.push(createVerticalSeam(3, -8, 5.5, 0.015));
      
      // Shoulder seams
      seams.push(createShoulderSeam(-4.5, 5.5, 2.5, 0.012));
      seams.push(createShoulderSeam(4.5, 5.5, -2.5, 0.012));
      break;
      
    case 'denim-jacket':
      // Center back seam
      seams.push(createVerticalSeam(0, -8, 7.8, 0.025));
      
      // Side seams with double stitching
      seams.push(createVerticalSeam(-3.2, -8, 6.5, 0.02));
      seams.push(createVerticalSeam(-3.4, -8, 6.5, 0.02));
      seams.push(createVerticalSeam(3.2, -8, 6.5, 0.02));
      seams.push(createVerticalSeam(3.4, -8, 6.5, 0.02));
      break;
  }
  
  return seams;
};

// Create hardware elements (buttons, zippers, etc.)
export const createHardwareElements = (garmentType: string): THREE.BufferGeometry[] => {
  const hardware: THREE.BufferGeometry[] = [];
  
  switch (garmentType.toLowerCase()) {
    case 'zip-hoodie':
      // Zipper track
      hardware.push(createZipper(0, -8, 8.5, 0.03));
      
      // Zipper pull
      const zipperPull = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8);
      zipperPull.translate(0, 4, 0.15);
      hardware.push(zipperPull);
      
      // Drawstring grommets
      hardware.push(createGrommet(-0.8, 7.8, 0.1, 0.03));
      hardware.push(createGrommet(0.8, 7.8, 0.1, 0.03));
      break;
      
    case 'button-shirt':
    case 'denim-jacket':
      // Button placket buttons
      for (let i = 0; i < 6; i++) {
        const y = 6 - (i * 2.3);
        hardware.push(createButton(0, y, 0.12, 0.06));
      }
      break;
      
    case 'polo':
      // Polo collar buttons
      hardware.push(createButton(0, 6.5, 0.12, 0.04));
      hardware.push(createButton(0, 5.8, 0.12, 0.04));
      break;
  }
  
  return hardware;
};

// Create brand labels and care tags
export const createLabels = (garmentType: string): THREE.BufferGeometry[] => {
  const labels: THREE.BufferGeometry[] = [];
  
  // Back neck label
  const neckLabel = new THREE.PlaneGeometry(0.8, 0.3);
  neckLabel.translate(0, 7.2, -0.05);
  labels.push(neckLabel);
  
  // Side seam care label
  const careLabel = new THREE.PlaneGeometry(0.4, 1.2);
  careLabel.rotateY(Math.PI / 2);
  careLabel.translate(-2.8, -2, 0);
  labels.push(careLabel);
  
  // Size label (for structured garments)
  if (['hoodie', 'zip-hoodie', 'denim-jacket'].includes(garmentType.toLowerCase())) {
    const sizeLabel = new THREE.PlaneGeometry(0.3, 0.3);
    sizeLabel.translate(-2.5, -6, -0.05);
    labels.push(sizeLabel);
  }
  
  return labels;
};

// Create detailed stitching patterns
export const createStitchingDetails = (garmentType: string): THREE.BufferGeometry[] => {
  const stitching: THREE.BufferGeometry[] = [];
  
  switch (garmentType.toLowerCase()) {
    case 'hoodie':
    case 'zip-hoodie':
      // Kangaroo pocket stitching
      stitching.push(createPocketStitching(-1.5, -2, 3, 1.5, 0.01));
      
      // Ribbed cuff stitching
      stitching.push(createRibbedCuffStitching(-7.5, 1, 0.01));
      stitching.push(createRibbedCuffStitching(7.5, 1, 0.01));
      
      // Bottom hem stitching
      stitching.push(createHemStitching(-7.5, -8.8, 15, 0.01));
      break;
      
    case 'denim-jacket':
      // Chest pocket stitching
      stitching.push(createPocketStitching(-2, 3, 1.5, 1.2, 0.015));
      stitching.push(createPocketStitching(2, 3, 1.5, 1.2, 0.015));
      
      // Contrast stitching on seams
      stitching.push(createContrastStitching(-3.3, -8, 6.5, 0.015, '#ffa500'));
      stitching.push(createContrastStitching(3.3, -8, 6.5, 0.015, '#ffa500'));
      break;
      
    case 'polo':
      // Collar stitching
      stitching.push(createCollarStitching(0, 7.3, 2.5, 0.01));
      
      // Button placket stitching
      stitching.push(createVerticalSeam(-0.3, 5.5, 2, 0.01));
      stitching.push(createVerticalSeam(0.3, 5.5, 2, 0.01));
      break;
  }
  
  return stitching;
};

// Helper functions for creating specific construction elements

const createVerticalSeam = (x: number, yStart: number, height: number, width: number): THREE.BufferGeometry => {
  const seam = new THREE.PlaneGeometry(width, height);
  seam.translate(x, yStart + height/2, 0.01);
  return seam;
};

const createShoulderSeam = (xStart: number, y: number, xEnd: number, width: number): THREE.BufferGeometry => {
  const length = Math.abs(xEnd - xStart);
  const seam = new THREE.PlaneGeometry(length, width);
  seam.rotateZ(Math.PI / 2);
  seam.translate((xStart + xEnd) / 2, y, 0.01);
  return seam;
};

const createCurvedSeam = (points: Array<{x: number, y: number, z: number}>, width: number): THREE.BufferGeometry => {
  const curve = new THREE.CatmullRomCurve3(
    points.map(p => new THREE.Vector3(p.x, p.y, p.z))
  );
  
  const tubeGeometry = new THREE.TubeGeometry(curve, 20, width/2, 8, false);
  return tubeGeometry;
};

const createZipper = (x: number, yStart: number, height: number, width: number): THREE.BufferGeometry => {
  const zipper = new THREE.PlaneGeometry(width, height);
  zipper.translate(x, yStart + height/2, 0.08);
  return zipper;
};

const createButton = (x: number, y: number, z: number, radius: number): THREE.BufferGeometry => {
  const button = new THREE.CylinderGeometry(radius, radius, 0.02, 16);
  button.translate(x, y, z);
  return button;
};

const createGrommet = (x: number, y: number, z: number, radius: number): THREE.BufferGeometry => {
  const grommet = new THREE.RingGeometry(radius * 0.6, radius, 0, Math.PI * 2, 8);
  grommet.translate(x, y, z);
  return grommet;
};

const createPocketStitching = (x: number, y: number, width: number, height: number, stitchWidth: number): THREE.BufferGeometry => {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  
  // Create rectangular stitching pattern
  const segments = 20;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    
    // Top edge
    vertices.push(x - width/2 + t * width, y + height/2, 0.05);
    // Right edge
    if (i === segments) {
      for (let j = 1; j <= segments; j++) {
        const s = j / segments;
        vertices.push(x + width/2, y + height/2 - s * height, 0.05);
      }
    }
    // Bottom edge
    if (i === segments) {
      for (let j = segments - 1; j >= 0; j--) {
        const t = j / segments;
        vertices.push(x - width/2 + t * width, y - height/2, 0.05);
      }
    }
    // Left edge
    if (i === segments) {
      for (let j = segments - 1; j >= 0; j--) {
        const s = j / segments;
        vertices.push(x - width/2, y - height/2 + s * height, 0.05);
      }
    }
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  return geometry;
};

const createRibbedCuffStitching = (x: number, y: number, stitchWidth: number): THREE.BufferGeometry => {
  const cuff = new THREE.RingGeometry(0.8, 1.2, 0, Math.PI * 2, 16);
  cuff.rotateZ(Math.PI / 2);
  cuff.translate(x, y, 0);
  return cuff;
};

const createHemStitching = (x: number, y: number, width: number, stitchWidth: number): THREE.BufferGeometry => {
  const hem = new THREE.PlaneGeometry(width, stitchWidth);
  hem.translate(x + width/2, y, 0.02);
  return hem;
};

const createContrastStitching = (x: number, yStart: number, height: number, width: number, color: string): THREE.BufferGeometry => {
  const stitching = new THREE.PlaneGeometry(width, height);
  stitching.translate(x, yStart + height/2, 0.015);
  return stitching;
};

const createCollarStitching = (x: number, y: number, width: number, stitchWidth: number): THREE.BufferGeometry => {
  const collar = new THREE.RingGeometry(width * 0.8, width, 0, Math.PI, 16);
  collar.translate(x, y, 0.02);
  return collar;
};

// Professional garment details component
export const ProfessionalGarmentDetails: React.FC<{
  garmentType: string;
  garmentColor: string;
}> = ({ garmentType, garmentColor }) => {
  const details = useMemo(() => ({
    seams: createSeamLines(garmentType),
    hardware: createHardwareElements(garmentType),
    labels: createLabels(garmentType),
    stitching: createStitchingDetails(garmentType)
  }), [garmentType]);
  
  const seamMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(garmentColor).multiplyScalar(0.7),
    roughness: 0.9,
    metalness: 0.1
  }), [garmentColor]);
  
  const hardwareMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#666666',
    roughness: 0.3,
    metalness: 0.8
  }), []);
  
  const labelMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f8f8f8',
    roughness: 0.8,
    transparent: true,
    opacity: 0.9
  }), []);
  
  const stitchingMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(garmentColor).multiplyScalar(0.5),
    roughness: 0.95
  }), [garmentColor]);
  
  return (
    <group>
      {/* Seam lines */}
      {details.seams.map((seam, index) => (
        <mesh key={`seam-${index}`} geometry={seam} material={seamMaterial} />
      ))}
      
      {/* Hardware elements */}
      {details.hardware.map((hardware, index) => (
        <mesh key={`hardware-${index}`} geometry={hardware} material={hardwareMaterial} />
      ))}
      
      {/* Labels */}
      {details.labels.map((label, index) => (
        <mesh key={`label-${index}`} geometry={label} material={labelMaterial} />
      ))}
      
      {/* Stitching details */}
      {details.stitching.map((stitch, index) => (
        <mesh key={`stitch-${index}`} geometry={stitch} material={stitchingMaterial} />
      ))}
    </group>
  );
};