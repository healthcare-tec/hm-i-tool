const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { OpenAI } = require('openai');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Carregar dados mockados do arquivo JSON
let mockData = [];
try {
    const mockDataPath = path.join(__dirname, 'mock_data.json');
    mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf-8'));
    console.log(`✓ Dados mockados carregados: ${mockData.length} cidades`);
} catch (error) {
    console.error('Erro ao carregar mock_data.json:', error.message);
}

// Inicializar OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint raiz
app.get('/', (req, res) => {
    res.send('HM-I Tool API está rodando. Acesse http://localhost:3000/');
});

// Endpoint para obter dados de inteligência de mercado
app.get('/api/v1/market-intelligence/:ibge_code', (req, res) => {
    const ibgeCode = parseInt(req.params.ibge_code);
    const data = mockData.find(d => d.municipio_ibge === ibgeCode);

    if (!data) {
        return res.status(404).json({
            status: 'error',
            message: `Dados não encontrados para o código IBGE: ${ibgeCode}`
        });
    }

    res.json({
        status: 'success',
        data: data,
        message: 'Dados de inteligência de mercado recuperados com sucesso.'
    });
});

// Endpoint para obter análise da OpenAI
app.get('/api/v1/analysis/:ibge_code', async (req, res) => {
    const ibgeCode = parseInt(req.params.ibge_code);
    const data = mockData.find(d => d.municipio_ibge === ibgeCode);

    if (!data) {
        return res.status(404).json({
            status: 'error',
            message: `Dados não encontrados para o código IBGE: ${ibgeCode}`
        });
    }

    // Formatar os dados para o prompt
    const promptData = JSON.stringify(data, null, 2);

    const prompt = `
        Você é um analista de mercado de saúde sênior com expertise em inteligência de mercado. 
        Sua tarefa é analisar os dados de inteligência de mercado a seguir para a cidade de ${data.nome_municipio}, ${data.uf_sigla} 
        e gerar uma análise profunda sobre:
        1. Problemas e Desafios (baseado nos dados)
        2. Oportunidades de Investimento (baseado nos dados)
        3. Fatos Recentes e Tendências (baseado nos dados)

        Dados de Inteligência de Mercado:
        ${promptData}

        A análise deve ser estruturada em três seções: "Problemas e Desafios", "Oportunidades de Investimento" e "Fatos Recentes e Tendências".
        Use uma linguagem profissional e destaque os pontos mais críticos de cada seção.
        A resposta deve ser um objeto JSON no seguinte formato:
        {
            "problemas_desafios": [
                "Problema 1 com contexto dos dados",
                "Problema 2 com contexto dos dados"
            ],
            "oportunidades": [
                "Oportunidade 1 com contexto dos dados",
                "Oportunidade 2 com contexto dos dados"
            ],
            "fatos_tendencias": [
                "Fato/Tendência 1 com contexto dos dados",
                "Fato/Tendência 2 com contexto dos dados"
            ]
        }
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Você é um analista de mercado de saúde sênior que gera análises profundas em formato JSON baseadas em dados reais.'
                },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
        });

        const analysis = JSON.parse(completion.choices[0].message.content);

        res.json({
            status: 'success',
            analysis: analysis,
            message: 'Análise gerada pela OpenAI com sucesso.'
        });

    } catch (error) {
        console.error('Erro ao chamar a OpenAI:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao gerar análise com a OpenAI. Verifique a chave API e o log do servidor.',
            details: error.message
        });
    }
});

// Endpoint para listar todas as cidades disponíveis
app.get('/api/v1/cities', (req, res) => {
    const cities = mockData.map(d => ({
        ibge: d.municipio_ibge,
        nome: d.nome_municipio,
        uf: d.uf_sigla,
        populacao: d.populacao.municipal
    }));

    res.json({
        status: 'success',
        data: cities,
        total: cities.length
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`\n🚀 HM-I Tool API rodando em http://localhost:${port}`);
    console.log(`📊 Dados de ${mockData.length} cidades carregados`);
    console.log(`\nEndpoints disponíveis:`);
    console.log(`  GET  /api/v1/market-intelligence/:ibge_code`);
    console.log(`  GET  /api/v1/analysis/:ibge_code`);
    console.log(`  GET  /api/v1/cities\n`);
});
