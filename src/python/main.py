import os
from etl_utils import normalize_cnpj, download_cnes, geocode_address, fetch_ibge_populacao_municipal, fetch_cnpj_brasilapi

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
        
    # 4. Fetching IBGE
    print("\n--- 4. Teste de Fetching IBGE (População Municipal) ---")

    
    populacao_data = fetch_ibge_populacao_municipal()
    if populacao_data:
        print(f"Primeiros 5 resultados do IBGE:")
        for item in populacao_data[:5]:
            print(f"  {item['nome_municipio']} ({item['codigo_ibge']}): {item['populacao_estimada']:,} hab. ({item['ano_referencia']})")
    
    # 5. Fetching BrasilAPI (CNPJ)
    print("\n--- 5. Teste de Fetching BrasilAPI (CNPJ) ---")
    cnpj_teste = "00000000000191" # CNPJ da Petrobras (exemplo comum)
    print(f"Buscando CNPJ: {cnpj_teste}")
    cnpj_data = fetch_cnpj_brasilapi(cnpj_teste)
    if cnpj_data:
        print(f"Razão Social: {cnpj_data.get('razao_social')}")
        print(f"Situação Cadastral: {cnpj_data.get('situacao_cadastral')}")
    
    # Simulação de limite de taxa
    print("Aguardando 1 segundo para respeitar o limite de taxa...")
    import time
    time.sleep(1)
    
    cnpj_invalido = "11111111111111"
    print(f"Buscando CNPJ inválido: {cnpj_invalido}")
    fetch_cnpj_brasilapi(cnpj_invalido)

if __name__ == "__main__":
    # Ativa o ambiente virtual para garantir que as libs estejam disponíveis
    # (Isso é feito manualmente no shell, mas é bom para o contexto)
    # os.system("source .venv/bin/activate") 
    
    run_etl_demonstration()
