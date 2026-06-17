import { Difficulties } from '../systems/GameSettings.js'

export function getLevelConfig(level, difficulty = 'normal') {
  const diff = Difficulties[difficulty] || Difficulties.normal

  const base = {
    width: 15,
    height: 15,
    monsterCount: 4,
    questionCardCount: 7,
    monsterSpeed: 75,
    playerSpeed: 130,
    loopRemoval: 0.55,
    spawnMinDistance: 8,
    catchCooldown: 1500,
  }

  let config
  if (level <= 1) config = { ...base }
  else if (level === 2) {
    config = {
      ...base,
      width: 20,
      height: 20,
      questionCardCount: 8,
      loopRemoval: 0.6,
      monsterSpeed: 82,
      spawnMinDistance: 10,
    }
  } else if (level === 3) {
    config = {
      ...base,
      width: 25,
      height: 25,
      questionCardCount: 9,
      loopRemoval: 0.65,
      monsterSpeed: 90,
      spawnMinDistance: 12,
    }
  } else {
    const extra = level - 3
    config = {
      ...base,
      width: Math.min(25 + extra * 2, 35),
      height: Math.min(25 + extra * 2, 35),
      questionCardCount: Math.min(9 + extra, 14),
      loopRemoval: Math.min(0.65 + extra * 0.03, 0.78),
      monsterSpeed: Math.min(90 + extra * 4, 120),
      playerSpeed: 130,
      spawnMinDistance: Math.min(12 + extra, 16),
    }
  }

  const isBossLevel = level % 5 === 0
  if (isBossLevel) {
    config = {
      ...config,
      isBossLevel: true,
      bossSpeedMult: 1.35,
      visionRadius: 4,
    }
  } else {
    config = { ...config, isBossLevel: false, visionRadius: 3 }
  }

  return applyDifficulty(config, diff)
}

function applyDifficulty(config, diff) {
  return {
    ...config,
    monsterCount: Math.max(2, config.monsterCount + diff.countDelta),
    questionCardCount: Math.max(2, config.questionCardCount + diff.cardDelta),
    monsterSpeed: Math.round(config.monsterSpeed * diff.monsterMult),
    playerSpeed: Math.round(config.playerSpeed * diff.speedMult),
  }
}
