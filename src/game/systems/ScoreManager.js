const STORAGE_KEY = 'duyuLabirentHighScore'

export const ScoreValues = {
  CORRECT_ANSWER: 50,
  MONSTER_KILL: 100,
  BOSS_HIT: 150,
  LEVEL_COMPLETE: 500,
  BOSS_LEVEL_COMPLETE: 300,
  ESCAPE_CATCH: 25,
}

export class ScoreManager {
  constructor() {
    this.score = 0
    this.highScore = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
    this.multiplier = 1
  }

  setMultiplier(m) {
    this.multiplier = m
  }

  add(points) {
    this.score += Math.round(points * this.multiplier)
    if (this.score > this.highScore) {
      this.highScore = this.score
      localStorage.setItem(STORAGE_KEY, String(this.highScore))
    }
    return this.score
  }

  reset() {
    this.score = 0
  }

  getHighScore() {
    return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
  }
}
