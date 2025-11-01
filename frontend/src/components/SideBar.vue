<template>
  <div class="side-bar"></div>
</template>

<style>
.side-bar {
  width: 6.25rem;
  height: 100vh;
  background-color: var(--color-brand-primary);
  margin-left: auto;
  margin-right: 0;
  z-index: 1;
  left: 0;
  right: 0;
  position:fixed;
}
@media (max-width: 769px) {
  .side-bar {
    display: none;
  }
}
</style>
