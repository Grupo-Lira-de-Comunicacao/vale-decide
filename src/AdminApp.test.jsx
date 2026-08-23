import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AdminApp from './AdminApp.jsx'

afterEach(() => cleanup())

describe('AdminApp', () => {
  it('mostra login quando usuário não está autenticado', async () => {
    const api = { obterSessaoAdmin: vi.fn().mockResolvedValue({ session: null, isAdmin: false }), enviarMagicLink: vi.fn() }
    render(<AdminApp api={api} />)
    expect(await screen.findByText('Acesso administrativo')).toBeTruthy()
    expect(screen.getByDisplayValue('splira@gmail.com')).toBeTruthy()
  })

  it('sempre envia magic link para o admin de produção', async () => {
    const api = {
      obterSessaoAdmin: vi.fn().mockResolvedValue({ session: null, isAdmin: false }),
      enviarMagicLink: vi.fn().mockResolvedValue(),
    }
    render(<AdminApp api={api} />)
    const botao = await screen.findByRole('button', { name: 'Enviar link de acesso' })
    fireEvent.click(botao)
    await waitFor(() => expect(api.enviarMagicLink).toHaveBeenCalledWith('splira@gmail.com', 'https://vale-decide.vercel.app/admin'))
  })

  it('traduz rate limit do Supabase para mensagem amigável', async () => {
    const api = {
      obterSessaoAdmin: vi.fn().mockResolvedValue({ session: null, isAdmin: false }),
      enviarMagicLink: vi.fn().mockRejectedValue(new Error('email rate limit exceeded')),
    }
    render(<AdminApp api={api} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Enviar link de acesso' }))
    expect(await screen.findByText(/Muitas tentativas de envio/i)).toBeTruthy()
  })

  it('mostra dashboard com gestão de municípios quando usuário é administrador', async () => {
    const api = {
      obterSessaoAdmin: vi.fn().mockResolvedValue({ session: { user: { email: 'splira@gmail.com' } }, isAdmin: true }),
      listarCandidatos: vi.fn().mockResolvedValue([]),
      listar: vi.fn().mockResolvedValue([]),
      sair: vi.fn(),
    }
    render(<AdminApp api={api} />)
    expect(await screen.findByText('Painel Vale Decide')).toBeTruthy()
    expect(screen.getAllByText('Candidatos').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Municípios relacionados' })).toBeTruthy()
    await waitFor(() => expect(api.listarCandidatos).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(api.listar).toHaveBeenCalledWith('municipalities'))
  })
})
