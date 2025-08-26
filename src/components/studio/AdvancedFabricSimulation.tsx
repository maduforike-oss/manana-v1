import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Advanced Fabric Directionality & Anisotropy System
export const createAnisotropicFabricMaterial = (
  garmentType: string,
  color: string,
  designTexture?: THREE.Texture,
  fabricVariant: 'regular' | 'heather' | 'vintage' | 'performance' = 'regular'
): THREE.ShaderMaterial => {
  
  // Create fabric grain direction texture
  const createGrainTexture = (): THREE.DataTexture => {
    const size = 128;
    const data = new Uint8Array(size * size * 3);
    
    for (let i = 0; i < size * size; i++) {
      const x = i % size;
      const y = Math.floor(i / size);
      
      // Create directional grain pattern based on garment type
      let grainIntensity = 128;
      let directionX = 0;
      let directionY = 0;
      
      switch (garmentType) {
        case 'denim-jacket':
          // Twill weave pattern with diagonal grain
          grainIntensity = 128 + Math.sin((x + y) * 0.2) * 40;
          directionX = Math.cos(Math.PI / 4);
          directionY = Math.sin(Math.PI / 4);
          break;
        case 'performance':
          // Synthetic fiber with minimal grain
          grainIntensity = 128 + Math.sin(x * 0.8) * 5;
          directionX = 1;
          directionY = 0;
          break;
        case 'hoodie':
        case 'crewneck':
          // Fleece with random fiber direction
          grainIntensity = 128 + (Math.random() - 0.5) * 60;
          directionX = (Math.random() - 0.5) * 2;
          directionY = (Math.random() - 0.5) * 2;
          break;
        default:
          // Cotton jersey with horizontal stretch
          grainIntensity = 128 + Math.sin(x * 0.4) * 20;
          directionX = 1;
          directionY = 0.2;
      }
      
      // Apply fabric variant effects
      if (fabricVariant === 'heather') {
        grainIntensity += (Math.random() - 0.5) * 50;
      } else if (fabricVariant === 'vintage') {
        grainIntensity *= 0.8 + (Math.random() - 0.5) * 0.3;
      }
      
      grainIntensity = Math.max(0, Math.min(255, grainIntensity));
      
      // Store grain direction in RGB channels
      data[i * 3] = grainIntensity;
      data[i * 3 + 1] = ((directionX + 1) * 0.5) * 255; // Normalize to 0-255
      data[i * 3 + 2] = ((directionY + 1) * 0.5) * 255; // Normalize to 0-255
    }
    
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.needsUpdate = true;
    return texture;
  };

  // Create subsurface scattering texture
  const createSubsurfaceTexture = (): THREE.DataTexture => {
    const size = 64;
    const data = new Uint8Array(size * size * 3);
    
    for (let i = 0; i < size * size; i++) {
      const x = i % size;
      const y = Math.floor(i / size);
      
      let scatterIntensity = 128;
      
      switch (garmentType) {
        case 'performance':
          // Synthetic materials have minimal subsurface scattering
          scatterIntensity = 50;
          break;
        case 'hoodie':
        case 'crewneck':
          // Fleece has high subsurface scattering
          scatterIntensity = 180 + Math.sin(x * 0.3) * Math.cos(y * 0.3) * 20;
          break;
        default:
          // Cotton has moderate subsurface scattering
          scatterIntensity = 120 + Math.sin(x * 0.5) * 15;
      }
      
      scatterIntensity = Math.max(0, Math.min(255, scatterIntensity));
      data[i * 3] = scatterIntensity;
      data[i * 3 + 1] = scatterIntensity;
      data[i * 3 + 2] = scatterIntensity;
    }
    
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    texture.needsUpdate = true;
    return texture;
  };

  const grainTexture = createGrainTexture();
  const subsurfaceTexture = createSubsurfaceTexture();
  
  // Custom shader for advanced fabric simulation
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vViewPosition = -mvPosition.xyz;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  
  const fragmentShader = `
    uniform vec3 uColor;
    uniform sampler2D uDesignTexture;
    uniform sampler2D uGrainTexture;
    uniform sampler2D uSubsurfaceTexture;
    uniform bool uHasDesign;
    uniform float uTime;
    uniform float uRoughness;
    uniform float uMetalness;
    uniform vec3 uLightDirection;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    
    void main() {
      // Sample textures
      vec4 grainData = texture2D(uGrainTexture, vUv);
      vec3 subsurfaceData = texture2D(uSubsurfaceTexture, vUv).rgb;
      
      // Extract grain direction from texture
      vec2 grainDirection = vec2(
        (grainData.g - 0.5) * 2.0,
        (grainData.b - 0.5) * 2.0
      );
      
      // Base fabric color
      vec3 fabricColor = uColor;
      
      // Apply subsurface scattering effect
      float subsurfaceAmount = subsurfaceData.r / 255.0;
      vec3 lightDir = normalize(uLightDirection);
      float NdotL = dot(vNormal, lightDir);
      float subsurfaceScatter = pow(max(0.0, -NdotL), 2.0) * subsurfaceAmount * 0.3;
      fabricColor += subsurfaceScatter * vec3(0.8, 0.6, 0.4);
      
      // Anisotropic reflection
      vec3 viewDir = normalize(vViewPosition);
      vec3 halfDir = normalize(lightDir + viewDir);
      
      // Calculate anisotropic highlight based on grain direction
      vec3 tangent = normalize(cross(vNormal, vec3(grainDirection, 0.0)));
      vec3 bitangent = cross(vNormal, tangent);
      
      float TdotH = dot(tangent, halfDir);
      float BdotH = dot(bitangent, halfDir);
      float NdotH = dot(vNormal, halfDir);
      
      float anisotropicTerm = sqrt(max(0.0, NdotL)) * pow(max(0.0, NdotH), 
        (uRoughness * 128.0) / (1.0 + (TdotH * TdotH + BdotH * BdotH) * 0.1));
      
      fabricColor += anisotropicTerm * 0.1 * vec3(1.0);
      
      // Apply design texture if present
      if (uHasDesign) {
        vec4 designColor = texture2D(uDesignTexture, vUv);
        
        // Simulate ink absorption based on fabric type
        float inkAbsorption = mix(0.7, 0.95, grainData.r / 255.0);
        designColor.rgb = mix(fabricColor, designColor.rgb, designColor.a * inkAbsorption);
        
        fabricColor = mix(fabricColor, designColor.rgb, designColor.a);
      }
      
      // Add subtle fabric breathing animation
      float breathingEffect = sin(uTime * 2.0) * 0.005 + 1.0;
      fabricColor *= breathingEffect;
      
      // Apply fabric-specific color variations
      fabricColor += (grainData.r / 255.0 - 0.5) * 0.05;
      
      gl_FragColor = vec4(fabricColor, 1.0);
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uDesignTexture: { value: designTexture || null },
      uGrainTexture: { value: grainTexture },
      uSubsurfaceTexture: { value: subsurfaceTexture },
      uHasDesign: { value: !!designTexture },
      uTime: { value: 0 },
      uRoughness: { value: getFabricRoughness(garmentType, fabricVariant) },
      uMetalness: { value: getFabricMetalness(garmentType) },
      uLightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
    },
    vertexShader,
    fragmentShader,
    transparent: !!designTexture,
  });

  return material;
};

// Fabric-specific roughness values
const getFabricRoughness = (garmentType: string, variant: string): number => {
  let baseRoughness = 0.7;
  
  switch (garmentType) {
    case 'performance':
      baseRoughness = 0.2;
      break;
    case 'denim-jacket':
      baseRoughness = 0.8;
      break;
    case 'hoodie':
    case 'crewneck':
      baseRoughness = 0.9;
      break;
    case 'polo':
      baseRoughness = 0.6;
      break;
    case 'button-shirt':
      baseRoughness = 0.4;
      break;
  }
  
  if (variant === 'vintage') baseRoughness += 0.1;
  if (variant === 'heather') baseRoughness += 0.05;
  
  return Math.min(1.0, baseRoughness);
};

// Fabric-specific metalness values
const getFabricMetalness = (garmentType: string): number => {
  switch (garmentType) {
    case 'performance':
      return 0.15;
    case 'bomber':
      return 0.25;
    default:
      return 0.0;
  }
};

// Print Method Simulation
export const createPrintMethodTexture = (
  baseTexture: THREE.Texture,
  printMethod: 'screen-print' | 'dtg' | 'embroidery' | 'heat-transfer' | 'discharge'
): THREE.Texture => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return baseTexture;

  canvas.width = 512;
  canvas.height = 512;
  
  // Draw base texture
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return baseTexture;
  
  tempCanvas.width = 512;
  tempCanvas.height = 512;
  
  // Create image from texture
  const img = new Image();
  img.onload = () => {
    tempCtx.drawImage(img, 0, 0, 512, 512);
    const imageData = tempCtx.getImageData(0, 0, 512, 512);
    const data = imageData.data;
    
    // Apply print method effects
    switch (printMethod) {
      case 'screen-print':
        // Add slight texture and edge definition
        for (let i = 0; i < data.length; i += 4) {
          const noise = (Math.random() - 0.5) * 10;
          data[i] = Math.max(0, Math.min(255, data[i] + noise));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        break;
        
      case 'dtg':
        // Softer, more absorbed look
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.round(data[i] * 0.95);
          data[i + 1] = Math.round(data[i + 1] * 0.95);
          data[i + 2] = Math.round(data[i + 2] * 0.95);
        }
        break;
        
      case 'heat-transfer':
        // Slightly glossy appearance
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.1);
          data[i + 1] = Math.min(255, data[i + 1] * 1.1);
          data[i + 2] = Math.min(255, data[i + 2] * 1.1);
        }
        break;
        
      case 'discharge':
        // Vintage, washed-out effect
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.round(data[i] * 0.8 + 50);
          data[i + 1] = Math.round(data[i + 1] * 0.8 + 50);
          data[i + 2] = Math.round(data[i + 2] * 0.8 + 50);
        }
        break;
    }
    
    ctx.putImageData(imageData, 0, 0);
  };
  
  img.src = baseTexture.image.src;
  
  const newTexture = new THREE.CanvasTexture(canvas);
  newTexture.needsUpdate = true;
  return newTexture;
};

// Dynamic Fabric Properties Component
export const DynamicFabricProperties = ({ 
  material, 
  garmentType 
}: {
  material: THREE.ShaderMaterial;
  garmentType: string;
}) => {
  const timeRef = useRef(0);
  
  useFrame((state, delta) => {
    timeRef.current += delta;
    
    if (material.uniforms.uTime) {
      material.uniforms.uTime.value = timeRef.current;
    }
    
    // Simulate environmental effects
    const humidity = 0.5 + Math.sin(timeRef.current * 0.1) * 0.2;
    const temperature = 0.7 + Math.cos(timeRef.current * 0.05) * 0.3;
    
    // Adjust fabric properties based on environment
    if (material.uniforms.uRoughness) {
      const baseRoughness = getFabricRoughness(garmentType, 'regular');
      material.uniforms.uRoughness.value = baseRoughness + humidity * 0.1;
    }
  });
  
  return null;
};

// Fabric Movement & Physics
export const FabricPhysics = ({ 
  meshRef, 
  garmentType 
}: {
  meshRef: React.RefObject<THREE.Mesh>;
  garmentType: string;
}) => {
  const windRef = useRef({ x: 0, y: 0, z: 0 });
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Simulate subtle fabric movement
    const time = state.clock.elapsedTime;
    
    // Different movement patterns for different garments
    switch (garmentType) {
      case 'tote':
        // Gentle swaying for bags
        meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.02;
        break;
        
      case 'performance':
        // Minimal movement for athletic wear
        meshRef.current.position.y = Math.sin(time * 2) * 0.001;
        break;
        
      default:
        // Subtle breathing for regular fabrics
        const scale = 1 + Math.sin(time * 1.5) * 0.002;
        meshRef.current.scale.setScalar(scale);
    }
    
    // Wind effect for lightweight fabrics
    if (['tank', 'tote'].includes(garmentType)) {
      windRef.current.x = Math.sin(time * 0.3) * 0.01;
      meshRef.current.rotation.x += windRef.current.x * 0.1;
    }
  });
  
  return null;
};