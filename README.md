# HM-I Tool: Hospital Market Intelligence Tool

Este projeto implementa uma prova de conceito (PoC) para a **Ferramenta de Inteligência de Mercado Hospitalar (HM-I Tool)**, conforme o plano de projeto detalhado fornecido. O objetivo é demonstrar a integração de um *pipeline* de ETL (Extração, Transformação e Carga) em Python com uma API de serviço em Node.js.

## 1. Estrutura do Projeto

O projeto está dividido em dois componentes principais:

| Diretório | Tecnologia | Responsabilidade |
| :--- | :--- | :--- |
| `src/python` | Python 3.11 | **ETL e Processamento de Dados**. Contém utilitários para normalização de dados, *fetching* de APIs públicas (simulado) e geocodificação. |
| `src/node` | Node.js | **API de Serviço**. Implementa uma API RESTful para servir os dados processados, utilizando dados *mockados* para simular o Data Warehouse. |

## 2. Tecnologias e Bibliotecas Utilizadas

O projeto utiliza uma pilha tecnológica híbrida para aproveitar os pontos fortes de cada linguagem: Python para processamento de dados e Node.js para a camada de serviço web.

### Python (ETL e Processamento)

O ambiente Python foi configurado com um *virtual environment* (`.venv`) e as seguintes bibliotecas, essenciais para manipulação de dados, requisições HTTP e funções matemáticas/fuzzy:

| Biblioteca | Versão | Uso Principal |
| :--- | :--- | :--- |
| `requests` | (Instalada) | Realização de requisições HTTP para APIs externas (IBGE, Nominatim, BrasilAPI). |
| `pandas` | (Instalada) | Manipulação e análise de grandes volumes de dados (CSV, DBF), ideal para o ETL. |
| `fuzzywuzzy` | (Instalada) | Implementação de lógica de *fuzzy matching* para deduplicação e resolução de nomes. |
| `python-levenshtein` | (Instalada) | Dependência de `fuzzywuzzy` para cálculos de distância de Levenshtein otimizados. |
| `dbfread` | (Instalada) | Leitura e conversão de arquivos DBF, comumente usados pelo DATASUS (SIH/SIA). |

### Node.js (API de Serviço)

A camada de API utiliza o Node.js para criar um servidor web leve e rápido:

| Biblioteca | Versão | Uso Principal |
| :--- | :--- | :--- |
| `express` | ^5.1.0 | Framework web minimalista e flexível para construir a API RESTful. |

## 3. Como Executar

### 3.1. Pré-requisitos

*   Python 3.10+ (O ambiente foi configurado com 3.11)
*   Node.js e npm

### 3.2. Execução do Componente Python (ETL)

O script `src/python/main.py` demonstra a execução das funções de utilidade de ETL, como normalização de CNPJ, simulação de download de dados e geocodificação.

1.  **Ativar o Ambiente Virtual:**
    ```bash
    cd hm-i-tool
    source .venv/bin/activate
    ```
2.  **Executar a Demonstração de ETL:**
    ```bash
    python src/python/main.py
    ```
    *Resultado esperado:* O script irá normalizar um CNPJ, simular o download de um arquivo CNES (criando um arquivo *mock* em `data/raw/cnes_estabelecimentos.csv.gz`) e realizar uma geocodificação real via Nominatim.

### 3.3. Execução do Componente Node.js (API)

O servidor Node.js simula a camada de API que consultaria o Data Warehouse.

1.  **Instalar Dependências (se necessário):**
    ```bash
    cd hm-i-tool/src/node
    npm install
    ```
2.  **Iniciar o Servidor:**
    ```bash
    node src/node/server.js
    ```
    *O servidor será iniciado na porta 3000.*

3.  **Testar o Endpoint (Exemplo):**
    Abra seu navegador ou use `curl` para testar o endpoint *mockado*:
    ```bash
    curl http://localhost:3000/api/v1/market-intelligence/3549904
    ```
    *Resultado esperado:* Um JSON contendo dados de inteligência de mercado (mockados) para o município de São José dos Campos (IBGE: 3549904).

## 4. Repositório Git

O projeto foi inicializado com Git e contém os seguintes commits:

1.  `feat: Initial project structure and dependencies`
2.  `feat: Implement Python ETL utilities (CNPJ, CNES, Geocode) and Node.js mock API`

O arquivo `.gitignore` foi configurado para ignorar o ambiente virtual (`.venv`), dependências do Node (`node_modules`), arquivos compilados do Python (`__pycache__`, `*.pyc`) e o diretório de dados gerados (`/data/`).
