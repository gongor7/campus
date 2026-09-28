<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api, type Course } from '../api';
import { STATUS_LABELS, LEVEL_LABELS, statusClass } from '../helpers';

const courses = ref<Course[]>([]);
const error = ref<string | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    courses.value = await api.listCourses();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
});

function progress(course: Course): { done: number; total: number } {
  const lessons = course.modules?.flatMap((m) => m.lessons ?? []) ?? [];
  const done = lessons.filter((l) => (l.content ?? '').trim().length > 0).length;
  return { done, total: lessons.length };
}
</script>

<template>
  <div class="page-head">
    <div>
      <h1>Cursos</h1>
      <p>Propuestas generadas con IA sobre fuentes oficiales, bajo revisión docente.</p>
    </div>
    <RouterLink class="btn btn-primary" to="/courses/new">Nuevo curso</RouterLink>
  </div>

  <p v-if="error" class="alert-error">{{ error }}</p>
  <p v-if="loading" class="empty">Cargando cursos…</p>
  <p v-else-if="courses.length === 0" class="empty">
    Todavía no hay cursos. Crea el primero con su cuaderno de fuentes.
  </p>

  <div class="cards">
    <RouterLink v-for="course in courses" :key="course.id" class="card-link" :to="`/courses/${course.id}/edit`">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <h3>{{ course.title }}</h3>
        <span class="chip" :class="statusClass(course.status)">{{ STATUS_LABELS[course.status] }}</span>
      </div>
      <div class="meta">
        <span class="chip chip-level">{{ LEVEL_LABELS[course.level] }}</span>
        <span>{{ course.targetHours }} h</span>
        <span v-if="course.audience">{{ course.audience }}</span>
      </div>
      <div v-if="progress(course).total > 0">
        <div class="meter-row">
          <span>Lecciones con contenido</span>
          <span>{{ progress(course).done }} / {{ progress(course).total }}</span>
        </div>
        <div class="meter"><div :style="{ width: (progress(course).total ? (progress(course).done / progress(course).total) * 100 : 0) + '%' }" /></div>
      </div>
      <div v-else class="meter-row"><span>Estructura</span><span>sin generar</span></div>
    </RouterLink>
  </div>
</template>
