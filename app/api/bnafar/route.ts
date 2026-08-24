const ENDPOINT = 'https://apidadosabertos.saude.gov.br/daf/estoque-medicamentos-bnafar-horus';

const ALLOWED_CATMATS = new Set([
  'BR0268856U0042',
  'BR0267203U0042',
  'BR0267690U0042',
  'BR0267674U0042',
  'BR0267747U0042',
]);

type UpstreamRow = {
  codigo_cnes?: number|string;
  data_posicao_estoque?: string;
  codigo_catmat?: string;
  quantidade_estoque?: number|string;
  sigla_sistema_origem?: string;
  descricao_produto?: string;
  municipio?: string;
  nome_fantasia?: string;
  razao_social?: string;
};

export async function GET(request: Request) {
  const input = new URL(request.url).searchParams;
  const municipality = input.get('municipality') || '';
  const catmat = input.get('catmat') || '';

  if (!/^\d{6}$/.test(municipality) || !ALLOWED_CATMATS.has(catmat)) {
    return Response.json({ error:'Parâmetros inválidos.' }, { status:400 });
  }

  const upstream = new URL(ENDPOINT);
  upstream.searchParams.set('codigo_municipio', municipality);
  upstream.searchParams.set('codigo_catmat', catmat);
  upstream.searchParams.set('limit', '1000');
  upstream.searchParams.set('offset', '0');

  try {
    const response = await fetch(upstream, { headers:{ Accept:'application/json' } });
    if (!response.ok) throw new Error(`BNAFAR ${response.status}`);
    const body = await response.json() as { parametros?: UpstreamRow[] };
    const rows = Array.isArray(body.parametros) ? body.parametros : [];
    const latestDate = rows.reduce<string|null>((latest, row) => {
      const date = row.data_posicao_estoque || null;
      return date && (!latest || date > latest) ? date : latest;
    }, null);
    const currentRows = latestDate ? rows.filter(row => row.data_posicao_estoque === latestDate) : [];
    const facilities = new Map<string, { cnes:string; facility:string; quantity:number; source:string }>();

    for (const row of currentRows) {
      const cnes = String(row.codigo_cnes ?? 'não informado');
      const quantity = Number(row.quantidade_estoque) || 0;
      const existing = facilities.get(cnes);
      if (existing) existing.quantity += quantity;
      else facilities.set(cnes, {
        cnes,
        facility:row.nome_fantasia || row.razao_social || 'Estabelecimento sem nome informado',
        quantity,
        source:row.sigla_sistema_origem || 'não informado',
      });
    }

    const entries = [...facilities.values()].sort((a,b) => b.quantity - a.quantity).slice(0, 8);
    return Response.json({
      municipality:rows[0]?.municipio || municipality,
      product:rows[0]?.descricao_produto || 'Produto sem descrição na resposta',
      catmat,
      latestDate,
      records:currentRows.length,
      facilities:facilities.size,
      totalQuantity:currentRows.reduce((sum, row) => sum + (Number(row.quantidade_estoque) || 0), 0),
      zeroRecords:currentRows.filter(row => (Number(row.quantidade_estoque) || 0) === 0).length,
      truncated:rows.length === 1000,
      entries,
      caveat:'Posição declarada ao Hórus/BNAFAR; não garante disponibilidade em tempo real nem cobertura completa.',
    }, { headers:{ 'Cache-Control':'public, max-age=300, s-maxage=900' } });
  } catch {
    return Response.json({ error:'A API BNAFAR não respondeu.' }, { status:502 });
  }
}
