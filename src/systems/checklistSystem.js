export const CHECKLISTS = {
    PRE_FLIGHT: {
        id: 'PRE_FLIGHT',
        title: 'Pre-Flight Inspection',
        items: [
            { id: 'parking_brake', label: 'Parking Brake', action: 'SET' },
            { id: 'batteries', label: 'Battery Master', action: 'ON' },
            { id: 'fuel_pump', label: 'Fuel Pump', action: 'ON' },
            { id: 'beacon', label: 'Beacon Light', action: 'ON' },
        ]
    },
    TAKEOFF: {
        id: 'TAKEOFF',
        title: 'Takeoff Briefing',
        items: [
            { id: 'flaps', label: 'Flaps', action: 'SET 10' },
            { id: 'trim', label: 'Elevator Trim', action: 'TAKEOFF' },
            { id: 'transponder', label: 'Transponder', action: 'ALT' },
            { id: 'landing_light', label: 'Landing Lights', action: 'ON' },
        ]
    }
};

export const evaluateChecklist = (checklistId, systemState) => {
    // Mock validation logic
    // systemState: { switches: { fuel: true, ... }, levers: { ... } }

    const checklist = CHECKLISTS[checklistId];
    if (!checklist) return [];

    return checklist.items.map(item => {
        let completed = false;
        // Simple mapping for demo
        if (item.id === 'fuel_pump' && systemState.switches.fuel) completed = true;
        if (item.id === 'beacon' && systemState.switches.beacon) completed = true;
        if (item.id === 'landing_light' && systemState.switches.landing) completed = true;

        // Auto-complete others for prototype
        if (!['fuel_pump', 'beacon', 'landing_light'].includes(item.id)) completed = true;

        return { ...item, completed };
    });
};
