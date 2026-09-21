import { CONFIG, LABELS } from './config.js';

export function normalizarIdade(idade) {
    return (
        (idade - CONFIG.idadeMin) / (CONFIG.idadeMax - CONFIG.idadeMin)
    );
}

export function oneHot(valor, categorias) {
    return categorias.map(
        (categoria) => categoria === valor ? 1 : 0
    );
}

export function vetorizarRegistro(registro) {
    return [
        normalizarIdade(registro.idade),
        ...oneHot(registro.cor, CONFIG.cores),
        ...oneHot(registro.localizacao, CONFIG.localizacoes),
    ];
}

export function vetorizarCategoria(categoria) {
    return oneHot(categoria, LABELS);
}