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

  it('envia magic link sem criar usuários desconhecidos', async () => {
    supabase.auth.signInWithOtp.mockResolvedValue({ error: null })
    const api = criarAdminApi(supabase)
    await api.enviarMagicLink('splira@gmail.com', 'https://vale-decide.vercel.app/admin')
    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'splira@gmail.com',
      options: { shouldCreateUser: false, emailRedirectTo: 'https://vale-decide.vercel.app/admin' },
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
})
