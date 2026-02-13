import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../systems/useGameStore';
import { soundManager } from '../../systems/soundManager';
import { Gauge, Activity, Navigation, Wind, ArrowUp, ArrowDown } from 'lucide-react';

const ActionText = ({ text }) => {
    if (!text) return null;
    return (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <p className="text-sky-200 font-serif italic text-lg animate-pulse drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                "{text}"
            </p>
        </div>
    );
};

const ThrottleLever = ({ value, onChange, onInteract }) => {
    return (
        <div className="relative h-64 w-16 bg-slate-800 rounded-lg border border-slate-600 flex justify-center shadow-inner group">
            {/* Track */}
            <div className="absolute h-[90%] w-2 bg-slate-900 top-[5%] rounded-full" />

            {/* Handle */}
            <div
                className="absolute w-12 h-16 bg-slate-700 rounded-md border-t border-slate-500 shadow-xl cursor-grab active:cursor-grabbing transition-transform"
                style={{ bottom: `${value}%` }} // Linear mapping for now
                onMouseDown={onInteract}
            >
                <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                    <div className="w-8 h-1 bg-slate-900/50 rounded-full" />
                    <div className="w-8 h-1 bg-slate-900/50 rounded-full" />
                    <div className="w-8 h-1 bg-slate-900/50 rounded-full" />
                </div>
            </div>

            {/* Invisible slider input for interaction ease */}
            <input
                type="range"
                min="0"
                max="100"
                orient="vertical"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-grab"
            />
            <span className="absolute -bottom-6 text-xs text-slate-400 font-mono">THROTTLE</span>
        </div>
    );
};

const YokeControl = ({ position, onChange, onInteract }) => {
    // position: { x: -1 to 1, y: -1 to 1 }

    return (
        <div className="relative w-64 h-32 flex items-center justify-center">
            {/* Yoke Graphic (SVG representation) */}
            <svg
                width="200"
                height="120"
                viewBox="0 0 200 120"
                className="drop-shadow-2xl transition-transform duration-75"
                style={{
                    transform: `rotate(${position.x * 45}deg) scale(${1 - position.y * 0.1})` // Rotate for bank, Scale for pitch (visual faux-depth)
                }}
            >
                {/* Yoke handle shape */}
                <path d="M40,60 Q30,60 30,50 L30,30 Q30,10 50,10 L150,10 Q170,10 170,30 L170,50 Q170,60 160,60 L140,60 L100,50 L60,60 Z"
                    fill="#1e293b" stroke="#475569" strokeWidth="2" />
                <rect x="95" y="50" width="10" height="40" fill="#0f172a" />
            </svg>

            {/* Interaction Zone - mapped to mouse/touch */}
            <div
                className="absolute inset-0 z-10 cursor-crosshair opacity-0"
                onMouseMove={(e) => {
                    if (e.buttons === 1) { // Only when dragging
                        const rect = e.target.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                        const y = ((e.clientY - rect.top) / rect.height) * 2 - 1; // Inverted in flight controls usually? let's stick to visual logic first
                        onChange({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
                        onInteract();
                    }
                }}
                onMouseLeave={() => onChange({ x: 0, y: 0 })} // Center on release/leave
                onMouseUp={() => onChange({ x: 0, y: 0 })}
            />
            <span className="absolute -bottom-8 text-xs text-slate-400 font-mono">YOKE (DRAG)</span>
        </div>
    )
}

const ToggleSwitch = ({ label, isOn, onToggle }) => (
    <div className="flex flex-col items-center gap-2">
        <div
            className={`w-8 h-12 rounded-sm border-2 ${isOn ? 'bg-green-500/20 border-green-500' : 'bg-slate-800 border-slate-600'} relative cursor-pointer transition-colors shadow-lg`}
            onClick={onToggle}
        >
            <div className={`absolute left-1 right-1 h-4 bg-slate-300 rounded-sm transition-all duration-200 ${isOn ? 'top-1' : 'bottom-1'}`} />
        </div>
        <span className="text-[10px] text-slate-400 font-mono text-center uppercase leading-tight">{label}</span>
    </div>
);

const LandingGearLever = ({ isDown, onToggle }) => (
    <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={onToggle}>
        <div className="w-8 h-24 bg-slate-800 rounded-full border border-slate-600 relative overflow-hidden">
            {/* Track */}
            <div className="absolute inset-x-3 top-2 bottom-2 bg-black/50 rounded-full" />
            {/* Knob */}
            <div className={`absolute left-0 right-0 h-8 rounded-full border-2 shadow-xl transition-all duration-300 flex items-center justify-center
         ${isDown ? 'bottom-0 bg-slate-700 border-slate-500' : 'top-0 bg-red-900/50 border-red-500'}`}
            >
                <div className={`w-4 h-4 rounded-full ${isDown ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase group-hover:text-slate-300 transition-colors">L. GEAR</span>
    </div>
);

import { physicsSystem } from '../../systems/physicsSystem';
import PilotArm from './PilotArm';
import { useRealisticTextures } from '../assets/AssetLoader';

const CockpitView = () => {
    const { leatherMap, metalMap } = useRealisticTextures();

    const [throttle, setThrottle] = useState(0);
    const [yoke, setYoke] = useState({ x: 0, y: 0 });
    const [switches, setSwitches] = useState({ fuel: false, beacon: false, nav: false });
    const [gearDown, setGearDown] = useState(true);
    const [actionDesc, setActionDesc] = useState('');
    const [activeChecklist, setActiveChecklist] = useState('PRE_FLIGHT');

    // Customization State
    const [customization] = useState({ glove: 'LEATHER', watch: 'DIGITAL' });
    const [showGhost, setShowGhost] = useState(false);

    // Physics & Visuals State
    const speed = Math.round(throttle * 4.5);
    const altitude = 32000 + Math.round(yoke.y * 100);
    const shakeIntensity = (speed / 100) * 2;
    const [shake, setShake] = useState({ x: 0, y: 0 });
    const [headInertia, setHeadInertia] = useState({ x: 0, y: 0 });

    // --- EFFECTS ---

    // Physics Loop
    useEffect(() => {
        const interval = setInterval(() => {
            const targetPitch = yoke.y * -30;
            const gForce = physicsSystem.update(targetPitch, speed, 16);
            const failures = physicsSystem.checkFailures(gForce, gearDown, speed);
            useGameStore.getState().updateFlightPhysics(gForce, failures);

            // Audio: Breathing based on G-Force
            soundManager.updateBreathing(gForce);

            if (gForce > 4 || gForce < 0) {
                soundManager.playWarning();
            }
        }, 50);
        return () => clearInterval(interval);
    }, [yoke, speed, gearDown]);

    // Audio Init
    useEffect(() => {
        const handleFirstClick = () => {
            soundManager.init();
            if (!soundManager.engineOscillator) soundManager.startEngine();
            window.removeEventListener('click', handleFirstClick);
        };
        window.addEventListener('click', handleFirstClick);
        return () => window.removeEventListener('click', handleFirstClick);
    }, []);

    // Engine Sound
    useEffect(() => {
        soundManager.updateEngineRPM(throttle);
    }, [throttle]);

    // Shake Logic
    useEffect(() => {
        if (speed > 50) {
            const interval = setInterval(() => {
                setShake({
                    x: (Math.random() - 0.5) * shakeIntensity,
                    y: (Math.random() - 0.5) * shakeIntensity
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [speed, shakeIntensity]);

    // Head Inertia Logic
    useEffect(() => {
        const targetX = yoke.x * -20;
        const targetY = yoke.y * -20;
        setHeadInertia(prev => ({
            x: prev.x + (targetX - prev.x) * 0.1,
            y: prev.y + (targetY - prev.y) * 0.1
        }));
    }, [yoke]);

    // Ghost Hand Logic
    useEffect(() => {
        if (speed < 10 && throttle < 10 && !switches.fuel) {
            setShowGhost(true);
        } else {
            setShowGhost(false);
        }
    }, [speed, throttle, switches.fuel]);

    // --- ACTIONS ---

    const showAction = (text) => {
        setActionDesc(text);
        setTimeout(() => setActionDesc(""), 2500);
    };

    const toggleSwitch = (id, label) => {
        const newState = !switches[id];
        setSwitches(prev => ({ ...prev, [id]: newState }));
        showAction(`Right hand ${newState ? 'flicks on' : 'cuts off'} ${label} switch.`);
        soundManager.playClick();
    };

    const toggleGear = () => {
        const newState = !gearDown;
        setGearDown(newState);
        showAction(newState ? "Pushing gear lever DOWN. Waiting for three greens." : "Pulling gear lever UP. Lock verified.");
        soundManager.playClick();
    };

    const requestATC = () => {
        showAction("Pressing PTT switch. Requesting clearance...");
        soundManager.playClick();
        setTimeout(() => {
            atcManager.requestClearance('Alpha-One', 'Tokyo Haneda');
        }, 1000);
    };

    const handleThrottleInteract = () => {
        showAction("Right hand firmly grips the throttle lever...");
    };

    const handleYokeInteract = () => {
        const texts = [
            "Feeling the vibration through the yoke...",
            "Muscles tense against the aerodynamic resistance...",
            "Correcting course, hands steady..."
        ];
        showAction(texts[Math.floor(Math.random() * texts.length)]);
    };

    // --- SUB-COMPONENTS ---

    const ChecklistOverlay = () => {
        const items = [
            { label: 'Fuel Pump', completed: switches.fuel },
            { label: 'Beacon', completed: switches.beacon },
            { label: 'Nav Lights', completed: switches.nav },
        ];
        return (
            <div className="absolute top-20 right-4 glass-panel p-4 w-64 pointer-events-auto z-20">
                <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
                    <h3 className="font-bold text-sky-400">PRE-FLIGHT</h3>
                    <span className="text-xs text-slate-500">{items.filter(i => i.completed).length}/{items.length}</span>
                </div>
                <div className="space-y-2">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                            <span className={item.completed ? 'text-green-400' : 'text-slate-300'}>{item.label}</span>
                            <div className={`w-4 h-4 rounded border ${item.completed ? 'bg-green-500 border-green-500' : 'border-slate-500'}`}>
                                {item.completed && <svg viewBox="0 0 24 24" className="w-full h-full text-black stroke-current stroke-2 fill-none"><polyline points="20 6 9 17 4 12" /></svg>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div
            className="w-full h-full relative p-4 flex flex-col justify-between transition-transform duration-75 ease-out"
            style={{
                transform: `translate(${shake.x + headInertia.x}px, ${shake.y + headInertia.y}px) rotate(${headInertia.x * 0.5}deg)`,
                backgroundImage: `url(${leatherMap?.image?.src || ''})`,
                backgroundSize: '256px'
            }}
        >
            <ActionText text={actionDesc} />
            <ChecklistOverlay />

            {/* Top Section: Overhead Panel & HUD */}
            <div className="flex justify-between items-start pt-4 px-8 relative z-10">
                {/* Overhead Panel Mini-View */}
                <div className="glass-panel p-4 flex gap-4 rotate-x-12 perspective-500 pointer-events-auto">
                    <ToggleSwitch label="Fuel Pump" isOn={switches.fuel} onToggle={() => toggleSwitch('fuel', 'Fuel Pump')} />
                    <ToggleSwitch label="Beacon" isOn={switches.beacon} onToggle={() => toggleSwitch('beacon', 'Beacon Light')} />
                    <ToggleSwitch label="Nav Light" isOn={switches.nav} onToggle={() => toggleSwitch('nav', 'Nav Lights')} />
                </div>

                {/* Flight Data HUD */}
                <div className="glass-panel px-6 py-2 flex gap-4 text-green-400 font-mono text-lg relative group">
                    <button
                        className="absolute -top-3 -right-3 w-6 h-6 bg-slate-700 rounded-full text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border border-slate-500 hover:bg-sky-600"
                        onClick={() => window.open('', 'HUD', 'width=400,height=200')} // Simple placeholder for now, ideally use PopOutWindow state
                        title="Pop Out Instrument"
                    >
                        ↗
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-500">AIRSPEED</span>
                        <span>{speed} <small>KTS</small></span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-500">ALTITUDE</span>
                        <span>{altitude.toLocaleString()} <small>FT</small></span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-500">V. SPEED</span>
                        <span>{Math.round(yoke.y * 2000)} <small>FPM</small></span>
                    </div>
                </div>
            </div>

            {/* Instruments */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-20">
                <div className="w-full h-0.5 bg-white/20 transition-transform duration-100 ease-out"
                    style={{ transform: `rotate(${yoke.x * -30}deg) translateY(${yoke.y * 100}px)` }} />
            </div>

            {/* Main Controls - Bottom Layout */}
            <div className="flex items-end justify-between px-12 pb-8 pointer-events-auto relative z-10">
                {/* Left Side: Gear Lever & Comms */}
                <div className="mr-8 flex flex-col gap-4">
                    <LandingGearLever isDown={gearDown} onToggle={toggleGear} />

                    <div className="glass-panel p-2 flex flex-col gap-2">
                        <button
                            className="px-2 py-1 bg-slate-700 hover:bg-sky-600 rounded text-[10px] text-white transition-colors"
                            onClick={requestATC}
                        >
                            REQ CLR
                        </button>
                    </div>
                </div>

                {/* Center Yoke */}
                <div className="relative">
                    <YokeControl
                        position={yoke}
                        onChange={setYoke}
                        onInteract={handleYokeInteract}
                    />
                    {/* Pilot Arm Overlay */}
                    <PilotArm
                        action={throttle > 0 || yoke.y !== 0}
                        customization={customization}
                        showGhost={showGhost}
                    />
                </div>

                {/* Right Throttle Quadrant */}
                <ThrottleLever
                    value={throttle}
                    onChange={(val) => { setThrottle(val); showAction("Adjusting thrust..."); }}
                    onInteract={handleThrottleInteract}
                />
            </div>
        </div>
    );
};

export default CockpitView;
