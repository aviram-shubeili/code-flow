/**
 * Utils Test
 *
 * This test demonstrates:
 * - Pure function testing
 * - Edge case handling
 * - Multiple test scenarios per function
 * - TypeScript utility function testing
 */

import { describe, expect, it, vi } from 'vitest'

import { clamp, cn, delay, formatCurrency, generateId, truncateText } from '@/lib/utils'

describe('Utils', () => {
  describe('clamp', () => {
    it('returns value when within range', () => {
      expect(clamp(5, 1, 10)).toBe(5)
      expect(clamp(1, 1, 10)).toBe(1)
      expect(clamp(10, 1, 10)).toBe(10)
    })

    it('clamps to minimum when value is too low', () => {
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(-100, -50, 50)).toBe(-50)
    })

    it('clamps to maximum when value is too high', () => {
      expect(clamp(15, 1, 10)).toBe(10)
      expect(clamp(100, -50, 50)).toBe(50)
    })

    it('handles edge case where min equals max', () => {
      expect(clamp(5, 3, 3)).toBe(3)
      expect(clamp(1, 3, 3)).toBe(3)
    })
  })

  describe('formatCurrency', () => {
    it('formats USD currency by default', () => {
      expect(formatCurrency(100)).toBe('$100.00')
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('formats different currencies', () => {
      expect(formatCurrency(100, 'EUR')).toBe('€100.00')
      expect(formatCurrency(100, 'GBP')).toBe('£100.00')
      expect(formatCurrency(100, 'JPY')).toBe('¥100')
    })

    it('handles negative amounts', () => {
      expect(formatCurrency(-50)).toBe('-$50.00')
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
    })

    it('handles large numbers', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00')
    })
  })

  describe('truncateText', () => {
    it('returns original text when shorter than max length', () => {
      expect(truncateText('short', 10)).toBe('short')
      expect(truncateText('exactly10c', 10)).toBe('exactly10c')
    })

    it('truncates text when longer than max length', () => {
      expect(truncateText('this is a long text', 10)).toBe('this is a ...')
      expect(truncateText('hello world', 5)).toBe('hello...')
    })

    it('handles edge cases', () => {
      expect(truncateText('', 5)).toBe('')
      expect(truncateText('a', 1)).toBe('a')
      expect(truncateText('ab', 1)).toBe('a...')
    })

    it('handles zero max length', () => {
      expect(truncateText('hello', 0)).toBe('...')
    })
  })

  describe('cn (className utility)', () => {
    it('combines multiple class names', () => {
      expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3')
    })

    it('filters out falsy values', () => {
      expect(cn('class1', false, 'class2', null, 'class3', undefined, '')).toBe(
        'class1 class2 class3'
      )
    })

    it('handles empty input', () => {
      expect(cn()).toBe('')
      expect(cn(false, null, undefined, '')).toBe('')
    })

    it('handles boolean conditions', () => {
      const isActive = true
      const isDisabled = false
      expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active')
    })
  })

  describe('delay', () => {
    it('resolves after specified time', async () => {
      vi.useFakeTimers()

      const promise = delay(100)
      let resolved = false

      promise.then(() => {
        resolved = true
      })

      // Should not be resolved immediately
      expect(resolved).toBe(false)

      // Fast-forward time
      vi.advanceTimersByTime(100)
      await promise

      expect(resolved).toBe(true)

      vi.useRealTimers()
    })

    it('works with zero delay', async () => {
      const start = Date.now()
      await delay(0)
      const end = Date.now()

      // Should resolve almost immediately (allowing for more variation)
      expect(end - start).toBeLessThan(50)
    })
  })

  describe('generateId', () => {
    it('generates a string', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })

    it('generates unique IDs', () => {
      const ids = Array.from({ length: 100 }, () => generateId())
      const uniqueIds = new Set(ids)

      // All generated IDs should be unique
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('generates IDs with expected format', () => {
      const id = generateId()

      // Should be alphanumeric (base36 characters)
      expect(id).toMatch(/^[a-z0-9]+$/)
      expect(id.length).toBe(9) // substr(2, 9) should give 9 characters
    })
  })
})
