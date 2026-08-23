import { describe, expect, it, vi, beforeEach } from 'vitest'
import { criarAdminApi } from './adminApi.js'

describe('adminApi', () => {
  let supabase

  beforeEach(() => {
    supabase = {
      auth: {
        signInWithOtp: vi.fn(),
        signOut: vi.fn(),
        getSession: vi.fn(),
      },
      rpc: vi.fn(),
      from: vi.fn(),
    }
  })

  it('envia magic link permitindo criar o primeiro usuário Auth', async () => {
    supabase.auth.signInWithOtp.mockResolvedValue({ error: null })
    const api = criarAdminApi(supabase)
    await api.enviarMagicLink('splira@gmail.com', 'https://vale-decide.vercel.app/admin')
    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'splira@gmail.com',
      options: { shouldCreateUser: true, emailRedirectTo: 'https://vale-decide.vercel.app/admin' },
    })
  })

  it('nega acesso quando não há sessão', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    const api = criarAdminApi(supabase)
    await expect(api.obterSessaoAdmin()).resolves.toEqual({ session: null, isAdmin: false })
  })

  it('consulta is_admin para sessão autenticada', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { email: 'splira@gmail.com' } } }, error: null })
    supabase.rpc.mockResolvedValue({ data: true, error: null })
    const api = criarAdminApi(supabase)
    await expect(api.obterSessaoAdmin()).resolves.toEqual({
      session: { user: { email: 'splira@gmail.com' } },
      isAdmin: true,
    })
    expect(supabase.rpc).toHaveBeenCalledWith('is_admin')
  })

  it('ordena acompanhamento editorial por updated_at', async () => {
    const order = vi.fn().mockResolvedValue({ data: [], error: null })
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      order,
    }
    query.select.mockReturnValue(query)
    query.eq.mockReturnValue(query)
    supabase.from.mockReturnValue(query)

    const api = criarAdminApi(supabase)
    await api.listar('editorial_tracking', { candidateId: 'candidate-1' })

    expect(query.eq).toHaveBeenCalledWith('candidate_id', 'candidate-1')
    expect(order).toHaveBeenCalledWith('updated_at', { ascending: false })
  })
})
