import { describe, it, expect } from 'vitest'
import {
  fitnessAverage,
  dominates,
  FitnessVector,
} from '../../src/mrp/fitnessVector.js'

describe('fitnessVector helpers', () => {
  it('fitnessAverage computes equal-weight mean by default', () => {
    const v: FitnessVector = {
      correctness: 1,
      performance: 0.5,
      cost: 0.25,
      compliance: 0.75,
      novelty: 0.0,
      provenance: 1,
    }
    expect(fitnessAverage(v)).toBeCloseTo(0.5833333333333334)
  })

  it('fitnessAverage uses partial custom weights', () => {
    const v: FitnessVector = {
      correctness: 1,
      performance: 0.5,
      cost: 0.0,
      compliance: 1,
      novelty: 0.75,
      provenance: 0,
    }
    const value = fitnessAverage(v, { correctness: 2, performance: 0 })
    expect(value).toBeCloseTo(0.625)
  })

  it('fitnessAverage returns zero when total weight is zero', () => {
    const v: FitnessVector = {
      correctness: 0.4,
      performance: 0.7,
      cost: 0.2,
      compliance: 0.1,
      novelty: 0.9,
      provenance: 0.3,
    }
    expect(fitnessAverage(v, {
      correctness: 0,
      performance: 0,
      cost: 0,
      compliance: 0,
      novelty: 0,
      provenance: 0,
    })).toBe(0)
  })

  it('dominates identifies a strictly better vector', () => {
    const a: FitnessVector = {
      correctness: 1,
      performance: 0.8,
      cost: 0.7,
      compliance: 0.9,
      novelty: 0.6,
      provenance: 0.4,
    }
    const b: FitnessVector = {
      correctness: 0.9,
      performance: 0.8,
      cost: 0.7,
      compliance: 0.8,
      novelty: 0.6,
      provenance: 0.3,
    }
    expect(dominates(a, b)).toBe(true)
  })

  it('dominates rejects weaker vectors', () => {
    const a: FitnessVector = {
      correctness: 0.9,
      performance: 0.8,
      cost: 0.7,
      compliance: 0.4,
      novelty: 0.6,
      provenance: 0.4,
    }
    const b: FitnessVector = {
      correctness: 0.9,
      performance: 0.8,
      cost: 0.7,
      compliance: 0.8,
      novelty: 0.6,
      provenance: 0.3,
    }
    expect(dominates(a, b)).toBe(false)
  })

  it('dominates requires strict superiority in at least one dimension', () => {
    const a: FitnessVector = {
      correctness: 0.9,
      performance: 0.8,
      cost: 0.7,
      compliance: 0.8,
      novelty: 0.6,
      provenance: 0.4,
    }
    const b: FitnessVector = {
      correctness: 0.9,
      performance: 0.8,
      cost: 0.7,
      compliance: 0.8,
      novelty: 0.6,
      provenance: 0.4,
    }
    expect(dominates(a, b)).toBe(false)
  })

  it('dominates is false when better in one dim but worse in another', () => {
    const a: FitnessVector = {
      correctness: 1,
      performance: 0.2,
      cost: 0.7,
      compliance: 0.8,
      novelty: 0.6,
      provenance: 0.4,
    }
    const b: FitnessVector = {
      correctness: 0.9,
      performance: 0.8,
      cost: 0.8,
      compliance: 0.9,
      novelty: 0.7,
      provenance: 0.4,
    }
    expect(dominates(a, b)).toBe(false)
  })

  it('dominates is directional', () => {
    const a: FitnessVector = {
      correctness: 1,
      performance: 0.9,
      cost: 0.8,
      compliance: 0.9,
      novelty: 1,
      provenance: 0.9,
    }
    const b: FitnessVector = {
      correctness: 0.95,
      performance: 0.9,
      cost: 0.8,
      compliance: 0.8,
      novelty: 0.9,
      provenance: 0.85,
    }

    expect(dominates(a, b)).toBe(true)
    expect(dominates(b, a)).toBe(false)
  })

  it('fitnessAverage accepts sparse weights with explicit defaults', () => {
    const v: FitnessVector = {
      correctness: 0,
      performance: 0,
      cost: 1,
      compliance: 1,
      novelty: 0,
      provenance: 0,
    }
    expect(fitnessAverage(v, { performance: 100, correctness: 0 })).toBeCloseTo((0 + 100 * 0 + 1 + 1 + 0 + 0) / 104)
  })
})

