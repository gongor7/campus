<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAttemptStore } from '../stores/attempt';

const route = useRoute();
const router = useRouter();
const store = useAttemptStore();

onMounted(() => {
  if (!store.attempt || store.attempt.id !== route.params.id) {
    void store.load(String(route.params.id));
  }
});

function choose(decisionId: number) {
  void store.decide(decisionId);
}

function continueToNext() {
  if (store.outcome?.completed) {
    router.push(`/attempts/${store.attempt!.id}/result`);
  } else {
    store.continueToNext();
  }
}
</script>

<template>
  <p v-if="store.error" class="card">{{ store.error }}</p>
  <p v-else-if="store.loading && !store.scenario" class="muted">Cargando escenario…</p>

  <template v-if="store.scenario">
    <div class="progress-bar"><div :style="{ width: Math.min(store.progress * 20, 100) + '%' }" /></div>

    <div class="card">
      <p class="muted">Escenario {{ store.scenario.code }}</p>
      <h1>{{ store.scenario.title }}</h1>
      <p>{{ store.scenario.context }}</p>

      <h3>Tablero de indicadores</h3>
      <div class="indicators">
        <div v-for="ind in store.scenario.information.indicators" :key="ind.name" class="indicator">
          <div class="name">{{ ind.name }}</div>
          <div class="value">{{ ind.trend }} {{ ind.value }}</div>
          <div v-if="ind.note" class="note">{{ ind.note }}</div>
        </div>
      </div>

      <div v-if="store.scenario.information.notes?.length">
        <h3>Información relevante</h3>
        <ul>
          <li v-for="(note, i) in store.scenario.information.notes" :key="i">{{ note }}</li>
        </ul>
      </div>
    </div>

    <div v-if="!store.outcome" class="card">
      <h2>{{ store.scenario.question }}</h2>
      <button
        v-for="d in store.scenario.decisions"
        :key="d.id"
        class="option"
        :disabled="store.loading"
        @click="choose(d.id)"
      >
        <strong>{{ d.code }}.</strong> {{ d.label }}
      </button>
    </div>

    <div v-else class="card feedback-panel">
      <p class="label">Consecuencia de tu decisión</p>
      <p>{{ store.outcome.consequence }}</p>
      <p class="label">Retroalimentación</p>
      <p>{{ store.outcome.feedback }}</p>
      <button class="btn" @click="continueToNext">
        {{ store.outcome.completed ? 'Ver resultado final' : 'Continuar' }}
      </button>
    </div>
  </template>
</template>
