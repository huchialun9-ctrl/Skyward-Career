export const calculateSalary = (flightData, performanceData, licenseId) => {
    // flightData: { distance, difficulty, baseRate }
    // performanceData: { landingRate, fuelEfficiency, onTime }
    // licenseId: string

    let totalSalary = flightData.baseRate;

    // Landing Bonus (Soft landing < 200 fpm)
    let landingBonus = 0;
    if (performanceData.landingRate > -200 && performanceData.landingRate <= 0) {
        landingBonus = 500; // Perfect
    } else if (performanceData.landingRate > -400) {
        landingBonus = 200; // Good
    } else if (performanceData.landingRate < -600) {
        // Hard landing penalty
        totalSalary -= 500;
    }

    // Efficiency Bonus
    let fuelBonus = 0;
    if (performanceData.fuelEfficiency > 0.9) {
        fuelBonus = 300;
    }

    // On-time Bonus
    let timeBonus = 0;
    if (performanceData.onTime) {
        timeBonus = 400;
    }

    return {
        base: flightData.baseRate,
        landingBonus,
        fuelBonus,
        timeBonus,
        penalty: performanceData.landingRate < -600 ? 500 : 0,
        total: Math.max(0, totalSalary + landingBonus + fuelBonus + timeBonus)
    };
};

export const SHOP_ITEMS = [
    {
        id: 'headset_bose',
        name: 'Pro Noise Cancelling Headset',
        description: 'Reduces fatigue by 20% on long haul flights.',
        price: 300,
        type: 'GEAR',
        image: '🎧',
    },
    {
        id: 'sunglasses_aviator',
        name: 'Classic Aviators',
        description: 'Reduces glare and increases style points.',
        price: 150,
        type: 'GEAR',
        image: '🕶️',
    },
    {
        id: 'hangar_basic',
        name: 'Small Private Hangar',
        description: 'Store one small aircraft.',
        price: 50000,
        type: 'PROPERTY',
        image: '🏠',
    },
    {
        id: 'hangar_luxury',
        name: 'Luxury Hangar + Lounge',
        description: 'Store 3 aircraft and recover energy faster.',
        price: 250000,
        type: 'PROPERTY',
        image: '🏰',
    }
];
