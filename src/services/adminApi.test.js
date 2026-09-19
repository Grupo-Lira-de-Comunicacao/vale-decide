import { describe, expect, it, vi } from 'vitest'
import { criarAdminApi } from './adminApi.js'

describe('adminApi', () => {
  it('envia magic link com redirect informado', async () => {
    const supabase = {
      auth: { signInWithOtp: vi.fn().mockResolvedValue({ error: null }) },
    }
    const api = criarAdminApi(supabase)
    await api.enviarMagicLink('splira@gmail.com', 'https://example.com/admin')
    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'splira@gmail.com',
      options: { shouldCreateUser: true, emailRedirectTo: 'https://example.com/admin' },
    })
  })

  it('nega painel quando não há sessão', async () => {
    const supabase = {
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }) },
    }
    const api = criarAdminApi(supabase)
    await expect(api.obterSessaoEditorial()).resolves.toEqual({ session: null, allowed: false, profile: null })
  })
})
