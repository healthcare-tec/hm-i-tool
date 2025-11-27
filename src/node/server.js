const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Simulação de dados processados pelo Python (com métricas comparativas)
const mockData = [
    // Dados mockados que simulam o resultado do processamento Python (CNES + IBGE + CNPJ + Métricas Comparativas)
    {
        municipio_ibge: 3549904,
        nome_municipio: "São José dos Campos",
        uf_sigla: "SP",
        populacao: {
            municipal: 737314,
            uf: 12252023,
            brasil: 213421037,
            perc_pop_uf: 6.02,
            piramide_etaria: [
                { sexo: "Homens", idade_grupo: "0-4 anos", populacao: 35000 },
                { sexo: "Mulheres", idade_grupo: "0-4 anos", populacao: 33500 },
                { sexo: "Homens", idade_grupo: "5-9 anos", populacao: 37000 },
                { sexo: "Mulheres", idade_grupo: "5-9 anos", populacao: 35500 },
                { sexo: "Homens", idade_grupo: "10-14 anos", populacao: 39000 },
                { sexo: "Mulheres", idade_grupo: "10-14 anos", populacao: 37500 },
                { sexo: "Homens", idade_grupo: "15-19 anos", populacao: 40000 },
                { sexo: "Mulheres", idade_grupo: "15-19 anos", populacao: 38500 }
            ]
        },
        leitos: {
            total: 1500,
            razao_por_mil: 2.06,
            publico_perc: 35.0,
            privado_perc: 65.0,
            benchmarking: {
                nacional: 2.1,
                status: "Abaixo da Média Nacional"
            }
        },
        estabelecimentos: {
            por_tipo: {
                "Hospital": 10,
                "Clínica Especializada": 25,
                "Ambulatório": 50
            },
            benchmarking_nacional: {
                "Hospital": 5000,
                "Clínica Especializada": 10000,
                "Ambulatório": 20000
            }
        },
        planos_saude: {
            beneficiarios: 350000,
            cobertura_plano_saude_perc: 48.14,
            benchmarking: {
                nacional: 25.0,
                status: "Acima da Média Nacional"
            }
        },
        cnpj_enriquecido: {
            cnpj: "00000000000191",
            razao_social: "BANCO DO BRASIL SA",
            cnae_principal: "Bancos múltiplos, com carteira comercial",
            porte: "DEMAIS"
        }
    },
    {
        municipio_ibge: 3550308,
        nome_municipio: "São Paulo",
        uf_sigla: "SP",
        populacao: {
            municipal: 12396372,
            uf: 12252023,
            brasil: 213421037,
            perc_pop_uf: 101.18,
            piramide_etaria: [
                { sexo: "Homens", idade_grupo: "0-4 anos", populacao: 600000 },
                { sexo: "Mulheres", idade_grupo: "0-4 anos", populacao: 580000 },
                { sexo: "Homens", idade_grupo: "5-9 anos", populacao: 620000 },
                { sexo: "Mulheres", idade_grupo: "5-9 anos", populacao: 600000 },
                { sexo: "Homens", idade_grupo: "10-14 anos", populacao: 640000 },
                { sexo: "Mulheres", idade_grupo: "10-14 anos", populacao: 620000 },
                { sexo: "Homens", idade_grupo: "15-19 anos", populacao: 660000 },
                { sexo: "Mulheres", idade_grupo: "15-19 anos", populacao: 640000 }
            ]
        },
        leitos: {
            total: 25000,
            razao_por_mil: 2.02,
            publico_perc: 40.0,
            privado_perc: 60.0,
            benchmarking: {
                nacional: 2.1,
                status: "Abaixo da Média Nacional"
            }
        },
        estabelecimentos: {
            por_tipo: {
                "Hospital": 150,
                "Clínica Especializada": 500,
                "Ambulatório": 1000
            },
            benchmarking_nacional: {
                "Hospital": 5000,
                "Clínica Especializada": 10000,
                "Ambulatório": 20000
            }
        },
        planos_saude: {
            beneficiarios: 10000000,
            cobertura_plano_saude_perc: 80.66,
            benchmarking: {
                nacional: 25.0,
                status: "Acima da Média Nacional"
            }
        },
        cnpj_enriquecido: {
            cnpj: "99999999999999",
            razao_social: "CLINICA TESTE SA",
            cnae_principal: "Atividades de clínicas especializadas",
            porte: "DEMAIS"
        }
    },
    {
        municipio_ibge: 3304557,
        nome_municipio: "Rio de Janeiro",
        uf_sigla: "RJ",
        populacao: {
            municipal: 6747815,
            uf: 16055174,
            brasil: 213421037,
            perc_pop_uf: 42.08,
            piramide_etaria: [
                { sexo: "Homens", idade_grupo: "0-4 anos", populacao: 300000 },
                { sexo: "Mulheres", idade_grupo: "0-4 anos", populacao: 290000 },
                { sexo: "Homens", idade_grupo: "5-9 anos", populacao: 320000 },
                { sexo: "Mulheres", idade_grupo: "5-9 anos", populacao: 310000 },
                { sexo: "Homens", idade_grupo: "10-14 anos", populacao: 340000 },
                { sexo: "Mulheres", idade_grupo: "10-14 anos", populacao: 330000 },
                { sexo: "Homens", idade_grupo: "15-19 anos", populacao: 360000 },
                { sexo: "Mulheres", idade_grupo: "15-19 anos", populacao: 350000 }
            ]
        },
        leitos: {
            total: 18000,
            razao_por_mil: 2.67,
            publico_perc: 50.0,
            privado_perc: 50.0,
            benchmarking: {
                nacional: 2.1,
                status: "Acima da Média Nacional"
            }
        },
        estabelecimentos: {
            por_tipo: {
                "Hospital": 120,
                "Clínica Especializada": 400,
                "Ambulatório": 800
            },
            benchmarking_nacional: {
                "Hospital": 5000,
                "Clínica Especializada": 10000,
                "Ambulatório": 20000
            }
        },
        planos_saude: {
            beneficiarios: 6000000,
            cobertura_plano_saude_perc: 88.95,
            benchmarking: {
                nacional: 25.0,
                status: "Acima da Média Nacional"
            }
        },
        cnpj_enriquecido: {
            cnpj: "11111111111111",
            razao_social: "HOSPITAL RIO DE JANEIRO SA",
            cnae_principal: "Atividades de hospitais",
            porte: "DEMAIS"
        }
    },
    // --- Novos Mocks para SP ---
    {
        municipio_ibge: 3509007, // Campinas
        nome_municipio: "Campinas",
        uf_sigla: "SP",
        populacao: {
            municipal: 1213792,
            uf: 12252023,
            brasil: 213421037,
            perc_pop_uf: 9.91,
            piramide_etaria: [
                { sexo: "Homens", idade_grupo: "0-4 anos", populacao: 50000 },
                { sexo: "Mulheres", idade_grupo: "0-4 anos", populacao: 48000 }
            ]
        },
        leitos: {
            total: 3500,
            razao_por_mil: 2.88,
            publico_perc: 45.0,
            privado_perc: 55.0,
            benchmarking: {
                nacional: 2.1,
                status: "Acima da Média Nacional"
            }
        },
        estabelecimentos: {
            por_tipo: { "Hospital": 25, "Clínica Especializada": 100, "Ambulatório": 200 },
            benchmarking_nacional: { "Hospital": 5000, "Clínica Especializada": 10000, "Ambulatório": 20000 }
        },
        planos_saude: {
            beneficiarios: 500000,
            cobertura_plano_saude_perc: 41.19,
            benchmarking: {
                nacional: 25.0,
                status: "Acima da Média Nacional"
            }
        },
        cnpj_enriquecido: {
            cnpj: "22222222222222",
            razao_social: "HOSPITAL CAMPINAS SA",
            cnae_principal: "Atividades de hospitais",
            porte: "DEMAIS"
        }
    },
    {
        municipio_ibge: 3548906, // Santos
        nome_municipio: "Santos",
        uf_sigla: "SP",
        populacao: {
            municipal: 433991,
            uf: 12252023,
            brasil: 213421037,
            perc_pop_uf: 3.54,
            piramide_etaria: [
                { sexo: "Homens", idade_grupo: "0-4 anos", populacao: 15000 },
                { sexo: "Mulheres", idade_grupo: "0-4 anos", populacao: 14000 }
            ]
        },
        leitos: {
            total: 1200,
            razao_por_mil: 2.76,
            publico_perc: 55.0,
            privado_perc: 45.0,
            benchmarking: {
                nacional: 2.1,
                status: "Acima da Média Nacional"
            }
        },
        estabelecimentos: {
            por_tipo: { "Hospital": 15, "Clínica Especializada": 50, "Ambulatório": 100 },
            benchmarking_nacional: { "Hospital": 5000, "Clínica Especializada": 10000, "Ambulatório": 20000 }
        },
        planos_saude: {
            beneficiarios: 250000,
            cobertura_plano_saude_perc: 57.60,
            benchmarking: {
                nacional: 25.0,
                status: "Acima da Média Nacional"
            }
        },
        cnpj_enriquecido: {
            cnpj: "33333333333333",
            razao_social: "CLINICA SANTOS SA",
            cnae_principal: "Atividades de clínicas especializadas",
            porte: "DEMAIS"
        }
    },
    {
        municipio_ibge: 3552403, // Sorocaba
        nome_municipio: "Sorocaba",
        uf_sigla: "SP",
        populacao: {
            municipal: 723553,
            uf: 12252023,
            brasil: 213421037,
            perc_pop_uf: 5.91,
            piramide_etaria: [
                { sexo: "Homens", idade_grupo: "0-4 anos", populacao: 30000 },
                { sexo: "Mulheres", idade_grupo: "0-4 anos", populacao: 28000 }
            ]
        },
        leitos: {
            total: 1800,
            razao_por_mil: 2.49,
            publico_perc: 30.0,
            privado_perc: 70.0,
            benchmarking: {
                nacional: 2.1,
                status: "Acima da Média Nacional"
            }
        },
        estabelecimentos: {
            por_tipo: { "Hospital": 18, "Clínica Especializada": 60, "Ambulatório": 120 },
            benchmarking_nacional: { "Hospital": 5000, "Clínica Especializada": 10000, "Ambulatório": 20000 }
        },
        planos_saude: {
            beneficiarios: 300000,
            cobertura_plano_saude_perc: 41.46,
            benchmarking: {
                nacional: 25.0,
                status: "Acima da Média Nacional"
            }
        },
        cnpj_enriquecido: {
            cnpj: "44444444444444",
            razao_social: "HOSPITAL SOROCABA SA",
            cnae_principal: "Atividades de hospitais",
            porte: "DEMAIS"
        }
    },
    // --- Novo Mock para RJ ---
    {
        municipio_ibge: 3303302, // Niterói
        nome_municipio: "Niterói",
        uf_sigla: "RJ",
        populacao: {
            municipal: 516986,
            uf: 16055174,
            brasil: 213421037,
            perc_pop_uf: 3.22,
            piramide_etaria: [
                { sexo: "Homens", idade_grupo: "0-4 anos", populacao: 12000 },
                { sexo: "Mulheres", idade_grupo: "0-4 anos", populacao: 11000 }
            ]
        },
        leitos: {
            total: 1500,
            razao_por_mil: 2.90,
            publico_perc: 60.0,
            privado_perc: 40.0,
            benchmarking: {
                nacional: 2.1,
                status: "Acima da Média Nacional"
            }
        },
        estabelecimentos: {
            por_tipo: { "Hospital": 10, "Clínica Especializada": 40, "Ambulatório": 80 },
            benchmarking_nacional: { "Hospital": 5000, "Clínica Especializada": 10000, "Ambulatório": 20000 }
        },
        planos_saude: {
            beneficiarios: 350000,
            cobertura_plano_saude_perc: 67.70,
            benchmarking: {
                nacional: 25.0,
                status: "Acima da Média Nacional"
            }
        },
        cnpj_enriquecido: {
            cnpj: "55555555555555",
            razao_social: "CLINICA NITEROI SA",
            cnae_principal: "Atividades de clínicas especializadas",
            porte: "DEMAIS"
        }
    },
    // --- Novo Mock para MG ---
    {
        municipio_ibge: 3106200, // Belo Horizonte
        nome_municipio: "Belo Horizonte",
        uf_sigla: "MG",
        populacao: {
            municipal: 2530701,
            uf: 21168791,
            brasil: 213421037,
            perc_pop_uf: 11.95,
            piramide_etaria: [
                { sexo: "Homens", idade_grupo: "0-4 anos", populacao: 100000 },
                { sexo: "Mulheres", idade_grupo: "0-4 anos", populacao: 95000 }
            ]
        },
        leitos: {
            total: 6000,
            razao_por_mil: 2.37,
            publico_perc: 40.0,
            privado_perc: 60.0,
            benchmarking: {
                nacional: 2.1,
                status: "Acima da Média Nacional"
            }
        },
        estabelecimentos: {
            por_tipo: { "Hospital": 50, "Clínica Especializada": 200, "Ambulatório": 400 },
            benchmarking_nacional: { "Hospital": 5000, "Clínica Especializada": 10000, "Ambulatório": 20000 }
        },
        planos_saude: {
            beneficiarios: 1500000,
            cobertura_plano_saude_perc: 59.27,
            benchmarking: {
                nacional: 25.0,
                status: "Acima da Média Nacional"
            }
        },
        cnpj_enriquecido: {
            cnpj: "66666666666666",
            razao_social: "HOSPITAL BELO HORIZONTE SA",
            cnae_principal: "Atividades de hospitais",
            porte: "DEMAIS"
        }
    }
];

// Endpoint da API para buscar dados de inteligência de mercado
app.get('/api/v1/market-intelligence/:ibge_code', (req, res) => {
    const ibgeCode = parseInt(req.params.ibge_code);
    
    // Simula a busca no "Data Warehouse" (que seria populado pelo Python)
    const result = mockData.find(data => data.municipio_ibge === ibgeCode);

    if (result) {
        res.json({
            status: 'success',
            data: result,
            message: 'Dados de inteligência de mercado recuperados com sucesso (Mock com métricas comparativas).'
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
