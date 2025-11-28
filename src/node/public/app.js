// Dados de estados e cidades brasileiras (simplificado para exemplo)
// ESTA LISTA FOI RESTRITA PARA INCLUIR APENAS CIDADES COM DADOS MOCKADOS NO BACKEND (server.js)
const estadosCidades = {
    'SP': {
        nome: 'São Paulo',
        cidades: [
            { nome: 'São José dos Campos', ibge: 3549904 },
            { nome: 'São Paulo', ibge: 3550308 },
            { nome: 'Campinas', ibge: 3509007 },
            { nome: 'Santos', ibge: 3548906 },
            { nome: 'Sorocaba', ibge: 3552403 }
        ]
    },
    'RJ': {
        nome: 'Rio de Janeiro',
        cidades: [
            { nome: 'Rio de Janeiro', ibge: 3304557 },
            { nome: 'Niterói', ibge: 3303302 }
        ]
    },
    'MG': {
        nome: 'Minas Gerais',
        cidades: [
            { nome: 'Belo Horizonte', ibge: 3106200 }
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
    
    // Novos Índices Demográficos
    const indices = pop.indices_demograficos || {};
    const idososPorPea = indices.idosos_por_pea || 'N/A';
    const criancasPorPea = indices.criancas_por_pea || 'N/A';
    
    const html = `
        <div class="resultado-item">
            <h3>${municipioNome}</h3>
            <p><strong>Código IBGE:</strong> ${dados.municipio_ibge} | <strong>Estado:</strong> ${dados.uf_sigla}</p>
            
            <!-- SEÇÃO: POPULAÇÃO E DADOS DEMOGRÁFICOS -->
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
                        <h4>Idosos / PEA</h4>
                        <p>${idososPorPea}%</p>
                        <small style="color: #999;">Razão de Dependência</small>
                    </div>
                    
                    <div class="resultado-card">
                        <h4>Crianças / PEA</h4>
                        <p>${criancasPorPea}%</p>
                        <small style="color: #999;">Razão de Dependência</small>
                    </div>
                </div>
                
                <div style="margin-top: 15px; padding: 15px; background: white; border-radius: 6px;">
                    <h5 style="color: #333; margin-bottom: 10px;">Pirâmide Etária Completa</h5>
                    <table style="width: 100%; font-size: 0.85em; border-collapse: collapse;">
                        <tr style="background: #f5f5f5;">
                            <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Faixa Etária</th>
                            <th style="text-align: center; padding: 8px; border: 1px solid #ddd;">Homens</th>
                            <th style="text-align: center; padding: 8px; border: 1px solid #ddd;">Mulheres</th>
                        </tr>
                        ${pop.piramide_etaria.map((item, idx) => {
                            if (item.sexo === 'Homens') {
                                const mulheres = pop.piramide_etaria[idx + 1];
                                return `
                                    <tr style="border-bottom: 1px solid #e0e0e0;">
                                        <td style="padding: 8px; border: 1px solid #ddd;">${item.idade_grupo}</td>
                                        <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${item.populacao.toLocaleString('pt-BR')}</td>
                                        <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${mulheres ? mulheres.populacao.toLocaleString('pt-BR') : 'N/A'}</td>
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
            
            <!-- SEÇÃO: TOP 5 MAIORES ESTABELECIMENTOS -->
            <div style="margin-top: 25px; padding: 20px; background: #fef3e0; border-radius: 8px; border-left: 5px solid #ff6f00;">
                <h4 style="color: #ff6f00; margin-bottom: 15px;">🏢 TOP 5 MAIORES ESTABELECIMENTOS (POR LEITOS)</h4>
                
                ${estabelecimentos.top_5_leitos && estabelecimentos.top_5_leitos.length > 0 ? `
                    <table style="width: 100%; font-size: 0.9em; margin-bottom: 15px;">
                        <tr style="background: #ffe0b2;">
                            <th style="text-align: left; padding: 10px;">Estabelecimento</th>
                            <th style="text-align: center; padding: 10px;">Leitos</th>
                            <th style="text-align: center; padding: 10px;">Natureza</th>
                        </tr>
                        ${estabelecimentos.top_5_leitos.map(est => `
                            <tr style="border-bottom: 1px solid #e0e0e0;">
                                <td style="padding: 10px;">${est.nome}</td>
                                <td style="text-align: center; padding: 10px;"><strong>${est.leitos}</strong></td>
                                <td style="text-align: center; padding: 10px;">
                                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 0.85em; 
                                        ${est.natureza === 'Público' ? 'background: #4caf50; color: white;' : 
                                          est.natureza === 'Privado' ? 'background: #2196f3; color: white;' : 
                                          'background: #ff9800; color: white;'}">
                                        ${est.natureza}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </table>
                ` : '<p>Dados de estabelecimentos não disponíveis.</p>'}
            </div>
            
            <!-- SEÇÃO: ESTABELECIMENTOS DE SAÚDE -->
            <div style="margin-top: 25px; padding: 20px; background: #f0fff4; border-radius: 8px; border-left: 5px solid #4caf50;">
                <h4 style="color: #4caf50; margin-bottom: 15px;">🏢 ESTABELECIMENTOS DE SAÚDE</h4>
                
                <table style="width: 100%; font-size: 0.9em; margin-bottom: 15px;">
                    <tr style="background: #e8f5e9;">
                        <th style="text-align: left; padding: 10px;">Tipo de Estabelecimento</th>
                        <th style="text-align: center; padding: 10px;">Local</th>
                        <th style="text-align: center; padding: 10px;">Benchmarking Nacional</th>
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
            
            <!-- SEÇÃO: MERCADO DE TRABALHO E EMPRESAS -->
            <div style="margin-top: 25px; padding: 20px; background: #e0f7fa; border-radius: 8px; border-left: 5px solid #00bcd4;">
                <h4 style="color: #00bcd4; margin-bottom: 15px;">💼 MERCADO DE TRABALHO E EMPRESAS (CAGED)</h4>
                
                <div class="resultado-grid">
                    <div class="resultado-card" style="background: #e0f7fa; border-left-color: #00bcd4;">
                        <h4>Total de Empresas</h4>
                        <p>${dados.mercado_trabalho.empresas_total.toLocaleString('pt-BR')}</p>
                        <small style="color: #999;">% na UF: ${dados.mercado_trabalho.perc_empresas_uf.toFixed(2)}%</small>
                    </div>
                    
                    <div class="resultado-card" style="background: #e0f7fa; border-left-color: #00bcd4;">
                        <h4>Estoque de Empregos</h4>
                        <p>${dados.mercado_trabalho.estoque_empregos.toLocaleString('pt-BR')}</p>
                        <small style="color: #999;">Saldo Mês: ${dados.mercado_trabalho.saldo_empregos_mes.toLocaleString('pt-BR')} (${dados.mercado_trabalho.benchmarking.status_tendencia})</small>
                    </div>
                    
                    <div class="resultado-card" style="background: #e0f7fa; border-left-color: #00bcd4;">
                        <h4>Salário Médio Admissão</h4>
                        <p>R$ ${dados.mercado_trabalho.salario_medio_admissao.toFixed(2).replace('.', ',')}</p>
                        <small style="color: #999;">Status: ${dados.mercado_trabalho.benchmarking.status_salario}</small>
                    </div>
                    
                    <div class="resultado-card" style="background: #e0f7fa; border-left-color: #00bcd4;">
                        <h4>Taxa de Desemprego (Mock)</h4>
                        <p>${dados.mercado_trabalho.taxa_desemprego.toFixed(2)}%</p>
                        <small style="color: #999;">Status: ${dados.mercado_trabalho.benchmarking.status_desemprego}</small>
                    </div>
                </div>
            </div>
            
            <!-- SEÇÃO: ENRIQUECIMENTO CNPJ -->
            <div style="margin-top: 25px; padding: 20px; background: #f3e5f5; border-radius: 8px; border-left: 5px solid #9c27b0;">
                <h4 style="color: #9c27b0; margin-bottom: 15px;">🏢 ENRIQUECIMENTO CNPJ DE EXEMPLO</h4>
                
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
    municipioSelect.disabled = true;
    buscarBtn.disabled = true;
});
