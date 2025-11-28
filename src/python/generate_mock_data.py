#!/usr/bin/env python3.11
"""
Script para gerar dados mockados para todos os estados e cidades do Brasil.
Inclui comparativos com dados estaduais e nacionais.
"""

import json
import random

# Dados estaduais e nacionais de referência
DADOS_ESTADUAIS = {
    'SP': {'populacao': 46649132, 'leitos_por_mil': 2.15, 'cobertura_plano': 45.0, 'salario_medio': 3200, 'desemprego': 7.5},
    'RJ': {'populacao': 17463349, 'leitos_por_mil': 2.05, 'cobertura_plano': 38.0, 'salario_medio': 3100, 'desemprego': 8.2},
    'MG': {'populacao': 21411923, 'leitos_por_mil': 1.95, 'cobertura_plano': 32.0, 'salario_medio': 2800, 'desemprego': 8.8},
    'BA': {'populacao': 14985284, 'leitos_por_mil': 1.80, 'cobertura_plano': 28.0, 'salario_medio': 2400, 'desemprego': 10.5},
    'PR': {'populacao': 11780561, 'leitos_por_mil': 2.10, 'cobertura_plano': 40.0, 'salario_medio': 3000, 'desemprego': 7.8},
    'SC': {'populacao': 7252502, 'leitos_por_mil': 2.20, 'cobertura_plano': 42.0, 'salario_medio': 3100, 'desemprego': 6.5},
    'RS': {'populacao': 11466630, 'leitos_por_mil': 2.25, 'cobertura_plano': 43.0, 'salario_medio': 3150, 'desemprego': 7.2},
    'PE': {'populacao': 9616621, 'leitos_por_mil': 1.75, 'cobertura_plano': 25.0, 'salario_medio': 2300, 'desemprego': 11.2},
    'CE': {'populacao': 9240580, 'leitos_por_mil': 1.70, 'cobertura_plano': 23.0, 'salario_medio': 2250, 'desemprego': 11.8},
    'PA': {'populacao': 8777124, 'leitos_por_mil': 1.65, 'cobertura_plano': 20.0, 'salario_medio': 2200, 'desemprego': 12.5},
}

DADOS_NACIONAIS = {
    'populacao': 213421037,
    'leitos_por_mil': 2.10,
    'cobertura_plano': 30.0,
    'salario_medio': 2800,
    'desemprego': 8.5,
}

# Cidades por estado (amostra)
CIDADES_POR_ESTADO = {
    'SP': [
        {'nome': 'São Paulo', 'ibge': 3550308, 'populacao': 12396372},
        {'nome': 'Campinas', 'ibge': 3509007, 'populacao': 1213792},
        {'nome': 'São José dos Campos', 'ibge': 3549904, 'populacao': 737314},
        {'nome': 'Santos', 'ibge': 3548906, 'populacao': 433656},
        {'nome': 'Sorocaba', 'ibge': 3552403, 'populacao': 687357},
        {'nome': 'Ribeirão Preto', 'ibge': 3543402, 'populacao': 704293},
        {'nome': 'Piracicaba', 'ibge': 3538402, 'populacao': 400570},
        {'nome': 'Jundiaí', 'ibge': 3525904, 'populacao': 405532},
    ],
    'RJ': [
        {'nome': 'Rio de Janeiro', 'ibge': 3304557, 'populacao': 6748008},
        {'nome': 'Niterói', 'ibge': 3303302, 'populacao': 487562},
        {'nome': 'Duque de Caxias', 'ibge': 3301702, 'populacao': 872762},
        {'nome': 'São Gonçalo', 'ibge': 3305802, 'populacao': 1026267},
        {'nome': 'Nova Iguaçu', 'ibge': 3303500, 'populacao': 798067},
    ],
    'MG': [
        {'nome': 'Belo Horizonte', 'ibge': 3106200, 'populacao': 2530701},
        {'nome': 'Uberlândia', 'ibge': 3170701, 'populacao': 715259},
        {'nome': 'Contagem', 'ibge': 3115200, 'populacao': 645344},
        {'nome': 'Juiz de Fora', 'ibge': 3132404, 'populacao': 573458},
        {'nome': 'Montes Claros', 'ibge': 3142402, 'populacao': 404693},
    ],
    'BA': [
        {'nome': 'Salvador', 'ibge': 2927408, 'populacao': 2662473},
        {'nome': 'Feira de Santana', 'ibge': 2910800, 'populacao': 632079},
        {'nome': 'Vitória da Conquista', 'ibge': 2933604, 'populacao': 343216},
        {'nome': 'Camaçari', 'ibge': 2904144, 'populacao': 294139},
    ],
    'PR': [
        {'nome': 'Curitiba', 'ibge': 4106902, 'populacao': 1963726},
        {'nome': 'Londrina', 'ibge': 4113700, 'populacao': 569639},
        {'nome': 'Maringá', 'ibge': 4115200, 'populacao': 423644},
        {'nome': 'Ponta Grossa', 'ibge': 4120402, 'populacao': 348036},
    ],
    'SC': [
        {'nome': 'Florianópolis', 'ibge': 4204402, 'populacao': 537062},
        {'nome': 'Joinville', 'ibge': 4209102, 'populacao': 612809},
        {'nome': 'Blumenau', 'ibge': 4202404, 'populacao': 342055},
        {'nome': 'Itajaí', 'ibge': 4208203, 'populacao': 212765},
    ],
    'RS': [
        {'nome': 'Porto Alegre', 'ibge': 4314902, 'populacao': 1409351},
        {'nome': 'Caxias do Sul', 'ibge': 4305108, 'populacao': 488635},
        {'nome': 'Pelotas', 'ibge': 4314407, 'populacao': 348575},
        {'nome': 'Santa Maria', 'ibge': 4316907, 'populacao': 283437},
    ],
    'PE': [
        {'nome': 'Recife', 'ibge': 2611606, 'populacao': 1645727},
        {'nome': 'Jaboatão dos Guararapes', 'ibge': 2605459, 'populacao': 684697},
        {'nome': 'Olinda', 'ibge': 2609600, 'populacao': 392367},
        {'nome': 'Caruaru', 'ibge': 2604106, 'populacao': 368028},
    ],
    'CE': [
        {'nome': 'Fortaleza', 'ibge': 2304400, 'populacao': 2703391},
        {'nome': 'Caucaia', 'ibge': 2303105, 'populacao': 366376},
        {'nome': 'Juazeiro do Norte', 'ibge': 2307304, 'populacao': 276055},
        {'nome': 'Maracanaú', 'ibge': 2308278, 'populacao': 231627},
    ],
    'PA': [
        {'nome': 'Belém', 'ibge': 1501402, 'populacao': 1497724},
        {'nome': 'Ananindeua', 'ibge': 1500800, 'populacao': 529355},
        {'nome': 'Santarém', 'ibge': 1506807, 'populacao': 306971},
        {'nome': 'Marabá', 'ibge': 1504208, 'populacao': 280360},
    ],
}

def gerar_piramide_etaria(populacao_total):
    """Gera uma pirâmide etária simulada."""
    piramide = []
    faixas_etarias = [
        ('0-4', 0.065), ('5-9', 0.068), ('10-14', 0.070),
        ('15-19', 0.072), ('20-24', 0.075), ('25-29', 0.078),
        ('30-34', 0.076), ('35-39', 0.074), ('40-44', 0.072),
        ('45-49', 0.070), ('50-54', 0.068), ('55-59', 0.065),
        ('60-64', 0.060), ('65-69', 0.050), ('70-74', 0.040),
        ('75-79', 0.030), ('80+', 0.020),
    ]
    
    for faixa, percentual in faixas_etarias:
        pop_faixa = int(populacao_total * percentual)
        piramide.append({'sexo': 'Homens', 'idade_grupo': f'{faixa} anos', 'populacao': int(pop_faixa * 0.49)})
        piramide.append({'sexo': 'Mulheres', 'idade_grupo': f'{faixa} anos', 'populacao': int(pop_faixa * 0.51)})
    
    return piramide

def calcular_indices_demograficos(piramide):
    """Calcula índices demográficos."""
    criancas = sum(item['populacao'] for item in piramide if item['idade_grupo'] in ['0-4 anos', '5-9 anos', '10-14 anos'])
    pea = sum(item['populacao'] for item in piramide if any(f'{i}-' in item['idade_grupo'] for i in range(15, 60)))
    idosos = sum(item['populacao'] for item in piramide if any(f'{i}-' in item['idade_grupo'] or '80+' in item['idade_grupo'] for i in range(60, 80)))
    
    return {
        'criancas_pea': round(criancas / pea if pea > 0 else 0, 2),
        'idosos_pea': round(idosos / pea if pea > 0 else 0, 2),
    }

def gerar_dados_cidade(cidade, estado, dados_estado):
    """Gera dados completos para uma cidade."""
    populacao = cidade['populacao']
    piramide = gerar_piramide_etaria(populacao)
    indices = calcular_indices_demograficos(piramide)
    
    # Simular dados com variação
    leitos_ratio = dados_estado['leitos_por_mil'] + random.uniform(-0.3, 0.3)
    cobertura_plano = dados_estado['cobertura_plano'] + random.uniform(-5, 5)
    salario_medio = dados_estado['salario_medio'] + random.uniform(-200, 200)
    
    return {
        'municipio_ibge': cidade['ibge'],
        'nome_municipio': cidade['nome'],
        'uf_sigla': estado,
        'populacao': {
            'municipal': populacao,
            'uf': dados_estado['populacao'],
            'brasil': DADOS_NACIONAIS['populacao'],
            'perc_pop_uf': round((populacao / dados_estado['populacao']) * 100, 2),
            'perc_pop_brasil': round((populacao / DADOS_NACIONAIS['populacao']) * 100, 4),
            'piramide_etaria': piramide,
            'indices_demograficos': indices,
        },
        'saude': {
            'leitos_total': int(populacao * leitos_ratio / 1000),
            'razao_leitos_por_mil': round(leitos_ratio, 2),
            'leitos_publicos_perc': round(random.uniform(35, 50), 1),
            'leitos_privados_perc': round(random.uniform(50, 65), 1),
            'benchmarking': {
                'municipal': round(leitos_ratio, 2),
                'estadual': dados_estado['leitos_por_mil'],
                'nacional': DADOS_NACIONAIS['leitos_por_mil'],
                'status_estadual': 'Acima' if leitos_ratio > dados_estado['leitos_por_mil'] else 'Abaixo',
                'status_nacional': 'Acima' if leitos_ratio > DADOS_NACIONAIS['leitos_por_mil'] else 'Abaixo',
            },
            'top_5_estabelecimentos': [
                {'nome': f'Hospital Principal {cidade["nome"]}', 'leitos': int(populacao * 0.0015), 'natureza': 'Público'},
                {'nome': f'Hospital Privado A', 'leitos': int(populacao * 0.0010), 'natureza': 'Privado'},
                {'nome': f'Hospital Filantrópico B', 'leitos': int(populacao * 0.0008), 'natureza': 'Filantrópico'},
                {'nome': f'Clínica Especializada C', 'leitos': int(populacao * 0.0005), 'natureza': 'Privado'},
                {'nome': f'Maternidade D', 'leitos': int(populacao * 0.0003), 'natureza': 'Público'},
            ]
        },
        'planos_saude': {
            'beneficiarios': int(populacao * (cobertura_plano / 100)),
            'cobertura_plano_saude_perc': round(cobertura_plano, 1),
            'benchmarking': {
                'municipal': round(cobertura_plano, 1),
                'estadual': dados_estado['cobertura_plano'],
                'nacional': DADOS_NACIONAIS['cobertura_plano'],
                'status_estadual': 'Acima' if cobertura_plano > dados_estado['cobertura_plano'] else 'Abaixo',
                'status_nacional': 'Acima' if cobertura_plano > DADOS_NACIONAIS['cobertura_plano'] else 'Abaixo',
            }
        },
        'mercado_trabalho': {
            'salario_medio_admissao': round(salario_medio, 2),
            'estoque_empregos': int(populacao * 0.4),
            'saldo_empregos_mes': random.randint(-500, 2000),
            'taxa_desemprego': round(dados_estado['desemprego'] + random.uniform(-1, 1), 1),
            'empresas_total': int(populacao * 0.06),
            'benchmarking': {
                'salario_municipal': round(salario_medio, 2),
                'salario_estadual': dados_estado['salario_medio'],
                'salario_nacional': DADOS_NACIONAIS['salario_medio'],
                'desemprego_municipal': round(dados_estado['desemprego'] + random.uniform(-1, 1), 1),
                'desemprego_estadual': dados_estado['desemprego'],
                'desemprego_nacional': DADOS_NACIONAIS['desemprego'],
                'status_salario_estadual': 'Acima' if salario_medio > dados_estado['salario_medio'] else 'Abaixo',
                'status_salario_nacional': 'Acima' if salario_medio > DADOS_NACIONAIS['salario_medio'] else 'Abaixo',
            }
        }
    }

def gerar_todos_dados():
    """Gera dados para todas as cidades."""
    dados_completos = []
    
    for estado, cidades in CIDADES_POR_ESTADO.items():
        dados_estado = DADOS_ESTADUAIS[estado]
        for cidade in cidades:
            dados_completos.append(gerar_dados_cidade(cidade, estado, dados_estado))
    
    return dados_completos

if __name__ == '__main__':
    dados = gerar_todos_dados()
    
    # Salvar em JSON
    with open('/home/ubuntu/hm-i-tool/src/node/mock_data.json', 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Dados mockados gerados para {len(dados)} cidades")
    print(f"✓ Arquivo salvo em: /home/ubuntu/hm-i-tool/src/node/mock_data.json")
