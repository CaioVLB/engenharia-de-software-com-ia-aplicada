import { TIER_LABEL } from './config.js';
import { prever } from './modelo.js';
import {
  calcularPontuacao,
  determinarCategoria,
} from './regras.js';

// ================================================================
// REGISTROS PARA DEMONSTRAÇÃO
// ================================================================
// Esses registros não fazem parte do treinamento.
// O objetivo é permitir que o usuário faça previsões com dados
// que o modelo não viu durante o treino.
export const REGISTROS_PARA_PREVER = [
  {
    nome: 'Zé',
    idade: 28,
    cor: 'verde',
    localizacao: 'Curitiba',
  },
  {
    nome: 'Fernanda',
    idade: 33,
    cor: 'azul',
    localizacao: 'Rio',
  },
  {
    nome: 'Bruno',
    idade: 26,
    cor: 'vermelho',
    localizacao: 'São Paulo',
  },
  {
    nome: 'Marina',
    idade: 38,
    cor: 'verde',
    localizacao: 'São Paulo',
  },
  {
    nome: 'Giovanna',
    idade: 29,
    cor: 'azul',
    localizacao: 'Rio',
  },
];

// ================================================================
// ELEMENTOS DA INTERFACE
// ================================================================
const el = {
  terminal: document.getElementById('terminal'),
  status: document.getElementById('terminal-status'),
  progressFill: document.getElementById('progress-fill'),
  classifier: document.getElementById('classifier'),
  select: document.getElementById('record-select'),
  details: document.getElementById('record-details'),
  classifyBtn: document.getElementById('classify-btn'),
  card: document.getElementById('result-card'),
  cardEmpty: document.getElementById('card-empty'),
  cardContent: document.getElementById('card-content'),
  ruleCategory: document.getElementById('rule-category'),
  ruleScore: document.getElementById('rule-score'),
  comparisonResult: document.getElementById('comparison-result'),
  cardTier: document.getElementById('card-tier'),
  cardConfidence: document.getElementById('card-confidence'),
  bars: document.getElementById('bars'),
};

// ================================================================
// SELECT DE REGISTROS
// ================================================================
function popularSelect() {
  el.select.innerHTML = REGISTROS_PARA_PREVER
    .map(
      (registro, index) =>
        `<option value="${index}">${registro.nome}</option>`
    )
    .join('');

  atualizarDetalhes();
}

// ================================================================
// DETALHES DO REGISTRO SELECIONADO
// ================================================================
function atualizarDetalhes() {
  const registro = REGISTROS_PARA_PREVER[el.select.value];

  el.details.innerHTML = `
    <dt>Idade</dt>
    <dd>${registro.idade}</dd>

    <dt>Cor favorita</dt>
    <dd>${registro.cor}</dd>

    <dt>Localização</dt>
    <dd>${registro.localizacao}</dd>
  `;

  resetCard();
}

// ================================================================
// RESET DO CARD DE RESULTADO
// ================================================================
function resetCard() {
  el.card.dataset.tier = '';
  el.cardEmpty.hidden = false;
  el.cardContent.hidden = true;
}

// ================================================================
// RENDERIZAÇÃO DO RESULTADO
// ================================================================
function renderResultado(registro, resultados) {
  const vencedor = resultados.reduce((a, b) =>
    b.prob > a.prob ? b : a
  );

  const pontuacao = calcularPontuacao(registro);
  const categoriaRegra = determinarCategoria(pontuacao);

  el.ruleCategory.textContent = TIER_LABEL[categoriaRegra];
  el.ruleScore.textContent = `${pontuacao.toFixed(2)} pontos`;

  el.card.dataset.tier = vencedor.label;
  el.cardEmpty.hidden = true;
  el.cardContent.hidden = false;

  el.cardTier.textContent = TIER_LABEL[vencedor.label];
  el.cardConfidence.textContent = `${(vencedor.prob * 100).toFixed(1)}% de confiança`;

  const corresponde = categoriaRegra === vencedor.label;

  el.comparisonResult.textContent = corresponde
    ? '✓ Predição compatível com a regra'
    : '⚠ Predição diferente da regra';

  el.comparisonResult.dataset.match = corresponde ? 'true' : 'false';

  el.bars.innerHTML = resultados
    .map(
      (resultado) => `
        <div class="bar-row">
          <span>${TIER_LABEL[resultado.label]}</span>

          <div class="bar-track">
            <div
              class="bar-fill ${resultado.label}"
              data-width="${(resultado.prob * 100).toFixed(1)}"
            ></div>
          </div>

          <span class="bar-value">
            ${(resultado.prob * 100).toFixed(1)}%
          </span>
        </div>
      `
    )
    .join('');

  // Dispara a transição da largura das barras
  // em um novo frame do navegador.
  requestAnimationFrame(() => {
    el.bars.querySelectorAll('.bar-fill').forEach((bar) => {
      bar.style.width = `${bar.dataset.width}%`;
    });
  });
}

// ================================================================
// ATUALIZA O PROGRESSO DO TREINAMENTO
// ================================================================
// Essa função é usada como callback pelo model.fit().
export function atualizarProgresso(
  epoch,
  log,
  totalEpochs = 100
) {
  el.status.textContent =
    `epoch ${epoch + 1}/${totalEpochs} · loss ${log.loss.toFixed(4)}`;

  el.progressFill.style.width =
    `${((epoch + 1) / totalEpochs) * 100}%`;
}

// ================================================================
// CONFIGURAÇÃO DOS EVENTOS DA INTERFACE
// ================================================================
// O modelo treinado é recebido aqui porque o botão de
// classificação precisa utilizá-lo para realizar previsões.
function configurarEventos(model) {
  el.select.addEventListener(
    'change',
    atualizarDetalhes
  );

  el.classifyBtn.addEventListener(
    'click',
    async () => {
      const registro =
        REGISTROS_PARA_PREVER[el.select.value];

      try {
        const resultados = await prever(model, registro);

        renderResultado(registro, resultados);
      } catch (err) {
        console.error(
          'Erro ao realizar previsão:',
          err
        );

        el.status.textContent =
          'erro ao realizar a previsão — veja o console (F12)';
      }
    }
  );
}

// ================================================================
// INICIALIZAÇÃO DA INTERFACE
// ================================================================
// Tudo que precisa acontecer depois que o modelo
// foi treinado com sucesso.
export function inicializarInterface(model) {
  el.status.textContent = 'modelo treinado ✓';
  el.terminal.dataset.done = 'true';

  popularSelect();

  el.classifier.hidden = false;

  configurarEventos(model);
}

// ================================================================
// TRATAMENTO VISUAL DE ERRO
// ================================================================
export function tratarErro(err) {
  el.status.textContent =
    'erro ao treinar o modelo — veja o console (F12)';

  console.error(err);
}