<template>
  <div class="student-card">

    <!-- ── Bloco de informações (Avatar + Nome/RA + Tags) ─────────── -->
    <div class="student-info">

      <!-- Avatar: foto real ou círculo com iniciais -->
      <img
        v-if="student.avatarUrl"
        :src="student.avatarUrl"
        :alt="`Foto de ${student.name}`"
        class="profile-img"
      />
      <div v-else class="avatar-initials" :style="{ backgroundColor: avatarColor }">
        {{ initials }}
      </div>

      <!-- Nome e RA -->
      <div class="details-column">
        <p class="student-name">{{ student.name }}</p>
        <span class="student-ra">RA: {{ student.ra ?? student.id ?? '—' }}</span>
      </div>

      <!-- Tags (máx 3 + chip "+X") -->
      <div class="tags-column">
        <div class="registered-tags">
          <span
            v-for="(tag, i) in visibleTags"
            :key="tag"
            class="tag"
            :class="`tag-color-${(i % 3) + 1}`"
          >
            {{ tag }}
          </span>
          <span v-if="extraCount > 0" class="tag tag-extra">
            +{{ extraCount }}
          </span>
        </div>
      </div>

    </div>

    <!-- ── Botão de ação ──────────────────────────────────────────── -->
    <div class="action-column">
      <button class="ver-perfil-btn" @click="$emit('ver-perfil', student)">
        Ver Perfil
      </button>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  student: {
    type: Object,
    required: true,
  },
})

defineEmits(['ver-perfil'])

const MAX_TAGS = 3

// ── Iniciais para o avatar fallback ───────────────────────────────
const initials = computed(() => {
  const parts = (props.student.name ?? '').trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})

// Gera uma cor de fundo determinística a partir do nome (sempre igual para o mesmo aluno)
const avatarColor = computed(() => {
  const COLORS = ['#4c1d95', '#065f8b', '#1d4a20', '#7c2d12', '#1e3a5f', '#5b21b6']
  let hash = 0
  for (const ch of props.student.name ?? '') hash = ch.charCodeAt(0) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
})

// ── Lógica de tags ────────────────────────────────────────────────
const allTags = computed(() => props.student.tags ?? [])
const visibleTags = computed(() => allTags.value.slice(0, MAX_TAGS))
const extraCount  = computed(() => Math.max(0, allTags.value.length - MAX_TAGS))
</script>

<style scoped>
/* ── Container principal — espelha .professor-card ─────────────── */
.student-card {
  background-color: var(--white-color, #fff);
  width: 100%;
  min-height: 7rem;
  border-bottom: 2px solid var(--color-border-default, #e0e0e0);
  padding: 1.5rem 2rem;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  box-sizing: border-box;
}

/* ── Bloco de informações ────────────────────────────────────────── */
.student-info {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
}

/* ── Avatar: foto ────────────────────────────────────────────────── */
.profile-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

/* ── Avatar: iniciais (fallback) ─────────────────────────────────── */
.avatar-initials {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.04em;
  user-select: none;
}

/* ── Coluna de Nome e RA ─────────────────────────────────────────── */
.details-column {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 160px;
}

.student-name {
  margin: 0;
  font-weight: 600;
  font-size: 1.05rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.student-ra {
  font-size: 0.78rem;
  font-weight: 500;
  color: #888;
  letter-spacing: 0.02em;
}

/* ── Coluna de Tags ──────────────────────────────────────────────── */
.tags-column {
  flex: 1;
  display: flex;
  align-items: center;
}

.registered-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Chip base — espelha .tag do ProfessorCard */
.tag {
  height: 28px;
  border-radius: 1rem;
  font-weight: 700;
  font-style: italic;
  font-size: 0.65rem;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

/* Paleta igual ao ProfessorCard (3 cores rotativas) */
.tag-color-1 {
  background-color: var(--color-tag1, #e3f2fd);
  color: var(--color-tag1-darker, #1565c0);
  border: 1px solid var(--color-tag1-darker, #1565c0);
}
.tag-color-2 {
  background-color: var(--color-tag2, #f3e5f5);
  color: var(--color-tag2-darker, #6a1b9a);
  border: 1px solid var(--color-tag2-darker, #6a1b9a);
}
.tag-color-3 {
  background-color: var(--color-tag3, #e8f5e9);
  color: var(--color-tag3-darker, #2e7d32);
  border: 1px solid var(--color-tag3-darker, #2e7d32);
}

/* Chip "+X" — neutro para não confundir com área real */
.tag-extra {
  background-color: #f0f0f0;
  color: #555;
  border: 1px solid #bbb;
  font-style: normal;
  font-weight: 600;
}

/* ── Botão de ação — espelha .send-request-btn do ProfessorCard ─── */
.action-column {
  flex-shrink: 0;
}

.ver-perfil-btn {
  display: flex;
  width: 10rem;
  height: 2.625rem;
  background-color: var(--color-status-neutral, #f5f5f5);
  color: var(--color-text-neutral, #333);
  border: 2px solid var(--color-border-default, #ccc);
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease, background-color 0.2s ease;
  justify-content: center;
  align-items: center;
}

.ver-perfil-btn:hover {
  opacity: 0.8;
  background-color: #e0e0e0;
}

/* ── Responsividade ─────────────────────────────────────────────── */
@media (max-width: 900px) {
  .student-info {
    flex-wrap: wrap;
    gap: 1rem;
  }
  .tags-column {
    min-width: 100%;
  }
}

@media (max-width: 600px) {
  .student-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.5rem;
  }
  .student-info {
    width: 100%;
  }
  .action-column {
    width: 100%;
  }
  .ver-perfil-btn {
    width: 100%;
  }
}
</style>
