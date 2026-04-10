<script setup>
/**
 * 마우스 추적 꽃잎 + 클릭 시 방사형 버스트 (원본: cherry_blossom_effect CherryBlossomEffect.tsx)
 * — Vue / Canvas 2D, pointer-events-none
 */
import { onMounted, onUnmounted, ref } from 'vue';

const canvasRef = ref(null);

let teardown = null;

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const particles = [];
  const mouse = { x: 0, y: 0 };
  let animationFrameId = 0;
  let mouseMovementTimeout = 0;
  let isMouseMoving = false;

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resizeCanvas();

  const handleMouseMove = (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    isMouseMoving = true;
    if (mouseMovementTimeout) window.clearTimeout(mouseMovementTimeout);
    mouseMovementTimeout = window.setTimeout(() => {
      isMouseMoving = false;
    }, 100);
  };

  const handleMouseClick = (e) => {
    const clickX = e.clientX;
    const clickY = e.clientY;
    const burstCount = 30 + Math.random() * 20;
    for (let i = 0; i < burstCount; i++) {
      const angle = (i / burstCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const speed = 3 + Math.random() * 4;
      particles.push({
        x: clickX,
        y: clickY,
        startX: clickX,
        startY: clickY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        opacity: 0.85,
        size: 6 + Math.random() * 8,
        life: 0,
        maxLife: 9,
        waveOffset: Math.random() * Math.PI * 2,
        waveAmplitude: 8 + Math.random() * 6,
        waveFrequency: 0.02 + Math.random() * 0.04,
        lastSwingDirection: 0,
        isFirework: true,
        gravity: 0.2 + Math.random() * 0.1,
      });
    }
  };

  const createParticles = () => {
    if (!isMouseMoving) return;
    const particleCount = 3;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 8;
      const offsetX = Math.cos(angle) * radius;
      const offsetY = Math.sin(angle) * radius;
      particles.push({
        x: mouse.x + offsetX,
        y: mouse.y + offsetY,
        startX: mouse.x + offsetX,
        startY: mouse.y + offsetY,
        vx: 0,
        vy: 0.3 + Math.random() * 0.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        opacity: 0.6 + Math.random() * 0.2,
        size: 6 + Math.random() * 5,
        life: 0,
        maxLife: 120 + Math.random() * 60,
        waveOffset: Math.random() * Math.PI * 2,
        waveAmplitude: 12 + Math.random() * 8,
        waveFrequency: 0.02 + Math.random() * 0.04,
        lastSwingDirection: 0,
        isFirework: false,
        gravity: 0,
      });
    }
  };

  const drawPetal = (x, y, size, rotation, opacity, isFirework = false) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    let petalColor = '#FBBAD4';
    if (isFirework) petalColor = '#F5A0C8';
    else petalColor = '#F8ADCE';
    ctx.fillStyle = petalColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.6, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.6);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(232, 180, 200, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();
  };

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      particle.life++;
      const lifeRatio = particle.life / particle.maxLife;

      if (particle.isFirework) {
        particle.vy += particle.gravity;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98;
      } else {
        particle.waveOffset += particle.waveFrequency;
        const currentSwing = Math.sin(particle.waveOffset);
        const currentSwingDirection = currentSwing > 0 ? 1 : -1;
        if (
          particle.lastSwingDirection !== 0 &&
          particle.lastSwingDirection !== currentSwingDirection
        ) {
          particle.waveFrequency = 0.02 + Math.random() * 0.04;
        }
        particle.lastSwingDirection = currentSwingDirection;
        const horizontalSwing = Math.sin(particle.waveOffset) * particle.waveAmplitude;
        particle.x = particle.startX + horizontalSwing;
        particle.y += particle.vy;
      }

      particle.rotation += particle.rotationSpeed;
      particle.opacity = Math.sin(lifeRatio * Math.PI) * 0.8;

      drawPetal(
        particle.x,
        particle.y,
        particle.size,
        particle.rotation,
        particle.opacity,
        particle.isFirework
      );

      if (particle.life >= particle.maxLife) {
        particles.splice(i, 1);
      }
    }
    animationFrameId = requestAnimationFrame(animate);
  };

  const particleInterval = window.setInterval(createParticles, 50);
  animate();

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('click', handleMouseClick);
  window.addEventListener('resize', resizeCanvas);

  teardown = () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('click', handleMouseClick);
    window.removeEventListener('resize', resizeCanvas);
    window.clearInterval(particleInterval);
    if (mouseMovementTimeout) window.clearTimeout(mouseMovementTimeout);
    cancelAnimationFrame(animationFrameId);
  };
});

onUnmounted(() => {
  teardown?.();
});
</script>

<template>
  <canvas
    ref="canvasRef"
    class="pointer-events-none fixed inset-0 z-[11] bg-transparent"
    aria-hidden="true"
  />
</template>
