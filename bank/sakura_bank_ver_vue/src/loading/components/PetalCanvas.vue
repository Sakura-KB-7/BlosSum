<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    required: true,
  },
  width: {
    type: Number,
    default: 260,
  },
  height: {
    type: Number,
    default: 260,
  },
});

const canvasRef = ref(null);
let ctx = null;
let animationId = 0;
let particles = [];

function drawPetal(petal) {
  ctx.save();
  ctx.translate(petal.x, petal.y);
  ctx.rotate(petal.rotation || 0);
  ctx.globalAlpha = petal.opacity ?? 1;
  ctx.beginPath();
  ctx.fillStyle = '#f6a7c1';
  ctx.moveTo(0, -petal.size);
  ctx.bezierCurveTo(
    petal.size * 0.5,
    -petal.size * 0.8,
    petal.size * 0.85,
    -petal.size * 0.3,
    0,
    petal.size * 0.55
  );
  ctx.bezierCurveTo(
    -petal.size * 0.85,
    -petal.size * 0.3,
    -petal.size * 0.5,
    -petal.size * 0.8,
    0,
    -petal.size
  );
  ctx.fill();
  ctx.restore();
}

function makeParticle(base = {}) {
  return {
    x: 0,
    y: 0,
    size: 4 + Math.random() * 3,
    opacity: 0.5 + Math.random() * 0.5,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.12,
    ...base,
  };
}

function resetParticles() {
  const w = props.width;
  const h = props.height;
  particles = [];
  const count = 44;

  for (let i = 0; i < count; i += 1) {
    const t = i / count;
    if (props.variant === 'swirl') {
      particles.push(
        makeParticle({
          angle: t * Math.PI * 2,
          radius: 36 + Math.random() * 56,
          speed: 0.02 + Math.random() * 0.015,
          phase: Math.random() * Math.PI * 2,
        })
      );
      continue;
    }
    if (props.variant === 'falling') {
      particles.push(
        makeParticle({
          x: Math.random() * w,
          y: -Math.random() * h,
          speedY: 0.8 + Math.random() * 1.4,
          speedX: (Math.random() - 0.5) * 0.5,
          wobble: Math.random() * 0.03,
          phase: Math.random() * Math.PI * 2,
        })
      );
      continue;
    }
    if (props.variant === 'pulse') {
      particles.push(
        makeParticle({
          angle: t * Math.PI * 2,
          radius: 30 + Math.random() * 65,
          pulse: 0.035 + Math.random() * 0.02,
          phase: Math.random() * Math.PI * 2,
        })
      );
      continue;
    }
    if (props.variant === 'rising') {
      particles.push(
        makeParticle({
          x: Math.random() * w,
          y: h + Math.random() * h * 0.4,
          speedY: 0.8 + Math.random() * 1.3,
          speedX: (Math.random() - 0.5) * 0.45,
          wobble: Math.random() * 0.03,
          phase: Math.random() * Math.PI * 2,
        })
      );
      continue;
    }
    if (props.variant === 'orbit') {
      particles.push(
        makeParticle({
          angle: t * Math.PI * 2,
          radius: 44 + Math.random() * 48,
          speed: 0.022 + Math.random() * 0.015,
        })
      );
      continue;
    }
    if (props.variant === 'scatter') {
      particles.push(
        makeParticle({
          angle: Math.random() * Math.PI * 2,
          maxDistance: 30 + Math.random() * 90,
          phase: Math.random() * Math.PI * 2,
          speed: 0.028 + Math.random() * 0.02,
        })
      );
      continue;
    }
    if (props.variant === 'wave') {
      particles.push(
        makeParticle({
          x: t * w,
          baseY: h / 2,
          amplitude: 20 + Math.random() * 36,
          phase: t * Math.PI * 2,
          speed: 0.038 + Math.random() * 0.02,
        })
      );
      continue;
    }
    if (props.variant === 'spiral') {
      particles.push(
        makeParticle({ angle: t * Math.PI * 2, spiral: 0, speed: 0.032 + Math.random() * 0.018 })
      );
      continue;
    }
    particles.push(
      makeParticle({
        angle: t * Math.PI * 2,
        minR: 16,
        maxR: 88,
        phase: Math.random() * Math.PI * 2,
        speed: 0.03 + Math.random() * 0.02,
      })
    );
  }
}

function drawFrame() {
  if (!ctx) return;
  const w = props.width;
  const h = props.height;
  const cx = w / 2;
  const cy = h / 2;
  ctx.clearRect(0, 0, w, h);

  for (const p of particles) {
    p.rotation += p.rotationSpeed;
    if (props.variant === 'swirl') {
      p.angle += p.speed;
      p.phase += 0.04;
      p.x = cx + Math.cos(p.angle) * (p.radius + Math.sin(p.phase) * 7);
      p.y = cy + Math.sin(p.angle) * (p.radius + Math.sin(p.phase) * 7);
    } else if (props.variant === 'falling') {
      p.phase += p.wobble;
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.phase) * 0.35;
      if (p.y > h + 15) {
        p.y = -18;
        p.x = Math.random() * w;
      }
    } else if (props.variant === 'pulse') {
      p.phase += p.pulse;
      const r = p.radius + Math.sin(p.phase) * 22;
      p.x = cx + Math.cos(p.angle) * r;
      p.y = cy + Math.sin(p.angle) * r;
      p.opacity = 0.45 + Math.abs(Math.sin(p.phase)) * 0.55;
    } else if (props.variant === 'rising') {
      p.phase += p.wobble;
      p.y -= p.speedY;
      p.x += p.speedX + Math.sin(p.phase) * 0.35;
      if (p.y < -15) {
        p.y = h + 20;
        p.x = Math.random() * w;
      }
    } else if (props.variant === 'orbit') {
      p.angle += p.speed;
      p.x = cx + Math.cos(p.angle) * p.radius;
      p.y = cy + Math.sin(p.angle) * p.radius;
    } else if (props.variant === 'scatter') {
      p.phase += p.speed;
      const dist = ((Math.sin(p.phase) + 1) / 2) * p.maxDistance;
      p.x = cx + Math.cos(p.angle) * dist;
      p.y = cy + Math.sin(p.angle) * dist;
    } else if (props.variant === 'wave') {
      p.phase += p.speed;
      p.y = p.baseY + Math.sin(p.phase) * p.amplitude;
    } else if (props.variant === 'spiral') {
      p.angle += p.speed;
      p.spiral = (p.spiral + 0.015) % 1;
      const r = 18 + p.spiral * 78;
      p.x = cx + Math.cos(p.angle) * r;
      p.y = cy + Math.sin(p.angle) * r;
    } else {
      p.phase += p.speed;
      const bloom = (Math.sin(p.phase) + 1) / 2;
      const r = p.minR + (p.maxR - p.minR) * bloom;
      p.x = cx + Math.cos(p.angle) * r;
      p.y = cy + Math.sin(p.angle) * r;
      p.opacity = 0.4 + bloom * 0.6;
    }
    drawPetal(p);
  }

  animationId = requestAnimationFrame(drawFrame);
}

function start() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  canvas.width = props.width;
  canvas.height = props.height;
  ctx = canvas.getContext('2d');
  if (!ctx) return;
  resetParticles();
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(drawFrame);
}

onMounted(start);

watch(
  () => props.variant,
  () => start()
);

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId);
});
</script>

<template>
  <canvas ref="canvasRef" class="block h-full w-full" />
</template>
