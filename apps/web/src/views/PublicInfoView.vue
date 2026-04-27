<template>
  <div class="page-container">
    <nav id="side-menu">
      <ul id="side-menu-ul">
        <li class="side-menu-li" :class="{ active: isActive('section-1') }" @click="scrollToSection('section-1')">
          <span>TCC para BSI e TADS</span>
          <i class="bi bi-chevron-compact-right"></i>
        </li>

        <li class="side-menu-li" :class="{ active: isActive('section-2') }" @click="scrollToSection('section-2')">
          <span>Como usar a Plataforma</span>
          <i class="bi bi-chevron-compact-right"></i>
        </li>

        <li class="side-menu-li" :class="{ active: isActive('section-3') }" @click="scrollToSection('section-3')">
          <span>Links e Regulamentos</span>
          <i class="bi bi-chevron-compact-right"></i>
        </li>
      </ul>
    </nav>

    <main class="content-area">
      <section id="section-1" class="info-section">
        <div class="glass-card">
          <h2>Vou fazer TCC, e agora?</h2>
          <p class="intro-text">
            O Trabalho de Conclusão de Curso (TCC) para os cursos de <strong>Bacharelado em Sistemas de Informação (BSI)</strong> e <strong>Tecnologia em Análise e Desenvolvimento de Sistemas (TADS)</strong> é uma atividade individual de síntese, integração e aplicação de conhecimentos científicos ou tecnológicos.
          </p>
          
          <div class="rules-grid">
            <div class="rule-box">
              <h4><i class="bi bi-journal-text"></i> Modalidades e Formatos</h4>
              <p>O TCC pode ser desenvolvido em três modalidades principais: estudos experimentais aplicados, estudo teórico (revisão de literatura) ou aplicação técnica. O resultado final deve ser entregue em um dos seguintes formatos:</p>
              <ul>
                <li><strong>Artigo Científico:</strong> Mínimo de 5 páginas.</li>
                <li><strong>Relatório Técnico:</strong> Descritivo de software, contendo projeto e diagramas, ou patente.</li>
                <li><strong>Dissertação:</strong> Texto em prosa com linguagem científica formal.</li>
              </ul>
            </div>

            <div class="rule-box">
              <h4><i class="bi bi-diagram-3"></i> Fases de Avaliação</h4>
              <p>O processo é dividido em duas fases essenciais:</p>
              <ul>
                <li><strong>1. Desenvolvimento:</strong> Desde a organização do plano de trabalho até o relatório parcial. A avaliação desta fase é feita exclusivamente pelo seu Orientador.</li>
                <li><strong>2. Conclusão:</strong> Da produção da monografia até a apresentação. A avaliação é realizada por um comitê (Banca) composto pelo seu orientador e mais dois docentes convidados.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="section-2" class="info-section">
        <div class="glass-card">
          <h2>Como usar a Plataforma de TCC</h2>
          <p class="subtitle">Este sistema foi criado para facilitar a sua busca por orientadores e garantir uma distribuição justa de vagas no nosso instituto.</p>

          <ul class="custom-list">
            <li>
              <strong>1. Autenticação Segura:</strong> Faça o login utilizando o botão no menu superior. Você será redirecionado para a autenticação centralizada da UNICAMP (Senha Única).
            </li>
            <li>
              <strong>2. Busque por Áreas de Interesse:</strong> Utilize a aba "Buscar Orientador". Você pode filtrar docentes por palavras-chave (tags) como <em>Inteligência Artificial</em>, <em>Engenharia de Software</em> ou buscar diretamente pelo nome.
            </li>
            <li>
              <strong>3. Verifique as Vagas:</strong> Antes de solicitar, o sistema exibirá claramente se o professor possui vagas disponíveis para o semestre atual.
            </li>
            <li>
              <strong>4. Envie sua Solicitação:</strong> Clique em "Solicitar Orientação" no perfil do professor escolhido. Lembre-se: você só pode ter <strong>uma</strong> solicitação pendente por vez.
            </li>
            <li>
              <strong>5. Acompanhe o Status:</strong> O professor será notificado e poderá Aceitar ou Recusar (com justificativa). Você receberá um e-mail com a resposta. Se aceito, o vínculo é oficializado no sistema!
            </li>
          </ul>

          <div class="schedule-box mt-4">
            <h3><i class="bi bi-calendar3"></i> Prazos do Semestre Atual</h3>
            <p>Abaixo estão as datas oficiais definidas pela Coordenação para a busca de orientadores e entregas. Fique atento, pois o sistema bloqueará solicitações fora do período permitido.</p>
            <CronogramSchedulePublic />
          </div>
        </div>
      </section>

      <section id="section-3" class="info-section">
        <div class="glass-card">
          <h2>Links Úteis, Tutoriais e Regulamento</h2>
          <p>
            Acesse as páginas oficiais da Diretoria Acadêmica (DAC) e da FT para baixar o regulamento completo, formulários necessários para composição de banca e ler os tutoriais de uso do SIGA (para a matrícula oficial).
          </p>
          
          <div class="highlight-doc mb-4">
            <div class="doc-icon"><i class="bi bi-file-earmark-pdf-fill"></i></div>
            <div class="doc-info">
              <h4>Regulamento Oficial do TCC (BSI e TADS)</h4>
              <p>Documento completo aprovado pela Comissão de Graduação com todas as regras, direitos e deveres do aluno e do orientador.</p>
            </div>
            <a href="https://www.ft.unicamp.br/sites/default/files/graduacao/Regulamento_TCC_TADS_BSI.pdf" target="_blank" class="btn-download">
              Ler Regulamento <i class="bi bi-download"></i>
            </a>
          </div>

          <div class="links-grid">
            <a href="https://www.ft.unicamp.br/pt-br/graduacao/tccestagio/tutoriais-tcc" target="_blank" class="resource-card">
              <i class="bi bi-journal-bookmark-fill"></i>
              <div>
                <h4>Tutoriais SIGA</h4>
                <span>Manuais passo a passo para utilizar o sistema SIGA para envio de Planos de Trabalho.</span>
              </div>
            </a>

            <a href="https://www.ft.unicamp.br/pt-br/graduacao/tccestagio/formularios" target="_blank" class="resource-card">
              <i class="bi bi-person-plus-fill"></i>
              <div>
                <h4>Cadastro de Coorientador</h4>
                <span>Formulário oficial para cadastro de coorientador externo.</span>
              </div>
            </a>

            <a href="https://www.ft.unicamp.br/pt-br/graduacao/tccestagio/formularios" target="_blank" class="resource-card">
              <i class="bi bi-people-fill"></i>
              <div>
                <h4>Membro de Banca</h4>
                <span>Formulário para cadastro de membro externo para a banca avaliadora.</span>
              </div>
            </a>

            <a href="https://www.ft.unicamp.br/pt-br/graduacao/tccestagio" target="_blank" class="resource-card">
              <i class="bi bi-info-circle-fill"></i>
              <div>
                <h4>Página Oficial FT</h4>
                <span>Informações gerais institucionais sobre TCC e Estágios.</span>
              </div>
            </a>
          </div>
        </div>
      </section>
    </main>

    <button
      v-show="showBackToTop"
      @click="scrollToTop"
      type="button"
      class="btn btn-danger btn-floating btn-lg"
      id="btn-back-to-top"
    >
      <i class="bi bi-arrow-up"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import CronogramSchedulePublic from '@/components/CronogramSchedulePublic.vue'

const activeSectionId = ref('section-1')

const scrollToSection = (id) => {
  const element = document.getElementById(id)
  if (element) {
    const headerOffset = 100
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
  }
}

const showBackToTop = ref(false)

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 700

  const sections = ['section-1', 'section-2', 'section-3']
  sections.forEach((id) => {
    const element = document.getElementById(id)
    if (element) {
      const rect = element.getBoundingClientRect()
      if (rect.top <= 150 && rect.bottom >= 150) {
        activeSectionId.value = id
      }
    }
  })
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const isActive = (sectionId) => {
  return activeSectionId.value === sectionId
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.page-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background-image: url('@/assets/img/students.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

#side-menu {
  background-color: var(--color-brand-primary, #003366);
  width: 18rem;
  position: fixed;
  left: 0;
  top: var(--header-height);
  height: calc(100vh - var(--header-height));
  display: flex;
  flex-direction: column;
  z-index: 10;
}

#side-menu-ul {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.side-menu-li {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  text-decoration: none;
  list-style: none;
  font-size: 0.975rem;
  font-weight: 500;
  color: var(--color-text-secondary, #ccc);
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}

.side-menu-li:hover {
  color: #fff;
  font-size: 1rem;
}

.side-menu-li:hover i {
  font-size: 1.165rem;
}

.side-menu-li.active {
  background-color: rgba(0, 0, 0, 0.3);
  color: #fff;
  border-left: 4px solid var(--color-brand-secondary, #ffcc00);
}

.content-area {
  margin-left: 18rem;
  width: calc(100% - 18rem);
  padding: 3rem;
  padding-top: 2rem;
}

.info-section {
  margin-bottom: 2.5rem;
}

.glass-card {
  background: var(--color-background-card-default, rgba(255, 255, 255, 0.92));
  backdrop-filter: blur(10px);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: #333;
}

.glass-card h2 {
  color: var(--color-brand-primary, #003366);
  margin-bottom: 1.5rem;
  font-weight: 700;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.intro-text {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

/* Grid para as regras do TCC */
.rules-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.rule-box {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid var(--color-brand-primary, #003366);
}

.rule-box h4 {
  color: var(--color-brand-primary, #003366);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rule-box ul {
  padding-left: 1.2rem;
  margin-top: 0.5rem;
}

.rule-box li {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

/* Lista Customizada - Passo a passo */
.custom-list {
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
}

.custom-list li {
  margin-bottom: 1rem;
  padding: 1rem 1.5rem;
  background: #fff;
  border: 1px solid #e1e5eb;
  border-radius: 8px;
  line-height: 1.5;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}

.schedule-box {
  background-color: #e9f2fb;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #b6d4fe;
}

.schedule-box h3 {
  color: var(--color-brand-primary, #003366);
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

/* Destaque do Documento PDF */
.highlight-doc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #003366 0%, #005b9f 100%);
  padding: 1.5rem;
  margin: 1.2rem 0 1.2rem 0;
  border-radius: 10px;
  color: #fff;
}

.doc-icon {
  font-size: 3rem;
  color: #ffcc00;
  margin-right: 1.5rem;
}

.doc-info {
  flex: 1;
}

.doc-info h4 {
  margin: 0 0 0.5rem 0;
  color: #fff;
  font-weight: 700;
}

.doc-info p {
  margin: 0;
  font-size: 0.95rem;
  opacity: 0.9;
}

.btn-download {
  background-color: #ffcc00;
  color: #003366;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-download:hover {
  background-color: #e6b800;
  transform: translateY(-2px);
  color: #003366;
}

/* Grid de Links e Formulários */
.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.2rem;
}

.resource-card {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 1.2rem;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.08);
  border-color: var(--color-brand-primary, #003366);
}

.resource-card i {
  font-size: 1.8rem;
  color: #d9534f;
}

.resource-card h4 {
  margin: 0 0 0.4rem 0;
  font-size: 1.05rem;
  color: var(--color-brand-primary, #003366);
}

.resource-card span {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
}

#btn-back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 999;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--color-brand-primary, #003366);
  color: #fff;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  transition: transform 0.3s, background-color 0.3s;
}

#btn-back-to-top:hover {
  background-color: #002244;
  transform: scale(1.15);
}

@media (max-width: 1200px) {
  .rules-grid {
    grid-template-columns: 1fr;
  }
  .highlight-doc {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  .doc-icon {
    margin-right: 0;
  }
}
</style>