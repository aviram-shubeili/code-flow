/**
 * useDebounce Hook Test
 *
 * This test demonstrates:
 * - Custom hook testing with renderHook
 * - Timer-based functionality testing
 * - Hook state changes over time
 * - Proper cleanup testing
 * - TypeScript usage in hook tests
 */

import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useDebounce } from '@/hooks/utils/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))

    expect(result.current).toBe('initial')
  })

  it('works with different data types', () => {
    // Test with numbers
    const { result: numberResult } = renderHook(() => useDebounce(42, 200))
    expect(numberResult.current).toBe(42)

    // Test with objects
    const obj = { id: 1, name: 'test' }
    const { result: objectResult } = renderHook(() => useDebounce(obj, 200))
    expect(objectResult.current).toEqual(obj)

    // Test with strings
    const { result: stringResult } = renderHook(() => useDebounce('test', 200))
    expect(stringResult.current).toBe('test')
  })

  it('accepts different delay values', () => {
    const { result: shortDelay } = renderHook(() => useDebounce('test', 100))
    expect(shortDelay.current).toBe('test')

    const { result: longDelay } = renderHook(() => useDebounce('test', 1000))
    expect(longDelay.current).toBe('test')

    const { result: zeroDelay } = renderHook(() => useDebounce('test', 0))
    expect(zeroDelay.current).toBe('test')
  })

  it('handles hook re-renders correctly', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    )

    expect(result.current).toBe('initial')

    // Change the props
    rerender({ value: 'updated', delay: 300 })

    // Value should still be initial immediately after rerender
    expect(result.current).toBe('initial')
  })

  it('cleans up timers on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

    const { unmount } = renderHook(() => useDebounce('test', 500))

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()

    clearTimeoutSpy.mockRestore()
  })

  it('creates proper timeout when value changes', () => {
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout')

    const { rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    )

    // Clear any existing calls
    setTimeoutSpy.mockClear()

    // Change the value - should create a new timeout
    rerender({ value: 'updated', delay: 500 })

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 500)

    setTimeoutSpy.mockRestore()
  })
})
