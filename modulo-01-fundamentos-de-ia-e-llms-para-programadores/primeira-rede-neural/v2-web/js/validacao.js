import {
  determinarCategoria
} from '../app.js';

export function analisarDataset(dados) {
  const distribuicaoCategorias = {
    basic: 0,
    medium: 0,
    premium: 0,
  };

  const distribuicaoCores = {
    azul: 0,
    vermelho: 0,
    verde: 0,
  };

  const distribuicaoLocalizacoes = {
    'São Paulo': 0,
    Rio: 0,
    Curitiba: 0,
  };

  dados.forEach((registro) => {
    distribuicaoCategorias[registro.categoria]++;
    distribuicaoCores[registro.cor]++;
    distribuicaoLocalizacoes[registro.localizacao]++;
  });

  console.log('=== ANÁLISE DO DATASET ===');

  console.log('Total:', dados.length);

  console.log(
    'Categorias:',
    distribuicaoCategorias
  );

  console.log(
    'Cores:',
    distribuicaoCores
  );

  console.log(
    'Localizações:',
    distribuicaoLocalizacoes
  );

  console.table(
    dados.map((registro) => ({
      nome: registro.nome,
      idade: registro.idade,
      cor: registro.cor,
      localizacao: registro.localizacao,
      pontuacao: registro.pontuacao.toFixed(2),
      categoria: registro.categoria,
    }))
  );
}

export function validarDataset(dados) {
  const inconsistencias = dados.filter((registro) => {
    const categoriaEsperada = determinarCategoria(
      registro.pontuacao
    );

    return registro.categoria !== categoriaEsperada;
  });

  if (inconsistencias.length === 0) {
    console.log('✓ Dataset validado: nenhuma inconsistência encontrada.');
    return;
  }

  console.warn(
    '⚠️ Inconsistências encontradas:',
    inconsistencias
  );
}