const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mmheboqkeadipgtmyory.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_x4Y6rOnP0MXViQbLawJ6lA_LMm3U3hc'

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
}

async function obter(caminho) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${caminho}`, { headers })
  if (!response.ok) throw new Error(`Falha ao consultar a base eleitoral (${response.status})`)
  return response.json()
}

export async function carregarCandidatos() {
  const campos = [
    'id','tse_id','ballot_name','full_name','office','ballot_number','party','federation','coalition',
    'home_city','home_state','occupation','current_position','biography','photo_url','website_url',
    'instagram_url','facebook_url','youtube_url','tiktok_url','public_whatsapp','registration_status',
    'editorial_priority','regional_relevance','last_verified_at',
  ].join(',')

  return obter(`candidates?select=${campos}&published=eq.true&verification_status=eq.verificado&order=regional_relevance.desc,home_city.asc,office.asc,ballot_name.asc`)
}

export async function carregarFichaCandidato(candidateId) {
  const [historico, impactos, municipios] = await Promise.all([
    obter(`electoral_history?select=id,election_year,office,municipality,votes,result,source_url&candidate_id=eq.${candidateId}&order=election_year.desc`),
    obter(`municipal_impact?select=id,municipality_id,year,category,description,announced_amount,committed_amount,paid_amount,executed_amount,status,beneficiary,source_url,source_name,verified_at&candidate_id=eq.${candidateId}&verified=eq.true&order=year.desc`),
    obter('municipalities?select=id,name,state,slug,region,priority&order=priority.asc,name.asc'),
  ])

  const mapaMunicipios = Object.fromEntries(municipios.map((item) => [item.id, item]))
  return {
    historico,
    impactos: impactos.map((item) => ({ ...item, municipio: mapaMunicipios[item.municipality_id]?.name || 'Município' })),
  }
}

export function formatarCargo(cargo = '') {
  return cargo.split('-').map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1)).join(' ')
}

export function formatarDinheiro(valor) {
  const numero = Number(valor || 0)
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatarData(valor) {
  if (!valor) return 'em atualização'
  return new Date(valor).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function somarImpactos(impactos = []) {
  return impactos.reduce((total, item) => ({
    anunciado: total.anunciado + Number(item.announced_amount || 0),
    empenhado: total.empenhado + Number(item.committed_amount || 0),
    pago: total.pago + Number(item.paid_amount || 0),
    executado: total.executado + Number(item.executed_amount || 0),
  }), { anunciado: 0, empenhado: 0, pago: 0, executado: 0 })
}
