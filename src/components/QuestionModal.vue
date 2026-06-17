<script setup>
import { ref, watch } from 'vue'
import { getRandomQuestion } from '../game/data/questions.js'
import { soundManager } from '../game/systems/SoundManager.js'

const props = defineProps({
  show: Boolean,
  excludeIds: { type: Array, default: () => [] },
  topicFilter: { type: Array, default: null },
  context: { type: String, default: 'entry' },
})

const emit = defineEmits(['answer', 'close'])

const currentQuestion = ref(null)
const selectedIndex = ref(null)
const feedback = ref('')
const answered = ref(false)

const contextTitles = {
  entry: 'Oyuna Başlamak İçin Soruyu Cevapla!',
  card: 'Soru Kartı!',
  catch: 'Dinazor Seni Yakaladı!',
}

watch(
  () => props.show,
  (visible) => {
    if (visible) {
      currentQuestion.value = getRandomQuestion(props.excludeIds, props.topicFilter)
      selectedIndex.value = null
      feedback.value = ''
      answered.value = false
    }
  },
)

function selectOption(index) {
  if (answered.value) return
  selectedIndex.value = index
  answered.value = true
  const correct = index === currentQuestion.value.correct

  if (correct) {
    soundManager.playCorrect()
    feedback.value = 'Doğru! Harika!'
    setTimeout(() => {
      emit('answer', {
        correct: true,
        questionId: currentQuestion.value.id,
        topic: currentQuestion.value.topic,
      })
    }, 800)
  } else {
    soundManager.playWrong()
    feedback.value = `Yanlış! Doğru cevap: ${currentQuestion.value.options[currentQuestion.value.correct]}`
    setTimeout(() => {
      if (props.context === 'entry') {
        currentQuestion.value = getRandomQuestion([...props.excludeIds, currentQuestion.value.id], props.topicFilter)
        selectedIndex.value = null
        feedback.value = 'Tekrar dene!'
        answered.value = false
      } else {
        emit('answer', {
          correct: false,
          questionId: currentQuestion.value.id,
          topic: currentQuestion.value.topic,
        })
      }
    }, 1500)
  }
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
  >
    <div class="mx-4 w-full max-w-lg rounded-lg border-4 border-maze-gold bg-maze-floor p-6 shadow-2xl">
      <h2 class="mb-2 text-center font-pixel text-[10px] leading-relaxed text-maze-gold sm:text-xs">
        {{ contextTitles[context] || 'Soru' }}
      </h2>
      <p class="mb-1 text-center font-pixel text-[7px] text-maze-green">
        {{ currentQuestion?.topic }}
      </p>
      <p class="mb-6 text-center font-pixel text-[9px] leading-relaxed text-white sm:text-[10px]">
        {{ currentQuestion?.question }}
      </p>

      <div class="space-y-3">
        <button
          v-for="(option, index) in currentQuestion?.options"
          :key="index"
          class="w-full rounded border-2 px-4 py-3 text-left font-pixel text-[8px] transition-all sm:text-[9px]"
          :class="[
            selectedIndex === index
              ? index === currentQuestion?.correct
                ? 'border-maze-green bg-maze-green/20 text-maze-green'
                : 'border-maze-accent bg-maze-accent/20 text-maze-accent'
              : 'border-maze-wall bg-maze-wall/30 text-gray-200 hover:border-maze-accent hover:bg-maze-accent/10',
            answered ? 'pointer-events-none opacity-70' : '',
          ]"
          @click="selectOption(index)"
        >
          {{ String.fromCharCode(65 + index) }}) {{ option }}
        </button>
      </div>

      <p
        v-if="feedback"
        class="mt-6 text-center font-pixel text-[8px]"
        :class="feedback.startsWith('Doğru') ? 'text-maze-green' : 'text-maze-accent'"
      >
        {{ feedback }}
      </p>
    </div>
  </div>
</template>
