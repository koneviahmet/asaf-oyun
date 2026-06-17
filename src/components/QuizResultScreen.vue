<script setup>
defineProps({
  playerName: { type: String, default: '' },
  correct: { type: Number, default: 0 },
  wrong: { type: Number, default: 0 },
  mode: { type: String, default: 'practice' },
  achievements: { type: Array, default: () => [] },
})

defineEmits(['menu', 'retry'])
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
    <div class="w-full max-w-md rounded-lg border-4 border-maze-gold bg-maze-floor p-8 text-center">
      <h2 class="mb-2 font-pixel text-sm text-maze-gold">
        {{ mode === 'timed' ? 'SÜRE DOLDU!' : 'PRATİK BİTTİ!' }}
      </h2>
      <p v-if="playerName" class="mb-4 font-pixel text-[8px] text-maze-green">{{ playerName }}</p>

      <div class="mb-6 flex justify-center gap-8">
        <div>
          <p class="font-pixel text-2xl text-maze-green">{{ correct }}</p>
          <p class="font-pixel text-[7px] text-gray-500">Doğru</p>
        </div>
        <div>
          <p class="font-pixel text-2xl text-maze-accent">{{ wrong }}</p>
          <p class="font-pixel text-[7px] text-gray-500">Yanlış</p>
        </div>
        <div>
          <p class="font-pixel text-2xl text-white">
            {{ correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0 }}%
          </p>
          <p class="font-pixel text-[7px] text-gray-500">Başarı</p>
        </div>
      </div>

      <div v-if="achievements.length" class="mb-6 rounded border border-maze-gold/30 bg-maze-gold/10 p-3">
        <p class="mb-2 font-pixel text-[8px] text-maze-gold">Yeni Rozet!</p>
        <div v-for="a in achievements" :key="a.id" class="font-pixel text-[8px] text-gray-300">
          {{ a.icon }} {{ a.title }}
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <button
          class="rounded border-2 border-maze-green bg-maze-green/20 py-3 font-pixel text-[9px] text-maze-green hover:bg-maze-green/40"
          @click="$emit('retry')"
        >
          TEKRAR DENE
        </button>
        <button
          class="rounded border-2 border-maze-wall py-3 font-pixel text-[9px] text-gray-400 hover:bg-maze-wall/30"
          @click="$emit('menu')"
        >
          ANA MENÜ
        </button>
      </div>
    </div>
  </div>
</template>
