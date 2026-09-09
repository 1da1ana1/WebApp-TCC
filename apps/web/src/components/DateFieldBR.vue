<template>
  <div class="date-field" :class="{ 'date-field--invalid': invalid, 'date-field--disabled': disabled }">
    <input
      type="text"
      class="date-field__text"
      inputmode="numeric"
      autocomplete="off"
      placeholder="dd/mm/aaaa"
      maxlength="10"
      :value="display"
      :disabled="disabled"
      :aria-label="ariaLabel"
      :aria-invalid="invalid || undefined"
      @input="onInput"
      @blur="onBlur"
      @keydown="onKeydown"
    />

    <button
      type="button"
      class="date-field__btn"
      :disabled="disabled"
      :aria-label="`Abrir calendário${ariaLabel ? ' — ' + ariaLabel : ''}`"
      @click="openPicker"
    >
      <i class="bi bi-calendar" aria-hidden="true"></i>
    </button>

    <!-- Campo nativo só para o seletor de calendário do sistema. Fica fora do
         fluxo visual e da navegação por teclado; quem o usuário vê e edita é o
         campo de texto acima. -->
    <input
      ref="nativeEl"
      type="date"
      class="date-field__native"
      :value="modelValue || ''"
      :disabled="disabled"
      tabindex="-1"
      aria-hidden="true"
      @change="onNativeChange"
    />
  </div>
</template>

<script setup>
/**
 * Campo de data no formato brasileiro (dd/mm/aaaa).
 *
 * Motivo de existir: o `<input type="date">` nativo exibe a data no formato do
 * NAVEGADOR do usuário — quem estiver com a interface em inglês vê mm/dd/aaaa,
 * e a página não pode mudar isso. O atributo `lang` não é respeitado pelo
 * Chromium para esse controle, então não há solução via HTML/CSS.
 *
 * A solução é exibir e editar a data num campo de texto controlado por nós, e
 * manter o `type="date"` escondido apenas para abrir o calendário do sistema.
 *
 * Contrato com o restante do app: o v-model continua sendo "YYYY-MM-DD" (ou ""
 * quando vazio/incompleto), o mesmo formato que o `<input type="date">` usava.
 * Assim as comparações de ordem por string (`fim < inicio`) seguem valendo.
 */
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  ariaLabel: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

const nativeEl = ref(null);
const display = ref('');
const invalid = ref(false);

// "YYYY-MM-DD" → "dd/mm/aaaa"
function isoToBr(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

// Rejeita datas que não existem no calendário (31/02, 30/02, mês 13...).
function isRealDate(d, m, y) {
  if (m < 1 || m > 12 || d < 1 || y < 1) return false;
  const probe = new Date(Date.UTC(y, m - 1, d));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d;
}

// "dd/mm/aaaa" → "YYYY-MM-DD", ou "" se incompleta/inexistente.
function brToIso(br) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br);
  if (!m) return '';
  const [dd, mm, yyyy] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (!isRealDate(dd, mm, yyyy)) return '';
  return `${m[3]}-${m[2]}-${m[1]}`;
}

// Insere as barras conforme se digita, aceitando só dígitos.
function mask(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

// O valor externo manda: mantém o campo em sincronia quando o formulário é
// preenchido com o cronograma já salvo, ou limpo pelo botão "Limpar".
watch(
  () => props.modelValue,
  (iso) => {
    if (brToIso(display.value) === (iso ?? '')) return; // já reflete o valor
    display.value = isoToBr(iso);
    invalid.value = false;
  },
  { immediate: true },
);

function onInput(event) {
  const masked = mask(event.target.value);
  display.value = masked;
  // O <input> é controlado por `display`; sem reatribuir, um caractere
  // rejeitado pela máscara continuaria visível até o próximo render.
  event.target.value = masked;

  const iso = brToIso(masked);
  // Enquanto a data está incompleta não marcamos erro — só quando o usuário
  // já digitou os 8 dígitos e eles não formam uma data real.
  invalid.value = masked.length === 10 && iso === '';
  emit('update:modelValue', iso);
}

function onBlur() {
  // Deixou pela metade: limpa, para não guardar "12/0" na tela sem valor por trás.
  if (display.value.length > 0 && display.value.length < 10) {
    display.value = isoToBr(props.modelValue);
    invalid.value = false;
  }
}

function onKeydown(event) {
  // Setas para cima/baixo somam ou subtraem um dia, como no campo nativo.
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
  const iso = brToIso(display.value);
  if (!iso) return;
  event.preventDefault();
  const base = new Date(`${iso}T00:00:00.000Z`);
  base.setUTCDate(base.getUTCDate() + (event.key === 'ArrowUp' ? 1 : -1));
  const next = base.toISOString().slice(0, 10);
  display.value = isoToBr(next);
  invalid.value = false;
  emit('update:modelValue', next);
}

function openPicker() {
  const el = nativeEl.value;
  if (!el) return;
  // showPicker() é o caminho suportado (Chrome 99+, Firefox 101+, Safari 16+);
  // onde não existir, o clique no próprio campo abre o calendário.
  if (typeof el.showPicker === 'function') {
    try {
      el.showPicker();
      return;
    } catch {
      // showPicker() lança se o elemento não estiver visível o suficiente;
      // cai no clique abaixo.
    }
  }
  el.click();
}

function onNativeChange(event) {
  const iso = event.target.value; // sempre "YYYY-MM-DD"
  display.value = isoToBr(iso);
  invalid.value = false;
  emit('update:modelValue', iso);
}
</script>

<style scoped>
.date-field {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border: 2px solid #aabcfc;
  border-radius: 6px;
  padding: 6px 8px 6px 12px;
  width: 180px;
  background: #fff;
}

.date-field--invalid {
  border-color: #c0392b;
}

.date-field--disabled {
  background: #f4f4f4;
}

.date-field__text {
  border: none;
  outline: none;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  color: #333;
  width: 100%;
  min-width: 0;
  background: transparent;
}

.date-field__text::placeholder {
  color: #999;
}

.date-field__btn {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0 2px;
  color: #666;
  display: flex;
  align-items: center;
  font-size: 0.95rem;
}

.date-field__btn:hover:not(:disabled) {
  color: #065f8b;
}

.date-field__btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Ancorado ao canto do botão para o calendário do sistema abrir junto dele,
   sem ocupar espaço nem receber foco. */
.date-field__native {
  position: absolute;
  right: 8px;
  bottom: 0;
  width: 1px;
  height: 1px;
  padding: 0;
  border: 0;
  opacity: 0;
  pointer-events: none;
}
</style>
