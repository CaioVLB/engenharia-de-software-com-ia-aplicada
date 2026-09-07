import {
  analisarDataset,
  validarDataset,
} from './js/validacao.js';
import { separarDataset } from './js/dataset.js';
import {
  avaliarModelo,
  analisarErros,
  criarMatrizConfusao,
  exibirMatrizConfusao,
} from './js/avaliacao.js';

// =========================================================================
// CONFIG — vocabulário fixo + regras utilizadas para gerar o dataset.
// =========================================================================
const CONFIG = {
  cores: ['azul', 'vermelho', 'verde'],
  localizacoes: ['São Paulo', 'Rio', 'Curitiba'],

  // Faixa de idade utilizada para gerar o dataset.
  idadeMin: 25,
  idadeMax: 40,

  // Pontuação arbitrária definida para o experimento.
  // Não representa uma regra de negócio real.
  pontosCor: {
    azul: 30,
    vermelho: 20,
    verde: 10,
  },

  // Pontuação arbitrária definida para o experimento.
  // Não representa uma regra de negócio real.
  pontosLocalizacao: {
    'São Paulo': 30,
    Rio: 20,
    Curitiba: 10,
  },

  // Limites calibrados para produzir uma distribuição equilibrada das definições dos tiers.
  limitePremium: 68,
  limiteMedium: 52,

  // Split estratificado 80/20: 80% Treino e 20% Teste = 100% dataset
  proporcaoTreino: 0.8,

  // Seed utilizada para tornar o experimento reproduzível
  seed: 42
};

const LABELS = ['premium', 'medium', 'basic'];

// =========================================================================
// REGRA DE CLASSIFICAÇÃO
// =========================================================================

// Converte a idade em uma pontuação de 0 a 40.
// 25 anos = 0 pontos
// 40 anos = 40 pontos
function calcularPontosIdade(idade) {
  return normalizarIdade(idade) * 40;
}

// Calcula a pontuação total de uma pessoa
// utilizando idade + cor favorita + localização.
function calcularPontuacao(registro) {
  const pontosIdade = calcularPontosIdade(registro.idade);

  const pontosCor = CONFIG.pontosCor[registro.cor] ?? 0;

  const pontosLocalizacao = CONFIG.pontosLocalizacao[registro.localizacao] ?? 0;

  return pontosIdade + pontosCor + pontosLocalizacao;
}

// Transforma a pontuação em uma categoria.
export function determinarCategoria(pontuacao) {
  if (pontuacao >= CONFIG.limitePremium) {
    return 'premium';
  }

  if (pontuacao >= CONFIG.limiteMedium) {
    return 'medium';
  }

  return 'basic';
}

// Cria um registro completo para o treinamento.
function criarRegistroDeTreino(registro) {
  const pontuacao = calcularPontuacao(registro);
  
  return {
    ...registro,
    pontuacao,
    categoria: determinarCategoria(pontuacao),
  };
}

// =========================================================================
// CARREGAMENTO DO DATASET
// =========================================================================

async function carregarDataset() {
  const response = await fetch('./data/dataset_sintetico_90.csv');
  
  if (!response.ok) {
    throw new Error(`Erro ao carregar dataset: ${response.status}`);
  }

  const csv = await response.text();

  const linhas = csv
    .trim()
    .split(/\r?\n/)
    .map((linha) =>
      linha.split(',').map((campo) => 
        campo.trim()
      )
    );

  const [, ...dados] = linhas;

  return dados.map(([nome, idade, cor, localizacao]) => ({
    nome,
    idade: Number(idade),
    cor,
    localizacao,
  }));
}

// =========================================================================
// DATASET
// =========================================================================

// Armazena todos os registros.
let DATASET = [];
// Armazena os dados usados para aprendizado.
let TRAINING_DATA = [];
// Armazena os dados usados para avaliação.
let TEST_DATA = [];

// Perfis disponíveis para o usuário escolher e classificar.
// Não fazem parte do treino — o modelo nunca viu essas pessoas.
const REGISTROS_PARA_PREVER = [
  { nome: 'Zé', idade: 28, cor: 'verde', localizacao: 'Curitiba' },
  { nome: 'Fernanda', idade: 33, cor: 'azul', localizacao: 'Rio' },
  { nome: 'Bruno', idade: 26, cor: 'vermelho', localizacao: 'São Paulo' },
  { nome: 'Marina', idade: 38, cor: 'verde', localizacao: 'São Paulo' },
];

// =========================================================================
// PRÉ-PROCESSAMENTO
// =========================================================================

function normalizarIdade(idade) {
  return ((idade - CONFIG.idadeMin) / (CONFIG.idadeMax - CONFIG.idadeMin));
}

function oneHot(valor, categorias) {
  return categorias.map((c) => (c === valor ? 1 : 0));
}

function vetorizarRegistro(registro) {
  return [
    normalizarIdade(registro.idade),
    ...oneHot(registro.cor, CONFIG.cores),
    ...oneHot(registro.localizacao, CONFIG.localizacoes),
  ];
}

function vetorizarCategoria(categoria) {
  return oneHot(categoria, LABELS);
}

// =========================================================================
// TREINO
// =========================================================================
async function treinarModelo(onEpochEnd) {
  const inputXs = tf.tensor2d(TRAINING_DATA.map(vetorizarRegistro));
  const outputYs = tf.tensor2d(TRAINING_DATA.map((r) => vetorizarCategoria(r.categoria)));

  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [7], units: 80, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 3, activation: 'softmax' }));

  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  await model.fit(inputXs, outputYs, {
    epochs: 100,
    shuffle: true,
    verbose: 0,
    callbacks: { onEpochEnd },
  });

  inputXs.dispose();
  outputYs.dispose();

  return model;
}

// =========================================================================
// PREDIÇÃO
// =========================================================================
export async function prever(model, registro) {
  const tfInput = tf.tensor2d([vetorizarRegistro(registro)]);
  const pred = model.predict(tfInput);
  const [probs] = await pred.array();
  tfInput.dispose();
  pred.dispose();

  return LABELS.map((label, i) => ({ label, prob: probs[i] }));
}

// =========================================================================
// UI
// =========================================================================
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
  cardTier: document.getElementById('card-tier'),
  cardConfidence: document.getElementById('card-confidence'),
  bars: document.getElementById('bars'),
};

const TIER_LABEL = { premium: 'Premium', medium: 'Medium', basic: 'Basic' };

function popularSelect() {
  el.select.innerHTML = REGISTROS_PARA_PREVER
    .map((r, i) => `<option value="${i}">${r.nome}</option>`)
    .join('');
  atualizarDetalhes();
}

function atualizarDetalhes() {
  const registro = REGISTROS_PARA_PREVER[el.select.value];
  el.details.innerHTML = `
    <dt>Idade</dt><dd>${registro.idade}</dd>
    <dt>Cor favorita</dt><dd>${registro.cor}</dd>
    <dt>Localização</dt><dd>${registro.localizacao}</dd>
  `;
  resetCard();
}

function resetCard() {
  el.card.dataset.tier = '';
  el.cardEmpty.hidden = false;
  el.cardContent.hidden = true;
}

function renderResultado(resultados) {
  const vencedor = resultados.reduce((a, b) => (b.prob > a.prob ? b : a));

  el.card.dataset.tier = vencedor.label;
  el.cardEmpty.hidden = true;
  el.cardContent.hidden = false;
  el.cardTier.textContent = TIER_LABEL[vencedor.label];
  el.cardConfidence.textContent = `${(vencedor.prob * 100).toFixed(1)}% de confiança`;

  el.bars.innerHTML = resultados
    .map(
      (r) => `
      <div class="bar-row">
        <span>${TIER_LABEL[r.label]}</span>
        <div class="bar-track">
          <div class="bar-fill ${r.label}" data-width="${(r.prob * 100).toFixed(1)}"></div>
        </div>
        <span class="bar-value">${(r.prob * 100).toFixed(1)}%</span>
      </div>`
    )
    .join('');

  // Dispara a transição de largura das barras num próximo frame.
  requestAnimationFrame(() => {
    el.bars.querySelectorAll('.bar-fill').forEach((bar) => {
      bar.style.width = `${bar.dataset.width}%`;
    });
  });
}

// =========================================================================
// BOOT
// =========================================================================
async function main() {
  let model;

  try {
    // ================================================================
    // CARREGAR DATASET
    // ================================================================
    const dadosBrutos = await carregarDataset();

    DATASET = dadosBrutos.map(criarRegistroDeTreino);

    analisarDataset(DATASET);
    validarDataset(DATASET);

    const separacao = separarDataset(DATASET, CONFIG.proporcaoTreino, CONFIG.seed);
    
    TRAINING_DATA = separacao.treino;
    TEST_DATA = separacao.teste;

    console.log('=== TREINO ===');
    analisarDataset(TRAINING_DATA);

    console.log('=== TESTE ===');
    analisarDataset(TEST_DATA);

    console.log('Dataset total:', DATASET.length);
    console.log('Dados de treino:', TRAINING_DATA.length);
    console.log('Dados de teste:', TEST_DATA.length);

    // ================================================================
    // TREINAR MODELO
    // ================================================================
    model = await treinarModelo((epoch, log) => {
      el.status.textContent = `epoch ${epoch + 1}/100 · loss ${log.loss.toFixed(4)}`;
      el.progressFill.style.width = `${((epoch + 1) / 100) * 100}%`;
    });

    const resultadoTeste = await avaliarModelo(model, TEST_DATA);

    console.log('=== AVALIAÇÃO DO TESTE ===');
    console.log(`Total: ${resultadoTeste.total}`);
    console.log(`Acertos: ${resultadoTeste.acertos}`);
    console.log(`Erros: ${resultadoTeste.erros}`);
    console.log(
      `Acurácia: ${(resultadoTeste.acuracia * 100).toFixed(2)}%`
    );

    // ========================================================================
    // ANÁLISE DOS ERROS
    // ========================================================================

    const analiseErros = analisarErros(resultadoTeste.resultados);

    console.log('=== ANÁLISE DOS ERROS ===');

    console.log(`Total de erros: ${analiseErros.totalErros}`);

    console.table(analiseErros.erros);

    // ========================================================================
    // MATRIZ DE CONFUSÃO
    // ========================================================================

    const matrizConfusao = criarMatrizConfusao(resultadoTeste.resultados);

    console.log('=== MATRIZ DE CONFUSÃO ===');

    exibirMatrizConfusao(matrizConfusao);
    //console.table(resultadoTeste.resultados);
  } catch (err) {
    el.status.textContent = 'erro ao treinar o modelo — veja o console (F12)';
    console.error(err);
    return;
  }

  el.status.textContent = 'modelo treinado ✓';
  el.terminal.dataset.done = 'true';

  popularSelect();
  el.classifier.hidden = false;

  el.select.addEventListener('change', atualizarDetalhes);

  el.classifyBtn.addEventListener('click', async () => {
    const registro = REGISTROS_PARA_PREVER[el.select.value];
    const resultados = await prever(model, registro);
    renderResultado(resultados);
  });
}

main();