import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { useGLTF } from '@react-three/drei';

// Paths to generated textures (in artifacts folder, but we'll assume they are moved to public or imported)
// For this environment, we'll use the absolute paths directly if possible, or relative if in public.
// Since we are in a dev environment, we can try to load from the artifact paths if the server serves them, 
// but usually we need them in the public folder.
// For now, we will assume the user might move them, but we will try to load from the relative path we know.
// We will simply use the file URLs we know exist.

const TEXTURE_PATHS = {
    metal: '/src/assets/textures/aircraft_metal_panel.png', // We will need to move the files here
    leather: '/src/assets/textures/cockpit_leather_dark.png',
    fabric: '/src/assets/textures/pilot_seat_fabric.png',
};

// Inner component that actually suspends/loads
const SafeGLTF = ({ url, ...props }) => {
    const { scene } = useGLTF(url);
    return <primitive object={scene} {...props} />;
};

class AssetErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error) {
        console.warn("Asset loading failed, switching to fallback:", error);
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

export const AssetLoader = ({ url, fallback: FallbackComponent, ...props }) => {
    return (
        <AssetErrorBoundary fallback={<FallbackComponent {...props} />}>
            <SafeGLTF url={url} {...props} />
        </AssetErrorBoundary>
    );
};

// Material Helper to get the realistic textures
export const useRealisticTextures = () => {
    const [metal, leather, fabric] = useLoader(TextureLoader, [
        '/assets/textures/aircraft_metal_panel_1770942291011.png',
        '/assets/textures/cockpit_leather_dark_1770942306228.png',
        '/assets/textures/pilot_seat_fabric_1770942319926.png'
    ]);

    // Optimize textures
    useMemo(() => {
        [metal, leather, fabric].forEach(t => {
            if (t) {
                t.flipY = false;
                // t.anisotropy = 16; // Removing anatomy setup for now to prevent renderer errors if context wrong
            }
        });
    }, [metal, leather, fabric]);

    return {
        metalMap: metal,
        leatherMap: leather,
        fabricMap: fabric
    };
};
