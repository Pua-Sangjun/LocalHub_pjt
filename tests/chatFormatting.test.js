import test from 'node:test'
import assert from 'node:assert/strict'
import { formatChatMessageBlocks } from '../src/utils/chatFormatting.js'

test('formats headings, bullets, and bold text', () => {
  const result = formatChatMessageBlocks('**추천 장소**\n- 경복궁\n- 창덕궁\n서울의 경복궁과 창덕궁을 추천해요\n한강야시장 축제도 좋아요')

  assert.equal(result[0].type, 'heading')
  assert.equal(result[0].text, '추천 장소')
  assert.equal(result[1].type, 'bullet')
  assert.equal(result[1].text, '경복궁')
  assert.equal(result[2].type, 'bullet')
  assert.equal(result[2].text, '창덕궁')
  assert.equal(result[3].type, 'paragraph')
  assert.deepEqual(result[3].segments, [
    { text: '서울의 ', bold: false },
    { text: '경복궁', bold: true },
    { text: '과 ', bold: false },
    { text: '창덕궁', bold: true },
    { text: '을 추천해요', bold: false },
  ])
  assert.deepEqual(result[4].segments, [
    { text: '한강야시장', bold: true },
    { text: ' 축제도 좋아요', bold: false },
  ])
})
