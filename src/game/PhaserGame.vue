<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { ScoreManager } from './systems/ScoreManager.js'

const props = defineProps({
  level: { type: Number, default: 1 },
  difficulty: { type: String, default: 'normal' },
  scoreManager: { type: Object, default: null },
})

const container = ref(null)
const loading = ref(true)
let game = null
let onResize = null

function startGameScene() {
  const sm = props.scoreManager || new ScoreManager()
  game.scene.start('GameScene', { level: props.level, difficulty: props.difficulty, scoreManager: sm })
}

onMounted(async () => {
  const [{ default: Phaser }, { default: BootScene }, { default: GameScene }] = await Promise.all([
    import('phaser'),
    import('./scenes/BootScene.js'),
    import('./scenes/GameScene.js'),
  ])

  if (!container.value) return

  loading.value = false

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container.value,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#1a1a2e',
    physics: {
      default: 'arcade',
      arcade: { debug: false },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    pixelArt: true,
    roundPixels: true,
  })

  game.events.once('ready', () => {
    if (!game) return

    game.scene.add('BootScene', BootScene, false)
    game.scene.add('GameScene', GameScene, false)

    const boot = game.scene.getScene('BootScene')
    boot.events.once('textures-ready', startGameScene)
    game.scene.start('BootScene')
  })

  onResize = () => game?.scale.resize(window.innerWidth, window.innerHeight)
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  if (onResize) window.removeEventListener('resize', onResize)
  game?.destroy(true)
  game = null
})
</script>

<template>
  <div class="relative h-full w-full">
    <div v-if="loading" class="absolute inset-0 z-10 flex items-center justify-center bg-maze-floor">
      <p class="animate-pulse font-pixel text-[10px] text-maze-gold">Yükleniyor...</p>
    </div>
    <div ref="container" class="h-full w-full" />
  </div>
</template>
