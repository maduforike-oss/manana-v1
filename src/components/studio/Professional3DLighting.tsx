import React from 'react';
import { Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

export const Professional3DLighting = ({ 
  preset = 'studio',
  intensity = 1.0 
}: {
  preset?: 'studio' | 'outdoor' | 'product' | 'dramatic';
  intensity?: number;
}) => {
  const renderLightingSetup = () => {
    switch (preset) {
      case 'studio':
        return (
          <>
            {/* Key light - main illumination */}
            <directionalLight
              position={[4, 8, 6]}
              intensity={1.4 * intensity}
              castShadow
              shadow-mapSize-width={4096}
              shadow-mapSize-height={4096}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
              shadow-bias={-0.0001}
            />
            
            {/* Fill light - soften shadows */}
            <directionalLight
              position={[-3, 4, 4]}
              intensity={0.6 * intensity}
              color="#f5f5f5"
            />
            
            {/* Rim light - edge definition */}
            <directionalLight
              position={[0, 2, -6]}
              intensity={0.8 * intensity}
              color="#ffffff"
            />
            
            {/* Ambient fill */}
            <ambientLight intensity={0.25 * intensity} color="#f8f8f8" />
          </>
        );
        
      case 'outdoor':
        return (
          <>
            {/* Sun light */}
            <directionalLight
              position={[8, 10, 3]}
              intensity={2.0 * intensity}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              color="#fff8e1"
            />
            
            {/* Sky bounce */}
            <ambientLight intensity={0.4 * intensity} color="#87ceeb" />
            
            {/* Ground reflection */}
            <directionalLight
              position={[0, -5, 0]}
              intensity={0.3 * intensity}
              color="#f5f5dc"
            />
          </>
        );
        
      case 'product':
        return (
          <>
            {/* Primary product light */}
            <directionalLight
              position={[2, 6, 8]}
              intensity={1.8 * intensity}
              castShadow
              shadow-mapSize-width={4096}
              shadow-mapSize-height={4096}
            />
            
            {/* Secondary fill */}
            <directionalLight
              position={[-4, 3, 2]}
              intensity={0.5 * intensity}
            />
            
            {/* Back light for separation */}
            <directionalLight
              position={[0, 4, -8]}
              intensity={0.7 * intensity}
            />
            
            {/* Soft ambient */}
            <ambientLight intensity={0.2 * intensity} />
          </>
        );
        
      case 'dramatic':
        return (
          <>
            {/* Strong key light */}
            <directionalLight
              position={[6, 8, 4]}
              intensity={2.5 * intensity}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            
            {/* Subtle fill */}
            <directionalLight
              position={[-2, 2, 6]}
              intensity={0.3 * intensity}
            />
            
            {/* Low ambient for contrast */}
            <ambientLight intensity={0.1 * intensity} />
          </>
        );
        
      default:
        return (
          <>
            <ambientLight intensity={0.3 * intensity} />
            <directionalLight position={[5, 8, 5]} intensity={1.0 * intensity} castShadow />
          </>
        );
    }
  };

  return (
    <>
      {renderLightingSetup()}
      
      {/* Professional environment mapping */}
      <Environment 
        preset="studio" 
        background={false}
        environmentIntensity={0.4}
      />
      
      {/* Realistic contact shadows */}
      <ContactShadows
        position={[0, -2.1, 0]}
        opacity={0.4}
        scale={8}
        blur={2.5}
        far={4}
        resolution={512}
        color="#000000"
      />
    </>
  );
};