<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api, type Simulation } from '../api';

const simulations = ref<Simulation[]>([]);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    simulations.value = await api.simulations();
  } catch (e) {
    error.value = (e as Error).message;
  }
});
</script>

<template>
  <h1>Simulaciones disponibles</h1>
  <p v-if="error" class="muted">No se pudo cargar el catálogo: {{ error }}</p>
  <p v-else-if="simulations.length === 0" class="muted">Cargando…</p>

  <div v-for="s in simulations" :key="s.id" class="card">
    <h2>{{ s.title }}</h2>
    <p><strong>Objetivo:</strong> {{ s.objective }}</p>
    <RouterLink class="btn" :to="`/simulations/${s.id}`">Ver detalle e iniciar</RouterLink>
  </div>
</template>
