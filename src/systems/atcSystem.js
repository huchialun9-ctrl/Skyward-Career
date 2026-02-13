export class ATCManager {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.towerVoice = null;

        if (this.synth) {
            this.synth.onvoiceschanged = () => {
                this.voices = this.synth.getVoices();
                // Try to find a good English voice
                this.towerVoice = this.voices.find(v => v.name.includes('Google US English')) ||
                    this.voices.find(v => v.lang === 'en-US') ||
                    this.voices[0];
            };
        }
    }

    speak(text) {
        if (!this.synth || this.synth.speaking) return;

        const utterance = new SpeechSynthesisUtterance(text);
        if (this.towerVoice) utterance.voice = this.towerVoice;

        utterance.rate = 1.0; // Normal speed
        utterance.pitch = 0.9; // Slightly deeper for authority
        utterance.volume = 0.8;

        // Add radio effect filters if we were using Web Audio API for TTS output, 
        // but SpeechSynthesis goes direct to destination. 
        // We can simulate radio noise via SoundManager separately.

        this.synth.speak(utterance);
    }

    requestClearance(callsign, destination) {
        // Randomize runway
        const runway = Math.random() > 0.5 ? '28 Left' : '05 Right';
        const msg = `Skyward ${callsign}, cleared to ${destination} via radar vectors. Departure runway ${runway}. Altimeter 2992.`;
        this.speak(msg);
        return msg;
    }

    announceTakeoff(callsign) {
        this.speak(`Skyward ${callsign}, wind 240 at 8 knots. Cleared for takeoff.`);
    }
}

export const atcManager = new ATCManager();
