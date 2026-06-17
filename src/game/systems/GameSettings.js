const TOPICS_KEY = 'duyuLabirentTopics'
const DIFFICULTY_KEY = 'duyuLabirentDifficulty'
const CLASS_TOPICS_KEY = 'duyuLabirentClassTopics'
const CLASS_DIFFICULTY_KEY = 'duyuLabirentClassDifficulty'

export const Difficulties = {
  easy: { label: 'Kolay', monsterMult: 0.7, countDelta: -1, cardDelta: 1, speedMult: 1.1 },
  normal: { label: 'Normal', monsterMult: 1, countDelta: 0, cardDelta: 0, speedMult: 1 },
  hard: { label: 'Zor', monsterMult: 1.2, countDelta: 1, cardDelta: -1, speedMult: 0.95 },
}

export const gameSettings = {
  getActiveTopics() {
    const classTopics = this._read(CLASS_TOPICS_KEY)
    if (classTopics) return classTopics
    return this._read(TOPICS_KEY)
  },

  setPlayerTopics(topics) {
    if (!topics || topics.length === 0) localStorage.removeItem(TOPICS_KEY)
    else localStorage.setItem(TOPICS_KEY, JSON.stringify(topics))
  },

  setClassTopics(topics) {
    if (!topics || topics.length === 0) localStorage.removeItem(CLASS_TOPICS_KEY)
    else localStorage.setItem(CLASS_TOPICS_KEY, JSON.stringify(topics))
  },

  clearClassTopics() {
    localStorage.removeItem(CLASS_TOPICS_KEY)
    localStorage.removeItem(CLASS_DIFFICULTY_KEY)
  },

  getActiveDifficulty() {
    return localStorage.getItem(CLASS_DIFFICULTY_KEY)
      || localStorage.getItem(DIFFICULTY_KEY)
      || 'normal'
  },

  setPlayerDifficulty(diff) {
    localStorage.setItem(DIFFICULTY_KEY, diff)
  },

  setClassDifficulty(diff) {
    if (!diff) localStorage.removeItem(CLASS_DIFFICULTY_KEY)
    else localStorage.setItem(CLASS_DIFFICULTY_KEY, diff)
  },

  isClassModeActive() {
    return !!localStorage.getItem(CLASS_TOPICS_KEY) || !!localStorage.getItem(CLASS_DIFFICULTY_KEY)
  },

  getClassTopics() {
    return this._read(CLASS_TOPICS_KEY)
  },

  getClassDifficulty() {
    return localStorage.getItem(CLASS_DIFFICULTY_KEY)
  },

  _read(key) {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },
}
