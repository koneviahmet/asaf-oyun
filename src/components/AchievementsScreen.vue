<script setup>
import { computed } from 'vue'
import { achievementManager } from '../game/systems/AchievementManager.js'

defineEmits(['close'])

const achievements = computed(() => achievementManager.getAll())
const unlockedCount = computed(() => achievements.value.filter((a) => a.unlocked).length)
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
    <div class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border-4 border-maze-gold bg-maze-floor p-6">
      <h2 class="mb-2 text-center font-pixel text-xs text-maze-gold">ROZETLER</h2>
      <p class="mb-6 text-center font-pixel text-[8px] text-gray-500">
        {{ unlockedCount }} / {{ achievements.length }} açıldı
      </p>

      <div class="space-y-2">
        <div
          v-for="a in achievements"
          :key="a.id"
          class="flex items-center gap-3 rounded border px-3 py-2"
          :class="a.unlocked ? 'border-maze-gold/50 bg-maze-gold/10' : 'border-maze-wall/30 bg-maze-wall/5 opacity-50'"
        >
          <span class="text-2xl">{{ a.icon }}</span>
          <div class="text-left">
            <p class="font-pixel text-[8px]" :class="a.unlocked ? 'text-maze-gold' : 'text-gray-500'">
              {{ a.title }}
            </p>
            <p class="font-pixel text-[6px] text-gray-500">{{ a.desc }}</p>
          </div>
          <span v-if="a.unlocked" class="ml-auto font-pixel text-[8px] text-maze-green">✓</span>
        </div>
      </div>

      <button
        class="mt-6 w-full rounded border-2 border-maze-wall py-3 font-pixel text-[8px] text-gray-400 hover:bg-maze-wall/30"
        @click="$emit('close')"
      >
        KAPAT
      </button>
    </div>
  </div>
</template>
