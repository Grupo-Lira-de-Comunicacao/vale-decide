import React, { useEffect, useMemo, useState } from 'react'
import { adminApi as defaultApi } from './services/adminApi.js'

const ADMIN_EMAIL = 'splira@gmail.com'

const secoes = [
  ['candidates', 'Candidatos'],
  ['electoral_history', 'Histórico eleitoral'],
  ['candidate_sources', 'Fontes'],
  ['municipal_impact', 'Impacto municipal'],
  ['editorial_tracking', 'Acompanhamento editorial'],
]

const camposCandidato = [
  ['ballot_name', 'Nome de urna'], ['full_name', 'Nome completo'], ['office', 'Cargo'], ['ballot_number', 'Número'],
  ['party', 'Partido'], ['federation', 'Federação'], ['coalition', 'Coligação'], ['home_city', 'Cidade-base'],
  ['occupation', 'Ocupação'], ['current_position', 'Cargo atual'], ['biography', 'Biografia', 'textarea'],
  ['photo_url', 'Foto (URL)'], ['website_url', 'Site'], ['instagram_url', 'Instagram'], ['facebook_url', 'Facebook'],
  ['youtube_url', 'YouTube'], ['tiktok_url', 'TikTok'], ['public_whatsapp', 'WhatsApp público'],
  ['registration_status', 'Situação eleitoral'], ['verification_status', 'Status de verificação'],
  ['editorial_priority', 'Prioridade editorial', 'number'], ['regional_relevance', 'Relevância regional', 'number'],
  ['published', 'Publicado', 'checkbox'],
]

const camposPorTabela = {
  electoral_history: [
    ['election_year', 'Ano', 'number'], ['office', 'Cargo'], ['municipality', 'Município'], ['votes', 'Votos', 'number'],
    ['result', 'Resultado'], ['source_url', 'Fonte (URL)'],
  ],
  candidate_sources: [
    ['source_type', 'Tipo de fonte'], ['source_name', 'Nome da fonte'], ['source_url', 'URL'], ['claim', 'Informação comprovada', 'textarea'],
    ['checked_at', 'Checado em', 'datetime-local'],
  ],
  municipal_impact: [
    ['municipality_id', 'Município', 'municipality'], ['year', 'Ano', 'number'], ['category', 'Categoria'], ['description', 'Descrição', 'textarea'],
    ['announced_amount', 'Anunciado', 'number'], ['committed_amount', 'Empenhado', 'number'], ['paid_amount', 'Pago', 'number'],
    ['executed_amount', 'Executado', 'number'], ['status', 'Situação'], ['beneficiary', 'Beneficiário/destino'],
    ['source_url', 'Fonte (URL)'], ['source_name', 'Nome da fonte'], ['verified', 'Verificado', 'checkbox'], ['verified_at', 'Verificado em', 'datetime-local'],
  ],
  editorial_tracking: [
    ['contact_status', 'Contato'], ['invitation_status', 'Convite'], ['interview_status', 'Entrevista'],
    ['interview_at', 'Data da entrevista', 'datetime-local'], ['published_interview_url', 'Link publicado'], ['internal_notes', 'Notas internas', 'textarea'],
  ],
}

function valorInicial(campos) {
  return Object.fromEntries(campos.map(([nome, , tipo]) => [nome, tipo === 'checkbox' ? false : '']))
}

function Campo({ campo, value, onChange, municipios = [] }) {
  const [nome, label, tipo = 'text'] = campo
  if (tipo === 'checkbox') {
    return <label className="admin-check"><input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(nome, e.target.checked)} /> {label}</label>
  }
  if (tipo === 'textarea') {
    return <label>{label}<textarea value={value ?? ''} onChange={(e) => onChange(nome, e.target.value)} /></label>
  }
  if (tipo === 'municipality') {
    return <label>{label}<select value={value ?? ''} onChange={(e) => onChange(nome, e.target.value)}><option value="">Selecione</option>{municipios.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
  }
  return <label>{label}<input type={tipo} value={value ?? ''} onChange={(e) => onChange(nome, e.target.value)} /></label>
}

function Login({ api }) {
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [estado, setEstado] = useState('')
  async function entrar(e) {
    e.preventDefault()
    try {
      setEstado('Enviando link seguro...')
      await api.enviarMagicLink(email.trim(), `${window.location.origin}/admin`)
      setEstado('Link enviado. Abra o e-mail e clique para entrar.')
    } catch (error) {
      setEstado(error.message || 'Não foi possível enviar o link.')
    }
  }
  return <main className="admin-shell admin-login"><section className="admin-card"><span className="selo">VALE DECIDE</span><h1>Acesso administrativo</h1><p>Entre com o e-mail autorizado para editar a base eleitoral.</p><form onSubmit={entrar}><label>E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label><button className="admin-primary" type="submit">Enviar link de acesso</button></form>{estado && <p className="admin-status">{estado}</p>}<a href="/">← Voltar ao site público</a></section></main>
}

function Painel({ api, session }) {
  const [secao, setSecao] = useState('candidates')
  const [candidatos, setCandidatos] = useState([])
  const [candidatoId, setCandidatoId] = useState('')
  const [registros, setRegistros] = useState([])
  const [municipios, setMunicipios] = useState([])
  const [form, setForm] = useState(valorInicial(camposCandidato))
  const [mensagem, setMensagem] = useState('')
  const campos = secao === 'candidates' ? camposCandidato : camposPorTabela[secao]

  async function carregarCandidatos() {
    const dados = await api.listarCandidatos()
    setCandidatos(dados)
    if (!candidatoId && dados[0]) setCandidatoId(dados[0].id)
  }

  useEffect(() => {
    carregarCandidatos().catch((e) => setMensagem(e.message))
    api.listar('municipalities').then(setMunicipios).catch(() => {})
  }, [])

  useEffect(() => {
    setMensagem('')
    setForm(valorInicial(campos))
    if (secao === 'candidates') {
      setRegistros(candidatos)
      return
    }
    if (!candidatoId) return setRegistros([])
    api.listar(secao, { candidateId: candidatoId }).then(setRegistros).catch((e) => setMensagem(e.message))
  }, [secao, candidatoId, candidatos])

  const candidatoAtual = useMemo(() => candidatos.find((c) => c.id === candidatoId), [candidatos, candidatoId])

  function editar(item) {
    setForm({ ...valorInicial(campos), ...item })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function salvar(e) {
    e.preventDefault()
    try {
      setMensagem('Salvando...')
      const payload = { ...form }
      if (secao !== 'candidates') payload.candidate_id = candidatoId
      for (const [nome, , tipo] of campos) if (tipo === 'number' && payload[nome] !== '') payload[nome] = Number(payload[nome])
      await api.salvar(secao, payload)
      setForm(valorInicial(campos))
      if (secao === 'candidates') await carregarCandidatos()
      else setRegistros(await api.listar(secao, { candidateId: candidatoId }))
      setMensagem('Salvo com sucesso.')
    } catch (error) { setMensagem(error.message || 'Erro ao salvar.') }
  }

  async function excluir(id) {
    if (!window.confirm('Excluir este registro?')) return
    try {
      await api.remover(secao, id)
      if (secao === 'candidates') await carregarCandidatos()
      else setRegistros(await api.listar(secao, { candidateId: candidatoId }))
      setMensagem('Registro excluído.')
    } catch (error) { setMensagem(error.message || 'Erro ao excluir.') }
  }

  return <main className="admin-shell"><header className="admin-top"><div><span className="selo">ADMIN</span><h1>Painel Vale Decide</h1><small>{session.user.email}</small></div><div className="admin-actions"><a href="/">Ver site</a><button onClick={async () => { await api.sair(); location.reload() }}>Sair</button></div></header>
    <nav className="admin-tabs">{secoes.map(([id, nome]) => <button key={id} className={secao === id ? 'ativo' : ''} onClick={() => setSecao(id)}>{nome}</button>)}</nav>
    {secao !== 'candidates' && <section className="admin-card"><label>Candidato<select value={candidatoId} onChange={(e) => setCandidatoId(e.target.value)}>{candidatos.map((c) => <option key={c.id} value={c.id}>{c.ballot_name} · {c.party}</option>)}</select></label>{candidatoAtual && <small>Editando dados relacionados a {candidatoAtual.ballot_name}</small>}</section>}
    <section className="admin-grid"><form className="admin-card admin-form" onSubmit={salvar}><h2>{form.id ? 'Editar registro' : 'Novo registro'}</h2>{campos.map((campo) => <Campo key={campo[0]} campo={campo} value={form[campo[0]]} municipios={municipios} onChange={(nome, valor) => setForm((atual) => ({ ...atual, [nome]: valor }))} />)}<div className="admin-form-actions"><button className="admin-primary" type="submit">Salvar</button>{form.id && <button type="button" onClick={() => setForm(valorInicial(campos))}>Cancelar</button>}</div>{mensagem && <p className="admin-status">{mensagem}</p>}</form>
      <section className="admin-card admin-list"><h2>{secao === 'candidates' ? 'Candidatos' : 'Registros'}</h2>{registros.map((item) => <article key={item.id}><div><strong>{item.ballot_name || item.source_name || item.category || item.office || item.contact_status || 'Registro'}</strong><small>{item.party || item.result || item.status || item.source_type || item.interview_status || ''}</small></div><div><button onClick={() => editar(item)}>Editar</button><button className="perigo" onClick={() => excluir(item.id)}>Excluir</button></div></article>)}{!registros.length && <p>Nenhum registro cadastrado.</p>}</section>
    </section>
  </main>
}

export default function AdminApp({ api = defaultApi }) {
  const [estado, setEstado] = useState({ loading: true, session: null, isAdmin: false, erro: '' })
  useEffect(() => { api.obterSessaoAdmin().then(({ session, isAdmin }) => setEstado({ loading: false, session, isAdmin, erro: '' })).catch((e) => setEstado({ loading: false, session: null, isAdmin: false, erro: e.message })) }, [api])
  if (estado.loading) return <main className="admin-shell"><div className="estado">Validando acesso...</div></main>
  if (estado.session && !estado.isAdmin) return <main className="admin-shell"><div className="estado erro">Usuário autenticado, mas sem permissão administrativa.</div></main>
  if (!estado.session) return <Login api={api} />
  return <Painel api={api} session={estado.session} />
}
