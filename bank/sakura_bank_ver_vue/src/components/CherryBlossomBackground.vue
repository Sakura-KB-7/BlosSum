<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const canvasRef = ref<HTMLCanvasElement | null>(null);
let rafId = 0;
let teardown: (() => void) | null = null;

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const petals: Petal[] = [];
  for (let i = 0; i < 25; i++) {
    petals.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 8 + 4,
      speedX: Math.random() * 0.5 - 0.25,
      speedY: Math.random() * 0.5 + 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      opacity: Math.random() * 0.4 + 0.3,
    });
  }

  const drawPetal = (petal: Petal) => {
    ctx.save();
    ctx.translate(petal.x, petal.y);
    ctx.rotate(petal.rotation);
    ctx.globalAlpha = petal.opacity;
    ctx.beginPath();
    ctx.fillStyle = '#FBBAD4';
    ctx.moveTo(0, -petal.size);
    ctx.bezierCurveTo(
      petal.size * 0.5,
      -petal.size * 0.8,
      petal.size * 0.8,
      -petal.size * 0.3,
      0,
      petal.size * 0.5
    );
    ctx.bezierCurveTo(
      -petal.size * 0.8,
      -petal.size * 0.3,
      -petal.size * 0.5,
      -petal.size * 0.8,
      0,
      -petal.size
    );
    ctx.fill();
    ctx.restore();
  };

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    petals.forEach((petal) => {
      petal.x += petal.speedX + Math.sin(petal.y * 0.01) * 0.3;
      petal.y += petal.speedY;
      petal.rotation += petal.rotationSpeed;
      if (petal.y > canvas.height + 20) {
        petal.y = -20;
        petal.x = Math.random() * canvas.width;
      }
      if (petal.x > canvas.width + 20) petal.x = -20;
      if (petal.x < -20) petal.x = canvas.width + 20;
      drawPetal(petal);
    });
    rafId = requestAnimationFrame(animate);
  };
  animate();

  teardown = () => {
    window.removeEventListener('resize', resize);
    cancelAnimationFrame(rafId);
  };
});

onUnmounted(() => {
  teardown?.();
});
</script>

<template>
  <canvas ref="canvasRef" class="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
</template>
