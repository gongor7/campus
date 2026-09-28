<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { studentApi, type Course, type Lesson, type CourseSection } from '../../api';

const route = useRoute();
const courseId = Number(route.params.id);

const course = ref<Course | null>(null);
const enrollment = ref<{ status: string; bestScore: number | null; evaluationApproved: boolean } | null>(null);
const progress = ref({ completed: 0, total: 0, percent: 0 });
const marked = ref<Set<number>>(new Set());
const error = ref<string | null>(null);
const busy = ref(false);

type Selection = { kind: 'lesson'; id: number } | { kind: 'section'; id: number };
const selected = ref<Selection | null>(null);

async function reload() {
  const data = await studentApi.course(courseId);
  course.value = data.course;
  enrollment.value = data.enrollment;
  progress.value = data.progress;
  marked.value = new Set(data.markedLessonIds);
  const current = selected.value;
  if (current && !stillExists(current)) selected.value = null;
}

function stillExists(sel: Selection): boolean {
  if (!course.value) return false;
  return sel.kind === 'lesson'
    ? allLessons.value.some((l) => l.id === sel.id)
    : course.value.sections.some((s) => s.id === sel.id);
}

onMounted(async () => {
  try {
    await reload();
  } catch (e) {
    error.value = (e as Error).message;
  }
});

const allLessons = computed<Lesson[]>(() => (course.value?.modules ?? []).flatMap((m) => m.lessons ?? []));
const selectedLesson = computed(() =>
  selected.value?.kind === 'lesson' ? allLessons.value.find((l) => l.id === selected.value?.id) ?? null : null,
);
const selectedSection = computed<CourseSection | null>(() =>
  selected.value?.kind === 'section' ? course.value?.sections.find((s) => s.id === selected.value?.id) ?? null : null,
);

const sectionLabels: Record<string, string> = {
  INTRODUCTION: 'Introducción',
  PRACTICE: 'Práctica',
  EVALUATION: 'Evaluación',
  CLOSING: 'Cierre',
};

async function toggleLesson(lesson: Lesson) {
  busy.value = true;
  error.value = null;
  try {
    const next = !marked.value.has(lesson.id);
    progress.value = await studentApi.setProgress(lesson.id, next);
    if (next) marked.value.add(lesson.id);
    else marked.value.delete(lesson.id);
    await reload();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <p v-if="error" class="alert-error">{{ error }}</p>
  <p v-if="!course" class="empty">Cargando curso…</p>

  <template v-if="course">
    <div class="statusbar">
      <span class="st">{{ course.title }}</span>
      <span class="chip" :class="enrollment?.status === 'COMPLETED' ? 'chip-published' : 'chip-draft'">
        {{ enrollment?.status === 'COMPLETED' ? 'Completado' : 'En curso' }}
      </span>
      <span class="muted" style="font-size:13px">Puedes consultar el material durante la evaluación (libro abierto).</span>
      <RouterLink
        v-if="enrollment && enrollment.status !== 'COMPLETED'"
        class="btn btn-accent btn-sm"
        style="margin-left:auto"
        :to="`/estudiante/cursos/${courseId}/evaluacion`"
      >
        Ir a la evaluación
      </RouterLink>
    </div>

    <div v-if="enrollment?.status === 'COMPLETED'" class="alert-info">
      Felicitaciones, completaste este curso. Mejor puntaje: {{ enrollment?.bestScore }}.
    </div>

    <div class="summary-bar">
      <div class="stat"><b>{{ progress.percent }}%</b>avance del curso</div>
      <div class="stat"><b>{{ progress.completed }} / {{ progress.total }}</b>lecciones marcadas</div>
      <div class="stat">
        <b>{{ enrollment?.evaluationApproved ? 'Aprobada' : 'Pendiente' }}</b>evaluación
      </div>
    </div>

    <div class="editor">
      <div class="tree">
        <h4>Contenido</h4>
        <div class="grp">
          <template v-for="section in course.sections.filter((s) => s.type === 'INTRODUCTION')" :key="section.id">
            <button class="item" :class="{ active: selected?.kind === 'section' && selected.id === section.id }" @click="selected = { kind: 'section', id: section.id }">
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
            @click="selected = { kind: 'lesson', id: lesson.id }"
          >
            <span>{{ marked.has(lesson.id) ? '[v] ' : '' }}{{ lesson.title }}</span>
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
            @click="selected = { kind: 'section', id: section.id }"
          >
            <span>{{ section.title || sectionLabels[section.type] }}</span>
            <span class="m">{{ sectionLabels[section.type] }}</span>
          </button>
        </div>
      </div>

      <div class="editor-main">
        <template v-if="selectedLesson">
          <div class="crumb">Lección del curso</div>
          <h2>{{ selectedLesson.title }}</h2>
          <p v-if="selectedLesson.objective" class="muted" style="margin:6px 0 14px">{{ selectedLesson.objective }}</p>
          <div style="white-space:pre-wrap;background:#fbfdfd;border:1px solid var(--line);border-radius:9px;padding:14px;min-height:120px">
            {{ selectedLesson.content ?? 'Esta lección aún no tiene contenido.' }}
          </div>
          <div v-if="(selectedLesson.sourceRefs ?? []).length" style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
            <span v-for="ref in selectedLesson.sourceRefs" :key="ref" class="chip chip-src">{{ ref }}</span>
          </div>
          <div class="form-actions" style="margin-top:14px">
            <button class="btn" :class="marked.has(selectedLesson.id) ? 'btn-ghost' : 'btn-primary'" :disabled="busy" @click="toggleLesson(selectedLesson)">
              {{ marked.has(selectedLesson.id) ? 'Desmarcar como completada' : 'Marcar como completada' }}
            </button>
          </div>
        </template>

        <template v-else-if="selectedSection">
          <div class="crumb">Sección institucional</div>
          <h2>{{ selectedSection.title || sectionLabels[selectedSection.type] }}</h2>
          <div style="white-space:pre-wrap;background:#fbfdfd;border:1px solid var(--line);border-radius:9px;padding:14px;margin-top:12px;min-height:80px">
            {{ selectedSection.content ?? 'Sin contenido.' }}
          </div>
        </template>

        <p v-else class="empty">Selecciona una lección o sección del árbol.</p>
      </div>
    </div>
  </template>
</template>
