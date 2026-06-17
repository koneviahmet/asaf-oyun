import Phaser from 'phaser'
import { worldToGrid, isWalkable } from '../systems/MazeGenerator.js'
import { EventBus, Events } from '../EventBus.js'
import { soundManager } from '../systems/SoundManager.js'

export default class Player {
  constructor(scene, x, y, grid, tileSize, speed) {
    this.scene = scene
    this.grid = grid
    this.tileSize = tileSize
    this.baseSpeed = speed
    this.speed = speed
    this.speedMultiplier = 1
    this.touchDir = { x: 0, y: 0 }
    this.stepTimer = 0
    this.moving = false
    this.facing = 'down'
    this.displayScale = tileSize / 64
    this.ghostUntil = 0

    this.sprite = scene.physics.add.sprite(x, y, 'player', 'robot_16.png')
    this.sprite.setCollideWorldBounds(false)
    this.sprite.setScale(this.displayScale)
    this.sprite.body.setSize(tileSize * 0.45, tileSize * 0.45)
    this.sprite.setDepth(10)
    this.sprite.play('player-idle-down')

    this.cursors = scene.input.keyboard.createCursorKeys()
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    })

    this._onTouchMove = (dir) => { this.touchDir = { ...dir } }
    EventBus.on(Events.TOUCH_MOVE, this._onTouchMove)
    scene.events.on('shutdown', () => EventBus.off(Events.TOUCH_MOVE, this._onTouchMove))
  }

  setSpeedBoost(mult, durationMs) {
    this.speedMultiplier = mult
    this.speed = this.baseSpeed * mult
    if (this._speedTimer) this._speedTimer.remove()
    this._speedTimer = this.scene.time.delayedCall(durationMs, () => {
      this.speedMultiplier = 1
      this.speed = this.baseSpeed
      this.scene.emitPowerUpStatus()
    })
  }

  setGhostMode(durationMs) {
    this.ghostUntil = this.scene.time.now + durationMs
    this.sprite.setAlpha(0.5)
    this.sprite.setTint(0xbb99ff)
    if (this._ghostTimer) this._ghostTimer.remove()
    this._ghostTimer = this.scene.time.delayedCall(durationMs, () => {
      this.ghostUntil = 0
      this.sprite.setAlpha(1)
      this.sprite.clearTint()
      this.scene.emitPowerUpStatus()
    })
    this.scene.emitPowerUpStatus()
  }

  isGhost() {
    return this.scene.time.now < (this.ghostUntil || 0)
  }

  update() {
    let vx = 0
    let vy = 0

    if (this.cursors.left.isDown || this.wasd.left.isDown || this.touchDir.x < 0) vx = -1
    else if (this.cursors.right.isDown || this.wasd.right.isDown || this.touchDir.x > 0) vx = 1

    if (this.cursors.up.isDown || this.wasd.up.isDown || this.touchDir.y < 0) vy = -1
    else if (this.cursors.down.isDown || this.wasd.down.isDown || this.touchDir.y > 0) vy = 1

    if (vx !== 0 && vy !== 0) {
      vx *= 0.707
      vy *= 0.707
    }

    const dt = this.scene.game.loop.delta / 1000
    const nextX = this.sprite.x + vx * this.speed * dt
    const nextY = this.sprite.y + vy * this.speed * dt

    if (this.canMoveTo(nextX, this.sprite.y)) this.sprite.x = nextX
    if (this.canMoveTo(this.sprite.x, nextY)) this.sprite.y = nextY

    const isMoving = vx !== 0 || vy !== 0
    if (isMoving) {
      if (vy > 0) this.facing = 'down'
      else if (vy < 0) this.facing = 'up'
      else if (vx < 0) this.facing = 'left'
      else if (vx > 0) this.facing = 'right'
    }

    const animKey = isMoving ? `player-walk-${this.facing}` : `player-idle-${this.facing}`
    if (this.sprite.anims.currentAnim?.key !== animKey) {
      this.sprite.play(animKey)
    }
    this.moving = isMoving

    if (isMoving) {
      this.stepTimer += this.scene.game.loop.delta
      if (this.stepTimer > 300) {
        soundManager.playStep()
        this.stepTimer = 0
      }
    } else {
      this.stepTimer = 0
    }
  }

  canMoveTo(x, y) {
    if (this.isGhost()) return true

    const margin = this.tileSize * 0.25
    const corners = [
      { x: x - margin, y: y - margin },
      { x: x + margin, y: y - margin },
      { x: x - margin, y: y + margin },
      { x: x + margin, y: y + margin },
    ]
    return corners.every(({ x: cx, y: cy }) => {
      const { x: gx, y: gy } = worldToGrid(cx, cy, this.tileSize)
      return isWalkable(this.grid, gx, gy)
    })
  }

  getGridPos() {
    return worldToGrid(this.sprite.x, this.sprite.y, this.tileSize)
  }

  destroy() {
    EventBus.off(Events.TOUCH_MOVE, this._onTouchMove)
    this.sprite.destroy()
  }
}
