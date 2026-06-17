const STORAGE_KEY = 'duyuLabirentLeaderboard'
const NAME_KEY = 'duyuLabirentPlayerName'
const MAX_ENTRIES = 10

export class LeaderboardManager {
  getEntries() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  }

  saveEntry(name, score, level, stats = null) {
    if (!name?.trim() || score <= 0) return null

    const entries = this.getEntries()
    const entry = {
      name: name.trim().slice(0, 20),
      score,
      level,
      stats,
      date: new Date().toISOString(),
    }
    entries.push(entry)
    entries.sort((a, b) => b.score - a.score || b.level - a.level)
    const trimmed = entries.slice(0, MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))

    const rank = trimmed.findIndex(
      (e) => e.name === entry.name && e.score === entry.score && e.date === entry.date,
    ) + 1
    return { entry, rank, entries: trimmed }
  }

  getPlayerName() {
    return localStorage.getItem(NAME_KEY) || ''
  }

  setPlayerName(name) {
    localStorage.setItem(NAME_KEY, name.trim().slice(0, 20))
  }

  clearLeaderboard() {
    localStorage.removeItem(STORAGE_KEY)
  }

  getStats() {
    const entries = this.getEntries()
    const totalGames = entries.length
    const avgScore = totalGames
      ? Math.round(entries.reduce((s, e) => s + e.score, 0) / totalGames)
      : 0
    const topScore = entries[0]?.score || 0
    return { totalGames, avgScore, topScore, entries }
  }

  exportToCsv() {
    const entries = this.getEntries()
    const header = 'Sıra,Ad,Skor,Seviye,Doğru,Yanlış,Başarı%,Tarih'
    const rows = entries.map((e, i) => {
      const date = new Date(e.date).toLocaleString('tr-TR')
      const acc = e.stats?.accuracy ?? ''
      return `${i + 1},"${e.name}",${e.score},${e.level},${e.stats?.correct ?? ''},${e.stats?.wrong ?? ''},${acc},"${date}"`
    })
    return [header, ...rows].join('\n')
  }

  downloadCsv() {
    const csv = this.exportToCsv()
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `duyu-labirent-siralama-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
}

export const leaderboardManager = new LeaderboardManager()
