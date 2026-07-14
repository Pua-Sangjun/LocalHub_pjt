<template>
  <section class="page-section">
    <div class="page-header">
      <div>
        <h1>LocalHub</h1>
        <p>서울/경기 공공데이터 기반 여행 정보와 익명 커뮤니티를 한 곳에서 확인하세요.</p>
      </div>
      <button class="button" @click="goBoard">게시판 바로가기</button>
    </div>

    <div class="card-grid">
      <article class="card">
        <h3>지도 시각화</h3>
        <p>관광지, 문화시설, 숙박, 축제, 쇼핑, 레포츠, 여행 코스를 지도에서 쉽게 찾아보세요.</p>
        <router-link class="button button-secondary" to="/map">지도 보기</router-link>
      </article>

      <article class="card">
        <h3>익명 게시판</h3>
        <p>로그인 없이 글을 작성하고, 수정·삭제는 비밀번호로 간단히 제어합니다.</p>
        <router-link class="button button-secondary" to="/board">게시판 보기</router-link>
      </article>

      <article class="card">
        <h3>AI 챗봇</h3>
        <p>오른쪽 하단 챗봇을 눌러 지역 추천, 명소 안내, 게시판 문의를 해결해보세요.</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
function goBoard() {
  router.push({ name: 'board-list' })
}
</script>
