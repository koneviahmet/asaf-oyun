<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getRandomQuestion } from '../game/data/questions.js'
import { soundManager } from '../game/systems/SoundManager.js'
import { achievementManager } from '../game/systems/AchievementManager.js'

const props = defineProps({
  mode: { type: String, required: true }, // 'practice' | 'timed'
  playerName: { type: String, default: '' },
  topicFilter: { type: Array, default: null },
  timeLimit: { type: Number, default: 180 },
  questionCount: { type: Number, default: 10 },
})

const emit = defineEmits(['finish', 'menu'])

const currentQuestion = ref(null)
const selectedIndex = ref(null)
const feedback = ref('')
const answered = ref(false)
const correctCount = ref(0)
const wrongCount = ref(0)
const questionIndex = ref(0)
const usedIds = ref([])
const streak = ref(0)
const timeLeft = ref(props.timeLimit)
const finished = ref(false)
const newAchievements = ref([])
let timerId = null

const isTimed = computed(() => props.mode === 'timed')
const totalQuestions = computed(() => (isTimed.value ? correctCount.value + wrongCount.value : props.questionCount))
const progress = computed(() => {
  if (isTimed.value) return `${correctCount.value} doğru`
  return `${questionIndex.value}/${props.questionCount}`
})

function loadQuestion() {
  currentQuestion.value = getRandomQuestion(usedIds.value, props.topicFilter)
  usedIds.value.push(currentQuestion.value.id)
  selectedIndex.value = null
  feedback.value = ''
  answered.value = false
}

function selectOption(index) {
  if (answered.value || finished.value) return
  selectedIndex.value = index
}

function nextQuestion() {
  if (isTimed.value) {
    loadQuestion()
    return
  }
  questionIndex.value++
  if (questionIndex.value >= props.questionCount) {
    endQuiz()
  } else {
    loadQuestion()
  }
}

function endQuiz() {
  finished.value = true
  if (timerId) clearInterval(timerId)

  const ach = isTimed.value
    ? achievementManager.checkTimed(correctCount.value)
    : achievementManager.checkQuizPerfect(correctCount.value, props.questionCount)
  if (ach) newAchievements.value.push(ach)

  emit('finish', {
    correct: correctCount.value,
    wrong: wrongCount.value,
    mode: props.mode,
    achievements: newAchievements.value,
  })
}

function submit() {
  if (selectedIndex.value === null || answered.value) return
  answered.value = true
  const correct = selectedIndex.value === currentQuestion.value.correct

  if (correct) {
    soundManager.playCorrect()
    correctCount.value++
    streak.value++
    const ach = achievementManager.checkStreak(streak.value)
    if (ach) newAchievements.value.push(ach)
    feedback.value = 'Doğru!'
  } else {
    soundManager.playWrong()
    wrongCount.value++
    streak.value = 0
    feedback.value = `Yanlış! Doğru: ${currentQuestion.value.options[currentQuestion.value.correct]}`
  }

  setTimeout(nextQuestion, isTimed.value ? 600 : 1000)
}

onMounted(() => {
  loadQuestion()
  if (isTimed.value) {
    timerId = setInterval(() => {
      timeLeft.value--
      if (timeLeft.value <= 0) endQuiz()
    }, 1000)
  }
})

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})

function formatTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}
</script>

<template>
  <div v-if="!finished" class="flex h-full flex-col bg-maze-floor">
    <div class="flex items-center justify-between border-b border-maze-wall/50 px-4 py-3">
      <button class="font-pixel text-[8px] text-gray-500 hover:text-white" @click="emit('menu')">← Menü</button>
      <span class="font-pixel text-[8px] text-maze-green">{{ playerName }}</span>
      <span class="font-pixel text-[8px] text-maze-gold">
        {{ isTimed ? formatTime(timeLeft) : progress }}
      </span>
    </div>

    <div class="flex flex-1 flex-col items-center justify-center px-4 py-6">
      <p class="mb-2 font-pixel text-[8px] text-maze-accent">
        {{ isTimed ? 'ZAMAN YARIŞI' : 'PRATİK MOD' }}
      </p>
      <p class="mb-1 font-pixel text-[7px] text-maze-green">{{ currentQuestion?.topic }}</p>
      <p class="mb-8 max-w-lg text-center font-pixel text-[10px] leading-relaxed text-white">
        {{ currentQuestion?.question }}
      </p>

      <div class="w-full max-w-lg space-y-3">
        <button
          v-for="(option, index) in currentQuestion?.options"
          :key="index"
          class="w-full rounded border-2 px-4 py-3 text-left font-pixel text-[9px] transition"
          :class="[
            selectedIndex === index ? 'border-maze-green bg-maze-green/20 text-maze-green' : 'border-maze-wall bg-maze-wall/30 text-gray-200 hover:border-maze-accent',
            answered ? 'pointer-events-none opacity-70' : '',
          ]"
          @click="selectOption(index)"
        >
          {{ String.fromCharCode(65 + index) }}) {{ option }}
        </button>
      </div>

      <p
        v-if="feedback"
        class="mt-4 font-pixel text-[8px]"
        :class="feedback.startsWith('Doğru') ? 'text-maze-green' : 'text-maze-accent'"
      >
        {{ feedback }}
      </p>

      <div class="mt-4 flex gap-4 font-pixel text-[8px] text-gray-500">
        <span class="text-maze-green">✓ {{ correctCount }}</span>
        <span class="text-maze-accent">✗ {{ wrongCount }}</span>
      </div>

      <button
        v-if="!answered"
        class="mt-6 rounded border-2 border-maze-gold bg-maze-gold/20 px-10 py-3 font-pixel text-[9px] text-maze-gold hover:bg-maze-gold/40 disabled:opacity-40"
        :disabled="selectedIndex === null"
        @click="submit"
      >
        CEVAPLA
      </button>
    </div>
  </div>
</template>
