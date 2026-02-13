import { create } from 'zustand';

export const useGameStore = create((set) => ({
    // Game Flow
    gameState: 'MENU', // MENU, CAREER, FLIGHT_PREP, FLIGHT, DEBRIEF
    setGameState: (state) => set({ gameState: state }),

    // Pilot Career
    pilot: {
        name: 'Captain',
        rank: 'Cadet', // Cadet, Second Officer, First Officer, Captain
        flightHours: 0,
        balance: 5000,
        license: 'CESSNA_172',
    },

    // Economy
    updateBalance: (amount) => set((state) => ({
        pilot: { ...state.pilot, balance: state.pilot.balance + amount }
    })),

    addFlightHours: (hours) => set((state) => ({
        pilot: { ...state.pilot, flightHours: state.pilot.flightHours + hours }
    })),

    // Current Flight Data
    currentFlight: null,
    lastFlightStats: null,
    flightState: {
        gForce: 1.0,
        failures: [],
        consciousness: 100, // 0-100, < 20 starts blackout
    },
    startFlight: (flightData) => set({ currentFlight: flightData, gameState: 'FLIGHT', flightState: { gForce: 1, failures: [], consciousness: 100 } }),
    updateFlightPhysics: (gForce, failures) => set((state) => {
        // Calculate consciousness decay/recovery
        let newConsciousness = state.flightState.consciousness;
        if (gForce > 5) {
            newConsciousness -= (gForce - 5) * 0.5; // Drain
        } else if (gForce < -2) {
            newConsciousness -= (Math.abs(gForce) - 2) * 1.0; // Redout drains faster
        } else {
            newConsciousness += 1; // Recover
        }
        newConsciousness = Math.max(0, Math.min(100, newConsciousness));

        return {
            flightState: {
                gForce,
                failures: [...state.flightState.failures, ...failures], // Append new failures
                consciousness: newConsciousness
            }
        };
    }),
    endFlight: (stats) => set((state) => ({
        currentFlight: null,
        gameState: 'DEBRIEF',
        lastFlightStats: stats,
        pilot: {
            ...state.pilot,
            balance: state.pilot.balance + (stats?.totalSalary || 0),
            flightHours: state.pilot.flightHours + (stats?.duration || 0)
        }
    })),
}));
