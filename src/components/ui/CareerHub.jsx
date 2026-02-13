import React, { useState } from 'react';
import { useGameStore } from '../../systems/useGameStore';
import { User, DollarSign, Map, ShoppingBag, Plane } from 'lucide-react';
import WorldMap from '../visuals/WorldMap';

const CareerHub = () => {
    const { pilot, setGameState } = useGameStore();
    const [view, setView] = useState('DASHBOARD'); // DASHBOARD, MAP, SHOP

    return (
        <div className="w-full h-full relative p-8">
            {/* 3D Background for Hub */}
            <div className="absolute inset-0 z-0">
                {/* Render WorldMap in background if we want, or a hangar scene */}
                {view === 'MAP' && (
                    <div className="w-full h-full absolute inset-0 bg-slate-900">
                        {/* We can stick the 3D map canvas here if we want it isolated, or use global canvas */}
                        {/* For now, just a placeholder or letting the App.jsx handle the 3D layer switch */}
                    </div>
                )}
            </div>

            <div className="relative z-10 w-full h-full flex flex-col pointer-events-none">
                {/* Header Stats */}
                <div className="glass-panel p-4 flex justify-between items-center pointer-events-auto">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center border border-sky-400">
                            <User className="text-sky-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{pilot.name}</h2>
                            <p className="text-sm text-sky-400 font-mono">{pilot.rank} | {pilot.license} RATINGS</p>
                        </div>
                    </div>

                    <div className="flex gap-8">
                        <div className="text-right">
                            <div className="text-xs text-slate-400 uppercase tracking-wider">Flight Hours</div>
                            <div className="text-2xl font-mono font-bold text-white">{pilot.flightHours} hrs</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-400 uppercase tracking-wider">Balance</div>
                            <div className="text-2xl font-mono font-bold text-green-400 flex items-center justify-end">
                                <DollarSign size={20} />
                                {pilot.balance.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex items-center justify-center mt-8 pointer-events-auto">
                    {view === 'DASHBOARD' && (
                        <div className="grid grid-cols-3 gap-6 w-full max-w-4xl">
                            <button
                                onClick={() => setGameState('ROUTE_SELECTION')} // Handled in App.jsx to show Map
                                className="glass-panel p-8 flex flex-col items-center justify-center hover:bg-sky-500/10 transition-colors group cursor-pointer"
                            >
                                <Map size={48} className="text-sky-400 mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-white mb-2">Find Jobs</h3>
                                <p className="text-center text-slate-400 text-sm">Select routes from the global network.</p>
                            </button>

                            <button
                                className="glass-panel p-8 flex flex-col items-center justify-center hover:bg-sky-500/10 transition-colors group cursor-pointer"
                            >
                                <ShoppingBag size={48} className="text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-white mb-2">Pilot Shop</h3>
                                <p className="text-center text-slate-400 text-sm">Buy gear, upgrades, and lifestyle items.</p>
                            </button>

                            <button
                                className="glass-panel p-8 flex flex-col items-center justify-center hover:bg-sky-500/10 transition-colors group cursor-pointer"
                            >
                                <Plane size={48} className="text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-white mb-2">Hangar</h3>
                                <p className="text-center text-slate-400 text-sm">Manage your fleet and aircraft maintenance.</p>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CareerHub;
