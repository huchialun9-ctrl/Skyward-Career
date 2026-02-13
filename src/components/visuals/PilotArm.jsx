import React, { useState } from 'react';

const PilotArm = ({ action, customization, showGhost }) => {
    // customization: { glove: 'LEATHER', watch: 'CHRONO' }
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="absolute bottom-0 right-20 pointer-events-none transition-transform duration-300"
            style={{ transform: action ? 'translateY(0)' : 'translateY(100px)' }}>

            {/* Arm Container */}
            <div className="relative w-48 h-96 bg-slate-800 rounded-t-3xl shadow-2xl rotate-12 flex flex-col items-center">

                {/* Glove Texture */}
                <div className={`absolute inset-0 rounded-t-3xl ${customization.glove === 'LEATHER' ? 'bg-[#5c4033]' : 'bg-slate-700'}`}>
                    {/* Seams */}
                    <div className="w-full h-full border-l-4 border-black/20" />
                </div>

                {/* Watch */}
                <div className="absolute top-1/3 w-32 h-16 bg-black/50 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/10">
                    {/* Watch Face */}
                    <div className="w-12 h-12 rounded-full bg-black border-2 border-slate-400 flex items-center justify-center relative">
                        {customization.watch === 'DIGITAL' ? (
                            <span className="text-red-500 font-mono text-xs animate-pulse">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        ) : (
                            <>
                                {/* Analog tick marks */}
                                <div className="absolute w-0.5 h-2 bg-white top-1" />
                                <div className="absolute w-0.5 h-2 bg-white bottom-1" />
                                <div className="absolute w-2 h-0.5 bg-white left-1" />
                                <div className="absolute w-2 h-0.5 bg-white right-1" />
                                {/* Hands (static for now) */}
                                <div className="w-1 h-4 bg-red-500 absolute top-2 rounded-full rotate-45 origin-bottom" />
                            </>
                        )}
                    </div>
                    {/* Strap */}
                    <div className="absolute -left-4 right-4 h-8 bg-slate-900 -z-10 rounded" />
                </div>
            </div>

            {/* Ghost Hand Overlay (Tutorial) */}
            {showGhost && (
                <div className="absolute -top-20 -left-10 w-48 h-96 bg-sky-400/20 rounded-t-3xl border-2 border-sky-400 border-dashed animate-pulse pointer-events-none blur-sm">
                    <div className="absolute top-10 left-10 text-sky-300 font-bold text-xs bg-black/50 px-2 rounded">
                        GHOST ASSIST
                    </div>
                </div>
            )}
        </div>
    );
};

export default PilotArm;
