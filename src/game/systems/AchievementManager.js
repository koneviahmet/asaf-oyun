const STORAGE_KEY = 'duyuLabirentAchievements'

export const ACHIEVEMENTS = [
  { id: 'first_game', title: 'İlk Adım', desc: 'İlk labirent oyununu tamamla', icon: '🎮' },
  { id: 'perfect_5', title: 'Seri Ustası', desc: '5 soruyu üst üste doğru cevapla', icon: '🔥' },
  { id: 'level_3', title: 'Kaşif', desc: '3. seviyeye ulaş', icon: '🗺️' },
  { id: 'high_scorer', title: 'Skor Avcısı', desc: '1000 puanın üzerine çık', icon: '🏆' },
  { id: 'quiz_perfect', title: 'Bilgin', desc: 'Pratik modda 10/10 yap', icon: '📚' },
  { id: 'timed_15', title: 'Hızlı Zeka', desc: 'Zaman yarışında 15+ doğru cevap', icon: '⚡' },
  { id: 'monster_free', title: 'Kaçış Ustası', desc: 'Dinazor yakalamadan seviye tamamla', icon: '👻' },
  { id: 'topic_master', title: 'Konu Uzmanı', desc: 'Tek konuda %100 başarı (5+ soru)', icon: '🎯' },
  { id: 'daily_challenge', title: 'Günün Kahramanı', desc: 'Günlük meydan okumayı tamamla', icon: '⭐' },
  { id: 'boss_slayer', title: 'Boss Avcısı', desc: 'Boss seviyesini tamamla', icon: '👹' },
]

export const achievementManager = {
  getUnlocked() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  },

  unlock(id) {
    const unlocked = this.getUnlocked()
    if (unlocked.includes(id)) return false
    unlocked.push(id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked))
    return true
  },

  isUnlocked(id) {
    return this.getUnlocked().includes(id)
  },

  checkAfterGame({ score, level, sessionStats, caught = false }) {
    const newly = []
    if (score > 0 && this.unlock('first_game')) newly.push('first_game')
    if (level >= 3 && this.unlock('level_3')) newly.push('level_3')
    if (score >= 1000 && this.unlock('high_scorer')) newly.push('high_scorer')
    if (sessionStats?.byTopic) {
      const perfect = Object.values(sessionStats.byTopic).some(
        (s) => s.correct >= 5 && s.wrong === 0,
      )
      if (perfect && this.unlock('topic_master')) newly.push('topic_master')
    }
    return newly.map((id) => ACHIEVEMENTS.find((a) => a.id === id))
  },

  checkStreak(streak) {
    if (streak >= 5 && this.unlock('perfect_5')) {
      return ACHIEVEMENTS.find((a) => a.id === 'perfect_5')
    }
    return null
  },

  checkQuizPerfect(correct, total) {
    if (correct === total && total >= 10 && this.unlock('quiz_perfect')) {
      return ACHIEVEMENTS.find((a) => a.id === 'quiz_perfect')
    }
    return null
  },

  checkLevelNoCatch() {
    if (this.unlock('monster_free')) {
      return ACHIEVEMENTS.find((a) => a.id === 'monster_free')
    }
    return null
  },

  checkDailyChallenge() {
    if (this.unlock('daily_challenge')) {
      return ACHIEVEMENTS.find((a) => a.id === 'daily_challenge')
    }
    return null
  },

  checkTimed(correct) {
    if (correct >= 15 && this.unlock('timed_15')) {
      return ACHIEVEMENTS.find((a) => a.id === 'timed_15')
    }
    return null
  },

  checkBossLevel() {
    if (this.unlock('boss_slayer')) {
      return ACHIEVEMENTS.find((a) => a.id === 'boss_slayer')
    }
    return null
  },

  getAll() {
    const unlocked = this.getUnlocked()
    return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: unlocked.includes(a.id) }))
  },
}
