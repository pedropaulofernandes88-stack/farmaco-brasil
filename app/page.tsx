'use client';

import { useMemo, useState } from 'react';

type Medicine = { rank: number; name: string; band: string; revenueRank: number; rename: boolean; component: string };

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

const municipalities: Record<string, string[]> = {
  SP:['São Paulo','Campinas','Guarulhos','Ribeirão Preto','Sorocaba','São José dos Campos'],
  RJ:['Rio de Janeiro','Niterói','Duque de Caxias','Nova Iguaçu','Petrópolis'],
  MG:['Belo Horizonte','Uberlândia','Contagem','Juiz de Fora','Betim'],
  BA:['Salvador','Feira de Santana','Vitória da Conquista','Camaçari','Itabuna'],
  RS:['Porto Alegre','Caxias do Sul','Canoas','Pelotas','Santa Maria'],
};

const sources = [
  { code:'CMED-2024', name:'Anuário Estatístico do Mercado Farmacêutico 2024', owner:'Anvisa / SCMED', grain:'Brasil · princípio ativo', date:'jul/2025', href:'https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/medicamentos/cmed/' },
  { code:'RENAME-2024.2', name:'Relação Nacional de Medicamentos Essenciais', owner:'Ministério da Saúde', grain:'Brasil · apresentação', date:'2ª ed. 2025', href:'https://www.gov.br/saude/pt-br/composicao/sectics/rename' },
  { code:'BNAFAR', name:'Base Nacional da Assistência Farmacêutica', owner:'Ministério da Saúde', grain:'Município · movimento', date:'contínua', href:'https://www.gov.br/saude/pt-br/composicao/sectics/daf/bnafar' },
  { code:'BPS-2024', name:'Registros de compras compilados 2023–2024', owner:'Ministério da Saúde', grain:'Compra · município · CATMAT', date:'ano-base 2024', href:'https://www.gov.br/saude/pt-br/acesso-a-informacao/banco-de-precos/bases-anuais-compiladas/registro-de-compras-compilados-ano-base-2023-2024/view' },
  { code:'OBM-FHIR', name:'Ontologia Brasileira de Medicamentos', owner:'Ministério da Saúde', grain:'Medicamento · terminologia', date:'versionada', href:'https://portal-obm.saude.gov.br/' },
  { code:'DCB-2026', name:'Denominações Comuns Brasileiras', owner:'Anvisa', grain:'Ingrediente · nomenclatura', date:'jul/2026', href:'https://www.gov.br/anvisa/pt-br/assuntos/farmacopeia/dcb' },
  { code:'SIGTAP', name:'Tabela de procedimentos e medicamentos SUS', owner:'DataSUS', grain:'Competência · procedimento', date:'mensal', href:'https://sigtap.datasus.gov.br/tabela-unificada/app/download.jsp' },
  { code:'CNES', name:'Cadastro Nacional de Estabelecimentos de Saúde', owner:'Ministério da Saúde', grain:'Estabelecimento · município', date:'atualização diária', href:'https://dadosabertos.saude.gov.br/dataset/cnes-cadastro-nacional-de-estabelecimentos-de-saude' },
  { code:'PFPB-2024', name:'Balanço do Programa Farmácia Popular', owner:'Ministério da Saúde', grain:'Município · rede credenciada', date:'dez/2024', href:'https://www.gov.br/saude/pt-br/assuntos/balancos/2024/farmacia-popular/farmacia-popular/' },
  { code:'IBGE-POP', name:'Estimativas da população', owner:'IBGE', grain:'Município · população', date:'anual', href:'https://www.ibge.gov.br/estatisticas/sociais/populacao/9103-estimativas-de-populacao.html' },
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
];

const procurementDrugs = [
  { id:'losartana', name:'Losartana potássica', dose:'50 mg · comprimido', records:85, municipalities:26, states:11, suppliers:24, quantity:'36,84 mi', median:0.05, p10:0.0371, p90:0.10, spread:'2,70×', low:'MG · R$ 0,035', high:'PI · R$ 0,10' },
  { id:'dipirona', name:'Dipirona sódica', dose:'500 mg · comprimido', records:87, municipalities:35, states:7, suppliers:24, quantity:'13,17 mi', median:0.125, p10:0.11, p90:0.32, spread:'2,91×', low:'SP · R$ 0,110', high:'PI · R$ 0,32' },
  { id:'metformina', name:'Metformina', dose:'500 mg · comprimido', records:62, municipalities:18, states:7, suppliers:16, quantity:'5,20 mi', median:0.13, p10:0.12, p90:0.18, spread:'1,50×', low:'PR · R$ 0,12', high:'PI · R$ 0,17' },
  { id:'hidroclorotiazida', name:'Hidroclorotiazida', dose:'25 mg · comprimido', records:50, municipalities:19, states:9, suppliers:18, quantity:'22,69 mi', median:0.02, p10:0.0178, p90:0.06, spread:'3,37×', low:'PA · R$ 0,02', high:'PB · R$ 0,06' },
  { id:'sinvastatina', name:'Sinvastatina', dose:'20 mg · comprimido', records:49, municipalities:19, states:8, suppliers:17, quantity:'2,66 mi', median:0.08, p10:0.06, p90:0.17, spread:'2,83×', low:'PR · R$ 0,06', high:'PI · R$ 0,23' },
];

const dataOpportunities = [
  { priority:'P1', title:'Preço público municipal', source:'BPS + CATMAT + IBGE', value:96, readiness:92, status:'integrado', output:'Mediana, P10–P90, dispersão e concentração de fornecedores' },
  { priority:'P1', title:'Rede de acesso', source:'CNES + Farmácia Popular', value:94, readiness:84, status:'próxima', output:'Farmácias e unidades dispensadoras por 10 mil habitantes' },
  { priority:'P1', title:'Produção especializada', source:'SIA/SUS + SIGTAP', value:91, readiness:78, status:'próxima', output:'Procedimentos farmacêuticos e medicamentos por competência' },
  { priority:'P2', title:'Demanda epidemiológica', source:'PNS + SINAN + SIH/SUS', value:87, readiness:76, status:'planejada', output:'Distância entre carga de doença e oferta/compra observada' },
  { priority:'P2', title:'Mercado controlado histórico', source:'SNGPC 2014–2021', value:78, readiness:66, status:'histórica', output:'Consumo municipal de controlados e antimicrobianos' },
  { priority:'P0', title:'Disponibilidade real', source:'BNAFAR + Hórus + DBPOPFARMA', value:100, readiness:28, status:'depende de abertura', output:'Estoque, ruptura, dispensação e continuidade do tratamento' },
];

export default function Home() {
  const [selected, setSelected] = useState('SP');
  const [metric, setMetric] = useState('vendas');
  const [view, setView] = useState<'map'|'rank'>('map');
  const [query, setQuery] = useState('');
  const [municipality, setMunicipality] = useState('São Paulo');
  const [onlySus, setOnlySus] = useState(false);
  const [procurementId, setProcurementId] = useState('losartana');

  const cities = municipalities[selected] || [stateNames[selected]];
  const filtered = useMemo(() => medicines.filter(m => (!onlySus || m.rename) && m.name.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))), [query, onlySus]);
  const mapTitle = metric === 'vendas' ? 'Intensidade do mercado farmacêutico' : 'Sobreposição entre vendas e Rename';
  const procurement = procurementDrugs.find(d => d.id === procurementId) || procurementDrugs[0];

  function chooseState(uf: string) {
    setSelected(uf);
    setMunicipality((municipalities[uf] || [stateNames[uf]])[0]);
  }

  function exportCsv() {
    const head = 'rank;principio_ativo;faixa_embalagens;rank_faturamento;rename_2024;componente\n';
    const rows = filtered.map(m => [m.rank,m.name,m.band,m.revenueRank,m.rename?'sim':'nao',m.component].join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([head + rows], { type:'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'farmaco-brasil-ranking-2024.csv'; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <main className="shell">
      <header className="topbar" id="top">
        <a className="brand" href="#top" aria-label="Fármaco Brasil, início"><span className="brandMark">f.</span><span>Fármaco Brasil</span></a>
        <nav aria-label="Navegação principal"><a className="active" href="#painel">Painel</a><a href="#medicamentos">Medicamentos</a><a href="#compras">Compras</a><a href="#evidencias">Evidências</a><a href="#metodologia">Método</a><a href="#fontes">Fontes</a></nav>
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
          <div className="selectionCard"><div><span>UF SELECIONADA</span><strong>{stateNames[selected]} · {selected}</strong></div><div><span>STATUS TERRITORIAL</span><strong>{municipalities[selected]?'Municípios demonstrativos':'Aguardando integração municipal'}</strong></div><button onClick={() => document.getElementById('municipios')?.scrollIntoView()}>Explorar municípios →</button></div>
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
        <div className="municipalHeader"><div><p className="sectionLabel">CONSULTA MUNICIPAL</p><h2>Do país ao município,<br /><em>sem esconder as lacunas.</em></h2></div><div className="betaTag">CAMADA BETA · DADOS DEMONSTRATIVOS</div></div>
        <div className="municipalGrid">
          <aside><label>Estado<select value={selected} onChange={e => chooseState(e.target.value)}>{Object.entries(stateNames).map(([uf,name]) => <option key={uf} value={uf}>{name} · {uf}</option>)}</select></label><label>Município<select value={municipality} onChange={e => setMunicipality(e.target.value)}>{cities.map(city => <option key={city}>{city}</option>)}</select></label><div className="geoCode"><span>CÓDIGO IBGE</span><strong>{selected === 'SP' && municipality === 'São Paulo' ? '3550308' : 'a integrar'}</strong></div></aside>
          <article className="municipalCard"><div className="cityTitle"><div><span>MUNICÍPIO SELECIONADO</span><h3>{municipality}</h3><p>{stateNames[selected]} · {selected}</p></div><span className="statusPill">estrutura pronta</span></div><div className="readiness"><div className="ready"><span>01</span><strong>Geografia</strong><small>Malha IBGE pronta para vínculo</small></div><div className="ready"><span>02</span><strong>Catálogo SUS</strong><small>Rename nacional carregada</small></div><div className="pending"><span>03</span><strong>Dispensação local</strong><small>Requer acesso público à BNAFAR/REMUME</small></div></div><div className="municipalWarning"><strong>Por que não mostramos um número inventado?</strong><p>A BNAFAR consolida estoque e dispensação municipais, mas o portal público descrito pelo Ministério ainda não oferece aqui uma extração aberta e homogênea. O painel separa “previsto na Rename” de “efetivamente disponível”.</p></div></article>
        </div>
      </section>

      <section className="enrichmentSection" id="apis">
        <div className="enrichmentHeader"><div><p className="sectionLabel">ENRIQUECIMENTO DE DADOS</p><h2>Uma arquitetura para ir<br /><em>além do volume vendido.</em></h2></div><p>Cada fonte responde a uma pergunta diferente. O valor analítico nasce do vínculo entre produto, território, compra, oferta e população — preservando a granularidade original.</p></div>
        <div className="pipeline" aria-label="Fluxo de integração de dados">
          <article><span className="liveDot" /> <small>ABERTO · CSV/API</small><strong>BPS</strong><p>Preço unitário, quantidade, órgão comprador e município.</p><code>CATMAT + CNPJ + data</code></article>
          <b>＋</b>
          <article><span className="liveDot" /> <small>ABERTO · FHIR</small><strong>OBM / DCB</strong><p>Identidade canônica, dose, forma, concentração e associações.</p><code>VMP + CATMAT + DCB</code></article>
          <b>＋</b>
          <article><span className="partialDot" /> <small>ACESSO PARCIAL</small><strong>BNAFAR</strong><p>Estoque, movimentação e dispensação nos entes do SUS.</p><code>IBGE + estabelecimento</code></article>
          <b>＝</b>
          <article className="resultNode"><small>INDICADORES</small><strong>Acesso territorial</strong><p>Preço relativo, cobertura, regularidade, diversidade e equidade.</p><code>município × medicamento × mês</code></article>
        </div>
        <div className="apiMatrix">
          <article><div><span className="liveDot" /><strong>Integrado nesta versão</strong></div><h3>Banco de Preços em Saúde</h3><p>O arquivo anual de 2024 já alimenta medianas, faixas P10–P90, dispersão, compradores e fornecedores.</p><a href="https://www.gov.br/saude/pt-br/acesso-a-informacao/banco-de-precos/bases-anuais-compiladas/registro-de-compras-compilados-ano-base-2023-2024/view" target="_blank" rel="noreferrer">Arquivo oficial usado ↗</a></article>
          <article><div><span className="liveDot" /><strong>Pronto para integrar</strong></div><h3>OBM em FHIR R4</h3><p>Terminologia pública e versionada para reduzir falsos pares entre sal, dose, forma farmacêutica e apresentação.</p><a href="https://terminologia.saude.gov.br/fhir/NamingSystem-BRObmCATMAT.html" target="_blank" rel="noreferrer">NamingSystem oficial ↗</a></article>
          <article><div><span className="liveDot" /><strong>Pronto para integrar</strong></div><h3>SIGTAP + SIA/SUS</h3><p>Medicamentos do componente especializado e produção ambulatorial podem ser tabulados por competência e território.</p><a href="https://sigtap.datasus.gov.br/tabela-unificada/app/download.jsp" target="_blank" rel="noreferrer">Arquivos mensais ↗</a></article>
          <article><div><span className="partialDot" /><strong>Série interrompida</strong></div><h3>SNGPC</h3><p>Venda de controlados e antimicrobianos tem recorte municipal histórico, mas a transmissão foi suspensa a partir de 2022.</p><a href="https://dados.gov.br/dados/conjuntos-dados/venda-de-medicamentos-controlados-e-antimicrobianos---medicamentos-manipulados" target="_blank" rel="noreferrer">Metadados e cobertura ↗</a></article>
        </div>
        <div className="opportunityHeader"><div><p className="sectionLabel">MAPA DE OPORTUNIDADES</p><h3>Mais dado só vale quando<br />responde a uma decisão.</h3></div><p>Priorização por valor analítico e prontidão técnica. “Prontidão” considera abertura, granularidade, estabilidade e possibilidade de vínculo pelo código IBGE ou CATMAT.</p></div>
        <div className="opportunityGrid">{dataOpportunities.map(item => <article key={item.title} className={`opportunityCard ${item.status === 'integrado' ? 'integrated' : ''}`}><div className="opportunityTop"><span>{item.priority}</span><small>{item.status}</small></div><h4>{item.title}</h4><code>{item.source}</code><p>{item.output}</p><div className="score"><span>Valor <b>{item.value}</b></span><i><em style={{width:`${item.value}%`}} /></i></div><div className="score readinessScore"><span>Prontidão <b>{item.readiness}</b></span><i><em style={{width:`${item.readiness}%`}} /></i></div></article>)}</div>
      </section>

      <section className="evidenceSection" id="evidencias">
        <div className="evidenceHeader"><div><p className="sectionLabel">CADEIA DE EVIDÊNCIAS · PUBMED</p><h2>O mapa precisa explicar<br /><em>desigualdade, não só cor.</em></h2></div><p>Busca inicial validada pela API pública NCBI E-utilities. Os estudos orientam os indicadores prioritários e ficam vinculados por PMID e DOI.</p></div>
        <div className="evidenceStats"><div><strong>29,7%</strong><span>obtiveram todos os prescritos no SUS em 2019</span></div><div><strong>56,4%</strong><span>tiveram algum desembolso com medicamentos</span></div><div><strong>7,5%</strong><span>relataram necessidade não atendida</span></div><div><strong>20,5%</strong><span>do consumo em valor foi sem desembolso</span></div></div>
        <div className="paperGrid">{papers.map((paper,i) => <a key={paper.pmid} href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`} target="_blank" rel="noreferrer"><div className="paperMeta"><span>{String(i+1).padStart(2,'0')}</span><code>PMID {paper.pmid}</code><small>{paper.year}</small></div><h3>{paper.title}</h3><p>{paper.finding}</p><div className="doi">DOI {paper.doi}<b>↗</b></div></a>)}</div>
        <div className="researchAgenda"><strong>Indicadores que esta literatura prioriza</strong><span>preço municipal relativo</span><span>desembolso direto</span><span>cobertura pública</span><span>vulnerabilidade social</span><span>compras consorciadas</span><span>regularidade de estoque</span></div>
      </section>

      <section className="methodSection" id="metodologia">
        <div><p className="sectionLabel">MÉTODO REPRODUTÍVEL</p><h2>Quatro camadas,<br />uma trilha de evidências.</h2></div>
        <div className="methodSteps"><article><span>01</span><h3>Ingestão</h3><p>Arquivos oficiais preservados com URL, data de acesso, versão e checksum.</p><code>source_id · retrieved_at · sha256</code></article><article><span>02</span><h3>Normalização</h3><p>Princípios ativos padronizados sem confundir sal, associação, dose ou apresentação.</p><code>DCB → CATMAT → ATC</code></article><article><span>03</span><h3>Cruzamento</h3><p>CMED e Rename unidos por chave canônica; município ligado pelo geocódigo IBGE.</p><code>ingredient_key · ibge_code</code></article><article><span>04</span><h3>Publicação</h3><p>Cada indicador expõe fonte, unidade, cobertura, transformação e limitações.</p><code>metric_version · caveat_id</code></article></div>
        <div className="academicNote"><span>NOTA DE INTERPRETAÇÃO</span><p>“Mais vendido” significa maior faixa de embalagens informada à CMED — não número de pacientes, prescrições ou doses. Os volumes públicos são apresentados em faixas para princípios ativos. Comparações territoriais só serão publicadas após validação de cobertura e denominador populacional.</p></div>
      </section>

      <section className="sourcesSection" id="fontes">
        <div className="sourcesHeading"><div><p className="sectionLabel">CATÁLOGO DE FONTES</p><h2>Auditável desde a origem.</h2></div><p>Versão do painel <strong>0.2.0 · protótipo acadêmico</strong><br />Atualizado em 24 ago 2026</p></div>
        <div className="sourceTable"><div className="sourceHead"><span>ID</span><span>Fonte</span><span>Responsável</span><span>Granularidade</span><span>Referência</span><span /></div>{sources.map(s => <a href={s.href} target="_blank" rel="noreferrer" key={s.code}><code>{s.code}</code><strong>{s.name}</strong><span>{s.owner}</span><span>{s.grain}</span><span>{s.date}</span><b>↗</b></a>)}</div>
        <div className="auditAlert"><span>!</span><p><strong>Divergência documentada:</strong> a notícia da Anvisa informa 232 empresas, 14.586 apresentações e 1.944 princípios ativos; o PDF do Anuário informa 226, 14.185 e 1.905. O protótipo usa o PDF e mantém a divergência visível para revisão.</p></div>
      </section>

      <footer><a className="brand" href="#top"><span className="brandMark">f.</span><span>Fármaco Brasil</span></a><p>Dados públicos para decisões melhores em saúde.</p><a href="#top">Voltar ao topo ↑</a></footer>
    </main>
  );
}
