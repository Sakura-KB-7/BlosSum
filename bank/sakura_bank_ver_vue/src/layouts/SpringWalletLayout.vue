<script setup>
import { RouterView } from 'vue-router';
import CherryBlossomBackground from '@/components/CherryBlossomBackground.vue';
import AppSidebar from '@/components/AppSidebar.vue';

/**
 * SpringWalletLayout
 * 지갑 내부의 전체 틀을 정의하는 레이아웃 컴포넌트입니다.
 * 배경(벚꽃), 왼쪽 사이드바, 그리고 실제 콘텐츠 영역(RouterView)으로 구성됩니다.
 */
</script>

<template>
  <div class="relative flex min-h-screen bg-background">
    <CherryBlossomBackground />

    <AppSidebar />

    <main class="relative z-10 flex-1 overflow-auto p-6">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* 레이아웃 전체에 공통으로 적용할 스타일이 있다면 여기에 작성합니다. */
.bg-background {
  /* 기본 배경색 설정 (Tailwind CSS를 사용하지 않는 경우 참조) */
  background-color: #fffafb; /* 벚꽃 테마에 어울리는 연한 핑크 화이트 */
}

main {
  /* 부드러운 스크롤 효과 */
  scroll-behavior: smooth;
}
</style>
