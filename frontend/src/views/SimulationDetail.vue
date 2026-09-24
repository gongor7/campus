<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api, type Simulation } from '../api';
import { useAttemptStore } from '../stores/attempt';

const route = useRoute();
const router = useRouter();
const store = useAttemptStore();
const simulation = ref<Simulation | null>(null);
const starting = ref(false);

onMounted(async () => {
  simulation.value = await api.simulation(Number(route.params.id));
});

async function start() {
  starting.value = true;
  await store.start(simulation.value!.id);
  if (store.attempt) router.push(`/attempts/${store.attempt.id}`);
  starting.value = false;
}
</script>

<template>
  <div v-if="simulation" class="card">
    <h1>{{ simulation.title }}</h1>
    <p><strong>Objetivo:</strong> {{ simulation.objective }}</p>
    <p>{{ simulation.description }}</p>
    <p class="muted">Tus decisiones determinan el rumbo del caso. Recibirás retroalimentación tras cada decisión; tu puntaje se revelará al final.</p>
    <button class="btn" :disabled="starting" @click="start">
      {{ starting ? 'Iniciando…' : 'Iniciar simulación' }}
    </button>
  </div>
  <p v-else class="muted">Cargando…</p>
</template>
