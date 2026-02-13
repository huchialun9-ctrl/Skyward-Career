export const AIRPORTS = [
    // Taiwan
    { id: 'RCSS', iata: 'TSA', name: 'Taipei Songshan', city: 'Taipei', country: 'Taiwan', lat: 25.0697, lon: 121.5525, size: 'MEDIUM' },
    { id: 'RCTP', iata: 'TPE', name: 'Taoyuan International', city: 'Taipei', country: 'Taiwan', lat: 25.0797, lon: 121.2342, size: 'LARGE' },

    // Japan
    { id: 'RJTT', iata: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan', lat: 35.5494, lon: 139.7798, size: 'LARGE' },
    { id: 'RJAA', iata: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan', lat: 35.7720, lon: 140.3929, size: 'LARGE' },

    // USA
    { id: 'KJFK', iata: 'JFK', name: 'John F. Kennedy', city: 'New York', country: 'USA', lat: 40.6413, lon: -73.7781, size: 'LARGE' },
    { id: 'KLAX', iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', lat: 33.9416, lon: -118.4085, size: 'LARGE' },

    // UK / Europe
    { id: 'EGLL', iata: 'LHR', name: 'Heathrow', city: 'London', country: 'UK', lat: 51.4700, lon: -0.4543, size: 'LARGE' },
    { id: 'LFPG', iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', lat: 49.0097, lon: 2.5479, size: 'LARGE' },

    // Regional
    { id: 'VHHH', iata: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong', lat: 22.3080, lon: 113.9185, size: 'LARGE' },
    { id: 'WSSS', iata: 'SIN', name: 'Changi', city: 'Singapore', country: 'Singapore', lat: 1.3644, lon: 103.9915, size: 'LARGE' }
];

export const getDistance = (airport1, airport2) => {
    // Haversine formula
    const R = 6371; // km
    const dLat = (airport2.lat - airport1.lat) * Math.PI / 180;
    const dLon = (airport2.lon - airport1.lon) * Math.PI / 180;
    const lat1 = airport1.lat * Math.PI / 180;
    const lat2 = airport2.lat * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
