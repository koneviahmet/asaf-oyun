<script setup>
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import StartScreen from './components/StartScreen.vue'
import QuestionModal from './components/QuestionModal.vue'
import GameOverScreen from './components/GameOverScreen.vue'
import LevelCompleteScreen from './components/LevelCompleteScreen.vue'
import PauseScreen from './components/PauseScreen.vue'
import TutorialOverlay from './components/TutorialOverlay.vue'
import LeaderboardScreen from './components/LeaderboardScreen.vue'
import TeacherPanel from './components/TeacherPanel.vue'
import QuizMode from './components/QuizMode.vue'
import QuizResultScreen from './components/QuizResultScreen.vue'
import AchievementsScreen from './components/AchievementsScreen.vue'
import HudOverlay from './components/HudOverlay.vue'
import TouchControls from './components/TouchControls.vue'
import ControlsOverlay from './components/ControlsOverlay.vue'
import { EventBus, Events } from './game/EventBus.js'
import { ScoreManager } from './game/systems/ScoreManager.js'
import { leaderboardManager } from './game/systems/LeaderboardManager.js'
import { SessionStats } from './game/systems/SessionStats.js'
import { sessionHistory } from './game/systems/SessionHistory.js'
import { achievementManager } from './game/systems/AchievementManager.js'
import { dailyChallenge } from './game/systems/DailyChallenge.js'
import { soundManager } from './game/systems/SoundManager.js'
import { gameSettings, Difficulties } from './game/systems/GameSettings.js'
import { useFullscreen } from './composables/useFullscreen.js'

const PhaserGame = defineAsyncComponent(() => import('./game/PhaserGame.vue'))

const TUTORIAL_KEY = 'duyuLabirentTutorial'

const screen = ref('menu')
const showQuestion = ref(false)
const showPause = ref(false)
const showTutorial = ref(!localStorage.getItem(TUTORIAL_KEY))
const showLeaderboard = ref(false)
const showTeacher = ref(false)
const showAchievements = ref(false)
const showQuizResult = ref(false)
const quizMode = ref('practice')
const quizKey = ref(0)
const isDailyChallenge = ref(false)
const hasShield = ref(false)
const speedBoost = ref(false)
const ghostMode = ref(false)
const monstersFrozen = ref(false)
const questionContext = ref('entry')
const questionExcludeIds = ref([])
const gameKey = ref(0)
const currentLevel = ref(1)
const soundOn = ref(soundManager.isEnabled())
const soundVolume = ref(soundManager.getVolume())
const showControls = ref(false)
const playerName = ref(leaderboardManager.getPlayerName())
const leaderboardRank = ref(0)
const activeTopics = ref(gameSettings.getActiveTopics())
const activeDifficulty = ref(gameSettings.getActiveDifficulty())
const lastSessionStats = ref(null)
const caughtThisLevel = ref(false)
const gameAchievements = ref([])
const quizResult = ref({ correct: 0, wrong: 0, mode: 'practice', achievements: [] })

const sessionStats = new SessionStats()
const scoreManager = new ScoreManager()
const score = ref(0)
const highScore = ref(scoreManager.getHighScore())
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

const gameOverData = ref({ score: 0, highScore: 0, level: 1, reason: '' })
const levelCompleteData = ref({ score: 0, level: 1, nextLevel: 2 })

const leaderboardEntries = ref(leaderboardManager.getEntries())
const teacherStats = ref(leaderboardManager.getStats())
const topicAggregates = ref(sessionHistory.getTopicAggregates())

const isNewRecord = computed(() => gameOverData.value.score >= gameOverData.value.highScore && gameOverData.value.score > 0)

function refreshLeaderboard() {
  leaderboardEntries.value = leaderboardManager.getEntries()
  teacherStats.value = leaderboardManager.getStats()
  topicAggregates.value = sessionHistory.getTopicAggregates()
}

function toggleSound() {
  soundOn.value = soundManager.toggle()
}

function setVolume(v) {
  soundVolume.value = soundManager.setVolume(v)
}

function closeTutorial() {
  showTutorial.value = false
  localStorage.setItem(TUTORIAL_KEY, '1')
}

function openTutorial() { showTutorial.value = true }
function openLeaderboard() { refreshLeaderboard(); showLeaderboard.value = true }
function openTeacher() { refreshLeaderboard(); showTeacher.value = true }
function openAchievements() { showAchievements.value = true }

function handleResetLeaderboard() {
  leaderboardManager.clearLeaderboard()
  refreshLeaderboard()
}

function handleClearHistory() {
  sessionHistory.clear()
  refreshLeaderboard()
}

function refreshSettings() {
  activeTopics.value = gameSettings.getActiveTopics()
  activeDifficulty.value = gameSettings.getActiveDifficulty()
}

function applyPlayerSettings({ name, topics, difficulty }) {
  playerName.value = name
  activeTopics.value = topics ?? gameSettings.getActiveTopics()
  activeDifficulty.value = difficulty ?? gameSettings.getActiveDifficulty()
}

function buildStatsSnapshot() {
  return {
    ...sessionStats.toJSON(),
    weakTopics: sessionStats.weakTopics,
    total: sessionStats.total,
  }
}

function handleStart(data) {
  applyPlayerSettings(data)
  isDailyChallenge.value = false
  scoreManager.setMultiplier(1)
  sessionStats.reset()
  lastSessionStats.value = null
  caughtThisLevel.value = false
  gameAchievements.value = []
  hasShield.value = false
  speedBoost.value = false
  ghostMode.value = false
  monstersFrozen.value = false
  soundManager.resume()
  questionContext.value = 'entry'
  questionExcludeIds.value = []
  showQuestion.value = true
}

function handleDaily({ name, challenge }) {
  applyPlayerSettings({ name, topics: challenge.topics, difficulty: activeDifficulty.value })
  isDailyChallenge.value = true
  scoreManager.setMultiplier(challenge.bonus)
  activeTopics.value = challenge.topics
  sessionStats.reset()
  caughtThisLevel.value = false
  gameAchievements.value = []
  soundManager.resume()
  questionContext.value = 'entry'
  questionExcludeIds.value = []
  showQuestion.value = true
}

function completeDailyChallenge(score) {
  if (!isDailyChallenge.value || dailyChallenge.isCompleted()) return
  dailyChallenge.markCompleted(score)
  dailyChallenge.updateStreak()
  const ach = achievementManager.checkDailyChallenge()
  if (ach) gameAchievements.value = [...gameAchievements.value, ach]
}

function handlePractice(data) {
  applyPlayerSettings(data)
  quizMode.value = 'practice'
  screen.value = 'quiz'
}

function handleTimed(data) {
  applyPlayerSettings(data)
  quizMode.value = 'timed'
  screen.value = 'quiz'
}

function handleQuizFinish(result) {
  quizResult.value = result
  showQuizResult.value = true
  screen.value = 'menu'
}

function handleQuizRetry() {
  showQuizResult.value = false
  quizKey.value++
  screen.value = 'quiz'
}

function handleSettingsChanged() {
  refreshSettings()
}

function handleQuestionAnswer({ correct, questionId, topic }) {
  if (questionContext.value === 'entry') {
    if (correct) {
      showQuestion.value = false
      sessionStats.reset()
      if (topic) sessionStats.record(topic, true)
      scoreManager.reset()
      score.value = 0
      highScore.value = scoreManager.getHighScore()
      currentLevel.value = 1
      caughtThisLevel.value = false
      gameKey.value++
      screen.value = 'playing'
    }
    return
  }

  if (questionContext.value === 'catch') caughtThisLevel.value = true
  if (topic) sessionStats.record(topic, correct)
  showQuestion.value = false
  EventBus.emit(Events.QUESTION_ANSWERED, { correct, questionId })
}

function handlePause() { EventBus.emit(Events.PAUSE_GAME) }
function handleResume() { EventBus.emit(Events.RESUME_GAME) }

function handlePauseMenu() {
  showPause.value = false
  soundManager.stopMusic()
  screen.value = 'menu'
  highScore.value = scoreManager.getHighScore()
  refreshLeaderboard()
}

function handleGameOver(data) {
  soundManager.stopMusic()
  showPause.value = false
  gameOverData.value = data

  const stats = buildStatsSnapshot()
  lastSessionStats.value = stats
  gameAchievements.value = [
    ...gameAchievements.value,
    ...achievementManager.checkAfterGame({
      score: data.score,
      level: data.level,
      sessionStats: stats,
    }),
  ]
  if (data.score > 0) completeDailyChallenge(data.score)
  isDailyChallenge.value = false
  scoreManager.setMultiplier(1)

  const result = leaderboardManager.saveEntry(playerName.value, data.score, data.level, stats)
  leaderboardRank.value = result?.rank || 0

  sessionHistory.add({ name: playerName.value, score: data.score, level: data.level, stats })
  refreshLeaderboard()
  screen.value = 'gameover'
}

function handleLevelComplete(data) {
  soundManager.stopMusic()
  showPause.value = false

  if (!caughtThisLevel.value) {
    const a = achievementManager.checkLevelNoCatch()
    if (a) gameAchievements.value = [...gameAchievements.value, a]
  }

  if (data.isBossLevel) {
    const a = achievementManager.checkBossLevel()
    if (a) gameAchievements.value = [...gameAchievements.value, a]
  }

  if (isDailyChallenge.value) completeDailyChallenge(data.score)

  levelCompleteData.value = data
  screen.value = 'levelcomplete'
}

function handleContinueLevel() {
  currentLevel.value = levelCompleteData.value.nextLevel
  score.value = levelCompleteData.value.score
  caughtThisLevel.value = false
  gameKey.value++
  screen.value = 'playing'
}

function handleRestart() {
  sessionStats.reset()
  lastSessionStats.value = null
  caughtThisLevel.value = false
  gameAchievements.value = []
  scoreManager.reset()
  score.value = 0
  currentLevel.value = 1
  leaderboardRank.value = 0
  gameKey.value++
  screen.value = 'playing'
}

function handleMenu() {
  soundManager.stopMusic()
  isDailyChallenge.value = false
  scoreManager.setMultiplier(1)
  screen.value = 'menu'
  highScore.value = scoreManager.getHighScore()
  refreshLeaderboard()
}

function handlePowerUpStatus({ shield, speedBoost: speed, ghostMode: ghost, monstersFrozen: frozen }) {
  hasShield.value = shield
  speedBoost.value = speed
  ghostMode.value = ghost
  monstersFrozen.value = frozen
}

function handleScoreUpdate(data) {
  score.value = data.score
  highScore.value = data.highScore
}

function handleAskQuestion({ context, excludeIds }) {
  showPause.value = false
  questionContext.value = context
  questionExcludeIds.value = excludeIds || []
  showQuestion.value = true
}

function handlePauseGame() { showPause.value = true }
function handleResumeGame() { showPause.value = false }
function handleShowControls() { showControls.value = true }

onMounted(() => {
  EventBus.on(Events.ASK_QUESTION, handleAskQuestion)
  EventBus.on(Events.GAME_OVER, handleGameOver)
  EventBus.on(Events.LEVEL_COMPLETE, handleLevelComplete)
  EventBus.on(Events.SCORE_UPDATE, handleScoreUpdate)
  EventBus.on(Events.PAUSE_GAME, handlePauseGame)
  EventBus.on(Events.RESUME_GAME, handleResumeGame)
  EventBus.on(Events.POWERUP_STATUS, handlePowerUpStatus)
  EventBus.on(Events.SHOW_CONTROLS, handleShowControls)
})

onUnmounted(() => {
  EventBus.clear()
  soundManager.stopMusic()
})
</script>

<template>
  <div class="h-full w-full">
    <TutorialOverlay v-if="showTutorial" @close="closeTutorial" />

    <StartScreen
      v-if="screen === 'menu'"
      :high-score="highScore"
      :sound-on="soundOn"
      :sound-volume="soundVolume"
      :is-fullscreen="isFullscreen"
      @start="handleStart"
      @practice="handlePractice"
      @timed="handleTimed"
      @daily="handleDaily"
      @toggle-sound="toggleSound"
      @volume-change="setVolume"
      @toggle-fullscreen="toggleFullscreen"
      @tutorial="openTutorial"
      @leaderboard="openLeaderboard"
      @teacher="openTeacher"
      @achievements="openAchievements"
    />

    <template v-if="screen === 'playing'">
      <PhaserGame
        :key="gameKey"
        :level="currentLevel"
        :difficulty="activeDifficulty"
        :score-manager="scoreManager"
      />
      <HudOverlay
        :visible="true"
        :score="score"
        :high-score="highScore"
        :level="currentLevel"
        :player-name="playerName"
        :difficulty-label="Difficulties[activeDifficulty]?.label"
        :session-correct="sessionStats.correct"
        :session-wrong="sessionStats.wrong"
        :has-shield="hasShield"
        :speed-boost="speedBoost"
        :ghost-mode="ghostMode"
        :monsters-frozen="monstersFrozen"
        :sound-on="soundOn"
        :is-fullscreen="isFullscreen"
        @toggle-sound="toggleSound"
        @toggle-fullscreen="toggleFullscreen"
        @pause="handlePause"
      />
      <TouchControls />
    </template>

    <QuizMode
      v-if="screen === 'quiz'"
      :key="`${quizMode}-${quizKey}`"
      :mode="quizMode"
      :player-name="playerName"
      :topic-filter="activeTopics"
      @finish="handleQuizFinish"
      @menu="handleMenu"
    />

    <QuestionModal
      :show="showQuestion"
      :context="questionContext"
      :exclude-ids="questionExcludeIds"
      :topic-filter="activeTopics"
      @answer="handleQuestionAnswer"
    />

    <PauseScreen
      v-if="showPause && screen === 'playing'"
      :sound-volume="soundVolume"
      @resume="handleResume"
      @menu="handlePauseMenu"
      @volume-change="setVolume"
    />

    <ControlsOverlay
      v-if="showControls && screen === 'playing'"
      @close="showControls = false"
    />

    <LeaderboardScreen
      v-if="showLeaderboard"
      :entries="leaderboardEntries"
      @close="showLeaderboard = false"
    />

    <AchievementsScreen
      v-if="showAchievements"
      @close="showAchievements = false"
    />

    <TeacherPanel
      v-if="showTeacher"
      :stats="teacherStats"
      :topic-aggregates="topicAggregates"
      :entries="leaderboardEntries"
      @close="showTeacher = false"
      @reset-leaderboard="handleResetLeaderboard"
      @clear-history="handleClearHistory"
      @settings-changed="handleSettingsChanged"
    />

    <QuizResultScreen
      v-if="showQuizResult"
      :player-name="playerName"
      :correct="quizResult.correct"
      :wrong="quizResult.wrong"
      :mode="quizResult.mode"
      :achievements="quizResult.achievements"
      @retry="handleQuizRetry"
      @menu="showQuizResult = false"
    />

    <GameOverScreen
      v-if="screen === 'gameover'"
      :score="gameOverData.score"
      :high-score="gameOverData.highScore"
      :level="gameOverData.level"
      :reason="gameOverData.reason"
      :is-new-record="isNewRecord"
      :player-name="playerName"
      :leaderboard-rank="leaderboardRank"
      :session-stats="lastSessionStats"
      :achievements="gameAchievements"
      @restart="handleRestart"
      @menu="handleMenu"
    />

    <LevelCompleteScreen
      v-if="screen === 'levelcomplete'"
      :score="levelCompleteData.score"
      :level="levelCompleteData.level"
      :next-level="levelCompleteData.nextLevel"
      :session-stats="buildStatsSnapshot()"
      :achievements="gameAchievements"
      @continue="handleContinueLevel"
    />
  </div>
</template>
