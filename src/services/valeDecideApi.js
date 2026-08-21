const SUPABASE_URL = 'https://mmheboqkeadipgtmyory.supabase.co'
const SUPABASE_KEY = 'sb_publishable_x4Y6rOnP0MXViQbLawJ6lA_LMm3U3hc'

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
}

export async function carregarCandidatos() {
  const campos = [
    'id',
    'tse_id',
    'ballot_name',
    'full_name',
    'office',
    'ballot_number',
    'party',
    'federation',
    'home_city',
    'home_state',
    'occupation',
    'current_position',
    'biography',
    'photo_url',
    'registration_status',
    'last_verified_at',
  ].join(',')

  const url = `${SUPABASE_URL}/rest/v1/candidates?select=${campos}&published=eq.true&verification_status=eq.verificado&order=home_city.asc,office.asc,ballot_name.asc`
  const response = await fetch(url, { headers })

  if (!response.ok) {
    throw new Error(`Falha ao carregar candidatos (${response.status})`)
  }

  return response.json()
}

export function formatarCargo(cargo = '') {
  return cargo
    .split('-')
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ')
}
