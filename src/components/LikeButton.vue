<template>
  <button
    type="button"
    class="like-btn"
    :class="{ liked: isLiked, popping, compact }"
    :aria-pressed="isLiked"
    :aria-label="isLiked ? `좋아요 취소 (${count})` : `좋아요 (${count})`"
    @click="handleClick"
  >
    <span class="like-heart-wrap" aria-hidden="true">
      <span v-if="popping" class="like-burst"></span>
      <svg class="like-heart" viewBox="0 0 24 24" fill="none">
        <path
          class="like-heart-outline"
          d="M12 20.8s-6.9-4.4-9.2-8.4C1.1 9.2 2.6 5.4 6.1 4.6c2-.4 3.8.4 5 2 1.2-1.6 3-2.4 5-2 3.5.8 5 4.6 3.3 7.8-2.3 4-9.2 8.4-9.2 8.4z"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linejoin="round"
        />
        <path
          class="like-heart-fill"
          d="M12 20.8s-6.9-4.4-9.2-8.4C1.1 9.2 2.6 5.4 6.1 4.6c2-.4 3.8.4 5 2 1.2-1.6 3-2.4 5-2 3.5.8 5 4.6 3.3 7.8-2.3 4-9.2 8.4-9.2 8.4z"
        />
      </svg>
    </span>
    <span class="like-count">{{ count }}</span>
  </button>
</template>

<script setup>
import { computed, ref } from 'vue'
import { isPostLiked, toggleLike } from '@/stores/posts'

const props = defineProps({
  postId: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const popping = ref(false)
const likedRevision = ref(0)

const isLiked = computed(() => {
  likedRevision.value
  return isPostLiked(props.postId)
})

let popTimer = null

function handleClick(event) {
  event.stopPropagation()
  event.preventDefault()
  toggleLike(props.postId)
  likedRevision.value += 1
  popping.value = false
  window.clearTimeout(popTimer)
  requestAnimationFrame(() => {
    popping.value = true
    popTimer = window.setTimeout(() => {
      popping.value = false
    }, 520)
  })
}
</script>

<style scoped>
.like-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.88rem;
  font-weight: 700;
  font-family: inherit;
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.like-btn.compact {
  padding: 4px 8px;
  font-size: 0.8rem;
  font-weight: 600;
  gap: 4px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #94a3b8;
}

.like-btn:hover {
  border-color: #fecdd3;
  background: #fff5f5;
  color: #e11d48;
}

.like-btn.compact:hover {
  background: #fff1f2;
  color: #e11d48;
}

.like-heart-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
}

.like-btn.compact .like-heart-wrap {
  width: 14px;
  height: 14px;
}

.like-heart {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.like-btn.compact .like-heart {
  transform: translateY(-0.5px);
}

.like-heart-fill {
  fill: transparent;
  opacity: 0;
  transform-origin: center;
  transition: fill 0.2s ease, opacity 0.2s ease, transform 0.2s ease;
}

.like-heart-outline {
  transition: stroke 0.2s ease;
}

.like-btn.liked {
  border-color: #fecaca;
  background: #fff1f2;
  color: #e11d48;
}

.like-btn.compact.liked {
  border: none;
  background: transparent;
  color: #e11d48;
}

.like-btn.compact.liked:hover {
  background: #fff1f2;
}

.like-btn.liked .like-heart-outline {
  stroke: #ef4444;
}

.like-btn.liked .like-heart-fill {
  fill: #ef4444;
  opacity: 1;
}

.like-burst {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 113, 133, 0.55) 0%, rgba(251, 113, 133, 0) 72%);
  opacity: 0;
  pointer-events: none;
}

.like-btn.popping .like-heart {
  animation: heart-pop 0.52s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.like-btn.popping .like-burst {
  animation: heart-burst 0.52s ease-out;
}

.like-btn.popping.liked .like-heart-fill {
  animation: heart-fill-glow 0.52s ease;
}

.like-count {
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

@keyframes heart-pop {
  0% {
    transform: scale(1) rotate(0deg);
  }
  30% {
    transform: scale(1.42) rotate(-8deg);
  }
  55% {
    transform: scale(0.9) rotate(4deg);
  }
  75% {
    transform: scale(1.18) rotate(-3deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

@keyframes heart-burst {
  0% {
    opacity: 0.9;
    transform: scale(0.35);
  }
  100% {
    opacity: 0;
    transform: scale(1.8);
  }
}

@keyframes heart-fill-glow {
  0% {
    filter: drop-shadow(0 0 0 rgba(239, 68, 68, 0));
  }
  40% {
    filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.75));
  }
  100% {
    filter: drop-shadow(0 0 0 rgba(239, 68, 68, 0));
  }
}
</style>
