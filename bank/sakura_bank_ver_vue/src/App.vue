<script setup>
import { RouterView } from 'vue-router';
import GlobalLoadingOverlay from '@/loading/components/GlobalLoadingOverlay.vue';
</script>

<template>
  <RouterView />
  <GlobalLoadingOverlay />
</template>
