<script setup>
import { ref, computed, onMounted } from 'vue'
import PixelBackground from './PixelBackground.vue'
import TopicSelector from './TopicSelector.vue'
import { leaderboardManager } from '../game/systems/LeaderboardManager.js'
import { gameSettings } from '../game/systems/GameSettings.js'
import { dailyChallenge } from '../game/systems/DailyChallenge.js'

defineProps({
  highScore: { type: Number, default: 0 },
  soundOn: { type: Boolean, default: true },
  soundVolume: { type: Number, default: 80 },
  isFullscreen: Boolean,
})

const emit = defineEmits([
  'start', 'practice', 'timed', 'daily', 'toggle-sound', 'toggle-fullscreen',
  'tutorial', 'leaderboard', 'teacher', 'achievements', 'volume-change',
])

const daily = computed(() => dailyChallenge.getToday())
const dailyDone = computed(() => dailyChallenge.isCompleted())

const playerName = ref('')
const nameError = ref('')
const selectedTopics = ref(null)
const selectedDifficulty = ref('normal')
const classModeActive = ref(false)

onMounted(() => {
  playerName.value = leaderboardManager.getPlayerName()
  classModeActive.value = gameSettings.isClassModeActive()
})

function onTopicsUpdate(topics) {
  selectedTopics.value = topics
  if (!classModeActive.value) gameSettings.setPlayerTopics(topics)
}

function onDifficultyUpdate(diff) {
  selectedDifficulty.value = diff
  if (!classModeActive.value) gameSettings.setPlayerDifficulty(diff)
}

function validateName() {
  if (!playerName.value.trim()) {
    nameError.value = 'Adını yaz!'
    return null
  }
  nameError.value = ''
  leaderboardManager.setPlayerName(playerName.value)
  return {
    name: playerName.value.trim(),
    topics: selectedTopics.value,
    difficulty: selectedDifficulty.value,
  }
}

function handleStart() {
  const data = validateName()
  if (data) emit('start', data)
}

function handlePractice() {
  const data = validateName()
  if (data) emit('practice', data)
}

function handleTimed() {
  const data = validateName()
  if (data) emit('timed', data)
}

function handleDaily() {
  const data = validateName()
  if (data) emit('daily', { ...data, challenge: daily.value })
}
</script>

<template>
  <div class="relative flex h-full w-full flex-col items-center justify-center overflow-y-auto bg-maze-floor px-4 py-8">
    <PixelBackground />

    <div class="absolute right-4 top-4 z-10 flex flex-col items-end gap-2">
      <div class="flex gap-2">
        <button
          class="rounded border-2 border-maze-wall bg-maze-wall/30 px-3 py-2 font-pixel text-[8px] text-gray-300 hover:bg-maze-wall/50"
          @click="$emit('toggle-fullscreen')"
        >
          {{ isFullscreen ? '⊡' : '⛶' }}
        </button>
        <button
          class="rounded border-2 border-maze-wall bg-maze-wall/30 px-3 py-2 font-pixel text-[8px] text-gray-300 hover:bg-maze-wall/50"
          @click="$emit('toggle-sound')"
        >
          {{ soundOn ? '🔊' : '🔇' }}
        </button>
      </div>
      <div class="flex w-28 items-center gap-2 rounded border border-maze-wall/40 bg-maze-wall/20 px-2 py-1">
        <input
          type="range"
          min="0"
          max="100"
          :value="soundVolume"
          class="w-full accent-maze-green"
          @input="$emit('volume-change', Number($event.target.value))"
        />
      </div>
    </div>

    <div class="relative z-10 mb-4 text-center">
      <h1 class="mb-2 font-pixel text-sm leading-relaxed text-maze-gold sm:text-base">
        DUYU<br />LABİRENTİ
      </h1>
      <p class="font-pixel text-[8px] text-gray-400">4. Sınıf — Duyu Organlarımız</p>
    </div>

    <div class="relative z-10 mb-3 w-full max-w-xs">
      <input
        v-model="playerName"
        type="text"
        maxlength="20"
        placeholder="Adını yaz..."
        class="w-full rounded border-2 border-maze-wall bg-maze-wall/20 px-4 py-3 text-center font-pixel text-[9px] text-white outline-none focus:border-maze-green"
        @keyup.enter="handleStart"
      />
      <p v-if="nameError" class="mt-2 text-center font-pixel text-[7px] text-maze-accent">{{ nameError }}</p>
    </div>

    <div class="relative z-10 mb-3 w-full max-w-xs">
      <TopicSelector
        :locked="classModeActive"
        @update:topics="onTopicsUpdate"
        @update:difficulty="onDifficultyUpdate"
      />
    </div>

    <div class="relative z-10 mb-4 rounded border border-maze-wall/50 bg-maze-wall/10 px-4 py-2 text-center">
      <p class="font-pixel text-[7px] text-gray-500">Rekor: <span class="text-maze-gold">{{ highScore }}</span></p>
    </div>

    <div class="relative z-10 mb-3 w-full max-w-xs">
      <button
        class="w-full rounded border-2 py-3 font-pixel text-[7px] transition"
        :class="dailyDone
          ? 'border-maze-wall/50 bg-maze-wall/10 text-gray-500'
          : 'border-maze-gold bg-maze-gold/15 text-maze-gold hover:bg-maze-gold/25'"
        :disabled="dailyDone"
        @click="handleDaily"
      >
        <span v-if="dailyDone">⭐ GÜNLÜK GÖREV TAMAMLANDI</span>
        <span v-else>
          ⭐ GÜNLÜK GÖREV
          <span class="mt-1 block text-[6px] text-gray-400">{{ daily.label }}</span>
          <span class="block text-[6px] text-maze-green">{{ daily.bonus }}x bonus skor</span>
        </span>
      </button>
    </div>

    <div class="relative z-10 flex w-full max-w-xs flex-col gap-2">
      <button
        class="rounded border-4 border-maze-green bg-maze-green/20 py-3 font-pixel text-[10px] text-maze-green hover:bg-maze-green/40"
        @click="handleStart"
      >
        LABİRENT OYUNU
      </button>
      <div class="grid grid-cols-2 gap-2">
        <button
          class="rounded border-2 border-maze-gold/60 bg-maze-gold/10 py-2 font-pixel text-[7px] text-maze-gold hover:bg-maze-gold/20"
          @click="handlePractice"
        >
          PRATİK MOD
          <span class="mt-1 block text-[6px] text-gray-500">10 soru</span>
        </button>
        <button
          class="rounded border-2 border-maze-accent/60 bg-maze-accent/10 py-2 font-pixel text-[7px] text-maze-accent hover:bg-maze-accent/20"
          @click="handleTimed"
        >
          ZAMAN YARIŞI
          <span class="mt-1 block text-[6px] text-gray-500">3 dakika</span>
        </button>
      </div>
      <div class="grid grid-cols-3 gap-1">
        <button
          class="rounded border border-maze-wall/50 py-2 font-pixel text-[6px] text-gray-400 hover:bg-maze-wall/20"
          @click="$emit('tutorial')"
        >
          NASIL OYNANIR
        </button>
        <button
          class="rounded border border-maze-wall/50 py-2 font-pixel text-[6px] text-gray-400 hover:bg-maze-wall/20"
          @click="$emit('leaderboard')"
        >
          SIRALAMA
        </button>
        <button
          class="rounded border border-maze-wall/50 py-2 font-pixel text-[6px] text-gray-400 hover:bg-maze-wall/20"
          @click="$emit('achievements')"
        >
          ROZETLER
        </button>
      </div>
      <button
        class="py-1 font-pixel text-[6px] text-gray-600 hover:text-gray-400"
        @click="$emit('teacher')"
      >
        Öğretmen Girişi
      </button>
    </div>
  </div>
</template>
