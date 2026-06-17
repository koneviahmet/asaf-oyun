<script setup>
import { ref, onUnmounted } from 'vue'
import { EventBus, Events } from '../game/EventBus.js'

const activeDir = ref(null)
let intervalId = null

const dirs = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

function startDir(name) {
  activeDir.value = name
  EventBus.emit(Events.TOUCH_MOVE, dirs[name])
  intervalId = setInterval(() => EventBus.emit(Events.TOUCH_MOVE, dirs[name]), 50)
}

function stopDir() {
  activeDir.value = null
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  EventBus.emit(Events.TOUCH_MOVE, { x: 0, y: 0 })
}

onUnmounted(stopDir)
</script>

<template>
  <div class="pointer-events-none fixed bottom-6 left-6 z-40 sm:bottom-8 sm:left-8">
    <div class="pointer-events-auto grid grid-cols-3 grid-rows-3 gap-1">
      <div />
      <button
        class="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-maze-wall bg-maze-floor/80 font-pixel text-lg text-maze-green active:bg-maze-green/30 sm:h-16 sm:w-16"
        :class="activeDir === 'up' ? 'bg-maze-green/30' : ''"
        @touchstart.prevent="startDir('up')"
        @touchend.prevent="stopDir"
        @touchcancel.prevent="stopDir"
        @mousedown.prevent="startDir('up')"
        @mouseup.prevent="stopDir"
        @mouseleave.prevent="stopDir"
      >
        ▲
      </button>
      <div />
      <button
        class="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-maze-wall bg-maze-floor/80 font-pixel text-lg text-maze-green active:bg-maze-green/30 sm:h-16 sm:w-16"
        :class="activeDir === 'left' ? 'bg-maze-green/30' : ''"
        @touchstart.prevent="startDir('left')"
        @touchend.prevent="stopDir"
        @touchcancel.prevent="stopDir"
        @mousedown.prevent="startDir('left')"
        @mouseup.prevent="stopDir"
        @mouseleave.prevent="stopDir"
      >
        ◀
      </button>
      <button
        class="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-maze-wall bg-maze-floor/80 font-pixel text-lg text-maze-green active:bg-maze-green/30 sm:h-16 sm:w-16"
        :class="activeDir === 'down' ? 'bg-maze-green/30' : ''"
        @touchstart.prevent="startDir('down')"
        @touchend.prevent="stopDir"
        @touchcancel.prevent="stopDir"
        @mousedown.prevent="startDir('down')"
        @mouseup.prevent="stopDir"
        @mouseleave.prevent="stopDir"
      >
        ▼
      </button>
      <button
        class="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-maze-wall bg-maze-floor/80 font-pixel text-lg text-maze-green active:bg-maze-green/30 sm:h-16 sm:w-16"
        :class="activeDir === 'right' ? 'bg-maze-green/30' : ''"
        @touchstart.prevent="startDir('right')"
        @touchend.prevent="stopDir"
        @touchcancel.prevent="stopDir"
        @mousedown.prevent="startDir('right')"
        @mouseup.prevent="stopDir"
        @mouseleave.prevent="stopDir"
      >
        ▶
      </button>
    </div>
  </div>
</template>
