// Dados de estados e cidades brasileiras (simplificado para exemplo)
// Em um projeto real, isso viria do backend ou de uma API
const estadosCidades = {
    'SP': {
        nome: 'São Paulo',
        cidades: [
            { nome: 'São Paulo', ibge: 3550308 },
            { nome: 'São José dos Campos', ibge: 3549904 },
            { nome: 'Campinas', ibge: 3509007 },
            { nome: 'Santos', ibge: 3548906 },
            { nome: 'Sorocaba', ibge: 3552403 }
        ]
    },
    'RJ': {
        nome: 'Rio de Janeiro',
        cidades: [
            { nome: 'Rio de Janeiro', ibge: 3304557 },
            { nome: 'Niterói', ibge: 3303302 },
            { nome: 'Duque de Caxias', ibge: 3301702 },
            { nome: 'Nova Iguaçu', ibge: 3303500 },
            { nome: 'São Gonçalo', ibge: 3304144 }
        ]
    },
    'MG': {
        nome: 'Minas Gerais',
        cidades: [
            { nome: 'Belo Horizonte', ibge: 3106200 },
            { nome: 'Uberlândia', ibge: 3170206 },
            { nome: 'Contagem', ibge: 3115200 },
            { nome: 'Juiz de Fora', ibge: 3132404 },
            { nome: 'Montes Claros', ibge: 3143302 }
        ]
    },
    'BA': {
        nome: 'Bahia',
        cidades: [
            { nome: 'Salvador', ibge: 2927408 },
            { nome: 'Feira de Santana', ibge: 2910800 },
            { nome: 'Vitória da Conquista', ibge: 2933801 },
            { nome: 'Camaçari', ibge: 2904202 },
            { nome: 'Ilhéus', ibge: 2915200 }
        ]
    },
    'RS': {
        nome: 'Rio Grande do Sul',
        cidades: [
            { nome: 'Porto Alegre', ibge: 4314902 },
            { nome: 'Caxias do Sul', ibge: 4305108 },
            { nome: 'Pelotas', ibge: 4314407 },
            { nome: 'Santa Maria', ibge: 4316907 },
            { nome: 'Novo Hamburgo', ibge: 4313409 }
        ]
    }
};

// Elementos do DOM
const estadoSelect = document.getElementById('estado');
const municipioSelect = document.getElementById('municipio');
const buscarBtn = document.getElementById('buscarBtn');
const resultadosSection = document.getElementById('resultadosSection');
const erroSection = document.getElementById('erroSection');
const resultadosDiv = document.getElementById('resultados');
const erroDiv = document.getElementById('erro');

// Inicializar o dropdown de estados
function inicializarEstados() {
    Object.entries(estadosCidades).forEach(([sigla, dados]) => {
        const option = document.createElement('option');
        option.value = sigla;
        option.textContent = `${sigla} - ${dados.nome}`;
        estadoSelect.appendChild(option);
    });
}

// Atualizar cidades quando estado é selecionado
estadoSelect.addEventListener('change', function() {
    const estadoSelecionado = this.value;
    
    // Limpar dropdown de cidades
    municipioSelect.innerHTML = '<option value="">-- Selecione um município --</option>';
    municipioSelect.disabled = !estadoSelecionado;
    buscarBtn.disabled = true;
    
    if (estadoSelecionado) {
        const cidades = estadosCidades[estadoSelecionado].cidades;
        cidades.forEach(cidade => {
            const option = document.createElement('option');
            option.value = cidade.ibge;
            option.textContent = cidade.nome;
            municipioSelect.appendChild(option);
        });
    }
});

// Habilitar botão de busca quando município é selecionado
municipioSelect.addEventListener('change', function() {
    buscarBtn.disabled = !this.value;
});

// Buscar dados da API
buscarBtn.addEventListener('click', async function() {
    const ibgeCode = municipioSelect.value;
    const municipioNome = municipioSelect.options[municipioSelect.selectedIndex].text;
    
    if (!ibgeCode) {
        mostrarErro('Por favor, selecione um município.');
        return;
    }
    
    // Mostrar loading
    resultadosDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Carregando dados...</p></div>';
    resultadosSection.style.display = 'block';
    erroSection.style.display = 'none';
    
    try {
        const response = await fetch(`/api/v1/market-intelligence/${ibgeCode}`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            exibirResultados(data.data, municipioNome);
        } else {
            mostrarErro(data.message || 'Erro ao buscar dados.');
        }
    } catch (error) {
        mostrarErro(`Erro ao conectar com a API: ${error.message}`);
    }
});

// Exibir resultados
function exibirResultados(dados, municipioNome) {
    const html = `
        <div class="resultado-item">
            <h3>${municipioNome}</h3>
            <p><strong>Código IBGE:</strong> ${dados.municipio_ibge}</p>
            
            <div class="resultado-grid">
                <div class="resultado-card">
                    <h4>População</h4>
                    <p>${dados.populacao_total.toLocaleString('pt-BR')} hab.</p>
                </div>
                
                <div class="resultado-card">
                    <h4>Leitos Totais</h4>
                    <p>${dados.leitos_total.toLocaleString('pt-BR')}</p>
                </div>
                
                <div class="resultado-card">
                    <h4>Razão Leitos/1000 hab.</h4>
                    <p>${dados.razao_leitos_por_mil}</p>
                </div>
            </div>
            
            ${dados.cnpj_enriquecido ? `
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <h4 style="color: #667eea; margin-bottom: 10px;">Enriquecimento de Dados (CNPJ)</h4>
                    <p><strong>CNPJ:</strong> ${dados.cnpj_enriquecido.cnpj}</p>
                    <p><strong>Razão Social:</strong> ${dados.cnpj_enriquecido.razao_social}</p>
                </div>
            ` : ''}
        </div>
    `;
    
    resultadosDiv.innerHTML = html;
    resultadosSection.style.display = 'block';
    erroSection.style.display = 'none';
}

// Mostrar erro
function mostrarErro(mensagem) {
    erroDiv.innerHTML = `<p>${mensagem}</p>`;
    erroSection.style.display = 'block';
    resultadosSection.style.display = 'none';
}

// Inicializar a página
document.addEventListener('DOMContentLoaded', function() {
    inicializarEstados();
});
