<script setup>
defineEmits(['close'])
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="mx-4 w-full max-w-sm rounded-lg border-4 border-maze-wall bg-maze-floor p-6">
      <h2 class="mb-4 text-center font-pixel text-sm text-maze-gold">KONTROLLER</h2>

      <div class="space-y-2 font-pixel text-[8px] text-gray-300">
        <p><span class="text-maze-green">WASD / Ok tuşları</span> — Hareket</p>
        <p><span class="text-maze-green">ESC / P</span> — Duraklat</p>
        <p><span class="text-maze-green">H / ?</span> — Bu yardım ekranı</p>
        <p><span class="text-maze-gold">Soru kartı</span> — Üzerine git, soruyu cevapla</p>
        <p><span class="text-maze-accent">Dinazor</span> — Yakalarsa soru sorar</p>
        <p><span class="text-blue-400">Kalkan 🛡</span> — Koruma (soru sırasında da aktif)</p>
        <p><span class="text-maze-gold">Hız ⚡</span> — 8 sn hızlı koşu</p>
        <p><span class="text-purple-400">Hayalet 👻</span> — 6 sn duvarlardan geç</p>
        <p><span class="text-cyan-300">Dondur ❄️</span> — 5 sn dinozorlar durur</p>
        <p><span class="text-red-400">Boss (5, 10, 15…)</span> — 2 vuruş gerekir</p>
      </div>

      <button
        class="mt-6 w-full rounded border-2 border-maze-green bg-maze-green/20 py-3 font-pixel text-[9px] text-maze-green hover:bg-maze-green/40"
        @click="$emit('close')"
      >
        TAMAM
      </button>
    </div>
  </div>
</template>
