export const LICENSES = {
    STUDENT: {
        id: 'STUDENT',
        name: 'Student Pilot',
        requiredHours: 0,
        aircraft: ['Cessna 152'],
        basePay: 50,
    },
    PPL: {
        id: 'PPL',
        name: 'Private Pilot',
        requiredHours: 40,
        aircraft: ['Cessna 172'],
        basePay: 0, // PPL usually doesn't pay, but for game balance maybe small jobs?
    },
    CPL: {
        id: 'CPL',
        name: 'Commercial Pilot',
        requiredHours: 250,
        aircraft: ['Beechcraft Baron', 'Cessna 208'],
        basePay: 500,
    },
    ATPL: {
        id: 'ATPL',
        name: 'Airline Transport Pilot',
        requiredHours: 1500,
        aircraft: ['Airbus A320', 'Boeing 737'],
        basePay: 2000,
    },
    SENIOR_CAPTAIN: {
        id: 'SENIOR_CAPTAIN',
        name: 'Senior Captain',
        requiredHours: 5000,
        aircraft: ['Boeing 747', 'Airbus A350'],
        basePay: 5000,
    }
};

export const getNextLicense = (currentLicenseId) => {
    const licenseOrder = ['STUDENT', 'PPL', 'CPL', 'ATPL', 'SENIOR_CAPTAIN'];
    const currentIndex = licenseOrder.indexOf(currentLicenseId);
    if (currentIndex === -1 || currentIndex === licenseOrder.length - 1) return null;
    return LICENSES[licenseOrder[currentIndex + 1]];
};

export const checkPromotion = (pilot) => {
    const currentLicense = LICENSES[pilot.license || 'STUDENT']; // fallback
    const nextLicense = getNextLicense(pilot.license || 'STUDENT');

    if (!nextLicense) return null;

    if (pilot.flightHours >= nextLicense.requiredHours) {
        return nextLicense;
    }
    return null;
};
