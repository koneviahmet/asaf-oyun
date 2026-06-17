export class SessionStats {
  constructor() {
    this.correct = 0
    this.wrong = 0
    this.byTopic = {}
  }

  record(topic, correct) {
    if (correct) this.correct++
    else this.wrong++

    if (!this.byTopic[topic]) this.byTopic[topic] = { correct: 0, wrong: 0 }
    this.byTopic[topic][correct ? 'correct' : 'wrong']++
  }

  get total() {
    return this.correct + this.wrong
  }

  get accuracy() {
    return this.total ? Math.round((this.correct / this.total) * 100) : 0
  }

  get weakTopics() {
    return Object.entries(this.byTopic)
      .map(([topic, s]) => ({
        topic,
        ...s,
        total: s.correct + s.wrong,
        accuracy: s.correct + s.wrong ? Math.round((s.correct / (s.correct + s.wrong)) * 100) : 0,
      }))
      .filter((t) => t.total > 0)
      .sort((a, b) => a.accuracy - b.accuracy)
  }

  toJSON() {
    return {
      correct: this.correct,
      wrong: this.wrong,
      accuracy: this.accuracy,
      byTopic: { ...this.byTopic },
    }
  }

  reset() {
    this.correct = 0
    this.wrong = 0
    this.byTopic = {}
  }
}
