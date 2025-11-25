import os
from etl_utils import normalize_cnpj, download_cnes, geocode_address

def run_etl_demonstration():
    """
    Demonstra a execução das principais funções de ETL.
    """
    print("--- Demonstração de ETL (Python) ---")
    
    # 1. Normalização de CNPJ
    cnpj_raw = "12.345.678/0001-90"
    cnpj_normalized = normalize_cnpj(cnpj_raw)
    print(f"CNPJ '{cnpj_raw}' normalizado para: {cnpj_normalized}")
    
    # 2. Download de Dados (Simulado)
    raw_data_dir = os.path.join(os.getcwd(), "data", "raw")
    print(f"\nTentando download simulado para: {raw_data_dir}")
    download_cnes(raw_data_dir)
    
    # 3. Geocodificação
    address = "Rua Quinze de Novembro, 100, Campinas, SP"
    print(f"\nGeocodificando endereço: '{address}'")
    lat, lon = geocode_address(address)
    if lat and lon:
        print(f"Resultado: Latitude={lat}, Longitude={lon}")
    else:
        print("Geocodificação falhou ou não retornou resultados.")

if __name__ == "__main__":
    # Ativa o ambiente virtual para garantir que as libs estejam disponíveis
    # (Isso é feito manualmente no shell, mas é bom para o contexto)
    # os.system("source .venv/bin/activate") 
    
    run_etl_demonstration()
