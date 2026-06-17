<script setup>
const emit = defineEmits(['close'])

const steps = [
  { icon: '🎮', text: 'WASD veya ok tuşları ile hareket et. Mobilde sol alttaki yön tuşlarını kullan.' },
  { icon: '❓', text: 'Altın soru kartlarından geçince duyu organları sorusu çıkar.' },
  { icon: '✅', text: 'Doğru cevap → rastgele bir dinazor ölür. Yanlış cevap → ekstra dinazor gelir.' },
  { icon: '👾', text: 'Dinazor seni yakalarsa soru sorar. Bilirsen kaçarsın, bilmezsen oyun biter.' },
  { icon: '🏆', text: 'Tüm dinazorları yenince sonraki seviyeye geç. En yüksek skoru kır!' },
]
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
    <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border-4 border-maze-gold bg-maze-floor p-6">
      <h2 class="mb-6 text-center font-pixel text-xs text-maze-gold">NASIL OYNANIR?</h2>

      <div class="space-y-4">
        <div
          v-for="(step, i) in steps"
          :key="i"
          class="flex items-start gap-3 rounded border border-maze-wall/50 bg-maze-wall/10 p-3"
        >
          <span class="text-xl">{{ step.icon }}</span>
          <p class="font-pixel text-[8px] leading-relaxed text-gray-300">{{ step.text }}</p>
        </div>
      </div>

      <button
        class="mt-6 w-full rounded border-2 border-maze-green bg-maze-green/20 py-3 font-pixel text-[9px] text-maze-green hover:bg-maze-green/40"
        @click="emit('close')"
      >
        ANLADIM, BAŞLA!
      </button>
    </div>
  </div>
</template>
