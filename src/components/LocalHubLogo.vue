<template>
  <div class="localhub-logo" :class="{ light, compact }">
    <svg
      class="logo-mark"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        class="mark-pin"
        d="M20 3.5C13.65 3.5 8.5 8.65 8.5 15c0 7.25 9.1 18.2 10.9 20.45a1.2 1.2 0 0 0 1.8 0C22.9 33.2 32 22.25 32 15 32 8.65 26.35 3.5 20 3.5Z"
      />
      <circle class="mark-core" cx="20" cy="15" r="4.5" />
      <circle class="mark-node mark-node-1" cx="20" cy="8.5" r="1.6" />
      <circle class="mark-node mark-node-2" cx="14.5" cy="18" r="1.6" />
      <circle class="mark-node mark-node-3" cx="25.5" cy="18" r="1.6" />
      <path class="mark-link" d="M20 10.5v2.5M17.2 16.8l-1.5 1M22.8 16.8l1.5 1" />
    </svg>

    <div class="logo-text">
      <span class="logo-wordmark">
        <span class="logo-local">Local</span><span class="logo-hub">Hub</span>
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  light: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
})
</script>

<style scoped>
.localhub-logo {
  --lh-blue: #2b7fd4;
  --lh-blue-deep: #1a5fa0;
  --lh-coral: #ff7a45;
  --lh-coral-deep: #e85d2c;
  --lh-muted: #7a8a9a;

  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-mark {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
}

.mark-pin {
  fill: var(--lh-blue);
  transition: fill 0.35s ease;
}

.mark-core {
  fill: #fff;
}

.mark-node {
  fill: var(--lh-coral);
}

.mark-link {
  stroke: #fff;
  stroke-width: 1.4;
  stroke-linecap: round;
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  line-height: 1;
}

.logo-wordmark {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.logo-local {
  color: var(--lh-blue-deep);
  font-weight: 600;
  transition: color 0.35s ease;
}

.logo-hub {
  color: var(--lh-coral);
  font-weight: 800;
  transition: color 0.35s ease;
}

.logo-tagline {
  font-size: 0.68rem;
  font-weight: 500;
  color: var(--lh-muted);
  letter-spacing: 0.02em;
  transition: color 0.35s ease;
}

.localhub-logo.light .mark-pin {
  fill: rgba(255, 255, 255, 0.95);
}

.localhub-logo.light .mark-core {
  fill: rgba(43, 127, 212, 0.9);
}

.localhub-logo.light .mark-node {
  fill: #ffd4b8;
}

.localhub-logo.light .mark-link {
  stroke: rgba(255, 255, 255, 0.9);
}

.localhub-logo.light .logo-local,
.localhub-logo.light .logo-hub {
  color: #fff;
}

.localhub-logo.light .logo-tagline {
  color: rgba(255, 255, 255, 0.82);
}

.localhub-logo.compact .logo-tagline {
  display: none;
}

.localhub-logo.compact .logo-wordmark {
  font-size: 1.25rem;
}

.localhub-logo.compact .logo-mark {
  width: 32px;
  height: 32px;
}
</style>
