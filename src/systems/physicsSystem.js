export class PhysicsSystem {
    constructor() {
        this.currentG = 1.0;
        this.verticalSpeed = 0;
        this.lastPitch = 0;
        this.lastTime = Date.now();
    }

    update(pitch, speed, deltaTime) {
        // simple G-force approximation
        // G = 1 + (Centripetal Acceleration / g)
        // Centripetal Acc approx = speed * pitch_rate

        // Convert pitch to radians
        const pitchRad = pitch * (Math.PI / 180);
        const pitchDelta = pitch - this.lastPitch;
        const pitchRate = pitchDelta / deltaTime; // deg per ms

        // Fake G-force calculation formula for game feel
        // Pulling up (positive pitch rate) -> Positive G
        // Pushing down (negative pitch rate) -> Negative G

        // Base G is 1 (gravity)
        // Add speed factor: higher speed = more G for same pitch change
        const speedFactor = speed / 100; // e.g. 400kts -> 4x multiplier

        const instantaneousG = 1 + (pitchRate * speedFactor * 5);

        // Smooth out the G-force change to simulate fluid dynamics/suspension
        this.currentG = this.currentG * 0.9 + instantaneousG * 0.1;

        this.lastPitch = pitch;
        return this.currentG;
    }

    checkFailures(gForce, gearDown, speed) {
        const failures = [];

        // Gear Damage: Speed > 250kts with Gear Down
        if (gearDown && speed > 250) {
            failures.push({ type: 'GEAR_DAMAGE', message: 'GEAR OVERSPEED! RETRACT IMMEDIATELY' });
        }

        // Structural Stress: G > 9 or G < -3
        if (gForce > 9 || gForce < -3) {
            failures.push({ type: 'STRUCTURAL_STRESS', message: 'G-FORCE LIMIT EXCEEDED' });
        }

        return failures;
    }
}

export const physicsSystem = new PhysicsSystem();
