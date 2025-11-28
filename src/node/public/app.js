// Carregar lista de cidades dinamicamente da API
let estadosCidades = {};

async function carregarCidades() {
    try {
        const response = await fetch('/api/v1/cities');
        const result = await response.json();
        
        // Organizar cidades por estado
        result.data.forEach(cidade => {
            if (!estadosCidades[cidade.uf]) {
                estadosCidades[cidade.uf] = { cidades: [] };
            }
            estadosCidades[cidade.uf].cidades.push(cidade);
        });
        
        // Ordenar cidades por nome
        Object.keys(estadosCidades).forEach(uf => {
            estadosCidades[uf].cidades.sort((a, b) => a.nome.localeCompare(b.nome));
        });
        
        inicializarEstados();
    } catch (error) {
        console.error('Erro ao carregar cidades:', error);
    }
}

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
    const estados = Object.keys(estadosCidades).sort();
    estados.forEach(sigla => {
        const option = document.createElement('option');
        option.value = sigla;
        option.textContent = sigla;
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
            // Carregar análise OpenAI
            carregarAnaliseOpenAI(ibgeCode);
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
    const saude = dados.saude;
    const planosSaude = dados.planos_saude;
    const mercadoTrabalho = dados.mercado_trabalho;
    
    // Calcular percentuais
    const percPopBrasil = ((pop.municipal / pop.brasil) * 100).toFixed(4);
    
    const html = `
        <div class="resultado-item">
            <h2>${municipioNome} - ${dados.uf_sigla}</h2>
            <p><strong>Código IBGE:</strong> ${dados.municipio_ibge}</p>
            
            <!-- SEÇÃO: POPULAÇÃO E DADOS DEMOGRÁFICOS -->
            <div style="margin-top: 25px; padding: 20px; background: #f0f4ff; border-radius: 8px; border-left: 5px solid #667eea;">
                <h3 style="color: #667eea; margin-bottom: 15px;">📊 POPULAÇÃO E DADOS DEMOGRÁFICOS</h3>
                
                <div class="resultado-grid">
                    <div class="resultado-card">
                        <h4>População Municipal</h4>
                        <p>${pop.municipal.toLocaleString('pt-BR')} hab.</p>
                        <small style="color: #999;">% do Brasil: ${percPopBrasil}% | % do Estado: ${pop.perc_pop_uf}%</small>
                    </div>
                    
                    <div class="resultado-card">
                        <h4>Idosos / PEA</h4>
                        <p>${pop.indices_demograficos.idosos_pea}</p>
                        <small style="color: #999;">Razão de Dependência</small>
                    </div>
                    
                    <div class="resultado-card">
                        <h4>Crianças / PEA</h4>
                        <p>${pop.indices_demograficos.criancas_pea}</p>
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
                <h3 style="color: #e91e63; margin-bottom: 15px;">🏥 LEITOS E INFRAESTRUTURA HOSPITALAR</h3>
                
                <div class="resultado-grid">
                    <div class="resultado-card" style="background: #ffe0e6; border-left-color: #e91e63;">
                        <h4>Razão Leitos/1000 hab.</h4>
                        <p>${saude.razao_leitos_por_mil}</p>
                        <small style="color: #999;">Municipal: ${saude.benchmarking.municipal} | Estadual: ${saude.benchmarking.estadual} | Nacional: ${saude.benchmarking.nacional}</small>
                        <small style="color: #666; margin-top: 5px; display: block;"><strong>Status Estadual:</strong> ${saude.benchmarking.status_estadual} | <strong>Status Nacional:</strong> ${saude.benchmarking.status_nacional}</small>
                    </div>
                    
                    <div class="resultado-card" style="background: #ffe0e6; border-left-color: #e91e63;">
                        <h4>Distribuição de Leitos</h4>
                        <p>Públicos: ${saude.leitos_publicos_perc}% | Privados: ${saude.leitos_privados_perc}%</p>
                    </div>
                </div>
            </div>
            
            <!-- SEÇÃO: TOP 5 MAIORES ESTABELECIMENTOS -->
            <div style="margin-top: 25px; padding: 20px; background: #fef3e0; border-radius: 8px; border-left: 5px solid #ff6f00;">
                <h3 style="color: #ff6f00; margin-bottom: 15px;">🏢 TOP 5 MAIORES ESTABELECIMENTOS (POR LEITOS)</h3>
                
                <table style="width: 100%; font-size: 0.9em; margin-bottom: 15px;">
                    <tr style="background: #ffe0b2;">
                        <th style="text-align: left; padding: 10px;">Estabelecimento</th>
                        <th style="text-align: center; padding: 10px;">Leitos</th>
                        <th style="text-align: center; padding: 10px;">Natureza</th>
                    </tr>
                    ${saude.top_5_estabelecimentos.map(est => `
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
            </div>
            
            <!-- SEÇÃO: PLANOS DE SAÚDE (ANS) -->
            <div style="margin-top: 25px; padding: 20px; background: #fff3e0; border-radius: 8px; border-left: 5px solid #ff9800;">
                <h3 style="color: #ff9800; margin-bottom: 15px;">💳 COBERTURA DE PLANOS DE SAÚDE (ANS)</h3>
                
                <div class="resultado-grid">
                    <div class="resultado-card" style="background: #ffe8cc; border-left-color: #ff9800;">
                        <h4>Beneficiários</h4>
                        <p>${planosSaude.beneficiarios.toLocaleString('pt-BR')}</p>
                    </div>
                    
                    <div class="resultado-card" style="background: #ffe8cc; border-left-color: #ff9800;">
                        <h4>Cobertura Local</h4>
                        <p>${planosSaude.cobertura_plano_saude_perc}%</p>
                        <small style="color: #999;">Estadual: ${planosSaude.benchmarking.estadual}% | Nacional: ${planosSaude.benchmarking.nacional}%</small>
                        <small style="color: #666; margin-top: 5px; display: block;"><strong>Status Estadual:</strong> ${planosSaude.benchmarking.status_estadual} | <strong>Status Nacional:</strong> ${planosSaude.benchmarking.status_nacional}</small>
                    </div>
                </div>
            </div>
            
            <!-- SEÇÃO: MERCADO DE TRABALHO E EMPRESAS (CAGED) -->
            <div style="margin-top: 25px; padding: 20px; background: #e0f7fa; border-radius: 8px; border-left: 5px solid #00bcd4;">
                <h3 style="color: #00bcd4; margin-bottom: 15px;">💼 MERCADO DE TRABALHO E EMPRESAS (CAGED)</h3>
                
                <div class="resultado-grid">
                    <div class="resultado-card" style="background: #b2ebf2; border-left-color: #00bcd4;">
                        <h4>Salário Médio de Admissão</h4>
                        <p>R$ ${mercadoTrabalho.salario_medio_admissao.toLocaleString('pt-BR')}</p>
                        <small style="color: #999;">Estadual: R$ ${mercadoTrabalho.benchmarking.salario_estadual.toLocaleString('pt-BR')} | Nacional: R$ ${mercadoTrabalho.benchmarking.salario_nacional.toLocaleString('pt-BR')}</small>
                        <small style="color: #666; margin-top: 5px; display: block;"><strong>Status Estadual:</strong> ${mercadoTrabalho.benchmarking.status_salario_estadual} | <strong>Status Nacional:</strong> ${mercadoTrabalho.benchmarking.status_salario_nacional}</small>
                    </div>
                    
                    <div class="resultado-card" style="background: #b2ebf2; border-left-color: #00bcd4;">
                        <h4>Taxa de Desemprego</h4>
                        <p>${mercadoTrabalho.taxa_desemprego}%</p>
                        <small style="color: #999;">Estadual: ${mercadoTrabalho.benchmarking.desemprego_estadual}% | Nacional: ${mercadoTrabalho.benchmarking.desemprego_nacional}%</small>
                    </div>
                    
                    <div class="resultado-card" style="background: #b2ebf2; border-left-color: #00bcd4;">
                        <h4>Estoque de Empregos</h4>
                        <p>${mercadoTrabalho.estoque_empregos.toLocaleString('pt-BR')}</p>
                        <small style="color: #999;">Saldo Mês: ${mercadoTrabalho.saldo_empregos_mes > 0 ? '+' : ''}${mercadoTrabalho.saldo_empregos_mes.toLocaleString('pt-BR')}</small>
                    </div>
                    
                    <div class="resultado-card" style="background: #b2ebf2; border-left-color: #00bcd4;">
                        <h4>Total de Empresas</h4>
                        <p>${mercadoTrabalho.empresas_total.toLocaleString('pt-BR')}</p>
                    </div>
                </div>
            </div>
            
            <!-- SEÇÃO: ANÁLISE OPENAI -->
            <div id="analiseOpenAI" style="margin-top: 25px; padding: 20px; background: #f3e5f5; border-radius: 8px; border-left: 5px solid #9c27b0;">
                <h3 style="color: #9c27b0; margin-bottom: 15px;">🤖 ANÁLISE DE INTELIGÊNCIA DE MERCADO (OpenAI)</h3>
                <div style="text-align: center; padding: 20px;">
                    <div class="spinner"></div>
                    <p>Gerando análise...</p>
                </div>
            </div>
        </div>
    `;
    
    resultadosDiv.innerHTML = html;
}

// Carregar análise OpenAI
async function carregarAnaliseOpenAI(ibgeCode) {
    try {
        const response = await fetch(`/api/v1/analysis/${ibgeCode}`);
        const result = await response.json();
        
        if (result.status === 'success') {
            const analysis = result.analysis;
            const analiseDiv = document.getElementById('analiseOpenAI');
            
            let html = `
                <h3 style="color: #9c27b0; margin-bottom: 15px;">🤖 ANÁLISE DE INTELIGÊNCIA DE MERCADO (OpenAI)</h3>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="color: #d32f2f; margin-bottom: 10px;">⚠️ Problemas e Desafios</h4>
                    <ul style="margin: 0; padding-left: 20px;">
                        ${analysis.problemas_desafios.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
                    </ul>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="color: #388e3c; margin-bottom: 10px;">✅ Oportunidades de Investimento</h4>
                    <ul style="margin: 0; padding-left: 20px;">
                        ${analysis.oportunidades.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
                    </ul>
                </div>
                
                <div>
                    <h4 style="color: #0277bd; margin-bottom: 10px;">📈 Fatos Recentes e Tendências</h4>
                    <ul style="margin: 0; padding-left: 20px;">
                        ${analysis.fatos_tendencias.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
                    </ul>
                </div>
            `;
            
            document.getElementById('analiseOpenAI').innerHTML = html;
        } else {
            document.getElementById('analiseOpenAI').innerHTML = `<p style="color: #d32f2f;">Erro ao gerar análise: ${result.message}</p>`;
        }
    } catch (error) {
        console.error('Erro ao carregar análise OpenAI:', error);
        document.getElementById('analiseOpenAI').innerHTML = `<p style="color: #d32f2f;">Erro ao conectar com a análise: ${error.message}</p>`;
    }
}

// Mostrar erro
function mostrarErro(mensagem) {
    erroDiv.textContent = mensagem;
    erroSection.style.display = 'block';
    resultadosSection.style.display = 'none';
}

// Inicializar ao carregar a página
window.addEventListener('DOMContentLoaded', carregarCidades);
