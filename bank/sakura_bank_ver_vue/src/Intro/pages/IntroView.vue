<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import gsap from 'gsap';
import CherryBlossomBackground from '@/components/CherryBlossomBackground.vue';
import PetalSVG from '@/assets/gemini-svg.svg';

const router = useRouter();
const walletStage = ref(null);
const walletLeft = ref(null);
const walletRight = ref(null);
const treeSection = ref(null);
const introContainer = ref(null);
const textTitle = ref(null);

onMounted(() => {
  gsap.set(walletStage.value, { rotateX: 0, y: 50, perspective: 2000 });
  gsap.set('.falling-petal', { opacity: 0, force3D: true });
});

const startApp = () => {
  const tl = gsap.timeline({
    onComplete: () => router.push('/dashboard'),
  });

  // 1. 지갑 시퀀스 (지갑이 누울 때 위치를 살짝 더 내려 여백 확보)
  tl.to(walletStage.value, {
    rotateX: 75,
    y: 200, // 기존 180 -> 200으로 내려 상단 공간 확보
    duration: 1.2,
    ease: 'power2.inOut',
  })
    .to(
      [walletLeft.value, walletRight.value],
      {
        rotateY: (i) => (i === 0 ? -155 : 155),
        duration: 1.5,
        ease: 'power4.inOut',
      },
      '-=1.0',
    )

    // 2. 벚나무 팝업 (크기 키우고 위치 최적화)
    .to(
      treeSection.value,
      {
        display: 'flex',
        z: 50,
        y: -260, // 로고와 안 겹치도록 높이 고정
        rotateX: -75,
        scale: 1.25, // 기존 1.1 -> 1.25로 크기 상향
        opacity: 1,
        duration: 1.5,
        ease: 'back.out(1.2)',
      },
      '-=0.8',
    )

    // 3. 성장 애니메이션
    .from(
      '.tree-trunk path',
      {
        strokeDasharray: 1000,
        strokeDashoffset: 1000,
        duration: 1.2,
      },
      '-=1.2',
    )
    .from(
      '.bloom-unit',
      {
        scale: 0,
        opacity: 0,
        stagger: 0.05,
        duration: 0.8,
      },
      '-=1.0',
    )

    // 4. 꽃잎 애니메이션
    .to(
      '.falling-petal',
      {
        opacity: 1,
        x: () => (Math.random() - 0.5) * 1500,
        y: () => (Math.random() - 1.2) * 1000,
        rotate: () => Math.random() * 720,
        scale: () => Math.random() * 1.5 + 0.5,
        duration: 4,
        stagger: 0.01,
        ease: 'power1.out',
      },
      '-=1.0',
    )

    // 5. 타이틀 등장 (나무보다 훨씬 위쪽에서 나타나도록 y값 조정)
    .to(
      textTitle.value,
      {
        opacity: 1,
        y: -460, // 나무 끝부분과 간섭 없도록 위로 더 올림
        duration: 1.2,
        ease: 'power2.out',
      },
      '-=2.8',
    )
    .to(
      introContainer.value,
      {
        filter: 'brightness(1.8) blur(30px)',
        opacity: 0,
        duration: 1.5,
      },
      '-=0.5',
    );
};
</script>

<template>
  <div ref="introContainer" class="intro-container">
    <CherryBlossomBackground />

    <div class="scene-3d">
      <div ref="walletStage" class="wallet-stage" @click="startApp">
        <div ref="treeSection" class="tree-section">
          <svg viewBox="0 0 800 600" class="detailed-tree-svg">
            <g class="tree-trunk" fill="none">
              <path
                d="M400 550C400 550 380 450 400 350C420 250 480 150 480 150"
                stroke="#5D4037"
                stroke-width="12"
                stroke-linecap="round"
              />
              <path
                d="M400 400C400 400 350 320 300 300"
                stroke="#5D4037"
                stroke-width="8"
                stroke-linecap="round"
              />
              <path
                d="M410 330C410 330 460 280 520 270"
                stroke="#5D4037"
                stroke-width="6"
                stroke-linecap="round"
              />
            </g>
            <g class="tree-blooms">
              <circle
                class="bloom-unit"
                cx="400"
                cy="220"
                r="100"
                fill="#FFF1F2"
                opacity="0.9"
              />
              <circle
                class="bloom-unit"
                cx="320"
                cy="300"
                r="70"
                fill="#FFD1DC"
                opacity="0.8"
              />
              <circle
                class="bloom-unit"
                cx="480"
                cy="240"
                r="85"
                fill="#FBCFE8"
                opacity="0.8"
              />
              <circle
                class="bloom-unit"
                cx="380"
                cy="150"
                r="60"
                fill="#FFFFFF"
                opacity="0.9"
              />
              <circle
                class="bloom-unit"
                cx="530"
                cy="200"
                r="55"
                fill="#FFD1DC"
                opacity="0.8"
              />
            </g>
          </svg>
          <div class="petal-fountain">
            <img
              v-for="n in 50"
              :key="n"
              :src="PetalSVG"
              class="falling-petal"
            />
          </div>
        </div>

        <div ref="walletLeft" class="wallet-half left">
          <div class="glass-shine"></div>
          <div class="stitch-line"></div>
        </div>
        <div ref="walletRight" class="wallet-half right">
          <div class="glass-shine"></div>
          <div class="stitch-line"></div>
          <div class="wallet-clasp">
            <div class="clasp-pearl">🌸</div>
          </div>
        </div>
      </div>

      <div class="instruction">
        <h1 ref="textTitle">MoneyBlosSum</h1>
      </div>
    </div>
  </div>
</template>

<style scoped>
.intro-container {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    circle at center,
    #ffffff 0%,
    #fff1f2 40%,
    #ffd1dc 100%
  );
  overflow: hidden;
  perspective: 2500px;
}

.scene-3d {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform-style: preserve-3d;
}

.wallet-stage {
  position: relative;
  width: 440px;
  height: 300px;
  display: flex;
  transform-style: preserve-3d;
  cursor: pointer;
  z-index: 5;
}

.wallet-half {
  position: relative;
  width: 50%;
  height: 100%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(25px);
  border: 2px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 40px 100px -20px rgba(255, 182, 193, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
}

.wallet-half.left {
  border-radius: 20px 0 0 20px;
  transform-origin: left center;
}
.wallet-half.right {
  border-radius: 0 20px 20px 0;
  transform-origin: right center;
  border-left: none;
}

.stitch-line {
  position: absolute;
  inset: 15px;
  border: 1.5px dashed rgba(255, 255, 255, 0.3);
  border-radius: 15px;
}

.wallet-clasp {
  position: absolute;
  left: -30px;
  top: 50%;
  transform: translateY(-50%) translateZ(10px);
  width: 60px;
  height: 60px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(244, 114, 182, 0.5);
  z-index: 10;
}

.clasp-pearl {
  font-size: 32px;
}

.tree-section {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: none;
  width: 550px; /* 트리 가로폭 확보 */
  transform-style: preserve-3d;
  pointer-events: none;
}

.detailed-tree-svg {
  width: 100%;
  filter: drop-shadow(0 0 30px rgba(244, 114, 182, 0.4));
}

.falling-petal {
  position: absolute;
  width: 20px;
  will-change: transform, opacity;
}

/* 텍스트 레이아웃: 여백 확보 */
.instruction {
  margin-top: 120px; /* 하단 마진을 주어 나무 팝업 시 로고가 밀려 올라가는 느낌 방지 */
  text-align: center;
  z-index: 20;
}

.instruction h1 {
  font-size: 60px;
  font-weight: 900;
  opacity: 0;
  background: linear-gradient(to right, #fb7185, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.glass-shine {
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shine 8s infinite;
}
@keyframes shine {
  0% {
    transform: rotate(30deg) translate(-50%, -50%);
  }
  100% {
    transform: rotate(30deg) translate(50%, 50%);
  }
}
</style>
