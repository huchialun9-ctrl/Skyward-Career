import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { AIRPORTS } from '../../data/airports';

const Globe = ({ onSelectAirport }) => {
    const earthRef = useRef();

    useFrame((state, delta) => {
        if (earthRef.current) {
            earthRef.current.rotation.y += delta * 0.05;
        }
    });

    // Convert Lat/Lon to 3D Vector
    const getPosition = (lat, lon, radius) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = (radius * Math.sin(phi) * Math.sin(theta));
        const y = (radius * Math.cos(phi));
        return [x, y, z];
    };

    return (
        <group>
            {/* Holographic Earth */}
            <Sphere ref={earthRef} args={[5, 64, 64]}>
                <meshPhongMaterial
                    color="#1e293b"
                    emissive="#0f172a"
                    specular="#38bdf8"
                    shininess={50}
                    wireframe={false}
                    transparent
                    opacity={0.9}
                />
                {/* Grid Overlay */}
                <mesh scale={[1.001, 1.001, 1.001]}>
                    <sphereGeometry args={[5, 32, 32]} />
                    <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.1} />
                </mesh>
            </Sphere>

            {/* Airport Markers */}
            <group rotation={[0, 0, 0]}> {/* This needs to match earth rotation if markers stick to it. 
                         For now, let's keep earth rotating and markers static relative to earth? 
                         Actually, standard approach is rotating the parent group of both. */}
            </group>

            {/* Since I rotated the sphere itself in useFrame, children won't rotate if outside. 
          Correct way: Rotate a group containing everything. */}
        </group>
    );
};

const WorldMap = ({ onSelectRoute }) => {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#38bdf8" />
            <starField /> {/* Mock starfield */}

            <group rotation={[0, 0, 0]}>
                {/* We can rotate this group for idle animation */}
                <Globe />

                {AIRPORTS.map(airport => {
                    const pos = [0, 0, 0]; // Placeholder logic
                    // Real logic needs calc. Re-implement in component or util.
                    return (
                        <mesh key={airport.id} position={pos}>
                            <sphereGeometry args={[0.05, 16, 16]} />
                            <meshBasicMaterial color="red" />
                        </mesh>
                    )
                })}
            </group>

            <OrbitControls enablePan={false} minDistance={7} maxDistance={20} autoRotate autoRotateSpeed={0.5} />
        </>
    );
};

export default WorldMap;
