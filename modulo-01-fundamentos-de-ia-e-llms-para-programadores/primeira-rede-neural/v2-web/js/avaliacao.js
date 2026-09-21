import {
  prever
} from './modelo.js';

// =========================================================================
// AVALIAÇÃO — mede o desempenho do modelo em dados que ele não viu.
// =========================================================================

export async function avaliarModelo(model, dados) {
  let acertos = 0;

  const resultados = [];

  for (const registro of dados) {
    const previsoes = await prever(model, registro);

    const previsao = previsoes.reduce(
      (melhor, atual) =>
        atual.prob > melhor.prob ? atual : melhor
    );

    const acertou = previsao.label === registro.categoria;

    if (acertou) {
      acertos++;
    }

    resultados.push({
      nome: registro.nome,
      categoriaEsperada: registro.categoria,
      categoriaPrevista: previsao.label,
      acertou,
      confianca: previsao.prob,
      pontuacao: registro.pontuacao,
    });
  }

  return {
    total: dados.length,
    acertos,
    erros: dados.length - acertos,
    acuracia: acertos / dados.length,
    resultados,
  };
}

// =========================================================================
// ANÁLISE DOS ERROS
// =========================================================================

export function analisarErros(resultados) {
  const erros = resultados.filter(
    (resultado) => !resultado.acertou
  );

  const errosPorCategoria = {
    basic: [],
    medium: [],
    premium: [],
  };

  erros.forEach((resultado) => {
    errosPorCategoria[resultado.categoriaEsperada].push(
      resultado
    );
  });

  return {
    totalErros: erros.length,
    erros,
    errosPorCategoria,
  };
}

// =========================================================================
// MATRIZ DE CONFUSÃO
// =========================================================================

export function criarMatrizConfusao(resultados) {
  const matriz = {
    basic: {
      basic: 0,
      medium: 0,
      premium: 0,
    },

    medium: {
      basic: 0,
      medium: 0,
      premium: 0,
    },

    premium: {
      basic: 0,
      medium: 0,
      premium: 0,
    },
  };

  resultados.forEach((resultado) => {
    const real = resultado.categoriaEsperada;
    const prevista = resultado.categoriaPrevista;

    matriz[real][prevista]++;
  });

  return matriz;
}

export function exibirMatrizConfusao(matriz) {
  console.table([
    {
      'Real \\ Prevista': 'Basic',
      Basic: matriz.basic.basic,
      Medium: matriz.basic.medium,
      Premium: matriz.basic.premium,
    },

    {
      'Real \\ Prevista': 'Medium',
      Basic: matriz.medium.basic,
      Medium: matriz.medium.medium,
      Premium: matriz.medium.premium,
    },

    {
      'Real \\ Prevista': 'Premium',
      Basic: matriz.premium.basic,
      Medium: matriz.premium.medium,
      Premium: matriz.premium.premium,
    },
  ]);
}