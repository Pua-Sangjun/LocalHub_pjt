function parseFestivalDate(value) {
  if (!value || String(value).length !== 8) return null
  return {
    year: Number(String(value).slice(0, 4)),
    month: Number(String(value).slice(4, 6)),
    day: Number(String(value).slice(6, 8)),
  }
}

function formatFestivalDate(value) {
  if (!value || String(value).length !== 8) return null
  return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`
}

function isEventInMonth(item, targetYear, targetMonth) {
  const start = parseFestivalDate(item?.eventstartdate)
  const end = parseFestivalDate(item?.eventenddate)

  if (!start || !end) return false

  const target = targetYear * 100 + targetMonth
  const startKey = start.year * 100 + start.month
  const endKey = end.year * 100 + end.month

  return startKey <= target && target <= endKey
}

export function buildFestivalReply(message = '', tourItems = []) {
  const text = String(message).trim().toLowerCase()
  const asksFestival = /축제|행사|일정|언제/.test(text)
  const asksThisMonth = /이번\s*달|이번달|이달|이번\s*월/.test(text)
  const asksSeoul = /서울/.test(text)

  if (!asksFestival || !asksThisMonth || !asksSeoul) {
    return null
  }

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const matchingItems = (tourItems || [])
    .filter((item) => item?.dataType === '축제공연행사')
    .filter((item) => isEventInMonth(item, year, month))
    .sort((a, b) => String(a?.eventstartdate || '').localeCompare(String(b?.eventstartdate || '')))

  if (!matchingItems.length) {
    return '이번 달 서울 축제 일정 데이터에서 찾지 못했습니다.'
  }

  const lines = ['이번 달 서울 축제 일정입니다.']

  matchingItems.forEach((item) => {
    const title = item?.title || '행사'
    const start = formatFestivalDate(item?.eventstartdate)
    const end = formatFestivalDate(item?.eventenddate)
    const dateText = start && end && start !== end ? `${start}~${end}` : start || end || ''
    const place = item?.eventplace || item?.addr1 || ''
    const fee = item?.usetimefestival || ''

    const details = [dateText, place, fee].filter(Boolean)
    lines.push(`- **${title}** : ${details.join(' | ')}`)
  })

  return lines.join('\n')
}
