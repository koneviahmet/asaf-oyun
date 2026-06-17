import { isWalkable } from './MazeGenerator.js'

const NEIGHBORS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
]

export function findPath(grid, startX, startY, endX, endY) {
  if (!isWalkable(grid, endX, endY)) return []

  const key = (x, y) => `${x},${y}`
  const queue = [{ x: startX, y: startY }]
  const visited = new Set([key(startX, startY)])
  const parent = new Map()

  while (queue.length > 0) {
    const current = queue.shift()
    if (current.x === endX && current.y === endY) {
      const path = []
      let node = current
      while (node) {
        path.unshift(node)
        node = parent.get(key(node.x, node.y))
      }
      return path
    }

    for (const [dx, dy] of NEIGHBORS) {
      const nx = current.x + dx
      const ny = current.y + dy
      const k = key(nx, ny)
      if (!visited.has(k) && isWalkable(grid, nx, ny)) {
        visited.add(k)
        parent.set(k, current)
        queue.push({ x: nx, y: ny })
      }
    }
  }

  return []
}
