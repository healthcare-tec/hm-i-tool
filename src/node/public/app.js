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

// Exibir resultados com métricas comparativas
function exibirResultados(dados, municipioNome) {
    const pop = dados.populacao;
    const leitos = dados.leitos;
    const planosSaude = dados.planos_saude;
    const estabelecimentos = dados.estabelecimentos;
    const cnpj = dados.cnpj_enriquecido;
    
    // Calcular percentual de população em relação ao Brasil
    const percPopBrasil = ((pop.municipal / pop.brasil) * 100).toFixed(2);
    
    // Calcular índice de envelhecimento (simplificado)
    const idosos = pop.piramide_etaria.filter(p => p.idade_grupo.includes('60') || p.idade_grupo.includes('65') || p.idade_grupo.includes('70')).reduce((sum, p) => sum + p.populacao, 0);
    const criancas = pop.piramide_etaria.filter(p => p.idade_grupo.includes('0-4') || p.idade_grupo.includes('5-9')).reduce((sum, p) => sum + p.populacao, 0);
    const indiceEnvelhecimento = criancas > 0 ? ((idosos / criancas) * 100).toFixed(2) : 'N/A';
    
    const html = `
        <div class="resultado-item">
            <h3>${municipioNome}</h3>
            <p><strong>Código IBGE:</strong> ${dados.municipio_ibge} | <strong>Estado:</strong> ${dados.uf_sigla}</p>
            
            <!-- SEÇÃO: POPULAÇÃO E BENCHMARKING -->
            <div style="margin-top: 25px; padding: 20px; background: #f0f4ff; border-radius: 8px; border-left: 5px solid #667eea;">
                <h4 style="color: #667eea; margin-bottom: 15px;">📊 POPULAÇÃO E DADOS DEMOGRÁFICOS</h4>
                
                <div class="resultado-grid">
                    <div class="resultado-card">
                        <h4>População Municipal</h4>
                        <p>${pop.municipal.toLocaleString('pt-BR')} hab.</p>
                        <small style="color: #999;">% do Brasil: ${percPopBrasil}%</small>
                    </div>
                    
                    <div class="resultado-card">
                        <h4>População do Estado</h4>
                        <p>${pop.uf.toLocaleString('pt-BR')} hab.</p>
                        <small style="color: #999;">% da População UF: ${pop.perc_pop_uf}%</small>
                    </div>
                    
                    <div class="resultado-card">
                        <h4>Índice de Envelhecimento</h4>
                        <p>${indiceEnvelhecimento}</p>
                        <small style="color: #999;">Idosos / Crianças</small>
                    </div>
                </div>
                
                <div style="margin-top: 15px; padding: 15px; background: white; border-radius: 6px;">
                    <h5 style="color: #333; margin-bottom: 10px;">Pirâmide Etária (Amostra)</h5>
                    <table style="width: 100%; font-size: 0.9em;">
                        <tr style="background: #f5f5f5;">
                            <th style="text-align: left; padding: 8px;">Faixa Etária</th>
                            <th style="text-align: center; padding: 8px;">Homens</th>
                            <th style="text-align: center; padding: 8px;">Mulheres</th>
                        </tr>
                        ${pop.piramide_etaria.slice(0, 6).map((item, idx) => {
                            if (idx % 2 === 0) {
                                const mulheres = pop.piramide_etaria[idx + 1];
                                return `
                                    <tr>
                                        <td style="padding: 8px;">${item.idade_grupo}</td>
                                        <td style="text-align: center; padding: 8px;">${item.populacao.toLocaleString('pt-BR')}</td>
                                        <td style="text-align: center; padding: 8px;">${mulheres ? mulheres.populacao.toLocaleString('pt-BR') : 'N/A'}</td>
                                    </tr>
                                `;
                            }
                            return '';
                        }).join('')}
                    </table>
                </div>
            </div>
            
            <!-- SEÇÃO: LEITOS E BENCHMARKING -->
            <div style="margin-top: 25px; padding: 20px; background: #fff0f5; border-radius: 8px; border-left: 5px solid #e91e63;">
                <h4 style="color: #e91e63; margin-bottom: 15px;">🏥 LEITOS E INFRAESTRUTURA HOSPITALAR</h4>
                
                <div class="resultado-grid">
                    <div class="resultado-card" style="background: #ffe0e6; border-left-color: #e91e63;">
                        <h4>Total de Leitos</h4>
                        <p>${leitos.total.toLocaleString('pt-BR')}</p>
                    </div>
                    
                    <div class="resultado-card" style="background: #ffe0e6; border-left-color: #e91e63;">
                        <h4>Razão Leitos/1000 hab.</h4>
                        <p>${leitos.razao_por_mil}</p>
                        <small style="color: #999;">Nacional: ${leitos.benchmarking.nacional}</small>
                    </div>
                    
                    <div class="resultado-card" style="background: #ffe0e6; border-left-color: #e91e63;">
                        <h4>Status Benchmarking</h4>
                        <p style="font-size: 0.95em; color: ${leitos.razao_por_mil > leitos.benchmarking.nacional ? '#4caf50' : '#ff9800'};">${leitos.benchmarking.status}</p>
                    </div>
                </div>
                
                <div style="margin-top: 15px; padding: 15px; background: white; border-radius: 6px;">
                    <h5 style="color: #333; margin-bottom: 10px;">Distribuição de Leitos</h5>
                    <div style="display: flex; gap: 20px;">
                        <div style="flex: 1;">
                            <div style="background: #4caf50; color: white; padding: 10px; border-radius: 6px; text-align: center;">
                                <strong>${leitos.publico_perc}%</strong>
                                <p style="margin: 5px 0 0 0; font-size: 0.9em;">Públicos</p>
                            </div>
                        </div>
                        <div style="flex: 1;">
                            <div style="background: #2196f3; color: white; padding: 10px; border-radius: 6px; text-align: center;">
                                <strong>${leitos.privado_perc}%</strong>
                                <p style="margin: 5px 0 0 0; font-size: 0.9em;">Privados</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- SEÇÃO: ESTABELECIMENTOS DE SAÚDE -->
            <div style="margin-top: 25px; padding: 20px; background: #f0fff4; border-radius: 8px; border-left: 5px solid #4caf50;">
                <h4 style="color: #4caf50; margin-bottom: 15px;">🏢 ESTABELECIMENTOS DE SAÚDE</h4>
                
                <table style="width: 100%; font-size: 0.9em; margin-bottom: 15px;">
                    <tr style="background: #e8f5e9;">
                        <th style="text-align: left; padding: 10px;">Tipo de Estabelecimento</th>
                        <th style="text-align: center; padding: 10px;">Local</th>
                        <th style="text-align: center; padding: 10px;">Nacional (Benchmark)</th>
                    </tr>
                    ${Object.entries(estabelecimentos.por_tipo).map(([tipo, qtd]) => `
                        <tr style="border-bottom: 1px solid #e0e0e0;">
                            <td style="padding: 10px;">${tipo}</td>
                            <td style="text-align: center; padding: 10px;"><strong>${qtd}</strong></td>
                            <td style="text-align: center; padding: 10px;">${estabelecimentos.benchmarking_nacional[tipo] || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
            
            <!-- SEÇÃO: PLANOS DE SAÚDE -->
            <div style="margin-top: 25px; padding: 20px; background: #fff3e0; border-radius: 8px; border-left: 5px solid #ff9800;">
                <h4 style="color: #ff9800; margin-bottom: 15px;">💳 COBERTURA DE PLANOS DE SAÚDE</h4>
                
                <div class="resultado-grid">
                    <div class="resultado-card" style="background: #ffe8cc; border-left-color: #ff9800;">
                        <h4>Beneficiários</h4>
                        <p>${planosSaude.beneficiarios.toLocaleString('pt-BR')}</p>
                    </div>
                    
                    <div class="resultado-card" style="background: #ffe8cc; border-left-color: #ff9800;">
                        <h4>Cobertura Local</h4>
                        <p>${planosSaude.cobertura_plano_saude_perc}%</p>
                        <small style="color: #999;">Nacional: ${planosSaude.benchmarking.nacional}%</small>
                    </div>
                    
                    <div class="resultado-card" style="background: #ffe8cc; border-left-color: #ff9800;">
                        <h4>Status Benchmarking</h4>
                        <p style="font-size: 0.95em; color: ${planosSaude.cobertura_plano_saude_perc > planosSaude.benchmarking.nacional ? '#4caf50' : '#ff9800'};">${planosSaude.benchmarking.status}</p>
                    </div>
                </div>
            </div>
            
            <!-- SEÇÃO: ENRIQUECIMENTO CNPJ -->
            <div style="margin-top: 25px; padding: 20px; background: #f3e5f5; border-radius: 8px; border-left: 5px solid #9c27b0;">
                <h4 style="color: #9c27b0; margin-bottom: 15px;">🏢 ENRIQUECIMENTO DE DADOS (CNPJ)</h4>
                
                ${cnpj ? `
                    <table style="width: 100%; font-size: 0.9em;">
                        <tr style="border-bottom: 1px solid #e0e0e0;">
                            <td style="padding: 10px; font-weight: 600;">CNPJ:</td>
                            <td style="padding: 10px;">${cnpj.cnpj}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e0e0e0;">
                            <td style="padding: 10px; font-weight: 600;">Razão Social:</td>
                            <td style="padding: 10px;">${cnpj.razao_social}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e0e0e0;">
                            <td style="padding: 10px; font-weight: 600;">CNAE Principal:</td>
                            <td style="padding: 10px;">${cnpj.cnae_principal}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: 600;">Porte:</td>
                            <td style="padding: 10px;">${cnpj.porte}</td>
                        </tr>
                    </table>
                ` : '<p>Dados de CNPJ não disponíveis.</p>'}
            </div>
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
