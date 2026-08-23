import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mmheboqkeadipgtmyory.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_x4Y6rOnP0MXViQbLawJ6lA_LMm3U3hc'

export const supabaseAdminClient = createClient(SUPABASE_URL, SUPABASE_KEY)

export function criarAdminApi(supabase = supabaseAdminClient) {
  return {
    async enviarMagicLink(email, redirectTo) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, emailRedirectTo: redirectTo },
      })
      if (error) throw error
    },

    async obterSessaoAdmin() {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      const session = data.session
      if (!session) return { session: null, isAdmin: false }
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin')
      if (adminError) throw adminError
      return { session, isAdmin: Boolean(isAdmin) }
    },

    async listar(tabela, { candidateId } = {}) {
      let query = supabase.from(tabela).select('*').order('created_at', { ascending: false })
      if (candidateId) query = query.eq('candidate_id', candidateId)
      const { data, error } = await query
      if (error) throw error
      return data || []
    },

    async listarCandidatos() {
      const { data, error } = await supabase.from('candidates').select('*').order('ballot_name')
      if (error) throw error
      return data || []
    },

    async salvar(tabela, payload) {
      const body = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== ''))
      const query = body.id
        ? supabase.from(tabela).update(body).eq('id', body.id).select().single()
        : supabase.from(tabela).insert(body).select().single()
      const { data, error } = await query
      if (error) throw error
      return data
    },

    async remover(tabela, id) {
      const { error } = await supabase.from(tabela).delete().eq('id', id)
      if (error) throw error
    },

    async sair() {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
  }
}

export const adminApi = criarAdminApi()
