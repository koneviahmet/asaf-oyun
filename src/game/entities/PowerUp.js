export default class PowerUp {
  constructor(scene, x, y, tileSize, type, id) {
    this.scene = scene
    this.type = type
    this.id = id
    this.collected = false

    const keys = {
      shield: 'powerup-shield',
      speed: 'powerup-speed',
      ghost: 'powerup-ghost',
      freeze: 'powerup-freeze',
    }
    const key = keys[type] || 'powerup-speed'
    this.sprite = scene.add.sprite(x, y, key)
    this.sprite.setDepth(6)

    scene.tweens.add({
      targets: this.sprite,
      y: y - 4,
      duration: 600,
      yoyo: true,
      repeat: -1,
    })

    this.zone = scene.add.zone(x, y, tileSize * 0.7, tileSize * 0.7)
    scene.physics.add.existing(this.zone)
    this.zone.body.setAllowGravity(false)
    this.zone.body.moves = false
  }

  collect() {
    this.collected = true
    this.sprite.destroy()
    this.zone.destroy()
  }
}
