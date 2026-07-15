<template>
  <div class="share-button-wrap" :class="{ inline, compact }">
    <button
      type="button"
      class="share-btn"
      :class="buttonClass"
      :disabled="sharing"
      :aria-label="compact ? `${label} 공유` : label"
      @click.stop="handleShare"
    >
      <svg
        v-if="compact"
        class="share-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m8.59 13.51 6.83 3.98M15.42 6.51l-6.83 3.98" />
      </svg>
      <template v-else>
        <svg
          class="share-icon share-icon-inline"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.59 13.51 6.83 3.98M15.42 6.51l-6.83 3.98" />
        </svg>
        {{ sharing ? '공유 중…' : label }}
      </template>
    </button>
    <p v-if="feedback && !compact" class="share-feedback" role="status">{{ feedback }}</p>
  </div>
</template>

<script setup>
import { useShare } from '@/composables/useShare'

const props = defineProps({
  label: { type: String, default: '공유' },
  mode: {
    type: String,
    default: 'page',
    validator: (value) => ['page', 'post', 'attraction'].includes(value),
  },
  post: { type: Object, default: null },
  place: { type: Object, default: null },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  url: { type: String, default: '' },
  buttonClass: { type: String, default: 'secondary-btn' },
  inline: { type: Boolean, default: true },
  compact: { type: Boolean, default: false },
})

const { sharing, feedback, sharePost, shareAttraction, sharePage } = useShare()

function handleShare() {
  if (props.mode === 'post' && props.post) {
    sharePost(props.post)
    return
  }

  if (props.mode === 'attraction' && props.place) {
    shareAttraction(props.place)
    return
  }

  sharePage({
    title: props.title,
    description: props.description,
    url: props.url || undefined,
  })
}
</script>

<style scoped>
.share-button-wrap {
  display: grid;
  gap: 6px;
}

.share-button-wrap.inline {
  display: inline-grid;
}

.share-button-wrap.compact {
  gap: 0;
}

.share-btn {
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.share-button-wrap.compact .share-btn {
  width: 34px;
  height: 34px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  background: rgba(255, 255, 255, 0.95);
  color: #334155;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.share-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.share-icon-inline {
  width: 15px;
  height: 15px;
}

.share-button-wrap.compact .share-btn:hover {
  color: #1a5fa0;
  border-color: #8fd3ff;
  background: #fff;
}

.share-btn:disabled {
  opacity: 0.65;
  cursor: wait;
}

.share-feedback {
  margin: 0;
  font-size: 0.78rem;
  color: #1a5fa0;
  white-space: nowrap;
}
</style>
