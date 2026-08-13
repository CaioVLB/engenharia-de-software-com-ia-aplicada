# Disciplina 01 — Fundamentos de IA e LLMs para Programadores

## O que esta disciplina cobre

Ponto de partida da pós: entender como LLMs funcionam por dentro e sair do zero até minha primeira rede neural funcional, aplicando os conceitos direto em JavaScript.

- Contexto histórico da IA e a linha do tempo até chegar em LLMs
- Diferenças entre Machine Learning, Deep Learning e Inteligência Artificial
- Como LLMs funcionam por dentro: transformers, embeddings e attention
- Construção de uma rede neural do zero em JavaScript (ciclo dados → treino → validação → inferência)
- Machine Learning aplicado no browser (detecção, tracking, bots em jogos)
- Prompt engineering na prática, para codar, debugar e documentar mais rápido
- Comparação entre ferramentas de IA para produtividade de dev (Cursor, Windsurf, VSCode) e o conceito de "Vibe Coding"
- Introdução a MCPs (Model Context Protocol) e automações com IA
- Fundamentos de RAG, embeddings e busca semântica
- Diferenças entre modelos open-source e proprietários, uso de OpenRouter e execução local com Ollama
- Introdução a agentes de IA e tomada de decisão em etapas

## Projetos

| Projeto | Descrição | Stack |
|---|---|---|
| [primeira-rede-neural](./primeira-rede-neural/) | Rede neural para prever categoria de um usuário (Premium/Medium/Basic) a partir de idade, cor favorita e localização | TensorFlow.js, Node.js |


## Principais aprendizados

- **Dados precisam virar números antes de qualquer coisa.** Uma rede neural não entende texto puro como "azul" ou "São Paulo" — só números. Trabalhei normalização (idade em uma escala de 0 a 1) e one-hot encoding (cada categoria de cor/localização virando uma posição binária no vetor de entrada).

- **Cada camada tem um papel específico.** A camada de entrada define quantas features o modelo recebe (no meu caso, 7: idade normalizada + 3 cores + 3 localizações). A ativação ReLU na camada intermediária funciona como um filtro, deixando passar só os sinais relevantes. A camada de saída usa softmax para transformar os resultados em probabilidades que somam 100% entre as categorias possíveis.

- **A escolha do otimizador e da função de perda não é arbitrária.** Usei o otimizador Adam, que ajusta os pesos da rede de forma adaptativa a partir do histórico de erros, e a função de perda categorical crossentropy, indicada quando a resposta certa é "uma entre várias categorias possíveis" — o mesmo padrão usado em classificação de imagens ou sistemas de recomendação.

- **Treinar é um processo iterativo, não instantâneo.** O modelo passa pelos dados de treino múltiplas vezes (epochs) e embaralha os exemplos (shuffle) a cada rodada para evitar que aprenda um viés de ordem. Acompanhar o loss caindo a cada epoch foi a forma mais direta de visualizar o modelo "aprendendo".

- **Poucos dados de treino exigem cuidado extra.** Com uma base de exemplo pequena, aumentar o número de neurônios ajuda o modelo a captar padrões — mas é um trade-off direto com custo de processamento, algo que já começo a pensar desde o primeiro projeto.