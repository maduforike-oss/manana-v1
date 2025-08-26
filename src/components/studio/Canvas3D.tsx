import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useStudioStore } from '../../lib/studio/store';
import { RealisticGarmentModel } from './RealisticGarmentModels';
import { Professional3DLighting } from './Professional3DLighting';
import { Controls3DView } from './3DViewControls';
import { ProfessionalGarmentDetails } from './ProfessionalGarmentDetails';
import { SimplePerformanceMonitor } from './SimpleLODSystem';
import { MaterialOptimizer } from './MaterialOptimizer';
import { ViewportManager } from '../../lib/studio/garmentScaling';
import { ViewportHelpers } from './ViewportHelpers';
import { AdvancedViewportControls } from './AdvancedViewportControls';
import { useViewportState } from '../../hooks/useViewportState';

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

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, 512, 512);

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
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    return texture;
  }, [doc.nodes]);
};

// Standardized Garment Scene with proper scaling
const StandardizedGarmentScene: React.FC<{
  garmentType: string;
  garmentColor: string;
  designTexture?: THREE.Texture;
}> = ({ garmentType, garmentColor, designTexture }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Get standardized positioning and scale
  const garmentBounds = useMemo(() => 
    ViewportManager.getGarmentBounds(garmentType), [garmentType]
  );
  
  const anchorPosition = useMemo(() => 
    ViewportManager.getAnchorPosition(garmentType, garmentBounds), [garmentType, garmentBounds]
  );
  
  const currentScale = useMemo(() => 
    ViewportManager.getCurrentScale(garmentType), [garmentType]
  );

  return (
    <group ref={groupRef}>
      {/* Standardized, centered garment model */}
      <group 
        position={anchorPosition}
        scale={[currentScale, currentScale, currentScale]}
      >
        <RealisticGarmentModel
          garmentType={garmentType}
          garmentColor={garmentColor}
          designTexture={designTexture}
        />
        
        <ProfessionalGarmentDetails
          garmentType={garmentType}
          garmentColor={garmentColor}
        />
      </group>
    </group>
  );
};

export const Canvas3D = () => {
  const { doc } = useStudioStore();
  const designTexture = useDesignTexture();
  const [lightingPreset, setLightingPreset] = React.useState<'studio' | 'outdoor' | 'product' | 'dramatic'>('studio');
  const [showWireframe, setShowWireframe] = React.useState(false);
  
  // Advanced viewport state
  const viewportState = useViewportState({
    showGrid: true,
    snapToGrid: true
  });
  
  // Get garment info from canvas config
  const garmentType = doc.canvas.garmentType || 't-shirt';
  const garmentColor = doc.canvas.garmentColor || '#ffffff';
  
  // Get responsive camera settings based on garment type
  const cameraSettings = useMemo(() => {
    const viewportSize = { width: window.innerWidth, height: window.innerHeight };
    return ViewportManager.calculateCameraPosition(garmentType, viewportSize);
  }, [garmentType]);

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
          {/* Responsive Camera Setup */}
          <PerspectiveCamera 
            makeDefault 
            position={cameraSettings.position}
            fov={cameraSettings.fov}
            near={cameraSettings.near}
            far={cameraSettings.far}
          />
          
          {/* Enhanced Responsive Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={cameraSettings.minDistance}
            maxDistance={cameraSettings.maxDistance}
            maxPolarAngle={Math.PI * 0.85}
            minPolarAngle={Math.PI * 0.05}
            target={cameraSettings.target}
            enableDamping={true}
            dampingFactor={0.05}
            rotateSpeed={ViewportManager.getDeviceType() === 'mobile' ? 0.8 : 0.5}
            zoomSpeed={ViewportManager.getDeviceType() === 'mobile' ? 1.2 : 0.8}
            panSpeed={ViewportManager.getDeviceType() === 'mobile' ? 1.0 : 0.8}
          />
          
          {/* Professional Lighting System */}
          <Professional3DLighting preset={lightingPreset} intensity={1.0} />
          
          {/* Standardized Garment Scene */}
          <StandardizedGarmentScene
            garmentType={garmentType}
            garmentColor={garmentColor}
            designTexture={designTexture}
          />
          
          {/* Advanced Viewport Helpers */}
          <ViewportHelpers
            garmentType={garmentType}
            showBoundingBox={viewportState.showBoundingBox}
            showGrid={viewportState.showGrid}
            showRulers={viewportState.showRulers}
            gridSize={viewportState.gridSize}
          />
          
          {/* Simple Performance monitoring */}
          <SimplePerformanceMonitor />
          
          {/* Professional ground setup */}
          <mesh 
            receiveShadow 
            position={[0, -8, 0]} 
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial 
              color="hsl(var(--muted))" 
              roughness={0.8}
              metalness={0.1}
              transparent 
              opacity={0.6} 
            />
          </mesh>
          
          {/* Soft contact shadows */}
          <ContactShadows
            position={[0, -7.99, 0]}
            opacity={0.3}
            scale={20}
            blur={2}
            far={10}
          />
        </Suspense>
      </Canvas>
      
      {/* Professional 3D Controls */}
      <Controls3DView
        lightingPreset={lightingPreset}
        onLightingChange={setLightingPreset}
        showWireframe={showWireframe}
        onWireframeToggle={() => setShowWireframe(!showWireframe)}
      />
      
      {/* Advanced Viewport Controls */}
      <AdvancedViewportControls
        showBoundingBox={viewportState.showBoundingBox}
        onBoundingBoxToggle={viewportState.toggleBoundingBox}
        showGrid={viewportState.showGrid}
        onGridToggle={viewportState.toggleGrid}
        showRulers={viewportState.showRulers}
        onRulersToggle={viewportState.toggleRulers}
        snapToGrid={viewportState.snapToGrid}
        onSnapToggle={viewportState.toggleSnap}
      />
      
      {/* Development Stats */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs p-2 rounded font-mono">
          <div>Type: {garmentType}</div>
          <div>Scale: {ViewportManager.getCurrentScale(garmentType).toFixed(2)}</div>
          <div>Device: {ViewportManager.getDeviceType()}</div>
        </div>
      )}
    </div>
  );
};