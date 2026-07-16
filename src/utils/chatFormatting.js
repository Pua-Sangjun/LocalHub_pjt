function splitBoldSegments(text = '') {
  const segments = []
  const pattern = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), bold: false })
    }
    segments.push({ text: match[1], bold: true })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), bold: false })
  }

  return segments.length > 0 ? segments : [{ text, bold: false }]
}

function autoBoldKeyTerms(text = '') {
  const terms = [
    '경복궁', '창덕궁', '창경궁', '덕수궁', '북촌한옥마을', '한강야시장', '청계천',
    '서울숲', '롯데월드', '남산타워', '국립중앙박물관', '인사동', '광화문',
    '국립현대미술관', '여의도', '용산', '강남', '홍대', '이태원', '명동', '잠실',
    '뮤지컬', '페스티벌', '공연', '행사', '전시', '한강',
  ]

  const uniqueTerms = [...new Set(terms)].sort((a, b) => b.length - a.length)
  const segments = []
  let cursor = 0

  while (cursor < text.length) {
    let nextMatch = null

    uniqueTerms.forEach((term) => {
      const index = text.indexOf(term, cursor)
      if (index === -1) return
      if (!nextMatch || index < nextMatch.index || (index === nextMatch.index && term.length > nextMatch.term.length)) {
        nextMatch = { index, term }
      }
    })

    if (!nextMatch || nextMatch.index > cursor) {
      const plain = text.slice(cursor, nextMatch ? nextMatch.index : text.length)
      if (plain) {
        segments.push({ text: plain, bold: false })
      }
      cursor = nextMatch ? nextMatch.index : text.length
      if (!nextMatch) break
    }

    if (nextMatch) {
      segments.push({ text: nextMatch.term, bold: true })
      cursor = nextMatch.index + nextMatch.term.length
    }
  }

  return segments.length > 0 ? segments : [{ text, bold: false }]
}

function parseInlineMarkdown(text = '') {
  const segments = []
  const pattern = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push(...autoBoldKeyTerms(text.slice(lastIndex, match.index)))
    }
    segments.push({ text: match[1], bold: true })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    segments.push(...autoBoldKeyTerms(text.slice(lastIndex)))
  }

  return segments.length > 0 ? segments : [{ text, bold: false }]
}

function normalizeEntryText(text = '') {
  const trimmed = String(text).trim()
  const withColon = trimmed.replace(/^[-*•]\s*/, '')
  return withColon.replace(/\s+/g, ' ')
}

export function formatChatMessageBlocks(text = '') {
  const lines = String(text).split(/\r?\n/)

  return lines.reduce((blocks, rawLine) => {
    const line = rawLine.trim()
    if (!line) return blocks

    if (/^[-*•]\s+/.test(line)) {
      blocks.push({
        type: 'bullet',
        text: normalizeEntryText(line),
        icon: '📌',
        segments: parseInlineMarkdown(normalizeEntryText(line)),
      })
      return blocks
    }

    if (/^\d+\.\s+/.test(line)) {
      blocks.push({
        type: 'number',
        text: normalizeEntryText(line.replace(/^\d+\.\s+/, '')),
        icon: '🔢',
        segments: parseInlineMarkdown(normalizeEntryText(line.replace(/^\d+\.\s+/, ''))),
      })
      return blocks
    }

    if (/^#{1,3}\s+/.test(line)) {
      blocks.push({
        type: 'heading',
        text: line.replace(/^#{1,3}\s+/, ''),
        icon: '✨',
        segments: parseInlineMarkdown(line.replace(/^#{1,3}\s+/, '')),
      })
      return blocks
    }

    if (/^\*\*.+\*\*$/.test(line)) {
      blocks.push({
        type: 'heading',
        text: line.replace(/^\*\*|\*\*$/g, ''),
        icon: '✨',
        segments: parseInlineMarkdown(line.replace(/^\*\*|\*\*$/g, '')),
      })
      return blocks
    }

    blocks.push({
      type: 'paragraph',
      text: line,
      icon: '💬',
      segments: parseInlineMarkdown(line),
    })
    return blocks
  }, [])
}
