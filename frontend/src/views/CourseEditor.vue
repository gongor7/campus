<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api, type Course, type Lesson, type CourseSection } from '../api';
import { STATUS_LABELS, statusClass, formatHours } from '../helpers';

const route = useRoute();
const courseId = Number(route.params.id);

const course = ref<Course | null>(null);
const error = ref<string | null>(null);
const notice = ref<string | null>(null);
const busy = ref(false);

type Selection = { kind: 'lesson'; id: number } | { kind: 'section'; id: number };
const selected = ref<Selection | null>(null);

const editable = computed(() => course.value?.status === 'DRAFT' || course.value?.status === 'REVIEW');

async function reload(): Promise<void> {
  course.value = await api.getCourse(courseId);
  const current = selected.value;
  if (current) {
    const stillExists =
      current.kind === 'lesson'
        ? allLessons.value.some((l) => l.id === current.id)
        : course.value.sections.some((s) => s.id === current.id);
    if (!stillExists) selected.value = null;
  }
}

onMounted(async () => {
  try {
    await reload();
    const first = allLessons.value[0];
    if (first) selected.value = { kind: 'lesson', id: first.id };
  } catch (e) {
    error.value = (e as Error).message;
  }
});

const allLessons = computed<Lesson[]>(() =>
  (course.value?.modules ?? []).flatMap((m) => m.lessons ?? []),
);

const selectedLesson = computed(() =>
  selected.value?.kind === 'lesson'
    ? allLessons.value.find((l) => l.id === selected.value?.id) ?? null
    : null,
);

const selectedSection = computed<CourseSection | null>(() =>
  selected.value?.kind === 'section'
    ? course.value?.sections.find((s) => s.id === selected.value?.id) ?? null
    : null,
);

const sectionLabels: Record<string, string> = {
  INTRODUCTION: 'Introducción',
  PRACTICE: 'Práctica',
  EVALUATION: 'Evaluación',
  CLOSING: 'Cierre',
};

const draft = ref<{ objective: string; content: string } | null>(null);

function selectLesson(lesson: Lesson) {
  selected.value = { kind: 'lesson', id: lesson.id };
  draft.value = { objective: lesson.objective ?? '', content: lesson.content ?? '' };
}

function selectSection(section: CourseSection) {
  selected.value = { kind: 'section', id: section.id };
  draft.value = { objective: '', content: section.content ?? '' };
}

async function run(action: () => Promise<unknown>, message: string) {
  error.value = null;
  notice.value = null;
  busy.value = true;
  try {
    await action();
    await reload();
    notice.value = message;
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    busy.value = false;
  }
}

function saveLesson() {
  const lesson = selectedLesson.value;
  if (!lesson || !draft.value) return;
  void run(
    () => api.updateLesson(lesson.id, { objective: draft.value!.objective, content: draft.value!.content }),
    'Lección guardada.',
  );
}

function saveSection() {
  const section = selectedSection.value;
  if (!section || !draft.value) return;
  void run(() => api.updateSection(section.id, { content: draft.value!.content }), 'Sección guardada.');
}

function regenerateLesson() {
  const lesson = selectedLesson.value;
  if (!lesson) return;
  void run(async () => {
    await api.generateLesson(lesson.id);
    const updated = await api.getCourse(courseId);
    const fresh = updated.modules.flatMap((m) => m.lessons).find((l) => l.id === lesson.id);
    if (fresh) draft.value = { objective: fresh.objective ?? '', content: fresh.content ?? '' };
  }, 'Lección regenerada con la IA.');
}

function submitReview() {
  void run(() => api.submitReview(courseId), 'Curso enviado a revisión.');
}

function publish() {
  void run(() => api.publish(courseId), 'Curso publicado.');
}
</script>

<template>
  <p v-if="error" class="alert-error">{{ error }}</p>
  <p v-if="notice" class="alert-info">{{ notice }}</p>
  <p v-if="!course" class="empty">Cargando curso…</p>

  <template v-if="course">
    <div class="statusbar">
      <span class="st">{{ course.title }}</span>
      <span class="chip" :class="statusClass(course.status)">{{ STATUS_LABELS[course.status] }}</span>
      <span class="muted" style="font-size:13px">
        {{ formatHours(course.modules.reduce((n, m) => n + m.lessons.reduce((x, l) => x + l.estimatedMinutes, 0), 0)) }}
        · cuaderno: {{ course.sourceSet?.name ?? 'sin vincular' }}
      </span>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button
          v-if="course.status === 'DRAFT'"
          class="btn btn-ghost btn-sm"
          :disabled="busy || allLessons.length === 0"
          @click="submitReview"
        >
          Enviar a revisión
        </button>
        <button
          v-if="course.status === 'REVIEW'"
          class="btn btn-primary btn-sm"
          :disabled="busy"
          @click="publish"
        >
          Aprobar y publicar
        </button>
      </div>
    </div>

    <div v-if="!editable && course.status === 'PUBLISHED'" class="alert-info">
      Este curso está publicado y es de solo lectura. El módulo de estudiantes lo consumirá desde aquí.
    </div>

    <div class="editor">
      <div class="tree">
        <h4>Estructura</h4>
        <div class="grp">
          <template v-for="section in course.sections.filter((s) => s.type === 'INTRODUCTION')" :key="section.id">
            <button class="item" :class="{ active: selected?.kind === 'section' && selected.id === section.id }" @click="selectSection(section)">
              <span>{{ section.title || sectionLabels[section.type] }}</span>
            </button>
          </template>
        </div>
        <div v-for="(module, i) in course.modules" :key="module.id" class="grp">
          <b>Módulo {{ i + 1 }} · {{ module.title }}</b>
          <button
            v-for="lesson in module.lessons"
            :key="lesson.id"
            class="item"
            :class="{ active: selected?.kind === 'lesson' && selected.id === lesson.id }"
            @click="selectLesson(lesson)"
          >
            <span>{{ lesson.title }}</span>
            <span class="m">{{ lesson.estimatedMinutes }} m</span>
          </button>
        </div>
        <div class="grp">
          <b>Secciones finales</b>
          <button
            v-for="section in course.sections.filter((s) => s.type !== 'INTRODUCTION')"
            :key="section.id"
            class="item"
            :class="{ active: selected?.kind === 'section' && selected.id === section.id }"
            @click="selectSection(section)"
          >
            <span>{{ section.title || sectionLabels[section.type] }}</span>
            <span class="m">{{ sectionLabels[section.type] }}</span>
          </button>
        </div>
      </div>

      <div class="editor-main">
        <template v-if="selectedLesson">
          <div class="crumb">Módulo: {{ course.modules.find((m) => m.id === selectedLesson?.moduleId)?.title }}</div>
          <h2>{{ selectedLesson.title }}</h2>
          <div class="field" style="margin-top:14px">
            <label>Objetivo de la lección</label>
            <textarea v-if="draft" v-model="draft.objective" rows="2" :disabled="!editable" />
          </div>
          <div class="field">
            <label>Contenido</label>
            <textarea v-if="draft" v-model="draft.content" :disabled="!editable" />
          </div>
          <div class="field">
            <label>Fuentes citadas</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <span v-for="ref in selectedLesson.sourceRefs ?? []" :key="ref" class="chip chip-src">{{ ref }}</span>
              <span v-if="(selectedLesson.sourceRefs ?? []).length === 0" class="muted">sin citas</span>
            </div>
          </div>
          <div class="form-actions" v-if="editable">
            <button class="btn btn-ghost" :disabled="busy" @click="regenerateLesson">Regenerar esta lección</button>
            <button class="btn btn-primary" :disabled="busy" @click="saveLesson">Guardar cambios</button>
          </div>
        </template>

        <template v-else-if="selectedSection">
          <div class="crumb">Sección institucional</div>
          <h2>{{ selectedSection.title || sectionLabels[selectedSection.type] }}</h2>
          <div class="field" style="margin-top:14px">
            <label>Contenido</label>
            <textarea v-if="draft" v-model="draft.content" :disabled="!editable" />
          </div>
          <div class="form-actions" v-if="editable">
            <button class="btn btn-primary" :disabled="busy" @click="saveSection">Guardar cambios</button>
          </div>
        </template>

        <p v-else class="empty">Selecciona una lección o sección del árbol.</p>
      </div>
    </div>
  </template>
</template>
