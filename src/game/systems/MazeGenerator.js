const DIRECTIONS = [
  [0, -2],
  [2, 0],
  [0, 2],
  [-2, 0],
]

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export function generateMaze(width, height, loopRemoval = 0.1) {
  const cols = width * 2 + 1
  const rows = height * 2 + 1
  const grid = Array.from({ length: rows }, () => Array(cols).fill(1))

  function carve(x, y) {
    grid[y][x] = 0
    const dirs = shuffle([...DIRECTIONS])
    for (const [dx, dy] of dirs) {
      const nx = x + dx
      const ny = y + dy
      if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && grid[ny][nx] === 1) {
        grid[y + dy / 2][x + dx / 2] = 0
        carve(nx, ny)
      }
    }
  }

  carve(1, 1)
  addLoops(grid, cols, rows, loopRemoval)
  reduceDeadEnds(grid, Math.min(loopRemoval * 1.3, 0.92))
  addLoops(grid, cols, rows, loopRemoval * 0.6)
  reduceDeadEnds(grid, 0.88)

  return { grid, cols, rows }
}

const NEIGHBORS = [[0, 1], [0, -1], [1, 0], [-1, 0]]

function addLoops(grid, cols, rows, intensity) {
  const attempts = Math.floor(cols * rows * intensity * 0.32)
  for (let i = 0; i < attempts; i++) {
    const x = 1 + Math.floor(Math.random() * (cols - 2))
    const y = 1 + Math.floor(Math.random() * (rows - 2))
    if (grid[y][x] !== 1) continue
    const openNeighbors = NEIGHBORS.filter(([dx, dy]) => grid[y + dy]?.[x + dx] === 0)
    if (openNeighbors.length >= 2) grid[y][x] = 0
  }
}

function findDeadEnds(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const deadEnds = []

  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      if (grid[y][x] !== 0) continue
      const openCount = NEIGHBORS.filter(([dx, dy]) => grid[y + dy][x + dx] === 0).length
      if (openCount === 1) deadEnds.push({ x, y })
    }
  }

  return deadEnds
}

function tryOpenDeadEnd(grid, x, y) {
  const candidates = []

  for (const [dx, dy] of NEIGHBORS) {
    const wx = x + dx
    const wy = y + dy
    if (grid[wy][wx] !== 0) {
      const beyondX = wx + dx
      const beyondY = wy + dy
      if (grid[beyondY]?.[beyondX] === 0) candidates.push([wx, wy])
    }
  }

  if (candidates.length === 0) return false

  const [wx, wy] = candidates[Math.floor(Math.random() * candidates.length)]
  grid[wy][wx] = 0
  return true
}

function reduceDeadEnds(grid, ratio) {
  for (let pass = 0; pass < 5; pass++) {
    const deadEnds = shuffle(findDeadEnds(grid))
    if (deadEnds.length === 0) break

    const target = Math.max(1, Math.floor(deadEnds.length * ratio))
    let opened = 0

    for (const { x, y } of deadEnds) {
      if (opened >= target) break
      if (tryOpenDeadEnd(grid, x, y)) opened++
    }

    if (opened === 0) break
  }
}

export function getEmptyCells(grid) {
  const cells = []
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      if (grid[y][x] === 0) cells.push({ x, y })
    }
  }
  return cells
}

export function getRandomEmptyCell(grid, exclude = [], minDistanceFrom = null) {
  let cells = getEmptyCells(grid).filter(
    (c) => !exclude.some((e) => e.x === c.x && e.y === c.y),
  )

  if (minDistanceFrom) {
    const distant = cells.filter((c) => {
      const dx = c.x - minDistanceFrom.x
      const dy = c.y - minDistanceFrom.y
      return Math.sqrt(dx * dx + dy * dy) >= (minDistanceFrom.distance || 6)
    })
    if (distant.length > 0) cells = distant
  }

  if (cells.length === 0) return null
  return cells[Math.floor(Math.random() * cells.length)]
}

export function gridToWorld(cellX, cellY, tileSize) {
  return {
    x: cellX * tileSize + tileSize / 2,
    y: cellY * tileSize + tileSize / 2,
  }
}

export function worldToGrid(x, y, tileSize) {
  return {
    x: Math.floor(x / tileSize),
    y: Math.floor(y / tileSize),
  }
}

export function isWalkable(grid, gx, gy) {
  if (gy < 0 || gy >= grid.length || gx < 0 || gx >= grid[0].length) return false
  return grid[gy][gx] === 0
}

export const NAME_PATH_ROW = 1
export const NAME_PATH_LENGTH = 12

export function carveTopLeftNamePath(grid) {
  const cols = grid[0].length
  const length = Math.min(NAME_PATH_LENGTH, cols - 2)
  for (let x = 1; x < 1 + length; x++) {
    grid[NAME_PATH_ROW][x] = 0
  }
  return length
}

export function getTopLeftNamePathCells(length = NAME_PATH_LENGTH) {
  const cells = []
  for (let x = 1; x < 1 + length; x++) {
    cells.push({ x, y: NAME_PATH_ROW })
  }
  return cells
}
