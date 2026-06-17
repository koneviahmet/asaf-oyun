<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getAllTopics } from '../game/data/questions.js'
import { gameSettings, Difficulties } from '../game/systems/GameSettings.js'

const props = defineProps({
  locked: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
  initialTopics: { type: Array, default: null },
  initialDifficulty: { type: String, default: null },
})

const emit = defineEmits(['update:topics', 'update:difficulty'])

const allTopics = getAllTopics()
const selected = ref([...allTopics])
const difficulty = ref('normal')
const expanded = ref(false)

const allSelected = computed(() => selected.value.length === allTopics.length)

onMounted(() => {
  if (props.initialDifficulty) difficulty.value = props.initialDifficulty
  else difficulty.value = gameSettings.getActiveDifficulty()

  if (props.initialTopics?.length) selected.value = [...props.initialTopics]
  else {
    const active = gameSettings.getActiveTopics()
    selected.value = active?.length ? [...active] : [...allTopics]
  }
  emitChange()
})

watch([selected, difficulty], emitChange, { deep: true })

function emitChange() {
  emit('update:topics', allSelected.value ? null : [...selected.value])
  emit('update:difficulty', difficulty.value)
}

function toggleTopic(topic) {
  if (props.locked) return
  const idx = selected.value.indexOf(topic)
  if (idx >= 0) {
    if (selected.value.length > 1) selected.value.splice(idx, 1)
  } else {
    selected.value.push(topic)
  }
}

function toggleAll() {
  if (props.locked) return
  selected.value = allSelected.value ? [allTopics[0]] : [...allTopics]
}

function setDifficulty(d) {
  if (props.locked) return
  difficulty.value = d
  if (!props.compact) gameSettings.setPlayerDifficulty(d)
}
</script>

<template>
  <div class="w-full" :class="compact ? '' : 'max-w-xs'">
    <button
      v-if="!compact"
      type="button"
      class="mb-2 w-full rounded border border-maze-wall/50 py-2 font-pixel text-[7px] text-gray-400 hover:bg-maze-wall/20"
      @click="expanded = !expanded"
    >
      {{ expanded ? '▲ AYARLARI GİZLE' : '▼ KONU VE ZORLUK SEÇ' }}
      <span v-if="locked" class="text-maze-gold"> (Öğretmen ayarı)</span>
    </button>

    <div v-if="expanded || compact" class="space-y-3 rounded border border-maze-wall/50 bg-maze-wall/10 p-3">
      <div>
        <p class="mb-2 font-pixel text-[6px] text-gray-500">Zorluk</p>
        <div class="flex gap-1">
          <button
            v-for="(cfg, key) in Difficulties"
            :key="key"
            type="button"
            class="flex-1 rounded border py-1 font-pixel text-[6px] transition"
            :class="difficulty === key
              ? 'border-maze-green bg-maze-green/20 text-maze-green'
              : 'border-maze-wall/50 text-gray-500 hover:bg-maze-wall/20'"
            :disabled="locked"
            @click="setDifficulty(key)"
          >
            {{ cfg.label }}
          </button>
        </div>
      </div>

      <div>
        <div class="mb-2 flex items-center justify-between">
          <p class="font-pixel text-[6px] text-gray-500">Konular</p>
          <button
            v-if="!locked"
            type="button"
            class="font-pixel text-[6px] text-maze-gold hover:underline"
            @click="toggleAll"
          >
            {{ allSelected ? 'Tek seç' : 'Tümü' }}
          </button>
        </div>
        <div class="max-h-28 space-y-1 overflow-y-auto">
          <label
            v-for="topic in allTopics"
            :key="topic"
            class="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-maze-wall/20"
            :class="locked ? 'opacity-70' : ''"
          >
            <input
              type="checkbox"
              :checked="selected.includes(topic)"
              :disabled="locked"
              class="accent-maze-green"
              @change="toggleTopic(topic)"
            />
            <span class="font-pixel text-[6px] text-gray-400">{{ topic }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
