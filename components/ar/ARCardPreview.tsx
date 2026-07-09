'use client';

import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { Text, Image, Environment, ContactShadows } from '@react-three/drei';

type ARCardPreviewProps = {
  imageUrl?: string;
  pokemonName: string;
};

function CardModel({ imageUrl, pokemonName }: ARCardPreviewProps) {
  return (
    <group position={[0, 1, -1]}>
      {/* 3D Card Plane */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.63, 0.88, 0.01]} />
        <meshStandardMaterial color="#2a2b38" />
      </mesh>
      
      {/* Card Image Texture */}
      {imageUrl ? (
        <Image url={imageUrl} position={[0, 0, 0.006]} scale={[0.63, 0.88]} />
      ) : (
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.08}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {pokemonName}
        </Text>
      )}
      
      <ContactShadows position={[0, -0.45, 0]} opacity={0.4} scale={2} blur={2} />
    </group>
  );
}

export function ARCardPreview({ imageUrl, pokemonName }: ARCardPreviewProps) {
  const [store] = useState(() => createXRStore());

  return (
    <div className="w-full h-[400px] relative rounded-2xl overflow-hidden bg-background/50 border border-white/10">
      <div className="absolute top-4 left-4 z-10">
        <button 
          className="btn-primary text-sm py-2 px-4 rounded-full bg-brand-500 text-foreground font-bold"
          onClick={() => store.enterAR()}
        >
          Enter AR
        </button>
      </div>
      <Canvas shadows camera={{ position: [0, 1.5, 2], fov: 50 }}>
        <XR store={store}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Suspense fallback={null}>
            <CardModel imageUrl={imageUrl} pokemonName={pokemonName} />
            <Environment preset="city" />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}
