<template>
  <div class="skeleton-request-item">
    <div class="skeleton-info">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-details">
        <div class="skeleton-name"></div>
        <div class="skeleton-ra"></div>
      </div>
    </div>

    <div class="skeleton-actions">
      <div class="skeleton-btn"></div>
      <div class="skeleton-btn"></div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.skeleton-request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #dcdcdc;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #a0a0a0;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.skeleton-avatar {
  width: 50px;
  height: 50px;
  background-color: #b0b0b0;
  border-radius: 50%;
}

.skeleton-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-name {
  width: 200px;
  height: 18px;
  background-color: #b0b0b0;
  border-radius: 4px;
}

.skeleton-ra {
  width: 120px;
  height: 14px;
  background-color: #b0b0b0;
  border-radius: 4px;
}

.skeleton-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-left: 2rem;
  border-left: 2px solid #a0a0a0;
  height: 40px;
}

.skeleton-btn {
  width: 100px;
  height: 36px;
  background-color: #b0b0b0;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .skeleton-request-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .skeleton-actions {
    border-left: none;
    padding-left: 0;
    width: 100%;
    gap: 1rem;
  }

  .skeleton-btn {
    flex: 1;
  }
}
</style>
