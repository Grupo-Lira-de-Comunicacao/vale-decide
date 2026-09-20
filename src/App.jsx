const etapas = [
  ['01', 'Recebe', 'WhatsApp e outros canais entram em uma única fila editorial.'],
  ['02', 'Conversa', 'O Fala Vale identifica o que já foi informado e pergunta apenas os dados que ainda faltam.'],
  ['03', 'Organiza', 'Texto, fotos, vídeos, áudios e PDFs são vinculados à pauta para revisão da redação.'],
  ['04', 'Apura', 'A equipe humana checa fontes, contexto, urgência, credibilidade e impacto antes de publicar.'],
]

const WHATSAPP_URL = 'https://wa.me/5512992222681?text=Ol%C3%A1%2C%20quero%20enviar%20uma%20pauta%20para%20a%20TV%20Attual.'

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
            Envie informações, reclamações, denúncias, eventos e histórias para a equipe editorial da TV Attual.
            Você pode conversar naturalmente pelo WhatsApp e também mandar fotos, vídeos, áudios e PDFs.
          </p>
          <div className="public-actions">
            <a className="primary-link" href={WHATSAPP_URL} target="_blank" rel="noreferrer">Enviar pauta pelo WhatsApp</a>
            <a className="secondary-link" href="/admin">Acesso editorial</a>
          </div>
        </div>

        <div className="public-status">
          <span className="status-dot" />
          <div>
            <strong>WhatsApp oficial · +55 12 99222-2681</strong>
            <small>Atendimento guiado com triagem automática e decisão editorial humana</small>
          </div>
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
          Nenhuma sugestão recebida vira notícia automaticamente. O Fala Vale registra, organiza e prioriza sinais;
          apuração, enquadramento editorial e publicação permanecem sob responsabilidade humana.
        </p>
      </section>

      <footer className="public-footer">TV Attual · Grupo Lira de Comunicação · Vale do Paraíba</footer>
    </main>
  )
}
