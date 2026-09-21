// =========================================================================
// DATASET — funções de organização e divisão dos dados.
// =========================================================================

// -------------------------------------------------------------------------
// CARREGAR O DATASET
// -------------------------------------------------------------------------

export async function carregarDataset(caminho) {
  const response = await fetch(caminho);

  if (!response.ok) {
    throw new Error(
      `Erro ao carregar dataset: ${response.status}`
    );
  }

  const csv = await response.text();

  const linhas = csv
    .trim()
    .split(/\r?\n/)
    .map((linha) =>
      linha.split(',').map((campo) => campo.trim())
    );

  const [, ...dados] = linhas;

  return dados.map(
    ([nome, idade, cor, localizacao]) => ({
      nome,
      idade: Number(idade),
      cor,
      localizacao,
    })
  );
}

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

export function selecionarAmostraEstratificada(dados, quantidade, seed) {
  const grupos = {
    basic: [],
    medium: [],
    premium: [],
  };

  dados.forEach((registro) => {
    grupos[registro.categoria].push(registro);
  });

  Object.keys(grupos).forEach((categoria, index) => {
    grupos[categoria] =
      embaralharArray(
        grupos[categoria],
        seed + index
      );
  });

  const quantidadePorCategoria = quantidade / 3;

  return [
    ...grupos.basic.slice(0, quantidadePorCategoria),
    ...grupos.medium.slice(0, quantidadePorCategoria),
    ...grupos.premium.slice(0, quantidadePorCategoria),
  ];
}