import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AdminApp from './AdminApp.jsx'

describe('AdminApp', () => {
  it('mostra login quando usuário não está autenticado', async () => {
    const api = { obterSessaoAdmin: vi.fn().mockResolvedValue({ session: null, isAdmin: false }), enviarMagicLink: vi.fn() }
    render(<AdminApp api={api} />)
    expect(await screen.findByText('Acesso administrativo')).toBeTruthy()
    expect(screen.getByDisplayValue('splira@gmail.com')).toBeTruthy()
  })

  it('mostra dashboard quando usuário é administrador', async () => {
    const api = {
      obterSessaoAdmin: vi.fn().mockResolvedValue({ session: { user: { email: 'splira@gmail.com' } }, isAdmin: true }),
      listar: vi.fn().mockResolvedValue([]),
      sair: vi.fn(),
    }
    render(<AdminApp api={api} />)
    expect(await screen.findByText('Painel Vale Decide')).toBeTruthy()
    expect(screen.getByText('Candidatos')).toBeTruthy()
  })
})
