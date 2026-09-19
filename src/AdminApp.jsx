import React, { useEffect, useMemo, useState } from 'react'
import { adminApi as defaultApi } from './services/adminApi.js'

const ADMIN_EMAIL = 'splira@gmail.com'
const ADMIN_REDIRECT_URL = import.meta.env.VITE_ADMIN_REDIRECT_URL || `${window.location.origin}/admin`

const etapas = [
  ['nova', 'Nova'],
  ['triagem', 'Triagem'],
  ['apurar', 'Apurar'],
  ['em_apuracao', 'Em apuração'],
  ['producao', 'Produção'],
  ['gravacao', 'Gravação'],
  ['edicao', 'Edição'],
  ['publicada', 'Publicada'],
]

const extras = [
  ['em_espera', 'Em espera'],
  ['arquivada', 'Arquivada'],
  ['descartada', 'Descartada'],
]

const statusMap = Object.fromEntries([...etapas, ...extras])
const categorias = ['denuncia','reclamacao','problema_urbano','evento','cultura','saude','seguranca','politica','historia_humana','servico_publico','outro']

function textoStatus(status) {
  return statusMap[status] || String(status || '').replaceAll('_', ' ')
}

function dataHora(valor) {
  if (!valor) return '—'
  return new Date(valor).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function tempoDesde(valor) {
  if (!valor) return ''
  const min = Math.max(0, Math.floor((Date.now() - new Date(valor).getTime()) / 60000))
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  if (h < 48) return `${h} h`
  return `${Math.floor(h / 24)} d`
}

function mensagemLogin(error) {
  const texto = String(error?.message || '').toLowerCase()
  if (texto.includes('rate limit')) return 'Muitas tentativas de envio em pouco tempo. Aguarde alguns minutos antes de tentar novamente.'
  return error?.message || 'Não foi possível enviar o link de acesso.'
}

function Login({ api }) {
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [estado, setEstado] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function entrar(event) {
    event.preventDefault()
    if (enviando) return
    try {
      setEnviando(true)
      setEstado('Enviando link seguro...')
      await api.enviarMagicLink(email.trim(), ADMIN_REDIRECT_URL)
      setEstado('Link enviado. Abra o e-mail mais recente para entrar na Central de Pautas.')
    } catch (error) {
      setEstado(mensagemLogin(error))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="editorial-shell login-shell">
      <section className="login-card">
        <div className="editorial-brand"><span>FV</span><div><strong>Fala Vale</strong><small>TV Attual</small></div></div>
        <span className="eyebrow">ACESSO EDITORIAL</span>
        <h1>Central de Pautas</h1>
        <p>Entre com um e-mail autorizado para revisar, apurar e movimentar pautas.</p>
        <form onSubmit={entrar}>
          <label>E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <button className="primary-button" type="submit" disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar link de acesso'}</button>
        </form>
        {estado && <p className="login-status">{estado}</p>}
        <a href="/">← Voltar ao Fala Vale</a>
      </section>
    </main>
  )
}

function Score({ label, value }) {
  if (value === null || value === undefined) return null
  return <div className="score"><span>{label}</span><strong>{value}</strong><i><b style={{ width: `${Math.max(0, Math.min(100, Number(value)))}%` }} /></i></div>
}

function CardPauta({ pauta, onOpen }) {
  return (
    <button className="pauta-card" onClick={() => onOpen(pauta.id)}>
      <div className="pauta-card-top">
        <span className="priority">P{pauta.priority ?? 50}</span>
        <small>{tempoDesde(pauta.created_at)}</small>
      </div>
      <strong>{pauta.title || pauta.ai_title || 'Pauta sem título'}</strong>
      <p>{pauta.summary || pauta.ai_summary || pauta.description || 'Sem resumo.'}</p>
      <div className="pauta-meta">
        {pauta.category && <span>{pauta.category.replaceAll('_', ' ')}</span>}
        {pauta.city && <span>{pauta.city}</span>}
      </div>
      <div className="pauta-source">
        <span>{pauta.contact?.name || pauta.contact?.phone || 'Audiência'}</span>
        <small>{pauta.origin_channel || 'entrada'}</small>
      </div>
    </button>
  )
}

function DetalhePauta({ pauta, api, userEmail, onClose, onChanged }) {
  const [draft, setDraft] = useState({
    title: pauta.title || '',
    summary: pauta.summary || '',
    category: pauta.category || '',
    subcategory: pauta.subcategory || '',
    city: pauta.city || '',
    location_text: pauta.location_text || '',
    assigned_to: pauta.assigned_to || '',
    priority: pauta.priority ?? 50,
  })
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [urls, setUrls] = useState({})

  useEffect(() => {
    let cancelado = false
    Promise.all((pauta.attachments || []).map(async (a) => {
      try { return [a.id, await api.urlAnexo(a)] } catch { return [a.id, null] }
    })).then((pares) => { if (!cancelado) setUrls(Object.fromEntries(pares)) })
    return () => { cancelado = true }
  }, [pauta, api])

  async function salvar() {
    try {
      setSalvando(true)
      setMensagem('Salvando...')
      await api.salvarPauta(pauta.id, { ...draft, priority: Number(draft.priority) })
      setMensagem('Alterações salvas.')
      await onChanged(pauta.id)
    } catch (error) {
      setMensagem(error.message || 'Não foi possível salvar.')
    } finally {
      setSalvando(false)
    }
  }

  async function mudarStatus(event) {
    const status = event.target.value
    try {
      setSalvando(true)
      await api.alterarStatus(pauta, status, userEmail)
      setMensagem(`Movida para ${textoStatus(status)}.`)
      await onChanged(pauta.id)
    } catch (error) {
      setMensagem(error.message || 'Não foi possível alterar o status.')
    } finally {
      setSalvando(false)
    }
  }

  const mensagens = [...(pauta.messages || [])].sort((a,b) => new Date(a.received_at) - new Date(b.received_at))
  const historico = [...(pauta.pauta_history || [])].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
  const triagem = [...(pauta.triage_runs || [])].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0]

  return (
    <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer">
        <div className="drawer-head">
          <div><span className="eyebrow">PAUTA #{pauta.id.slice(0, 8)}</span><h2>{pauta.title || pauta.ai_title || 'Pauta sem título'}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Fechar">×</button>
        </div>

        <div className="drawer-toolbar">
          <label>Status<select value={pauta.status} onChange={mudarStatus} disabled={salvando}>{[...etapas, ...extras].map(([id,nome]) => <option key={id} value={id}>{nome}</option>)}</select></label>
          <label>Prioridade<input type="number" min="0" max="100" value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })} /></label>
          <label>Responsável<input value={draft.assigned_to} onChange={(e) => setDraft({ ...draft, assigned_to: e.target.value })} placeholder="Nome ou e-mail" /></label>
        </div>

        <section className="drawer-section">
          <div className="section-title"><h3>Identificação editorial</h3><button className="primary-button compact" onClick={salvar} disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button></div>
          <div className="form-grid">
            <label className="wide">Título<input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
            <label className="wide">Resumo<textarea value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} /></label>
            <label>Categoria<select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}><option value="">Sem categoria</option>{categorias.map((c) => <option key={c} value={c}>{c.replaceAll('_',' ')}</option>)}</select></label>
            <label>Subcategoria<input value={draft.subcategory} onChange={(e) => setDraft({ ...draft, subcategory: e.target.value })} /></label>
            <label>Cidade<input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} /></label>
            <label>Local<input value={draft.location_text} onChange={(e) => setDraft({ ...draft, location_text: e.target.value })} /></label>
          </div>
          {mensagem && <p className="inline-status">{mensagem}</p>}
        </section>

        <section className="drawer-section">
          <h3>Triagem automática</h3>
          <div className="scores">
            <Score label="Urgência" value={pauta.urgency_score ?? triagem?.urgency_score} />
            <Score label="Relevância" value={pauta.relevance_score ?? triagem?.relevance_score} />
            <Score label="Credibilidade" value={pauta.credibility_score ?? triagem?.credibility_score} />
            <Score label="Impacto regional" value={pauta.regional_impact_score ?? triagem?.regional_impact_score} />
          </div>
          <div className="ai-note">
            <strong>{pauta.ai_model || triagem?.model || 'Triagem automática'}</strong>
            <p>{pauta.ai_rationale || triagem?.rationale || 'Sem justificativa registrada.'}</p>
            <small>Decisão editorial humana obrigatória: {pauta.needs_human_review ? 'sim' : 'não'}</small>
          </div>
        </section>

        <section className="drawer-section">
          <h3>Contato e origem</h3>
          <div className="contact-card">
            <div><strong>{pauta.contact?.name || 'Contato sem nome'}</strong><span>{pauta.contact?.phone || 'Telefone não informado'}</span><span>{pauta.contact?.email || ''}</span></div>
            <div><small>Canal</small><strong>{pauta.origin_channel || '—'}</strong><small>Recebida</small><strong>{dataHora(pauta.created_at)}</strong></div>
          </div>
        </section>

        <section className="drawer-section">
          <h3>Mensagens recebidas</h3>
          <div className="message-list">
            {mensagens.map((m) => <article key={m.id}><div><strong>{m.sender_name || m.sender_identifier || 'Audiência'}</strong><small>{dataHora(m.received_at)}</small></div><p>{m.body || `[${m.message_type}]`}</p></article>)}
            {!mensagens.length && <p className="empty">Nenhuma mensagem vinculada.</p>}
          </div>
        </section>

        <section className="drawer-section">
          <h3>Anexos</h3>
          <div className="attachment-list">
            {(pauta.attachments || []).map((a) => <a key={a.id} href={urls[a.id] || '#'} target="_blank" rel="noreferrer" className={!urls[a.id] ? 'disabled' : ''}><strong>{a.file_name || a.kind || 'Arquivo'}</strong><small>{a.mime_type || 'mídia'}</small></a>)}
            {!pauta.attachments?.length && <p className="empty">Nenhum anexo.</p>}
          </div>
        </section>

        <section className="drawer-section">
          <h3>Histórico</h3>
          <div className="timeline">
            {historico.map((h) => <article key={h.id}><i /><div><strong>{h.event_type.replaceAll('_',' ')}</strong><p>{h.note || (h.to_status ? `Status: ${textoStatus(h.to_status)}` : '')}</p><small>{dataHora(h.created_at)} {h.actor_ref ? `· ${h.actor_ref}` : ''}</small></div></article>)}
            {!historico.length && <p className="empty">Sem movimentações registradas.</p>}
          </div>
        </section>
      </aside>
    </div>
  )
}

function Painel({ api, session, profile }) {
  const [pautas, setPautas] = useState([])
  const [selecionada, setSelecionada] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [cidade, setCidade] = useState('Todas')
  const [categoria, setCategoria] = useState('Todas')
  const [modo, setModo] = useState('board')

  async function carregar() {
    try {
      setErro('')
      setPautas(await api.listarPautas())
    } catch (error) {
      setErro(error.message || 'Não foi possível carregar as pautas.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  const cidades = useMemo(() => [...new Set(pautas.map((p) => p.city).filter(Boolean))].sort((a,b) => a.localeCompare(b,'pt-BR')), [pautas])
  const categoriasDisponiveis = useMemo(() => [...new Set(pautas.map((p) => p.category).filter(Boolean))].sort(), [pautas])

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    return pautas.filter((p) => {
      const texto = [p.title,p.summary,p.description,p.city,p.category,p.contact?.name,p.contact?.phone].filter(Boolean).join(' ').toLocaleLowerCase('pt-BR')
      return (!termo || texto.includes(termo))
        && (cidade === 'Todas' || p.city === cidade)
        && (categoria === 'Todas' || p.category === categoria)
    })
  }, [pautas, busca, cidade, categoria])

  const metricas = useMemo(() => ({
    novas: pautas.filter((p) => ['nova','triagem'].includes(p.status)).length,
    apuracao: pautas.filter((p) => ['apurar','em_apuracao'].includes(p.status)).length,
    producao: pautas.filter((p) => ['producao','gravacao','edicao'].includes(p.status)).length,
    publicadas: pautas.filter((p) => p.status === 'publicada').length,
  }), [pautas])

  async function abrir(id) {
    try {
      setSelecionada(await api.obterPauta(id))
    } catch (error) {
      setErro(error.message || 'Não foi possível abrir a pauta.')
    }
  }

  async function atualizarAberta(id) {
    await carregar()
    setSelecionada(await api.obterPauta(id))
  }

  return (
    <main className="editorial-shell">
      <header className="editorial-top">
        <div className="editorial-brand"><span>FV</span><div><strong>Fala Vale</strong><small>Central de Pautas · TV Attual</small></div></div>
        <div className="user-area">
          <div><strong>{profile?.display_name || session.user.email}</strong><small>{profile?.role || 'editorial'}</small></div>
          <button onClick={async () => { await api.sair(); location.reload() }}>Sair</button>
        </div>
      </header>

      <section className="dashboard-head">
        <div><span className="eyebrow">REDAÇÃO</span><h1>Central de Pautas</h1><p>Priorize, apure e acompanhe o que chega da audiência.</p></div>
        <button className="refresh-button" onClick={() => { setCarregando(true); carregar() }}>↻ Atualizar</button>
      </section>

      <section className="metrics">
        <article><span>Entrada</span><strong>{metricas.novas}</strong><small>nova + triagem</small></article>
        <article><span>Apuração</span><strong>{metricas.apuracao}</strong><small>para checar agora</small></article>
        <article><span>Produção</span><strong>{metricas.producao}</strong><small>em andamento</small></article>
        <article><span>Publicadas</span><strong>{metricas.publicadas}</strong><small>concluídas</small></article>
      </section>

      <section className="toolbar">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar pauta, cidade, contato ou assunto" />
        <select value={cidade} onChange={(e) => setCidade(e.target.value)}><option>Todas</option>{cidades.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}><option>Todas</option>{categoriasDisponiveis.map((item) => <option key={item}>{item}</option>)}</select>
        <div className="view-toggle"><button className={modo === 'board' ? 'active' : ''} onClick={() => setModo('board')}>Quadro</button><button className={modo === 'list' ? 'active' : ''} onClick={() => setModo('list')}>Lista</button></div>
      </section>

      {erro && <div className="editorial-error">{erro}</div>}
      {carregando && <div className="editorial-loading">Carregando pautas...</div>}

      {!carregando && modo === 'board' && (
        <section className="board">
          {etapas.map(([id,nome]) => {
            const itens = filtradas.filter((p) => p.status === id)
            return <div className="board-column" key={id}><header><strong>{nome}</strong><span>{itens.length}</span></header><div>{itens.map((p) => <CardPauta key={p.id} pauta={p} onOpen={abrir} />)}{!itens.length && <p className="column-empty">Sem pautas</p>}</div></div>
          })}
        </section>
      )}

      {!carregando && modo === 'list' && (
        <section className="pauta-list">
          {filtradas.map((p) => <button key={p.id} onClick={() => abrir(p.id)}><span className="priority">P{p.priority ?? 50}</span><div><strong>{p.title || p.ai_title || 'Pauta sem título'}</strong><small>{p.category?.replaceAll('_',' ') || 'sem categoria'} · {p.city || 'cidade não informada'} · {p.contact?.name || p.contact?.phone || 'audiência'}</small></div><span className="status-pill">{textoStatus(p.status)}</span><small>{tempoDesde(p.created_at)}</small></button>)}
          {!filtradas.length && <div className="editorial-loading">Nenhuma pauta neste filtro.</div>}
        </section>
      )}

      <section className="secondary-status">
        {[...extras].map(([id,nome]) => <div key={id}><span>{nome}</span><strong>{pautas.filter((p) => p.status === id).length}</strong></div>)}
      </section>

      {selecionada && <DetalhePauta pauta={selecionada} api={api} userEmail={session.user.email} onClose={() => setSelecionada(null)} onChanged={atualizarAberta} />}
    </main>
  )
}

export default function AdminApp({ api = defaultApi }) {
  const [estado, setEstado] = useState({ loading: true, session: null, allowed: false, profile: null, erro: '' })

  useEffect(() => {
    api.obterSessaoEditorial()
      .then(({ session, allowed, profile }) => setEstado({ loading: false, session, allowed, profile, erro: '' }))
      .catch((error) => setEstado({ loading: false, session: null, allowed: false, profile: null, erro: error.message }))
  }, [api])

  if (estado.loading) return <main className="editorial-shell"><div className="editorial-loading">Validando acesso...</div></main>
  if (estado.erro) return <main className="editorial-shell"><div className="editorial-error">{estado.erro}</div></main>
  if (estado.session && !estado.allowed) return <main className="editorial-shell"><div className="editorial-error">Usuário autenticado, mas sem acesso à redação.</div></main>
  if (!estado.session) return <Login api={api} />
  return <Painel api={api} session={estado.session} profile={estado.profile} />
}
