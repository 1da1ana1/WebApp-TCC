<template>
  <div class="side-bar"></div>
</template>

<style>
.side-bar {
  width: 6.25rem;
  background-color: var(--color-brand-primary);
  height: calc(100vh - var(--header-height));
  position: sticky; 
  top: var(--header-height);
}
@media (max-width: 769px) {
  .side-bar {
    display: none;
  }
}
</style>
