const etapas = [
  ['01', 'Recebe', 'WhatsApp, formulário e outros canais entram em uma única fila editorial.'],
  ['02', 'Organiza', 'A automação normaliza, classifica e registra a pauta sem publicar nada sozinha.'],
  ['03', 'Apura', 'A redação revisa fonte, contexto, urgência, credibilidade e impacto regional.'],
  ['04', 'Produz', 'A pauta segue para reportagem, entrevista, vídeo, redes, site ou TV.'],
]

export default function App() {
  return (
    <main className="public-shell">
      <header className="public-hero">
        <div className="public-brand">
          <span className="brand-mark">FV</span>
          <div>
            <strong>Fala Vale</strong>
            <small>Central de Pautas · TV Attual</small>
          </div>
        </div>

        <div className="public-copy">
          <span className="eyebrow">AUDIÊNCIA → REDAÇÃO → CONTEÚDO</span>
          <h1>O Vale fala.<br />A TV Attual escuta.</h1>
          <p>
            O Fala Vale organiza informações, reclamações, denúncias, eventos e histórias enviadas pela audiência
            para a equipe editorial da TV Attual.
          </p>
          <div className="public-actions">
            <a className="primary-link" href="/admin">Abrir Central de Pautas</a>
            <a className="secondary-link" href="https://tvattual.com.br" target="_blank" rel="noreferrer">TV Attual</a>
          </div>
        </div>

        <div className="public-status">
          <span className="status-dot" />
          <div><strong>Sistema operacional</strong><small>Triagem automática com decisão editorial humana</small></div>
        </div>
      </header>

      <section className="public-grid">
        {etapas.map(([numero, titulo, texto]) => (
          <article key={numero}>
            <span>{numero}</span>
            <h2>{titulo}</h2>
            <p>{texto}</p>
          </article>
        ))}
      </section>

      <section className="public-principles">
        <div>
          <span className="eyebrow">PRINCÍPIO EDITORIAL</span>
          <h2>IA ajuda a organizar. A redação decide.</h2>
        </div>
        <p>
          Nenhuma sugestão recebida vira notícia automaticamente. O Fala Vale registra, classifica e prioriza sinais;
          apuração, enquadramento editorial e publicação permanecem sob responsabilidade humana.
        </p>
      </section>

      <footer className="public-footer">TV Attual · Grupo Lira de Comunicação · Vale do Paraíba</footer>
    </main>
  )
}
