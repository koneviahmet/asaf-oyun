export default class QuestionCard {
  constructor(scene, x, y, tileSize, id) {
    this.scene = scene
    this.id = id
    this.collected = false

    this.sprite = scene.add.sprite(x, y, 'question-card')
    this.sprite.setDepth(5)

    scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 0.7, to: 1 },
      scale: { from: 0.9, to: 1.1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    })

    this.zone = scene.add.zone(x, y, tileSize * 0.8, tileSize * 0.8)
    scene.physics.add.existing(this.zone)
    this.zone.body.setAllowGravity(false)
    this.zone.body.moves = false
  }

  collect() {
    this.collected = true
    this.sprite.destroy()
    this.zone.destroy()
  }

  destroy() {
    if (!this.collected) {
      this.sprite.destroy()
      this.zone.destroy()
    }
  }
}
