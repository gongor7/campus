<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api, type AuditRow } from '../api';

const rows = ref<AuditRow[]>([]);
const error = ref<string | null>(null);
const resourceType = ref('');

const TYPES = ['', 'COURSE', 'SOURCE_SET', 'LESSON', 'SECTION'];

async function load() {
  error.value = null;
  try {
    rows.value = await api.listAudit(resourceType.value || undefined);
  } catch (e) {
    error.value = (e as Error).message;
  }
}

onMounted(load);
</script>

<template>
  <div class="page-head">
    <div>
      <h1>Auditoría</h1>
      <p>Registro de operaciones del sistema: quién, qué operación, sobre qué recurso, cuándo y con qué resultado.</p>
    </div>
    <select v-model="resourceType" style="border:1px solid var(--line);border-radius:9px;padding:8px 12px" @change="load">
      <option v-for="t in TYPES" :key="t" :value="t">{{ t === '' ? 'Todos los recursos' : t }}</option>
    </select>
  </div>

  <p v-if="error" class="alert-error">{{ error }}</p>
  <p v-if="rows.length === 0 && !error" class="empty">Sin registros para el filtro seleccionado.</p>

  <table v-if="rows.length > 0" class="data">
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Actor</th>
        <th>Operación</th>
        <th>Recurso</th>
        <th>Resultado</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.id">
        <td>{{ new Date(row.createdAt).toLocaleString('es-BO') }}</td>
        <td>{{ row.actor }}</td>
        <td><b>{{ row.action }}</b></td>
        <td>{{ row.resourceType }} #{{ row.resourceId }}</td>
        <td>
          <span class="chip" :class="row.result === 'SUCCESS' ? 'chip-published' : 'chip-review'">{{ row.result }}</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>
