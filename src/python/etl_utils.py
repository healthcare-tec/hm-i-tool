import re
import requests
import time
from pathlib import Path
from typing import Optional, Tuple

# --- Constantes (Mockadas para o exemplo) ---
# O ID do recurso real deve ser obtido no OPENDATASUS
OPENDATASUS_CNES_URL = 'https://opendatasus.saude.gov.br/dataset/cnes-cadastro-nacional-de-estabelecimentos-de-saude/resource/MOCK_RESOURCE_ID/download'
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
