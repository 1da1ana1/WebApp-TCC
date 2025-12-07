<template>
  <div class="public-info-container">
    <section class="hero-section">
      <h1>Bem-vindo ao Portal de TCC da FT</h1>
      <p>Gerenciamento de Trabalhos de Conclusão de Curso</p>
    </section>

    <section class="info-content">
      <div class="card-info">
        <h2>📄 Documentos</h2>
        <p>Acesse os manuais, modelos de pré-projeto e normas da ABNT.</p>
        <button class="btn-public">Ver Documentos</button>
      </div>

      <div class="card-info">
        <h2>📅 Cronograma</h2>
        <p>Fique atento às datas de entrega das bancas e relatórios finais.</p>
        <button class="btn-public">Ver Datas</button>
      </div>

      <div class="card-info">
        <h2>🎓 Sobre o TCC</h2>
        <p>Entenda como funciona o processo de orientação e avaliação.</p>
        <button class="btn-public">Saiba Mais</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.public-info-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: var(--background-color, #f5f5f5);
  min-height: 80vh;
}

.hero-section {
  text-align: center;
  margin-bottom: 3rem;
}

.hero-section h1 {
  color: var(--color-brand-primary, #004b86);
  font-size: 2.5rem;
}

.info-content {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.card-info {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 300px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-align: center;
}

.btn-public {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-brand-primary, #004b86);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>