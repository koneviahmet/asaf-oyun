import { getAllTopics } from '../data/questions.js'

const STORAGE_KEY = 'duyuLabirentDaily'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export const dailyChallenge = {
  getToday() {
    const date = todayKey()
    const seed = date.split('-').reduce((a, b) => a + parseInt(b, 10), 0)
    const rand = seededRandom(seed)
    const topics = getAllTopics()
    const shuffled = [...topics].sort(() => rand() - 0.5)
    const selected = shuffled.slice(0, 2)
    const bonus = 1.5 + Math.floor(rand() * 2) // 1.5x - 2.5x

    return {
      date,
      topics: selected,
      bonus: Math.round(bonus * 10) / 10,
      label: `Bugün: ${selected.join(' + ')}`,
    }
  },

  isCompleted() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      return data.date === todayKey() && data.completed
    } catch {
      return false
    }
  },

  markCompleted(score) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      date: todayKey(),
      completed: true,
      score,
    }))
  },

  getStreak() {
    try {
      return parseInt(localStorage.getItem('duyuLabirentDailyStreak') || '0', 10)
    } catch {
      return 0
    }
  },

  updateStreak() {
    const streak = this.getStreak() + 1
    localStorage.setItem('duyuLabirentDailyStreak', String(streak))
    return streak
  },
}
