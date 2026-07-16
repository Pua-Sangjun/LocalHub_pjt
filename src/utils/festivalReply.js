const LONG_EVENT_DAYS = 90
const MAX_RESULTS = 12

function parseFestivalDate(value) {
  if (!value || String(value).length !== 8) return null
  return {
    year: Number(String(value).slice(0, 4)),
    month: Number(String(value).slice(4, 6)),
    day: Number(String(value).slice(6, 8)),
  }
}

function toDate({ year, month, day }) {
  return new Date(year, month - 1, day)
}

function formatFestivalDate(value) {
  if (!value || String(value).length !== 8) return null
  return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`
}

function getEventDurationDays(start, end) {
  const diff = toDate(end) - toDate(start)
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function isFestivalNotEnded(item, referenceDate = new Date()) {
  const end = parseFestivalDate(item?.eventenddate)
  if (!end) return false
  return toDate(end) >= startOfDay(referenceDate)
}

function startsOrEndsInMonth(start, end, targetYear, targetMonth) {
  const startsThisMonth = start.year === targetYear && start.month === targetMonth
  const endsThisMonth = end.year === targetYear && end.month === targetMonth
  return startsThisMonth || endsThisMonth
}

function isEventInMonth(item, targetYear, targetMonth) {
  const start = parseFestivalDate(item?.eventstartdate)
  const end = parseFestivalDate(item?.eventenddate)

  if (!start || !end) return false

  const monthStart = new Date(targetYear, targetMonth - 1, 1)
  const monthEnd = new Date(targetYear, targetMonth, 0)
  const eventStart = toDate(start)
  const eventEnd = toDate(end)

  if (eventStart > monthEnd || eventEnd < monthStart) return false

  const durationDays = getEventDurationDays(start, end)

  if (durationDays > LONG_EVENT_DAYS) {
    return startsOrEndsInMonth(start, end, targetYear, targetMonth)
  }

  return true
}

function getEventMonthPriority(item, targetYear, targetMonth) {
  const start = parseFestivalDate(item?.eventstartdate)
  const end = parseFestivalDate(item?.eventenddate)
  if (!start || !end) return 3

  if (start.year === targetYear && start.month === targetMonth) return 0
  if (end.year === targetYear && end.month === targetMonth) return 1
  return 2
}

function isFestivalScheduleQuery(message = '') {
  const text = String(message).trim().toLowerCase()
  const asksFestival = /축제|행사|일정|언제/.test(text)
  const asksThisMonth = /이번\s*달|이번달|이달|이번\s*월/.test(text)
  const asksSeoul = /서울/.test(text)
  return asksFestival && asksThisMonth && asksSeoul
}

function summarizeFestivalItem(item) {
  const parts = [`[축제공연행사] ${item.title}`]
  const start = formatFestivalDate(item.eventstartdate)
  const end = formatFestivalDate(item.eventenddate)
  if (start || end) parts.push(`일정: ${start || '?'} ~ ${end || '?'}`)
  if (item.eventplace) parts.push(`장소: ${item.eventplace}`)
  if (item.addr1) parts.push(`주소: ${item.addr1}`)
  if (item.usetimefestival) parts.push(`요금: ${item.usetimefestival}`)
  return parts.join(' | ')
}

function getMatchingFestivals(tourItems = [], year, month, referenceDate = new Date()) {
  return (tourItems || [])
    .filter((item) => item?.dataType === '축제공연행사')
    .filter((item) => isEventInMonth(item, year, month))
    .filter((item) => isFestivalNotEnded(item, referenceDate))
    .sort((a, b) => {
      const priorityDiff =
        getEventMonthPriority(a, year, month) - getEventMonthPriority(b, year, month)
      if (priorityDiff !== 0) return priorityDiff
      return String(a?.eventstartdate || '').localeCompare(String(b?.eventstartdate || ''))
    })
    .slice(0, MAX_RESULTS)
}

export function buildFestivalContext(message = '', tourItems = []) {
  if (!isFestivalScheduleQuery(message)) {
    return null
  }

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const matchingItems = getMatchingFestivals(tourItems, year, month)

  const lines = [
    '질문 유형: festival (이번 달 서울 축제)',
    `${year}년 ${month}월 서울 축제·행사 검색 결과입니다.`,
    '아래 목록에 있는 행사만 소개하고, 목록에 없는 행사는 만들지 마세요.',
    '이미 종료된 행사는 제외했습니다. 오늘 이후 진행·예정인 행사만 안내하세요.',
    '한두 문장으로 친근하게 인사한 뒤 불릿 포인트로 일정을 안내하세요.',
  ]

  if (!matchingItems.length) {
    lines.push(`\n[검색 결과] ${year}년 ${month}월에 해당하는 서울 축제·행사 없음`)
    return lines.join('\n')
  }

  lines.push(`\n[이번 달 서울 축제·행사 ${matchingItems.length}건]`)
  lines.push(...matchingItems.map(summarizeFestivalItem))

  return lines.join('\n')
}
