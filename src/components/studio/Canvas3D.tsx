import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useStudioStore } from '../../lib/studio/store';

// Enhanced Garment 3D Components
const GarmentModel = ({ garmentType, garmentColor = '#ffffff', designTexture }: { 
  garmentType?: string; 
  garmentColor?: string; 
  designTexture?: THREE.Texture 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create garment-specific geometry
  const garmentGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    
    switch (garmentType) {
      case 'hoodie':
      case 'zip-hoodie':
      case 'pullover':
        // Hoodie/Sweatshirt shape with hood
        shape.moveTo(-1.4, -1.6);
        shape.lineTo(-1.4, 0.6);
        shape.lineTo(-1.6, 0.8);
        shape.lineTo(-1.6, 1.4);
        shape.lineTo(-0.9, 1.4);
        shape.lineTo(-0.9, 1.8); // Hood extension
        shape.lineTo(0.9, 1.8);
        shape.lineTo(0.9, 1.4);
        shape.lineTo(1.6, 1.4);
        shape.lineTo(1.6, 0.8);
        shape.lineTo(1.4, 0.6);
        shape.lineTo(1.4, -1.6);
        shape.lineTo(-1.4, -1.6);
        break;
        
      case 'tank':
        // Tank top shape - narrower sleeves
        shape.moveTo(-1.0, -1.5);
        shape.lineTo(-1.0, 0.8);
        shape.lineTo(-1.1, 1.0);
        shape.lineTo(-1.1, 1.3);
        shape.lineTo(-0.6, 1.3);
        shape.lineTo(-0.6, 1.5);
        shape.lineTo(0.6, 1.5);
        shape.lineTo(0.6, 1.3);
        shape.lineTo(1.1, 1.3);
        shape.lineTo(1.1, 1.0);
        shape.lineTo(1.0, 0.8);
        shape.lineTo(1.0, -1.5);
        shape.lineTo(-1.0, -1.5);
        break;
        
      case 'polo':
      case 'button-shirt':
        // Polo/Dress shirt with collar
        shape.moveTo(-1.2, -1.5);
        shape.lineTo(-1.2, 0.8);
        shape.lineTo(-1.5, 1.0);
        shape.lineTo(-1.5, 1.2);
        shape.lineTo(-0.8, 1.2);
        shape.lineTo(-0.8, 1.6); // Collar extension
        shape.lineTo(0.8, 1.6);
        shape.lineTo(0.8, 1.2);
        shape.lineTo(1.5, 1.2);
        shape.lineTo(1.5, 1.0);
        shape.lineTo(1.2, 0.8);
        shape.lineTo(1.2, -1.5);
        shape.lineTo(-1.2, -1.5);
        break;
        
      case 'long-sleeve-tee':
        // Long sleeve with extended arms
        shape.moveTo(-1.2, -1.5);
        shape.lineTo(-1.2, 0.8);
        shape.lineTo(-1.8, 1.0); // Extended sleeve
        shape.lineTo(-1.8, 1.3);
        shape.lineTo(-0.8, 1.3);
        shape.lineTo(-0.8, 1.5);
        shape.lineTo(0.8, 1.5);
        shape.lineTo(0.8, 1.3);
        shape.lineTo(1.8, 1.3);
        shape.lineTo(1.8, 1.0);
        shape.lineTo(1.2, 0.8);
        shape.lineTo(1.2, -1.5);
        shape.lineTo(-1.2, -1.5);
        break;
        
      default:
        // Default t-shirt shape
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
    }

    const extrudeSettings = {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 3,
      bevelSize: 0.03,
      bevelThickness: 0.02,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [garmentType]);

  // Create realistic fabric material
  const fabricMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: garmentColor,
      roughness: 0.85,
      metalness: 0.05,
    });
    
    // Add fabric-specific properties
    if (garmentType?.includes('hoodie') || garmentType === 'pullover') {
      material.roughness = 0.9; // Fleece texture
    } else if (garmentType === 'polo' || garmentType === 'button-shirt') {
      material.roughness = 0.7; // Smoother cotton
    } else if (garmentType === 'performance-shirt') {
      material.roughness = 0.3; // Synthetic performance material
      material.metalness = 0.1;
    }
    
    return material;
  }, [garmentColor, garmentType]);

  // Enhanced design material with better mapping
  const designMaterial = useMemo(() => {
    if (!designTexture) return null;
    
    return new THREE.MeshStandardMaterial({
      map: designTexture,
      transparent: true,
      alphaTest: 0.1,
      roughness: 0.8,
      metalness: 0.0,
    });
  }, [designTexture]);

  // Calculate design overlay size based on garment type
  const getDesignSize = (): [number, number] => {
    switch (garmentType) {
      case 'tank':
        return [1.2, 1.2];
      case 'hoodie':
      case 'zip-hoodie':
      case 'pullover':
        return [1.6, 1.6];
      case 'long-sleeve-tee':
        return [1.4, 1.4];
      default:
        return [1.5, 1.5];
    }
  };

  return (
    <group rotation={[0, 0, 0]}>
      {/* Main garment body */}
      <mesh ref={meshRef} geometry={garmentGeometry} material={fabricMaterial} />
      
      {/* Design overlay on front */}
      {designTexture && designMaterial && (
        <mesh position={[0, 0, 0.061]}>
          <planeGeometry args={getDesignSize()} />
          <primitive object={designMaterial} />
        </mesh>
      )}
    </group>
  );
};

// Hat/Cap 3D Component
const CapModel = ({ garmentColor = '#000000', designTexture }: { garmentColor?: string; designTexture?: THREE.Texture }) => {
  const capGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(0.8, 0.9, 0.3, 16);
    return geometry;
  }, []);

  const billGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(0.3, 0.4, 0.05, 16);
    return geometry;
  }, []);

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
    <group position={[0, 0.5, 0]}>
      {/* Cap crown */}
      <mesh geometry={capGeometry} material={fabricMaterial} />
      
      {/* Cap bill */}
      <mesh geometry={billGeometry} material={fabricMaterial} position={[0, -0.2, 0.5]} rotation={[-Math.PI / 6, 0, 0]} />
      
      {/* Design on front */}
      {designTexture && designMaterial && (
        <mesh position={[0, 0, 0.81]}>
          <planeGeometry args={[0.6, 0.4]} />
          <primitive object={designMaterial} />
        </mesh>
      )}
    </group>
  );
};

// Tote Bag 3D Component  
const ToteModel = ({ garmentColor = '#ffffff', designTexture }: { garmentColor?: string; designTexture?: THREE.Texture }) => {
  const bagGeometry = useMemo(() => {
    const geometry = new THREE.BoxGeometry(1.4, 1.6, 0.2);
    return geometry;
  }, []);

  const handleGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8);
    return geometry;
  }, []);

  const fabricMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: garmentColor,
      roughness: 0.9,
      metalness: 0.0,
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
      {/* Bag body */}
      <mesh geometry={bagGeometry} material={fabricMaterial} />
      
      {/* Handles */}
      <mesh geometry={handleGeometry} material={fabricMaterial} position={[-0.4, 1.0, 0]} rotation={[0, 0, Math.PI / 2]} />
      <mesh geometry={handleGeometry} material={fabricMaterial} position={[0.4, 1.0, 0]} rotation={[0, 0, Math.PI / 2]} />
      
      {/* Design on front */}
      {designTexture && designMaterial && (
        <mesh position={[0, 0, 0.11]}>
          <planeGeometry args={[1.2, 1.2]} />
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
  
  // Get garment info from canvas config
  const garmentType = doc.canvas.garmentType || 't-shirt';
  const garmentColor = doc.canvas.garmentColor || '#ffffff';

  // Render appropriate 3D model based on garment type
  const renderGarmentModel = () => {
    if (['cap', 'snapback', 'trucker-hat', 'beanie'].includes(garmentType)) {
      return <CapModel garmentColor={garmentColor} designTexture={designTexture} />;
    } else if (garmentType === 'tote') {
      return <ToteModel garmentColor={garmentColor} designTexture={designTexture} />;
    } else {
      // All apparel items (shirts, hoodies, etc.)
      return <GarmentModel garmentType={garmentType} garmentColor={garmentColor} designTexture={designTexture} />;
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-background to-muted">
      <Canvas shadows>
        <Suspense fallback={null}>
          {/* Camera with better positioning */}
          <PerspectiveCamera makeDefault position={[0, 0, 4]} />
          
          {/* Enhanced Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={1.5}
            maxDistance={10}
            target={[0, 0, 0]}
            autoRotate={false}
            enableDamping={true}
            dampingFactor={0.05}
          />
          
          {/* Professional Lighting Setup */}
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[5, 8, 5]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <directionalLight position={[-5, 5, 5]} intensity={0.6} />
          <directionalLight position={[0, -5, 2]} intensity={0.4} />
          
          {/* Studio Environment */}
          <Environment preset="studio" />
          
          {/* Render appropriate garment model */}
          {renderGarmentModel()}
          
          {/* Ground plane for shadows */}
          <mesh receiveShadow position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#f0f0f0" transparent opacity={0.5} />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  );
};