<template>
  <div class="view-transfer">
    <h2 class="view-title">Transferência de coordenação</h2>

    <p class="intro-text">
      Transfira o papel de <strong>Coordenador</strong> para outro docente ("passagem de bastão").
      Ao confirmar, <strong>você perderá o acesso administrativo imediatamente</strong> e voltará a
      ser um docente comum — será necessário entrar novamente.
    </p>

    <section class="transfer-box">
      <h3 class="section-subtitle">Novo coordenador</h3>

      <div v-if="loading" class="empty-list-state">
        <i class="bi bi-arrow-repeat spinner-icon"></i>
        <span>Carregando docentes...</span>
      </div>

      <template v-else>
        <div class="form-group mb-4">
          <label class="field-label" for="target-teacher">Selecione o docente</label>
          <select
            id="target-teacher"
            v-model="selectedId"
            class="modal-select"
            :disabled="isTransferring || eligibleTeachers.length === 0"
          >
            <option :value="null" disabled>— escolha um docente —</option>
            <option v-for="t in eligibleTeachers" :key="t.id" :value="t.id">
              {{ t.user?.name || 'Docente #' + t.id }} ({{ t.user?.email || 's/ e-mail' }})
            </option>
          </select>
          <p v-if="eligibleTeachers.length === 0" class="hint-empty">
            Nenhum docente elegível encontrado.
          </p>
        </div>

        <div class="action-row right">
          <button
            class="btn-action btn-danger"
            :disabled="!selectedId || isTransferring"
            @click="confirmTransfer"
          >
            <span v-if="isTransferring">
              <i class="bi bi-arrow-repeat spinner-icon"></i> Transferindo...
            </span>
            <span v-else>
              <i class="bi bi-arrow-left-right"></i> Transferir coordenação
            </span>
          </button>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { getTeachers, transferCoordination } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const teachers = ref([])
const selectedId = ref(null)
const loading = ref(true)
const isTransferring = ref(false)

// Não faz sentido transferir para quem já é coordenador (nem para si mesmo,
// que já é o coordenador logado).
const eligibleTeachers = computed(() =>
  teachers.value.filter((t) => !t.isCoordinator),
)

const selectedTeacher = computed(() =>
  teachers.value.find((t) => t.id === selectedId.value) || null,
)

onMounted(async () => {
  try {
    teachers.value = await getTeachers()
  } catch (err) {
    console.error('[Transfer] falha ao carregar docentes:', err)
    Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível carregar os docentes.' })
  } finally {
    loading.value = false
  }
})

async function confirmTransfer() {
  if (!selectedTeacher.value) return

  const name = selectedTeacher.value.user?.name || `Docente #${selectedTeacher.value.id}`

  // Modal de confirmação — ação irreversível na sessão atual.
  const { isConfirmed } = await Swal.fire({
    icon: 'warning',
    title: 'Confirmar transferência?',
    html:
      `Você está prestes a transferir a coordenação para <strong>${name}</strong>.<br><br>` +
      'Esta ação é <strong>imediata</strong>: você perderá o acesso de coordenador ' +
      'e será desconectado.',
    showCancelButton: true,
    confirmButtonText: 'Sim, transferir',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc3545',
    reverseButtons: true,
    focusCancel: true,
  })

  if (!isConfirmed) return

  isTransferring.value = true
  try {
    await transferCoordination(selectedId.value)

    // Sucesso: derruba a sessão atual (token agora é de um TEACHER) e força
    // o usuário a reautenticar para obter um novo token e perder as views admin.
    await Swal.fire({
      icon: 'success',
      title: 'Coordenação transferida',
      text: `${name} agora é o coordenador. Você será desconectado.`,
      timer: 2500,
      showConfirmButton: false,
    })

    authStore.logout()
    // Redireciona para o login. `replace` evita voltar às telas admin com o
    // histórico; a nova sessão precisa de um novo token.
    router.replace('/dev-login')
  } catch (err) {
    const status = err.response?.status
    const apiMessage = err.response?.data?.message
    const message =
      status === 403
        ? 'Apenas o coordenador atual pode transferir a coordenação.'
        : Array.isArray(apiMessage)
          ? apiMessage.join(' ')
          : apiMessage || 'Falha ao transferir a coordenação. Tente novamente.'
    Swal.fire({ icon: 'error', title: 'Falha na transferência', text: message })
    isTransferring.value = false
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
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
}

.transfer-box {
  max-width: 560px;
  margin: 0 auto;
}

.btn-danger {
  background-color: #dc3545;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c0392b;
}

.btn-danger:disabled {
  background-color: #e0a4a9;
  cursor: not-allowed;
}

.hint-empty {
  color: #999;
  font-size: 0.85rem;
  margin-top: 0.5rem;
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
</style>
