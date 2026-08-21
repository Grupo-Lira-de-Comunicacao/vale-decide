import { useEffect, useMemo, useState } from 'react'
import { carregarCandidatos, formatarCargo } from './services/valeDecideApi.js'

const cidadesPrioritarias = ['Caçapava', 'Taubaté', 'São José dos Campos', 'Jambeiro']

export default function App() {
  const [candidatos, setCandidatos] = useState([])
  const [cidade, setCidade] = useState('Todas')
  const [cargo, setCargo] = useState('Todos')
  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregarCandidatos()
      .then(setCandidatos)
      .catch((error) => setErro(error.message))
      .finally(() => setCarregando(false))
  }, [])

  const cargos = useMemo(
    () => [...new Set(candidatos.map((item) => item.office))].sort(),
    [candidatos],
  )

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    return candidatos.filter((item) => {
      const cidadeOk = cidade === 'Todas' || item.home_city === cidade
      const cargoOk = cargo === 'Todos' || item.office === cargo
      const buscaOk = !termo || [item.ballot_name, item.full_name, item.party, item.home_city]
        .filter(Boolean)
        .some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termo))
      return cidadeOk && cargoOk && buscaOk
    })
  }, [candidatos, cidade, cargo, busca])

  const contagemCidade = (nome) => candidatos.filter((item) => item.home_city === nome).length

  if (selecionado) {
    return (
      <main className="pagina">
        <button className="voltar" onClick={() => setSelecionado(null)}>← Voltar aos candidatos</button>
        <article className="perfil">
          <span className="selo">VALE DECIDE 2026</span>
          <h1>{selecionado.ballot_name}</h1>
          <p className="linha-forte">{formatarCargo(selecionado.office)} · {selecionado.party} · {selecionado.ballot_number}</p>
          <div className="tags">
            <span>{selecionado.home_city}</span>
            <span>{selecionado.registration_status}</span>
          </div>
          <dl>
            <div><dt>Nome completo</dt><dd>{selecionado.full_name}</dd></div>
            {selecionado.federation && <div><dt>Federação</dt><dd>{selecionado.federation}</dd></div>}
            {selecionado.occupation && <div><dt>Ocupação</dt><dd>{selecionado.occupation}</dd></div>}
            {selecionado.current_position && <div><dt>Cargo atual</dt><dd>{selecionado.current_position}</dd></div>}
            {selecionado.biography && <div><dt>Histórico</dt><dd>{selecionado.biography}</dd></div>}
          </dl>
          <div className="verificacao">
            <strong>Dados verificados</strong>
            <span>Última checagem: {selecionado.last_verified_at ? new Date(selecionado.last_verified_at).toLocaleString('pt-BR') : 'em atualização'}</span>
          </div>
        </article>
      </main>
    )
  }

  return (
    <main className="pagina">
      <header className="hero">
        <span className="selo">ELEIÇÕES 2026</span>
        <h1>Vale Decide</h1>
        <p>Informação eleitoral regional, fontes verificadas e acompanhamento do que cada representante entrega para o Vale do Paraíba.</p>
      </header>

      <section className="cidades" aria-label="Cidades prioritárias">
        {cidadesPrioritarias.map((nome) => (
          <button key={nome} onClick={() => setCidade(nome)} className={cidade === nome ? 'ativo' : ''}>
            <strong>{contagemCidade(nome)}</strong>
            <span>{nome}</span>
          </button>
        ))}
      </section>

      <section className="filtros">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar candidato, partido ou cidade" />
        <select value={cidade} onChange={(e) => setCidade(e.target.value)}>
          <option>Todas</option>
          {cidadesPrioritarias.map((nome) => <option key={nome}>{nome}</option>)}
        </select>
        <select value={cargo} onChange={(e) => setCargo(e.target.value)}>
          <option>Todos</option>
          {cargos.map((item) => <option key={item} value={item}>{formatarCargo(item)}</option>)}
        </select>
      </section>

      {carregando && <div className="estado">Carregando base oficial...</div>}
      {erro && <div className="estado erro">{erro}</div>}

      {!carregando && !erro && (
        <section className="lista">
          {filtrados.map((item) => (
            <button className="card" key={item.id} onClick={() => setSelecionado(item)}>
              <div className="numero">{item.ballot_number}</div>
              <div className="card-texto">
                <strong>{item.ballot_name}</strong>
                <span>{formatarCargo(item.office)}</span>
                <small>{item.party} · {item.home_city}</small>
              </div>
              <span className="seta">›</span>
            </button>
          ))}
          {!filtrados.length && <div className="estado">Nenhum candidato publicado neste filtro.</div>}
        </section>
      )}

      <footer>TV Attual · Vale Decide 2026 · Base editorial em atualização contínua</footer>
    </main>
  )
}
