import { AIRPORTS, getDistance } from '../data/airports';

export const generateRoutes = (currentAirportId, licenseRank) => {
    const origin = AIRPORTS.find(a => a.id === currentAirportId);
    if (!origin) return [];

    // Filter destinations based on license/range capabilities (mock logic)
    let maxRange = 500; // Student (Cessna 152)
    if (licenseRank === 'PPL') maxRange = 1000;
    if (licenseRank === 'CPL') maxRange = 3000;
    if (licenseRank === 'ATPL') maxRange = 15000;

    return AIRPORTS
        .filter(dest => dest.id !== origin.id)
        .map(dest => {
            const distance = getDistance(origin, dest);
            if (distance > maxRange) return null;

            return {
                origin,
                destination: dest,
                distance: Math.round(distance),
                basePrice: calculateTicketPrice(distance),
                estimatedDuration: distance / 800 * 60 + 30, // Approx mins (800km/h avg + taxi)
                difficulty: distance > 5000 ? 'HARD' : (distance > 2000 ? 'MEDIUM' : 'EASY')
            };
        })
        .filter(Boolean);
};

export const calculateTicketPrice = (distance) => {
    // Base logic: longer dist = cheaper per km but higher total
    // Demand fluctuation
    const baseRate = 0.15; // $ per km
    const demandFactor = 0.8 + Math.random() * 0.4; // 0.8 - 1.2
    return Math.round(distance * baseRate * demandFactor);
};

export const FLIGHT_EVENTS = [
    {
        id: 'turbulence_severe',
        title: 'Severe Turbulence',
        description: 'Sudden air pocket! Maintain altitude.',
        effect: 'stability_loss',
        severity: 'HIGH'
    },
    {
        id: 'medical_emergency',
        title: 'Medical Emergency',
        description: 'Passenger heart attack. Divert to nearest airport?',
        effect: 'decision_required',
        severity: 'CRITICAL'
    },
    {
        id: 'strong_headwind',
        title: 'Strong Headwind',
        description: 'Fuel consumption increased by 15%.',
        effect: 'fuel_usage',
        severity: 'MEDIUM'
    }
];

export const getRandomEvent = () => {
    if (Math.random() > 0.7) { // 30% chance of event
        return FLIGHT_EVENTS[Math.floor(Math.random() * FLIGHT_EVENTS.length)];
    }
    return null;
};
