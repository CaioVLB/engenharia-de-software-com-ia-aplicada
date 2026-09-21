import { CONFIG } from './config.js';

// =========================================================================
// REGRA DE CLASSIFICAÇÃO
// =========================================================================

// Converte a idade em uma pontuação de 0 a 40.
// 25 anos = 0 pontos
// 40 anos = 40 pontos
export function calcularPontosIdade(idade) {
    return ((idade - CONFIG.idadeMin) /
        (CONFIG.idadeMax - CONFIG.idadeMin)) * 40;
}

// Calcula a pontuação total de uma pessoa
// utilizando idade + cor favorita + localização.
export function calcularPontuacao(registro) {
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
export function criarRegistroDeTreino(registro) {
    const pontuacao = calcularPontuacao(registro);

    return {
        ...registro,
        pontuacao,
        categoria: determinarCategoria(pontuacao),
    };
}