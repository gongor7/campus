<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { studentApi, type AttemptView } from '../../api';

const route = useRoute();
const courseId = Number(route.params.id);

const attempt = ref<AttemptView | null>(null);
const answers = ref<Record<number, string>>({});
const history = ref<{ id: string; submittedAt: string; score: number; approved: boolean }[]>([]);
const error = ref<string | null>(null);
const busy = ref(false);
const phase = ref<'idle' | 'preparing' | 'answering' | 'graded'>('idle');

async function loadHistory() {
  try {
    history.value = await studentApi.attemptHistory(courseId);
  } catch {
    history.value = [];
  }
}

onMounted(loadHistory);

async function startAttempt() {
  error.value = null;
  busy.value = true;
  phase.value = 'preparing';
  try {
    attempt.value = await studentApi.startAttempt(courseId);
    answers.value = {};
    for (const q of attempt.value.questions) answers.value[q.questionId] = '';
    phase.value = 'answering';
  } catch (e) {
    error.value = (e as Error).message;
    phase.value = 'idle';
  } finally {
    busy.value = false;
  }
}

async function submitAttempt() {
  if (!attempt.value) return;
  error.value = null;
  busy.value = true;
  try {
    attempt.value = await studentApi.submitAttempt(
      attempt.value.id,
      attempt.value.questions.map((q) => ({ questionId: q.questionId, answer: answers.value[q.questionId] ?? '' })),
    );
    if (attempt.value.status === 'GRADED') {
      phase.value = 'graded';
      await loadHistory();
    } else if (attempt.value.status === 'GRADING_FAILED') {
      phase.value = 'idle';
      error.value = 'La calificación no estuvo disponible; este intento quedó sin efecto. Puedes intentar nuevamente.';
    }
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div class="page-head">
    <div>
      <h1>Evaluación del curso</h1>
      <p>Preguntas de caso con respuesta abierta. Puedes consultar el material del curso mientras respondes.</p>
    </div>
    <RouterLink class="btn btn-ghost" :to="`/estudiante/cursos/${courseId}`">Volver al curso</RouterLink>
  </div>

  <p v-if="error" class="alert-error">{{ error }}</p>

  <!-- Historial (RF-23, RF-28) -->
  <div v-if="history.length > 0" class="form-card" style="margin-bottom:18px">
    <h2 style="font-size:15px;color:var(--primary);margin-bottom:10px">Historial de intentos</h2>
    <table class="data">
      <thead><tr><th>Fecha</th><th>Puntaje</th><th>Resultado</th></tr></thead>
      <tbody>
        <tr v-for="h in history" :key="h.id">
          <td>{{ new Date(h.submittedAt).toLocaleString('es-BO') }}</td>
          <td>{{ h.score }} / 100</td>
          <td><span class="chip" :class="h.approved ? 'chip-published' : 'chip-review'">{{ h.approved ? 'Aprobado' : 'Para mejorar' }}</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Preparando (RF-19) -->
  <div v-if="phase === 'preparing'" class="empty">Preparando tu evaluación con variantes del caso…</div>

  <!-- Inicio -->
  <div v-if="phase === 'idle'" class="form-card" style="text-align:center">
    <p class="muted" style="margin-bottom:14px">
      Cada intento presenta cinco preguntas de caso con variantes. Intentos ilimitados con un enfriamiento entre intentos calificados;
      tu puntaje oficial es el mejor intento y la aprobación requiere {{ 70 }} o más.
    </p>
    <button class="btn btn-accent" :disabled="busy" @click="startAttempt">Iniciar intento</button>
  </div>

  <!-- Respondiendo -->
  <div v-if="phase === 'answering' && attempt">
    <div v-for="(q, i) in attempt.questions" :key="q.questionId" class="module">
      <div class="module-head"><h3>Pregunta {{ i + 1 }}</h3></div>
      <div style="padding:14px 18px">
        <p style="white-space:pre-wrap">{{ q.variantCase }}</p>
        <p style="margin-top:8px"><b>{{ q.prompt }}</b></p>
        <textarea
          v-model="answers[q.questionId]"
          rows="4"
          style="width:100%;margin-top:10px;border:1px solid var(--line);border-radius:9px;padding:10px;font:inherit;background:#fbfdfd"
          placeholder="Desarrolla tu análisis del caso sustentándote en el material del curso…"
        />
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" :disabled="busy" @click="submitAttempt">Enviar respuestas</button>
    </div>
  </div>

  <!-- Resultado (RF-22, RF-23, RF-26) -->
  <div v-if="phase === 'graded' && attempt">
    <div class="summary-bar">
      <div class="stat"><b>{{ attempt.score }} / 100</b>puntaje del intento</div>
      <div class="stat">
        <b>{{ (attempt.score ?? 0) >= attempt.passScore ? 'Aprobado' : 'Para mejorar' }}</b>umbral {{ attempt.passScore }}
      </div>
      <div style="margin-left:auto"><button class="btn btn-ghost" @click="phase = 'idle'">Nuevo intento</button></div>
    </div>

    <div v-for="(q, i) in attempt.questions" :key="q.questionId" class="module">
      <div class="module-head">
        <h3>Pregunta {{ i + 1 }} · {{ q.score }} / 100</h3>
        <span class="chip" :class="(q.score ?? 0) >= 70 ? 'chip-published' : 'chip-review'">
          {{ (q.score ?? 0) >= 70 ? 'Sólida' : 'Refuerza' }}
        </span>
      </div>
      <div style="padding:14px 18px">
        <p class="muted" style="margin-bottom:6px">Tu respuesta:</p>
        <p style="white-space:pre-wrap;background:#fbfdfd;border:1px solid var(--line);border-radius:9px;padding:10px">{{ q.answer }}</p>
        <p class="muted" style="margin:10px 0 4px">Retroalimentación:</p>
        <p style="white-space:pre-wrap">{{ q.feedback }}</p>
      </div>
    </div>
  </div>
</template>
