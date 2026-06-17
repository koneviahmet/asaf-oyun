const HISTORY_KEY = 'duyuLabirentSessionHistory'
const MAX_HISTORY = 100

export const sessionHistory = {
  getAll() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    } catch {
      return []
    }
  },

  add(entry) {
    const history = this.getAll()
    history.unshift({
      ...entry,
      date: new Date().toISOString(),
    })
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)))
  },

  clear() {
    localStorage.removeItem(HISTORY_KEY)
  },

  getTopicAggregates() {
    const history = this.getAll()
    const map = {}

    history.forEach((session) => {
      if (!session.stats?.byTopic) return
      Object.entries(session.stats.byTopic).forEach(([topic, s]) => {
        if (!map[topic]) map[topic] = { correct: 0, wrong: 0 }
        map[topic].correct += s.correct
        map[topic].wrong += s.wrong
      })
    })

    return Object.entries(map)
      .map(([topic, s]) => ({
        topic,
        correct: s.correct,
        wrong: s.wrong,
        total: s.correct + s.wrong,
        accuracy: s.correct + s.wrong ? Math.round((s.correct / (s.correct + s.wrong)) * 100) : 0,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
  },

  exportToCsv() {
    const history = this.getAll()
    const header = 'Ad,Skor,Seviye,Doğru,Yanlış,Başarı%,Tarih'
    const rows = history.map((s) => {
      const date = new Date(s.date).toLocaleString('tr-TR')
      const acc = s.stats?.accuracy ?? 0
      return `"${s.name}",${s.score},${s.level},${s.stats?.correct ?? 0},${s.stats?.wrong ?? 0},${acc}%,"${date}"`
    })
    return [header, ...rows].join('\n')
  },

  downloadCsv() {
    const blob = new Blob(['\uFEFF' + this.exportToCsv()], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `duyu-labirent-oturumlar-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  },
}
