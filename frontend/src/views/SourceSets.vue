<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api, type SourceSet } from '../api';
import { formatBytes } from '../helpers';

const sets = ref<SourceSet[]>([]);
const error = ref<string | null>(null);
const notice = ref<string | null>(null);
const busy = ref(false);

const newName = ref('');
const newDescription = ref('');
const showCreate = ref(false);
const uploadSetId = ref<number | null>(null);
const uploadFileList = ref<File[]>([]);

async function reload() {
  sets.value = await api.listSourceSets();
}

onMounted(reload);

async function createSet() {
  if (newName.value.trim().length < 3) return;
  busy.value = true;
  error.value = null;
  try {
    await api.createSourceSet(newName.value.trim(), newDescription.value || undefined);
    newName.value = '';
    newDescription.value = '';
    showCreate.value = false;
    await reload();
    notice.value = 'Cuaderno creado. Ahora agrega sus fuentes.';
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    busy.value = false;
  }
}

function beginUpload(setId: number) {
  uploadSetId.value = uploadSetId.value === setId ? null : setId;
  uploadFileList.value = [];
}

function onFilesChanged(event: Event) {
  const input = event.target as HTMLInputElement;
  uploadFileList.value = Array.from(input.files ?? []);
}

async function upload() {
  if (!uploadSetId.value || uploadFileList.value.length === 0) return;
  busy.value = true;
  error.value = null;
  try {
    await api.uploadSources(uploadSetId.value, uploadFileList.value);
    await reload();
    uploadSetId.value = null;
    notice.value = 'Fuentes agregadas al cuaderno.';
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    busy.value = false;
  }
}

async function removeSource(sourceId: number) {
  busy.value = true;
  error.value = null;
  try {
    await api.deleteSource(sourceId);
    await reload();
    notice.value = 'Fuente eliminada del cuaderno.';
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    busy.value = false;
  }
}

function ext(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'DOC';
}
</script>

<template>
  <div class="page-head">
    <div>
      <h1>Cuadernos de fuentes</h1>
      <p>Material oficial reutilizable entre cursos. La IA genera únicamente con el contexto del cuaderno vinculado.</p>
    </div>
    <button class="btn btn-primary" @click="showCreate = !showCreate">Nuevo cuaderno</button>
  </div>

  <p v-if="error" class="alert-error">{{ error }}</p>
  <p v-if="notice" class="alert-info">{{ notice }}</p>

  <div v-if="showCreate" class="form-card" style="margin-bottom:18px">
    <div class="grid-2">
      <div class="field">
        <label for="set-name">Nombre del cuaderno</label>
        <input id="set-name" v-model="newName" placeholder="Ej.: Keycloak — documentación oficial" />
      </div>
      <div class="field">
        <label for="set-desc">Descripción (opcional)</label>
        <input id="set-desc" v-model="newDescription" />
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" :disabled="busy || newName.trim().length < 3" @click="createSet">Crear</button>
    </div>
  </div>

  <p v-if="sets.length === 0" class="empty">Todavía no hay cuadernos. Crea uno y sube los documentos oficiales.</p>

  <div class="cards" style="grid-template-columns:1fr 1fr">
    <div v-for="set in sets" :key="set.id" class="card" style="gap:0;padding:0">
      <div style="padding:16px 18px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;gap:8px">
        <b>{{ set.name }}</b>
        <span class="chip chip-src">{{ set.sources.length }} fuente(s)</span>
      </div>
      <div v-for="source in set.sources" :key="source.id" class="doc-row">
        <div class="ic">{{ ext(source.filename) }}</div>
        <div class="nm">
          {{ source.filename }}
          <small>{{ formatBytes(source.sizeBytes) }} · {{ new Date(source.createdAt).toLocaleDateString('es-BO') }}</small>
        </div>
        <button class="link-danger" :disabled="busy" @click="removeSource(source.id)">Quitar</button>
      </div>
      <div style="padding:12px 18px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" @click="beginUpload(set.id)">Agregar fuentes</button>
        <template v-if="uploadSetId === set.id">
          <input type="file" multiple accept=".pdf,.pptx,.docx,.txt,.md" @change="onFilesChanged" />
          <button class="btn btn-accent btn-sm" :disabled="busy || uploadFileList.length === 0" @click="upload">
            Subir {{ uploadFileList.length > 0 ? `(${uploadFileList.length})` : '' }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
