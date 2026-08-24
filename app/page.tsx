'use client';

import { useEffect, useMemo, useState } from 'react';
import accessData from './data/access.json';

type Medicine = { rank: number; name: string; band: string; revenueRank: number; rename: boolean; component: string };
type AccessMunicipality = { id:string; name:string; uf:string; population:number|null; cnesPharmacies:number; cnesRate:number|null; pfpbCovered:boolean; nearestCnesKm:number|null; nearestCnesMunicipality:string|null; nearestPfpbKm:number|null; nearestPfpbMunicipality:string|null };
type AccessRow = [string,string,string,number|null,number,number|null,boolean,number|null,string|null,number|null,string|null];
type StockEntry = { cnes:string; facility:string; quantity:number; source:string };
type StockData = { municipality:string; product:string; catmat:string; latestDate:string|null; records:number; facilities:number; totalQuantity:number; zeroRecords:number; truncated:boolean; entries:StockEntry[]; caveat:string };

const ufs = [
  ['AC', 0, 3], ['AM', 1, 2], ['RR', 2, 0], ['RO', 2, 4], ['PA', 3, 2], ['AP', 4, 0],
  ['MT', 4, 5], ['MS', 4, 7], ['GO', 5, 5], ['DF', 6, 5], ['TO', 5, 3], ['MA', 6, 2],
  ['PI', 7, 3], ['CE', 8, 2], ['RN', 9, 2], ['PB', 9, 3], ['PE', 8, 4], ['AL', 9, 5],
  ['SE', 8, 6], ['BA', 7, 5], ['MG', 6, 7], ['ES', 7, 8], ['RJ', 6, 9], ['SP', 5, 8],
  ['PR', 4, 9], ['SC', 4, 10], ['RS', 3, 11],
] as const;

const stateNames: Record<string, string> = {
  AC:'Acre', AL:'Alagoas', AP:'Amapá', AM:'Amazonas', BA:'Bahia', CE:'Ceará', DF:'Distrito Federal', ES:'Espírito Santo', GO:'Goiás', MA:'Maranhão', MT:'Mato Grosso', MS:'Mato Grosso do Sul', MG:'Minas Gerais', PA:'Pará', PB:'Paraíba', PR:'Paraná', PE:'Pernambuco', PI:'Piauí', RJ:'Rio de Janeiro', RN:'Rio Grande do Norte', RS:'Rio Grande do Sul', RO:'Rondônia', RR:'Roraima', SC:'Santa Catarina', SP:'São Paulo', SE:'Sergipe', TO:'Tocantins',
};

const intensity: Record<string, number> = { SP:5, MG:4, RJ:4, PR:4, RS:4, BA:3, SC:3, GO:3, PE:3, CE:3, PA:3, ES:2, MT:2, MS:2, MA:2, AM:2, PB:2, RN:2 };

const medicines: Medicine[] = [
  { rank:1, name:'Cloreto de sódio', band:'250–500 mi', revenueRank:3, rename:true, component:'Básico / hospitalar' },
  { rank:2, name:'Dipirona', band:'250–500 mi', revenueRank:4, rename:true, component:'Básico' },
  { rank:3, name:'Losartana potássica', band:'250–500 mi', revenueRank:35, rename:true, component:'Básico / Farmácia Popular' },
  { rank:4, name:'Cloridrato de metformina', band:'100–250 mi', revenueRank:13, rename:true, component:'Básico / Farmácia Popular' },
  { rank:5, name:'Nimesulida', band:'100–250 mi', revenueRank:193, rename:false, component:'Não consta na Rename' },
  { rank:6, name:'Ibuprofeno', band:'50–100 mi', revenueRank:38, rename:true, component:'Básico' },
  { rank:7, name:'Levotiroxina sódica', band:'50–100 mi', revenueRank:18, rename:true, component:'Básico / Farmácia Popular' },
  { rank:8, name:'Hidroclorotiazida', band:'50–100 mi', revenueRank:351, rename:true, component:'Básico / Farmácia Popular' },
  { rank:9, name:'Cloridrato de nafazolina', band:'50–100 mi', revenueRank:179, rename:false, component:'Não consta na Rename' },
  { rank:10, name:'Sinvastatina', band:'50–100 mi', revenueRank:132, rename:true, component:'Básico / Farmácia Popular' },
];

const accessMunicipalities: AccessMunicipality[] = (accessData.municipalities as unknown as AccessRow[]).map(row => ({ id:row[0], name:row[1], uf:row[2], population:row[3], cnesPharmacies:row[4], cnesRate:row[5], pfpbCovered:row[6], nearestCnesKm:row[7], nearestCnesMunicipality:row[8], nearestPfpbKm:row[9], nearestPfpbMunicipality:row[10] }));

const sources = [
  { code:'CMED-2024', name:'Anuário Estatístico do Mercado Farmacêutico 2024', owner:'Anvisa / SCMED', grain:'Brasil · princípio ativo', date:'jul/2025', href:'https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/medicamentos/cmed/' },
  { code:'RENAME-2024.2', name:'Relação Nacional de Medicamentos Essenciais', owner:'Ministério da Saúde', grain:'Brasil · apresentação', date:'2ª ed. 2025', href:'https://www.gov.br/saude/pt-br/composicao/sectics/rename' },
  { code:'BNAFAR-API', name:'Posição de estoque de medicamentos Hórus/BNAFAR', owner:'Ministério da Saúde', grain:'Data · CNES · município · CATMAT', date:'consulta ao vivo', href:'https://dadosabertos.saude.gov.br/dataset/bnafar-posicao-de-estoque/resource/8d9d25ed-01c1-4eb0-bc21-203728073a01' },
  { code:'BPS-2024', name:'Registros de compras compilados 2023–2024', owner:'Ministério da Saúde', grain:'Compra · município · CATMAT', date:'ano-base 2024', href:'https://www.gov.br/saude/pt-br/acesso-a-informacao/banco-de-precos/bases-anuais-compiladas/registro-de-compras-compilados-ano-base-2023-2024/view' },
  { code:'OBM-FHIR', name:'Ontologia Brasileira de Medicamentos', owner:'Ministério da Saúde', grain:'Medicamento · terminologia', date:'versionada', href:'https://portal-obm.saude.gov.br/' },
  { code:'DCB-2026', name:'Denominações Comuns Brasileiras', owner:'Anvisa', grain:'Ingrediente · nomenclatura', date:'jul/2026', href:'https://www.gov.br/anvisa/pt-br/assuntos/farmacopeia/dcb' },
  { code:'SIGTAP', name:'Tabela de procedimentos e medicamentos SUS', owner:'DataSUS', grain:'Competência · procedimento', date:'mensal', href:'https://sigtap.datasus.gov.br/tabela-unificada/app/download.jsp' },
  { code:'CNES', name:'Cadastro Nacional de Estabelecimentos de Saúde', owner:'Ministério da Saúde', grain:'Estabelecimento · município', date:'atualização diária', href:'https://dadosabertos.saude.gov.br/dataset/cnes-cadastro-nacional-de-estabelecimentos-de-saude' },
  { code:'PFPB-2024', name:'Balanço do Programa Farmácia Popular', owner:'Ministério da Saúde', grain:'Município · rede credenciada', date:'dez/2024', href:'https://www.gov.br/saude/pt-br/assuntos/balancos/2024/farmacia-popular/farmacia-popular/' },
  { code:'PFPB-VAGAS', name:'Municípios e vagas do credenciamento PFPB', owner:'Ministério da Saúde', grain:'Município · cobertura observada', date:'mar/2026', href:'https://www.gov.br/saude/pt-br/composicao/sectics/farmacia-popular/credenciamento/documentacao/anexo-i-lista-de-municipios_atualizada_em_06-03-2026.xlsx/view' },
  { code:'SIDRA-6579', name:'População residente estimada', owner:'IBGE', grain:'Município · população', date:'2024', href:'https://sidra.ibge.gov.br/tabela/6579' },
  { code:'IBGE-MMD-2024', name:'Malha Municipal Digital 2024', owner:'IBGE', grain:'Município · geometria', date:'abr/2025', href:'https://www.ibge.gov.br/geociencias/organizacao-do-territorio/malhas-territoriais/15774-malhas.html' },
  { code:'PDA-MS-24/26', name:'Plano de Dados Abertos 2024–2026', owner:'Ministério da Saúde', grain:'Inventário · disponibilidade', date:'2024–2026', href:'https://bvsms.saude.gov.br/bvs/publicacoes/plano_dados_abertos_ministerio_saudeimp.pdf' },
];

const papers = [
  { pmid:'41088287', year:'2025', title:'Pharmaceutical access in Brazil: challenges and opportunities', finding:'A revisão estima que apenas 30,5% obtêm todos os medicamentos prescritos gratuitamente em canais públicos.', doi:'10.1186/s12992-025-01141-4' },
  { pmid:'41370518', year:'2025', title:'Prices paid for primary health care medicines by Brazilian municipalities', finding:'Municípios mais vulneráveis, sobretudo Norte e Nordeste, pagam mais; compras consorciadas tendem a reduzir preços.', doi:'10.11606/s1518-8787.2025059006964' },
  { pmid:'39607211', year:'2024', title:'The financing of medicines in Brazilian municipalities: whose responsibility is it?', finding:'O gasto municipal superou as contrapartidas federal e estadual; as assimetrias cresceram entre 2016 e 2020.', doi:'10.11606/s1518-8787.2024057005565' },
  { pmid:'36950032', year:'2023', title:'Inequalities in unmet need for health care services and medications in Brazil', finding:'Em 2019, 7,5% relataram necessidade não atendida de medicamentos, com desigualdade pró-pobres.', doi:'10.1016/j.lana.2022.100426' },
  { pmid:'35703669', year:'2022', title:'Prevalence rates and inequalities in access to medicines by SUS users', finding:'29,7% obtiveram todos os prescritos no SUS; 56,4% tiveram algum desembolso em 2019.', doi:'10.1590/0102-311XPT114721' },
  { pmid:'35766787', year:'2022', title:'Public policy coverage and access to medicines in Brazil', finding:'Aquisições sem desembolso foram 20,5% do consumo em valor e chegaram a 33,6% entre políticas com garantia específica.', doi:'10.11606/s1518-8787.2022056003898' },
  { pmid:'39718526', year:'2026', title:'Reducing the travel burden to access specialized medicines', finding:'No Paraná, a descentralização simulada reduziu a distância média de 59,5 km para 10,8 km, justificando medir barreiras geográficas.', doi:'10.1016/j.vhri.2024.101065' },
  { pmid:'27982382', year:'2016', title:'Access to medicines for chronic diseases: a multidimensional approach', finding:'Acessibilidade geográfica e disponibilidade são dimensões diferentes; a disponibilidade total foi 45,2% no SUS e 67,4% no PFPB.', doi:'10.1590/S1518-8787.2016050006161' },
];

const procurementDrugs = [
  { id:'losartana', catmat:'BR0268856U0042', name:'Losartana potássica', dose:'50 mg · comprimido', records:85, municipalities:26, states:11, suppliers:24, quantity:'36,84 mi', median:0.05, p10:0.0371, p90:0.10, spread:'2,70×', low:'MG · R$ 0,035', high:'PI · R$ 0,10' },
  { id:'dipirona', catmat:'BR0267203U0042', name:'Dipirona sódica', dose:'500 mg · comprimido', records:87, municipalities:35, states:7, suppliers:24, quantity:'13,17 mi', median:0.125, p10:0.11, p90:0.32, spread:'2,91×', low:'SP · R$ 0,110', high:'PI · R$ 0,32' },
  { id:'metformina', catmat:'BR0267690U0042', name:'Metformina', dose:'500 mg · comprimido', records:62, municipalities:18, states:7, suppliers:16, quantity:'5,20 mi', median:0.13, p10:0.12, p90:0.18, spread:'1,50×', low:'PR · R$ 0,12', high:'PI · R$ 0,17' },
  { id:'hidroclorotiazida', catmat:'BR0267674U0042', name:'Hidroclorotiazida', dose:'25 mg · comprimido', records:50, municipalities:19, states:9, suppliers:18, quantity:'22,69 mi', median:0.02, p10:0.0178, p90:0.06, spread:'3,37×', low:'PA · R$ 0,02', high:'PB · R$ 0,06' },
  { id:'sinvastatina', catmat:'BR0267747U0042', name:'Sinvastatina', dose:'20 mg · comprimido', records:49, municipalities:19, states:8, suppliers:17, quantity:'2,66 mi', median:0.08, p10:0.06, p90:0.17, spread:'2,83×', low:'PR · R$ 0,06', high:'PI · R$ 0,23' },
];

const dataOpportunities = [
  { priority:'P1', title:'Preço público municipal', source:'BPS + CATMAT + IBGE', value:96, readiness:92, status:'integrado', output:'Mediana, P10–P90, dispersão e concentração de fornecedores' },
  { priority:'P1', title:'Rede de acesso', source:'CNES + Farmácia Popular + IBGE', value:94, readiness:94, status:'integrado', output:'Farmácias cadastradas, taxa por 10 mil e vazios de cobertura observada' },
  { priority:'P1', title:'Produção especializada', source:'SIA/SUS + SIGTAP', value:91, readiness:78, status:'próxima', output:'Procedimentos farmacêuticos e medicamentos por competência' },
  { priority:'P2', title:'Demanda epidemiológica', source:'PNS + SINAN + SIH/SUS', value:87, readiness:76, status:'planejada', output:'Distância entre carga de doença e oferta/compra observada' },
  { priority:'P2', title:'Mercado controlado histórico', source:'SNGPC 2014–2021', value:78, readiness:66, status:'histórica', output:'Consumo municipal de controlados e antimicrobianos' },
  { priority:'P0', title:'Posição de estoque informada', source:'API BNAFAR + Hórus + CATMAT', value:100, readiness:78, status:'integrado · parcial', output:'Quantidade informada por data e estabelecimento; não equivale a estoque em tempo real' },
  { priority:'P0', title:'Dispensação efetiva', source:'BNAFAR + sistemas locais', value:99, readiness:28, status:'indisponível', output:'Saídas por paciente, regularidade e continuidade ainda sem API pública homogênea' },
];

export default function Home() {
  const [selected, setSelected] = useState('SP');
  const [metric, setMetric] = useState('vendas');
  const [view, setView] = useState<'map'|'rank'>('map');
  const [query, setQuery] = useState('');
  const [municipalityId, setMunicipalityId] = useState('3550308');
  const [accessQuery, setAccessQuery] = useState('');
  const [accessView, setAccessView] = useState<'profile'|'gaps'|'compare'>('profile');
  const [gapMetric, setGapMetric] = useState<'population'|'distance'>('population');
  const [onlySus, setOnlySus] = useState(false);
  const [procurementId, setProcurementId] = useState('losartana');
  const [stockId, setStockId] = useState('losartana');
  const [stockState, setStockState] = useState<{ key:string; data:StockData|null; error:string }>({ key:'', data:null, error:'' });
  const [compareUf, setCompareUf] = useState('RJ');
  const [compareMunicipalityId, setCompareMunicipalityId] = useState('3304557');

  const cities = useMemo(() => accessMunicipalities.filter(city => city.uf === selected), [selected]);
  const filtered = useMemo(() => medicines.filter(m => (!onlySus || m.rename) && m.name.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))), [query, onlySus]);
  const mapTitle = metric === 'vendas' ? 'Intensidade do mercado farmacêutico' : 'Sobreposição entre vendas e Rename';
  const procurement = procurementDrugs.find(d => d.id === procurementId) || procurementDrugs[0];
  const selectedMunicipality = accessMunicipalities.find(city => city.id === municipalityId) || accessMunicipalities.find(city => city.uf === selected) || accessMunicipalities[0];
  const ufAccess = accessData.ufs.find(uf => uf.uf === selected) || accessData.ufs[0];
  const accessResults = useMemo(() => {
    const normalized = accessQuery.trim().toLocaleLowerCase('pt-BR');
    if (normalized.length < 2) return [];
    return accessMunicipalities.filter(city => city.name.toLocaleLowerCase('pt-BR').includes(normalized) || city.id.includes(normalized)).slice(0, 8);
  }, [accessQuery]);
  const gapRanking = useMemo(() => accessMunicipalities.filter(city => !city.pfpbCovered && city.uf === selected).sort((a,b) => gapMetric === 'distance' ? (b.nearestPfpbKm || -1) - (a.nearestPfpbKm || -1) : (b.population || 0) - (a.population || 0)).slice(0, 10), [selected, gapMetric]);
  const comparisonMax = Math.max(selectedMunicipality.cnesRate || 0, ufAccess.cnesRate, accessData.meta.cnesRate, .01);
  const stockMedicine = procurementDrugs.find(drug => drug.id === stockId) || procurementDrugs[0];
  const stockRequestKey = `${selectedMunicipality.id.slice(0,6)}:${stockMedicine.catmat}`;
  const stock = stockState.key === stockRequestKey ? stockState.data : null;
  const stockLoading = stockState.key !== stockRequestKey;
  const stockError = stockState.key === stockRequestKey ? stockState.error : '';
  const compareCities = useMemo(() => accessMunicipalities.filter(city => city.uf === compareUf), [compareUf]);
  const compareMunicipality = accessMunicipalities.find(city => city.id === compareMunicipalityId) || compareCities[0];

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/bnafar?municipality=${selectedMunicipality.id.slice(0,6)}&catmat=${stockMedicine.catmat}`, { signal:controller.signal })
      .then(response => response.ok ? response.json() : response.json().then(body => Promise.reject(new Error(body.error || 'Falha na consulta'))))
      .then((data: StockData) => setStockState({ key:stockRequestKey, data, error:'' }))
      .catch(error => { if (error.name !== 'AbortError') setStockState({ key:stockRequestKey, data:null, error:'A fonte não respondeu agora. Tente novamente em instantes.' }); });
    return () => controller.abort();
  }, [selectedMunicipality.id, stockMedicine.catmat, stockRequestKey]);

  function chooseState(uf: string) {
    setSelected(uf);
    setMunicipalityId(accessMunicipalities.find(city => city.uf === uf)?.id || '3550308');
  }

  function chooseMunicipality(city: AccessMunicipality) {
    setSelected(city.uf);
    setMunicipalityId(city.id);
    setAccessQuery('');
    setAccessView('profile');
  }

  function exportCsv() {
    const head = 'rank;principio_ativo;faixa_embalagens;rank_faturamento;rename_2024;componente\n';
    const rows = filtered.map(m => [m.rank,m.name,m.band,m.revenueRank,m.rename?'sim':'nao',m.component].join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([head + rows], { type:'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'farmaco-brasil-ranking-2024.csv'; a.click(); URL.revokeObjectURL(url);
  }

  function exportAccessCsv() {
    const fields = ['codigo_ibge','municipio','uf','populacao_2024','farmacias_cnes_tipo_43','taxa_cnes_10mil','cobertura_pfpb_observada','distancia_pfpb_km','municipio_pfpb_mais_proximo'];
    const row = [selectedMunicipality.id,selectedMunicipality.name,selectedMunicipality.uf,selectedMunicipality.population ?? '',selectedMunicipality.cnesPharmacies,selectedMunicipality.cnesRate ?? '',selectedMunicipality.pfpbCovered?'sim':'nao_observada',selectedMunicipality.nearestPfpbKm,selectedMunicipality.nearestPfpbMunicipality];
    const url = URL.createObjectURL(new Blob([fields.join(';')+'\n'+row.join(';')], { type:'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `farmaco-brasil-acesso-${selectedMunicipality.id}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <main className="shell">
      <header className="topbar" id="top">
        <a className="brand" href="#top" aria-label="Fármaco Brasil, início"><span className="brandMark">f.</span><span>Fármaco Brasil</span></a>
        <nav aria-label="Navegação principal"><a className="active" href="#painel">Painel</a><a href="#medicamentos">Medicamentos</a><a href="#compras">Compras</a><a href="#municipios">Acesso</a><a href="#evidencias">Evidências</a><a href="#fontes">Fontes</a></nav>
        <button className="outlineButton" onClick={exportCsv}>↓ Exportar CSV</button>
      </header>

      <section className="hero">
        <div><p className="eyebrow"><span /> INTELIGÊNCIA FARMACÊUTICA TERRITORIAL</p><h1>O mercado de medicamentos,<br /><em>território por território.</em></h1><p className="intro">Cruze comercialização, presença no SUS e contexto territorial em uma base pública, rastreável e pronta para pesquisa.</p></div>
        <div className="freshness"><span>BASE MAIS RECENTE</span><strong>2024</strong><small>CMED · processada em jul/2025</small></div>
      </section>

      <section className="dashboard" id="painel">
        <aside className="filters">
          <p className="sectionLabel">RECORTE</p>
          <label>Unidade federativa<select value={selected} onChange={e => chooseState(e.target.value)}>{Object.entries(stateNames).map(([uf,name]) => <option key={uf} value={uf}>{name} · {uf}</option>)}</select></label>
          <label>Período<select defaultValue="2024"><option>2024</option><option>2023</option></select></label>
          <label>Métrica<select value={metric} onChange={e => setMetric(e.target.value)}><option value="vendas">Unidades vendidas</option><option value="sus">Vendas × Rename</option></select></label>
          <div className="filterNote"><span>i</span><p>CMED divulga vendas em nível nacional. A distribuição territorial exibida é uma camada analítica demonstrativa, não uma alegação de vendas locais.</p></div>
        </aside>

        <div className="mapPanel">
          <div className="panelHeading"><div><p className="sectionLabel">BRASIL · 2024</p><h2>{mapTitle}</h2></div><div className="segmented" role="tablist"><button className={view==='map'?'selected':''} onClick={() => setView('map')}>Mapa</button><button className={view==='rank'?'selected':''} onClick={() => setView('rank')}>Ranking</button></div></div>
          <div className="mapWrap">
            {view === 'map' ? <>
              <div className="cartogram" role="group" aria-label="Cartograma interativo das unidades federativas">{ufs.map(([uf,col,row]) => <button key={uf} onClick={() => chooseState(uf)} className={`state level${metric==='sus'?(medicines.filter(m=>m.rename).length>7?4:3):(intensity[uf]||1)} ${selected===uf?'isSelected':''}`} style={{gridColumn:col+1,gridRow:row+1}} aria-pressed={selected===uf} title={`Selecionar ${stateNames[uf]}`}>{uf}</button>)}</div>
              <div className="legend"><span>Menor</span>{[1,2,3,4,5].map(n => <i key={n} className={`level${n}`} />)}<span>Maior</span></div>
            </> : <div className="miniRanking">{medicines.slice(0,6).map(m => <div key={m.rank}><span>{String(m.rank).padStart(2,'0')}</span><strong>{m.name}</strong><i style={{width:`${98 - m.rank*7}%`}}/><small>{m.band}</small></div>)}</div>}
          </div>
          <div className="selectionCard"><div><span>UF SELECIONADA</span><strong>{stateNames[selected]} · {selected}</strong></div><div><span>STATUS TERRITORIAL</span><strong>{cities.length} municípios com camada de acesso</strong></div><button onClick={() => document.getElementById('municipios')?.scrollIntoView()}>Explorar municípios →</button></div>
        </div>

        <aside className="summary">
          <p className="sectionLabel">PANORAMA NACIONAL</p>
          <div className="bigStat"><strong>6,07 bi</strong><span>embalagens comercializadas</span><small>▲ 5,3% vs. 2023</small></div>
          <div className="metricGrid"><div><strong>R$ 160,7 bi</strong><span>faturamento</span></div><div><strong>1.905</strong><span>princípios ativos*</span></div><div><strong>14.185</strong><span>apresentações*</span></div><div><strong>226</strong><span>empresas com vendas*</span></div></div>
          <p className="sourceLine">*Valores do PDF do Anuário. A notícia de divulgação apresenta contagens distintas; divergência registrada na auditoria.</p>
        </aside>
      </section>

      <section className="contentSection" id="medicamentos">
        <div className="sectionIntro"><p className="sectionLabel">MERCADO × SUS</p><h2>O que mais vende<br /><em>também está no SUS?</em></h2><p>O cruzamento é feito no nível do princípio ativo. “Na Rename” indica presença normativa — não garante estoque em uma unidade de saúde.</p><div className="overlap"><strong>8<span>/10</span></strong><p>dos dez princípios ativos líderes em volume aparecem na Rename 2024</p></div></div>
        <div className="dataTableWrap">
          <div className="tableTools"><label className="searchBox"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar princípio ativo" /></label><label className="check"><input type="checkbox" checked={onlySus} onChange={e => setOnlySus(e.target.checked)} /> Somente Rename</label></div>
          <div className="dataTable" role="table" aria-label="Ranking de princípios ativos por volume">
            <div className="tableHead" role="row"><span>#</span><span>Princípio ativo</span><span>Faixa de embalagens</span><span>Rank R$</span><span>Rename 2024</span></div>
            {filtered.map(m => <div className="tableRow" role="row" key={m.rank}><span className="rankNo">{String(m.rank).padStart(2,'0')}</span><strong>{m.name}<small>{m.component}</small></strong><span>{m.band}</span><span>{m.revenueRank}º</span><span><i className={m.rename?'yes':'no'} />{m.rename?'Sim':'Não'}</span></div>)}
            {!filtered.length && <p className="empty">Nenhum princípio ativo encontrado.</p>}
          </div>
          <p className="tableCaption">Fonte: Anexo Estatístico CMED 2024, tabela 1.7; cruzamento nominal normalizado com Rename 2024, 2ª edição.</p>
        </div>
      </section>

      <section className="procurementSection" id="compras">
        <div className="procurementHeader">
          <div><p className="sectionLabel">COMPRAS PÚBLICAS · BPS 2024</p><h2>Quanto o setor público<br /><em>registrou pagar?</em></h2></div>
          <p>Primeira camada municipal construída com registros oficiais do Banco de Preços em Saúde. Selecione uma apresentação comparável para explorar preço, dispersão e oferta.</p>
        </div>
        <div className="coverageStrip" aria-label="Cobertura do arquivo BPS 2024">
          <div><strong>24.624</strong><span>registros válidos</span></div><div><strong>135</strong><span>municípios informantes</span></div><div><strong>18</strong><span>UFs observadas</span></div><div><strong>109</strong><span>instituições compradoras</span></div><div><strong>551</strong><span>fornecedores</span></div><div><strong>R$ 2,12 bi</strong><span>valor registrado*</span></div>
        </div>
        <div className="drugTabs" role="tablist" aria-label="Medicamentos com preços comparáveis">{procurementDrugs.map(drug => <button role="tab" aria-selected={drug.id === procurementId} className={drug.id === procurementId ? 'active' : ''} key={drug.id} onClick={() => setProcurementId(drug.id)}><strong>{drug.name}</strong><span>{drug.dose}</span></button>)}</div>
        <div className="procurementExplorer">
          <article className="priceCard">
            <div className="priceHeading"><div><span>MEDIANA UNITÁRIA</span><strong>{procurement.median.toLocaleString('pt-BR', { style:'currency', currency:'BRL', minimumFractionDigits: procurement.median < 0.1 ? 3 : 2 })}</strong><small>{procurement.name} · {procurement.dose}</small></div><div className="spreadBadge"><span>DISPERSÃO P90/P10</span><strong>{procurement.spread}</strong></div></div>
            <div className="rangePlot"><div className="rangeLabels"><span>P10 · {procurement.p10.toLocaleString('pt-BR', { style:'currency', currency:'BRL', minimumFractionDigits:3 })}</span><b>50% central dos preços observados</b><span>P90 · {procurement.p90.toLocaleString('pt-BR', { style:'currency', currency:'BRL', minimumFractionDigits:2 })}</span></div><div className="rangeRail"><i /><span style={{left:`${Math.max(8, Math.min(92, (procurement.median - procurement.p10) / (procurement.p90 - procurement.p10) * 100))}%`}} /></div></div>
            <div className="stateComparison"><div><span>MENOR MEDIANA ESTADUAL</span><strong>{procurement.low}</strong></div><div><span>MAIOR MEDIANA ESTADUAL</span><strong>{procurement.high}</strong></div></div>
          </article>
          <aside className="purchaseFacts"><p className="sectionLabel">AMOSTRA SELECIONADA</p><div><strong>{procurement.records}</strong><span>registros de compra</span></div><div><strong>{procurement.municipalities}</strong><span>municípios</span></div><div><strong>{procurement.states}</strong><span>UFs</span></div><div><strong>{procurement.suppliers}</strong><span>fornecedores</span></div><div><strong>{procurement.quantity}</strong><span>unidades registradas</span></div></aside>
        </div>
        <div className="bpsCaveat"><strong>Leia antes de comparar.</strong><p>O BPS reúne registros informados pelos compradores e não cobre todos os 5.570 municípios. As medianas são não ponderadas e comparam a mesma descrição CATMAT, dose, forma e unidade. P10 e P90 reduzem o efeito de extremos; comparações estaduais exigem ao menos três registros. *O valor de R$ 2,12 bi cobre todos os produtos do arquivo, não apenas medicamentos.</p></div>
      </section>

      <section className="municipalSection" id="municipios">
        <div className="municipalHeader"><div><p className="sectionLabel">ACESSO TERRITORIAL · 5.571 MUNICÍPIOS</p><h2>Da rede potencial<br /><em>à posição de estoque.</em></h2></div><div className="betaTag realTag">DADOS OFICIAIS · CAMADA 0.4</div></div>
        <div className="accessNational"><div><strong>{accessData.meta.cnesPharmacies.toLocaleString('pt-BR')}</strong><span>farmácias ativas tipo 43 no CNES</span></div><div><strong>{accessData.meta.cnesRate.toLocaleString('pt-BR')}</strong><span>farmácias CNES por 10 mil hab.</span></div><div><strong>{accessData.meta.pfpbCoveragePct.toLocaleString('pt-BR')}%</strong><span>municípios com cobertura PFPB observada*</span></div><div><strong>{accessData.meta.pfpbNoCoverageObserved.toLocaleString('pt-BR')}</strong><span>sem cobertura PFPB observada*</span></div></div>
        <div className="accessToolbar">
          <div className="accessSearch"><label htmlFor="municipality-search">Buscar município ou código IBGE</label><input id="municipality-search" value={accessQuery} onChange={e => setAccessQuery(e.target.value)} placeholder="Ex.: Parintins ou 1303403" />{accessResults.length > 0 && <div className="searchResults">{accessResults.map(city => <button key={city.id} onClick={() => chooseMunicipality(city)}><span>{city.name}</span><small>{city.uf} · {city.id}</small></button>)}</div>}</div>
          <label>Estado<select value={selected} onChange={e => chooseState(e.target.value)}>{Object.entries(stateNames).map(([uf,name]) => <option key={uf} value={uf}>{name} · {uf}</option>)}</select></label>
          <label>Município<select value={selectedMunicipality.id} onChange={e => chooseMunicipality(accessMunicipalities.find(city => city.id === e.target.value) || selectedMunicipality)}>{cities.map(city => <option value={city.id} key={city.id}>{city.name}</option>)}</select></label>
          <div className="segmented accessSegmented" role="tablist"><button className={accessView==='profile'?'selected':''} onClick={() => setAccessView('profile')}>Ficha</button><button className={accessView==='compare'?'selected':''} onClick={() => setAccessView('compare')}>Comparar</button><button className={accessView==='gaps'?'selected':''} onClick={() => setAccessView('gaps')}>Vazios</button></div>
        </div>

        {accessView === 'profile' ? <div className="accessProfile">
          <article className="cityProfile">
            <div className="cityTitle"><div><span>MUNICÍPIO SELECIONADO · IBGE {selectedMunicipality.id}</span><h3>{selectedMunicipality.name}</h3><p>{stateNames[selectedMunicipality.uf]} · {selectedMunicipality.uf}</p></div><span className="statusPill confidencePill">confiança moderada</span></div>
            <div className="accessMetrics"><div><span>POPULAÇÃO 2024</span><strong>{selectedMunicipality.population?.toLocaleString('pt-BR') || 'sem estimativa'}</strong><small>SIDRA/IBGE</small></div><div><span>FARMÁCIAS CNES</span><strong>{selectedMunicipality.cnesPharmacies}</strong><small>tipo 43 · ativas</small></div><div><span>TAXA POR 10 MIL</span><strong>{selectedMunicipality.cnesRate?.toLocaleString('pt-BR') ?? 'n/d'}</strong><small>denominador 2024</small></div><div><span>FARMÁCIA POPULAR</span><strong>{selectedMunicipality.pfpbCovered ? 'cobertura observada' : 'não observada'}</strong><small>referência mar/2026*</small></div></div>
            <div className="distanceGrid"><div className={selectedMunicipality.cnesPharmacies ? 'available' : 'gap'}><span>REDE CNES TIPO 43</span><strong>{selectedMunicipality.cnesPharmacies ? 'presença no município' : selectedMunicipality.nearestCnesKm == null ? 'distância indisponível' : `${selectedMunicipality.nearestCnesKm.toLocaleString('pt-BR')} km`}</strong><p>{selectedMunicipality.cnesPharmacies ? `${selectedMunicipality.cnesPharmacies} ponto(s) cadastrado(s); não confirma dispensação.` : selectedMunicipality.nearestCnesMunicipality ? `Ponto cadastrado mais próximo em ${selectedMunicipality.nearestCnesMunicipality}.` : 'Município sem centróide compatível com o denominador de 2024.'}</p></div><div className={selectedMunicipality.pfpbCovered ? 'available' : 'gap'}><span>COBERTURA FARMÁCIA POPULAR</span><strong>{selectedMunicipality.pfpbCovered ? 'presença observada' : selectedMunicipality.nearestPfpbKm == null ? 'distância indisponível' : `${selectedMunicipality.nearestPfpbKm.toLocaleString('pt-BR')} km`}</strong><p>{selectedMunicipality.pfpbCovered ? 'Município fora da lista de vazios ou com vaga preenchida.' : selectedMunicipality.nearestPfpbMunicipality ? `Cobertura observada mais próxima em ${selectedMunicipality.nearestPfpbMunicipality}.` : 'Município sem centróide compatível com a malha territorial usada.'}</p></div></div>
            <section className="stockPanel" aria-live="polite">
              <div className="stockHeading"><div><span>POSIÇÃO DE ESTOQUE INFORMADA · BNAFAR/HÓRUS</span><h4>Consulta municipal ao vivo</h4></div><label>Medicamento<select value={stockId} onChange={e => setStockId(e.target.value)}>{procurementDrugs.map(drug => <option value={drug.id} key={drug.id}>{drug.name} · {drug.dose}</option>)}</select></label></div>
              {stockLoading ? <div className="stockState">Consultando a API oficial…</div> : stockError ? <div className="stockState stockFailure">{stockError}</div> : stock && stock.records > 0 ? <>
                <div className="stockSummary"><div><span>DATA MAIS RECENTE</span><strong>{stock.latestDate ? new Date(`${stock.latestDate}T12:00:00`).toLocaleDateString('pt-BR') : 'n/d'}</strong></div><div><span>QUANTIDADE INFORMADA</span><strong>{stock.totalQuantity.toLocaleString('pt-BR')}</strong></div><div><span>ESTABELECIMENTOS</span><strong>{stock.facilities}</strong></div><div><span>REGISTROS ZERADOS</span><strong>{stock.zeroRecords}</strong></div></div>
                <p className="stockProduct"><code>{stock.catmat}</code> {stock.product}</p>
                {stock.entries.length > 0 && <div className="stockEntries">{stock.entries.map(entry => <div key={entry.cnes}><span>CNES {entry.cnes}</span><strong>{entry.facility}</strong><b>{entry.quantity.toLocaleString('pt-BR')}</b><small>{entry.source}</small></div>)}</div>}
                <p className="stockWarning">Posição declarada na data exibida; pode estar parcial, desatualizada ou ter mudado desde o envio. Quantidade não confirma disponibilidade para retirada. {stock.truncated ? 'A consulta atingiu o limite de 1.000 registros.' : ''}</p>
              </> : <div className="stockState">Sem posição observada para este CATMAT e município na consulta atual. Isso não significa necessariamente estoque zero.</div>}
              <a href="https://dadosabertos.saude.gov.br/dataset/bnafar-posicao-de-estoque/resource/8d9d25ed-01c1-4eb0-bc21-203728073a01" target="_blank" rel="noreferrer">Abrir fonte oficial ↗</a>
            </section>
            <button className="downloadAccess" onClick={exportAccessCsv}>↓ Baixar ficha em CSV</button>
          </article>
          <aside className="benchmarkCard"><p className="sectionLabel">COMPARAÇÃO TERRITORIAL</p><h3>Farmácias CNES<br />por 10 mil habitantes</h3>{[{label:selectedMunicipality.name,value:selectedMunicipality.cnesRate || 0},{label:selectedMunicipality.uf,value:ufAccess.cnesRate},{label:'Brasil',value:accessData.meta.cnesRate}].map(item => <div className="benchmark" key={item.label}><span>{item.label}<b>{item.value.toLocaleString('pt-BR')}</b></span><i><em style={{width:`${item.value/comparisonMax*100}%`}} /></i></div>)}<div className="ufCoverage"><span>COBERTURA PFPB NA UF</span><strong>{ufAccess.pfpbCoveragePct.toLocaleString('pt-BR')}%</strong><small>{ufAccess.pfpbCovered} de {ufAccess.municipalities} municípios</small></div></aside>
        </div> : accessView === 'gaps' ? <div className="gapPanel">
          <div className="gapPanelHead"><div><p className="sectionLabel">PRIORIDADE DE INVESTIGAÇÃO · {selected}</p><h3>Municípios sem cobertura PFPB observada</h3></div><label>Ordenar por<select value={gapMetric} onChange={e => setGapMetric(e.target.value as 'population'|'distance')}><option value="population">Maior população</option><option value="distance">Maior distância aproximada</option></select></label></div>
          <div className="gapTable"><div className="gapHead"><span>Município</span><span>População</span><span>Farmácias CNES</span><span>Até cobertura PFPB*</span><span /></div>{gapRanking.map(city => <button key={city.id} onClick={() => chooseMunicipality(city)}><strong>{city.name}<small>{city.id} · {city.uf}</small></strong><span>{city.population?.toLocaleString('pt-BR') || 'n/d'}</span><span>{city.cnesPharmacies}</span><span>{city.nearestPfpbKm == null ? 'distância indisponível' : `${city.nearestPfpbKm.toLocaleString('pt-BR')} km · ${city.nearestPfpbMunicipality}`}</span><b>→</b></button>)}</div>
        </div> : <div className="comparePanel">
          <div className="compareControls"><div><p className="sectionLabel">COMPARAÇÃO ENTRE MUNICÍPIOS</p><h3>{selectedMunicipality.name} × {compareMunicipality.name}</h3></div><label>Estado comparado<select value={compareUf} onChange={e => { const uf=e.target.value; setCompareUf(uf); setCompareMunicipalityId(accessMunicipalities.find(city => city.uf === uf)?.id || '3304557'); }}>{Object.entries(stateNames).map(([uf,name]) => <option key={uf} value={uf}>{name} · {uf}</option>)}</select></label><label>Município comparado<select value={compareMunicipality.id} onChange={e => setCompareMunicipalityId(e.target.value)}>{compareCities.map(city => <option value={city.id} key={city.id}>{city.name}</option>)}</select></label></div>
          <div className="compareTable"><div className="compareHead"><span>Indicador</span><strong>{selectedMunicipality.name} · {selectedMunicipality.uf}</strong><strong>{compareMunicipality.name} · {compareMunicipality.uf}</strong></div>{[
            ['População 2024', selectedMunicipality.population?.toLocaleString('pt-BR') || 'n/d', compareMunicipality.population?.toLocaleString('pt-BR') || 'n/d'],
            ['Farmácias CNES tipo 43', String(selectedMunicipality.cnesPharmacies), String(compareMunicipality.cnesPharmacies)],
            ['Farmácias por 10 mil hab.', selectedMunicipality.cnesRate?.toLocaleString('pt-BR') || 'n/d', compareMunicipality.cnesRate?.toLocaleString('pt-BR') || 'n/d'],
            ['Cobertura PFPB observada', selectedMunicipality.pfpbCovered ? 'sim' : 'não observada', compareMunicipality.pfpbCovered ? 'sim' : 'não observada'],
            ['Até rede CNES observada', selectedMunicipality.nearestCnesKm == null ? 'n/d' : `${selectedMunicipality.nearestCnesKm.toLocaleString('pt-BR')} km`, compareMunicipality.nearestCnesKm == null ? 'n/d' : `${compareMunicipality.nearestCnesKm.toLocaleString('pt-BR')} km`],
            ['Até cobertura PFPB observada', selectedMunicipality.nearestPfpbKm == null ? 'n/d' : `${selectedMunicipality.nearestPfpbKm.toLocaleString('pt-BR')} km`, compareMunicipality.nearestPfpbKm == null ? 'n/d' : `${compareMunicipality.nearestPfpbKm.toLocaleString('pt-BR')} km`],
          ].map(row => <div className="compareRow" key={row[0]}><span>{row[0]}</span><strong>{row[1]}</strong><strong>{row[2]}</strong></div>)}</div>
        </div>}
        <div className="knowledgeGrid"><article><strong>O que sabemos</strong><p>População estimada, cadastro CNES ativo tipo 43, cobertura PFPB observada, distância geodésica e, quando a API responde, posição de estoque BNAFAR datada por CATMAT e CNES.</p></article><article><strong>O que não sabemos</strong><p>Estoque em tempo real, disponibilidade na chegada, horário de funcionamento, rota/tempo rodoviário, dispensação efetiva por paciente e completude nacional dos registros BNAFAR.</p></article></div>
        <div className="accessCaveat"><strong>*Como interpretar esta camada</strong><p>“Farmácia CNES” significa estabelecimento ativo classificado como tipo 43 — não comprova estoque, vínculo com o SUS ou dispensação. A cobertura do Farmácia Popular é inferida do Anexo I do credenciamento: municípios ausentes da lista ou com vaga preenchida são classificados como cobertos. Distâncias são geodésicas em linha reta a partir de centróides municipais; não representam rota ou tempo de viagem. A API BNAFAR/Hórus expõe posições declaradas e datadas; cobertura incompleta ou ausência de registro não deve ser interpretada como ruptura.</p></div>
      </section>

      <section className="enrichmentSection" id="apis">
        <div className="enrichmentHeader"><div><p className="sectionLabel">ENRIQUECIMENTO DE DADOS</p><h2>Uma arquitetura para ir<br /><em>além do volume vendido.</em></h2></div><p>Cada fonte responde a uma pergunta diferente. O valor analítico nasce do vínculo entre produto, território, compra, oferta e população — preservando a granularidade original.</p></div>
        <div className="pipeline" aria-label="Fluxo de integração de dados">
          <article><span className="liveDot" /> <small>ABERTO · CSV/API</small><strong>BPS</strong><p>Preço unitário, quantidade, órgão comprador e município.</p><code>CATMAT + CNPJ + data</code></article>
          <b>＋</b>
          <article><span className="liveDot" /> <small>ABERTO · FHIR</small><strong>OBM / DCB</strong><p>Identidade canônica, dose, forma, concentração e associações.</p><code>VMP + CATMAT + DCB</code></article>
          <b>＋</b>
          <article><span className="liveDot" /> <small>API ABERTA · COBERTURA PARCIAL</small><strong>BNAFAR</strong><p>Posições de estoque Hórus por data, município, CNES e CATMAT.</p><code>IBGE + CNES + CATMAT</code></article>
          <b>＝</b>
          <article className="resultNode"><small>INDICADORES</small><strong>Acesso territorial</strong><p>Preço relativo, cobertura, regularidade, diversidade e equidade.</p><code>município × medicamento × mês</code></article>
        </div>
        <div className="apiMatrix">
          <article><div><span className="liveDot" /><strong>Integrado nesta versão</strong></div><h3>Banco de Preços em Saúde</h3><p>O arquivo anual de 2024 já alimenta medianas, faixas P10–P90, dispersão, compradores e fornecedores.</p><a href="https://www.gov.br/saude/pt-br/acesso-a-informacao/banco-de-precos/bases-anuais-compiladas/registro-de-compras-compilados-ano-base-2023-2024/view" target="_blank" rel="noreferrer">Arquivo oficial usado ↗</a></article>
          <article><div><span className="liveDot" /><strong>Integrado · cobertura parcial</strong></div><h3>BNAFAR / Hórus</h3><p>A ficha municipal consulta posições datadas por CATMAT e CNES. Ausência de registro não é classificada como estoque zero.</p><a href="https://dadosabertos.saude.gov.br/dataset/bnafar-posicao-de-estoque/resource/8d9d25ed-01c1-4eb0-bc21-203728073a01" target="_blank" rel="noreferrer">API oficial usada ↗</a></article>
          <article><div><span className="liveDot" /><strong>Pronto para integrar</strong></div><h3>SIGTAP + SIA/SUS</h3><p>Medicamentos do componente especializado e produção ambulatorial podem ser tabulados por competência e território.</p><a href="https://sigtap.datasus.gov.br/tabela-unificada/app/download.jsp" target="_blank" rel="noreferrer">Arquivos mensais ↗</a></article>
          <article><div><span className="partialDot" /><strong>Série interrompida</strong></div><h3>SNGPC</h3><p>Venda de controlados e antimicrobianos tem recorte municipal histórico, mas a transmissão foi suspensa a partir de 2022.</p><a href="https://dados.gov.br/dados/conjuntos-dados/venda-de-medicamentos-controlados-e-antimicrobianos---medicamentos-manipulados" target="_blank" rel="noreferrer">Metadados e cobertura ↗</a></article>
        </div>
        <div className="opportunityHeader"><div><p className="sectionLabel">MAPA DE OPORTUNIDADES</p><h3>Mais dado só vale quando<br />responde a uma decisão.</h3></div><p>Priorização por valor analítico e prontidão técnica. “Prontidão” considera abertura, granularidade, estabilidade e possibilidade de vínculo pelo código IBGE ou CATMAT.</p></div>
        <div className="opportunityGrid">{dataOpportunities.map(item => <article key={item.title} className={`opportunityCard ${item.status.startsWith('integrado') ? 'integrated' : ''}`}><div className="opportunityTop"><span>{item.priority}</span><small>{item.status}</small></div><h4>{item.title}</h4><code>{item.source}</code><p>{item.output}</p><div className="score"><span>Valor <b>{item.value}</b></span><i><em style={{width:`${item.value}%`}} /></i></div><div className="score readinessScore"><span>Prontidão <b>{item.readiness}</b></span><i><em style={{width:`${item.readiness}%`}} /></i></div></article>)}</div>
      </section>

      <section className="evidenceSection" id="evidencias">
        <div className="evidenceHeader"><div><p className="sectionLabel">CADEIA DE EVIDÊNCIAS · PUBMED</p><h2>O mapa precisa explicar<br /><em>desigualdade, não só cor.</em></h2></div><p>Busca inicial validada pela API pública NCBI E-utilities. Os estudos orientam os indicadores prioritários e ficam vinculados por PMID e DOI.</p></div>
        <div className="evidenceStats"><div><strong>29,7%</strong><span>obtiveram todos os prescritos no SUS em 2019</span></div><div><strong>56,4%</strong><span>tiveram algum desembolso com medicamentos</span></div><div><strong>7,5%</strong><span>relataram necessidade não atendida</span></div><div><strong>20,5%</strong><span>do consumo em valor foi sem desembolso</span></div></div>
        <div className="paperGrid">{papers.map((paper,i) => <a key={paper.pmid} href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`} target="_blank" rel="noreferrer"><div className="paperMeta"><span>{String(i+1).padStart(2,'0')}</span><code>PMID {paper.pmid}</code><small>{paper.year}</small></div><h3>{paper.title}</h3><p>{paper.finding}</p><div className="doi">DOI {paper.doi}<b>↗</b></div></a>)}</div>
        <div className="researchAgenda"><strong>Indicadores que esta literatura prioriza</strong><span>preço municipal relativo</span><span>desembolso direto</span><span>cobertura pública</span><span>vulnerabilidade social</span><span>compras consorciadas</span><span>regularidade de estoque</span></div>
      </section>

      <section className="methodSection" id="metodologia">
        <div><p className="sectionLabel">MÉTODO REPRODUTÍVEL</p><h2>Quatro camadas,<br />uma trilha de evidências.</h2></div>
        <div className="methodSteps"><article><span>01</span><h3>Ingestão</h3><p>Arquivos oficiais preservados com URL, data de acesso, versão e checksum SHA-256; a consulta viva registra fonte e momento da posição.</p><code>source_id · retrieved_at · sha256</code></article><article><span>02</span><h3>Normalização</h3><p>Medicamento, estabelecimento e município recebem chaves canônicas sem apagar a fonte.</p><code>DCB · CATMAT · CNES · IBGE</code></article><article><span>03</span><h3>Cruzamento</h3><p>CNES tipo 43, PFPB, população e posições BNAFAR são unidos por códigos oficiais; taxas preservam o ano do denominador.</p><code>ibge_code · cnes · catmat · reference_date</code></article><article><span>04</span><h3>Publicação</h3><p>Cada indicador expõe fonte, unidade, cobertura, transformação, confiança e limitações.</p><code>metric_version · caveat_id</code></article></div>
        <div className="academicNote"><span>NOTA DE INTERPRETAÇÃO</span><p>“Mais vendido” significa maior faixa de embalagens informada à CMED — não número de pacientes, prescrições ou doses. Os volumes públicos são apresentados em faixas para princípios ativos. Comparações territoriais só serão publicadas após validação de cobertura e denominador populacional.</p></div>
      </section>

      <section className="sourcesSection" id="fontes">
        <div className="sourcesHeading"><div><p className="sectionLabel">CATÁLOGO DE FONTES</p><h2>Auditável desde a origem.</h2></div><p>Versão do painel <strong>0.4.0 · protótipo acadêmico</strong><br />Atualizado em 24 ago 2026</p></div>
        <div className="sourceTable"><div className="sourceHead"><span>ID</span><span>Fonte</span><span>Responsável</span><span>Granularidade</span><span>Referência</span><span /></div>{sources.map(s => <a href={s.href} target="_blank" rel="noreferrer" key={s.code}><code>{s.code}</code><strong>{s.name}</strong><span>{s.owner}</span><span>{s.grain}</span><span>{s.date}</span><b>↗</b></a>)}</div>
        <div className="auditAlert"><span>!</span><p><strong>Divergência documentada:</strong> a notícia da Anvisa informa 232 empresas, 14.586 apresentações e 1.944 princípios ativos; o PDF do Anuário informa 226, 14.185 e 1.905. O protótipo usa o PDF e mantém a divergência visível para revisão.</p></div>
      </section>

      <footer><a className="brand" href="#top"><span className="brandMark">f.</span><span>Fármaco Brasil</span></a><p>Dados públicos para decisões melhores em saúde.</p><a href="#top">Voltar ao topo ↑</a></footer>
    </main>
  );
}
