import { findPath } from '../systems/Pathfinding.js'
import { gridToWorld } from '../systems/MazeGenerator.js'

const VARIANT_TINTS = {
  monster0: 0xffffff,
  monster1: 0xffe8b0,
  monster2: 0xb0e8ff,
  monster3: 0xffb0e8,
  'monster-boss': 0xff6666,
}

export default class Monster {
  constructor(scene, x, y, grid, tileSize, speed, variantKey, id, options = {}) {
    this.scene = scene
    this.grid = grid
    this.tileSize = tileSize
    this.speed = speed
    this.id = id
    this.variantKey = variantKey
    this.isBoss = options.isBoss || false
    this.hp = this.isBoss ? 2 : 1
    this.alive = true
    this.path = []
    this.pathIndex = 0
    this.repathTimer = 0
    this.repathInterval = this.isBoss ? 400 : 600 + id * 80
    this.moving = false
    this.facing = 'down'
    this.displayScale = (tileSize / 64) * (this.isBoss ? 1.4 : 1)

    this.sprite = scene.physics.add.sprite(x, y, 'dino', 'dinazor_16.png')
    this.sprite.setScale(this.displayScale)
    const hitbox = this.isBoss ? tileSize * 0.65 : tileSize * 0.5
    this.sprite.body.setSize(hitbox, hitbox)
    this.sprite.setDepth(9)
    this.sprite.setTint(VARIANT_TINTS[variantKey] || 0xffffff)
    this.baseTint = VARIANT_TINTS[variantKey] || 0xffffff
    this.sprite.play('dino-idle-down')
  }

  update(time, player) {
    if (!this.alive) return

    this.repathTimer += this.scene.game.loop.delta
    const playerGrid = player.getGridPos()
    const myGrid = this.getGridPos()

    if (this.repathTimer >= this.repathInterval || this.path.length === 0) {
      this.repathTimer = 0
      this.path = findPath(this.grid, myGrid.x, myGrid.y, playerGrid.x, playerGrid.y)
      this.pathIndex = 1
    }

    let moved = false
    let dx = 0
    let dy = 0

    if (this.path.length > 1 && this.pathIndex < this.path.length) {
      const target = this.path[this.pathIndex]
      const world = gridToWorld(target.x, target.y, this.tileSize)
      dx = world.x - this.sprite.x
      dy = world.y - this.sprite.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 4) {
        this.pathIndex++
      } else {
        moved = true
        const dt = this.scene.game.loop.delta / 1000
        this.sprite.x += (dx / dist) * this.speed * dt
        this.sprite.y += (dy / dist) * this.speed * dt
      }
    }

    if (moved) {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.facing = dx < 0 ? 'left' : 'right'
      } else if (dy !== 0) {
        this.facing = dy > 0 ? 'down' : 'up'
      }
    }

    const animKey = moved ? `dino-walk-${this.facing}` : `dino-idle-${this.facing}`
    if (this.sprite.anims.currentAnim?.key !== animKey) {
      this.sprite.play(animKey)
    }
    this.moving = moved
  }

  getGridPos() {
    return {
      x: Math.floor(this.sprite.x / this.tileSize),
      y: Math.floor(this.sprite.y / this.tileSize),
    }
  }

  hurt() {
    this.hp -= 1
    if (this.hp <= 0) {
      this.kill()
      return true
    }
    this.sprite.setTint(0xff4444)
    this.scene.time.delayedCall(180, () => {
      if (this.alive) this.sprite.setTint(VARIANT_TINTS[this.variantKey] || 0xffffff)
    })
    return false
  }

  kill() {
    this.alive = false
    this.sprite.setVisible(false)
    this.sprite.body.enable = false
    this.sprite.anims.stop()
  }

  respawn(x, y) {
    this.hp = this.isBoss ? 2 : 1
    this.alive = true
    this.sprite.setPosition(x, y)
    this.sprite.setVisible(true)
    this.sprite.body.enable = true
    this.sprite.setTint(VARIANT_TINTS[this.variantKey] || 0xffffff)
    this.path = []
    this.pathIndex = 0
    this.repathTimer = 0
    this.moving = false
    this.sprite.play(`dino-idle-${this.facing}`)
  }

  destroy() {
    this.sprite.destroy()
  }
}
