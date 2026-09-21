import { LABELS } from './config.js';
import {
    vetorizarRegistro,
    vetorizarCategoria,
} from './preprocessamento.js';

// =========================================================================
// TREINO
// =========================================================================

export async function treinarModelo(dados, onEpochEnd) {
    const inputXs = tf.tensor2d(
        dados.map(vetorizarRegistro)
    );

    const outputYs = tf.tensor2d(
        dados.map(
            (registro) => vetorizarCategoria(registro.categoria)
        )
    );

    const model = tf.sequential();

    model.add(
        tf.layers.dense({
            inputShape: [7],
            units: 80,
            activation: 'relu',
        })
    );

    model.add(
        tf.layers.dense({
            units: 3,
            activation: 'softmax',
        })
    );

    model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
    });

    await model.fit(inputXs, outputYs, {
        epochs: 100,
        shuffle: true,
        verbose: 0,
        callbacks: {
            onEpochEnd,
        },
    });

    inputXs.dispose();
    outputYs.dispose();

    return model;
}

// =========================================================================
// PREDIÇÃO
// =========================================================================

export async function prever(model, registro) {
    const tfInput = tf.tensor2d([
        vetorizarRegistro(registro),
    ]);

    const pred = model.predict(tfInput);
    const [probs] = await pred.array();

    tfInput.dispose();
    pred.dispose();

    return LABELS.map((label, index) => ({
        label,
        prob: probs[index],
    }));
}