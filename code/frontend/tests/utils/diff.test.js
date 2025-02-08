import { describe, it, expect } from 'vitest'
import diff_match_patch, { buildVersionContent, shouldCreateSnapshot } from '../../src/utils/diff'

describe('diff_match_patch delta extensions', () => {
  const dmp = new diff_match_patch()

  describe('diff_toDelta', () => {
    it('handles basic insertions', () => {
      const diffs = [
        [diff_match_patch.DIFF_INSERT, 'hello']
      ]
      expect(dmp.diff_toDelta(diffs)).toBe('+hello')
    })

    it('handles basic deletions', () => {
      const diffs = [
        [diff_match_patch.DIFF_DELETE, 'hello']
      ]
      expect(dmp.diff_toDelta(diffs)).toBe('-5')
    })

    it('handles basic equality', () => {
      const diffs = [
        [diff_match_patch.DIFF_EQUAL, 'hello']
      ]
      expect(dmp.diff_toDelta(diffs)).toBe('=5')
    })

    it('handles special characters', () => {
      const diffs = [
        [diff_match_patch.DIFF_INSERT, '!~\'();/?:@&=+$,#*']
      ]
      const delta = dmp.diff_toDelta(diffs)
      expect(delta).toBe('+!~\'();/?:@&=+$,#*')
    })
  })

  describe('diff_fromDelta', () => {
    it('handles basic insertions', () => {
      const text = ''
      const delta = '+hello'
      const diffs = dmp.diff_fromDelta(text, delta)
      expect(diffs).toEqual([
        [diff_match_patch.DIFF_INSERT, 'hello']
      ])
    })

    it('handles basic deletions', () => {
      const text = 'hello'
      const delta = '-5'
      const diffs = dmp.diff_fromDelta(text, delta)
      expect(diffs).toEqual([
        [diff_match_patch.DIFF_DELETE, 'hello']
      ])
    })

    it('handles basic equality', () => {
      const text = 'hello'
      const delta = '=5'
      const diffs = dmp.diff_fromDelta(text, delta)
      expect(diffs).toEqual([
        [diff_match_patch.DIFF_EQUAL, 'hello']
      ])
    })

    it('handles mixed operations', () => {
      const text = 'hello cruel world'
      const delta = '=6\t-6\t+wonderful \t=5'
      const diffs = dmp.diff_fromDelta(text, delta)
      expect(diffs).toEqual([
        [diff_match_patch.DIFF_EQUAL, 'hello '],
        [diff_match_patch.DIFF_DELETE, 'cruel '],
        [diff_match_patch.DIFF_INSERT, 'wonderful '],
        [diff_match_patch.DIFF_EQUAL, 'world']
      ])
    })

    it('throws error on invalid delta', () => {
      const text = 'hello'
      const delta = '?5'
      expect(() => dmp.diff_fromDelta(text, delta)).toThrow('Unknown DiffOp: ?')
    })

    it('throws error on invalid length', () => {
      const text = 'hello'
      const delta = '-10'
      expect(() => dmp.diff_fromDelta(text, delta)).toThrow()
    })
  })
})

describe('Version control utilities', () => {
  describe('shouldCreateSnapshot', () => {
    it('returns true for version numbers divisible by 10', () => {
      expect(shouldCreateSnapshot(10)).toBe(true)
      expect(shouldCreateSnapshot(20)).toBe(true)
      expect(shouldCreateSnapshot(30)).toBe(true)
    })

    it('returns false for version numbers not divisible by 10', () => {
      expect(shouldCreateSnapshot(1)).toBe(false)
      expect(shouldCreateSnapshot(11)).toBe(false)
      expect(shouldCreateSnapshot(25)).toBe(false)
    })
  })

  describe('buildVersionContent', () => {
    it('returns empty string for empty chain', () => {
      expect(buildVersionContent([])).toBe('')
    })

    it('returns snapshot content when chain only contains snapshot', () => {
      const chain = [{
        type: 'snapshot',
        content: 'hello world'
      }]
      expect(buildVersionContent(chain)).toBe('hello world')
    })

    it('applies diffs correctly', () => {
      const chain = [
        {
          type: 'snapshot',
          content: 'hello cruel world'
        },
        {
          type: 'diff',
          content: '=6\t-6\t+wonderful \t=5',
          metadata: { versionNumber: 2 }
        }
      ]
      expect(buildVersionContent(chain)).toBe('hello wonderful world')
    })

    it('returns empty string when chain doesn\'t start with snapshot', () => {
      const chain = [{
        type: 'diff',
        content: '+hello'
      }]
      expect(buildVersionContent(chain)).toBe('')
    })
  })
})
