<template>
  <div class="view-whitelist">
    <h2 class="view-title">Lista de acesso (Whitelist)</h2>

    <p class="intro-text">
      Importe um arquivo <strong>.csv</strong> com os e-mails autorizados a acessar o sistema.
      Cada linha deve conter o e-mail e o papel (<code>Student</code> ou <code>Teacher</code>).
    </p>

    <!-- Alertas inline — espelham o retorno da API mesmo depois do toast sumir -->
    <div v-if="successMessage" class="alert-feedback alert-success">
      <i class="bi bi-check-circle-fill"></i> {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="alert-feedback alert-error">
      <i class="bi bi-x-circle-fill"></i> {{ errorMessage }}
    </div>

    <section class="upload-section">
      <h3 class="section-subtitle">Selecionar arquivo</h3>

      <!-- Dropzone / seletor: aceita SOMENTE .csv -->
      <div
        class="dropzone"
        :class="{ 'is-dragover': isDragover, 'has-file': !!selectedFile }"
        @dragover.prevent="isDragover = true"
        @dragleave.prevent="isDragover = false"
        @drop.prevent="onDrop"
        @click="fileInput?.click()"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".csv,text/csv"
          class="hidden-input"
          @change="onFileChange"
        />

        <template v-if="!selectedFile">
          <i class="bi bi-filetype-csv dropzone-icon"></i>
          <p class="dropzone-title">Arraste o arquivo aqui ou clique para selecionar</p>
          <p class="dropzone-hint">Apenas arquivos .csv</p>
        </template>

        <template v-else>
          <i class="bi bi-file-earmark-check dropzone-icon file-ok"></i>
          <p class="dropzone-title">{{ selectedFile.name }}</p>
          <p class="dropzone-hint">{{ formatSize(selectedFile.size) }}</p>
          <button class="btn-clear-file" @click.stop="clearFile">
            <i class="bi bi-x-lg"></i> Remover
          </button>
        </template>
      </div>

      <div class="action-row right mt-3">
        <button
          class="btn-confirm"
          :disabled="!selectedFile || isUploading"
          @click="submit"
        >
          <span v-if="isUploading">
            <i class="bi bi-arrow-repeat spinner-icon"></i> Importando...
          </span>
          <span v-else>
            <i class="bi bi-cloud-upload"></i> Importar lista
          </span>
        </button>
      </div>
    </section>

    <!-- Detalhe das linhas rejeitadas (quando houver) -->
    <section v-if="rejections.length" class="rejections-section">
      <div class="section-divider"></div>
      <h3 class="section-subtitle">Linhas descartadas ({{ rejections.length }})</h3>
      <ul class="rejections-list custom-scrollbar">
        <li v-for="(rej, i) in rejections" :key="i">
          <span class="rej-line">Linha {{ rej.line }}</span>
          <span class="rej-reason">{{ rej.reason }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Swal from 'sweetalert2'
import { uploadWhitelist } from '@/services/api'

const fileInput = ref(null)
const selectedFile = ref(null)
const isDragover = ref(false)
const isUploading = ref(false)

const successMessage = ref('')
const errorMessage = ref('')
const rejections = ref([])

// Toast reutilizável no canto superior (padrão do resto do painel).
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 4000,
  timerProgressBar: true,
})

function isCsv(file) {
  if (!file) return false
  const name = (file.name || '').toLowerCase()
  return name.endsWith('.csv') || file.type === 'text/csv'
}

function setFile(file) {
  if (!isCsv(file)) {
    errorMessage.value = 'Formato inválido. Selecione um arquivo .csv.'
    Toast.fire({ icon: 'error', title: 'Apenas arquivos .csv são aceitos.' })
    return
  }
  errorMessage.value = ''
  successMessage.value = ''
  rejections.value = []
  selectedFile.value = file
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (file) setFile(file)
}

function onDrop(e) {
  isDragover.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) setFile(file)
}

function clearFile() {
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function submit() {
  if (!selectedFile.value || isUploading.value) return

  isUploading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  rejections.value = []

  try {
    const result = await uploadWhitelist(selectedFile.value)
    // O back devolve { success, importedCount, skippedCount, message, rejections }
    successMessage.value = result.message
    rejections.value = result.rejections || []

    Toast.fire({
      icon: result.skippedCount > 0 ? 'warning' : 'success',
      title: `${result.importedCount} usuário(s) importado(s)`,
      text: result.message,
    })

    clearFile()
  } catch (err) {
    // 403 → coordenador apenas; 400 → arquivo inválido; demais → genérico.
    const status = err.response?.status
    const apiMessage = err.response?.data?.message
    const message =
      status === 403
        ? 'Acesso restrito: apenas o coordenador pode importar a lista.'
        : Array.isArray(apiMessage)
          ? apiMessage.join(' ')
          : apiMessage || 'Falha ao importar o arquivo. Verifique o formato do CSV.'

    errorMessage.value = message
    Toast.fire({ icon: 'error', title: 'Falha na importação', text: message })
  } finally {
    isUploading.value = false
  }
}
</script>

<style scoped>
@import './panelStyles.css';

.intro-text {
  color: #555;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  text-align: center;
}

.intro-text code {
  background: #f0f2f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #065f8b;
}

/* --- ALERTAS DE FEEDBACK (mesmo visual do VacanciesPanel) --- */
.alert-feedback {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.alert-success {
  background-color: #e6f7ee;
  color: #1e7e46;
  border: 1px solid #b7e4c7;
}

.alert-error {
  background-color: #fdecec;
  color: #c0392b;
  border: 1px solid #f5c6cb;
}

/* --- DROPZONE --- */
.dropzone {
  border: 2px dashed #d0d7de;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafbfc;
}

.dropzone:hover,
.dropzone.is-dragover {
  border-color: var(--color-brand-primary, #065f8b);
  background: #f0f7ff;
}

.dropzone.has-file {
  border-style: solid;
  border-color: #b7e4c7;
  background: #f5fbf7;
}

.hidden-input {
  display: none;
}

.dropzone-icon {
  font-size: 3rem;
  color: #bdbdbd;
}

.dropzone-icon.file-ok {
  color: #53b57c;
}

.dropzone-title {
  font-weight: 600;
  color: #333;
  margin-top: 0.75rem;
  word-break: break-all;
}

.dropzone-hint {
  font-size: 0.85rem;
  color: #999;
  margin-top: 0.25rem;
}

.btn-clear-file {
  margin-top: 1rem;
  background: none;
  border: 1px solid #f5c6cb;
  color: #c0392b;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-family: 'Poppins', sans-serif;
  transition: all 0.2s;
}

.btn-clear-file:hover {
  background: #fdecec;
}

.spinner-icon {
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* --- LISTA DE REJEIÇÕES --- */
.rejections-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 220px;
  overflow-y: auto;
}

.rejections-list li {
  display: flex;
  gap: 1rem;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.88rem;
}

.rej-line {
  font-weight: 600;
  color: #c0392b;
  flex-shrink: 0;
  min-width: 80px;
}

.rej-reason {
  color: #555;
}
</style>
