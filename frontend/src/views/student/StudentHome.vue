<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { studentApi, getStudentSession, setStudentSession, type StudentSession, type StudentEnrollment, type Course } from '../../api';
import { LEVEL_LABELS, ENROLLMENT_LABELS } from '../../helpers';

const router = useRouter();
const session = ref<StudentSession | null>(getStudentSession());
const name = ref('');
const email = ref('');
const error = ref<string | null>(null);
const busy = ref(false);

const catalog = ref<Course[]>([]);
const mine = ref<StudentEnrollment[]>([]);

async function reload() {
  if (!session.value) return;
  catalog.value = await studentApi.catalog();
  mine.value = await studentApi.myCourses();
}

onMounted(reload);

async function signIn() {
  error.value = null;
  busy.value = true;
  try {
    session.value = await studentApi.session(name.value.trim(), email.value.trim());
    setStudentSession(session.value);
    await reload();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    busy.value = false;
  }
}

async function enroll(courseId: number) {
  busy.value = true;
  try {
    await studentApi.enroll(courseId);
    await reload();
    router.push(`/estudiante/cursos/${courseId}`);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    busy.value = false;
  }
}

function signOut() {
  setStudentSession(null);
  session.value = null;
  catalog.value = [];
  mine.value = [];
}
</script>

<template>
  <!-- Identidad (RF-01 a RF-05) -->
  <div v-if="!session" class="form-card" style="max-width:520px;margin:0 auto">
    <h1 style="font-size:20px;color:var(--primary);margin-bottom:4px">Campus del estudiante</h1>
    <p class="muted" style="margin-bottom:16px">
      Ingresa tu nombre y correo para llevar tu progreso. No usamos contraseñas.
      Tus datos se usan únicamente para guardar tu avance en los cursos (aviso de tratamiento de datos).
    </p>
    <p v-if="error" class="alert-error">{{ error }}</p>
    <div class="field">
      <label for="s-name">Nombre</label>
      <input id="s-name" v-model="name" placeholder="Tu nombre y apellido" />
    </div>
    <div class="field">
      <label for="s-email">Correo</label>
      <input id="s-email" v-model="email" placeholder="nombre@institucion.gob.bo" />
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" :disabled="busy" @click="signIn">Ingresar</button>
    </div>
  </div>

  <template v-else>
    <div class="page-head">
      <div>
        <h1>Hola, {{ session.name }}</h1>
        <p>Catálogo de cursos publicados y tu progreso.</p>
      </div>
      <button class="btn btn-ghost" @click="signOut">Cerrar sesión</button>
    </div>

    <p v-if="error" class="alert-error">{{ error }}</p>

    <h2 style="font-size:16px;color:var(--primary);margin:18px 0 10px">Mis cursos</h2>
    <p v-if="mine.length === 0" class="empty">Aún no te has inscrito a ningún curso.</p>
    <div class="cards">
      <RouterLink v-for="c in mine" :key="c.enrollmentId" class="card-link" :to="`/estudiante/cursos/${c.courseId}`">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
          <h3>{{ c.title }}</h3>
          <span class="chip" :class="c.status === 'COMPLETED' ? 'chip-published' : 'chip-draft'">
            {{ ENROLLMENT_LABELS[c.status] }}
          </span>
        </div>
        <div class="meta">
          <span class="chip chip-level">{{ LEVEL_LABELS[c.level] }}</span>
          <span v-if="c.evaluationApproved" class="chip chip-published">Evaluación aprobada</span>
          <span v-if="c.bestScore !== null">Mejor puntaje: {{ c.bestScore }}</span>
          <span v-if="c.courseStatus === 'ARCHIVED'" class="chip chip-archived">Archivado</span>
        </div>
        <div>
          <div class="meter-row"><span>Lecciones completadas</span><span>{{ c.completedLessons }} / {{ c.totalLessons }}</span></div>
          <div class="meter"><div :style="{ width: c.percent + '%' }" /></div>
        </div>
      </RouterLink>
    </div>

    <h2 style="font-size:16px;color:var(--primary);margin:26px 0 10px">Catálogo</h2>
    <p v-if="catalog.length === 0" class="empty">No hay cursos publicados por ahora.</p>
    <div class="cards">
      <div v-for="c in catalog" :key="c.id" class="card">
        <h3>{{ c.title }}</h3>
        <div class="meta">
          <span class="chip chip-level">{{ LEVEL_LABELS[c.level] }}</span>
          <span>{{ c.targetHours }} h</span>
          <span v-if="c.audience">{{ c.audience }}</span>
        </div>
        <p class="muted" style="font-size:13px">{{ c.description }}</p>
        <div>
          <button class="btn btn-primary btn-sm" :disabled="busy" @click="enroll(c.id)">Inscribirme</button>
        </div>
      </div>
    </div>
  </template>
</template>
