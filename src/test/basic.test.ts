import { describe, it, expect } from 'vitest'

describe('Basic Setup Tests', () => {
  it('should pass a basic test', () => {
    expect(2 + 2).toBe(4)
  })

  it('should have testing environment setup correctly', () => {
    expect(true).toBe(true)
  })
})
