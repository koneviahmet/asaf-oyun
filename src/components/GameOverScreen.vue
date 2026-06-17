<script setup>
defineProps({
  score: { type: Number, default: 0 },
  highScore: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  reason: { type: String, default: 'Oyun bitti!' },
  isNewRecord: Boolean,
  playerName: { type: String, default: '' },
  leaderboardRank: { type: Number, default: 0 },
  sessionStats: { type: Object, default: null },
  achievements: { type: Array, default: () => [] },
})

defineEmits(['restart', 'menu'])
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
    <div class="mx-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border-4 border-maze-accent bg-maze-floor p-6 text-center sm:p-8">
      <h2 class="mb-2 font-pixel text-sm text-maze-accent">OYUN BİTTİ</h2>
      <p v-if="playerName" class="mb-2 font-pixel text-[8px] text-maze-green">{{ playerName }}</p>
      <p class="mb-4 font-pixel text-[8px] leading-relaxed text-gray-300">{{ reason }}</p>

      <div class="mb-2 font-pixel text-[8px] text-gray-400">Skorun</div>
      <div class="mb-1 font-pixel text-2xl text-white">{{ score }}</div>
      <div v-if="isNewRecord" class="mb-2 font-pixel text-[8px] text-maze-gold">YENİ REKOR!</div>
      <div v-if="leaderboardRank > 0" class="mb-4 font-pixel text-[8px] text-maze-gold">
        Sınıf sıralaması: {{ leaderboardRank }}. sıra!
      </div>

      <div
        v-if="sessionStats && sessionStats.total > 0"
        class="mb-4 rounded border border-maze-wall/50 bg-maze-wall/10 p-3 text-left"
      >
        <p class="mb-2 text-center font-pixel text-[8px] text-maze-gold">Soru Performansı</p>
        <div class="flex justify-center gap-4 font-pixel text-[8px]">
          <span class="text-maze-green">✓ {{ sessionStats.correct }}</span>
          <span class="text-maze-accent">✗ {{ sessionStats.wrong }}</span>
          <span class="text-gray-300">%{{ sessionStats.accuracy }}</span>
        </div>
        <div v-if="sessionStats.weakTopics?.length" class="mt-3 space-y-1">
          <p class="font-pixel text-[6px] text-gray-500">Geliştirilmesi gereken konular:</p>
          <p
            v-for="t in sessionStats.weakTopics.slice(0, 3)"
            :key="t.topic"
            class="font-pixel text-[6px] text-gray-400"
          >
            {{ t.topic }} (%{{ t.accuracy }})
          </p>
        </div>
      </div>

      <div v-if="achievements.length" class="mb-4 rounded border border-maze-gold/30 bg-maze-gold/10 p-3">
        <p class="mb-2 font-pixel text-[8px] text-maze-gold">Yeni Rozet!</p>
        <p v-for="a in achievements" :key="a.id" class="font-pixel text-[8px] text-gray-300">
          {{ a.icon }} {{ a.title }}
        </p>
      </div>

      <div class="mb-6 font-pixel text-[8px] text-gray-500">
        Seviye {{ level }} | Rekor: {{ highScore }}
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          class="rounded border-2 border-maze-green bg-maze-green/20 px-6 py-3 font-pixel text-[9px] text-maze-green hover:bg-maze-green/40"
          @click="$emit('restart')"
        >
          TEKRAR DENE
        </button>
        <button
          class="rounded border-2 border-maze-wall px-6 py-3 font-pixel text-[9px] text-gray-400 hover:bg-maze-wall/30"
          @click="$emit('menu')"
        >
          ANA MENÜ
        </button>
      </div>
    </div>
  </div>
</template>
