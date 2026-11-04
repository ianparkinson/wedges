/** A seeded Park–Miller random number generator, so synthetic drawings are repeatable. */
export class Random {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  /** A number in (0, 1). */
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647
    return this.seed / 2147483647
  }

  /** Roughly normal noise with mean 0 and standard deviation about 0.7. */
  gauss(): number {
    return (this.next() + this.next() + this.next() - 1.5) * 1.4
  }

  /** A number in [min, max). */
  between(min: number, max: number): number {
    return min + this.next() * (max - min)
  }

  /** A copy of `items` in random order. */
  shuffle<T>(items: readonly T[]): T[] {
    const out = [...items]
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1))
      ;[out[i], out[j]] = [out[j]!, out[i]!]
    }
    return out
  }
}
