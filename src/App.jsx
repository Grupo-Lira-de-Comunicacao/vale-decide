import { useEffect, useMemo, useState } from 'react'
import {
  carregarCandidatos,
  carregarFichaCandidato,
  formatarCargo,
  formatarData,
  formatarDinheiro,
  somarImpactos,
} from './services/valeDecideApi.js'

const cidadesPrioritarias = ['Caçapava', 'Taubaté', 'São José dos Campos', 'Jambeiro']

function LinkExterno({ href, children }) {
  if (!href) return null
  return <a href={href} target="_blank" rel="noreferrer">{children}</a>
}

function PerfilCandidato({ candidato, onVoltar }) {
  const [ficha, setFicha] = useState({ historico: [], impactos: [] })
  const [carregandoFicha, setCarregandoFicha] = useState(true)
  const [erroFicha, setErroFicha] = useState('')

  useEffect(() => {
    carregarFichaCandidato(candidato.id)
      .then(setFicha)
      .catch((error) => setErroFicha(error.message))
      .finally(() => setCarregandoFicha(false))
  }, [candidato.id])

  const totais = useMemo(() => somarImpactos(ficha.impactos), [ficha.impactos])
  const municipiosImpactados = useMemo(
    () => [...new Set(ficha.impactos.map((item) => item.municipio))],
    [ficha.impactos],
  )

  return (
    <main className="pagina">
      <button className="voltar" onClick={onVoltar}>← Voltar aos candidatos</button>

      <article className="perfil">
        <div className="perfil-topo">
          <div>
            <span className="selo">VALE DECIDE 2026</span>
            <h1>{candidato.ballot_name}</h1>
            <p className="linha-forte">{formatarCargo(candidato.office)} · {candidato.party} · {candidato.ballot_number}</p>
          </div>
          {candidato.photo_url && <img className="foto-candidato" src={candidato.photo_url} alt={`Foto de ${candidato.ballot_name}`} />}
        </div>

        <div className="tags">
          <span>{candidato.home_city}</span>
          <span>{candidato.registration_status}</span>
          {candidato.federation && <span>{candidato.federation}</span>}
        </div>

        <dl>
          <div><dt>Nome completo</dt><dd>{candidato.full_name}</dd></div>
          {candidato.occupation && <div><dt>Ocupação</dt><dd>{candidato.occupation}</dd></div>}
          {candidato.current_position && <div><dt>Cargo atual</dt><dd>{candidato.current_position}</dd></div>}
          {candidato.biography && <div><dt>Histórico</dt><dd>{candidato.biography}</dd></div>}
        </dl>

        <div className="links-oficiais">
          <LinkExterno href={candidato.website_url}>Site</LinkExterno>
          <LinkExterno href={candidato.instagram_url}>Instagram</LinkExterno>
          <LinkExterno href={candidato.facebook_url}>Facebook</LinkExterno>
          <LinkExterno href={candidato.youtube_url}>YouTube</LinkExterno>
          <LinkExterno href={candidato.tiktok_url}>TikTok</LinkExterno>
        </div>

        <div className="verificacao">
          <strong>Ficha editorial verificada</strong>
          <span>Última checagem: {formatarData(candidato.last_verified_at)}</span>
        </div>
      </article>

      {carregandoFicha && <div className="estado">Carregando histórico e entregas verificadas...</div>}
      {erroFicha && <div className="estado erro">{erroFicha}</div>}

      {!carregandoFicha && !erroFicha && (
        <>
          <section className="bloco">
            <div className="titulo-bloco">
              <div>
                <span className="microtitulo">TRANSPARÊNCIA</span>
                <h2>O que fez pela região</h2>
              </div>
              <small>{municipiosImpactados.length || 0} município(s) com registros verificados</small>
            </div>

            <div className="totais-impacto">
              <div><span>Anunciado</span><strong>{formatarDinheiro(totais.anunciado)}</strong></div>
              <div><span>Empenhado</span><strong>{formatarDinheiro(totais.empenhado)}</strong></div>
              <div><span>Pago</span><strong>{formatarDinheiro(totais.pago)}</strong></div>
              <div><span>Executado</span><strong>{formatarDinheiro(totais.executado)}</strong></div>
            </div>

            <p className="nota-metodo">Os valores são separados por etapa para não confundir anúncio, empenho, pagamento e execução efetiva.</p>

            <div className="impactos">
              {ficha.impactos.map((item) => (
                <article className="impacto-card" key={item.id}>
                  <div className="impacto-cabecalho">
                    <div>
                      <strong>{item.municipio}</strong>
                      <span>{item.year || 'Ano não informado'} · {item.category || 'Atuação parlamentar'}</span>
                    </div>
                    <span className="status-impacto">{item.status || 'verificado'}</span>
                  </div>
                  <p>{item.description}</p>
                  {item.beneficiary && <small>Destino/beneficiário: {item.beneficiary}</small>}
                  <div className="impacto-valores">
                    {Number(item.committed_amount || 0) > 0 && <span>Empenhado: {formatarDinheiro(item.committed_amount)}</span>}
                    {Number(item.paid_amount || 0) > 0 && <span>Pago: {formatarDinheiro(item.paid_amount)}</span>}
                    {Number(item.executed_amount || 0) > 0 && <span>Executado: {formatarDinheiro(item.executed_amount)}</span>}
                  </div>
                  {item.source_url && <LinkExterno href={item.source_url}>Ver fonte{item.source_name ? ` · ${item.source_name}` : ''}</LinkExterno>}
                </article>
              ))}
              {!ficha.impactos.length && <div className="estado">Ainda não há entrega municipal verificada publicada para esta ficha.</div>}
            </div>
          </section>

          <section className="bloco">
            <div className="titulo-bloco">
              <div>
                <span className="microtitulo">HISTÓRICO ELEITORAL</span>
                <h2>Votações anteriores</h2>
              </div>
            </div>
            <div className="historico-lista">
              {ficha.historico.map((item) => (
                <article key={item.id} className="historico-item">
                  <strong>{item.election_year} · {formatarCargo(item.office)}</strong>
                  <span>{item.municipality || 'São Paulo'} · {Number(item.votes || 0).toLocaleString('pt-BR')} votos</span>
                  <small>{item.result || 'Resultado em atualização'}</small>
                  {item.source_url && <LinkExterno href={item.source_url}>Fonte</LinkExterno>}
                </article>
              ))}
              {!ficha.historico.length && <div className="estado">Sem histórico eleitoral publicado nesta ficha.</div>}
            </div>
          </section>
        </>
      )}

      <footer>TV Attual · Vale Decide 2026 · Dados públicos com atualização editorial contínua</footer>
    </main>
  )
}

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

  const cargos = useMemo(() => [...new Set(candidatos.map((item) => item.office))].sort(), [candidatos])
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    return candidatos.filter((item) => {
      const cidadeOk = cidade === 'Todas' || item.home_city === cidade
      const cargoOk = cargo === 'Todos' || item.office === cargo
      const buscaOk = !termo || [item.ballot_name, item.full_name, item.party, item.home_city, item.federation]
        .filter(Boolean)
        .some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termo))
      return cidadeOk && cargoOk && buscaOk
    })
  }, [candidatos, cidade, cargo, busca])

  const resumo = useMemo(() => candidatos.reduce((acc, item) => {
    acc[item.home_city] = (acc[item.home_city] || 0) + 1
    return acc
  }, {}), [candidatos])

  if (selecionado) return <PerfilCandidato candidato={selecionado} onVoltar={() => setSelecionado(null)} />

  return (
    <main className="pagina">
      <header className="hero">
        <span className="selo">ELEIÇÕES 2026</span>
        <h1>Vale Decide</h1>
        <p>Quem disputa seu voto, de onde vem, qual o histórico eleitoral e o que já entregou para cada cidade do Vale do Paraíba.</p>
        <div className="hero-metricas">
          <div><strong>{candidatos.length}</strong><span>fichas verificadas</span></div>
          <div><strong>{new Set(candidatos.map((item) => item.home_city)).size}</strong><span>cidades com candidatos</span></div>
          <div><strong>4</strong><span>cidades prioritárias no piloto</span></div>
        </div>
      </header>

      <section className="cidades" aria-label="Cidades prioritárias">
        {cidadesPrioritarias.map((nome) => (
          <button key={nome} onClick={() => setCidade(cidade === nome ? 'Todas' : nome)} className={cidade === nome ? 'ativo' : ''}>
            <strong>{resumo[nome] || 0}</strong>
            <span>{nome}</span>
          </button>
        ))}
      </section>

      <section className="filtros">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar candidato, partido, federação ou cidade" aria-label="Buscar candidatos" />
        <select value={cidade} onChange={(e) => setCidade(e.target.value)} aria-label="Filtrar por cidade">
          <option value="Todas">Todas as cidades</option>
          {cidadesPrioritarias.map((nome) => <option key={nome} value={nome}>{nome}</option>)}
        </select>
        <select value={cargo} onChange={(e) => setCargo(e.target.value)} aria-label="Filtrar por cargo">
          <option value="Todos">Todos os cargos</option>
          {cargos.map((item) => <option key={item} value={item}>{formatarCargo(item)}</option>)}
        </select>
      </section>

      <div className="barra-resultados">
        <span>{filtrados.length} resultado(s)</span>
        {(cidade !== 'Todas' || cargo !== 'Todos' || busca) && <button onClick={() => { setCidade('Todas'); setCargo('Todos'); setBusca('') }}>Limpar filtros</button>}
      </div>

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
                <small>{item.party}{item.federation ? ` · ${item.federation}` : ''} · {item.home_city}</small>
              </div>
              <div className="card-status">
                <span>{item.registration_status}</span>
                <b>›</b>
              </div>
            </button>
          ))}
          {!filtrados.length && <div className="estado">Nenhum candidato publicado neste filtro.</div>}
        </section>
      )}

      <section className="metodologia">
        <span className="microtitulo">COMO O VALE DECIDE TRABALHA</span>
        <h2>Dados eleitorais com contexto e rastreabilidade</h2>
        <p>O projeto diferencia candidatura, histórico eleitoral e atuação parlamentar. Em recursos públicos, também separa anúncio, empenho, pagamento e execução para evitar atribuir como “entregue” aquilo que ainda não chegou ao município.</p>
      </section>

      <footer>TV Attual · Vale Decide 2026 · Base editorial em atualização contínua</footer>
    </main>
  )
}
