import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, MeshTransmissionMaterial, ContactShadows, Stars } from '@react-three/drei';
import * as THREE from 'three';

const GeometricShape = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();
        meshRef.current.rotation.x = Math.sin(time / 4);
        meshRef.current.rotation.y = Math.sin(time / 2);
    });

    return (
        <Float speed={2} rotationIntensity={2} floatIntensity={1}>
            <mesh ref={meshRef}>
                <torusKnotGeometry args={[1, 0.3, 128, 32]} />
                <MeshTransmissionMaterial
                    backside
                    backsideThickness={5}
                    thickness={2}
                    chromaticAberration={0.5}
                    anisotropy={0.5}
                    distortion={0.5}
                    distortionScale={0.5}
                    temporalDistortion={0.1}
                    color="#818cf8"
                />
            </mesh>
        </Float>
    );
};

export const LoginScene: React.FC = () => {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 6]} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Environment preset="city" />
                <group position={[-3, 0, 0]}>
                    <GeometricShape />
                </group>
                <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
            </Canvas>
        </div>
    );
};
