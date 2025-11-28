const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Dados mockados de inteligência de mercado
const mockData = [
    {
        municipio_ibge: 3549904,
        nome_municipio: "São José dos Campos",
        uf_sigla: "SP",
        populacao: {
            municipal: 737314,
            uf: 46649132,
            brasil: 213421037,
            perc_pop_uf: 1.58,
            piramide_etaria: [
                { sexo: "Homens", idade_grupo: "0-4 anos", populacao: 25000 },
                { sexo: "Mulheres", idade_grupo: "0-4 anos", populacao: 24000 },
                { sexo: "Homens", idade_grupo: "5-9 anos", populacao: 26000 },
                { sexo: "Mulheres", idade_grupo: "5-9 anos", populacao: 25000 },
                { sexo: "Homens", idade_grupo: "10-14 anos", populacao: 27000 },
                { sexo: "Mulheres", idade_grupo: "10-14 anos", populacao: 26000 },
                { sexo: "Homens", idade_grupo: "15-19 anos", populacao: 28000 },
                { sexo: "Mulheres", idade_grupo: "15-19 anos", populacao: 27000 },
                { sexo: "Homens", idade_grupo: "20-24 anos", populacao: 30000 },
                { sexo: "Mulheres", idade_grupo: "20-24 anos", populacao: 29000 },
                { sexo: "Homens", idade_grupo: "25-29 anos", populacao: 32000 },
                { sexo: "Mulheres", idade_grupo: "25-29 anos", populacao: 31000 },
                { sexo: "Homens", idade_grupo: "30-34 anos", populacao: 34000 },
                { sexo: "Mulheres", idade_grupo: "30-34 anos", populacao: 33000 },
                { sexo: "Homens", idade_grupo: "35-39 anos", populacao: 33000 },
                { sexo: "Mulheres", idade_grupo: "35-39 anos", populacao: 32000 },
                { sexo: "Homens", idade_grupo: "40-44 anos", populacao: 32000 },
                { sexo: "Mulheres", idade_grupo: "40-44 anos", populacao: 31000 },
                { sexo: "Homens", idade_grupo: "45-49 anos", populacao: 31000 },
                { sexo: "Mulheres", idade_grupo: "45-49 anos", populacao: 30000 },
                { sexo: "Homens", idade_grupo: "50-54 anos", populacao: 30000 },
                { sexo: "Mulheres", idade_grupo: "50-54 anos", populacao: 29000 },
                { sexo: "Homens", idade_grupo: "55-59 anos", populacao: 29000 },
                { sexo: "Mulheres", idade_grupo: "55-59 anos", populacao: 28000 },
                { sexo: "Homens", idade_grupo: "60-64 anos", populacao: 28000 },
                { sexo: "Mulheres", idade_grupo: "60-64 anos", populacao: 27000 },
                { sexo: "Homens", idade_grupo: "65-69 anos", populacao: 25000 },
                { sexo: "Mulheres", idade_grupo: "65-69 anos", populacao: 24000 },
                { sexo: "Homens", idade_grupo: "70-74 anos", populacao: 20000 },
                { sexo: "Mulheres", idade_grupo: "70-74 anos", populacao: 19000 },
                { sexo: "Homens", idade_grupo: "75-79 anos", populacao: 15000 },
                { sexo: "Mulheres", idade_grupo: "75-79 anos", populacao: 14000 },
                { sexo: "Homens", idade_grupo: "80+ anos", populacao: 10000 },
                { sexo: "Mulheres", idade_grupo: "80+ anos", populacao: 9000 }
            ],
            indices_demograficos: {
                criancas_pea: 0.40, // Crianças (0-14) / PEA (15-59)
                idosos_pea: 0.25, // Idosos (60+) / PEA (15-59)
            }
        },
        saude: {
            leitos_total: 1500,
            razao_leitos_por_mil: 2.03,
            leitos_publicos_perc: 40.0,
            leitos_privados_perc: 60.0,
            benchmarking: {
                nacional: 2.1,
                status: "Abaixo da Média Nacional"
            },
            estabelecimentos_estratificados: [
                { tipo: "Hospital", total: 10, perc_nacional: 0.5, perc_uf: 1.2 },
                { tipo: "Clínica", total: 150, perc_nacional: 0.8, perc_uf: 1.5 },
                { tipo: "Ambulatório", total: 50, perc_nacional: 0.3, perc_uf: 0.9 }
            ],
            top_5_estabelecimentos: [
                { nome: "Hospital Municipal SJC", leitos: 350, natureza: "Público" },
                { nome: "Hospital Privado A", leitos: 250, natureza: "Privado" },
                { nome: "Hospital Filantrópico B", leitos: 150, natureza: "Filantrópico" },
                { nome: "Hospital Privado C", leitos: 100, natureza: "Privado" },
                { nome: "Maternidade D", leitos: 80, natureza: "Público" }
            ]
        },
        planos_saude: {
            beneficiarios: 250000,
            cobertura_plano_saude_perc: 33.9,
            benchmarking: {
                nacional: 25.0,
                status: "Acima da Média Nacional"
            },
            ans_enriquecimento: {
                indice_reclamacoes: 0.85,
                status: "Baixo"
            }
        },
        cnpj_enriquecido: {
            cnpj: "99999999999999",
            razao_social: "CLINICA TESTE SA",
            cnae_principal: "Atividades de clínicas especializadas",
            porte: "DEMAIS"
        },
        // --- NOVO: MERCADO DE TRABALHO E EMPRESAS (CAGED) ---
        mercado_trabalho: {
            salario_medio_admissao: 2850.50,
            estoque_empregos: 350000,
            saldo_empregos_mes: 1500,
            taxa_desemprego: 6.5,
            empresas_total: 45000,
            perc_empresas_uf: 4.5,
            benchmarking: {
                salario_nacional: 2500.00,
                desemprego_nacional: 8.5,
                status_salario: "Acima da Média Nacional",
                status_desemprego: "Abaixo da Média Nacional",
                status_tendencia: "Crescimento"
            }
        }
    },
    {
        municipio_ibge: 3550308,
        nome_municipio: "São Paulo",
        uf_sigla: "SP",
        populacao: {
            municipal: 12396372,
            uf: 46649132,
            brasil: 213421037,
            perc_pop_uf: 26.57,
            piramide_etaria: [
                { sexo: "Homens", idade_grupo: "0-4 anos", populacao: 500000 },
                { sexo: "Mulheres", idade_grupo: "0-4 anos", populacao: 480000 },
                { sexo: "Homens", idade_grupo: "5-9 anos", populacao: 520000 },
                { sexo: "Mulheres", idade_grupo: "5-9 anos", populacao: 500000 },
                { sexo: "Homens", idade_grupo: "10-14 anos", populacao: 540000 },
                { sexo: "Mulheres", idade_grupo: "10-14 anos", populacao: 520000 },
                { sexo: "Homens", idade_grupo: "15-19 anos", populacao: 560000 },
                { sexo: "Mulheres", idade_grupo: "15-19 anos", populacao: 540000 },
                { sexo: "Homens", idade_grupo: "20-24 anos", populacao: 580000 },
                { sexo: "Mulheres", idade_grupo: "20-24 anos", populacao: 560000 },
                { sexo: "Homens", idade_grupo: "25-29 anos", populacao: 600000 },
                { sexo: "Mulheres", idade_grupo: "25-29 anos", populacao: 580000 },
                { sexo: "Homens", idade_grupo: "30-34 anos", populacao: 620000 },
                { sexo: "Mulheres", idade_grupo: "30-34 anos", populacao: 600000 },
                { sexo: "Homens", idade_grupo: "35-39 anos", populacao: 600000 },
                { sexo: "Mulheres", idade_grupo: "35-39 anos", populacao: 580000 },
                { sexo: "Homens", idade_grupo: "40-44 anos", populacao: 580000 },
                { sexo: "Mulheres", idade_grupo: "40-44 anos", populacao: 560000 },
                { sexo: "Homens", idade_grupo: "45-49 anos", populacao: 560000 },
                { sexo: "Mulheres", idade_grupo: "45-49 anos", populacao: 540000 },
                { sexo: "Homens", idade_grupo: "50-54 anos", populacao: 540000 },
                { sexo: "Mulheres", idade_grupo: "50-54 anos", populacao: 520000 },
                { sexo: "Homens", idade_grupo: "55-59 anos", populacao: 520000 },
                { sexo: "Mulheres", idade_grupo: "55-59 anos", populacao: 500000 },
                { sexo: "Homens", idade_grupo: "60-64 anos", populacao: 500000 },
                { sexo: "Mulheres", idade_grupo: "60-64 anos", populacao: 480000 },
                { sexo: "Homens", idade_grupo: "65-69 anos", populacao: 450000 },
                { sexo: "Mulheres", idade_grupo: "65-69 anos", populacao: 430000 },
                { sexo: "Homens", idade_grupo: "70-74 anos", populacao: 400000 },
                { sexo: "Mulheres", idade_grupo: "70-74 anos", populacao: 380000 },
                { sexo: "Homens", idade_grupo: "75-79 anos", populacao: 350000 },
                { sexo: "Mulheres", idade_grupo: "75-79 anos", populacao: 330000 },
                { sexo: "Homens", idade_grupo: "80+ anos", populacao: 300000 },
                { sexo: "Mulheres", idade_grupo: "80+ anos", populacao: 280000 }
            ],
            indices_demograficos: {
                criancas_pea: 0.35,
                idosos_pea: 0.28,
            }
        },
        saude: {
            leitos_total: 25000,
            razao_leitos_por_mil: 2.01,
            leitos_publicos_perc: 35.0,
            leitos_privados_perc: 65.0,
            benchmarking: {
                nacional: 2.1,
                status: "Abaixo da Média Nacional"
            },
            estabelecimentos_estratificados: [
                { tipo: "Hospital", total: 150, perc_nacional: 7.5, perc_uf: 15.0 },
                { tipo: "Clínica", total: 5000, perc_nacional: 10.0, perc_uf: 20.0 },
                { tipo: "Ambulatório", total: 2000, perc_nacional: 5.0, perc_uf: 10.0 }
            ],
            top_5_estabelecimentos: [
                { nome: "Hospital das Clínicas", leitos: 1500, natureza: "Público" },
                { nome: "Hospital Albert Einstein", leitos: 800, natureza: "Privado" },
                { nome: "Santa Casa de Misericórdia", leitos: 700, natureza: "Filantrópico" },
                { nome: "Hospital Sírio-Libanês", leitos: 650, natureza: "Privado" },
                { nome: "Hospital São Paulo", leitos: 600, natureza: "Público" }
            ]
        },
        planos_saude: {
            beneficiarios: 10000000,
            cobertura_plano_saude_perc: 80.66,
            benchmarking: {
                nacional: 25.0,
                status: "Acima da Média Nacional"
            },
            ans_enriquecimento: {
                indice_reclamacoes: 1.2,
                status: "Médio"
            }
        },
        cnpj_enriquecido: {
            cnpj: "99999999999999",
            razao_social: "CLINICA TESTE SA",
            cnae_principal: "Atividades de clínicas especializadas",
            porte: "DEMAIS"
        },
        // --- NOVO: MERCADO DE TRABALHO E EMPRESAS (CAGED) ---
        mercado_trabalho: {
            salario_medio_admissao: 3500.00,
            estoque_empregos: 5000000,
            saldo_empregos_mes: 15000,
            taxa_desemprego: 8.0,
            empresas_total: 500000,
            perc_empresas_uf: 50.0,
            benchmarking: {
                salario_nacional: 2500.00,
                desemprego_nacional: 8.5,
                status_salario: "Acima da Média Nacional",
                status_desemprego: "Abaixo da Média Nacional",
                status_tendencia: "Crescimento"
            }
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
                { sexo: "Mulheres", idade_grupo: "15-19 anos", populacao: 350000 },
                { sexo: "Homens", idade_grupo: "20-24 anos", populacao: 380000 },
                { sexo: "Mulheres", idade_grupo: "20-24 anos", populacao: 370000 },
                { sexo: "Homens", idade_grupo: "25-29 anos", populacao: 400000 },
                { sexo: "Mulheres", idade_grupo: "25-29 anos", populacao: 390000 },
                { sexo: "Homens", idade_grupo: "30-34 anos", populacao: 420000 },
                { sexo: "Mulheres", idade_grupo: "30-34 anos", populacao: 410000 },
                { sexo: "Homens", idade_grupo: "35-39 anos", populacao: 400000 },
                { sexo: "Mulheres", idade_grupo: "35-39 anos", populacao: 390000 },
                { sexo: "Homens", idade_grupo: "40-44 anos", populacao: 380000 },
                { sexo: "Mulheres", idade_grupo: "40-44 anos", populacao: 370000 },
                { sexo: "Homens", idade_grupo: "45-49 anos", populacao: 360000 },
                { sexo: "Mulheres", idade_grupo: "45-49 anos", populacao: 350000 },
                { sexo: "Homens", idade_grupo: "50-54 anos", populacao: 340000 },
                { sexo: "Mulheres", idade_grupo: "50-54 anos", populacao: 330000 },
                { sexo: "Homens", idade_grupo: "55-59 anos", populacao: 320000 },
                { sexo: "Mulheres", idade_grupo: "55-59 anos", populacao: 310000 },
                { sexo: "Homens", idade_grupo: "60-64 anos", populacao: 300000 },
                { sexo: "Mulheres", idade_grupo: "60-64 anos", populacao: 290000 },
                { sexo: "Homens", idade_grupo: "65-69 anos", populacao: 250000 },
                { sexo: "Mulheres", idade_grupo: "65-69 anos", populacao: 240000 },
                { sexo: "Homens", idade_grupo: "70-74 anos", populacao: 200000 },
                { sexo: "Mulheres", idade_grupo: "70-74 anos", populacao: 190000 },
                { sexo: "Homens", idade_grupo: "75-79 anos", populacao: 150000 },
                { sexo: "Mulheres", idade_grupo: "75-79 anos", populacao: 140000 },
                { sexo: "Homens", idade_grupo: "80+ anos", populacao: 100000 },
                { sexo: "Mulheres", idade_grupo: "80+ anos", populacao: 90000 }
            ],
            indices_demograficos: {
                criancas_pea: 0.38,
                idosos_pea: 0.30,
            }
        },
        saude: {
            leitos_total: 15000,
            razao_leitos_por_mil: 2.22,
            leitos_publicos_perc: 45.0,
            leitos_privados_perc: 55.0,
            benchmarking: {
                nacional: 2.1,
                status: "Acima da Média Nacional"
            },
            estabelecimentos_estratificados: [
                { tipo: "Hospital", total: 100, perc_nacional: 5.0, perc_uf: 10.0 },
                { tipo: "Clínica", total: 3000, perc_nacional: 6.0, perc_uf: 12.0 },
                { tipo: "Ambulatório", total: 1500, perc_nacional: 3.75, perc_uf: 7.5 }
            ],
            top_5_estabelecimentos: [
                { nome: "Hospital Federal dos Servidores", leitos: 800, natureza: "Público" },
                { nome: "Hospital Copa D'Or", leitos: 500, natureza: "Privado" },
                { nome: "Hospital Maternidade Pro Matre", leitos: 400, natureza: "Privado" },
                { nome: "Hospital da Lagoa", leitos: 350, natureza: "Público" },
                { nome: "Hospital São Francisco", leitos: 300, natureza: "Filantrópico" }
            ]
        },
        planos_saude: {
            beneficiarios: 4000000,
            cobertura_plano_saude_perc: 59.28,
            benchmarking: {
                nacional: 25.0,
                status: "Acima da Média Nacional"
            },
            ans_enriquecimento: {
                indice_reclamacoes: 2.5,
                status: "Alto"
            }
        },
        cnpj_enriquecido: {
            cnpj: "99999999999999",
            razao_social: "CLINICA TESTE SA",
            cnae_principal: "Atividades de clínicas especializadas",
            porte: "DEMAIS"
        },
        // --- NOVO: MERCADO DE TRABALHO E EMPRESAS (CAGED) ---
        mercado_trabalho: {
            salario_medio_admissao: 3100.00,
            estoque_empregos: 2500000,
            saldo_empregos_mes: 5000,
            taxa_desemprego: 9.5,
            empresas_total: 200000,
            perc_empresas_uf: 30.0,
            benchmarking: {
                salario_nacional: 2500.00,
                desemprego_nacional: 8.5,
                status_salario: "Acima da Média Nacional",
                status_desemprego: "Acima da Média Nacional",
                status_tendencia: "Crescimento"
            }
        }
    },
    {
        municipio_ibge: 3509007,
        nome_municipio: "Campinas",
        uf_sigla: "SP",
        populacao: {
            municipal: 1213792,
            uf: 46649132,
            brasil: 213421037,
            perc_pop_uf: 2.60,
            piramide_etaria: [
                { sexo: "Homens", idade_grupo: "0-4 anos", populacao: 40000 },
                { sexo: "Mulheres", idade_grupo: "0-4 anos", populacao: 38000 },
                { sexo: "Homens", idade_grupo: "5-9 anos", populacao: 42000 },
                { sexo: "Mulheres", idade_grupo: "5-9 anos", populacao: 40000 },
                { sexo: "Homens", idade_grupo: "10-14 anos", populacao: 44000 },
                { sexo: "Mulheres", idade_grupo: "10-14 anos", populacao: 42000 },
                { sexo: "Homens", idade_grupo: "15-19 anos", populacao: 46000 },
                { sexo: "Mulheres", idade_grupo: "15-19 anos", populacao: 44000 },
                { sexo: "Homens", idade_grupo: "20-24 anos", populacao: 48000 },
                { sexo: "Mulheres", idade_grupo: "20-24 anos", populacao: 46000 },
                { sexo: "Homens", idade_grupo: "25-29 anos", populacao: 50000 },
                { sexo: "Mulheres", idade_grupo: "25-29 anos", populacao: 48000 },
                { sexo: "Homens", idade_grupo: "30-34 anos", populacao: 52000 },
                { sexo: "Mulheres", idade_grupo: "30-34 anos", populacao: 50000 },
                { sexo: "Homens", idade_grupo: "35-39 anos", populacao: 50000 },
                { sexo: "Mulheres", idade_grupo: "35-39 anos", populacao: 48000 },
                { sexo: "Homens", idade_grupo: "40-44 anos", populacao: 48000 },
                { sexo: "Mulheres", idade_grupo: "40-44 anos", populacao: 46000 },
                { sexo: "Homens", idade_grupo: "45-49 anos", populacao: 46000 },
                { sexo: "Mulheres", idade_grupo: "45-49 anos", populacao: 44000 },
                { sexo: "Homens", idade_grupo: "50-54 anos", populacao: 44000 },
                { sexo: "Mulheres", idade_grupo: "50-54 anos", populacao: 42000 },
                { sexo: "Homens", idade_grupo: "55-59 anos", populacao: 42000 },
                { sexo: "Mulheres", idade_grupo: "55-59 anos", populacao: 40000 },
                { sexo: "Homens", idade_grupo: "60-64 anos", populacao: 40000 },
                { sexo: "Mulheres", idade_grupo: "60-64 anos", populacao: 38000 },
                { sexo: "Homens", idade_grupo: "65-69 anos", populacao: 35000 },
                { sexo: "Mulheres", idade_grupo: "65-69 anos", populacao: 33000 },
                { sexo: "Homens", idade_grupo: "70-74 anos", populacao: 30000 },
                { sexo: "Mulheres", idade_grupo: "70-74 anos", populacao: 28000 },
                { sexo: "Homens", idade_grupo: "75-79 anos", populacao: 25000 },
                { sexo: "Mulheres", idade_grupo: "75-79 anos", populacao: 23000 },
                { sexo: "Homens", idade_grupo: "80+ anos", populacao: 20000 },
                { sexo: "Mulheres", idade_grupo: "80+ anos", populacao: 18000 }
            ],
            indices_demograficos: {
                criancas_pea: 0.36,
                idosos_pea: 0.27,
            }
        },
        saude: {
            leitos_total: 3000,
            razao_leitos_por_mil: 2.47,
            leitos_publicos_perc: 30.0,
            leitos_privados_perc: 70.0,
            benchmarking: {
                nacional: 2.1,
                status: "Acima da Média Nacional"
            },
            estabelecimentos_estratificados: [
                { tipo: "Hospital", total: 20, perc_nacional: 1.0, perc_uf: 2.0 },
                { tipo: "Clínica", total: 400, perc_nacional: 0.8, perc_uf: 1.6 },
                { tipo: "Ambulatório", total: 150, perc_nacional: 0.375, perc_uf: 0.75 }
            ],
            top_5_estabelecimentos: [
                { nome: "Hospital de Clínicas UNICAMP", leitos: 500, natureza: "Público" },
                { nome: "Hospital Vera Cruz", leitos: 350, natureza: "Privado" },
                { nome: "Hospital Mário Gatti", leitos: 300, natureza: "Público" },
                { nome: "Hospital Renascença", leitos: 250, natureza: "Privado" },
                { nome: "Hospital Santa Tereza", leitos: 200, natureza: "Filantrópico" }
            ]
        },
        planos_saude: {
            beneficiarios: 450000,
            cobertura_plano_saude_perc: 37.07,
            benchmarking: {
                nacional: 25.0,
                status: "Acima da Média Nacional"
            },
            ans_enriquecimento: {
                indice_reclamacoes: 0.9,
                status: "Baixo"
            }
        },
        cnpj_enriquecido: {
            cnpj: "99999999999999",
            razao_social: "CLINICA TESTE SA",
            cnae_principal: "Atividades de clínicas especializadas",
            porte: "DEMAIS"
        },
        // --- NOVO: MERCADO DE TRABALHO E EMPRESAS (CAGED) ---
        mercado_trabalho: {
            salario_medio_admissao: 2700.00,
            estoque_empregos: 150000,
            saldo_empregos_mes: 500,
            taxa_desemprego: 7.0,
            empresas_total: 18000,
            perc_empresas_uf: 1.8,
            benchmarking: {
                salario_nacional: 2500.00,
                desemprego_nacional: 8.5,
                status_salario: "Acima da Média Nacional",
                status_desemprego: "Abaixo da Média Nacional",
                status_tendencia: "Crescimento"
            }
        }
    },
    {
        municipio_ibge: 3548906,
        nome_municipio: "Santos",
        uf_sigla: "SP",
        populacao: {
            municipal: 433991,
            uf: 46649132,
            brasil: 213421037,
            perc_pop_uf: 0.93,
            piramide_etaria: [
                { sexo: "Homens", idade_grupo: "0-4 anos", populacao: 10000 },
                { sexo: "Mulheres", idade_grupo: "0-4 anos", populacao: 9000 },
                { sexo: "Homens", idade_grupo: "5-9 anos", populacao: 11000 },
                { sexo: "Mulheres", idade_grupo: "5-9 anos", populacao: 10000 },
                { sexo: "Homens", idade_grupo: "10-14 anos", populacao: 12000 },
                { sexo: "Mulheres", idade_grupo: "10-14 anos", populacao: 11000 },
                { sexo: "Homens", idade_grupo: "15-19 anos", populacao: 13000 },
                { sexo: "Mulheres", idade_grupo: "15-19 anos", populacao: 12000 },
                { sexo: "Homens", idade_grupo: "20-24 anos", populacao: 14000 },
                { sexo: "Mulheres", idade_grupo: "20-24 anos", populacao: 13000 },
                { sexo: "Homens", idade_grupo: "25-29 anos", populacao: 15000 },
                { sexo: "Mulheres", idade_grupo: "25-29 anos", populacao: 14000 },
                { sexo: "Homens", idade_grupo: "30-34 anos", populacao: 16000 },
                { sexo: "Mulheres", idade_grupo: "30-34 anos", populacao: 15000 },
                { sexo: "Homens", idade_grupo: "35-39 anos", populacao: 15000 },
                { sexo: "Mulheres", idade_grupo: "35-39 anos", populacao: 14000 },
                { sexo: "Homens", idade_grupo: "40-44 anos", populacao: 14000 },
                { sexo: "Mulheres", idade_grupo: "40-44 anos", populacao: 13000 },
                { sexo: "Homens", idade_grupo: "45-49 anos", populacao: 13000 },
                { sexo: "Mulheres", idade_grupo: "45-49 anos", populacao: 12000 },
                { sexo: "Homens", idade_grupo: "50-54 anos", populacao: 12000 },
                { sexo: "Mulheres", idade_grupo: "50-54 anos", populacao: 11000 },
                { sexo: "Homens", idade_grupo: "55-59 anos", populacao: 11000 },
                { sexo: "Mulheres", idade_grupo: "55-59 anos", populacao: 10000 },
                { sexo: "Homens", idade_grupo: "60-64 anos", populacao: 10000 },
                { sexo: "Mulheres", idade_grupo: "60-64 anos", populacao: 9000 },
                { sexo: "Homens", idade_grupo: "65-69 anos", populacao: 9000 },
                { sexo: "Mulheres", idade_grupo: "65-69 anos", populacao: 8000 },
                { sexo: "Homens", idade_grupo: "70-74 anos", populacao: 8000 },
                { sexo: "Mulheres", idade_grupo: "70-74 anos", populacao: 7000 },
                { sexo: "Homens", idade_grupo: "75-79 anos", populacao: 7000 },
                { sexo: "Mulheres", idade_grupo: "75-79 anos", populacao: 6000 },
                { sexo: "Homens", idade_grupo: "80+ anos", populacao: 6000 },
                { sexo: "Mulheres", idade_grupo: "80+ anos", populacao: 5000 }
            ],
            indices_demograficos: {
                criancas_pea: 0.30,
                idosos_pea: 0.35,
            }
        },
        saude: {
            leitos_total: 1200,
            razao_leitos_por_mil: 2.76,
            leitos_publicos_perc: 50.0,
            leitos_privados_perc: 50.0,
            benchmarking: {
                nacional: 2.1,
                status: "Acima da Média Nacional"
            },
            estabelecimentos_estratificados: [
                { tipo: "Hospital", total: 8, perc_nacional: 0.4, perc_uf: 0.8 },
                { tipo: "Clínica", total: 120, perc_nacional: 0.24, perc_uf: 0.48 },
                { tipo: "Ambulatório", total: 40, perc_nacional: 0.1, perc_uf: 0.2 }
            ],
            top_5_estabelecimentos: [
                { nome: "Santa Casa de Santos", leitos: 400, natureza: "Filantrópico" },
                { nome: "Hospital Guilherme Álvaro", leitos: 300, natureza: "Público" },
                { nome: "Hospital Ana Costa", leitos: 200, natureza: "Privado" },
                { nome: "Hospital Beneficência Portuguesa", leitos: 150, natureza: "Filantrópico" },
                { nome: "Hospital dos Estivadores", leitos: 100, natureza: "Público" }
            ]
        },
        planos_saude: {
            beneficiarios: 150000,
            cobertura_plano_saude_perc: 34.56,
            benchmarking: {
                nacional: 25.0,
                status: "Acima da Média Nacional"
            },
            ans_enriquecimento: {
                indice_reclamacoes: 1.5,
                status: "Médio"
            }
        },
        cnpj_enriquecido: {
            cnpj: "99999999999999",
            razao_social: "CLINICA TESTE SA",
            cnae_principal: "Atividades de clínicas especializadas",
            porte: "DEMAIS"
        },
        // --- NOVO: MERCADO DE TRABALHO E EMPRESAS (CAGED) ---
        mercado_trabalho: {
            salario_medio_admissao: 2950.00,
            estoque_empregos: 200000,
            saldo_empregos_mes: -200,
            taxa_desemprego: 7.5,
            empresas_total: 25000,
            perc_empresas_uf: 2.5,
            benchmarking: {
                salario_nacional: 2500.00,
                desemprego_nacional: 8.5,
                status_salario: "Acima da Média Nacional",
                status_desemprego: "Abaixo da Média Nacional",
                status_tendencia: "Queda"
            }
        }
    },
    {
        municipio_ibge: 3552403,
        nome_municipio: "Sorocaba",
        uf_sigla: "SP",
        populacao: {
            municipal: 723000,
            uf: 46649132,
            brasil: 213421037,
            perc_pop_uf: 1.55,
            piramide_etaria: [
                { sexo: "Homens", idade_grupo: "0-4 anos", populacao: 24000 },
                { sexo: "Mulheres", idade_grupo: "0-4 anos", populacao: 23000 },
                { sexo: "Homens", idade_grupo: "5-9 anos", populacao: 25000 },
                { sexo: "Mulheres", idade_grupo: "5-9 anos", populacao: 24000 },
                { sexo: "Homens", idade_grupo: "10-14 anos", populacao: 26000 },
                { sexo: "Mulheres", idade_grupo: "10-14 anos", populacao: 25000 },
                { sexo: "Homens", idade_grupo: "15-19 anos", populacao: 27000 },
                { sexo: "Mulheres", idade_grupo: "15-19 anos", populacao: 26000 },
                { sexo: "Homens", idade_grupo: "20-24 anos", populacao: 29000 },
                { sexo: "Mulheres", idade_grupo: "20-24 anos", populacao: 28000 },
                { sexo: "Homens", idade_grupo: "25-29 anos", populacao: 31000 },
                { sexo: "Mulheres", idade_grupo: "25-29 anos", populacao: 30000 },
                { sexo: "Homens", idade_grupo: "30-34 anos", populacao: 33000 },
                { sexo: "Mulheres", idade_grupo: "30-34 anos", populacao: 32000 },
                { sexo: "Homens", idade_grupo: "35-39 anos", populacao: 32000 },
                { sexo: "Mulheres", idade_grupo: "35-39 anos", populacao: 31000 },
                { sexo: "Homens", idade_grupo: "40-44 anos", populacao: 31000 },
                { sexo: "Mulheres", idade_grupo: "40-44 anos", populacao: 30000 },
                { sexo: "Homens", idade_grupo: "45-49 anos", populacao: 30000 },
                { sexo: "Mulheres", idade_grupo: "45-49 anos", populacao: 29000 },
                { sexo: "Homens", idade_grupo: "50-54 anos", populacao: 29000 },
                { sexo: "Mulheres", idade_grupo: "50-54 anos", populacao: 28000 },
                { sexo: "Homens", idade_grupo: "55-59 anos", populacao: 28000 },
                { sexo: "Mulheres", idade_grupo: "55-59 anos", populacao: 27000 },
                { sexo: "Homens", idade_grupo: "60-64 anos", populacao: 27000 },
                { sexo: "Mulheres", idade_grupo: "60-64 anos", populacao: 26000 },
                { sexo: "Homens", idade_grupo: "65-69 anos", populacao: 24000 },
                { sexo: "Mulheres", idade_grupo: "65-69 anos", populacao: 23000 },
                { sexo: "Homens", idade_grupo: "70-74 anos", populacao: 19000 },
                { sexo: "Mulheres", idade_grupo: "70-74 anos", populacao: 18000 },
                { sexo: "Homens", idade_grupo: "75-79 anos", populacao: 14000 },
                { sexo: "Mulheres", idade_grupo: "75-79 anos", populacao: 13000 },
                { sexo: "Homens", idade_grupo: "80+ anos", populacao: 9000 },
                { sexo: "Mulheres", idade_grupo: "80+ anos", populacao: 8000 }
            ],
            indices_demograficos: {
                criancas_pea: 0.41,
                idosos_pea: 0.24,
            }
        },
        saude: {
            leitos_total: 1800,
            razao_leitos_por_mil: 2.49,
            leitos_publicos_perc: 45.0,
            leitos_privados_perc: 55.0,
            benchmarking: {
                nacional: 2.1,
                status: "Acima da Média Nacional"
            },
            estabelecimentos_estratificados: [
                { tipo: "Hospital", total: 12, perc_nacional: 0.6, perc_uf: 1.2 },
                { tipo: "Clínica", total: 200, perc_nacional: 0.4, perc_uf: 0.8 },
                { tipo: "Ambulatório", total: 80, perc_nacional: 0.2, perc_uf: 0.4 }
            ],
            top_5_estabelecimentos: [
                { nome: "Hospital Regional de Sorocaba", leitos: 450, natureza: "Público" },
                { nome: "Santa Casa de Sorocaba", leitos: 300, natureza: "Filantrópico" },
                { nome: "Hospital Unimed Sorocaba", leitos: 250, natureza: "Privado" },
                { nome: "Hospital Evangélico", leitos: 200, natureza: "Filantrópico" },
                { nome: "Hospital Modelo", leitos: 150, natureza: "Privado" }
            ]
        },
        planos_saude: {
            beneficiarios: 200000,
            cobertura_plano_saude_perc: 27.66,
            benchmarking: {
                nacional: 25.0,
                status: "Acima da Média Nacional"
            },
            ans_enriquecimento: {
                indice_reclamacoes: 1.8,
                status: "Médio"
            }
        },
        cnpj_enriquecido: {
            cnpj: "99999999999999",
            razao_social: "CLINICA TESTE SA",
            cnae_principal: "Atividades de clínicas especializadas",
            porte: "DEMAIS"
        },
        // --- NOVO: MERCADO DE TRABALHO E EMPRESAS (CAGED) ---
        mercado_trabalho: {
            salario_medio_admissao: 3200.00,
            estoque_empregos: 180000,
            saldo_empregos_mes: 800,
            taxa_desemprego: 6.0,
            empresas_total: 22000,
            perc_empresas_uf: 2.2,
            benchmarking: {
                salario_nacional: 2500.00,
                desemprego_nacional: 8.5,
                status_salario: "Acima da Média Nacional",
                status_desemprego: "Abaixo da Média Nacional",
                status_tendencia: "Crescimento"
            }
        }
    },
    {
        municipio_ibge: 3303302,
        nome_municipio: "Niterói",
        uf_sigla: "RJ",
        populacao: {
            municipal: 515317,
            uf: 16055174,
            brasil: 213421037,
            perc_pop_uf: 3.21,
            piramide_etaria: [
                { sexo: "Homens", idade_grupo: "0-4 anos", populacao: 15000 },
                { sexo: "Mulheres", idade_grupo: "0-4 anos", populacao: 14000 },
                { sexo: "Homens", idade_grupo: "5-9 anos", populacao: 16000 },
                { sexo: "Mulheres", idade_grupo: "5-9 anos", populacao: 15000 },
                { sexo: "Homens", idade_grupo: "10-14 anos", populacao: 17000 },
                { sexo: "Mulheres", idade_grupo: "10-14 anos", populacao: 16000 },
                { sexo: "Homens", idade_grupo: "15-19 anos", populacao: 18000 },
                { sexo: "Mulheres", idade_grupo: "15-19 anos", populacao: 17000 },
                { sexo: "Homens", idade_grupo: "20-24 anos", populacao: 19000 },
                { sexo: "Mulheres", idade_grupo: "20-24 anos", populacao: 18000 },
                { sexo: "Homens", idade_grupo: "25-29 anos", populacao: 20000 },
                { sexo: "Mulheres", idade_grupo: "25-29 anos", populacao: 19000 },
                { sexo: "Homens", idade_grupo: "30-34 anos", populacao: 21000 },
                { sexo: "Mulheres", idade_grupo: "30-34 anos", populacao: 20000 },
                { sexo: "Homens", idade_grupo: "35-39 anos", populacao: 20000 },
                { sexo: "Mulheres", idade_grupo: "35-39 anos", populacao: 19000 },
                { sexo: "Homens", idade_grupo: "40-44 anos", populacao: 19000 },
                { sexo: "Mulheres", idade_grupo: "40-44 anos", populacao: 18000 },
                { sexo: "Homens", idade_grupo: "45-49 anos", populacao: 18000 },
                { sexo: "Mulheres", idade_grupo: "45-49 anos", populacao: 17000 },
                { sexo: "Homens", idade_grupo: "50-54 anos", populacao: 17000 },
                { sexo: "Mulheres", idade_grupo: "50-54 anos", populacao: 16000 },
                { sexo: "Homens", idade_grupo: "55-59 anos", populacao: 16000 },
                { sexo: "Mulheres", idade_grupo: "55-59 anos", populacao: 15000 },
                { sexo: "Homens", idade_grupo: "60-64 anos", populacao: 15000 },
                { sexo: "Mulheres", idade_grupo: "60-64 anos", populacao: 14000 },
                { sexo: "Homens", idade_grupo: "65-69 anos", populacao: 14000 },
                { sexo: "Mulheres", idade_grupo: "65-69 anos", populacao: 13000 },
                { sexo: "Homens", idade_grupo: "70-74 anos", populacao: 13000 },
                { sexo: "Mulheres", idade_grupo: "70-74 anos", populacao: 12000 },
                { sexo: "Homens", idade_grupo: "75-79 anos", populacao: 12000 },
                { sexo: "Mulheres", idade_grupo: "75-79 anos", populacao: 11000 },
                { sexo: "Homens", idade_grupo: "80+ anos", populacao: 11000 },
                { sexo: "Mulheres", idade_grupo: "80+ anos", populacao: 10000 }
            ],
            indices_demograficos: {
                criancas_pea: 0.32,
                idosos_pea: 0.38,
            }
        },
        saude: {
            leitos_total: 1000,
            razao_leitos_por_mil: 1.94,
            leitos_publicos_perc: 30.0,
            leitos_privados_perc: 70.0,
            benchmarking: {
                nacional: 2.1,
                status: "Abaixo da Média Nacional"
            },
            estabelecimentos_estratificados: [
                { tipo: "Hospital", total: 7, perc_nacional: 0.35, perc_uf: 0.7 },
                { tipo: "Clínica", total: 100, perc_nacional: 0.2, perc_uf: 0.4 },
                { tipo: "Ambulatório", total: 30, perc_nacional: 0.075, perc_uf: 0.15 }
            ],
            top_5_estabelecimentos: [
                { nome: "Hospital Universitário Antônio Pedro", leitos: 300, natureza: "Público" },
                { nome: "Hospital Icaraí", leitos: 200, natureza: "Privado" },
                { nome: "Hospital Santa Martha", leitos: 150, natureza: "Privado" },
                { nome: "Hospital de Clínicas de Niterói", leitos: 100, natureza: "Privado" },
                { nome: "Hospital Geral do Ingá", leitos: 80, natureza: "Público" }
            ]
        },
        planos_saude: {
            beneficiarios: 250000,
            cobertura_plano_saude_perc: 48.51,
            benchmarking: {
                nacional: 25.0,
                status: "Acima da Média Nacional"
            },
            ans_enriquecimento: {
                indice_reclamacoes: 2.0,
                status: "Médio"
            }
        },
        cnpj_enriquecido: {
            cnpj: "99999999999999",
            razao_social: "CLINICA TESTE SA",
            cnae_principal: "Atividades de clínicas especializadas",
            porte: "DEMAIS"
        },
        // --- NOVO: MERCADO DE TRABALHO E EMPRESAS (CAGED) ---
        mercado_trabalho: {
            salario_medio_admissao: 2600.00,
            estoque_empregos: 120000,
            saldo_empregos_mes: 300,
            taxa_desemprego: 7.8,
            empresas_total: 15000,
            perc_empresas_uf: 1.5,
            benchmarking: {
                salario_nacional: 2500.00,
                desemprego_nacional: 8.5,
                status_salario: "Acima da Média Nacional",
                status_desemprego: "Abaixo da Média Nacional",
                status_tendencia: "Crescimento"
            }
        }
    },
    {
        municipio_ibge: 3106200,
        nome_municipio: "Belo Horizonte",
        uf_sigla: "MG",
        populacao: {
            municipal: 2530701,
            uf: 21411923,
            brasil: 213421037,
            perc_pop_uf: 11.82,
            piramide_etaria: [
                { sexo: "Homens", idade_grupo: "0-4 anos", populacao: 80000 },
                { sexo: "Mulheres", idade_grupo: "0-4 anos", populacao: 78000 },
                { sexo: "Homens", idade_grupo: "5-9 anos", populacao: 82000 },
                { sexo: "Mulheres", idade_grupo: "5-9 anos", populacao: 80000 },
                { sexo: "Homens", idade_grupo: "10-14 anos", populacao: 84000 },
                { sexo: "Mulheres", idade_grupo: "10-14 anos", populacao: 82000 },
                { sexo: "Homens", idade_grupo: "15-19 anos", populacao: 86000 },
                { sexo: "Mulheres", idade_grupo: "15-19 anos", populacao: 84000 },
                { sexo: "Homens", idade_grupo: "20-24 anos", populacao: 88000 },
                { sexo: "Mulheres", idade_grupo: "20-24 anos", populacao: 86000 },
                { sexo: "Homens", idade_grupo: "25-29 anos", populacao: 90000 },
                { sexo: "Mulheres", idade_grupo: "25-29 anos", populacao: 88000 },
                { sexo: "Homens", idade_grupo: "30-34 anos", populacao: 92000 },
                { sexo: "Mulheres", idade_grupo: "30-34 anos", populacao: 90000 },
                { sexo: "Homens", idade_grupo: "35-39 anos", populacao: 90000 },
                { sexo: "Mulheres", idade_grupo: "35-39 anos", populacao: 88000 },
                { sexo: "Homens", idade_grupo: "40-44 anos", populacao: 88000 },
                { sexo: "Mulheres", idade_grupo: "40-44 anos", populacao: 86000 },
                { sexo: "Homens", idade_grupo: "45-49 anos", populacao: 86000 },
                { sexo: "Mulheres", idade_grupo: "45-49 anos", populacao: 84000 },
                { sexo: "Homens", idade_grupo: "50-54 anos", populacao: 84000 },
                { sexo: "Mulheres", idade_grupo: "50-54 anos", populacao: 82000 },
                { sexo: "Homens", idade_grupo: "55-59 anos", populacao: 82000 },
                { sexo: "Mulheres", idade_grupo: "55-59 anos", populacao: 80000 },
                { sexo: "Homens", idade_grupo: "60-64 anos", populacao: 80000 },
                { sexo: "Mulheres", idade_grupo: "60-64 anos", populacao: 78000 },
                { sexo: "Homens", idade_grupo: "65-69 anos", populacao: 75000 },
                { sexo: "Mulheres", idade_grupo: "65-69 anos", populacao: 73000 },
                { sexo: "Homens", idade_grupo: "70-74 anos", populacao: 70000 },
                { sexo: "Mulheres", idade_grupo: "70-74 anos", populacao: 68000 },
                { sexo: "Homens", idade_grupo: "75-79 anos", populacao: 65000 },
                { sexo: "Mulheres", idade_grupo: "75-79 anos", populacao: 63000 },
                { sexo: "Homens", idade_grupo: "80+ anos", populacao: 60000 },
                { sexo: "Mulheres", idade_grupo: "80+ anos", populacao: 58000 }
            ],
            indices_demograficos: {
                criancas_pea: 0.34,
                idosos_pea: 0.29,
            }
        },
        saude: {
            leitos_total: 6000,
            razao_leitos_por_mil: 2.37,
            leitos_publicos_perc: 40.0,
            leitos_privados_perc: 60.0,
            benchmarking: {
                nacional: 2.1,
                status: "Acima da Média Nacional"
            },
            estabelecimentos_estratificados: [
                { tipo: "Hospital", total: 40, perc_nacional: 2.0, perc_uf: 4.0 },
                { tipo: "Clínica", total: 800, perc_nacional: 1.6, perc_uf: 3.2 },
                { tipo: "Ambulatório", total: 300, perc_nacional: 0.75, perc_uf: 1.5 }
            ],
            top_5_estabelecimentos: [
                { nome: "Hospital das Clínicas UFMG", leitos: 800, natureza: "Público" },
                { nome: "Hospital Mater Dei", leitos: 500, natureza: "Privado" },
                { nome: "Santa Casa de Belo Horizonte", leitos: 450, natureza: "Filantrópico" },
                { nome: "Hospital Felício Rocho", leitos: 400, natureza: "Privado" },
                { nome: "Hospital Odilon Behrens", leitos: 350, natureza: "Público" }
            ]
        },
        planos_saude: {
            beneficiarios: 800000,
            cobertura_plano_saude_perc: 31.61,
            benchmarking: {
                nacional: 25.0,
                status: "Acima da Média Nacional"
            },
            ans_enriquecimento: {
                indice_reclamacoes: 1.0,
                status: "Baixo"
            }
        },
        cnpj_enriquecido: {
            cnpj: "99999999999999",
            razao_social: "CLINICA TESTE SA",
            cnae_principal: "Atividades de clínicas especializadas",
            porte: "DEMAIS"
        },
        // --- NOVO: MERCADO DE TRABALHO E EMPRESAS (CAGED) ---
        mercado_trabalho: {
            salario_medio_admissao: 2800.00,
            estoque_empregos: 400000,
            saldo_empregos_mes: 2000,
            "taxa_desemprego": 5.5,
            empresas_total: 50000,
            perc_empresas_uf: 5.0,
            benchmarking: {
                "salario_nacional": 2500.00,
                "desemprego_nacional": 8.5,
                "status_salario": "Acima da Média Nacional",
                "status_desemprego": "Abaixo da Média Nacional",
                "status_tendencia": "Crescimento"
            }
        }
    }
];

// Endpoint principal da API
app.get('/api/v1/market-intelligence/:ibgeCode', (req, res) => {
    const ibgeCode = parseInt(req.params.ibgeCode);
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
            message: `Dados não encontrados para o código IBGE: ${ibgeCode}. Tente um dos códigos mockados: ${mockData.map(d => d.municipio_ibge).join(', ')}`
        });
    }
});

// Endpoint para a página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint para servir a lista de cidades (usada pelo frontend)
app.get('/api/v1/cities', (req, res) => {
    const cities = mockData.map(data => ({
        ibge_code: data.municipio_ibge,
        nome: data.nome_municipio,
        uf: data.uf_sigla
    }));
    res.json(cities);
});

app.listen(port, () => {
    console.log(`HM-I Tool API rodando em http://localhost:${port}`);
});


// Endpoint para obter dados de inteligência de mercado
app.get("/api/v1/analysis/:ibge_code", async (req, res) => {
    const ibgeCode = parseInt(req.params.ibge_code);
    const data = mockData.find(data => data.municipio_ibge === ibgeCode);

    if (!data) {
        return res.status(404).json({ status: "error", message: `Dados não encontrados para o código IBGE: ${ibgeCode}` });
    }

    // Formatar os dados para o prompt
    const promptData = JSON.stringify(data, null, 2);

    const prompt = `
        Você é um analista de mercado de saúde sênior. Sua tarefa é analisar os dados de inteligência de mercado a seguir para a cidade de ${data.nome_municipio} e gerar uma análise concisa de Prós e Contras para um potencial investimento no setor de saúde local.

        Dados de Inteligência de Mercado:
        ${promptData}

        A análise deve ser estruturada em duas seções: "Prós (Oportunidades)" e "Contras (Desafios)".
        Use uma linguagem profissional e destaque os pontos mais críticos de cada seção.
        A resposta deve ser um objeto JSON no seguinte formato:
        {
            "pros": [
                "Ponto 1 (Ex: Alta cobertura de planos de saúde)",
                "Ponto 2 (Ex: Salário médio acima da média nacional)"
            ],
            "contras": [
                "Ponto 1 (Ex: Razão de leitos abaixo da média nacional)",
                "Ponto 2 (Ex: Alta dependência de idosos)"
            ]
        }
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Modelo rápido e eficiente para esta tarefa
            messages: [
                { role: "system", content: "Você é um analista de mercado de saúde sênior que gera análises concisas em formato JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
        });

        const analysis = JSON.parse(completion.choices[0].message.content);

        res.json({
            status: "success",
            analysis: analysis,
            message: "Análise de Prós e Contras gerada pela OpenAI."
        });

    } catch (error) {
        console.error("Erro ao chamar a OpenAI:", error);
        res.status(500).json({
            status: "error",
            message: "Erro ao gerar análise com a OpenAI. Verifique a chave API e o log do servidor.",
            details: error.message
        });
    }
});
