import { describe, expect, it } from 'vitest'

import { distance, pathLength } from './geometry'

describe('distance', () => {
  it('is zero from a point to itself', () => {
    expect(distance({ x: 3, y: 4 }, { x: 3, y: 4 })).toBe(0)
  })

  it('measures a 3-4-5 triangle', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
  })
})

describe('pathLength', () => {
  it('is zero for an empty path or a single point', () => {
    expect(pathLength([])).toBe(0)
    expect(pathLength([{ x: 1, y: 1 }])).toBe(0)
  })

  it('adds up every segment', () => {
    const path = [
      { x: 0, y: 0 },
      { x: 3, y: 4 },
      { x: 3, y: 10 },
    ]
    expect(pathLength(path)).toBe(11)
  })
})
