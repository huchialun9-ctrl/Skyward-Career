import React, { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, ContactShadows, Float, useGLTF } from '@react-three/drei';
import { AssetLoader, useRealisticTextures } from '../assets/AssetLoader';
import * as THREE from 'three';

const ProceduralAircraft = (props) => {
    const { metalMap } = useRealisticTextures();

    // Create a more aerodynamic fuselage using LatheGeometry or similar
    // For now we stick to a composite shape but with the detailed texture

    return (
        <group {...props}>
            {/* Fuselage - Extended for realism */}
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
                <capsuleGeometry args={[1, 10, 4, 32]} />
                <meshStandardMaterial
                    map={metalMap}
                    roughness={0.3}
                    metalness={0.8}
                    envMapIntensity={1.5}
                />
            </mesh>

            {/* Cockpit Window */}
            <mesh position={[0, 1, 2.5]} rotation={[0.2, 0, 0]}>
                <boxGeometry args={[1.4, 1.2, 2.5]} />
                <meshPhysicalMaterial
                    color="black"
                    transmission={0.5}
                    opacity={1}
                    metalness={0.1}
                    roughness={0.0}
                    ior={1.5}
                    thickness={0.5}
                />
            </mesh>

            {/* Wings - Swept back */}
            <mesh position={[0, 0, 1]} rotation={[-1.57, 0, 0]} castShadow>
                <extrudeGeometry
                    args={[
                        new THREE.Shape()
                            .moveTo(0, 0)
                            .lineTo(6, -4)
                            .lineTo(6, -5)
                            .lineTo(0, -2)
                            .lineTo(-6, -5)
                            .lineTo(-6, -4)
                            .lineTo(0, 0),
                        { depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 }
                    ]}
                />
                <meshStandardMaterial map={metalMap} roughness={0.4} metalness={0.6} />
            </mesh>

            {/* Tail Assembly */}
            <group position={[0, 1, -4]}>
                <mesh position={[0, 1, 0]} castShadow>
                    <boxGeometry args={[0.1, 2.5, 2]} />
                    <meshStandardMaterial map={metalMap} />
                </mesh>
                <mesh position={[0, 0.5, 0]} castShadow>
                    <boxGeometry args={[4, 0.1, 1.5]} />
                    <meshStandardMaterial map={metalMap} />
                </mesh>
            </group>

            {/* Engine Nacelles */}
            <mesh position={[2, -0.5, 2]} rotation={[1.57, 0, 0]} castShadow>
                <cylinderGeometry args={[0.6, 0.6, 2, 32]} />
                <meshStandardMaterial color="#333" roughness={0.5} />
            </mesh>
            <mesh position={[-2, -0.5, 2]} rotation={[1.57, 0, 0]} castShadow>
                <cylinderGeometry args={[0.6, 0.6, 2, 32]} />
                <meshStandardMaterial color="#333" roughness={0.5} />
            </mesh>
        </group>
    );
};

const MainMenuScene = () => {
    const cameraRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (cameraRef.current) {
            cameraRef.current.position.x = Math.sin(t * 0.1) * 22;
            cameraRef.current.position.z = Math.cos(t * 0.1) * 22 + 5;
            cameraRef.current.lookAt(0, 1, 0);
        }
    });

    return (
        <>
            <PerspectiveCamera makeDefault ref={cameraRef} position={[15, 5, 15]} fov={40} />
            <Environment preset="city" background blur={0.6} />

            {/* Tarmac */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#1e293b" roughnes={0.9} />
            </mesh>

            <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
                <Suspense fallback={null}>
                    {/* Uses the procedural fallback if no GLB is provided */}
                    <AssetLoader url="/assets/models/aircraft.glb" fallback={ProceduralAircraft} />
                </Suspense>
            </Float>

            <ContactShadows resolution={1024} scale={50} blur={2.5} opacity={0.6} far={15} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
            <ambientLight intensity={0.4} />
        </>
    );
};

export default MainMenuScene;
