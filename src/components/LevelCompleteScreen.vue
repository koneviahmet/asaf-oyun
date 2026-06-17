<script setup>
defineProps({
  score: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  nextLevel: { type: Number, default: 2 },
  sessionStats: { type: Object, default: null },
  achievements: { type: Array, default: () => [] },
})

defineEmits(['continue'])
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
    <div class="w-full max-w-md rounded-lg border-4 border-maze-green bg-maze-floor p-8 text-center">
      <h2 class="mb-2 font-pixel text-sm text-maze-green">SEVİYE TAMAMLANDI!</h2>
      <p class="mb-4 font-pixel text-[9px] text-maze-gold">Seviye {{ level }} bitti!</p>
      <p class="mb-4 font-pixel text-[8px] text-gray-400">Skor: {{ score }}</p>

      <div v-if="sessionStats?.total > 0" class="mb-4 flex justify-center gap-4 font-pixel text-[8px]">
        <span class="text-maze-green">✓ {{ sessionStats.correct }}</span>
        <span class="text-maze-accent">✗ {{ sessionStats.wrong }}</span>
        <span class="text-gray-300">%{{ sessionStats.accuracy }}</span>
      </div>

      <div v-if="achievements.length" class="mb-4 rounded border border-maze-gold/30 bg-maze-gold/10 p-2">
        <p v-for="a in achievements" :key="a.id" class="font-pixel text-[8px] text-maze-gold">
          {{ a.icon }} {{ a.title }}
        </p>
      </div>

      <p class="mb-8 font-pixel text-[8px] leading-relaxed text-gray-300">
        Seviye {{ nextLevel }} daha zor bir labirentle başlıyor...
      </p>
      <button
        class="rounded border-2 border-maze-gold bg-maze-gold/20 px-8 py-3 font-pixel text-[9px] text-maze-gold hover:bg-maze-gold/40"
        @click="$emit('continue')"
      >
        DEVAM ET
      </button>
    </div>
  </div>
</template>
