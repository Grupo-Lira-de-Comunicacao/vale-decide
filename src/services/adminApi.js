import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mmheboqkeadipgtmyory.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_x4Y6rOnP0MXViQbLawJ6lA_LMm3U3hc'

export const supabaseAdminClient = createClient(SUPABASE_URL, SUPABASE_KEY)

const pautaFields = `
  id, contact_id, origin_channel, source_type, status, category, subcategory,
  title, summary, description, location_text, city, state, priority,
  urgency_score, relevance_score, credibility_score, regional_impact_score,
  needs_human_review, assigned_to, ai_title, ai_summary, ai_category,
  ai_subcategory, ai_rationale, ai_model, ai_processed_at, published_url,
  published_at, created_at, updated_at,
  contact:contacts(id,name,phone,email,city,state,last_interaction_at)
`

export function criarAdminApi(supabase = supabaseAdminClient) {
  return {
    async enviarMagicLink(email, redirectTo) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, emailRedirectTo: redirectTo },
      })
      if (error) throw error
    },

    async obterSessaoEditorial() {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      const session = data.session
      if (!session) return { session: null, allowed: false, profile: null }

      const { data: allowed, error: permissionError } = await supabase.rpc('is_editorial_user')
      if (permissionError) throw permissionError
      if (!allowed) return { session, allowed: false, profile: null }

      const { data: profile, error: profileError } = await supabase
        .from('editorial_users')
        .select('email,display_name,role,active')
        .eq('email', session.user.email)
        .maybeSingle()

      if (profileError) throw profileError
      return { session, allowed: true, profile }
    },

    async listarPautas() {
      const { data, error } = await supabase
        .from('pautas')
        .select(pautaFields)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(500)
      if (error) throw error
      return data || []
    },

    async obterPauta(id) {
      const { data, error } = await supabase
        .from('pautas')
        .select(`
          *,
          contact:contacts(*),
          messages(*),
          attachments(*),
          triage_runs(*),
          pauta_history(*)
        `)
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },

    async salvarPauta(id, changes) {
      const allowed = [
        'status', 'category', 'subcategory', 'title', 'summary', 'description',
        'location_text', 'city', 'state', 'priority', 'assigned_to',
      ]
      const body = Object.fromEntries(
        Object.entries(changes).filter(([key, value]) => allowed.includes(key) && value !== undefined),
      )
      const { data, error } = await supabase.from('pautas').update(body).eq('id', id).select().single()
      if (error) throw error
      return data
    },

    async alterarStatus(pauta, status, actor) {
      const anterior = pauta.status
      const { data, error } = await supabase
        .from('pautas')
        .update({ status })
        .eq('id', pauta.id)
        .select()
        .single()
      if (error) throw error

      const { error: historyError } = await supabase.from('pauta_history').insert({
        pauta_id: pauta.id,
        actor_type: 'user',
        actor_ref: actor || null,
        event_type: 'status_changed',
        from_status: anterior,
        to_status: status,
        note: `Status alterado de ${anterior} para ${status}.`,
      })
      if (historyError) throw historyError
      return data
    },

    async urlAnexo(anexo) {
      if (anexo.source_url) return anexo.source_url
      if (!anexo.storage_bucket || !anexo.storage_path) return null
      const { data, error } = await supabase.storage
        .from(anexo.storage_bucket)
        .createSignedUrl(anexo.storage_path, 3600)
      if (error) throw error
      return data?.signedUrl || null
    },

    async sair() {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
  }
}

export const adminApi = criarAdminApi()
