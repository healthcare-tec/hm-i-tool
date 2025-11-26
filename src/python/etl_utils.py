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
    
    # --- Teste de Fetching BrasilAPI (CNPJ) ---
    print("\n--- Teste de Fetching BrasilAPI (CNPJ) ---")
    cnpj_teste = "00000000000191" # CNPJ da Petrobras (exemplo comum)
    print(f"Buscando CNPJ: {cnpj_teste}")
    cnpj_data = fetch_cnpj_brasilapi(cnpj_teste)
    if cnpj_data:
        print(f"Razão Social: {cnpj_data.get('razao_social')}")
        print(f"Situação Cadastral: {cnpj_data.get('situacao_cadastral')}")
    
    # Simulação de limite de taxa
    print("Aguardando 1 segundo para respeitar o limite de taxa...")
    time.sleep(1)
    
    cnpj_invalido = "11111111111111"
    print(f"Buscando CNPJ inválido: {cnpj_invalido}")
    fetch_cnpj_brasilapi(cnpj_invalido)
