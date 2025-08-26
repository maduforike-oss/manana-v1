import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MeshStandardMaterial, DoubleSide } from 'three';
import { 
  createAnisotropicFabricMaterial, 
  createPrintMethodTexture,
  DynamicFabricProperties,
  FabricPhysics 
} from './AdvancedFabricSimulation';

// Enhanced fabric material system with advanced simulation
export const createFabricMaterial = (
  garmentType: string, 
  color: string, 
  designTexture?: THREE.Texture,
  fabricVariant: 'regular' | 'heather' | 'vintage' | 'performance' = 'regular',
  printMethod?: 'screen-print' | 'dtg' | 'embroidery' | 'heat-transfer' | 'discharge'
): THREE.ShaderMaterial | THREE.MeshStandardMaterial => {
  
  // Use advanced anisotropic material for premium fabrics
  if (['performance', 'denim-jacket', 'hoodie', 'polo'].includes(garmentType)) {
    let processedTexture = designTexture;
    
    // Apply print method effects if specified
    if (designTexture && printMethod) {
      processedTexture = createPrintMethodTexture(designTexture, printMethod);
    }
    
    return createAnisotropicFabricMaterial(garmentType, color, processedTexture, fabricVariant);
  }
  
  // Fallback to standard material for basic garments
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    map: designTexture,
    transparent: !!designTexture,
    side: DoubleSide,
  });

  // Create fabric-specific micro-textures
  const createFabricTexture = (type: string): THREE.DataTexture => {
    const size = 64;
    const data = new Uint8Array(size * size * 3);
    
    for (let i = 0; i < size * size; i++) {
      const x = i % size;
      const y = Math.floor(i / size);
      let intensity = 128;
      
      switch (type) {
        case 'cotton':
          // Cotton weave pattern
          intensity = 128 + Math.sin(x * 0.5) * Math.cos(y * 0.5) * 20;
          if (fabricVariant === 'heather') {
            intensity += (Math.random() - 0.5) * 40;
          }
          break;
        case 'fleece':
          // Fleece texture
          intensity = 128 + (Math.random() - 0.5) * 60;
          break;
        case 'pique':
          // Pique knit pattern
          intensity = 128 + Math.sin(x * 0.3) * Math.sin(y * 0.3) * 30;
          break;
        case 'denim':
          // Denim twill pattern
          intensity = 128 + Math.sin((x + y) * 0.4) * 25;
          break;
        case 'performance':
          // Smooth athletic fabric
          intensity = 128 + Math.sin(x * 0.8) * Math.cos(y * 0.8) * 10;
          break;
      }
      
      intensity = Math.max(0, Math.min(255, intensity));
      data[i * 3] = intensity;
      data[i * 3 + 1] = intensity;
      data[i * 3 + 2] = intensity;
    }
    
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    texture.needsUpdate = true;
    return texture;
  };

  // Apply fabric-specific properties
  switch (garmentType) {
    case 'tshirt':
    case 'tank':
    case 'vneck':
    case 'womens-tee':
    case 'womens-tank':
      // Cotton jersey properties
      material.roughness = fabricVariant === 'vintage' ? 0.9 : 0.8;
      material.metalness = 0.0;
      material.normalMap = createFabricTexture('cotton');
      material.normalScale = new THREE.Vector2(0.3, 0.3);
      if (fabricVariant === 'heather') {
        material.roughness = 0.85;
      }
      break;
      
    case 'hoodie':
    case 'crewneck':
    case 'zip-hoodie':
    case 'pullover':
      // Fleece/cotton blend properties
      material.roughness = 0.9;
      material.metalness = 0.0;
      material.normalMap = createFabricTexture('fleece');
      material.normalScale = new THREE.Vector2(0.5, 0.5);
      break;
      
    case 'polo':
      // Pique cotton properties
      material.roughness = 0.7;
      material.metalness = 0.0;
      material.normalMap = createFabricTexture('pique');
      material.normalScale = new THREE.Vector2(0.4, 0.4);
      break;
      
    case 'performance':
      // Performance fabric properties
      material.roughness = 0.5;
      material.metalness = 0.1;
      material.normalMap = createFabricTexture('performance');
      material.normalScale = new THREE.Vector2(0.2, 0.2);
      break;
      
    case 'denim-jacket':
      // Denim properties
      material.roughness = 0.8;
      material.metalness = 0.0;
      material.normalMap = createFabricTexture('denim');
      material.normalScale = new THREE.Vector2(0.6, 0.6);
      break;
      
    case 'bomber':
      // Nylon/polyester properties
      material.roughness = 0.3;
      material.metalness = 0.2;
      material.normalScale = new THREE.Vector2(0.1, 0.1);
      break;
      
    case 'button-shirt':
      // Cotton poplin/oxford properties
      material.roughness = 0.6;
      material.metalness = 0.0;
      material.normalMap = createFabricTexture('cotton');
      material.normalScale = new THREE.Vector2(0.2, 0.2);
      break;
      
    default:
      material.roughness = 0.7;
      material.metalness = 0.0;
      material.normalMap = createFabricTexture('cotton');
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
  scale = 1,
  printMethod = 'screen-print'
}: {
  designTexture: THREE.Texture;
  garmentType: string;
  position?: [number, number, number];
  scale?: number;
  printMethod?: 'screen-print' | 'dtg' | 'embroidery' | 'heat-transfer' | 'discharge';
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

  // Enhanced design material with print method simulation
  const designMaterial = useMemo(() => {
    // Apply print method effects to texture
    const processedTexture = createPrintMethodTexture(designTexture, printMethod);
    
    const material = new MeshStandardMaterial({
      map: processedTexture,
      transparent: true,
      alphaTest: 0.1,
      roughness: getPrintMethodRoughness(printMethod),
      metalness: getPrintMethodMetalness(printMethod),
    });
    
    // Enhanced shader for print method integration
    material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <output_fragment>',
        `
        #include <output_fragment>
        // Print method specific effects
        ${getPrintMethodShaderCode(printMethod)}
        `
      );
    };
    
    return material;
  }, [designTexture, printMethod]);

  // Subtle animation for realism
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.z = position[2] + Math.sin(state.clock.elapsedTime * 0.5) * 0.002;
    }
  });

  const [width, height] = getDesignDimensions();

  return (
    <group>
      <mesh ref={meshRef} position={position}>
        <planeGeometry args={[width, height]} />
        <primitive object={designMaterial} />
      </mesh>
      
      {/* Add fabric physics simulation */}
      <FabricPhysics meshRef={meshRef} garmentType={garmentType} />
    </group>
  );
};

// Print method specific material properties
const getPrintMethodRoughness = (printMethod: string): number => {
  switch (printMethod) {
    case 'screen-print': return 0.7;
    case 'dtg': return 0.8;
    case 'embroidery': return 0.9;
    case 'heat-transfer': return 0.3;
    case 'discharge': return 0.85;
    default: return 0.7;
  }
};

const getPrintMethodMetalness = (printMethod: string): number => {
  switch (printMethod) {
    case 'heat-transfer': return 0.1;
    case 'embroidery': return 0.05;
    default: return 0.0;
  }
};

const getPrintMethodShaderCode = (printMethod: string): string => {
  switch (printMethod) {
    case 'screen-print':
      return `
        // Add slight texture variation for screen print
        gl_FragColor.rgb += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.02;
      `;
    case 'heat-transfer':
      return `
        // Add subtle glossy effect for heat transfer
        gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * 1.2, 0.1);
      `;
    case 'discharge':
      return `
        // Add vintage fade effect for discharge printing
        gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.9), 0.15);
      `;
    default:
      return '// Default print method';
  }
};