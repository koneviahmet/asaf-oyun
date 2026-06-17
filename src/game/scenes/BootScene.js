import Phaser from 'phaser'

function drawPixelTexture(scene, key, width, height, drawFn) {
  const gfx = scene.make.graphics({ x: 0, y: 0, add: false })
  drawFn(gfx)
  gfx.generateTexture(key, width, height)
  gfx.destroy()
}

function createDinoAnims(scene) {
  const walk = (key, frames) => {
    scene.anims.create({
      key,
      frames: frames.map((frame) => ({ key: 'dino', frame })),
      frameRate: 12,
      repeat: -1,
    })
  }

  const idle = (key, frame) => {
    scene.anims.create({
      key,
      frames: [{ key: 'dino', frame }],
    })
  }

  // dinazor_spng.json — oyun yönleri: aşağı=ön, yukarı=arka
  walk('dino-walk-down', ['dinazor_16.png', 'dinazor_15.png', 'dinazor_14.png', 'dinazor_13.png'])
  walk('dino-walk-up', ['dinazor_04.png', 'dinazor_03.png', 'dinazor_02.png', 'dinazor_01.png'])
  // dinazor_spng.json — sağ/sol satır sırası: 05→08 ve 09→12
  walk('dino-walk-right', ['dinazor_05.png', 'dinazor_06.png', 'dinazor_07.png', 'dinazor_08.png'])
  walk('dino-walk-left', ['dinazor_09.png', 'dinazor_10.png', 'dinazor_11.png', 'dinazor_12.png'])

  idle('dino-idle-down', 'dinazor_16.png')
  idle('dino-idle-up', 'dinazor_04.png')
  idle('dino-idle-right', 'dinazor_05.png')
  idle('dino-idle-left', 'dinazor_09.png')
}

function createPlayerAnims(scene) {
  const walk = (key, frames) => {
    scene.anims.create({
      key,
      frames: frames.map((frame) => ({ key: 'player', frame })),
      frameRate: 12,
      repeat: -1,
    })
  }

  const idle = (key, frame) => {
    scene.anims.create({
      key,
      frames: [{ key: 'player', frame }],
    })
  }

  // gidenrobot.json animasyonları + üst satır = ileri (aşağı)
  walk('player-walk-down', ['robot_16.png', 'robot_15.png', 'robot_14.png', 'robot_13.png'])
  walk('player-walk-up', ['robot_04.png', 'robot_03.png', 'robot_02.png', 'robot_01.png'])
  walk('player-walk-right', ['robot_08.png', 'robot_07.png', 'robot_06.png', 'robot_05.png'])
  walk('player-walk-left', ['robot_12.png', 'robot_11.png', 'robot_10.png', 'robot_09.png'])

  idle('player-idle-down', 'robot_16.png')
  idle('player-idle-up', 'robot_04.png')
  idle('player-idle-right', 'robot_08.png')
  idle('player-idle-left', 'robot_12.png')
}

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload() {
    this.load.atlas(
      'player',
      '/assets/player/gidenrobot.png',
      '/assets/player/gidenrobot.json',
    )
    this.load.atlas(
      'dino',
      '/assets/monster/dinazor_spng.png',
      '/assets/monster/dinazor_spng.json',
    )
  }

  create() {
    const ts = 32

    createPlayerAnims(this)
    createDinoAnims(this)

    drawPixelTexture(this, 'floor', ts, ts, (g) => {
      g.fillStyle(0x2d2d44)
      g.fillRect(0, 0, ts, ts)
      g.fillStyle(0x353550)
      g.fillRect(2, 2, 4, 4)
      g.fillRect(ts - 6, ts - 6, 4, 4)
    })

    drawPixelTexture(this, 'wall', ts, ts, (g) => {
      g.fillStyle(0x3d2b4f)
      g.fillRect(0, 0, ts, ts)
      g.fillStyle(0x5a3d6e)
      g.fillRect(2, 2, ts - 4, 8)
      g.fillStyle(0x2a1f38)
      g.fillRect(2, 10, ts - 4, ts - 12)
      g.fillStyle(0x6b4d82)
      g.fillRect(4, 4, 6, 4)
    })

    drawPixelTexture(this, 'question-card', ts, ts, (g) => {
      g.fillStyle(0xf5a623)
      g.fillRect(6, 4, 20, 24)
      g.fillStyle(0xffd700)
      g.fillRect(8, 6, 16, 20)
      g.fillStyle(0x3d2b4f)
      g.fillRect(14, 10, 4, 4)
      g.fillRect(12, 18, 8, 2)
      g.fillRect(13, 22, 6, 2)
    })

    drawPixelTexture(this, 'powerup-shield', ts, ts, (g) => {
      g.fillStyle(0x3498db)
      g.fillRect(8, 10, 16, 18)
      g.fillStyle(0x5dade2)
      g.fillRect(10, 12, 12, 14)
      g.fillStyle(0xffffff)
      g.fillRect(14, 16, 4, 6)
    })

    drawPixelTexture(this, 'powerup-speed', ts, ts, (g) => {
      g.fillStyle(0xf5a623)
      g.fillRect(10, 6, 12, 20)
      g.fillStyle(0xffd700)
      g.fillRect(12, 8, 8, 16)
      g.fillStyle(0xffffff)
      g.fillRect(14, 10, 4, 8)
    })

    drawPixelTexture(this, 'powerup-ghost', ts, ts, (g) => {
      g.fillStyle(0x9966ff, 0.5)
      g.fillCircle(16, 16, 12)
      g.lineStyle(2, 0xbb99ff)
      g.strokeCircle(16, 16, 12)
      g.fillStyle(0xffffff, 0.8)
      g.fillRect(13, 12, 6, 4)
    })

    drawPixelTexture(this, 'powerup-freeze', ts, ts, (g) => {
      g.fillStyle(0x88ddff)
      g.fillRect(12, 8, 8, 14)
      g.fillStyle(0xffffff)
      g.fillRect(14, 10, 4, 10)
      g.fillStyle(0x5dade2)
      g.fillRect(10, 6, 4, 4)
      g.fillRect(18, 6, 4, 4)
      g.fillRect(10, 20, 4, 4)
      g.fillRect(18, 20, 4, 4)
    })

    drawPixelTexture(this, 'minimap-bg', 130, 130, (g) => {
      g.fillStyle(0x000000, 0.6)
      g.fillRect(0, 0, 130, 130)
      g.lineStyle(2, 0xf5a623)
      g.strokeRect(1, 1, 128, 128)
    })

    this.events.emit('textures-ready')
    this.scene.stop()
  }
}
