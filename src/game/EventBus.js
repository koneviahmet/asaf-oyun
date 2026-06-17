const listeners = new Map()

export const EventBus = {
  on(event, callback) {
    if (!listeners.has(event)) listeners.set(event, new Set())
    listeners.get(event).add(callback)
    return () => listeners.get(event).delete(callback)
  },

  emit(event, payload) {
    listeners.get(event)?.forEach((cb) => cb(payload))
  },

  off(event, callback) {
    listeners.get(event)?.delete(callback)
  },

  clear() {
    listeners.clear()
  },
}

export const Events = {
  ASK_QUESTION: 'ask-question',
  QUESTION_ANSWERED: 'question-answered',
  GAME_OVER: 'game-over',
  LEVEL_COMPLETE: 'level-complete',
  SCORE_UPDATE: 'score-update',
  START_GAME: 'start-game',
  TOUCH_MOVE: 'touch-move',
  PAUSE_GAME: 'pause-game',
  RESUME_GAME: 'resume-game',
  POWERUP_STATUS: 'powerup-status',
  SHOW_CONTROLS: 'show-controls',
}
