import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useStudioStore } from '../../lib/studio/store';

// T-Shirt 3D Geometry Component
const TShirt = ({ garmentColor = '#ffffff', designTexture }: { garmentColor?: string; designTexture?: THREE.Texture }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create t-shirt geometry using basic shapes
  const tshirtGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    
    // Main body of t-shirt
    shape.moveTo(-1.2, -1.5);
    shape.lineTo(-1.2, 0.8);
    shape.lineTo(-1.5, 1.0);
    shape.lineTo(-1.5, 1.2);
    shape.lineTo(-0.8, 1.2);
    shape.lineTo(-0.8, 1.5);
    shape.lineTo(0.8, 1.5);
    shape.lineTo(0.8, 1.2);
    shape.lineTo(1.5, 1.2);
    shape.lineTo(1.5, 1.0);
    shape.lineTo(1.2, 0.8);
    shape.lineTo(1.2, -1.5);
    shape.lineTo(-1.2, -1.5);

    const extrudeSettings = {
      depth: 0.1,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // Create materials
  const fabricMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: garmentColor,
      roughness: 0.8,
      metalness: 0.1,
    });
  }, [garmentColor]);

  const designMaterial = useMemo(() => {
    if (!designTexture) return null;
    
    return new THREE.MeshStandardMaterial({
      map: designTexture,
      transparent: true,
      alphaTest: 0.1,
    });
  }, [designTexture]);

  return (
    <group>
      {/* Main t-shirt body */}
      <mesh ref={meshRef} geometry={tshirtGeometry} material={fabricMaterial} />
      
      {/* Design overlay on front */}
      {designTexture && designMaterial && (
        <mesh position={[0, 0, 0.051]}>
          <planeGeometry args={[1.5, 1.5]} />
          <primitive object={designMaterial} />
        </mesh>
      )}
    </group>
  );
};

// Design Texture Generator
const useDesignTexture = () => {
  const { doc } = useStudioStore();
  
  return useMemo(() => {
    if (doc.nodes.length === 0) return null;

    // Create a canvas to render the design
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    // Clear canvas
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, 512, 512);

    // Render each design node
    doc.nodes.forEach(node => {
      ctx.save();
      
      // Apply transformations
      const centerX = node.x + node.width / 2;
      const centerY = node.y + node.height / 2;
      
      ctx.translate(centerX, centerY);
      ctx.rotate((node.rotation * Math.PI) / 180);
      ctx.globalAlpha = node.opacity;
      
      if (node.type === 'text') {
        const textNode = node as any;
        ctx.fillStyle = textNode.fill?.color || '#000000';
        ctx.font = `${textNode.fontSize}px ${textNode.fontFamily}`;
        ctx.textAlign = textNode.align;
        ctx.fillText(textNode.text, -node.width / 2, -node.height / 2);
      } else if (node.type === 'shape') {
        const shapeNode = node as any;
        ctx.fillStyle = shapeNode.fill?.color || '#000000';
        
        if (shapeNode.shape === 'rect') {
          ctx.fillRect(-node.width / 2, -node.height / 2, node.width, node.height);
        } else if (shapeNode.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, node.width / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      ctx.restore();
    });

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
  }, [doc.nodes]);
};

export const Canvas3D = () => {
  const { doc } = useStudioStore();
  const designTexture = useDesignTexture();
  
  // Get garment color from canvas config
  const garmentColor = doc.canvas.garmentColor || '#ffffff';

  return (
    <div className="w-full h-full bg-gradient-to-b from-background to-muted">
      <Canvas>
        <Suspense fallback={null}>
          {/* Camera */}
          <PerspectiveCamera makeDefault position={[0, 0, 4]} />
          
          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={8}
            target={[0, 0, 0]}
          />
          
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
          <directionalLight position={[-5, 5, 5]} intensity={0.4} />
          
          {/* Environment */}
          <Environment preset="studio" />
          
          {/* T-Shirt */}
          <TShirt garmentColor={garmentColor} designTexture={designTexture} />
        </Suspense>
      </Canvas>
    </div>
  );
};