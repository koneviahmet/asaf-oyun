<script setup>
import { ref, computed } from 'vue'
import { questions, getTopicStats } from '../game/data/questions.js'
import { gameSettings } from '../game/systems/GameSettings.js'
import { leaderboardManager } from '../game/systems/LeaderboardManager.js'
import { sessionHistory } from '../game/systems/SessionHistory.js'
import { printClassReport } from '../utils/printReport.js'
import TopicSelector from './TopicSelector.vue'

const props = defineProps({
  stats: { type: Object, default: () => ({ totalGames: 0, avgScore: 0, topScore: 0, entries: [] }) },
  topicAggregates: { type: Array, default: () => [] },
  entries: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'reset-leaderboard', 'clear-history', 'settings-changed'])

const TEACHER_PIN = '2024'
const pin = ref('')
const unlocked = ref(false)
const error = ref('')
const confirmReset = ref(false)
const classTopics = ref(null)
const classDifficulty = ref('normal')
const teacherTopicInit = ref(null)
const teacherDiffInit = ref('normal')
const showClassSettings = ref(false)
const exportDone = ref(false)
const exportSessionsDone = ref(false)
const confirmClearHistory = ref(false)

const topicStats = computed(() => getTopicStats())

function tryUnlock() {
  if (pin.value === TEACHER_PIN) {
    unlocked.value = true
    error.value = ''
    classTopics.value = gameSettings.getClassTopics()
    classDifficulty.value = gameSettings.getClassDifficulty() || 'normal'
    teacherTopicInit.value = classTopics.value?.length ? [...classTopics.value] : null
    teacherDiffInit.value = classDifficulty.value
  } else {
    error.value = 'Yanlış şifre!'
  }
}

function handleReset() {
  if (confirmReset.value) {
    emit('reset-leaderboard')
    confirmReset.value = false
  } else {
    confirmReset.value = true
  }
}

function handleExport() {
  leaderboardManager.downloadCsv()
  exportDone.value = true
  setTimeout(() => { exportDone.value = false }, 2000)
}

function handleExportSessions() {
  sessionHistory.downloadCsv()
  exportSessionsDone.value = true
  setTimeout(() => { exportSessionsDone.value = false }, 2000)
}

function handlePrint() {
  printClassReport({
    stats: props.stats,
    topicAggregates: props.topicAggregates,
    entries: props.entries.length ? props.entries : props.stats.entries,
  })
}

function handleClearHistory() {
  if (confirmClearHistory.value) {
    emit('clear-history')
    confirmClearHistory.value = false
  } else {
    confirmClearHistory.value = true
  }
}

function applyClassSettings() {
  gameSettings.setClassTopics(classTopics.value)
  gameSettings.setClassDifficulty(classDifficulty.value)
  emit('settings-changed')
}

function clearClassSettings() {
  gameSettings.clearClassTopics()
  classTopics.value = null
  classDifficulty.value = 'normal'
  emit('settings-changed')
}

function onTopicsUpdate(topics) {
  classTopics.value = topics
}

function onDifficultyUpdate(diff) {
  classDifficulty.value = diff
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
    <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border-4 border-maze-accent bg-maze-floor p-6">
      <h2 class="mb-4 text-center font-pixel text-xs text-maze-accent">ÖĞRETMEN PANELİ</h2>

      <div v-if="!unlocked" class="space-y-4">
        <p class="text-center font-pixel text-[7px] text-gray-400">Öğretmen şifresini girin</p>
        <input
          v-model="pin"
          type="password"
          maxlength="4"
          placeholder="Şifre"
          class="w-full rounded border-2 border-maze-wall bg-maze-wall/20 px-4 py-3 text-center font-pixel text-sm text-white outline-none focus:border-maze-accent"
          @keyup.enter="tryUnlock"
        />
        <p v-if="error" class="text-center font-pixel text-[7px] text-maze-accent">{{ error }}</p>
        <button
          class="w-full rounded border-2 border-maze-accent bg-maze-accent/20 py-3 font-pixel text-[8px] text-maze-accent hover:bg-maze-accent/40"
          @click="tryUnlock"
        >
          GİRİŞ
        </button>
      </div>

      <div v-else class="space-y-5">
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="rounded border border-maze-wall/50 bg-maze-wall/10 p-2">
            <p class="font-pixel text-[6px] text-gray-500">Oyun</p>
            <p class="font-pixel text-sm text-white">{{ stats.totalGames }}</p>
          </div>
          <div class="rounded border border-maze-wall/50 bg-maze-wall/10 p-2">
            <p class="font-pixel text-[6px] text-gray-500">Ort. Skor</p>
            <p class="font-pixel text-sm text-maze-green">{{ stats.avgScore }}</p>
          </div>
          <div class="rounded border border-maze-wall/50 bg-maze-wall/10 p-2">
            <p class="font-pixel text-[6px] text-gray-500">En Yüksek</p>
            <p class="font-pixel text-sm text-maze-gold">{{ stats.topScore }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button
            class="rounded border-2 border-maze-green bg-maze-green/20 py-2 font-pixel text-[7px] text-maze-green hover:bg-maze-green/40"
            @click="handleExport"
          >
            {{ exportDone ? 'İNDİRİLDİ!' : 'SIRALAMA CSV' }}
          </button>
          <button
            class="rounded border-2 border-maze-gold/50 bg-maze-gold/10 py-2 font-pixel text-[7px] text-maze-gold hover:bg-maze-gold/20"
            @click="handleExportSessions"
          >
            {{ exportSessionsDone ? 'İNDİRİLDİ!' : 'OTURUM CSV' }}
          </button>
          <button
            class="col-span-2 rounded border-2 border-maze-wall py-2 font-pixel text-[7px] text-gray-400 hover:bg-maze-wall/20"
            @click="handlePrint"
          >
            YAZDIR / PDF
          </button>
          <button
            class="col-span-2 rounded border-2 border-maze-wall py-2 font-pixel text-[7px] text-gray-400 hover:bg-maze-wall/20"
            @click="showClassSettings = !showClassSettings"
          >
            SINIF AYARI
          </button>
        </div>

        <div v-if="topicAggregates.length">
          <h3 class="mb-2 font-pixel text-[8px] text-maze-accent">Sınıf Konu Performansı</h3>
          <p class="mb-2 font-pixel text-[6px] text-gray-500">En düşük başarı oranı üstte</p>
          <div class="max-h-36 space-y-1 overflow-y-auto">
            <div
              v-for="t in topicAggregates"
              :key="t.topic"
              class="rounded bg-maze-wall/10 px-3 py-1"
            >
              <div class="flex justify-between font-pixel text-[6px]">
                <span class="text-gray-400">{{ t.topic }}</span>
                <span :class="t.accuracy >= 70 ? 'text-maze-green' : t.accuracy >= 50 ? 'text-maze-gold' : 'text-maze-accent'">
                  %{{ t.accuracy }}
                </span>
              </div>
              <div class="mt-1 h-1 rounded-full bg-maze-wall/30">
                <div
                  class="h-1 rounded-full transition-all"
                  :class="t.accuracy >= 70 ? 'bg-maze-green' : t.accuracy >= 50 ? 'bg-maze-gold' : 'bg-maze-accent'"
                  :style="{ width: `${t.accuracy}%` }"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-if="showClassSettings" class="space-y-3 rounded border border-maze-gold/30 bg-maze-gold/5 p-3">
          <p class="font-pixel text-[7px] text-maze-gold">Tüm sınıf için konu ve zorluk belirle</p>
          <TopicSelector
            :key="String(unlocked) + String(showClassSettings)"
            compact
            :initial-topics="teacherTopicInit"
            :initial-difficulty="teacherDiffInit"
            @update:topics="onTopicsUpdate"
            @update:difficulty="onDifficultyUpdate"
          />
          <div class="flex gap-2">
            <button
              class="flex-1 rounded border border-maze-green py-2 font-pixel text-[6px] text-maze-green hover:bg-maze-green/20"
              @click="applyClassSettings"
            >
              UYGULA
            </button>
            <button
              class="flex-1 rounded border border-maze-wall py-2 font-pixel text-[6px] text-gray-500 hover:bg-maze-wall/20"
              @click="clearClassSettings"
            >
              SIFIRLA
            </button>
          </div>
        </div>

        <div>
          <h3 class="mb-2 font-pixel text-[8px] text-maze-gold">Soru Bankası ({{ questions.length }} soru)</h3>
          <div class="space-y-1">
            <div
              v-for="t in topicStats"
              :key="t.topic"
              class="flex justify-between rounded bg-maze-wall/10 px-3 py-1"
            >
              <span class="font-pixel text-[6px] text-gray-400">{{ t.topic }}</span>
              <span class="font-pixel text-[6px] text-maze-green">{{ t.count }}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 class="mb-2 font-pixel text-[8px] text-maze-gold">Sıralama</h3>
          <div v-if="stats.entries.length === 0" class="font-pixel text-[7px] text-gray-500">Henüz skor yok</div>
          <div v-else class="max-h-32 space-y-1 overflow-y-auto">
            <div
              v-for="(e, i) in stats.entries"
              :key="e.date"
              class="flex justify-between font-pixel text-[6px] text-gray-400"
            >
              <span>{{ i + 1 }}. {{ e.name }}</span>
              <span>{{ e.score }} puan · Sv.{{ e.level }}</span>
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            class="flex-1 rounded border-2 py-2 font-pixel text-[7px] transition"
            :class="confirmReset ? 'border-maze-accent bg-maze-accent/30 text-maze-accent' : 'border-maze-wall text-gray-500 hover:bg-maze-wall/20'"
            @click="handleReset"
          >
            {{ confirmReset ? 'EMİN MİSİN?' : 'SIRALAMA SIFIRLA' }}
          </button>
          <button
            class="flex-1 rounded border-2 py-2 font-pixel text-[7px] transition"
            :class="confirmClearHistory ? 'border-maze-accent bg-maze-accent/30 text-maze-accent' : 'border-maze-wall text-gray-500 hover:bg-maze-wall/20'"
            @click="handleClearHistory"
          >
            {{ confirmClearHistory ? 'EMİN MİSİN?' : 'GEÇMİŞ SIFIRLA' }}
          </button>
        </div>
      </div>

      <button
        class="mt-4 w-full rounded border-2 border-maze-wall py-3 font-pixel text-[8px] text-gray-400 hover:bg-maze-wall/30"
        @click="emit('close')"
      >
        KAPAT
      </button>
    </div>
  </div>
</template>
