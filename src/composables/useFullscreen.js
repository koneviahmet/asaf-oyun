import { ref, onMounted, onUnmounted } from 'vue'

export function useFullscreen() {
  const isFullscreen = ref(false)

  function update() {
    isFullscreen.value = !!document.fullscreenElement
  }

  async function toggle() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch {
      // Tarayıcı izin vermedi
    }
  }

  onMounted(() => {
    document.addEventListener('fullscreenchange', update)
    update()
  })

  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', update)
  })

  return { isFullscreen, toggle }
}
