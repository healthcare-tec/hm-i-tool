const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const IBGE_BASE_URL = 'https://servicodados.ibge.gov.br';
const CNES_BASE_URL = 'https://apidadosabertos.saude.gov.br';

// Pequeno cache em memória para evitar múltiplas chamadas iguais
const cache = {
    states: null,
    citiesByUf: new Map(),
    popMunicipal: new Map(),
    popUf: new Map(),
    popBrasil: null,
    municipioInfo: new Map(),
};

async function fetchJson(url, label) {
    const response = await fetch(url, {
        headers: { 'User-Agent': 'HM-I-Tool/1.0' },
    });

    if (!response.ok) {
        throw new Error(`Falha ao buscar ${label || url}: HTTP ${response.status}`);
    }

    return response.json();
}

function parseAggregadoValue(data) {
    const series = data?.[0]?.resultados?.[0]?.series?.[0]?.serie;
    if (!series) return null;

    const [ano, valor] = Object.entries(series).sort(
        ([a], [b]) => Number(a) - Number(b)
    ).pop();

    return { ano, valor: Number(valor) };
}

async function getMunicipioInfo(ibgeCode) {
    if (cache.municipioInfo.has(ibgeCode)) {
        return cache.municipioInfo.get(ibgeCode);
    }

    const url = `${IBGE_BASE_URL}/api/v1/localidades/municipios/${ibgeCode}`;
    const data = await fetchJson(url, 'informações do município');

    const info = {
        id: data.id,
        nome: data.nome,
        microrregiao: data.microrregiao?.nome,
        mesorregiao: data.microrregiao?.mesorregiao?.nome,
        uf: {
            id: data.microrregiao?.mesorregiao?.UF?.id,
            sigla: data.microrregiao?.mesorregiao?.UF?.sigla,
            nome: data.microrregiao?.mesorregiao?.UF?.nome,
            regiao: data.microrregiao?.mesorregiao?.UF?.regiao,
        },
    };

    cache.municipioInfo.set(ibgeCode, info);
    return info;
}

async function getPopulacaoMunicipal(ibgeCode) {
    if (cache.popMunicipal.has(ibgeCode)) {
        return cache.popMunicipal.get(ibgeCode);
    }

    const url = `${IBGE_BASE_URL}/api/v3/agregados/6579/periodos/-1/variaveis/9324?localidades=N6%5B${ibgeCode}%5D`;
    const data = await fetchJson(url, 'população municipal (IBGE)');
    const parsed = parseAggregadoValue(data);

    cache.popMunicipal.set(ibgeCode, parsed);
    return parsed;
}

async function getPopulacaoUf(ufId) {
    if (!ufId) return null;
    if (cache.popUf.has(ufId)) {
        return cache.popUf.get(ufId);
    }

    const url = `${IBGE_BASE_URL}/api/v3/agregados/6579/periodos/-1/variaveis/9324?localidades=N3%5B${ufId}%5D`;
    const data = await fetchJson(url, 'população da UF (IBGE)');
    const parsed = parseAggregadoValue(data);

    cache.popUf.set(ufId, parsed);
    return parsed;
}

async function getPopulacaoBrasil() {
    if (cache.popBrasil) return cache.popBrasil;

    const url = `${IBGE_BASE_URL}/api/v3/agregados/6579/periodos/-1/variaveis/9324?localidades=N1%5B1%5D`;
    const data = await fetchJson(url, 'população do Brasil (IBGE)');
    const parsed = parseAggregadoValue(data);

    cache.popBrasil = parsed;
    return parsed;
}

async function getHealthEstablishments(ibgeCode) {
    // CNES usa o código de município com 6 dígitos (sem o dígito verificador)
    const codigoMunicipioCnes = String(ibgeCode).padStart(7, '0').slice(0, 6);
    const tiposPermitidos = ['05', '07'];
    const quantidadePorPagina = 200;
    const maxPaginasPorTipo = 10; // limite de segurança para evitar loops infinitos

    async function fetchPorTipo(tipo) {
        const resultados = [];
        for (let pagina = 0; pagina < maxPaginasPorTipo; pagina += 1) {
            const offset = pagina * quantidadePorPagina;
            const url = `${CNES_BASE_URL}/cnes/estabelecimentos?codigo_municipio=${codigoMunicipioCnes}&codigo_tipo_unidade=${tipo}&quantidade=${quantidadePorPagina}&offset=${offset}`;
            const data = await fetchJson(url, `estabelecimentos CNES (tipo ${tipo})`);
            const estabelecimentos = data.estabelecimentos || [];
            resultados.push(...estabelecimentos);

            if (estabelecimentos.length < quantidadePorPagina) break;
        }
        return resultados;
    }

    try {
        const estabelecimentosPorTipo = await Promise.all(
            tiposPermitidos.map((t) => fetchPorTipo(t))
        );
        const estabelecimentosDeduplicados = [];
        const vistos = new Set();
        for (const lista of estabelecimentosPorTipo) {
            for (const est of lista) {
                if (vistos.has(est.codigo_cnes)) continue;
                vistos.add(est.codigo_cnes);
                estabelecimentosDeduplicados.push(est);
            }
        }

        const total = estabelecimentosDeduplicados.length;
        const atendimentoSus = estabelecimentosDeduplicados.filter(
            (e) => (e.estabelecimento_faz_atendimento_ambulatorial_sus || '').toUpperCase() === 'SIM'
        ).length;
        const hospitalares = estabelecimentosDeduplicados.filter(
            (e) => Number(e.estabelecimento_possui_atendimento_hospitalar || 0) > 0
        ).length;

        const distribuicaoPorTipo = estabelecimentosDeduplicados.reduce((acc, est) => {
            const tipo = String(est.codigo_tipo_unidade || 'desconhecido');
            acc[tipo] = (acc[tipo] || 0) + 1;
            return acc;
        }, {});

        const destaques = estabelecimentosDeduplicados
            .slice(0, 40) // limitar antes de ordenar
            .sort(
                (a, b) =>
                    Number(b.estabelecimento_possui_atendimento_hospitalar || 0) -
                    Number(a.estabelecimento_possui_atendimento_hospitalar || 0)
            )
            .slice(0, 8)
            .map((est) => {
                const naturezaJuridica =
                    est.descricao_natureza_juridica_estabelecimento ||
                    est.codigo_natureza_organizacao_unidade ||
                    null;
                const leitosRaw =
                    est.quantidade_leitos_total ||
                    est.quantidade_leitos ||
                    est.total_leitos ||
                    est.qt_leitos_existentes;
                const hospitalar = Number(est.estabelecimento_possui_atendimento_hospitalar || 0) > 0;
                const leitos =
                    hospitalar && leitosRaw !== undefined && leitosRaw !== null ? Number(leitosRaw) : null;

                return {
                    nome: est.nome_fantasia || est.nome_razao_social,
                    codigo_cnes: est.codigo_cnes,
                    tipo_unidade: est.codigo_tipo_unidade,
                    esfera: est.descricao_esfera_administrativa || 'N/D',
                    sus: (est.estabelecimento_faz_atendimento_ambulatorial_sus || '').toUpperCase() === 'SIM',
                    hospitalar,
                    natureza_juridica: naturezaJuridica,
                    leitos,
                };
            });

        const warning =
            total === 0
                ? 'Nenhum estabelecimento dos tipos 05/07 (hospitais) encontrado para este município.'
                : undefined;

        return {
            total_estabelecimentos: total,
            atendimento_sus: atendimentoSus,
            estabelecimentos_hospitalares: hospitalares,
            distribuicao_por_tipo: distribuicaoPorTipo,
            destaques,
            warning,
        };
    } catch (error) {
        console.error('Erro ao buscar CNES:', error.message);
        return {
            total_estabelecimentos: 0,
            atendimento_sus: 0,
            estabelecimentos_hospitalares: 0,
            distribuicao_por_tipo: {},
            destaques: [],
            warning: 'Não foi possível recuperar dados do CNES no momento.',
        };
    }
}

// Endpoint raiz
app.get('/', (req, res) => {
    res.send('HM-I Tool API está rodando. Acesse http://localhost:3000/');
});

// Estados
app.get('/api/v1/states', async (req, res) => {
    try {
        if (!cache.states) {
            const url = `${IBGE_BASE_URL}/api/v1/localidades/estados`;
            const states = await fetchJson(url, 'estados IBGE');
            cache.states = states
                .map((s) => ({
                    id: s.id,
                    sigla: s.sigla,
                    nome: s.nome,
                    regiao: s.regiao,
                }))
                .sort((a, b) => a.nome.localeCompare(b.nome));
        }

        res.json({ status: 'success', data: cache.states });
    } catch (error) {
        console.error('Erro ao carregar estados:', error.message);
        res.status(500).json({ status: 'error', message: 'Não foi possível carregar os estados.' });
    }
});

// Municípios por UF
app.get('/api/v1/cities', async (req, res) => {
    const uf = (req.query.uf || '').toUpperCase();
    if (!uf) {
        return res.status(400).json({ status: 'error', message: 'Parâmetro uf é obrigatório (ex: SP).' });
    }

    try {
        if (!cache.citiesByUf.has(uf)) {
            const url = `${IBGE_BASE_URL}/api/v1/localidades/estados/${uf}/municipios`;
            const cities = await fetchJson(url, `municípios da UF ${uf}`);
            const formatted = cities
                .map((c) => ({
                    ibge: c.id,
                    nome: c.nome,
                    uf,
                }))
                .sort((a, b) => a.nome.localeCompare(b.nome));

            cache.citiesByUf.set(uf, formatted);
        }

        res.json({ status: 'success', data: cache.citiesByUf.get(uf) });
    } catch (error) {
        console.error('Erro ao carregar municípios:', error.message);
        res.status(500).json({ status: 'error', message: 'Não foi possível carregar os municípios dessa UF.' });
    }
});

// Dados de inteligência de mercado (APIs públicas)
app.get('/api/v1/market-intelligence/:ibge_code', async (req, res) => {
    const ibgeCode = req.params.ibge_code;

    try {
        const municipioInfo = await getMunicipioInfo(ibgeCode);
        if (!municipioInfo?.id) {
            return res.status(404).json({
                status: 'error',
                message: `Município não encontrado para o código IBGE ${ibgeCode}.`,
            });
        }

        const [popMunicipal, popUf, popBrasil, saude] = await Promise.all([
            getPopulacaoMunicipal(ibgeCode),
            getPopulacaoUf(municipioInfo.uf.id),
            getPopulacaoBrasil(),
            getHealthEstablishments(ibgeCode),
        ]);

        const percPopUf =
            popMunicipal?.valor && popUf?.valor
                ? ((popMunicipal.valor / popUf.valor) * 100).toFixed(2)
                : null;
        const percPopBrasil =
            popMunicipal?.valor && popBrasil?.valor
                ? ((popMunicipal.valor / popBrasil.valor) * 100).toFixed(4)
                : null;

        res.json({
            status: 'success',
            data: {
                municipio: {
                    nome: municipioInfo.nome,
                    ibge: municipioInfo.id,
                    uf: municipioInfo.uf.sigla,
                    regiao: municipioInfo.uf.regiao?.nome,
                    mesorregiao: municipioInfo.mesorregiao,
                    microrregiao: municipioInfo.microrregiao,
                },
                populacao: {
                    municipal: popMunicipal?.valor || null,
                    ano_municipal: popMunicipal?.ano || null,
                    uf: popUf?.valor || null,
                    ano_uf: popUf?.ano || null,
                    brasil: popBrasil?.valor || null,
                    ano_brasil: popBrasil?.ano || null,
                    perc_pop_uf: percPopUf,
                    perc_pop_brasil: percPopBrasil,
                },
                saude: saude,
            },
            message: 'Dados coletados das APIs públicas IBGE e DataSUS.',
        });
    } catch (error) {
        console.error('Erro ao montar inteligência de mercado:', error);
        res.status(500).json({
            status: 'error',
            message: 'Não foi possível obter os dados públicos no momento.',
            details: error.message,
        });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`\n🚀 HM-I Tool API rodando em http://localhost:${port}`);
    console.log(`\nEndpoints disponíveis:`);
    console.log(`  GET  /api/v1/states`);
    console.log(`  GET  /api/v1/cities?uf=SP`);
    console.log(`  GET  /api/v1/market-intelligence/:ibge_code\n`);
});
