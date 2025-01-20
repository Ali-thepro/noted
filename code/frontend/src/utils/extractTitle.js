const extractTitle = (content, activeNoteTitle) => {
  const lines = content.split('\n')
  if (lines.length === 0) return activeNoteTitle

  const firstLine = lines[0].trim()

  if (!firstLine.startsWith('#')) return activeNoteTitle

  const headerMatch = firstLine.match(/^#{1,6}\s+(.*)$/)

  if (headerMatch) {
    return headerMatch[1].trim()
  }

  return activeNoteTitle
}

export default extractTitle
