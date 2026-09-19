import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AdminApp from './AdminApp.jsx'

afterEach(() => cleanup())

describe('AdminApp', () => {
  it('mostra login quando não há sessão', async () => {
    const api = {
      obterSessaoEditorial: vi.fn().mockResolvedValue({ session: null, allowed: false, profile: null }),
      enviarMagicLink: vi.fn(),
    }
    render(<AdminApp api={api} />)
    expect(await screen.findByRole('heading', { name: 'Central de Pautas' })).toBeTruthy()
    expect(screen.getByDisplayValue('splira@gmail.com')).toBeTruthy()
  })

  it('envia magic link para o e-mail informado', async () => {
    const api = {
      obterSessaoEditorial: vi.fn().mockResolvedValue({ session: null, allowed: false, profile: null }),
      enviarMagicLink: vi.fn().mockResolvedValue(),
    }
    render(<AdminApp api={api} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Enviar link de acesso' }))
    await waitFor(() => expect(api.enviarMagicLink).toHaveBeenCalled())
  })

  it('mostra o quadro editorial para usuário autorizado', async () => {
    const api = {
      obterSessaoEditorial: vi.fn().mockResolvedValue({
        session: { user: { email: 'splira@gmail.com' } },
        allowed: true,
        profile: { email: 'splira@gmail.com', role: 'admin' },
      }),
      listarPautas: vi.fn().mockResolvedValue([
        { id: '11111111-1111-1111-1111-111111111111', status: 'triagem', priority: 80, title: 'Teste de pauta', created_at: new Date().toISOString(), contact: { name: 'Audiência' } },
      ]),
      obterPauta: vi.fn(),
      sair: vi.fn(),
    }
    render(<AdminApp api={api} />)
    expect(await screen.findByText('Teste de pauta')).toBeTruthy()
    expect(screen.getByText('Triagem')).toBeTruthy()
    await waitFor(() => expect(api.listarPautas).toHaveBeenCalled())
  })
})
