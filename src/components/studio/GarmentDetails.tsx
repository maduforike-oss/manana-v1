import React from 'react';
import * as THREE from 'three';

// Professional garment detailing system
export const createGarmentDetails = (garmentType: string, color: string) => {
  const details: JSX.Element[] = [];
  
  const seamMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color).multiplyScalar(0.8), // Darker for seams
    roughness: 0.9,
    metalness: 0.0
  });

  const stitchingMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#f4f4f4'),
    roughness: 0.8,
    metalness: 0.0
  });

  switch (garmentType) {
    case 'tshirt':
    case 'tank':
    case 'vneck':
    case 'womens-tee':
    case 'womens-tank':
      // Shoulder seams
      details.push(
        <mesh key="left-shoulder-seam" position={[-1.2, 1.3, 0.06]}>
          <cylinderGeometry args={[0.008, 0.008, 0.4]} />
          <primitive object={seamMaterial} />
        </mesh>
      );
      details.push(
        <mesh key="right-shoulder-seam" position={[1.2, 1.3, 0.06]}>
          <cylinderGeometry args={[0.008, 0.008, 0.4]} />
          <primitive object={seamMaterial} />
        </mesh>
      );
      
      // Side seams
      details.push(
        <mesh key="left-side-seam" position={[-1.3, 0, 0.06]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.006, 0.006, 3.0]} />
          <primitive object={seamMaterial} />
        </mesh>
      );
      details.push(
        <mesh key="right-side-seam" position={[1.3, 0, 0.06]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.006, 0.006, 3.0]} />
          <primitive object={seamMaterial} />
        </mesh>
      );
      
      // Hem stitching
      details.push(
        <mesh key="bottom-hem" position={[0, -1.48, 0.06]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.004, 0.004, 2.6]} />
          <primitive object={stitchingMaterial} />
        </mesh>
      );
      break;

    case 'hoodie':
    case 'zip-hoodie':
    case 'pullover':
      // Hood seam
      details.push(
        <mesh key="hood-seam" position={[0, 1.8, 0.1]}>
          <torusGeometry args={[0.6, 0.01, 8, 16]} />
          <primitive object={seamMaterial} />
        </mesh>
      );
      
      // Kangaroo pocket outline
      details.push(
        <mesh key="kangaroo-pocket" position={[0, -0.3, 0.12]}>
          <ringGeometry args={[0.4, 0.42, 16]} />
          <primitive object={stitchingMaterial} />
        </mesh>
      );
      
      // Drawstring eyelets
      details.push(
        <mesh key="left-eyelet" position={[-0.15, 1.6, 0.13]}>
          <ringGeometry args={[0.02, 0.025, 8]} />
          <primitive object={new THREE.MeshStandardMaterial({ color: '#333', metalness: 0.8 })} />
        </mesh>
      );
      details.push(
        <mesh key="right-eyelet" position={[0.15, 1.6, 0.13]}>
          <ringGeometry args={[0.02, 0.025, 8]} />
          <primitive object={new THREE.MeshStandardMaterial({ color: '#333', metalness: 0.8 })} />
        </mesh>
      );
      break;

    case 'polo':
      // Collar band
      details.push(
        <mesh key="collar-band" position={[0, 1.45, 0.08]}>
          <torusGeometry args={[0.35, 0.02, 8, 16, Math.PI]} />
          <primitive object={seamMaterial} />
        </mesh>
      );
      
      // Button placket
      details.push(
        <mesh key="button-placket" position={[0, 1.2, 0.12]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.008, 0.008, 0.6]} />
          <primitive object={stitchingMaterial} />
        </mesh>
      );
      
      // Buttons
      for (let i = 0; i < 3; i++) {
        details.push(
          <mesh key={`button-${i}`} position={[0, 1.4 - i * 0.15, 0.13]}>
            <cylinderGeometry args={[0.015, 0.015, 0.005]} />
            <primitive object={new THREE.MeshStandardMaterial({ 
              color: garmentType === 'polo' ? '#f8f8f8' : color,
              roughness: 0.3,
              metalness: 0.1 
            })} />
          </mesh>
        );
      }
      
      // Side vents
      details.push(
        <mesh key="left-vent" position={[-1.32, -1.45, 0.06]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.004, 0.004, 0.08]} />
          <primitive object={stitchingMaterial} />
        </mesh>
      );
      details.push(
        <mesh key="right-vent" position={[1.32, -1.45, 0.06]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.004, 0.004, 0.08]} />
          <primitive object={stitchingMaterial} />
        </mesh>
      );
      break;

    case 'button-shirt':
      // Full button placket
      details.push(
        <mesh key="button-placket" position={[0, 0, 0.12]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.01, 0.01, 3.3]} />
          <primitive object={stitchingMaterial} />
        </mesh>
      );
      
      // Collar band
      details.push(
        <mesh key="collar-band" position={[0, 1.55, 0.08]}>
          <torusGeometry args={[0.4, 0.025, 8, 16, Math.PI]} />
          <primitive object={seamMaterial} />
        </mesh>
      );
      
      // Buttons (7 buttons for full shirt)
      for (let i = 0; i < 7; i++) {
        details.push(
          <mesh key={`button-${i}`} position={[0, 1.5 - i * 0.4, 0.13]}>
            <cylinderGeometry args={[0.018, 0.018, 0.006]} />
            <primitive object={new THREE.MeshStandardMaterial({ 
              color: '#f8f8f8',
              roughness: 0.2,
              metalness: 0.1 
            })} />
          </mesh>
        );
      }
      
      // Cuff details
      details.push(
        <mesh key="left-cuff" position={[-2.0, 0.6, 0.08]}>
          <cylinderGeometry args={[0.006, 0.006, 0.3]} />
          <primitive object={stitchingMaterial} />
        </mesh>
      );
      details.push(
        <mesh key="right-cuff" position={[2.0, 0.6, 0.08]}>
          <cylinderGeometry args={[0.006, 0.006, 0.3]} />
          <primitive object={stitchingMaterial} />
        </mesh>
      );
      break;

    case 'performance':
      // Athletic side panels
      details.push(
        <mesh key="left-panel" position={[-1.15, 0, 0.08]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.005, 0.005, 3.0]} />
          <primitive object={new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(color).multiplyScalar(0.7),
            roughness: 0.4,
            metalness: 0.2 
          })} />
        </mesh>
      );
      details.push(
        <mesh key="right-panel" position={[1.15, 0, 0.08]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.005, 0.005, 3.0]} />
          <primitive object={new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(color).multiplyScalar(0.7),
            roughness: 0.4,
            metalness: 0.2 
          })} />
        </mesh>
      );
      break;
  }

  return details;
};

// Enhanced label and tag system
export const createGarmentLabels = (garmentType: string) => {
  const labels: JSX.Element[] = [];
  
  // Neck label
  labels.push(
    <mesh key="neck-label" position={[0, 1.3, -0.06]} rotation={[0, 0, 0]}>
      <planeGeometry args={[0.3, 0.08]} />
      <meshStandardMaterial 
        color="#f8f8f8" 
        roughness={0.8}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
  
  // Size tag (inside)
  labels.push(
    <mesh key="size-tag" position={[-0.8, 1.2, -0.08]} rotation={[0, 0, 0]}>
      <planeGeometry args={[0.15, 0.05]} />
      <meshStandardMaterial 
        color="#e8e8e8" 
        roughness={0.9}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
  
  return labels;
};