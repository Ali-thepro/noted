import extractTitle from '../src/utils/extractTitle'

describe('extractTitle', () => {
  const defaultTitle = 'Default Title'

  it('returns active note title when content is empty', () => {
    const content = ''
    const result = extractTitle(content, defaultTitle)
    expect(result).toBe(defaultTitle)
  })

  it('extracts title from h1 header', () => {
    const content = '# My New Note\nSome content here'
    const result = extractTitle(content, defaultTitle)
    expect(result).toBe('My New Note')
  })

  it('extracts title from headers of different levels', () => {
    const headers = [
      '# H1 Title',
      '## H2 Title',
      '### H3 Title',
      '#### H4 Title',
      '##### H5 Title',
      '###### H6 Title'
    ]

    headers.forEach(header => {
      const content = `${header}\nSome content`
      const result = extractTitle(content, defaultTitle)
      expect(result).toBe(header.replace(/^#+\s+/, ''))
    })
  })

  it('returns active note title when first line is not a header', () => {
    const content = 'Random text\n# Header in second line'
    const result = extractTitle(content, defaultTitle)
    expect(result).toBe(defaultTitle)
  })

  it('handles headers with multiple spaces after #', () => {
    const content = '#    Title with extra spaces\nContent'
    const result = extractTitle(content, defaultTitle)
    expect(result).toBe('Title with extra spaces')
  })

  it('handles headers with trailing spaces', () => {
    const content = '# Title with trailing spaces    \nContent'
    const result = extractTitle(content, defaultTitle)
    expect(result).toBe('Title with trailing spaces')
  })

  it('returns active note title when # is not followed by space', () => {
    const content = '#NoSpaceTitle\nContent'
    const result = extractTitle(content, defaultTitle)
    expect(result).toBe(defaultTitle)
  })
})