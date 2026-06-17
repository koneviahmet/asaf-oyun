const STORAGE_KEY = 'duyuLabirentSound'
const VOLUME_KEY = 'duyuLabirentVolume'

class SoundManager {
  constructor() {
    this.ctx = null
    this.enabled = localStorage.getItem(STORAGE_KEY) !== 'off'
    const stored = parseInt(localStorage.getItem(VOLUME_KEY) || '80', 10)
    this.volume = Math.min(100, Math.max(0, Number.isNaN(stored) ? 80 : stored)) / 100
    this.musicOsc = null
    this.musicGain = null
    this.musicTimer = null
  }

  getVolume() {
    return Math.round(this.volume * 100)
  }

  setVolume(percent) {
    this.volume = Math.min(100, Math.max(0, percent)) / 100
    localStorage.setItem(VOLUME_KEY, String(Math.round(this.volume * 100)))
    return this.getVolume()
  }

  vol(base) {
    return base * this.volume
  }

  init() {
    if (this.ctx) return
    this.ctx = new (window.AudioContext || window.webkitAudioContext)()
  }

  resume() {
    this.init()
    if (this.ctx?.state === 'suspended') this.ctx.resume()
  }

  toggle() {
    this.enabled = !this.enabled
    localStorage.setItem(STORAGE_KEY, this.enabled ? 'on' : 'off')
    if (!this.enabled) this.stopMusic()
    return this.enabled
  }

  isEnabled() {
    return this.enabled
  }

  playTone(freq, duration, type = 'square', volume = 0.15, freqEnd = null) {
    if (!this.enabled) return
    this.resume()
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime)
    if (freqEnd) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + duration)
    }
    gain.gain.setValueAtTime(this.vol(volume), this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + duration)
  }

  playCorrect() {
    this.playTone(523, 0.1, 'square', 0.12)
    setTimeout(() => this.playTone(659, 0.1, 'square', 0.12), 100)
    setTimeout(() => this.playTone(784, 0.15, 'square', 0.12), 200)
  }

  playWrong() {
    this.playTone(200, 0.2, 'sawtooth', 0.1, 100)
  }

  playCatch() {
    this.playTone(150, 0.3, 'sawtooth', 0.15, 80)
  }

  playKill() {
    this.playTone(400, 0.08, 'square', 0.12)
    setTimeout(() => this.playTone(300, 0.08, 'square', 0.1), 80)
    setTimeout(() => this.playTone(200, 0.15, 'square', 0.08, 50), 160)
  }

  playCard() {
    this.playTone(880, 0.08, 'sine', 0.1)
    setTimeout(() => this.playTone(1100, 0.12, 'sine', 0.1), 80)
  }

  playLevelComplete() {
    const notes = [523, 659, 784, 1047]
    notes.forEach((n, i) => setTimeout(() => this.playTone(n, 0.2, 'square', 0.12), i * 150))
  }

  playGameOver() {
    this.playTone(300, 0.2, 'sawtooth', 0.12, 150)
    setTimeout(() => this.playTone(200, 0.3, 'sawtooth', 0.12, 80), 200)
    setTimeout(() => this.playTone(100, 0.5, 'sawtooth', 0.1, 50), 450)
  }

  playStep() {
    this.playTone(80, 0.03, 'triangle', 0.04)
  }

  startMusic() {
    if (!this.enabled || this.musicTimer) return
    this.resume()

    const melody = [262, 294, 330, 349, 330, 294, 262, 220, 247, 262, 294, 330]
    let note = 0

    const playNote = () => {
      if (!this.enabled) return
      const freq = melody[note % melody.length]
      this.playTone(freq, 0.18, 'triangle', 0.04)
      note++
    }

    playNote()
    this.musicTimer = setInterval(playNote, 400)
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer)
      this.musicTimer = null
    }
  }
}

export const soundManager = new SoundManager()
