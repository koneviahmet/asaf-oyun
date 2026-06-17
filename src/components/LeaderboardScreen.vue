<script setup>
defineProps({
  entries: { type: Array, default: () => [] },
})

defineEmits(['close'])
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
    <div class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border-4 border-maze-gold bg-maze-floor p-6">
      <h2 class="mb-6 text-center font-pixel text-xs text-maze-gold">SINIF SIRALAMASI</h2>

      <div v-if="entries.length === 0" class="py-8 text-center font-pixel text-[8px] text-gray-500">
        Henüz skor yok. İlk sen ol!
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="(entry, i) in entries"
          :key="entry.date + entry.name"
          class="flex items-center gap-3 rounded border px-3 py-2"
          :class="i === 0 ? 'border-maze-gold bg-maze-gold/10' : 'border-maze-wall/50 bg-maze-wall/10'"
        >
          <span class="w-6 font-pixel text-[10px]" :class="i < 3 ? 'text-maze-gold' : 'text-gray-500'">
            {{ i + 1 }}.
          </span>
          <div class="flex-1">
            <p class="font-pixel text-[8px] text-white">{{ entry.name }}</p>
            <p class="font-pixel text-[6px] text-gray-500">
              Sv.{{ entry.level }}
              <span v-if="entry.stats?.accuracy != null"> · %{{ entry.stats.accuracy }}</span>
              · {{ new Date(entry.date).toLocaleDateString('tr-TR') }}
            </p>
          </div>
          <span class="font-pixel text-[9px] text-maze-green">{{ entry.score }}</span>
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
