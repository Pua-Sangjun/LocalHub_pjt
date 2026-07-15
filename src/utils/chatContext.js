const SEOUL_DISTRICTS = [
    '종로', '중구', '용산', '성동', '광진', '동대문', '중랑', '성북', '강북', '도봉',
    '노원', '은평', '서대문', '마포', '양천', '강서', '구로', '금천', '영등포', '동작',
    '관악', '서초', '강남', '송파', '강동',
  ]
  
  const QUERY_HINTS = {
    festival: ['축제', '공연', '행사', '페스티벌', '일정', '언제'],
    course: ['여행코스', '코스', '동선', '루트'],
    board: ['게시글', '글', '피드', '커뮤니티', '후기', '리뷰', '공유'],
    sports: ['레포츠', '스포츠', '체험', '액티비티'],
    culture: ['문화', '박물관', '미술관', '전시'],
    shopping: ['쇼핑', '마켓', '시장', '면세'],
    stay: ['숙박', '호텔', '게스트하우스', '머물'],
  }
  
  const UNSUPPORTED_FOOD_PATTERN = /맛집|음식점|식당|먹거리|모범음식점|레스토랑/
  
  function extractKeywords(text) {
    const keywords = new Set()
  
    for (const district of SEOUL_DISTRICTS) {
      if (text.includes(district)) keywords.add(district)
    }
  
    for (const words of Object.values(QUERY_HINTS)) {
      for (const word of words) {
        if (text.includes(word)) keywords.add(word)
      }
    }
  
    String(text)
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((word) => word.length >= 2)
      .forEach((word) => keywords.add(word))
  
    return Array.from(keywords)
  }
  
  function detectDistricts(text) {
    return SEOUL_DISTRICTS.filter((district) => text.includes(district))
  }
  
  function detectIntent(text) {
    const intents = []
    for (const [intent, keywords] of Object.entries(QUERY_HINTS)) {
      if (keywords.some((kw) => text.includes(kw))) intents.push(intent)
    }
    return intents
  }
  
  function formatFestivalDate(value) {
    if (!value || value.length !== 8) return null
    return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`
  }
  
  function matchesDistrict(item, districts) {
    if (!districts.length) return false
    const addr = item.addr1 || ''
    return districts.some((district) => addr.includes(`${district}구`) || addr.includes(district))
  }
  
  function scoreTourItem(item, keywords, districts, intents) {
    let score = 0
    const haystack = `${item.title} ${item.addr1} ${item.dataType} ${item.eventplace || ''} ${item.program || ''}`.toLowerCase()
  
    for (const keyword of keywords) {
      if (haystack.includes(keyword.toLowerCase())) score += 2
    }
  
    if (matchesDistrict(item, districts)) score += 5
  
    if (intents.includes('festival') && item.dataType === '축제공연행사') score += 4
    if (intents.includes('course') && item.dataType === '여행코스') score += 4
    if (intents.includes('sports') && item.dataType === '레포츠') score += 4
    if (intents.includes('culture') && item.dataType === '문화시설') score += 4
    if (intents.includes('shopping') && item.dataType === '쇼핑') score += 4
    if (intents.includes('stay') && item.dataType === '숙박') score += 4
  
    if (!intents.length && item.dataType === '관광지') score += 1
  
    return score
  }
  
  function summarizeTourItem(item) {
    const parts = [`[${item.dataType}] ${item.title}`]
    if (item.addr1) parts.push(`주소: ${item.addr1}`)
    if (item.tel) parts.push(`연락처: ${item.tel}`)
  
    if (item.dataType === '축제공연행사') {
      const start = formatFestivalDate(item.eventstartdate)
      const end = formatFestivalDate(item.eventenddate)
      if (start || end) parts.push(`일정: ${start || '?'} ~ ${end || '?'}`)
      if (item.eventplace) parts.push(`장소: ${item.eventplace}`)
      if (item.usetimefestival) parts.push(`요금: ${item.usetimefestival}`)
    }
  
    return parts.join(' | ')
  }
  
  function scorePost(post, keywords, districts, intents) {
    let score = 0
    const haystack = `${post.title} ${post.body}`.toLowerCase()
  
    for (const keyword of keywords) {
      if (haystack.includes(keyword.toLowerCase())) score += 4
    }
  
    for (const district of districts) {
      if (haystack.includes(district)) score += 5
    }
  
    if (intents.includes('board')) score += 2
  
    return score
  }
  
  function summarizePost(post) {
    const preview = post.body?.slice(0, 120) || ''
    return `[게시글] ${post.title} (작성: ${post.author}) — ${preview}${preview.length >= 120 ? '...' : ''}`
  }
  
  export function buildChatContext(message, tourItems = [], posts = []) {
    const text = message.trim()
    const keywords = extractKeywords(text)
    const districts = detectDistricts(text)
    const intents = detectIntent(text)
  
    const rankedTours = tourItems
      .map((item) => ({ item, score: scoreTourItem(item, keywords, districts, intents) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ item }) => summarizeTourItem(item))
  
    const rankedPosts = posts
      .map((post) => ({ post, score: scorePost(post, keywords, districts, intents) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ post }) => summarizePost(post))
  
    const summaryParts = []
  
    if (districts.length) {
      summaryParts.push(`질문 권역: ${districts.map((d) => `${d}구`).join(', ')}`)
    }
    if (intents.length) {
      summaryParts.push(`질문 유형: ${intents.join(', ')}`)
    }
  
    summaryParts.push(`전체 관광 데이터: ${tourItems.length}건, 커뮤니티 게시글: ${posts.length}건`)
  
    if (UNSUPPORTED_FOOD_PATTERN.test(text)) {
      summaryParts.push('\n[안내] 맛집/음식점 JSON 데이터는 제공되지 않습니다. 맛집 추천·검색은 답변하지 마세요.')
    }
  
    if (rankedPosts.length) {
      summaryParts.push('\n[커뮤니티 게시글 검색 결과]')
      summaryParts.push(...rankedPosts)
    } else if (intents.includes('board')) {
      summaryParts.push('\n[커뮤니티 게시글 검색 결과] 일치하는 게시글 없음')
    }
  
    if (rankedTours.length) {
      summaryParts.push('\n[관광/축제/코스 데이터 검색 결과]')
      summaryParts.push(...rankedTours)
    }
  
    if (!rankedTours.length && !rankedPosts.length && districts.length) {
      const districtFallback = tourItems
        .filter((item) => matchesDistrict(item, districts))
        .slice(0, 6)
        .map(summarizeTourItem)
  
      if (districtFallback.length) {
        summaryParts.push(`\n[${districts.map((d) => `${d}구`).join(', ')} 관련 데이터]`)
        summaryParts.push(...districtFallback)
      }
    }
  
    return summaryParts.join('\n')
  }
  
  export const SUGGESTED_QUESTIONS = [
    '종로구 관광지 추천해줘',
    '이번 달 서울 축제 일정 알려줘',
    '강남구 관광지 추천해줘',
    '한강 근처 레포츠 추천해줘',
  ]