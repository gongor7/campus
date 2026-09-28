<script setup lang="ts">
</script>

<template>
  <header class="topbar">
    <RouterLink to="/" class="brand">
      <img src="/asfi-logo.png" alt="Logo ASFI" />
      <div>
        <div class="name">Campus ASFI</div>
        <div class="sub">Autoridad de Supervisión del Sistema Financiero</div>
      </div>
    </RouterLink>
    <nav>
      <RouterLink to="/">Cursos</RouterLink>
      <RouterLink to="/source-sets">Cuadernos de fuentes</RouterLink>
      <RouterLink to="/audit">Auditoría</RouterLink>
    </nav>
    <div class="session">Docente</div>
  </header>
  <main class="container">
    <RouterView />
  </main>
</template>
