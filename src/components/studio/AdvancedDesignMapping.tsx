import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface AdvancedDesignMappingProps {
  designTexture?: THREE.Texture;
  garmentType: string;
  garmentGeometry: THREE.BufferGeometry;
  printAreas?: Array<{
    name: string;
    position: THREE.Vector3;
    scale: THREE.Vector2;
    rotation: number;
    curvature: number;
  }>;
}

export const AdvancedDesignMapping = ({ 
  designTexture, 
  garmentType, 
  garmentGeometry,
  printAreas = []
}: AdvancedDesignMappingProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Calculate optimal print areas based on garment type
  const getDefaultPrintAreas = useMemo(() => {
    switch (garmentType) {
      case 'tshirt':
      case 'tank':
      case 'vneck':
      case 'womens-tee':
      case 'womens-tank':
        return [
          {
            name: 'front-chest',
            position: new THREE.Vector3(0, 0.3, 0.12),
            scale: new THREE.Vector2(1.2, 1.2),
            rotation: 0,
            curvature: 0.1
          },
          {
            name: 'back-center',
            position: new THREE.Vector3(0, 0.2, -0.12),
            scale: new THREE.Vector2(1.4, 1.4),
            rotation: 0,
            curvature: 0.05
          }
        ];
        
      case 'hoodie':
      case 'zip-hoodie':
      case 'pullover':
        return [
          {
            name: 'front-chest',
            position: new THREE.Vector3(0, 0.4, 0.12),
            scale: new THREE.Vector2(1.0, 1.0),
            rotation: 0,
            curvature: 0.12
          },
          {
            name: 'back-center',
            position: new THREE.Vector3(0, 0.3, -0.12),
            scale: new THREE.Vector2(1.6, 1.6),
            rotation: 0,
            curvature: 0.08
          },
          {
            name: 'left-sleeve',
            position: new THREE.Vector3(-1.8, 1.0, 0),
            scale: new THREE.Vector2(0.4, 0.8),
            rotation: Math.PI / 2,
            curvature: 0.3
          },
          {
            name: 'right-sleeve',
            position: new THREE.Vector3(1.8, 1.0, 0),
            scale: new THREE.Vector2(0.4, 0.8),
            rotation: -Math.PI / 2,
            curvature: 0.3
          }
        ];
        
      case 'polo':
        return [
          {
            name: 'front-chest',
            position: new THREE.Vector3(0, 0.2, 0.12),
            scale: new THREE.Vector2(1.0, 1.0),
            rotation: 0,
            curvature: 0.1
          },
          {
            name: 'back-center',
            position: new THREE.Vector3(0, 0.1, -0.12),
            scale: new THREE.Vector2(1.2, 1.2),
            rotation: 0,
            curvature: 0.05
          },
          {
            name: 'left-sleeve',
            position: new THREE.Vector3(-1.6, 1.0, 0),
            scale: new THREE.Vector2(0.3, 0.6),
            rotation: Math.PI / 2,
            curvature: 0.25
          },
          {
            name: 'right-sleeve',
            position: new THREE.Vector3(1.6, 1.0, 0),
            scale: new THREE.Vector2(0.3, 0.6),
            rotation: -Math.PI / 2,
            curvature: 0.25
          }
        ];
        
      case 'button-shirt':
        return [
          {
            name: 'front-left',
            position: new THREE.Vector3(-0.3, 0.2, 0.12),
            scale: new THREE.Vector2(0.8, 1.0),
            rotation: 0,
            curvature: 0.08
          },
          {
            name: 'front-right',
            position: new THREE.Vector3(0.3, 0.2, 0.12),
            scale: new THREE.Vector2(0.8, 1.0),
            rotation: 0,
            curvature: 0.08
          },
          {
            name: 'back-center',
            position: new THREE.Vector3(0, 0.1, -0.12),
            scale: new THREE.Vector2(1.3, 1.3),
            rotation: 0,
            curvature: 0.05
          }
        ];
        
      default:
        return [
          {
            name: 'front-center',
            position: new THREE.Vector3(0, 0.2, 0.12),
            scale: new THREE.Vector2(1.2, 1.2),
            rotation: 0,
            curvature: 0.1
          }
        ];
    }
  }, [garmentType]);

  const activePrintAreas = printAreas.length > 0 ? printAreas : getDefaultPrintAreas;

  // Create curved design projection shader
  const createCurvedProjectionMaterial = (area: typeof activePrintAreas[0]) => {
    return new THREE.ShaderMaterial({
      uniforms: {
        map: { value: designTexture },
        curvature: { value: area.curvature },
        opacity: { value: designTexture ? 0.95 : 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float curvature;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          // Apply curvature to UV coordinates
          vec2 centeredUv = uv - 0.5;
          float distance = length(centeredUv);
          vec2 curvedUv = centeredUv * (1.0 + curvature * distance * distance);
          vUv = curvedUv + 0.5;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform float opacity;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          // Check if UV is within bounds
          if (vUv.x < 0.0 || vUv.x > 1.0 || vUv.y < 0.0 || vUv.y > 1.0) {
            discard;
          }
          
          vec4 texColor = texture2D(map, vUv);
          
          // Add subtle edge fade
          float edgeFade = 1.0;
          float edgeWidth = 0.05;
          edgeFade *= smoothstep(0.0, edgeWidth, vUv.x);
          edgeFade *= smoothstep(0.0, edgeWidth, vUv.y);
          edgeFade *= smoothstep(0.0, edgeWidth, 1.0 - vUv.x);
          edgeFade *= smoothstep(0.0, edgeWidth, 1.0 - vUv.y);
          
          gl_FragColor = vec4(texColor.rgb, texColor.a * opacity * edgeFade);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
  };

  // Animate subtle design movement
  useFrame((state) => {
    if (meshRef.current && designTexture) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.z = 0.12 + Math.sin(time * 2) * 0.002;
    }
  });

  if (!designTexture) return null;

  return (
    <group>
      {activePrintAreas.map((area, index) => (
        <mesh
          key={`design-area-${area.name}-${index}`}
          ref={index === 0 ? meshRef : null}
          position={area.position}
          rotation={[0, 0, area.rotation]}
          scale={[area.scale.x, area.scale.y, 1]}
        >
          <planeGeometry args={[1, 1, 16, 16]} />
          <primitive object={createCurvedProjectionMaterial(area)} />
        </mesh>
      ))}
      
      {/* Print area boundaries (helper) */}
      {activePrintAreas.map((area, index) => (
        <mesh
          key={`print-boundary-${area.name}-${index}`}
          position={[area.position.x, area.position.y, area.position.z - 0.001]}
          rotation={[0, 0, area.rotation]}
          scale={[area.scale.x, area.scale.y, 1]}
        >
          <ringGeometry args={[0.48, 0.5, 32]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

// Enhanced design texture generation with print method simulation
export const createPrintMethodTexture = (
  baseTexture: THREE.Texture,
  printMethod: 'screen-print' | 'dtg' | 'embroidery' | 'vinyl' = 'screen-print'
): THREE.Texture => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = baseTexture.image.width;
  canvas.height = baseTexture.image.height;
  
  // Draw base texture
  ctx.drawImage(baseTexture.image, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  switch (printMethod) {
    case 'screen-print':
      // Add slight texture and opacity variation for screen print
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 10;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
      }
      break;
      
    case 'dtg':
      // Softer, more saturated look for DTG
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.max(0, Math.min(255, data[i] * 1.1));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * 1.1));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * 1.1));
        data[i + 3] = Math.max(0, Math.min(255, data[i + 3] * 0.95));
      }
      break;
      
    case 'embroidery':
      // Add thread-like texture for embroidery
      for (let y = 0; y < canvas.height; y += 2) {
        for (let x = 0; x < canvas.width; x += 2) {
          const i = (y * canvas.width + x) * 4;
          if (data[i + 3] > 0) {
            const brightness = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 20;
            data[i] = Math.max(0, Math.min(255, data[i] + brightness));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightness));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightness));
          }
        }
      }
      break;
      
    case 'vinyl':
      // Clean, solid look for vinyl
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 128) {
          data[i + 3] = 255; // Full opacity
        } else {
          data[i + 3] = 0; // Transparent
        }
      }
      break;
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};