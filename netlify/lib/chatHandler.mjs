const MAX_MESSAGE_LENGTH = 500
const MAX_HISTORY_LENGTH = 10
const MAX_CONTEXT_LENGTH = 6000

const SYSTEM_PROMPT = `당신은 LocalHub 서울 지역 여행 도우미 챗봇입니다.
제공된 [참고 데이터]를 우선 활용해 한국어로 자연스럽게 답변하세요.

답변 규칙:
- 커뮤니티 게시글 검색: [커뮤니티 게시글 검색 결과]에 있는 글 제목·내용을 바로 소개
- 권역별 관광지: 구 단위로 3~5곳 추천, 주소 포함
- 축제 일정: 시작~종료일, 장소, 요금 안내
- 맛집·음식점 질문: 데이터가 없으므로 "맛집/음식점 데이터는 제공하지 않습니다"라고만 짧게 안내. 맛집 추천·관련 축제/코스는 언급하지 마세요
- 데이터에 없으면 "현재 데이터에서 찾지 못했습니다"라고 짧게 말하고 끝
- 불필요한 후속 질문 나열, "대신 도와드릴 수 있는 사항" 같은 딱딱한 안내 문구는 쓰지 마세요
- 답변은 3~8문장, 불릿 포인트로 간결하게`

export function validateChatRequest(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, status: 400, error: '잘못된 요청 형식입니다.' }
  }

  const message = String(body.message ?? '').trim()
  if (!message) {
    return { ok: false, status: 400, error: '메시지를 입력해 주세요.' }
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, status: 400, error: `메시지는 ${MAX_MESSAGE_LENGTH}자 이하로 입력해 주세요.` }
  }

  const history = Array.isArray(body.history) ? body.history : []
  if (history.length > MAX_HISTORY_LENGTH) {
    return { ok: false, status: 400, error: '대화 기록이 너무 깁니다. 새 대화를 시작해 주세요.' }
  }

  const context = String(body.context ?? '').slice(0, MAX_CONTEXT_LENGTH)

  const sanitizedHistory = history
    .filter((item) => item && (item.role === 'user' || item.role === 'assistant'))
    .map((item) => ({
      role: item.role,
      content: String(item.content ?? '').slice(0, MAX_MESSAGE_LENGTH),
    }))

  return { ok: true, message, history: sanitizedHistory, context }
}

export function buildOpenAIMessages({ message, history, context }) {
  const systemContent = context
    ? `${SYSTEM_PROMPT}\n\n[참고 데이터]\n${context}`
    : SYSTEM_PROMPT

  return [
    { role: 'system', content: systemContent },
    ...history,
    { role: 'user', content: message },
  ]
}

export async function requestOpenAI(messages, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      reasoning_effort: process.env.OPENAI_REASONING_EFFORT || 'minimal',
      messages,
      max_completion_tokens: 1200,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    const detail = errorBody?.error?.message || response.statusText
    throw new Error(detail)
  }

  const data = await response.json()
  const choice = data.choices?.[0]
  const content = choice?.message?.content?.trim()

  if (content) return content

  if (choice?.finish_reason === 'length') {
    throw new Error('응답 길이 제한에 도달했습니다. 질문을 더 짧게 해 주세요.')
  }

  return '죄송합니다. 답변을 생성할 수 없습니다.'
}

export async function handleChatRequest(body, apiKey) {
  if (!apiKey) {
    return { status: 500, body: { error: '서버 API 키가 설정되지 않았습니다.' } }
  }

  const validated = validateChatRequest(body)
  if (!validated.ok) {
    return { status: validated.status, body: { error: validated.error } }
  }

  try {
    const messages = buildOpenAIMessages(validated)
    const reply = await requestOpenAI(messages, apiKey)
    return { status: 200, body: { reply } }
  } catch (error) {
    return {
      status: 502,
      body: { error: error?.message || 'AI 응답 생성에 실패했습니다.' },
    }
  }
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}