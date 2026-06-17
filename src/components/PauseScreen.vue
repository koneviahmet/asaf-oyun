<script setup>
defineProps({
  soundVolume: { type: Number, default: 80 },
})

defineEmits(['resume', 'menu', 'volume-change'])
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
    <div class="mx-4 w-full max-w-sm rounded-lg border-4 border-maze-wall bg-maze-floor p-8 text-center">
      <h2 class="mb-6 font-pixel text-sm text-maze-gold">DURAKLATILDI</h2>

      <div class="mb-6">
        <label class="mb-2 block font-pixel text-[7px] text-gray-400">SES: {{ soundVolume }}%</label>
        <input
          type="range"
          min="0"
          max="100"
          :value="soundVolume"
          class="w-full accent-maze-green"
          @input="$emit('volume-change', Number($event.target.value))"
        />
      </div>

      <div class="flex flex-col gap-3">
        <button
          class="rounded border-2 border-maze-green bg-maze-green/20 py-3 font-pixel text-[9px] text-maze-green hover:bg-maze-green/40"
          @click="$emit('resume')"
        >
          DEVAM ET
        </button>
        <button
          class="rounded border-2 border-maze-wall py-3 font-pixel text-[9px] text-gray-400 hover:bg-maze-wall/30"
          @click="$emit('menu')"
        >
          ANA MENÜ
        </button>
      </div>

      <p class="mt-6 font-pixel text-[7px] text-gray-500">ESC veya P tuşu ile devam et</p>
    </div>
  </div>
</template>
