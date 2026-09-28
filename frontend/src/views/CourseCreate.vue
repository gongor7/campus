<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { api, type SourceSet, type OutlineProposal, type CourseLevel } from '../api';
import { formatHours } from '../helpers';

const router = useRouter();
const step = ref<1 | 2 | 3>(1);

// Paso 1: datos del curso
const form = ref({
  title: '',
  description: '',
  objective: '',
  audience: '',
  level: 'BASIC' as CourseLevel,
  targetHours: 6,
});

// Paso 2: cuaderno
const sourceSets = ref<SourceSet[]>([]);
const selectedSetId = ref<number | null>(null);
const newSetName = ref('');
const uploadFiles = ref<File[]>([]);

// Paso 3: propuesta
const generating = ref(false);
const proposal = ref<OutlineProposal | null>(null);
const error = ref<string | null>(null);
const createdCourseId = ref<number | null>(null);

onMounted(async () => {
  try {
    sourceSets.value = await api.listSourceSets();
  } catch (e) {
    error.value = (e as Error).message;
  }
});

const canContinue = computed(() => form.value.title.trim().length >= 3 && form.value.targetHours > 0);

async function goToStep3() {
  error.value = null;
  generating.value = true;
  try {
    let setId = selectedSetId.value;
    if (!setId && newSetName.value.trim()) {
      const created = await api.createSourceSet(newSetName.value.trim());
      setId = created.id;
      if (uploadFiles.value.length > 0) await api.uploadSources(setId, uploadFiles.value);
      sourceSets.value = await api.listSourceSets();
    }
    if (!setId) throw new Error('Selecciona un cuaderno existente o crea uno nuevo con documentos.');

    const course = await api.createCourse({ ...form.value, sourceSetId: setId });
    createdCourseId.value = course.id;
    proposal.value = await api.generateOutline(course.id);
    step.value = 3;
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    generating.value = false;
  }
}

function finish() {
  router.push(`/courses/${createdCourseId.value}/edit`);
}

function onFilesChanged(event: Event) {
  const input = event.target as HTMLInputElement;
  uploadFiles.value = Array.from(input.files ?? []);
}
</script>

<template>
  <div v-if="error" class="alert-error">{{ error }}</div>

  <div class="steps">
    <div class="step" :class="{ current: step === 1, done: step > 1 }">1 · Datos del curso</div>
    <div class="step" :class="{ current: step === 2, done: step > 2 }">2 · Cuaderno de fuentes</div>
    <div class="step" :class="{ current: step === 3 }">3 · Estructura propuesta</div>
  </div>

  <!-- Paso 1 -->
  <div v-if="step === 1" class="form-card">
    <div class="grid-2">
      <div class="field" style="grid-column:1/-1">
        <label for="title">Nombre del curso</label>
        <input id="title" v-model="form.title" placeholder="Ej.: Keycloak para servicios institucionales" />
      </div>
      <div class="field" style="grid-column:1/-1">
        <label for="description">Descripción</label>
        <textarea id="description" v-model="form.description" rows="2" />
      </div>
      <div class="field" style="grid-column:1/-1">
        <label for="objective">Objetivo general</label>
        <input id="objective" v-model="form.objective" />
      </div>
      <div class="field">
        <label for="audience">Público objetivo</label>
        <input id="audience" v-model="form.audience" placeholder="Ej.: Equipo de plataforma" />
      </div>
      <div class="field">
        <label for="level">Nivel</label>
        <select id="level" v-model="form.level">
          <option value="BASIC">Básico</option>
          <option value="INTERMEDIATE">Intermedio</option>
          <option value="ADVANCED">Avanzado</option>
        </select>
      </div>
      <div class="field">
        <label for="hours">Duración objetivo (horas)</label>
        <input id="hours" v-model.number="form.targetHours" type="number" min="1" max="200" />
        <span class="hint">La estructura propuesta repartirá estos tiempos entre lecciones.</span>
      </div>
      <div class="field">
        <label>Plantilla institucional</label>
        <input value="ASFI_STANDARD" disabled />
        <span class="hint">Definida por la institución; la IA trabaja dentro de ella.</span>
      </div>
    </div>
    <div class="form-actions">
      <RouterLink class="btn btn-ghost" to="/">Cancelar</RouterLink>
      <button class="btn btn-primary" :disabled="!canContinue" @click="step = 2">Continuar al cuaderno</button>
    </div>
  </div>

  <!-- Paso 2 -->
  <div v-if="step === 2" class="form-card">
    <div class="field"><label>Selecciona el cuaderno con el material oficial del curso</label></div>

    <div
      v-for="set in sourceSets"
      :key="set.id"
      class="opt-card"
      :class="{ selected: selectedSetId === set.id }"
      @click="selectedSetId = set.id"
    >
      <div class="radio"></div>
      <div class="info">
        <b>{{ set.name }}</b>
        <span>{{ set.sources.length }} fuente(s) · creado el {{ new Date(set.createdAt).toLocaleDateString('es-BO') }}</span>
      </div>
    </div>

    <div class="opt-card" :class="{ selected: selectedSetId === null && newSetName.trim().length > 0 }" @click="selectedSetId = null">
      <div class="radio"></div>
      <div class="info">
        <b>Crear un cuaderno nuevo</b>
        <input v-model="newSetName" placeholder="Nombre del cuaderno (se activa al escribir)" style="margin-top:6px" @click.stop />
      </div>
    </div>

    <div v-if="selectedSetId === null && newSetName.trim().length > 0" class="dropzone" style="margin-top:12px">
      <label for="files"><b>Documentos oficiales</b> — PDF, PPTX, DOCX o TXT (hasta 20 MB por archivo)</label>
      <input id="files" type="file" multiple accept=".pdf,.pptx,.docx,.txt,.md" style="margin-top:8px" @change="onFilesChanged" />
      <p v-if="uploadFiles.length > 0" class="hint" style="margin-top:6px">
        {{ uploadFiles.length }} archivo(s) seleccionado(s)
      </p>
    </div>

    <div class="form-actions">
      <button class="btn btn-ghost" @click="step = 1">Atrás</button>
      <button class="btn btn-accent" :disabled="generating" @click="goToStep3">
        {{ generating ? 'Generando propuesta…' : 'Proponer estructura con IA' }}
      </button>
    </div>
  </div>

  <!-- Paso 3 -->
  <div v-if="step === 3 && proposal">
    <div class="summary-bar">
      <div class="stat"><b>{{ proposal.modules.length }} módulos</b>plantilla ASFI_STANDARD</div>
      <div class="stat"><b>{{ proposal.modules.reduce((n, m) => n + m.lessons.length, 0) }} lecciones</b></div>
      <div class="stat"><b>{{ formatHours(proposal.totalEstimatedMinutes) }}</b>objetivo: {{ form.targetHours }} h</div>
      <div class="stat"><b>{{ proposal.coverageGaps.length === 0 ? 'Sin brechas' : proposal.coverageGaps.length + ' brecha(s)' }}</b>cobertura de fuentes</div>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn btn-primary btn-sm" @click="finish">Guardar y continuar al editor</button>
      </div>
    </div>

    <div v-if="proposal.coverageGaps.length > 0" class="alert-gaps">
      <h4>Brechas de cobertura detectadas en las fuentes</h4>
      <ul>
        <li v-for="(gap, i) in proposal.coverageGaps" :key="i">{{ gap.topic }}: {{ gap.reason }}</li>
      </ul>
    </div>

    <div class="alert-info">
      Esta estructura quedó guardada como borrador del curso y es editable en el editor
      (agregar o quitar lecciones, ajustar tiempos, regenerar lecciones individuales).
    </div>

    <div v-for="(module, i) in proposal.modules" :key="i" class="module">
      <div class="module-head">
        <h3>Módulo {{ i + 1 }} · {{ module.title }}</h3>
        <span class="min">{{ formatHours(module.estimatedMinutes) }}</span>
      </div>
      <div v-for="(lesson, j) in module.lessons" :key="j" class="lesson-row">
        <div class="idx">{{ j + 1 }}</div>
        <div class="t">{{ lesson.title }}<small v-if="lesson.objective">{{ lesson.objective }}</small></div>
        <div class="srcs">
          <span v-for="ref in (module.sourceRefs ?? []).slice(0, 3)" :key="ref" class="chip chip-src">{{ ref }}</span>
          <span class="muted" style="font-size:12px">{{ lesson.estimatedMinutes }} min</span>
        </div>
      </div>
    </div>

    <div class="form-actions" style="margin-top:16px">
      <button class="btn btn-primary" @click="finish">Guardar y continuar al editor</button>
    </div>
  </div>
</template>
