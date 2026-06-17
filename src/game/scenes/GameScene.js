import Phaser from 'phaser'
import { EventBus, Events } from '../EventBus.js'
import { generateMaze, getRandomEmptyCell, gridToWorld } from '../systems/MazeGenerator.js'
import { getLevelConfig } from '../data/levels.js'
import { ScoreManager, ScoreValues } from '../systems/ScoreManager.js'
import { soundManager } from '../systems/SoundManager.js'
import Player from '../entities/Player.js'
import Monster from '../entities/Monster.js'
import QuestionCard from '../entities/QuestionCard.js'
import PowerUp from '../entities/PowerUp.js'

const QUESTION_SHIELD_GRACE_MS = 3000

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
  }

  init(data) {
    this.level = data.level || 1
    this.difficulty = data.difficulty || 'normal'
    this.scoreManager = data.scoreManager || new ScoreManager()
    if (!data.scoreManager) this.scoreManager.reset()
  }

  create() {
    this.tileSize = 32
    this.paused = false
    this.menuPaused = false
    this.pendingQuestion = null
    this.usedQuestionIds = []
    this.catchCooldownUntil = 0
    this.caughtMonsterId = null
    this.hasShield = false
    this.questionShieldUntil = 0
    this.questionShieldTimer = null
    this.monstersFrozenUntil = 0
    this.powerUps = []

    const config = getLevelConfig(this.level, this.difficulty)
    this.config = config

    const { grid, cols, rows } = generateMaze(config.width, config.height, config.loopRemoval)
    this.grid = grid
    this.mazeWidth = cols * this.tileSize
    this.mazeHeight = rows * this.tileSize

    this.buildMaze()
    this.setupFog()
    this.spawnEntities()
    this.setupShieldAura()
    this.setupCamera()
    this.setupCollisions()
    this.setupUI()
    this.setupMinimap()
    this.setupPauseInput()

    soundManager.startMusic()

    this._onQuestionAnswered = (payload) => this.onQuestionAnswered(payload)
    this._onResumeGame = () => this.resumeFromMenu()
    this._onPauseGame = () => this.pauseForMenu()
    EventBus.on(Events.QUESTION_ANSWERED, this._onQuestionAnswered)
    EventBus.on(Events.RESUME_GAME, this._onResumeGame)
    EventBus.on(Events.PAUSE_GAME, this._onPauseGame)
    this.events.on('shutdown', () => {
      EventBus.off(Events.QUESTION_ANSWERED, this._onQuestionAnswered)
      EventBus.off(Events.RESUME_GAME, this._onResumeGame)
      EventBus.off(Events.PAUSE_GAME, this._onPauseGame)
      if (this.questionShieldTimer) this.questionShieldTimer.remove()
      if (this.freezeTimer) this.freezeTimer.remove()
      soundManager.stopMusic()
    })

    EventBus.emit(Events.SCORE_UPDATE, {
      score: this.scoreManager.score,
      highScore: this.scoreManager.highScore,
      level: this.level,
    })
  }

  buildMaze() {
    this.mazeGroup = this.add.group()
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[0].length; x++) {
        const key = this.grid[y][x] === 1 ? 'wall' : 'floor'
        const tile = this.add.image(x * this.tileSize + this.tileSize / 2, y * this.tileSize + this.tileSize / 2, key)
        tile.setDepth(0)
        this.mazeGroup.add(tile)
      }
    }
    this.physics.world.setBounds(0, 0, this.mazeWidth, this.mazeHeight)
  }

  setupFog() {
    const rows = this.grid.length
    const cols = this.grid[0].length
    this.visionRadius = this.config.visionRadius || 3
    this.explored = Array.from({ length: rows }, () => Array(cols).fill(false))
    this.fogTiles = []

    for (let y = 0; y < rows; y++) {
      this.fogTiles[y] = []
      for (let x = 0; x < cols; x++) {
        const fog = this.add.rectangle(
          x * this.tileSize + this.tileSize / 2,
          y * this.tileSize + this.tileSize / 2,
          this.tileSize,
          this.tileSize,
          0x000000,
          0.9,
        ).setDepth(4)
        this.fogTiles[y][x] = fog
      }
    }
  }

  isCellVisible(x, y) {
    if (y < 0 || x < 0 || y >= this.grid.length || x >= this.grid[0].length) return false
    if (this.explored[y][x]) return true
    const pg = this.player.getGridPos()
    const dist = Math.max(Math.abs(x - pg.x), Math.abs(y - pg.y))
    return dist <= this.visionRadius
  }

  updateFog() {
    const pg = this.player.getGridPos()
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[0].length; x++) {
        const dist = Math.max(Math.abs(x - pg.x), Math.abs(y - pg.y))
        if (dist <= this.visionRadius) this.explored[y][x] = true
        const visible = this.isCellVisible(x, y)
        this.fogTiles[y][x].setAlpha(visible ? 0 : 0.9)
      }
    }
  }

  updateEntityVisibility() {
    const setVis = (sprite, gx, gy) => {
      sprite.setVisible(this.isCellVisible(gx, gy))
    }

    this.monsters.forEach((m) => {
      if (!m.alive) return
      const g = m.getGridPos()
      setVis(m.sprite, g.x, g.y)
    })
    this.questionCards.forEach((card) => {
      if (card.collected) return
      const gx = Math.floor(card.sprite.x / this.tileSize)
      const gy = Math.floor(card.sprite.y / this.tileSize)
      setVis(card.sprite, gx, gy)
    })
    this.powerUps.forEach((pu) => {
      if (pu.collected) return
      const gx = Math.floor(pu.sprite.x / this.tileSize)
      const gy = Math.floor(pu.sprite.y / this.tileSize)
      setVis(pu.sprite, gx, gy)
    })
  }

  spawnEntities() {
    const occupied = []
    const playerCell = getRandomEmptyCell(this.grid, occupied)
    occupied.push(playerCell)
    const playerPos = gridToWorld(playerCell.x, playerCell.y, this.tileSize)

    this.player = new Player(this, playerPos.x, playerPos.y, this.grid, this.tileSize, this.config.playerSpeed)

    this.monsters = []
    const monsterTextures = ['monster0', 'monster1', 'monster2', 'monster3']

    if (this.config.isBossLevel) {
      const bossCell = getRandomEmptyCell(this.grid, occupied, {
        x: playerCell.x,
        y: playerCell.y,
        distance: this.config.spawnMinDistance + 2,
      }) || getRandomEmptyCell(this.grid, occupied)
      if (bossCell) {
        occupied.push(bossCell)
        const bossPos = gridToWorld(bossCell.x, bossCell.y, this.tileSize)
        const bossSpeed = Math.round(this.config.monsterSpeed * (this.config.bossSpeedMult || 1.35))
        this.monsters.push(this.createMonster(bossPos, 'monster-boss', 0, {
          isBoss: true,
          speed: bossSpeed,
        }))
      }
    }

    const normalCount = this.config.isBossLevel
      ? Math.max(1, this.config.monsterCount - 1)
      : this.config.monsterCount

    for (let i = 0; i < normalCount; i++) {
      const cell = getRandomEmptyCell(this.grid, occupied, {
        x: playerCell.x,
        y: playerCell.y,
        distance: this.config.spawnMinDistance,
      })
      if (!cell) {
        const fallback = getRandomEmptyCell(this.grid, occupied)
        if (!fallback) break
        occupied.push(fallback)
        const pos = gridToWorld(fallback.x, fallback.y, this.tileSize)
        this.monsters.push(this.createMonster(pos, monsterTextures[i % 4], i + 1))
        continue
      }
      occupied.push(cell)
      const pos = gridToWorld(cell.x, cell.y, this.tileSize)
      this.monsters.push(this.createMonster(pos, monsterTextures[i % 4], i + 1))
    }

    this.questionCards = []
    for (let i = 0; i < this.config.questionCardCount; i++) {
      const cell = getRandomEmptyCell(this.grid, occupied)
      if (!cell) break
      occupied.push(cell)
      const pos = gridToWorld(cell.x, cell.y, this.tileSize)
      this.questionCards.push(new QuestionCard(this, pos.x, pos.y, this.tileSize, i))
    }
    this.nextCardId = this.questionCards.length

    const powerTypes = ['shield', 'speed', 'ghost', 'freeze']
    for (let i = 0; i < powerTypes.length; i++) {
      const cell = getRandomEmptyCell(this.grid, occupied)
      if (!cell) break
      occupied.push(cell)
      const pos = gridToWorld(cell.x, cell.y, this.tileSize)
      const pu = new PowerUp(this, pos.x, pos.y, this.tileSize, powerTypes[i], i)
      this.powerUps.push(pu)
      this.physics.add.overlap(
        this.player.sprite,
        pu.zone,
        () => this.onPowerUpTouch(pu),
        () => !pu.collected && !this.paused,
        this,
      )
    }
    this.emitPowerUpStatus()
    this.updateFog()
    this.updateEntityVisibility()
  }

  emitPowerUpStatus() {
    EventBus.emit(Events.POWERUP_STATUS, {
      shield: this.hasShield || this.isQuestionShielded(),
      speedBoost: this.player?.speedMultiplier > 1,
      ghostMode: this.player?.isGhost() ?? false,
      monstersFrozen: this.isMonstersFrozen(),
    })
  }

  isMonstersFrozen() {
    return this.time.now < this.monstersFrozenUntil
  }

  setupShieldAura() {
    this.shieldAura = this.add.graphics().setDepth(11)
  }

  updateShieldAura() {
    if (!this.shieldAura || !this.player) return

    const shielded = this.hasShield || this.isQuestionShielded()
    this.shieldAura.clear()
    if (!shielded) return

    const { x, y } = this.player.sprite
    const pulse = 1 + Math.sin(this.time.now / 200) * 0.08
    const r = this.tileSize * 0.58 * pulse
    const questionOnly = this.isQuestionShielded() && !this.hasShield
    const color = questionOnly ? 0x66ccff : 0x3498db

    this.shieldAura.fillStyle(color, 0.15)
    this.shieldAura.fillCircle(x, y, r)
    this.shieldAura.lineStyle(2, color, 0.85)
    this.shieldAura.strokeCircle(x, y, r)
    this.shieldAura.lineStyle(1, color, 0.4)
    this.shieldAura.strokeCircle(x, y, r + 4)
  }

  isQuestionShielded() {
    return this.time.now < this.questionShieldUntil
  }

  activateQuestionShieldWhileAsking() {
    if (this.questionShieldTimer) this.questionShieldTimer.remove()
    this.questionShieldTimer = null
    this.questionShieldUntil = Number.MAX_SAFE_INTEGER
    this.emitPowerUpStatus()
  }

  scheduleQuestionShieldAfterAnswer(ms = QUESTION_SHIELD_GRACE_MS) {
    if (this.questionShieldTimer) this.questionShieldTimer.remove()
    this.questionShieldUntil = this.time.now + ms
    this.emitPowerUpStatus()
    this.showFloatingText(this.player.sprite.x, this.player.sprite.y - 20, '3sn KORUMA!', 0x3498db)
    this.questionShieldTimer = this.time.delayedCall(ms, () => {
      this.questionShieldUntil = 0
      this.questionShieldTimer = null
      this.emitPowerUpStatus()
    })
  }

  clearQuestionShield() {
    if (this.questionShieldTimer) this.questionShieldTimer.remove()
    this.questionShieldTimer = null
    this.questionShieldUntil = 0
    this.emitPowerUpStatus()
  }

  onPowerUpTouch(powerUp) {
    if (powerUp.collected || this.paused) return
    powerUp.collect()
    soundManager.playCard()

    if (powerUp.type === 'shield') {
      this.hasShield = true
      this.showFloatingText(this.player.sprite.x, this.player.sprite.y - 20, 'KALKAN!', 0x3498db)
    } else if (powerUp.type === 'ghost') {
      this.player.setGhostMode(6000)
      this.showFloatingText(this.player.sprite.x, this.player.sprite.y - 20, 'DUVAR GEÇİŞ!', 0x9966ff)
    } else if (powerUp.type === 'freeze') {
      this.monstersFrozenUntil = this.time.now + 5000
      if (this.freezeTimer) this.freezeTimer.remove()
      this.freezeTimer = this.time.delayedCall(5000, () => {
        this.emitPowerUpStatus()
      })
      this.showFloatingText(this.player.sprite.x, this.player.sprite.y - 20, 'DONDUR!', 0x88ddff)
    } else {
      this.player.setSpeedBoost(1.6, 8000)
      this.showFloatingText(this.player.sprite.x, this.player.sprite.y - 20, 'HIZ!', 0xf5a623)
    }
    this.emitPowerUpStatus()
  }

  showFloatingText(x, y, text, color) {
    const t = this.add.text(x, y, text, {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      color: `#${color.toString(16).padStart(6, '0')}`,
    }).setOrigin(0.5).setDepth(50)
    this.tweens.add({
      targets: t,
      y: y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => t.destroy(),
    })
  }

  createMonster(pos, texture, id, options = {}) {
    return new Monster(
      this,
      pos.x,
      pos.y,
      this.grid,
      this.tileSize,
      options.speed || this.config.monsterSpeed,
      texture,
      id,
      options,
    )
  }

  setupCamera() {
    this.cameras.main.setBounds(0, 0, this.mazeWidth, this.mazeHeight)
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1)
    const zoom = Math.min(
      this.scale.width / (this.mazeWidth * 0.55),
      this.scale.height / (this.mazeHeight * 0.55),
      2.5,
    )
    this.cameras.main.setZoom(Math.max(zoom, 0.8))
  }

  setupCollisions() {
    this.monsters.forEach((monster) => {
      this.physics.add.overlap(
        this.player.sprite,
        monster.sprite,
        () => this.onMonsterCatch(monster),
        () => monster.alive && !this.paused && !this.isMonstersFrozen()
          && this.time.now >= this.catchCooldownUntil,
        this,
      )
    })

    this.questionCards.forEach((card) => {
      this.registerQuestionCard(card)
    })
  }

  registerQuestionCard(card) {
    this.physics.add.overlap(
      this.player.sprite,
      card.zone,
      () => this.onQuestionCardTouch(card),
      () => !card.collected && !this.paused,
      this,
    )
  }

  getOccupiedCells() {
    const exclude = []
    const pg = this.player.getGridPos()
    exclude.push(pg)
    this.monsters.forEach((m) => {
      if (m.alive) exclude.push(m.getGridPos())
    })
    this.questionCards.forEach((card) => {
      if (!card.collected) {
        exclude.push({
          x: Math.floor(card.sprite.x / this.tileSize),
          y: Math.floor(card.sprite.y / this.tileSize),
        })
      }
    })
    this.powerUps.forEach((pu) => {
      if (!pu.collected) {
        exclude.push({
          x: Math.floor(pu.sprite.x / this.tileSize),
          y: Math.floor(pu.sprite.y / this.tileSize),
        })
      }
    })
    return exclude
  }

  spawnQuestionCard() {
    const exclude = this.getOccupiedCells()
    const playerGrid = this.player.getGridPos()
    const cell = getRandomEmptyCell(this.grid, exclude, {
      x: playerGrid.x,
      y: playerGrid.y,
      distance: Math.max(5, this.config.spawnMinDistance - 2),
    }) || getRandomEmptyCell(this.grid, exclude)
    if (!cell) return null

    const pos = gridToWorld(cell.x, cell.y, this.tileSize)
    const card = new QuestionCard(this, pos.x, pos.y, this.tileSize, this.nextCardId++)
    this.questionCards.push(card)
    this.registerQuestionCard(card)
    this.updateEntityVisibility()
    return card
  }

  setupUI() {
    const levelLabel = this.config.isBossLevel ? `BOSS ${this.level}` : `Seviye ${this.level}`
    this.levelText = this.add.text(10, 10, levelLabel, {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: this.config.isBossLevel ? '#ff4444' : '#f5a623',
      stroke: '#000',
      strokeThickness: 3,
    }).setScrollFactor(0).setDepth(100)

    if (this.config.isBossLevel) {
      this.add.text(10, 24, '👹 2 vuruş gerekir', {
        fontFamily: '"Press Start 2P"',
        fontSize: '6px',
        color: '#ff6666',
        stroke: '#000',
        strokeThickness: 2,
      }).setScrollFactor(0).setDepth(100)
    }

    const monsterY = this.config.isBossLevel ? 42 : 32
    this.dinoTrackerStartY = monsterY
    this.setupDinoTracker(monsterY)

    this.pauseHint = this.add.text(10, monsterY + 22, 'ESC: Duraklat  H: Yardım', {
      fontFamily: '"Press Start 2P"',
      fontSize: '6px',
      color: '#666688',
    }).setScrollFactor(0).setDepth(100)

    this.repositionPauseHint(monsterY)
  }

  setupDinoTracker(startY) {
    this.dinoTrackerIcons = []
    this.dinoIconSize = 20
    this.dinoIconGap = 4
    this.dinoIconScale = this.dinoIconSize / 64

    this.add.text(10, startY - 11, 'Dinazorlar', {
      fontFamily: '"Press Start 2P"',
      fontSize: '6px',
      color: '#e94560',
      stroke: '#000',
      strokeThickness: 2,
    }).setScrollFactor(0).setDepth(101)

    this.monsters.forEach((m, i) => this.addDinoTrackerIcon(m, i, startY))
  }

  addDinoTrackerIcon(monster, index, startY = this.dinoTrackerStartY) {
    const x = 10 + index * (this.dinoIconSize + this.dinoIconGap)
    const scale = this.dinoIconScale * (monster.isBoss ? 1.15 : 1)
    const icon = this.add.image(x, startY, 'dino', 'dinazor_16.png')
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(101)
      .setScale(scale)
      .setTint(monster.baseTint)

    monster.trackerIcon = icon
    if (!this.dinoTrackerIcons) this.dinoTrackerIcons = []
    this.dinoTrackerIcons.push(icon)
    this.updateDinoTrackerIcon(monster)
    return icon
  }

  updateDinoTrackerIcon(monster) {
    if (!monster.trackerIcon) return
    if (monster.alive) {
      monster.trackerIcon.setAlpha(monster.isBoss && monster.hp < 2 ? 0.65 : 1)
      monster.trackerIcon.setTint(this.isMonstersFrozen() ? 0x88ccff : monster.baseTint)
    } else {
      monster.trackerIcon.setAlpha(0.22)
      monster.trackerIcon.setTint(0x666666)
    }
  }

  repositionPauseHint(startY = this.dinoTrackerStartY) {
    if (!this.pauseHint) return
    const count = this.dinoTrackerIcons?.length || this.monsters.length
    const rowWidth = count * (this.dinoIconSize + this.dinoIconGap)
    this.pauseHint.setY(startY + this.dinoIconSize / 2 + 8)
    this.pauseHint.setX(Math.max(10, rowWidth + 14))
  }

  setupMinimap() {
    const mapSize = 120
    this.minimapSize = mapSize
    this.minimapScale = mapSize / Math.max(this.grid[0].length, this.grid.length)

    this.minimapBg = this.add.image(
      this.scale.width - mapSize - 16,
      16,
      'minimap-bg',
    ).setOrigin(0, 0).setScrollFactor(0).setDepth(100)

    this.minimapGfx = this.add.graphics().setScrollFactor(0).setDepth(101)
    this.drawMinimapStatic()
  }

  drawMinimapStatic() {
    const ox = this.scale.width - this.minimapSize - 16 + 5
    const oy = 21
    const s = this.minimapScale

    this.minimapGfx.clear()
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[0].length; x++) {
        this.minimapGfx.fillStyle(this.grid[y][x] === 1 ? 0x3d2b4f : 0x2d2d44, 1)
        this.minimapGfx.fillRect(ox + x * s, oy + y * s, Math.ceil(s), Math.ceil(s))
      }
    }
  }

  updateMinimap() {
    const ox = this.scale.width - this.minimapSize - 16 + 5
    const oy = 21
    const s = this.minimapScale

    this.drawMinimapStatic()

    this.questionCards.forEach((card) => {
      if (!card.collected) {
        const gx = Math.floor(card.sprite.x / this.tileSize)
        const gy = Math.floor(card.sprite.y / this.tileSize)
        this.minimapGfx.fillStyle(0xf5a623, 1)
        this.minimapGfx.fillRect(ox + gx * s, oy + gy * s, Math.max(s, 2), Math.max(s, 2))
      }
    })

    this.monsters.forEach((m) => {
      if (m.alive) {
        const gx = Math.floor(m.sprite.x / this.tileSize)
        const gy = Math.floor(m.sprite.y / this.tileSize)
        this.minimapGfx.fillStyle(0xe94560, 1)
        this.minimapGfx.fillRect(ox + gx * s - 1, oy + gy * s - 1, Math.max(s + 1, 3), Math.max(s + 1, 3))
      }
    })

    this.powerUps.forEach((pu) => {
      if (!pu.collected) {
        const gx = Math.floor(pu.sprite.x / this.tileSize)
        const gy = Math.floor(pu.sprite.y / this.tileSize)
        this.minimapGfx.fillStyle(
          pu.type === 'shield' ? 0x3498db
            : pu.type === 'ghost' ? 0x9966ff
              : pu.type === 'freeze' ? 0x88ddff
                : 0xf5a623,
          1,
        )
        this.minimapGfx.fillRect(ox + gx * s, oy + gy * s, Math.max(s, 2), Math.max(s, 2))
      }
    })

    const pg = this.player.getGridPos()
    this.minimapGfx.fillStyle(0x4ecca3, 1)
    this.minimapGfx.fillRect(ox + pg.x * s - 1, oy + pg.y * s - 1, Math.max(s + 1, 3), Math.max(s + 1, 3))
  }

  setupPauseInput() {
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.pendingQuestion) return
      if (this.menuPaused) {
        this.resumeFromMenu()
        EventBus.emit(Events.RESUME_GAME)
      } else {
        this.pauseForMenu()
        EventBus.emit(Events.PAUSE_GAME)
      }
    })

    this.input.keyboard.on('keydown-P', () => {
      if (this.pendingQuestion) return
      if (this.menuPaused) {
        this.resumeFromMenu()
        EventBus.emit(Events.RESUME_GAME)
      } else {
        this.pauseForMenu()
        EventBus.emit(Events.PAUSE_GAME)
      }
    })

    const showHelp = () => {
      if (this.pendingQuestion) return
      EventBus.emit(Events.SHOW_CONTROLS)
    }
    this.input.keyboard.on('keydown-H', showHelp)
    this.input.keyboard.on('keydown-QUESTION_MARK', showHelp)
  }

  pauseForMenu() {
    if (this.menuPaused || this.pendingQuestion) return
    this.menuPaused = true
    this.physics.pause()
    soundManager.stopMusic()
  }

  resumeFromMenu() {
    if (!this.menuPaused || this.pendingQuestion) return
    this.menuPaused = false
    this.physics.resume()
    soundManager.startMusic()
  }

  updateMonsterCount() {
    this.monsters.forEach((m) => this.updateDinoTrackerIcon(m))
  }

  pauseGame() {
    this.paused = true
    this.physics.pause()
  }

  resumeGame() {
    this.paused = false
    if (!this.menuPaused) this.physics.resume()
  }

  askQuestion(context, extra = {}) {
    this.pauseGame()
    this.pendingQuestion = { context, ...extra }
    this.activateQuestionShieldWhileAsking()
    EventBus.emit(Events.ASK_QUESTION, { context, excludeIds: [...this.usedQuestionIds] })
  }

  onQuestionCardTouch(card) {
    if (card.collected || this.paused) return
    soundManager.playCard()
    card.collect()
    this.askQuestion('card', { cardId: card.id })
  }

  onMonsterCatch(monster) {
    if (this.paused || !monster.alive || this.time.now < this.catchCooldownUntil) return
    if (this.pendingQuestion) return

    if (this.isQuestionShielded()) {
      this.showFloatingText(this.player.sprite.x, this.player.sprite.y - 20, 'KORUNDUN!', 0x3498db)
      this.respawnMonster(monster)
      this.catchCooldownUntil = this.time.now + this.config.catchCooldown
      soundManager.playCorrect()
      return
    }

    if (this.hasShield) {
      this.hasShield = false
      this.emitPowerUpStatus()
      this.showFloatingText(this.player.sprite.x, this.player.sprite.y - 20, 'KALKAN KIRILDI!', 0x3498db)
      this.respawnMonster(monster)
      this.catchCooldownUntil = this.time.now + this.config.catchCooldown
      soundManager.playCorrect()
      return
    }

    soundManager.playCatch()
    this.caughtMonsterId = monster.id
    this.askQuestion('catch', { monsterId: monster.id })
  }

  showKillEffect(x, y) {
    const particles = this.add.particles(x, y, 'question-card', {
      speed: { min: 40, max: 100 },
      scale: { start: 0.3, end: 0 },
      lifespan: 400,
      quantity: 8,
      tint: [0xe94560, 0xf5a623, 0xff0000],
    })
    this.time.delayedCall(500, () => particles.destroy())
  }

  onQuestionAnswered({ correct, questionId }) {
    if (!this.pendingQuestion) return

    this.usedQuestionIds.push(questionId)
    const { context, monsterId } = this.pendingQuestion
    this.pendingQuestion = null

    const continuesAfterAnswer = correct || context === 'card'
    if (continuesAfterAnswer) {
      this.scheduleQuestionShieldAfterAnswer()
    } else {
      this.clearQuestionShield()
    }

    if (correct) {
      this.scoreManager.add(ScoreValues.CORRECT_ANSWER)
      EventBus.emit(Events.SCORE_UPDATE, {
        score: this.scoreManager.score,
        highScore: this.scoreManager.highScore,
        level: this.level,
      })

      if (context === 'card') {
        const killed = this.killRandomMonster()
        if (killed) {
          this.scoreManager.add(killed.isBoss ? ScoreValues.BOSS_HIT : ScoreValues.MONSTER_KILL)
          this.showKillEffect(killed.sprite.x, killed.sprite.y)
          soundManager.playKill()
        }
        if (this.spawnQuestionCard()) {
          this.showFloatingText(this.player.sprite.x, this.player.sprite.y - 20, 'YENİ KART!', 0xf5a623)
        }
        EventBus.emit(Events.SCORE_UPDATE, {
          score: this.scoreManager.score,
          highScore: this.scoreManager.highScore,
          level: this.level,
        })
        this.catchCooldownUntil = this.time.now + this.config.catchCooldown
        this.resumeGame()
        this.checkLevelComplete()
      } else if (context === 'catch') {
        this.scoreManager.add(ScoreValues.ESCAPE_CATCH)
        const monster = this.monsters.find((m) => m.id === monsterId)
        if (monster) this.respawnMonster(monster)
        this.catchCooldownUntil = this.time.now + this.config.catchCooldown
        EventBus.emit(Events.SCORE_UPDATE, {
          score: this.scoreManager.score,
          highScore: this.scoreManager.highScore,
          level: this.level,
        })
        this.resumeGame()
      }
    } else {
      if (context === 'card') {
        this.spawnExtraMonster()
        this.showFloatingText(this.player.sprite.x, this.player.sprite.y - 20, 'DINOZOR EKLENDİ!', 0xe94560)
        this.catchCooldownUntil = this.time.now + this.config.catchCooldown
        this.resumeGame()
      } else if (context === 'catch') {
        soundManager.playGameOver()
        soundManager.stopMusic()
        this.clearQuestionShield()
        EventBus.emit(Events.GAME_OVER, {
          score: this.scoreManager.score,
          highScore: this.scoreManager.highScore,
          level: this.level,
          reason: 'Dinazor seni yakaladı ve soruyu bilemedin!',
        })
        this.scene.pause()
      }
    }
  }

  killRandomMonster() {
    const alive = this.monsters.filter((m) => m.alive)
    if (alive.length === 0) return null
    const target = alive[Math.floor(Math.random() * alive.length)]
    const dead = target.hurt()
    if (!dead && target.isBoss) {
      this.showFloatingText(target.sprite.x, target.sprite.y - 24, 'BOSS ZAYIFLADI!', 0xff4444)
      this.updateDinoTrackerIcon(target)
    }
    this.updateMonsterCount()
    return dead ? target : null
  }

  respawnMonster(monster) {
    const playerGrid = this.player.getGridPos()
    const exclude = [{ x: playerGrid.x, y: playerGrid.y }]
    this.monsters.forEach((m) => {
      if (m.alive) exclude.push(m.getGridPos())
    })
    const cell = getRandomEmptyCell(this.grid, exclude, {
      x: playerGrid.x,
      y: playerGrid.y,
      distance: this.config.spawnMinDistance,
    }) || getRandomEmptyCell(this.grid, exclude)

    if (cell) {
      const pos = gridToWorld(cell.x, cell.y, this.tileSize)
      monster.respawn(pos.x, pos.y)
    }
  }

  spawnExtraMonster() {
    const playerGrid = this.player.getGridPos()
    const exclude = [{ x: playerGrid.x, y: playerGrid.y }]
    this.monsters.forEach((m) => {
      if (m.alive) exclude.push(m.getGridPos())
    })
    const cell = getRandomEmptyCell(this.grid, exclude, {
      x: playerGrid.x,
      y: playerGrid.y,
      distance: this.config.spawnMinDistance,
    }) || getRandomEmptyCell(this.grid, exclude)
    if (!cell) return

    const pos = gridToWorld(cell.x, cell.y, this.tileSize)
    const id = this.monsters.length
    const textures = ['monster0', 'monster1', 'monster2', 'monster3']
    const monster = this.createMonster(pos, textures[id % 4], id)
    this.monsters.push(monster)
    this.addDinoTrackerIcon(monster, this.monsters.length - 1)
    this.repositionPauseHint()
    this.physics.add.overlap(
      this.player.sprite,
      monster.sprite,
      () => this.onMonsterCatch(monster),
      () => monster.alive && !this.paused && !this.isMonstersFrozen()
        && this.time.now >= this.catchCooldownUntil,
      this,
    )
    this.updateMonsterCount()
  }

  checkLevelComplete() {
    const alive = this.monsters.filter((m) => m.alive).length
    if (alive === 0) {
      this.pauseGame()
      soundManager.playLevelComplete()
      this.scoreManager.add(ScoreValues.LEVEL_COMPLETE)
      if (this.config.isBossLevel) {
        this.scoreManager.add(ScoreValues.BOSS_LEVEL_COMPLETE)
      }
      EventBus.emit(Events.LEVEL_COMPLETE, {
        score: this.scoreManager.score,
        highScore: this.scoreManager.highScore,
        level: this.level,
        nextLevel: this.level + 1,
        isBossLevel: this.config.isBossLevel,
      })
    }
  }

  update() {
    if (this.paused || this.menuPaused) return
    this.player.update()
    const time = this.time.now
    if (!this.isMonstersFrozen()) {
      this.monsters.forEach((m) => m.update(time, this.player))
    }
    this.updateMonsterFreezeVisuals()
    this.updateShieldAura()
    this.updateFog()
    this.updateEntityVisibility()
    this.updateMinimap()
  }

  updateMonsterFreezeVisuals() {
    const frozen = this.isMonstersFrozen()
    this.monsters.forEach((m) => {
      if (!m.alive) return
      if (frozen) m.sprite.setTint(0x88ccff)
      else m.sprite.setTint(m.baseTint)
      this.updateDinoTrackerIcon(m)
    })
  }
}
