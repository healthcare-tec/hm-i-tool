const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Simulação de dados processados pelo Python
const mockData = [
    // Dados mockados que simulam o resultado do processamento Python (CNES + IBGE + CNPJ)
    {
        municipio_ibge: 3549904,
        nome_municipio: "São José dos Campos",
        populacao_total: 737314,
        cnpj_enriquecido: {
            cnpj: "00000000000191",
            razao_social: "BANCO DO BRASIL SA (Exemplo de enriquecimento CNPJ)"
        },
        leitos_total: 1500,
        razao_leitos_por_mil: (1500 / 737.314).toFixed(2) // Exemplo de agregação
    },
    {
        municipio_ibge: 3550308,
        nome_municipio: "São Paulo",
        populacao_total: 12396372,
        cnpj_enriquecido: {
            cnpj: "99999999999999",
            razao_social: "CLINICA TESTE SA (Exemplo de enriquecimento CNPJ)"
        },
        leitos_total: 25000,
        razao_leitos_por_mil: (25000 / 12396.372).toFixed(2)
    }
];

// Endpoint de exemplo: Retorna a inteligência de mercado para um município
app.get('/api/v1/market-intelligence/:ibge_code', (req, res) => {
    const ibgeCode = parseInt(req.params.ibge_code);
    
    // Simula a busca no "Data Warehouse" (que seria populado pelo Python)
    const result = mockData.find(data => data.municipio_ibge === ibgeCode);

    if (result) {
        res.json({
            status: 'success',
            data: result,
            message: 'Dados de inteligência de mercado recuperados com sucesso (Mock).'
        });
    } else {
        res.status(404).json({
            status: 'error',
            message: `Dados não encontrados para o código IBGE: ${ibgeCode}`
        });
    }
});

// Endpoint raiz (serve o index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`HM-I Tool API rodando em http://localhost:${PORT}`);
    console.log(`Acesse http://localhost:${PORT}/ para usar a interface web.`);
});
