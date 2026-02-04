class SoundManager {
  constructor() {
    this.ready = false;
    this.oscillators = {};

    // Check if p5.sound is loaded
    if (typeof p5 !== 'undefined' && p5.prototype.hasOwnProperty('Oscillator')) {
      console.log("SoundManager: p5.sound loaded. Ready.");
      this.ready = true;
      this.setupSounds();
    } else {
      console.error('SoundManager: p5.sound NOT loaded or Oscillator missing.');
      console.log('p5 type:', typeof p5);
      if (typeof p5 !== 'undefined') console.log('p5.prototype.Oscillator:', p5.prototype.Oscillator);
    }
  }

  setupSounds() {
    // We will create temporary oscillators when needed rather than keeping them distinct
    // to avoid memory issues, but for frequent sounds we can use a pool?
    // Actually, simple "fire and forget" oscillators with envelopes are best for arcade sounds.
  }

  playSound(type) {
    if (!this.ready || !userStartAudio) return;

    // Ensure audio context is started
    if (getAudioContext().state !== 'running') {
      getAudioContext().resume();
    }

    switch (type) {
      case 'shoot':
        this.playShoot();
        break;
      case 'enemy_hit':
        this.playExplosion(0.1, 800, 100);
        break;
      case 'player_hit':
        this.playExplosion(0.3, 500, 50);
        break;
      case 'boss_hit':
        this.playExplosion(0.1, 200, 50);
        break;
      case 'laser_charge':
        this.playCharge();
        break;
      case 'laser_fire':
        this.playLaser();
        break;
      case 'powerup':
        this.playPowerup();
        break;
    }
  }

  playShoot() {
    let osc = new p5.Oscillator('triangle');
    let env = new p5.Envelope();

    // Fast decay for a "pew" sound
    env.setADSR(0.001, 0.1, 0.0, 0.1);
    env.setRange(0.3, 0);

    osc.freq(800);
    osc.freq(100, 0.1); // Pitch drop
    osc.start();
    env.play(osc, 0, 0.1);

    // Stop after duration
    setTimeout(() => osc.stop(), 200);
  }

  playExplosion(vol, startFreq, endFreq) {
    let osc = new p5.Noise('white');
    let env = new p5.Envelope();

    env.setADSR(0.001, 0.2, 0.1, 0.2);
    env.setRange(vol, 0);

    osc.start();
    env.play(osc, 0, 0.1);

    setTimeout(() => osc.stop(), 500);
  }

  playCharge() {
    let osc = new p5.Oscillator('sine');

    osc.freq(200);
    osc.freq(1000, 1.0); // Pitch rise
    osc.amp(0);
    osc.amp(0.3, 1.0);

    osc.start();

    setTimeout(() => osc.stop(), 1000);
  }

  playLaser() {
    let osc = new p5.Oscillator('sawtooth');
    let env = new p5.Envelope();

    env.setADSR(0.01, 0.2, 0, 0);
    env.setRange(0.4, 0);

    osc.freq(500);
    osc.freq(100, 0.5); // Slow pitch drop for big laser

    osc.start();
    env.play(osc, 0, 0.1);

    setTimeout(() => osc.stop(), 500);
  }

  playPowerup() {
    let osc = new p5.Oscillator('sine');
    let env = new p5.Envelope();

    env.setADSR(0.01, 0.1, 0.1, 0.4);
    env.setRange(0.3, 0);

    osc.freq(600);
    osc.freq(1200, 0.3); // Pitch rise

    osc.start();
    env.play(osc, 0, 0.1);

    setTimeout(() => osc.stop(), 500);
  }

  playEnemyShoot() {
    let osc = new p5.Oscillator('square');
    let env = new p5.Envelope();

    env.setADSR(0.001, 0.1, 0.0, 0.1);
    env.setRange(0.1, 0);

    osc.freq(400);
    osc.freq(200, 0.1);

    osc.start();
    env.play(osc, 0, 0.1);

    setTimeout(() => osc.stop(), 200);
  }

  playGameOver() {
    let osc = new p5.Oscillator('triangle');
    osc.start();
    osc.amp(0.2);
    osc.freq(300);

    setTimeout(() => osc.freq(250), 300);
    setTimeout(() => osc.freq(200), 600);
    setTimeout(() => osc.freq(150), 900);
    setTimeout(() => {
      osc.amp(0, 1.0);
      setTimeout(() => osc.stop(), 1000);
    }, 1200);
  }

  playVictory() {
    let osc = new p5.Oscillator('sine');
    osc.start();
    osc.amp(0.2);

    // Arpeggio
    osc.freq(400);
    setTimeout(() => osc.freq(500), 100);
    setTimeout(() => osc.freq(600), 200);
    setTimeout(() => osc.freq(800), 300);
    setTimeout(() => {
      osc.amp(0, 0.5);
      setTimeout(() => osc.stop(), 500);
    }, 600);
  }
  startMusic() {
    if (!this.ready || !userStartAudio) return;

    // Simple drone ambience
    if (!this.musicOsc) {
      this.musicOsc = new p5.Oscillator('sine');
      this.musicOsc.freq(50);
      this.musicOsc.amp(0);
      this.musicOsc.start();
      this.musicOsc.amp(0.05, 2.0); // Fade in low drone

      // Secondary textured drone
      this.musicOsc2 = new p5.Oscillator('sawtooth');
      this.musicOsc2.freq(48); // Slightly detuned
      this.musicOsc2.amp(0);
      this.musicOsc2.start();
      this.musicOsc2.amp(0.02, 2.0);
    }
  }

  stopMusic() {
    if (this.musicOsc) {
      this.musicOsc.amp(0, 2.0);
      if (this.musicOsc2) this.musicOsc2.amp(0, 2.0);
      setTimeout(() => {
        if (this.musicOsc) this.musicOsc.stop();
        if (this.musicOsc2) this.musicOsc2.stop();
        this.musicOsc = null;
        this.musicOsc2 = null;
      }, 2000);
    }
  }
}
