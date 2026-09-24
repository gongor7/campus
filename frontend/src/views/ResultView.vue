<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api, type AttemptResult } from '../api';

const route = useRoute();
const result = ref<AttemptResult | null>(null);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    result.value = await api.result(String(route.params.id));
  } catch (e) {
    error.value = (e as Error).message;
  }
});

function pct(r: AttemptResult): string {
  return r.maxScore === 0 ? '—' : Math.round((r.score / r.maxScore) * 100) + '%';
}
</script>

<template>
  <p v-if="error" class="card">{{ error }}</p>
  <p v-else-if="!result" class="muted">Calculando resultado…</p>

  <template v-else>
    <div class="card" style="text-align: center">
      <h1>Simulación completada</h1>
      <p style="font-size: 42px; font-weight: 700; margin: 8px 0">
        {{ result.score }} <span class="muted" style="font-size: 20px">/ {{ result.maxScore }}</span>
      </p>
      <p class="muted">Desempeño sobre el máximo alcanzable de tu camino: {{ pct(result) }}</p>
    </div>

    <div class="card">
      <h2>Tu recorrido</h2>
      <ol class="path">
        <li v-for="step in result.steps" :key="step.position">
          <strong>{{ step.scenarioTitle }}</strong><br />
          <span class="muted">{{ step.question }}</span><br />
          <em>Decisión: {{ step.decisionLabel }}</em>
          <p>{{ step.feedback }}</p>
          <p class="muted">Puntaje de la decisión: {{ step.score }} / 100</p>
        </li>
      </ol>
    </div>

    <div class="card" style="text-align: center">
      <RouterLink class="btn" :to="`/simulations/${result.simulationId}`">
        Explorar otro camino (reintentar)
      </RouterLink>
    </div>
  </template>
</template>
