export class SoundManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);

        this.sounds = {};
        this.engineOscillator = null;
        this.engineGain = null;
    }

    init() {
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    // Procedural Engine Sound
    startEngine() {
        this.engineOscillator = this.context.createOscillator();
        this.engineGain = this.context.createGain();

        this.engineOscillator.type = 'sawtooth';
        this.engineOscillator.frequency.value = 50; // Idle RPM

        // Low pass filter to muffle it a bit
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        this.engineOscillator.connect(filter);
        filter.connect(this.engineGain);
        this.engineGain.connect(this.masterGain);

        this.engineGain.gain.value = 0.1;
        this.engineOscillator.start();
    }

    updateEngineRPM(throttlePercent) {
        if (!this.engineOscillator) return;

        // Pitch goes from 50Hz to 150Hz
        const targetFreq = 50 + (throttlePercent * 1.5);
        this.engineOscillator.frequency.setTargetAtTime(targetFreq, this.context.currentTime, 0.1);

        // Volume increases with RPM
        const targetGain = 0.1 + (throttlePercent / 100 * 0.2);
        this.engineGain.gain.setTargetAtTime(targetGain, this.context.currentTime, 0.1);
    }

    playClick() {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.context.currentTime + 0.1);
    }

    playWarning() {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = 'sine';
        osc.frequency.value = 600;

        // Pulse effect
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
