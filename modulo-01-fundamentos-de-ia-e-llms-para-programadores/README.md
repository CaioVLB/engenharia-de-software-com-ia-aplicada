# Disciplina 01 — Fundamentos de IA e LLMs para Programadores

## O que esta disciplina cobre

Ponto de partida da pós: entender como IA, Machine Learning e LLMs funcionam por dentro, saindo dos conceitos fundamentais até a implementação de uma primeira rede neural funcional em JavaScript e a exploração de aplicações práticas de IA para desenvolvimento de software.

- Contexto histórico da IA e a linha do tempo até chegar em LLMs
- Diferenças entre Machine Learning, Deep Learning e Inteligência Artificial
- Como LLMs funcionam por dentro: transformers, embeddings e attention
- Construção de uma rede neural do zero em JavaScript, passando pelo ciclo dados → treino → validação → inferência
- Machine Learning aplicado no browser
- Prompt engineering na prática, para codar, debugar e documentar mais rápido
- Comparação entre ferramentas de IA para produtividade de dev e o conceito de "Vibe Coding"
- Introdução a MCPs (Model Context Protocol) e automações com IA
- Fundamentos de RAG, embeddings e busca semântica
- Diferenças entre modelos open-source e proprietários, uso de OpenRouter e execução local com Ollama
- Introdução a agentes de IA e tomada de decisão em etapas

## Projetos

| Projeto | Descrição | Stack |
|---|---|---|
| [primeira-rede-neural/v1-console](./primeira-rede-neural/v1-console/) | Primeiro experimento para entender, na prática, a construção e o funcionamento de uma rede neural utilizando JavaScript e execução pelo console | TensorFlow.js, Node.js |
| [primeira-rede-neural/v2-web](./primeira-rede-neural/v2-web/) | Evolução do primeiro experimento: classificador de usuários executado no browser, com dataset sintético, pré-processamento, treinamento, validação e avaliação do modelo | TensorFlow.js, JavaScript, HTML, CSS |

## Principais aprendizados

- **Uma rede neural precisa receber números.** Trabalhei normalização para transformar a idade em uma escala adequada e one-hot encoding para representar categorias como cor favorita e localização.

- **A arquitetura da rede precisa estar alinhada ao problema.** No primeiro experimento, a rede passou a receber 7 features: idade normalizada + 3 cores + 3 localizações. A camada intermediária utiliza ReLU e a saída utiliza softmax para produzir probabilidades entre as três categorias.

- **O treinamento é iterativo.** O modelo passa pelos dados várias vezes (epochs), ajustando seus pesos com base nos erros cometidos. O uso de shuffle também ajuda a evitar que a ordem dos exemplos influencie o treinamento.

- **A avaliação precisa acontecer em dados que não foram usados no treinamento.** No segundo experimento, passei a trabalhar com um conjunto de teste separado, permitindo observar a capacidade de generalização do modelo em vez de olhar apenas para seu desempenho sobre os próprios dados de treinamento.

- **Dados são parte central do problema.** A qualidade, a quantidade, a distribuição e a representatividade dos dados influenciam diretamente o que uma rede neural consegue aprender.

- **A análise dos erros é tão importante quanto a acurácia.** No segundo projeto, passei a utilizar matriz de confusão e análise dos registros classificados incorretamente para entender quais classes eram mais difíceis para o modelo.

- **Um experimento de Machine Learning precisa controlar o que está sendo comparado.** A evolução do primeiro para o segundo projeto trouxe uma preocupação maior com separação entre treino e teste, reprodutibilidade e comparação entre diferentes quantidades de dados de treinamento.

- **Aprender IA na prática também significa entender as limitações do modelo.** O projeto mostrou que aumentar a quantidade de dados melhora o desempenho, mas não elimina necessariamente erros próximos às fronteiras entre classes.

## Evolução dos projetos

O `v1-console` foi criado principalmente como um experimento de aprendizagem: a intenção era entender como uma rede neural é construída, treinada e utilizada para fazer uma previsão, acompanhando o processo diretamente pelo console.

A partir dessa experiência surgiu a curiosidade de descobrir como esse mesmo conceito poderia ser levado para o browser. Essa curiosidade deu origem ao `v2-web`, que passou a tratar o problema de forma mais completa, incorporando dataset sintético, geração das categorias por regra, pré-processamento dos dados, separação entre treinamento e teste, avaliação por matriz de confusão e experimentos com diferentes quantidades de dados.

Assim, o segundo projeto não substitui o primeiro: ele representa a evolução natural do aprendizado.
