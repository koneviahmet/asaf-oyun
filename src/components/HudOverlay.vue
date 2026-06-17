<script setup>
defineProps({
  score: { type: Number, default: 0 },
  highScore: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  playerName: { type: String, default: '' },
  difficultyLabel: { type: String, default: '' },
  sessionCorrect: { type: Number, default: 0 },
  sessionWrong: { type: Number, default: 0 },
  hasShield: Boolean,
  speedBoost: Boolean,
  ghostMode: Boolean,
  monstersFrozen: Boolean,
  visible: Boolean,
  soundOn: { type: Boolean, default: true },
  isFullscreen: Boolean,
})

defineEmits(['toggle-sound', 'toggle-fullscreen', 'pause'])
</script>

<template>
  <div
    v-if="visible"
    class="pointer-events-none fixed left-4 top-4 z-40 sm:left-auto sm:right-4"
  >
    <div class="rounded border-2 border-maze-wall bg-maze-floor/90 px-4 py-3 sm:text-right">
      <p v-if="playerName" class="mb-1 font-pixel text-[7px] text-maze-green">{{ playerName }}</p>
      <p class="font-pixel text-[8px] text-maze-gold">Skor: {{ score }}</p>
      <p class="mt-1 font-pixel text-[7px] text-gray-400">Rekor: {{ highScore }}</p>
      <p class="mt-1 font-pixel text-[7px] text-maze-green">Seviye: {{ level }}</p>
      <p v-if="difficultyLabel" class="mt-1 font-pixel text-[6px] text-gray-500">{{ difficultyLabel }}</p>
      <p v-if="sessionCorrect + sessionWrong > 0" class="mt-1 font-pixel text-[6px] text-gray-500">
        <span class="text-maze-green">{{ sessionCorrect }}✓</span>
        <span class="mx-1 text-maze-accent">{{ sessionWrong }}✗</span>
      </p>
      <p v-if="hasShield || speedBoost || ghostMode || monstersFrozen" class="mt-1 font-pixel text-[6px]">
        <span v-if="hasShield" class="text-blue-400">🛡</span>
        <span v-if="speedBoost" class="text-maze-gold">⚡</span>
        <span v-if="ghostMode" class="text-purple-400">👻</span>
        <span v-if="monstersFrozen" class="text-cyan-300">❄️</span>
      </p>
      <div class="pointer-events-auto mt-2 flex gap-2 sm:justify-end">
        <button
          class="font-pixel text-[7px] text-gray-400 hover:text-white"
          @click="$emit('pause')"
        >
          ⏸
        </button>
        <button
          class="font-pixel text-[7px] text-gray-400 hover:text-white"
          @click="$emit('toggle-fullscreen')"
        >
          {{ isFullscreen ? '⊡' : '⛶' }}
        </button>
        <button
          class="font-pixel text-[7px] text-gray-400 hover:text-white"
          @click="$emit('toggle-sound')"
        >
          {{ soundOn ? '🔊' : '🔇' }}
        </button>
      </div>
    </div>
  </div>
</template>
