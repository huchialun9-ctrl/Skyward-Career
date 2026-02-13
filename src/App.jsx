import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGameStore } from './systems/useGameStore';
import { Html } from '@react-three/drei';
import CareerHub from './components/ui/CareerHub';
import WorldMap from './components/visuals/WorldMap';
import MainMenuScene from './components/visuals/MainMenuScene';
import CockpitView from './components/visuals/CockpitView';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-slate-900 text-white p-8">
          <div className="max-w-xl">
            <h1 className="text-3xl text-red-500 mb-4">Criticial System Failure</h1>
            <pre className="bg-black/50 p-4 rounded text-xs font-mono overflow-auto mb-4">
              {this.state.error.toString()}
            </pre>
            <button onClick={() => window.location.reload()} className="bg-sky-600 px-4 py-2 rounded">System Reboot</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const { gameState, setGameState } = useGameStore();

  return (
    <div className="w-full h-full relative bg-slate-900 text-white overflow-hidden select-none">

      {/* 3D Scene Layer wrapped in ErrorBoundary */}
      <ErrorBoundary>
        <div className="absolute inset-0 z-0">
          <Canvas shadows camera={{ position: [0, 0, 18], fov: 45 }}>
            <Suspense fallback={null}>
              <Html fullscreen>
                {/* Loading State could go here */}
              </Html>
              {gameState === 'MENU' && <MainMenuScene />}
              {gameState === 'ROUTE_SELECTION' && <WorldMap />}

              {gameState === 'FLIGHT' && (
                <>
                  <color attach="background" args={['#0f172a']} />
                  <GForceEffects />
                  {/* Cockpit is rendered in UI layer? No, CockpitView is UI. 
                      We need a 3D scene for flight if we had one. 
                      For now, flight is mostly UI cockpit instructions + effects. 
                  */}
                </>
              )}

              <EffectComposer disableNormalPass>
                <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.5} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
                <Noise opacity={0.05} />
              </EffectComposer>
            </Suspense>
          </Canvas>
        </div>
      </ErrorBoundary>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">

        {/* Main Menu UI */}
        {gameState === 'MENU' && (
          <div className="w-full h-full flex flex-col items-center justify-center pointer-events-auto bg-black/40 backdrop-blur-[2px]">
            <h1 className="text-8xl font-black mb-2 title-gradient tracking-tighter">SKYWARD</h1>
            <h2 className="text-3xl font-light text-white mb-8 tracking-[1em] ml-4">CAREER</h2>
            <button
              className="btn-primary text-xl px-12 py-4"
              onClick={() => setGameState('CAREER')}
            >
              Enter Cockpit
            </button>
          </div>
        )}

        {/* Career Hub */}
        {gameState === 'CAREER' && <CareerHub />}

        {/* Route Selection UI */}
        {gameState === 'ROUTE_SELECTION' && (
          <div className="w-full h-full pointer-events-auto">
            <div className="absolute top-8 left-8 p-4 glass-panel">
              <h2 className="text-2xl font-bold text-white">Select Route</h2>
              <p className="text-slate-400">Click on an airport to select destination.</p>
              <button onClick={() => setGameState('CAREER')} className="mt-4 text-sm text-sky-400 hover:underline">
                &larr; Back to Hub
              </button>
            </div>
            {/* Mock "Start Flight" button */}
            <div className="absolute bottom-12 right-12">
              <button
                className="btn-primary animate-pulse"
                onClick={() => setGameState('FLIGHT')}
              >
                Take Off (Demo Flight)
              </button>
            </div>
          </div>
        )}

        {/* Flight HUD / Cockpit View */}
        {gameState === 'FLIGHT' && (
          <div className="w-full h-full pointer-events-auto">
            <CockpitView />
            {/* Temp Exit Button */}
            <button
              className="absolute top-4 right-4 bg-red-500/20 text-red-400 border border-red-500/50 px-4 py-2 rounded hover:bg-red-500/30"
              onClick={() => {
                useGameStore.getState().endFlight({
                  totalSalary: 1500,
                  bonuses: 300,
                  landingRate: -180,
                  happiness: 95,
                  duration: 2.5
                });
              }}
            >
              End Flight
            </button>
          </div>
        )}

        {/* Debrief Screen */}
        {gameState === 'DEBRIEF' && <DebriefScreen />}
      </div>
    </div>
  );
}

const GForceEffects = () => {
  const { consciousness, gForce } = useGameStore(state => state.flightState || { consciousness: 100, gForce: 1 });

  // 100 = clear, 0 = black/red
  const opacity = Math.max(0, (100 - consciousness) / 100);
  const color = gForce < 0 ? 'red' : 'black'; // Redout vs Blackout

  if (opacity <= 0.05) return null;

  return (
    <Html fullscreen style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: color,
          opacity: opacity,
          transition: 'opacity 0.1s ease',
          mixBlendMode: 'multiply'
        }}
      />
      {opacity > 0.8 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <h1 className="text-6xl font-black text-white/50 tracking-widest animate-pulse">G-LOC</h1>
        </div>
      )}
    </Html>
  );
};

const DebriefScreen = () => {
  const { lastFlightStats, setGameState } = useGameStore();
  const stats = lastFlightStats || {
    basePay: 0, bonuses: 0, landingRate: 0, happiness: 0
  };

  // Generate review based on happiness (mock usage if not passed)
  // In real app, calculate this before saving to store

  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-auto bg-black/80 backdrop-blur-md">
      <div className="glass-panel p-12 max-w-2xl w-full text-center">
        <h2 className="text-4xl font-bold text-white mb-8">Flight Complete</h2>
        <div className="grid grid-cols-2 gap-8 text-left mb-8">
          <div>
            <p className="text-slate-400 uppercase text-xs">Total Pay</p>
            <p className="text-2xl font-mono text-white">${stats.totalSalary?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase text-xs">Bonuses</p>
            <p className="text-2xl font-mono text-green-400">+${stats.bonuses?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase text-xs">Landing Rate</p>
            <p className={`text-2xl font-mono ${stats.landingRate < -400 ? 'text-red-400' : 'text-sky-400'}`}>
              {stats.landingRate} fpm
            </p>
          </div>
          <div>
            <p className="text-slate-400 uppercase text-xs">Passenger Happiness</p>
            <p className="text-2xl font-mono text-yellow-400">{stats.happiness}%</p>
          </div>
        </div>
        <button
          className="btn-primary w-full"
          onClick={() => setGameState('CAREER')}
        >
          Return to Hangar
        </button>
      </div>
    </div>
  );
}

export default App;
