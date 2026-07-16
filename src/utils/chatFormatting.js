const LEADING_EMOJI_PATTERN = /^(\p{Extended_Pictographic}(?:\uFE0F)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F)?)*)\s*/u
const LEADING_MARKER_PATTERN = /^[-*•·▪]\s+/

function parseInlineMarkdown(text = '') {
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

function stripLeadingMarkers(text = '') {
  let value = String(text).trim()
  while (LEADING_MARKER_PATTERN.test(value)) {
    value = value.replace(LEADING_MARKER_PATTERN, '')
  }
  return value.trim()
}

function stripLeadingEmoji(text = '') {
  const match = String(text).match(LEADING_EMOJI_PATTERN)
  if (!match) return { icon: null, text: String(text).trim() }
  return { icon: match[1], text: String(text).slice(match[0].length).trim() }
}

function pickLineIcon(text = '') {
  const value = String(text).trim()

  if (/^(일정|기간|날짜)/.test(value) || /\d{4}[./-]\d{1,2}/.test(value) || /\d{1,2}\/\d{1,2}/.test(value)) {
    return '📅'
  }
  if (/^(장소|주소|위치)/.test(value)) {
    return '📍'
  }
  if (/^(요금|입장료|가격|티켓)/.test(value) || /(무료|유료|\d+[,]?\d*원)/.test(value)) {
    return '💰'
  }
  if (/^(연락처|전화|문의)/.test(value) || /\d{2,3}-\d{3,4}-\d{4}/.test(value)) {
    return '📞'
  }
  if (/축제|페스티벌|공연|행사|콘|페어|비치|페스타|마켓/.test(value)) {
    return '🎪'
  }
  if (/관광지|궁|타워|마을|뮤지엄|박물관|미술관|한옥|전망대/.test(value)) {
    return '🏛️'
  }
  if (/여행코스|코스|동선|루트/.test(value)) {
    return '🗺️'
  }
  if (/레포츠|체험|스포츠|서핑|자전거|액티비티/.test(value)) {
    return '🏃'
  }
  if (/게시글|후기|리뷰|커뮤니티|작성/.test(value)) {
    return '📝'
  }
  if (/숙박|호텔|게스트하우스/.test(value)) {
    return '🏨'
  }
  if (/쇼핑|시장|면세/.test(value)) {
    return '🛍️'
  }
  if (/날씨|기온|강수|여행 적합/.test(value)) {
    return '🌤️'
  }
  if (/맛집|음식점|식당/.test(value)) {
    return '🍽️'
  }

  return null
}

function normalizeLineForDisplay(line = '') {
  let value = stripLeadingMarkers(String(line).trim())
  const { icon: leadingIcon, text: withoutEmoji } = stripLeadingEmoji(value)
  const body = stripLeadingMarkers(withoutEmoji)
  const icon = leadingIcon || pickLineIcon(body)

  return { icon, text: body }
}

function isIntroLine(text = '') {
  const value = String(text).trim()
  return (
    /(?:추천|안내|모아봤|찾아봤|도와드릴|알려드릴|살펴봤|정리했|도움이)/.test(value)
    || /(?:입니다|해요|어요|게요|까요|세요|할게요)[.!]?$/.test(value)
  ) && !/\d{4}[./-]\d{1,2}/.test(value) && !/서울특별시/.test(value)
}

export function formatChatMessageBlocks(text = '') {
  const lines = String(text).split(/\r?\n/)

  return lines.reduce((blocks, rawLine) => {
    const line = rawLine.trim()
    if (!line) return blocks

    const numbered = line.match(/^\d+\.\s+(.+)/)
    const content = numbered ? numbered[1] : line
    const { icon, text: body } = normalizeLineForDisplay(content)

    if (!body) return blocks

    if (/^#{1,3}\s+/.test(body)) {
      const heading = body.replace(/^#{1,3}\s+/, '')
      blocks.push({
        type: 'line',
        text: heading,
        icon: icon || '✨',
        segments: parseInlineMarkdown(heading),
      })
      return blocks
    }

    if (/^\*\*.+\*\*$/.test(body)) {
      blocks.push({
        type: 'line',
        text: body.replace(/^\*\*|\*\*$/g, ''),
        icon: icon || '✨',
        segments: parseInlineMarkdown(body.replace(/^\*\*|\*\*$/g, '')),
      })
      return blocks
    }

    const resolvedIcon =
      blocks.length === 0 && isIntroLine(body) ? '💬' : icon || '📌'

    blocks.push({
      type: 'line',
      text: body,
      icon: resolvedIcon,
      segments: parseInlineMarkdown(body),
    })
    return blocks
  }, [])
}
