// =========================================================================
// CONFIG — vocabulário fixo + regras utilizadas para gerar o dataset.
// =========================================================================

export const CONFIG = {
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

  // Quantidade de registros utilizados para treinamento: 30/60/90
  tamanhoTreino: 90,

  // Seed utilizada para tornar o experimento reproduzível
  seed: 42
};

export const LABELS = ['premium', 'medium', 'basic'];

export const TIER_LABEL = {
    premium: 'Premium',
    medium: 'Medium',
    basic: 'Basic',
};