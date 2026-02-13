export const calculateHappiness = (landingRate, events, duration) => {
    // Base 100
    let score = 100;

    // Base decay for long duration (boredom)
    score -= Math.max(0, (duration - 60) * 0.1);

    // Landing Impact
    if (landingRate < -600) score -= 40; // Hard landing
    else if (landingRate < -400) score -= 20; // Firm landing
    else if (landingRate > -150 && landingRate < 0) score += 10; // Butter

    // Events
    events.forEach(event => {
        if (event.severity === 'HIGH') score -= 15;
        if (event.severity === 'CRITICAL') score -= 30;
    });

    return Math.max(0, Math.min(100, Math.round(score)));
};

export const generateReview = (score) => {
    if (score >= 90) return { stars: 5, text: "Absolutely smooth flight! The pilot is a pro." };
    if (score >= 70) return { stars: 4, text: "Good flight, a bit bumpy but safe." };
    if (score >= 50) return { stars: 3, text: "Average. Nothing special, just transport." };
    if (score >= 30) return { stars: 2, text: "The landing was rough. logic needs checking." };
    return { stars: 1, text: "Terrible experience! I spilled my coffee." };
};
