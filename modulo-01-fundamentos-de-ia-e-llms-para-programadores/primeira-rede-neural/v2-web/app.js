import {
  carregarDataset,
  selecionarAmostraEstratificada,
} from './js/dataset.js';

import {
  analisarDataset,
  validarDataset,
} from './js/validacao.js';

import {
  avaliarModelo,
  analisarErros,
  criarMatrizConfusao,
  exibirMatrizConfusao,
} from './js/avaliacao.js';

import {
  criarRegistroDeTreino,
} from './js/regras.js';

import {
  treinarModelo,
} from './js/modelo.js';

import {
  atualizarProgresso,
  inicializarInterface,
  tratarErro,
} from './js/ui.js';

import { 
  CONFIG,
} from './js/config.js';

// ================================================================
// DADOS DA APLICAÇÃO
// ================================================================

// Armazena os dados usados para aprendizado.
let TRAINING_DATA = [];
// Armazena os dados usados para avaliação.
let TEST_DATA = [];

// =========================================================================
// BOOT
// =========================================================================
async function main() {
  let model;

  try {
    // ================================================================
    // CARREGAR DATASETS
    // ================================================================
    const dadosTreinoBrutos =
      await carregarDataset(
        './data/dataset_treinamento.csv'
      );

    const dadosTesteBrutos =
      await carregarDataset(
        './data/dataset_teste.csv'
      );

    const datasetTreino =
      dadosTreinoBrutos.map(
        criarRegistroDeTreino
      );

    TRAINING_DATA =
      selecionarAmostraEstratificada(
        datasetTreino,
        CONFIG.tamanhoTreino,
        CONFIG.seed
      );

    TEST_DATA =
      dadosTesteBrutos.map(
        criarRegistroDeTreino
      );

    console.log('=== TREINO ===');

    analisarDataset(TRAINING_DATA);
    validarDataset(TRAINING_DATA);

    console.log('=== TESTE ===');

    analisarDataset(TEST_DATA);
    validarDataset(TEST_DATA);

    console.log(
      'Dados de treino:',
      TRAINING_DATA.length
    );

    console.log(
      'Dados de teste:',
      TEST_DATA.length
    );

    // ================================================================
    // TREINAR MODELO
    // ================================================================
    model = await treinarModelo(
      TRAINING_DATA,
      atualizarProgresso
    );

    // ================================================================
    // AVALIAR MODELO
    // ================================================================
    const resultadoTeste =
      await avaliarModelo(
        model,
        TEST_DATA
      );

    console.log(
      '=== AVALIAÇÃO DO TESTE ==='
    );

    console.log(
      `Total: ${resultadoTeste.total}`
    );

    console.log(
      `Acertos: ${resultadoTeste.acertos}`
    );

    console.log(
      `Erros: ${resultadoTeste.erros}`
    );

    console.log(
      `Acurácia: ${(resultadoTeste.acuracia * 100).toFixed(2)}%`
    );

    // ================================================================
    // ANÁLISE DOS ERROS
    // ================================================================
    const analiseErros =
      analisarErros(
        resultadoTeste.resultados
      );

    console.log(
      '=== ANÁLISE DOS ERROS ==='
    );

    console.log(
      `Total de erros: ${analiseErros.totalErros}`
    );

    console.table(
      analiseErros.erros
    );

    // ================================================================
    // MATRIZ DE CONFUSÃO
    // ================================================================
    const matrizConfusao =
      criarMatrizConfusao(
        resultadoTeste.resultados
      );

    console.log(
      '=== MATRIZ DE CONFUSÃO ==='
    );

    exibirMatrizConfusao(
      matrizConfusao
    );

  } catch (err) {
    tratarErro(err);
    return;
  }

  // ================================================================
  // INICIALIZAR INTERFACE
  // ================================================================
  inicializarInterface(model);
}

main();