export class SoundManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
        this.masterGain.gain.value = 0.5; // Master volume

        // Nodes
        this.engineOscillator = null;
        this.engineGain = null;
        this.windNode = null;
        this.windGain = null;
        this.breathingNode = null;
        this.breathingGain = null;
        this.lfoNode = null;

        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
        this.initialized = true;
    }

    // --- ENGINE SOUND (Sawtooth + Lowpass) ---
    startEngine() {
        if (this.engineOscillator) return;

        this.engineOscillator = this.context.createOscillator();
        this.engineGain = this.context.createGain();

        this.engineOscillator.type = 'sawtooth';
        this.engineOscillator.frequency.value = 50;

        // Filter to dampen the harsh sawtooth
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        this.engineOscillator.connect(filter);
        filter.connect(this.engineGain);
        this.engineGain.connect(this.masterGain);

        this.engineGain.gain.value = 0.1;
        this.engineOscillator.start();

        // Start ambient wind loop too
        this._startWind();
    }

    updateEngineRPM(throttlePercent) {
        if (!this.engineOscillator) return;

        // RPM Pitch: 50Hz (Idle) -> 150Hz (Max)
        const targetFreq = 50 + (throttlePercent * 1.5);
        this.engineOscillator.frequency.setTargetAtTime(targetFreq, this.context.currentTime, 0.1);

        // RPM Volume
        const targetGain = 0.1 + (throttlePercent / 100 * 0.2);
        this.engineGain.gain.setTargetAtTime(targetGain, this.context.currentTime, 0.1);

        // Update wind based on implied speed approx
        this.updateWind(throttlePercent * 4.5); // speed approx
    }

    // --- WIND NOISE (Pink Noise) ---
    _createPinkNoise() {
        const bufferSize = 4096;
        const noiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11; // (roughly) compensate for gain
            b6 = white * 0.115926;
        }
        const noise = this.context.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        return noise;
    }

    _startWind() {
        this.windNode = this._createPinkNoise();
        this.windGain = this.context.createGain();
        this.windGain.gain.value = 0; // Start silent

        // Wind Filter (Bandpass)
        const filter = this.context.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800; // Wind howl freq

        this.windNode.connect(filter);
        filter.connect(this.windGain);
        this.windGain.connect(this.masterGain);
        this.windNode.start();
    }

    updateWind(speedKts) {
        if (!this.windGain) return;
        // Volume based on speed (0 at 0kts, max at 400kts)
        const normalizedSpeed = Math.min(speedKts / 400, 1);
        this.windGain.gain.setTargetAtTime(normalizedSpeed * 0.4, this.context.currentTime, 0.5);
    }

    // --- SWITCH CLICKS (Filtered Noise Burst) ---
    playClick() {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        // Metallic click tone
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.05);

        // Envelope
        gain.gain.setValueAtTime(0.3, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.context.currentTime + 0.05);
    }

    // --- G-LOC BREATHING (Filtered Noise + LFO) ---
    startBreathing() {
        if (this.breathingNode) return;

        // White noise base
        const bufferSize = this.context.sampleRate * 2;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        this.breathingNode = this.context.createBufferSource();
        this.breathingNode.buffer = buffer;
        this.breathingNode.loop = true;

        // Lowpass filter controlled by LFO (to simulate inhale/exhale)
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.value = 5;

        // LFO
        this.lfoNode = this.context.createOscillator();
        this.lfoNode.type = 'sine';
        this.lfoNode.frequency.value = 0.3; // Breath rate (approx 18 bpm)

        // Connect LFO to Filter Frequency
        // Base freq 400Hz +/- 200Hz
        const lfoGain = this.context.createGain();
        lfoGain.gain.value = 300;

        this.lfoNode.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        filter.frequency.value = 500;

        this.breathingGain = this.context.createGain();
        this.breathingGain.gain.value = 0;

        this.breathingNode.connect(filter);
        filter.connect(this.breathingGain);
        this.breathingGain.connect(this.masterGain);

        this.breathingNode.start();
        this.lfoNode.start();
    }

    updateBreathing(gForce) {
        // Only breathe if G-Force is high (>4 or <-1)
        const stress = Math.max(0, Math.abs(gForce) - 3); // 3G safe zone
        const intensity = Math.min(stress / 3, 1); // Max out at 6G

        if (intensity > 0) {
            if (!this.breathingNode) this.startBreathing();
            // Increase volume and rate with stress
            this.breathingGain.gain.setTargetAtTime(intensity * 0.8, this.context.currentTime, 0.5);
            this.lfoNode.frequency.setTargetAtTime(0.3 + (intensity * 0.5), this.context.currentTime, 0.5); // Faster breathing
        } else {
            if (this.breathingGain) {
                this.breathingGain.gain.setTargetAtTime(0, this.context.currentTime, 0.5);
            }
        }
    }

    // --- WARNINGS ---
    playWarning() {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.type = 'sine';
        osc.frequency.value = 600;

        gain.gain.setValueAtTime(0.1, this.context.currentTime);
        gain.gain.setValueAtTime(0, this.context.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, this.context.currentTime + 0.4);
        gain.gain.setValueAtTime(0, this.context.currentTime + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.context.currentTime + 0.65);
    }
}

export const soundManager = new SoundManager();
