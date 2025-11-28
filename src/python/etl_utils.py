import re
import requests
import time
from pathlib import Path
from typing import Optional, Tuple

# --- Constantes ---
IBGE_API_URL = "https://servicodados.ibge.gov.br/api/v3/agregados"
BRASILAPI_CNPJ_URL = "https://brasilapi.com.br/api/cnpj/v1"
# O ID do recurso real deve ser obtido no OPENDATASUS
OPENDATASUS_CNES_URL = 'https://opendatasus.saude.gov.br/dataset/cnes-cadastro-nacional-de-estabelecimentos-de-saude/resource/MOCK_RESOURCE_ID/download' # Mocked URL
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

# --- 11.1 Python: normalize CNPJ ---
def normalize_cnpj(cnpj_raw: Optional[str]) -> Optional[str]:
    """
    Normaliza uma string de CNPJ, removendo caracteres não numéricos e 
    preenchendo com zeros à esquerda para 14 dígitos.
    """
    if not cnpj_raw:
        return None
    # Remove todos os caracteres não numéricos
    digits = re.sub(r'\D', '', str(cnpj_raw))
    
    # Se o número de dígitos for menor ou igual a 14, preenche com zeros à esquerda.
    # Se for maior, trunca para 14 (embora um CNPJ válido tenha exatamente 14 dígitos).
    if len(digits) <= 14:
        return digits.zfill(14)
    else:
        return digits[:14]

# --- 11.2 Python: simple CNES fetcher (simulado) ---
def download_cnes(dest_folder: str) -> Optional[Path]:
    """
    Simula o download do arquivo CNES. 
    NOTA: O <resource-id> real deve ser substituído na URL.
    """
    print(f"Iniciando download simulado do CNES para {dest_folder}...")
    
    # Simulação de requisição
    try:
        # Usando uma URL de teste que não requer um ID de recurso real
        # Em um ambiente real, o código abaixo seria descomentado e a URL seria a correta.
        # r = requests.get(OPENDATASUS_CNES_URL, stream=True, timeout=60)
        # r.raise_for_status()
        
        out = Path(dest_folder) / 'cnes_estabelecimentos.csv.gz'
        
        # Simulação de escrita de arquivo
        out.parent.mkdir(parents=True, exist_ok=True)
        with open(out, 'w') as f:
            f.write("Simulação de dados CNES: cnes_id, cnpj, nome_fantasia\n")
            f.write("1234567, 00000000000191, Hospital Mock\n")
            f.write("7654321, 99999999999999, Clinica Teste\n")
            
        print(f"Download simulado concluído. Arquivo salvo em: {out}")
        return out
    except requests.exceptions.RequestException as e:
        print(f"Erro ao tentar baixar o CNES: {e}")
        return None

# --- 11.3 Geocode with rate limit (Nominatim) ---
def geocode_address(q: str) -> Tuple[Optional[float], Optional[float]]:
    """
    Geocodifica um endereço usando a API Nominatim (OpenStreetMap).
    Inclui um User-Agent e respeita a política de limite de taxa (simples).
    """
    params = {'q': q, 'format':'json', 'countrycodes':'br', 'limit':1}
    headers = {'User-Agent':'HM-ITool/1.0 (Contato: seu.email@exemplo.com)'}
    
    try:
        r = requests.get(NOMINATIM_URL, params=params, headers=headers, timeout=10)
        r.raise_for_status()
        
        if r.json():
            result = r.json()[0]
            lat = float(result.get('lat'))
            lon = float(result.get('lon'))
            return lat, lon
        
        return None, None
    except requests.exceptions.RequestException as e:
        print(f"Erro na geocodificação para '{q}': {e}")
        return None, None
    except (ValueError, IndexError, TypeError):
        # Erro de conversão ou estrutura de resposta inesperada
        return None, None

# --- 11.4 Python: Fetcher IBGE (População Municipal) ---
def fetch_ibge_populacao_municipal(periodo: str = "-1") -> Optional[list]:
    """
    Busca a população residente estimada (Tabela 6579, Variável 9324) para todos 
    os municípios no período especificado.
    
    :param periodo: Período de referência. Use '-1' para o mais recente.
    :return: Lista de dicionários com os dados de população ou None em caso de erro.
    """
    # Tabela 6579: População residente estimada
    # Variável 9324: População residente
    # Localidade: N6[all] (Todos os municípios)
    url = f"{IBGE_API_URL}/6579/periodos/{periodo}/variaveis/9324?localidades=N6[all]"
    headers = {'User-Agent':'HM-ITool/1.0 (Contato: seu.email@exemplo.com)'}
    
    try:
        r = requests.get(url, headers=headers, timeout=30)
        r.raise_for_status()
        data = r.json()
        
        if not data or not data[0].get('resultados'):
            print("Aviso: Dados do IBGE não encontrados ou estrutura inesperada.")
            return None
            
        # Extrai o ano de referência
        ano_referencia = data[0]['resultados'][0]['series'][0]['localidade']['nivel']['id']
        
        # Processa os resultados
        populacao_data = []
        for resultado in data[0]['resultados']:
            for serie in resultado['series']:
                municipio_info = serie['localidade']['nivel']
                # O código IBGE completo (7 dígitos) está no 'id' da localidade
                codigo_ibge = serie['localidade']['id']
                
                # O valor da população está no dicionário 'serie'
                # O valor é uma string, precisa ser convertido para int
                valor_populacao = list(serie['serie'].values())[0]
                
                if valor_populacao != '...': # Ignora valores indisponíveis
                    populacao_data.append({
                        'codigo_ibge': codigo_ibge,
                        'nome_municipio': municipio_info['nome'],
                        'populacao_estimada': int(valor_populacao),
                        'ano_referencia': ano_referencia
                    })
        
        print(f"Sucesso ao buscar dados do IBGE. {len(populacao_data)} municípios encontrados.")
        return populacao_data
        
    except requests.exceptions.RequestException as e:
        print(f"Erro ao buscar dados do IBGE: {e}")
        return None
    except Exception as e:
        print(f"Erro inesperado ao processar dados do IBGE: {e}")
        return None

# --- Fetcher IBGE (População por UF) ---
def fetch_ibge_populacao_uf(periodo: str = "-1") -> Optional[dict]:
    """
    Busca a população residente estimada para todas as Unidades da Federação.
    """
    url = f"{IBGE_API_URL}/6579/periodos/{periodo}/variaveis/9324?localidades=N3[all]"
    headers = {"User-Agent": "HM-ITool/1.0"}
    try:
        r = requests.get(url, headers=headers, timeout=30)
        r.raise_for_status()
        data = r.json()
        if not data or not data[0].get("resultados"):
            return None
        
        populacao_uf = {}
        for resultado in data[0]["resultados"]:
            for serie in resultado["series"]:
                # O IBGE retorna o nome da UF no formato "São Paulo (SP)" quando a localidade é N3.
                # A sigla da UF é o que está entre parênteses.
                match = re.search(r'\((.*?)\)', serie["localidade"]["nome"])
                if match:
                    uf_sigla = match.group(1)
                else:
                    # Fallback: usar o nome completo se a extração falhar (o que causou o erro anterior)
                    uf_sigla = serie["localidade"]["nome"][:2] # Apenas para evitar erro, mas o formato é esperado.
                valor_populacao = list(serie["serie"].values())[0]
                if valor_populacao != "...":
                    populacao_uf[uf_sigla] = int(valor_populacao)
        return populacao_uf
    except Exception as e:
        print(f"Erro ao buscar população por UF: {e}")
        return None

# --- Fetcher IBGE (População Brasil) ---
def fetch_ibge_populacao_brasil(periodo: str = "-1") -> Optional[int]:
    """
    Busca a população residente estimada para o Brasil.
    """
    url = f"{IBGE_API_URL}/6579/periodos/{periodo}/variaveis/9324?localidades=N1[1]"
    headers = {"User-Agent": "HM-ITool/1.0"}
    try:
        r = requests.get(url, headers=headers, timeout=30)
        r.raise_for_status()
        data = r.json()
        if not data or not data[0].get("resultados"):
            return None
        
        valor_populacao = list(data[0]["resultados"][0]["series"][0]["serie"].values())[0]
        return int(valor_populacao) if valor_populacao != "..." else None
    except Exception as e:
        print(f"Erro ao buscar população do Brasil: {e}")
        return None

# --- Fetcher IBGE (Pirâmide Etária por Município) ---
def fetch_ibge_piramide_etaria(codigo_ibge: str) -> Optional[list]:
    """
    Busca a população residente por sexo e idade para um município (Tabela 7360 - Projeção da População).
    
    :param codigo_ibge: Código IBGE do município (7 dígitos).
    :return: Lista de dicionários com os dados da pirâmide etária ou None.
    """
    # Tabela 7360: População residente por sexo e idade
    # Variável 7360: População residente
    # Classificação 7169: Sexo (1=Total, 2=Homens, 3=Mulheres)
    # Classificação 7170: Idade (grupos de idade)
    # Período: -1 (Mais recente)
    url = f"{IBGE_API_URL}/7360/periodos/-1/variaveis/7360?localidades=N6[{codigo_ibge}]&classificadores=7169[2,3]|7170[all]"
    headers = {"User-Agent": "HM-ITool/1.0"}
    
    try:
        r = requests.get(url, headers=headers, timeout=30)
        r.raise_for_status()
        data = r.json()
        
        if not data or not data[0].get('resultados'):
            print(f"Aviso: Dados da pirâmide etária para {codigo_ibge} não encontrados.")
            return None
            
        piramide_data = []
        # O primeiro elemento da lista é o cabeçalho, ignoramos
        for item in data[1:]:
            sexo = item['classificacao'][0]['categoria']['7169']
            idade = item['classificacao'][1]['categoria']['7170']
            valor = int(item['resultados'][0]['series'][0]['valor'])
            
            piramide_data.append({
                'sexo': sexo['nome'],
                'idade_grupo': idade['nome'],
                'populacao': valor
            })
            
        print(f"Sucesso ao buscar pirâmide etária para {codigo_ibge}. {len(piramide_data)} grupos encontrados.")
        return piramide_data
        
    except requests.exceptions.RequestException as e:
        print(f"Erro ao buscar pirâmide etária: {e}")
        return None
    except Exception as e:
        print(f"Erro inesperado ao processar pirâmide etária: {e}")
        return None

# --- 11.5 Python: Fetcher BrasilAPI (CNPJ) ---
def fetch_ibge_populacao_brasil(periodo: str = "-1") -> Optional[int]:
    """
    Busca a população residente estimada para o Brasil.
    """
    url = f"{IBGE_API_URL}/6579/periodos/{periodo}/variaveis/9324?localidades=N1[1]"
    headers = {"User-Agent": "HM-ITool/1.0"}
    try:
        r = requests.get(url, headers=headers, timeout=30)
        r.raise_for_status()
        data = r.json()
        if not data or not data[0].get("resultados"):
            return None
        
        valor_populacao = list(data[0]["resultados"][0]["series"][0]["serie"].values())[0]
        return int(valor_populacao) if valor_populacao != "..." else None
    except Exception as e:
        print(f"Erro ao buscar população do Brasil: {e}")
        return None

# --- 11.5 Python: Fetcher BrasilAPI (CNPJ) ---
def fetch_cnpj_brasilapi(cnpj: str) -> Optional[dict]:
    """
    Busca dados de firmografia de um CNPJ usando a BrasilAPI.
    
    :param cnpj: CNPJ normalizado (apenas 14 dígitos).
    :return: Dicionário com os dados da empresa ou None em caso de erro.
    """
    url = f"{BRASILAPI_CNPJ_URL}/{cnpj}"
    headers = {'User-Agent':'HM-ITool/1.0 (Contato: seu.email@exemplo.com)'}
    
    try:
        r = requests.get(url, headers=headers, timeout=10)
        r.raise_for_status()
        
        data = r.json()
        
        if r.status_code == 200:
            print(f"Sucesso ao buscar CNPJ {cnpj}.")
            # Retorna dados brutos, a transformação/seleção de campos será feita na lógica de ETL
            return data
        else:
            print(f"Erro ao buscar CNPJ {cnpj}: {data.get('message', 'Erro desconhecido')}")
            return None
            
    except requests.exceptions.HTTPError as e:
        # A BrasilAPI retorna 404 para CNPJ não encontrado
        if e.response.status_code == 404:
            print(f"CNPJ {cnpj} não encontrado na BrasilAPI.")
        else:
            print(f"Erro HTTP ao buscar CNPJ {cnpj}: {e}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Erro de conexão ao buscar CNPJ {cnpj}: {e}")
        return None

# --- Simulação de Dados de Benchmarking e Leitos ---
# Em um ETL real, estes dados viriam de arquivos processados (CNES, ANS, CAGED, Mapa de Empresas)
# Para fins de PoC, usaremos dados mockados para o cálculo de métricas.

# Dados de Mercado de Trabalho (CAGED) e Empresas (Mock)
MERCADO_TRABALHO_MOCK = {
    "3549904": { # SJC
        "salario_medio_admissao": 2850.50,
        "estoque_empregos": 350000,
        "saldo_empregos_mes": 1500,
        "taxa_desemprego": 6.5,
        "empresas_total": 45000,
        "perc_empresas_uf": 4.5,
    },
    "3550308": { # SP
        "salario_medio_admissao": 3500.00,
        "estoque_empregos": 5000000,
        "saldo_empregos_mes": 15000,
        "taxa_desemprego": 8.0,
        "empresas_total": 500000,
        "perc_empresas_uf": 50.0,
    },
    "3304557": { # RJ
        "salario_medio_admissao": 3100.00,
        "estoque_empregos": 2500000,
        "saldo_empregos_mes": 5000,
        "taxa_desemprego": 9.5,
        "empresas_total": 200000,
        "perc_empresas_uf": 30.0,
    },
}

# Benchmarking Nacional (Mock)
BENCHMARK_NACIONAL = {
    "razao_leitos_por_mil": 2.1,
    "cobertura_plano_saude_perc": 25.0,
    "salario_medio_admissao": 2500.00,
    "taxa_desemprego": 8.5,
    "estabelecimentos_por_tipo": {
        "Hospital": 5000,
        "Clínica Especializada": 10000,
        "Ambulatório": 20000
    }
}

# Dados de Leitos (Mock) - Top 5 Estabelecimentos por Leitos
# Em um ETL real, estes dados viriam de arquivos processados (CNES, ANS)
# Para fins de PoC, usaremos dados mockados para o cálculo de métricas.

# Dados de Leitos (Mock) - Top 5 Estabelecimentos por Leitos
TOP_5_LEITOS_MOCK = {
    "3549904": [ # SJC
        {"nome": "Hospital Municipal de SJC", "leitos": 500, "natureza": "Público"},
        {"nome": "Hospital Vivalle", "leitos": 300, "natureza": "Privado"},
        {"nome": "Hospital Policlin", "leitos": 250, "natureza": "Privado"},
        {"nome": "Hospital Regional", "leitos": 200, "natureza": "Público"},
        {"nome": "Santa Casa de SJC", "leitos": 150, "natureza": "Filantrópico"},
    ],
    "3550308": [ # SP
        {"nome": "Hospital das Clínicas", "leitos": 2000, "natureza": "Público"},
        {"nome": "Hospital Albert Einstein", "leitos": 1000, "natureza": "Privado"},
        {"nome": "Hospital Sírio-Libanês", "leitos": 800, "natureza": "Privado"},
        {"nome": "Hospital São Paulo", "leitos": 700, "natureza": "Público"},
        {"nome": "Santa Casa de SP", "leitos": 600, "natureza": "Filantrópico"},
    ],
    "3304557": [ # RJ
        {"nome": "Hospital Federal de Bonsucesso", "leitos": 1000, "natureza": "Público"},
        {"nome": "Hospital Copa D'Or", "leitos": 500, "natureza": "Privado"},
        {"nome": "Hospital Samaritano", "leitos": 400, "natureza": "Privado"},
        {"nome": "Hospital Municipal Souza Aguiar", "leitos": 350, "natureza": "Público"},
        {"nome": "Hospital Quinta D'Or", "leitos": 300, "natureza": "Privado"},
    ],
}
# Em um ETL real, estes dados viriam de arquivos processados (CNES, ANS)
# Para fins de PoC, usaremos dados mockados para o cálculo de métricas.

# Dados de Leitos (Mock) - Total de leitos, % público, % privado
LEITOS_MOCK = {
    "3549904": {"total": 1500, "publico_perc": 35.0, "privado_perc": 65.0, "estabelecimentos": {"Hospital": 10, "Clínica Especializada": 25, "Ambulatório": 50}}, # SJC
    "3550308": {"total": 25000, "publico_perc": 40.0, "privado_perc": 60.0, "estabelecimentos": {"Hospital": 150, "Clínica Especializada": 500, "Ambulatório": 1000}}, # SP
    "3304557": {"total": 18000, "publico_perc": 50.0, "privado_perc": 50.0, "estabelecimentos": {"Hospital": 120, "Clínica Especializada": 400, "Ambulatório": 800}}, # RJ
}

# Dados de Planos de Saúde (Mock) - Beneficiários
PLANOS_SAUDE_MOCK = {
    "3549904": 350000, # SJC
    "3550308": 10000000, # SP
    "3304557": 6000000, # RJ
}

# Benchmarking Nacional (Mock)
BENCHMARK_NACIONAL = {
    "razao_leitos_por_mil": 2.1,
    "leitos_publicos_perc": 45.0,
    "leitos_privados_perc": 55.0,
    "cobertura_plano_saude_perc": 25.0,
    "estabelecimentos_por_tipo": {"Hospital": 5000, "Clínica Especializada": 10000, "Ambulatório": 20000},
}

# --- Lógica Principal de ETL/Cálculo ---
def process_market_intelligence(codigo_ibge: str, uf_sigla: str) -> Optional[dict]:
    """
    Processa e calcula todas as métricas de inteligência de mercado para um município.
    
    :param codigo_ibge: Código IBGE do município (7 dígitos).
    :param uf_sigla: Sigla da Unidade da Federação.
    :return: Dicionário com todas as métricas calculadas.
    """
    
    # 1. Fetching de Dados Brutos
    pop_municipal_data = fetch_ibge_populacao_municipal()
    pop_uf_data = fetch_ibge_populacao_uf()
    pop_brasil = fetch_ibge_populacao_brasil()
    piramide_etaria = fetch_ibge_piramide_etaria(codigo_ibge)
    
    # 2. Extração de Dados do Município
    pop_municipio = next((item['populacao_estimada'] for item in pop_municipal_data if item['codigo_ibge'] == codigo_ibge), None)
    
    if not pop_municipio or not pop_uf_data or not pop_brasil:
        print(f"Erro: Dados básicos de população não encontrados para {codigo_ibge}.")
        return None

    pop_uf = pop_uf_data.get(uf_sigla)
    
    # 3. Simulação de Dados de Leitos e Planos de Saúde
    leitos_data = LEITOS_MOCK.get(codigo_ibge, {"total": 0, "publico_perc": 0, "privado_perc": 0, "estabelecimentos": {}})
    planos_saude_beneficiarios = PLANOS_SAUDE_MOCK.get(codigo_ibge, 0)
    
    # 4. Cálculo das Métricas
    
    # População
    perc_pop_uf = (pop_municipio / pop_uf) * 100 if pop_uf else 0
    
    # Leitos
    razao_leitos_por_mil = (leitos_data["total"] / pop_municipio) * 1000 if pop_municipio else 0
    
    # Planos de Saúde
    cobertura_plano_saude_perc = (planos_saude_beneficiarios / pop_municipio) * 100 if pop_municipio else 0
    
    # Benchmarking (Mock)
    bench_leitos_nacional = BENCHMARK_NACIONAL["razao_leitos_por_mil"]
    bench_cobertura_nacional = BENCHMARK_NACIONAL["cobertura_plano_saude_perc"]
    
    # Novos Índices Demográficos (Idosos/PEA e Crianças/PEA)
    # PEA: 15 a 59 anos (Aproximação)
    # Idosos: 60+ anos
    # Crianças: 0 a 14 anos
    
    pea = 0
    idosos = 0
    criancas = 0
    
    if piramide_etaria:
        for item in piramide_etaria:
            # Extrair a idade inicial do grupo (ex: "15 a 19 anos" -> 15)
            # O IBGE usa grupos como "15 a 19 anos", "60 anos ou mais", "0 a 4 anos"
            idade_str = item['idade_grupo'].split(' ')[0]
            if idade_str.isdigit():
                idade_inicial = int(idade_str)
            elif idade_str == 'Menos': # Menos de 1 ano
                idade_inicial = 0
            elif idade_str == '100': # 100 anos ou mais
                idade_inicial = 100
            else:
                continue # Ignora outros grupos que não sejam idade
                
            populacao = item['populacao']
            
            if idade_inicial >= 15 and idade_inicial <= 59:
                pea += populacao
            elif idade_inicial >= 60:
                idosos += populacao
            elif idade_inicial <= 14:
                criancas += populacao
                
    idosos_por_pea = (idosos / pea) * 100 if pea > 0 else 0
    criancas_por_pea = (criancas / pea) * 100 if pea > 0 else 0
    
    # 5. Estruturação do Resultado
    
    # Simulação de enriquecimento CNPJ (para o mock da API)
    cnpj_mock = fetch_cnpj_brasilapi("00000000000191") # Exemplo
    cnpj_enriquecido = {
        "cnpj": "00000000000191",
        "razao_social": cnpj_mock.get('razao_social', 'N/A'),
        "cnae_principal": cnpj_mock.get('cnae_fiscal_descricao', 'N/A'),
        "porte": cnpj_mock.get('porte', 'N/A'),
    } if cnpj_mock else None
    
    # Dados de Mercado de Trabalho e Empresas
    mercado_trabalho = MERCADO_TRABALHO_MOCK.get(codigo_ibge, {})
    salario_medio_admissao = mercado_trabalho.get("salario_medio_admissao", 0)
    bench_salario_nacional = BENCHMARK_NACIONAL["salario_medio_admissao"]
    bench_desemprego_nacional = BENCHMARK_NACIONAL["taxa_desemprego"]
    
    return {
        "municipio_ibge": codigo_ibge,
        "nome_municipio": next((item['nome_municipio'] for item in pop_municipal_data if item['codigo_ibge'] == codigo_ibge), "N/A"),
        "uf_sigla": uf_sigla,
        
        # População e Benchmarking
        "populacao": {
            "municipal": pop_municipio,
            "uf": pop_uf,
            "brasil": pop_brasil,
            "perc_pop_uf": round(perc_pop_uf, 2),
            "piramide_etaria": piramide_etaria,
            "indices_demograficos": {
                "pea": pea,
                "idosos_por_pea": round(idosos_por_pea, 2),
                "criancas_por_pea": round(criancas_por_pea, 2),
            }
        },
        
        # Leitos e Benchmarking
        "leitos": {
            "total": leitos_data["total"],
            "razao_por_mil": round(razao_leitos_por_mil, 2),
            "publico_perc": leitos_data["publico_perc"],
            "privado_perc": leitos_data["privado_perc"],
            "benchmarking": {
                "nacional": bench_leitos_nacional,
                "status": "Acima da Média Nacional" if razao_leitos_por_mil > bench_leitos_nacional else "Abaixo da Média Nacional"
            }
        },
        
        # Estabelecimentos
        "estabelecimentos": {
            "por_tipo": leitos_data["estabelecimentos"],
            "benchmarking_nacional": BENCHMARK_NACIONAL["estabelecimentos_por_tipo"], # Mock
            "top_5_leitos": TOP_5_LEITOS_MOCK.get(codigo_ibge, []) # Mock dos 5 maiores
        },
        

        
        # Planos de Saúde
        "planos_saude": {
            "beneficiarios": planos_saude_beneficiarios,
            "cobertura_plano_saude_perc": round(cobertura_plano_saude_perc, 2),
            "benchmarking": {
                "nacional": bench_cobertura_nacional,
                "status": "Acima da Média Nacional" if cobertura_plano_saude_perc > bench_cobertura_nacional else "Abaixo da Média Nacional"
            },
            "ans_enriquecimento": ans_enriquecimento # Mock de dados ANS
        },
        
        # Mercado de Trabalho e Empresas (Novo Enriquecimento)
        "mercado_trabalho": {
            "salario_medio_admissao": salario_medio_admissao,
            "estoque_empregos": mercado_trabalho.get("estoque_empregos", 0),
            "saldo_empregos_mes": mercado_trabalho.get("saldo_empregos_mes", 0),
            "taxa_desemprego": mercado_trabalho.get("taxa_desemprego", 0),
            "empresas_total": mercado_trabalho.get("empresas_total", 0),
            "perc_empresas_uf": mercado_trabalho.get("perc_empresas_uf", 0),
            "benchmarking": {
                "salario_nacional": bench_salario_nacional,
                "desemprego_nacional": bench_desemprego_nacional,
                "status_salario": "Acima da Média Nacional" if salario_medio_admissao > bench_salario_nacional else "Abaixo da Média Nacional",
                "status_desemprego": "Abaixo da Média Nacional" if mercado_trabalho.get("taxa_desemprego", 0) < bench_desemprego_nacional else "Acima da Média Nacional",
                "status_tendencia": "Crescimento" if mercado_trabalho.get("saldo_empregos_mes", 0) > 0 else "Queda"
            }
        },
        
        # Enriquecimento CNPJ (Mantido para fins de exemplo)
        "cnpj_enriquecido": cnpj_enriquecido
    }

# --- Exemplo de uso (para teste) ---
if __name__ == "__main__":
    # Teste de normalização de CNPJ
    print("\n--- Teste de Normalização de CNPJ ---")
    cnpj_raw = "00.000.000/0001-91"
    cnpj_normalized = normalize_cnpj(cnpj_raw)
    print(f"CNPJ bruto: {cnpj_raw}")
    print(f"CNPJ normalizado: {cnpj_normalized}") # Esperado: 00000000000191
    
    # Teste de download (simulado)
    print("\n--- Teste de Download CNES (Simulado) ---")
    download_path = download_cnes("data/raw/cnes")
    
    # Teste de geocodificação (requer internet)
    print("\n--- Teste de Geocodificação (Nominatim) ---")
    address = "Rua das Rogérias 62, São José dos Campos"
    lat, lon = geocode_address(address)
    print(f"Endereço: {address}")
    print(f"Latitude, Longitude: {lat}, {lon}")
    
    # Simulação de limite de taxa
    print("Aguardando 1 segundo para respeitar o limite de taxa...")
    time.sleep(1)
    
    address_2 = "Avenida Paulista, 1000, São Paulo"
    lat_2, lon_2 = geocode_address(address_2)
    print(f"Endereço: {address_2}")
    print(f"Latitude, Longitude: {lat_2}, {lon_2}")
    
    # --- Teste de Fetching IBGE ---
    print("\n--- Teste de Fetching IBGE (População Municipal) ---")
    populacao_data = fetch_ibge_populacao_municipal()
    if populacao_data:
        print(f"Primeiros 5 resultados do IBGE:")
        for item in populacao_data[:5]:
            print(f"  {item['nome_municipio']} ({item['codigo_ibge']}): {item['populacao_estimada']:,} hab. ({item['ano_referencia']})")
    
    # --- Teste de    # 5. Fetching BrasilAPI (CNPJ)
    print("\n--- 5. Teste de Fetching BrasilAPI (CNPJ) ---")
    cnpj_teste = "00000000000191" # CNPJ da Petrobras (exemplo comum)
    print(f"Buscando CNPJ: {cnpj_teste}")
    cnpj_data = fetch_cnpj_brasilapi(cnpj_teste)
    if cnpj_data:
        print(f"Razão Social: {cnpj_data.get('razao_social')}")
        print(f"CNAE Principal: {cnpj_data.get('cnae_fiscal_descricao')}")
        print(f"Porte: {cnpj_data.get('porte')}")
    
    # Simulação de limite de taxa
    print("Aguardando 1 segundo para respeitar o limite de taxa...")
    time.sleep(1)
    
    cnpj_invalido = "11111111111111"
    print(f"Buscando CNPJ inválido: {cnpj_invalido}")
    fetch_cnpj_brasilapi(cnpj_invalido)
    
    # 6. Teste de Fetching IBGE (População UF e Brasil)
    print("\n--- 6. Teste de Fetching IBGE (População UF e Brasil) ---")
    
    pop_brasil = fetch_ibge_populacao_brasil()
    print(f"População Estimada Brasil: {pop_brasil:,} hab.")
    
    pop_uf = fetch_ibge_populacao_uf()
    if pop_uf:
        print(f"População Estimada SP: {pop_uf.get('SP', 'N/A')} hab.")
        print(f"População Estimada RJ: {pop_uf.get('RJ', 'N/A')} hab.")
    else:
        print("Falha ao buscar população por UF.")
        
    # 7. Teste de Processamento de Inteligência de Mercado
    print("\n--- 7. Teste de Processamento de Inteligência de Mercado ---")
    # Código IBGE de São José dos Campos: 3549904
    codigo_sjc = "3549904"
    uf_sjc = "SP"
    
    dados_inteligencia = process_market_intelligence(codigo_sjc, uf_sjc)
    
    if dados_inteligencia:
        print(f"Dados de Inteligência para {dados_inteligencia['nome_municipio']} ({dados_inteligencia['uf_sigla']}):")
        print(f"  População Municipal: {dados_inteligencia['populacao']['municipal']:,} hab.")
        print(f"  % População UF: {dados_inteligencia['populacao']['perc_pop_uf']}%")
        print(f"  Razão Leitos/1000 hab: {dados_inteligencia['leitos']['razao_por_mil']}")
        print(f"  Benchmarking Leitos Nacional: {dados_inteligencia['leitos']['benchmarking']['status']}")
        print(f"  Cobertura Plano de Saúde: {dados_inteligencia['planos_saude']['cobertura_plano_saude_perc']}%")
        print(f"  Enriquecimento CNPJ (CNAE): {dados_inteligencia['cnpj_enriquecido']['cnae_principal']}")
        piramide = dados_inteligencia['populacao']['piramide_etaria']
        if piramide:
            print(f"  Primeiros 5 grupos da Pirâmide Etária:")
            for item in piramide[:5]:
                print(f"    {item['idade_grupo']} ({item['sexo']}): {item['populacao']:,} pessoas")
        else:
            print("  Pirâmide Etária: Dados indisponíveis.")