import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DateFieldBR from './DateFieldBR.vue';

/**
 * O contrato do componente: o usuário lê e digita dd/mm/aaaa, e o v-model
 * continua entregando "YYYY-MM-DD" ao resto do app (formato que o
 * `<input type="date">` usava e do qual a validação de ordem por string
 * depende).
 */
const mountField = (modelValue = '') => {
  const wrapper = mount(DateFieldBR, {
    props: {
      modelValue,
      // Simula o v-model: reflete de volta o que o componente emite.
      'onUpdate:modelValue': (v) => wrapper.setProps({ modelValue: v }),
    },
  });
  return wrapper;
};

const text = (w) => w.find('.date-field__text');
const emitted = (w) => w.emitted('update:modelValue')?.at(-1)?.[0];

// Digita caractere a caractere, como um usuário — a máscara é aplicada a cada
// tecla, então colar o valor inteiro não exercitaria o mesmo caminho.
async function type(wrapper, chars) {
  const input = text(wrapper);
  let current = input.element.value;
  for (const ch of chars) {
    current += ch;
    input.element.value = current;
    await input.trigger('input');
    current = input.element.value; // a máscara pode ter reescrito
  }
}

describe('DateFieldBR — exibição', () => {
  it('mostra a data recebida em dd/mm/aaaa', () => {
    const w = mountField('2035-03-07');
    expect(text(w).element.value).toBe('07/03/2035');
  });

  it('não confunde dia com mês (o sintoma que motivou o componente)', () => {
    // 2035-01-05 é 5 de janeiro. Em mm/dd/aaaa apareceria como 01/05/2035.
    const w = mountField('2035-01-05');
    expect(text(w).element.value).toBe('05/01/2035');
  });

  it('fica vazio quando não há valor', () => {
    expect(text(mountField('')).element.value).toBe('');
  });

  it('acompanha a mudança do valor externo (formulário sendo preenchido)', async () => {
    const w = mount(DateFieldBR, { props: { modelValue: '' } });
    await w.setProps({ modelValue: '2031-08-25' });
    expect(text(w).element.value).toBe('25/08/2031');
  });

  it('usa placeholder em português', () => {
    expect(text(mountField('')).attributes('placeholder')).toBe('dd/mm/aaaa');
  });
});

describe('DateFieldBR — digitação', () => {
  it('insere as barras sozinho', async () => {
    const w = mountField('');
    await type(w, '07032035');
    expect(text(w).element.value).toBe('07/03/2035');
  });

  it('emite YYYY-MM-DD ao completar a data', async () => {
    const w = mountField('');
    await type(w, '11021999');
    expect(emitted(w)).toBe('1999-02-11');
  });

  it('descarta letras e pontuação', async () => {
    const w = mountField('');
    await type(w, 'a0b7/c03-2035');
    expect(text(w).element.value).toBe('07/03/2035');
    expect(emitted(w)).toBe('2035-03-07');
  });

  it('não passa de 8 dígitos', async () => {
    const w = mountField('');
    await type(w, '070320359999');
    expect(text(w).element.value).toBe('07/03/2035');
  });

  it('emite vazio enquanto a data está incompleta', async () => {
    const w = mountField('');
    await type(w, '0703');
    expect(emitted(w)).toBe('');
  });
});

describe('DateFieldBR — datas inexistentes', () => {
  it('marca 31/02 como inválida e não emite valor', async () => {
    const w = mountField('');
    await type(w, '31022035');
    expect(w.find('.date-field').classes()).toContain('date-field--invalid');
    expect(emitted(w)).toBe('');
  });

  it('recusa mês 13', async () => {
    const w = mountField('');
    await type(w, '01132035');
    expect(emitted(w)).toBe('');
    expect(w.find('.date-field').classes()).toContain('date-field--invalid');
  });

  it('aceita 29/02 em ano bissexto e recusa em ano comum', async () => {
    const bissexto = mountField('');
    await type(bissexto, '29022032'); // 2032 é bissexto
    expect(emitted(bissexto)).toBe('2032-02-29');

    const comum = mountField('');
    await type(comum, '29022035'); // 2035 não é
    expect(emitted(comum)).toBe('');
  });

  it('não acusa erro no meio da digitação', async () => {
    const w = mountField('');
    await type(w, '3');
    expect(w.find('.date-field').classes()).not.toContain('date-field--invalid');
  });
});

describe('DateFieldBR — teclas de seta', () => {
  it('ArrowUp avança um dia', async () => {
    const w = mountField('2035-01-05');
    await text(w).trigger('keydown', { key: 'ArrowUp' });
    expect(emitted(w)).toBe('2035-01-06');
    expect(text(w).element.value).toBe('06/01/2035');
  });

  it('ArrowDown volta um dia, atravessando o mês', async () => {
    const w = mountField('2035-03-01');
    await text(w).trigger('keydown', { key: 'ArrowDown' });
    expect(emitted(w)).toBe('2035-02-28');
  });

  it('sem data, as setas não fazem nada', async () => {
    const w = mountField('');
    await text(w).trigger('keydown', { key: 'ArrowUp' });
    expect(w.emitted('update:modelValue')).toBeUndefined();
  });
});

describe('DateFieldBR — calendário do sistema', () => {
  it('converte a escolha do input nativo para dd/mm/aaaa', async () => {
    const w = mountField('');
    const native = w.find('.date-field__native');
    native.element.value = '2028-12-25';
    await native.trigger('change');
    expect(emitted(w)).toBe('2028-12-25');
    expect(text(w).element.value).toBe('25/12/2028');
  });

  it('o campo nativo fica fora da navegação por teclado', () => {
    const native = mountField('').find('.date-field__native');
    expect(native.attributes('tabindex')).toBe('-1');
    expect(native.attributes('aria-hidden')).toBe('true');
  });
});

describe('DateFieldBR — desabilitado', () => {
  it('propaga disabled para o texto e para o botão', () => {
    const w = mount(DateFieldBR, { props: { modelValue: '2035-01-05', disabled: true } });
    expect(text(w).attributes('disabled')).toBeDefined();
    expect(w.find('.date-field__btn').attributes('disabled')).toBeDefined();
  });
});
