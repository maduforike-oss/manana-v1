import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useTexture, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useStudioStore } from '../../lib/studio/store';
import { 
  createFabricMaterial, 
  createTShirtGeometry, 
  createCapGeometry, 
  createJacketGeometry,
  DesignOverlay 
} from './Enhanced3DModels';
import { RealisticGarmentModel } from './RealisticGarmentModels';
import { DynamicFabricProperties } from './AdvancedFabricSimulation';
import { Professional3DLighting } from './Professional3DLighting';
import { Controls3DView } from './3DViewControls';
import { ProfessionalGarmentDetails } from './ProfessionalGarmentDetails';
import { AdvancedDesignMapping } from './AdvancedDesignMapping';
import { PerformanceMonitor, MaterialOptimizer } from './GarmentOptimization';

// Professional Enhanced Garment Component
const ProfessionalGarmentModel = ({ 
  garmentType, 
  garmentColor = '#ffffff', 
  designTexture 
}: { 
  garmentType?: string; 
  garmentColor?: string; 
  designTexture?: THREE.Texture 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create professional garment geometry
  const garmentGeometry = useMemo(() => {
    // Use jacket geometry for outerwear
    if (['denim-jacket', 'bomber'].includes(garmentType || '')) {
      return createJacketGeometry(garmentType!);
    }
    // Use standard enhanced geometry for apparel
    return createTShirtGeometry(garmentType || 't-shirt');
  }, [garmentType]);

  // Create professional fabric material with advanced simulation
  const fabricMaterial = useMemo(() => {
    return createFabricMaterial(
      garmentType || 't-shirt', 
      garmentColor, 
      designTexture, 
      'regular', 
      'screen-print'
    );
  }, [garmentColor, garmentType, designTexture]);

  // Subtle animation for realism
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.02;
    }
  });

  return (
    <group rotation={[0, 0, 0]}>
      {/* Main garment body with enhanced geometry */}
      <mesh 
        ref={meshRef} 
        geometry={garmentGeometry} 
        material={fabricMaterial}
        castShadow
        receiveShadow
      />
      
      {/* Professional design overlay with print method simulation */}
      {designTexture && (
        <DesignOverlay
          designTexture={designTexture}
          garmentType={garmentType || 't-shirt'}
          position={[0, 0, 0.076]}
          printMethod="screen-print"
        />
      )}
      
      {/* Dynamic fabric properties simulation */}
      {fabricMaterial instanceof THREE.ShaderMaterial && (
        <DynamicFabricProperties 
          material={fabricMaterial} 
          garmentType={garmentType || 't-shirt'} 
        />
      )}
      
      {/* Subtle fabric details */}
      {garmentType === 'hoodie' && (
        <mesh position={[0, -0.5, 0.08]}>
          <planeGeometry args={[0.8, 0.3]} />
          <meshStandardMaterial 
            color={garmentColor} 
            transparent 
            opacity={0.8}
            roughness={0.95}
          />
        </mesh>
      )}
    </group>
  );
};

// Professional Hat/Cap Component
const ProfessionalCapModel = ({ 
  garmentType = 'cap',
  garmentColor = '#000000', 
  designTexture 
}: { 
  garmentType?: string;
  garmentColor?: string; 
  designTexture?: THREE.Texture 
}) => {
  const meshRef = useRef<THREE.Group>(null);
  
  const capGeometry = useMemo(() => {
    if (garmentType === 'beanie') {
      const crown = new THREE.SphereGeometry(0.9, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.7);
      return { crown, bill: null };
    }
    return createCapGeometry(garmentType);
  }, [garmentType]);

  const fabricMaterial = useMemo(() => {
    return createFabricMaterial(garmentType, garmentColor, designTexture);
  }, [garmentColor, garmentType, designTexture]);

  // Subtle rotation animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.03;
    }
  });

  return (
    <group ref={meshRef} position={[0, 0.5, 0]}>
      {/* Cap crown */}
      <mesh geometry={capGeometry.crown} material={fabricMaterial} castShadow receiveShadow />
      
      {/* Cap bill (if not beanie) */}
      {capGeometry.bill && (
        <mesh 
          geometry={capGeometry.bill} 
          material={fabricMaterial} 
          position={[0, -0.2, 0.5]} 
          rotation={[-Math.PI / 6, 0, 0]}
          castShadow
          receiveShadow
        />
      )}
      
      {/* Professional design overlay */}
      {designTexture && (
        <DesignOverlay
          designTexture={designTexture}
          garmentType={garmentType}
          position={garmentType === 'beanie' ? [0, 0.2, 0.81] : [0, 0, 0.81]}
        />
      )}
    </group>
  );
};

// Professional Tote Bag Component
const ProfessionalToteModel = ({ 
  garmentColor = '#ffffff', 
  designTexture 
}: { 
  garmentColor?: string; 
  designTexture?: THREE.Texture 
}) => {
  const meshRef = useRef<THREE.Group>(null);
  
  const bagGeometry = useMemo(() => {
    // More realistic bag shape with slight taper
    const geometry = new THREE.BoxGeometry(1.4, 1.6, 0.2);
    geometry.scale(1, 1, 1);
    return geometry;
  }, []);

  const handleGeometry = useMemo(() => {
    const geometry = new THREE.TorusGeometry(0.6, 0.02, 6, 16, Math.PI);
    return geometry;
  }, []);

  const fabricMaterial = useMemo(() => {
    return createFabricMaterial('tote', garmentColor, designTexture);
  }, [garmentColor, designTexture]);

  // Gentle swaying animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.01;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Bag body with realistic proportions */}
      <mesh geometry={bagGeometry} material={fabricMaterial} castShadow receiveShadow />
      
      {/* Professional handles */}
      <mesh 
        geometry={handleGeometry} 
        material={fabricMaterial} 
        position={[-0.4, 1.0, 0]} 
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      />
      <mesh 
        geometry={handleGeometry} 
        material={fabricMaterial} 
        position={[0.4, 1.0, 0]} 
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      />
      
      {/* Professional design overlay */}
      {designTexture && (
        <DesignOverlay
          designTexture={designTexture}
          garmentType="tote"
          position={[0, 0, 0.11]}
        />
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
  const [lightingPreset, setLightingPreset] = React.useState<'studio' | 'outdoor' | 'product' | 'dramatic'>('studio');
  const [showWireframe, setShowWireframe] = React.useState(false);
  
  // Get garment info from canvas config
  const garmentType = doc.canvas.garmentType || 't-shirt';
  const garmentColor = doc.canvas.garmentColor || '#ffffff';

  // Render realistic garment model with professional accuracy and details
  const renderGarmentModel = () => {
    console.log('Rendering garment model:', { garmentType, garmentColor });
    
    return (
      <group>
        {/* Main garment model */}
        <RealisticGarmentModel
          garmentType={garmentType}
          garmentColor={garmentColor}
          designTexture={designTexture}
        />
        
        {/* Professional construction details */}
        <ProfessionalGarmentDetails
          garmentType={garmentType}
          garmentColor={garmentColor}
        />
      </group>
    );
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-background to-muted/20">
      <Canvas 
        shadows={{ 
          type: THREE.PCFSoftShadowMap,
          enabled: true 
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Suspense fallback={null}>
          {/* Professional Camera Setup */}
          <PerspectiveCamera 
            makeDefault 
            position={[0, 0, 5]} 
            fov={45}
            near={0.1}
            far={1000}
          />
          
          {/* Enhanced Professional Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={12}
            maxPolarAngle={Math.PI * 0.8}
            minPolarAngle={Math.PI * 0.1}
            target={[0, 0, 0]}
            autoRotate={false}
            enableDamping={true}
            dampingFactor={0.03}
            rotateSpeed={0.5}
            zoomSpeed={0.8}
          />
          
          {/* Professional Lighting System */}
          <Professional3DLighting preset={lightingPreset} intensity={1.0} />
          
          {/* Render appropriate professional garment model */}
          {renderGarmentModel()}
          
          {/* Performance monitoring */}
          <PerformanceMonitor />
          
          {/* Professional ground setup */}
          <mesh 
            receiveShadow 
            position={[0, -2.5, 0]} 
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial 
              color="#f8f8f8" 
              roughness={0.8}
              metalness={0.1}
              transparent 
              opacity={0.6} 
            />
          </mesh>
        </Suspense>
      </Canvas>
      
      {/* Professional 3D Controls */}
      <Controls3DView
        lightingPreset={lightingPreset}
        onLightingChange={setLightingPreset}
        showWireframe={showWireframe}
        onWireframeToggle={() => setShowWireframe(!showWireframe)}
      />
    </div>
  );
};