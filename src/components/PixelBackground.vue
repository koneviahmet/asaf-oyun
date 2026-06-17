<template>
  <div class="pixel-bg pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
    <div class="pixel-bg__grid" />
    <div class="pixel-bg__glow pixel-bg__glow--1" />
    <div class="pixel-bg__glow pixel-bg__glow--2" />
  </div>
</template>

<style scoped>
.pixel-bg__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(61, 43, 79, 0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(61, 43, 79, 0.3) 1px, transparent 1px);
  background-size: 32px 32px;
  image-rendering: pixelated;
}

.pixel-bg__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.15;
  animation: float 8s ease-in-out infinite;
}

.pixel-bg__glow--1 {
  width: 300px;
  height: 300px;
  background: #e94560;
  top: 10%;
  left: 10%;
}

.pixel-bg__glow--2 {
  width: 250px;
  height: 250px;
  background: #4ecca3;
  bottom: 15%;
  right: 10%;
  animation-delay: -4s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -20px); }
}
</style>
