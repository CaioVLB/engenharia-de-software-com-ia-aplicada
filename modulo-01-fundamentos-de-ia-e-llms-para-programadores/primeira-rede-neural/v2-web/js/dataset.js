// =========================================================================
// DATASET — funções de organização e divisão dos dados.
// =========================================================================

// -------------------------------------------------------------------------
// GERADOR PSEUDOALEATÓRIO COM SEED
// -------------------------------------------------------------------------

function criarGeradorAleatorio(seed) {
  let estado = seed;

  return function () {
    estado = (estado * 1664525 + 1013904223) % 4294967296;

    return estado / 4294967296;
  };
}

// -------------------------------------------------------------------------
// EMBARALHAMENTO
// -------------------------------------------------------------------------

function embaralharArray(array, seed) {
  const resultado = [...array];
  const random = criarGeradorAleatorio(seed);

  for (let i = resultado.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));

    [resultado[i], resultado[j]] = [
      resultado[j],
      resultado[i],
    ];
  }

  return resultado;
}

// -------------------------------------------------------------------------
// ESTRATIFICAÇÃO DO DATASET
// -------------------------------------------------------------------------

export function separarDataset(dados, proporcaoTreino, seed) {
  const grupos = {
    basic: [],
    medium: [],
    premium: [],
  };

  // Separa os registros por categoria.
  dados.forEach((registro) => {
    grupos[registro.categoria].push(registro);
  });

  // Embaralha cada categoria de maneira reproduzível.
  Object.keys(grupos).forEach((categoria, index) => {
    grupos[categoria] = embaralharArray(
      grupos[categoria],
      seed + index
    );
  });

  const treino = [];
  const teste = [];

  // Mantém a mesma proporção de treino/teste em cada classe.
  Object.values(grupos).forEach((grupo) => {
    const quantidadeTreino = Math.floor(
      grupo.length * proporcaoTreino
    );

    treino.push(...grupo.slice(0, quantidadeTreino));
    teste.push(...grupo.slice(quantidadeTreino));
  });

  // Embaralha os conjuntos finais.
  return {
    treino: embaralharArray(treino, seed + 100),
    teste: embaralharArray(teste, seed + 200),
  };
}