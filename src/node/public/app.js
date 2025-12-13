// Elementos do DOM
const estadoSelect = document.getElementById('estado');
const municipioSelect = document.getElementById('municipio');
const buscarBtn = document.getElementById('buscarBtn');
const resultadosSection = document.getElementById('resultadosSection');
const erroSection = document.getElementById('erroSection');
const resultadosDiv = document.getElementById('resultados');
const erroDiv = document.getElementById('erro');

let estados = [];
let cidadesAtual = [];

// Inicializar estados e cidades via API
async function carregarEstados() {
    try {
        const response = await fetch('/api/v1/states');
        const result = await response.json();
        estados = result.data || [];

        estados.forEach((estado) => {
            const option = document.createElement('option');
            option.value = estado.sigla;
            option.textContent = `${estado.sigla} - ${estado.nome}`;
            estadoSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar estados:', error);
        mostrarErro('Não foi possível carregar a lista de estados agora.');
    }
}

async function carregarCidadesPorUf(uf) {
    municipioSelect.innerHTML = '<option value="">-- Selecione um município --</option>';
    municipioSelect.disabled = true;
    buscarBtn.disabled = true;

    if (!uf) return;

    try {
        const response = await fetch(`/api/v1/cities?uf=${uf}`);
        const result = await response.json();
        cidadesAtual = result.data || [];

        cidadesAtual.forEach((cidade) => {
            const option = document.createElement('option');
            option.value = cidade.ibge;
            option.textContent = cidade.nome;
            municipioSelect.appendChild(option);
        });

        municipioSelect.disabled = false;
    } catch (error) {
        console.error('Erro ao carregar cidades:', error);
        mostrarErro('Não foi possível carregar os municípios desta UF.');
    }
}

// Atualizar cidades quando estado é selecionado
estadoSelect.addEventListener('change', function() {
    const estadoSelecionado = this.value;

    carregarCidadesPorUf(estadoSelecionado);
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
    const estadoSelecionado = estadoSelect.options[estadoSelect.selectedIndex].text;

    resultadosDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Consultando IBGE e DataSUS...</p></div>';
    resultadosSection.style.display = 'block';
    erroSection.style.display = 'none';

    try {
        const response = await fetch(`/api/v1/market-intelligence/${ibgeCode}`);

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'success') {
            exibirResultados(data.data, municipioNome, estadoSelecionado);
        } else {
            mostrarErro(data.message || 'Erro ao buscar dados.');
        }
    } catch (error) {
        mostrarErro(`Erro ao conectar com a API: ${error.message}`);
    }
});

// Exibir resultados com métricas comparativas
function exibirResultados(dados, municipioNome, estadoLabel) {
    const pop = dados.populacao || {};
    const saude = dados.saude || {};

    const format = (value) => value ? Number(value).toLocaleString('pt-BR') : 'N/D';
    const formatTipo = (tipo) => {
        const normalizado = String(tipo || '').padStart(2, '0');
        if (normalizado === '05') return 'Geral';
        if (normalizado === '07') return 'Especializado';
        return normalizado || 'N/D';
    };
    const destaques = saude.destaques || [];

    const html = `
        <div class="resultado-item">
            <h2>${municipioNome} - ${dados.municipio.uf}</h2>
            <p><strong>UF / Região:</strong> ${estadoLabel} | ${dados.municipio.regiao || 'N/D'}</p>
            <p><strong>Código IBGE:</strong> ${dados.municipio.ibge}</p>

            <!-- POPULAÇÃO -->
            <div style="margin-top: 25px; padding: 20px; background: #f0f4ff; border-radius: 8px; border-left: 5px solid #667eea;">
                <h3 style="color: #667eea; margin-bottom: 15px;">📊 População (IBGE)</h3>
                <div class="resultado-grid">
                    <div class="resultado-card">
                        <h4>População Municipal (${pop.ano_municipal || 'ano N/D'})</h4>
                        <p>${format(pop.municipal)} hab.</p>
                        <small style="color: #999;">${pop.ano_brasil ? `Referência nacional ${pop.ano_brasil}` : ''}</small>
                    </div>
                    <div class="resultado-card">
                        <h4>% do Estado</h4>
                        <p>${pop.perc_pop_uf || 'N/D'}%</p>
                        <small style="color: #999;">População UF: ${format(pop.uf)}</small>
                    </div>
                    <div class="resultado-card">
                        <h4>% do Brasil</h4>
                        <p>${pop.perc_pop_brasil || 'N/D'}%</p>
                        <small style="color: #999;">População Brasil: ${format(pop.brasil)}</small>
                    </div>
                </div>
            </div>

            <!-- SAÚDE -->
            <div style="margin-top: 25px; padding: 20px; background: #fff8ef; border-radius: 8px; border-left: 5px solid #ff9800;">
                <h3 style="color: #ff9800; margin-bottom: 15px;">🏥 Estabelecimentos de Saúde (CNES)</h3>
                <div class="resultado-grid">
                    <div class="resultado-card" style="background:#fff0e0; border-left-color:#ff9800;">
                        <h4>Total de Estabelecimentos</h4>
                        <p>${format(saude.total_estabelecimentos)}</p>
                        <small style="color:#999;">Incluindo todos os tipos registrados no CNES</small>
                    </div>
                    <div class="resultado-card" style="background:#fff0e0; border-left-color:#ff9800;">
                        <h4>Atendem SUS</h4>
                        <p>${format(saude.atendimento_sus)}</p>
                        <small style="color:#999;">Ambulatorial SUS = SIM</small>
                    </div>
                    <div class="resultado-card" style="background:#fff0e0; border-left-color:#ff9800;">
                        <h4>Hospitalares</h4>
                        <p>${format(saude.estabelecimentos_hospitalares)}</p>
                        <small style="color:#999;">Possuem atendimento hospitalar</small>
                    </div>
                </div>

                <div style="margin-top: 20px;">
                    <h4 style="color: #ff6f00; margin-bottom: 10px;">Principais estabelecimentos</h4>
                    ${
                        destaques.length
                            ? `
                                <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
                                    <tr style="background: #ffe0b2;">
                                        <th style="text-align:left; padding:8px;">Nome</th>
                                        <th style="text-align:center; padding:8px;">Tipo</th>
                                        <th style="text-align:center; padding:8px;">SUS</th>
                                        <th style="text-align:center; padding:8px;">Hospitalar</th>
                                    </tr>
                                    ${destaques.map(est => `
                                        <tr style="border-bottom: 1px solid #f0d9b5;">
                                            <td style="padding:8px;">${est.nome || 'Não informado'}</td>
                                            <td style="text-align:center; padding:8px;">${formatTipo(est.tipo_unidade)}</td>
                                            <td style="text-align:center; padding:8px;">${est.sus ? 'Sim' : 'Não'}</td>
                                            <td style="text-align:center; padding:8px;">${est.hospitalar ? 'Sim' : 'Não'}</td>
                                        </tr>
                                    `).join('')}
                                </table>
                              `
                            : `<p style="color:#555;">Sem estabelecimentos destacados ou dados indisponíveis para este município.</p>`
                    }
                    ${saude.warning ? `<p style="color:#d32f2f; margin-top:10px;">${saude.warning}</p>` : ''}
                </div>
            </div>

        </div>
    `;

    resultadosDiv.innerHTML = html;
}

// Mostrar erro
function mostrarErro(mensagem) {
    erroDiv.textContent = mensagem;
    erroSection.style.display = 'block';
    resultadosSection.style.display = 'none';
}

// Inicializar ao carregar a página
window.addEventListener('DOMContentLoaded', carregarEstados);
