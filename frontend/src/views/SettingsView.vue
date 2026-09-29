<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { settings as api } from '../api';

interface AiStatus {
  provider: string;
  model: string;
  modelSource: string;
  geminiConfigured: boolean;
  maskedKey: string | null;
  forceMock: boolean;
}

const status = ref<AiStatus | null>(null);
const apiKey = ref('');
const error = ref<string | null>(null);
const notice = ref<string | null>(null);
const busy = ref(false);
const testResult = ref<{ ok: boolean; message: string } | null>(null);
const availableModels = ref<string[]>([]);
const selectedModel = ref('');

async function loadStatus() {
  status.value = await api.status();
  selectedModel.value = status.value.modelSource === 'configuracion' ? status.value.model : '';
  if (status.value.geminiConfigured) {
    const list = await api.models();
    availableModels.value = list.models;
  }
}

onMounted(async () => {
  try {
    await loadStatus();
  } catch (e) {
    error.value = (e as Error).message;
  }
});

async function save() {
  error.value = null;
  notice.value = null;
  busy.value = true;
  try {
    status.value = await api.update({
      geminiApiKey: apiKey.value.trim() === '' ? null : apiKey.value.trim(),
    });
    apiKey.value = '';
    notice.value = 'API key guardada de forma segura (en la base de datos, nunca en el código).';
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    busy.value = false;
  }
}

async function saveModel() {
  busy.value = true;
  error.value = null;
  notice.value = null;
  try {
    status.value = await api.update({
      geminiModel: selectedModel.value.trim() === '' ? null : selectedModel.value.trim(),
    });
    notice.value = status.value.modelSource === 'configuracion'
      ? 'Modelo guardado: ' + status.value.model
      : 'Modelo restablecido al predeterminado: ' + status.value.model;
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    busy.value = false;
  }
}

async function clearKey() {
  busy.value = true;
  error.value = null;
  notice.value = null;
  try {
    status.value = await api.update({ geminiApiKey: null });
    notice.value = 'API key eliminada.';
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    busy.value = false;
  }
}

async function toggleMock() {
  if (!status.value) return;
  busy.value = true;
  error.value = null;
  notice.value = null;
  try {
    status.value = await api.update({ forceMock: !status.value.forceMock });
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    busy.value = false;
  }
}

async function testConnection() {
  busy.value = true;
  testResult.value = null;
  try {
    testResult.value = await api.test();
  } catch (e) {
    testResult.value = { ok: false, message: (e as Error).message };
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div class="page-head">
    <div>
      <h1>Configuración</h1>
      <p>Proveedor de inteligencia artificial del Campus.</p>
    </div>
  </div>

  <p v-if="error" class="alert-error">{{ error }}</p>
  <p v-if="notice" class="alert-info">{{ notice }}</p>

  <div class="form-card" style="max-width:640px">
    <div class="summary-bar" style="margin-bottom:16px;border:none;padding:0">
      <div class="stat"><b>{{ status?.provider === 'gemini' ? 'Gemini (IA real)' : 'Simulado (mock)' }}</b>proveedor activo</div>
      <div class="stat"><b>{{ status?.geminiConfigured ? status?.maskedKey : 'sin configurar' }}</b>API key de Gemini</div>
      <div class="stat"><b>{{ status?.model }}</b>modelo</div>
    </div>

    <div class="alert-info">
      Sin API key configurada, la generación usa el modo simulado (determinista, sin costo).
      Al guardar una key real de <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a>,
      la generación de cursos, el banco de preguntas, las variantes y la calificación usan la IA real.
      La key se guarda cifrada en tránsito, en la base de datos institucional, y nunca se muestra completa ni se expone en el código.
    </div>

    <div class="field">
      <label for="api-key">API key de Gemini</label>
      <input id="api-key" v-model="apiKey" type="password" placeholder="AIza..." autocomplete="off" />
      <span class="hint">Déjalo vacío y presiona Guardar para eliminar la key actual.</span>
    </div>

    <div class="form-actions" style="justify-content:flex-start;gap:10px;flex-wrap:wrap">
      <button class="btn btn-primary" :disabled="busy || apiKey.trim().length === 0" @click="save">Guardar key</button>
      <button class="btn btn-ghost" :disabled="busy || !status?.geminiConfigured" @click="clearKey">Eliminar key</button>
      <button class="btn btn-accent" :disabled="busy || !status?.geminiConfigured" @click="testConnection">Probar conexión</button>
    </div>

    <div class="field" style="margin-top:8px">
      <label for="model">Modelo de Gemini</label>
      <select id="model" v-model="selectedModel" :disabled="busy || availableModels.length === 0">
        <option value="">Predeterminado ({{ status?.modelSource === 'predeterminado' ? status.model : 'gemini-flash-latest' }})</option>
        <option v-for="m in availableModels" :key="m" :value="m">{{ m }}</option>
      </select>
      <span class="hint">
        Lista real de modelos disponibles para tu key. El predeterminado (gemini-flash-latest) siempre apunta al Flash vigente.
        Modelo activo: {{ status?.model }}.
      </span>
    </div>
    <div class="form-actions" style="justify-content:flex-start">
      <button class="btn btn-primary" :disabled="busy || availableModels.length === 0" @click="saveModel">Guardar modelo</button>
    </div>

    <div v-if="testResult" class="alert-info" style="margin-top:14px" :style="testResult.ok ? '' : 'background:#fdeeec;border-color:#e5c1bb;color:#8c2f22'">
      {{ testResult.ok ? 'Conexión exitosa con Gemini: ' : 'No se pudo conectar: ' }}{{ testResult.message }}
    </div>

    <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--line)">
      <label style="display:flex;align-items:center;gap:10px;font-weight:600;cursor:pointer">
        <input type="checkbox" :checked="status?.forceMock" :disabled="busy" @change="toggleMock" />
        Forzar modo simulado (útil para pruebas sin consumo de la API)
      </label>
    </div>
  </div>
</template>
