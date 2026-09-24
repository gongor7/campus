<script setup lang="ts">
</script>

<template>
  <header class="site-header">
    <RouterLink to="/" class="brand">Campus ASFI · Simulador</RouterLink>
  </header>
  <main class="container">
    <RouterView />
  </main>
</template>

<style scoped>
.site-header {
  background: #0f2a4a;
  color: #fff;
  padding: 14px 24px;
}
.brand {
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 18px;
}
</style>
