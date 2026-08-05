"use client";

import { useEffect, useMemo, useState } from "react";

type ModuleKey = "biosim" | "bioquest" | "biochallenge" | "biostory" | "biolab";
type ViewKey = "inicio" | "catalogo" | "aulas" | "favoritos";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Topic = {
  id: number;
  title: string;
  category: string;
  module: ModuleKey;
};

const modules: Record<ModuleKey, { name: string; short: string; icon: string; color: string }> = {
  biosim: { name: "BioSim", short: "Simulações", icon: "◉", color: "cyan" },
  bioquest: { name: "BioQuest", short: "Investigações", icon: "⌕", color: "lime" },
  biochallenge: { name: "BioChallenge", short: "Desafios", icon: "◇", color: "amber" },
  biostory: { name: "BioStory", short: "Histórias", icon: "◫", color: "violet" },
  biolab: { name: "BioLab", short: "Experimentos", icon: "⚗", color: "rose" },
};

const topicGroups: Array<{ category: string; module: ModuleKey; titles: string[] }> = [
  { category: "Citologia", module: "biosim", titles: ["Cidade celular", "Transporte pela membrana", "Difusão", "Osmose", "Bomba de sódio e potássio", "Microscópio virtual", "História de uma célula"] },
  { category: "Genética e Biologia Molecular", module: "biosim", titles: ["Construindo um DNA", "Replicação do DNA", "Mutações", "Tradução de proteínas", "Viagem de um gene até uma proteína"] },
  { category: "Evolução", module: "biosim", titles: ["Seleção natural", "Deriva genética", "Seleção sexual", "Máquina do tempo evolutiva", "Caminhando entre os dinossauros"] },
  { category: "Ecologia", module: "biosim", titles: ["Ilha ecológica", "Teia alimentar dinâmica", "Sucessão ecológica", "Ecossistema vivo", "Polinização", "Ciclo do carbono", "Ciclo da água"] },
  { category: "Corpo Humano", module: "biosim", titles: ["Coração", "Hormônios", "Potencial de ação", "Sistema imunológico", "Digestão completa", "História de um glóbulo vermelho", "Visão", "Audição", "Olfato", "Paladar", "Ossos", "Músculos", "Desenvolvimento embrionário", "Decisões do cérebro"] },
  { category: "Microbiologia", module: "bioquest", titles: ["Resistência bacteriana", "Crescimento bacteriano", "Ciclo de vida de um vírus", "História de uma bactéria"] },
  { category: "Botânica", module: "biosim", titles: ["Fotossíntese", "Germinação de sementes"] },
  { category: "Química", module: "biosim", titles: ["Ligações químicas", "pH", "Catalisadores e enzimas", "Estados físicos da matéria", "Fluxo de calor", "Conservação da energia", "Funcionamento de uma pilha", "Radioatividade"] },
  { category: "Geologia e Astronomia", module: "biosim", titles: ["Placas tectônicas", "Erosão", "Formação da chuva", "Tornados", "Vulcões", "Campo magnético terrestre", "Estações do ano", "Fases da Lua, eclipses e marés", "Construção de um planeta (clima)"] },
  { category: "Cenários ‘E se...’", module: "bioquest", titles: ["E se a Terra parasse de girar?", "E se a gravidade fosse menor?", "E se não existissem bactérias?", "E se o oxigênio dobrasse?", "E se as plantas desaparecessem?"] },
  { category: "Viagens Científicas", module: "biostory", titles: ["Viagem de uma molécula de água", "Viagem de uma molécula de oxigênio", "Viagem de um nutriente pelo organismo"] },
  { category: "Ensino por Investigação", module: "biolab", titles: ["Laboratório de hipóteses", "Detetive científico", "Controle de variáveis", "Gráficos vivos", "Erros comuns e concepções alternativas"] },
  { category: "Biologia Molecular", module: "biochallenge", titles: ["Corrida das enzimas", "O DNA compactando", "Ligando e desligando genes", "Engenharia genética", "CRISPR"] },
  { category: "Botânica", module: "biochallenge", titles: ["Competição entre plantas", "Crescimento de raízes", "Fototropismo", "Hormônios vegetais", "Dispersão de sementes"] },
  { category: "Imunologia e Microbiologia", module: "biochallenge", titles: ["Guerra microscópica", "Anticorpos", "Vacinação", "HIV"] },
  { category: "Corpo Humano", module: "biochallenge", titles: ["Infarto", "Pressão arterial", "Asma", "Troca gasosa", "Reflexo", "Memória", "Ponto cego", "Localização do som"] },
  { category: "Ciências da Terra", module: "biochallenge", titles: ["Deriva continental", "Formação de fósseis", "Ciclo das rochas", "Camadas da Terra"] },
  { category: "Divisão Celular", module: "biosim", titles: ["Construa um cromossomo", "Mitose em câmera lenta", "O que acontece se o fuso falhar?", "Corrida dos cromossomos", "Separando cromátides", "Divisão de célula animal × vegetal", "Câncer", "Checkpoints celulares", "Danos no DNA", "A vida inteira de uma célula", "Meiose como quebra-cabeça", "Crossing-over", "Não-disjunção", "Zigoto", "Linhagem celular"] },
  { category: "Respiração Celular", module: "biosim", titles: ["Você é uma glicose", "Glicólise", "Ciclo de Krebs", "Cadeia respiratória", "ATP", "Quem produz mais energia?", "Exercício físico", "Fermentação", "Hipóxia", "Envenenamento por cianeto", "Quantidade de mitocôndrias", "Organelas cooperando", "Quanto ATP você consegue?", "Respiração × Fotossíntese", "Fábrica de ATP"] },
  { category: "Experiências Mentais", module: "biostory", titles: ["Encolhido ao tamanho de um vírus", "Dentro do núcleo", "Viagem dentro de uma hemácia", "Viajando pelo sangue", "Você é um anticorpo", "Corrida de um espermatozoide", "Você é um neurônio", "Você é uma bactéria resistente", "Você é uma planta", "Viagem de um fóton"] },
  { category: "Grandes Desafios", module: "biochallenge", titles: ["Salve a floresta", "Controle uma epidemia", "Equilibre um aquário", "Monte um ecossistema sustentável", "Sobreviva à Era Glacial", "Seja Darwin", "Seja Pasteur", "Seja Mendel", "Seja Fleming", "Monte sua própria experiência científica"] },
];

const topics: Topic[] = topicGroups.flatMap((group) =>
  group.titles.map((title) => ({ title, category: group.category, module: group.module, id: 0 })),
).map((topic, index) => ({ ...topic, id: index + 1 }));

const modeCards = [
  { id: "guided", icon: "▶", label: "Aula guiada", detail: "Conduza a turma em tela cheia", color: "cyan" },
  { id: "group", icon: "◎", label: "Atividade em grupo", detail: "Investigue e decida em equipe", color: "lime" },
  { id: "individual", icon: "◌", label: "Atividade individual", detail: "Cada aluno no próprio ritmo", color: "violet" },
  { id: "create", icon: "+", label: "Criar aula", detail: "Combine experiências e perguntas", color: "amber" },
] as const;

const lessonSteps = [
  { kicker: "01 · Problema", title: "Uma célula precisa produzir energia", text: "O oxigênio ficou escasso. O que você acha que acontecerá com a produção de ATP?", prompt: "Faça a turma prever antes de revelar o processo." },
  { kicker: "02 · Hipótese", title: "Registre uma previsão", text: "Com menos oxigênio, a célula produzirá mais, menos ou a mesma quantidade de ATP?", prompt: "Escolha uma hipótese para comparar com o resultado." },
  { kicker: "03 · Manipulação", title: "Controle o oxigênio", text: "Altere a disponibilidade de O₂ e observe como a mitocôndria responde.", prompt: "Arraste o controle e compare os cenários." },
  { kicker: "04 · Consequência", title: "A energia despenca", text: "Sem oxigênio suficiente, a cadeia respiratória desacelera e a produção de ATP diminui.", prompt: "Peça que os alunos expliquem a relação causal." },
  { kicker: "05 · Conceito", title: "Do fenômeno à ciência", text: "O oxigênio atua como aceptor final de elétrons. Quando falta, a fosforilação oxidativa é comprometida.", prompt: "Agora formalize o conceito e transfira para o exercício físico." },
];

function topicDescription(topic: Topic) {
  const action: Record<ModuleKey, string> = {
    biosim: "Manipule variáveis e observe o processo em tempo real.",
    bioquest: "Colete evidências, formule hipóteses e resolva o caso.",
    biochallenge: "Supere uma missão usando raciocínio científico.",
    biostory: "Explore o fenômeno por dentro em uma narrativa interativa.",
    biolab: "Monte o experimento, controle variáveis e analise os dados.",
  };
  return action[topic.module];
}

export default function Home() {
  const [view, setView] = useState<ViewKey>("inicio");
  const [activeMode, setActiveMode] = useState<(typeof modeCards)[number]["id"]>("guided");
  const [activeModule, setActiveModule] = useState<ModuleKey | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [lessonStep, setLessonStep] = useState(0);
  const [oxygen, setOxygen] = useState(72);
  const [hypothesis, setHypothesis] = useState<string | null>(null);
  const [builder, setBuilder] = useState<Topic[]>([topics[115], topics[118], topics[121]]);
  const [toast, setToast] = useState("");
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const workerUrl = new URL("sw.js", window.location.href).pathname;
      navigator.serviceWorker.register(workerUrl).catch(() => undefined);
    }

    const captureInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
  }, []);

  const filteredTopics = useMemo(() => {
    const term = search.trim().toLowerCase();
    return topics.filter((topic) =>
      (activeModule === "all" || topic.module === activeModule) &&
      (!term || `${topic.title} ${topic.category}`.toLowerCase().includes(term)),
    );
  }, [activeModule, search]);

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function addToBuilder(topic: Topic) {
    if (!builder.some((item) => item.id === topic.id)) setBuilder((items) => [...items, topic]);
    flash("Experiência adicionada ao roteiro");
  }

  function openCatalog(module: ModuleKey | "all" = "all") {
    setActiveModule(module);
    setView("catalogo");
  }

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") flash("BioLab instalado com sucesso");
    setInstallPrompt(null);
  }

  const lesson = lessonSteps[lessonStep];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setView("inicio")} aria-label="Ir para o início">
          <span className="brand-mark">B</span>
          <span><strong>BIOLAB</strong><small>Ciência em movimento</small></span>
        </button>

        <nav className="main-nav" aria-label="Navegação principal">
          {[
            ["inicio", "⌂", "Início"],
            ["catalogo", "⌕", "Explorar"],
            ["aulas", "▤", "Minhas aulas"],
            ["favoritos", "☆", "Favoritos"],
          ].map(([id, icon, label]) => (
            <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id as ViewKey)}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>

        <div className="sidebar-labs">
          <p>LABORATÓRIOS</p>
          {(Object.keys(modules) as ModuleKey[]).map((key) => (
            <button key={key} onClick={() => openCatalog(key)}>
              <i className={`lab-dot ${modules[key].color}`}>{modules[key].icon}</i>
              <span>{modules[key].name}<small>{modules[key].short}</small></span>
            </button>
          ))}
        </div>

        <div className="teacher-card">
          <span className="teacher-avatar">EP</span>
          <span><strong>Espaço do professor</strong><small>Protótipo de avaliação</small></span>
          <button aria-label="Opções">•••</button>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <button className="mobile-brand" onClick={() => setView("inicio")}><span className="brand-mark">B</span> BIOLAB</button>
          <div className="top-search">
            <span>⌕</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} onFocus={() => setView("catalogo")} placeholder="Buscar entre 150 experiências..." aria-label="Buscar experiências" />
            <kbd>⌘ K</kbd>
          </div>
          <div className="top-actions">
            {installPrompt && <button className="install-button" onClick={installApp}>↓ Instalar app</button>}
            <span className="content-count"><b>150</b> experiências</span>
            <button className="icon-button" aria-label="Notificações">◦</button>
            <span className="avatar">EP</span>
          </div>
        </header>

        {view === "inicio" && (
          <div className="page-content home-view">
            <section className="welcome-row">
              <div>
                <p className="eyebrow">TERÇA-FEIRA · 4 DE AGOSTO</p>
                <h1>Como será sua aula hoje?</h1>
                <p>Escolha um modo. O conteúdo científico entra depois da curiosidade.</p>
              </div>
              <button className="secondary-button" onClick={() => setView("aulas")}><span>▤</span> Ver meus roteiros</button>
            </section>

            <section className="mode-grid" aria-label="Modos de uso">
              {modeCards.map((mode) => (
                <button key={mode.id} className={`mode-card ${mode.color} ${activeMode === mode.id ? "selected" : ""}`} onClick={() => setActiveMode(mode.id)}>
                  <span className="mode-icon">{mode.icon}</span>
                  <span><strong>{mode.label}</strong><small>{mode.detail}</small></span>
                  <i>↗</i>
                </button>
              ))}
            </section>

            <section className="spotlight">
              <div className="spotlight-copy">
                <span className="live-tag"><i /> AULA DESTAQUE · 35 MIN</span>
                <p className="spotlight-path">Ensino Médio <b>›</b> Citologia <b>›</b> Bioenergética</p>
                <h2>Respiração celular:<br /><em>para onde vai a energia?</em></h2>
                <p>Uma experiência guiada em cinco atos. A turma prevê, manipula o oxigênio e constrói o conceito antes da explicação.</p>
                <div className="spotlight-meta">
                  <span><b>5</b><small>etapas</small></span>
                  <span><b>3</b><small>paradas</small></span>
                  <span><b>1</b><small>simulação</small></span>
                </div>
                <div className="spotlight-actions">
                  <button className="primary-button" onClick={() => { setLessonStep(0); setLessonOpen(true); }}>▶ Iniciar aula guiada</button>
                  <button className="circle-button" onClick={() => flash("Aula salva nos favoritos")} aria-label="Favoritar aula">☆</button>
                </div>
              </div>
              <div className="cell-visual" aria-label="Representação abstrata de uma célula e mitocôndria">
                <div className="orbit orbit-one"><i /><i /><i /></div>
                <div className="orbit orbit-two"><i /><i /></div>
                <div className="cell-core"><div className="mitochondria"><span /><span /><span /></div></div>
                <div className="energy-chip chip-one">ATP <b>+32</b></div>
                <div className="energy-chip chip-two">O₂ <b>{oxygen}%</b></div>
                <div className="visual-caption"><i /><span>MODELO INTERATIVO<small>Mitocôndria · Cadeia respiratória</small></span></div>
              </div>
            </section>

            <section className="section-heading">
              <div><p className="eyebrow">CINCO FORMAS DE INVESTIGAR</p><h2>Entre por um laboratório</h2></div>
              <button onClick={() => openCatalog("all")}>Ver todas as experiências <span>→</span></button>
            </section>

            <section className="labs-grid">
              {(Object.keys(modules) as ModuleKey[]).map((key) => {
                const info = modules[key];
                const count = topics.filter((topic) => topic.module === key).length;
                return (
                  <button key={key} className={`lab-card ${info.color}`} onClick={() => openCatalog(key)}>
                    <span className="lab-card-icon">{info.icon}</span>
                    <span className="lab-number">{String(count).padStart(2, "0")}</span>
                    <strong>{info.name}</strong>
                    <small>{info.short}</small>
                    <i>Explorar <b>→</b></i>
                  </button>
                );
              })}
            </section>
          </div>
        )}

        {view === "catalogo" && (
          <div className="page-content catalog-view">
            <section className="catalog-head">
              <div><p className="eyebrow">BANCO DE EXPERIÊNCIAS</p><h1>Explore os 150 tópicos</h1><p>Da curiosidade ao conceito: encontre o ponto de partida da próxima aula.</p></div>
              <button className="primary-button" onClick={() => setView("aulas")}>+ Criar roteiro</button>
            </section>
            <div className="module-filter">
              <button className={activeModule === "all" ? "active" : ""} onClick={() => setActiveModule("all")}>Todos <b>150</b></button>
              {(Object.keys(modules) as ModuleKey[]).map((key) => (
                <button key={key} className={activeModule === key ? "active" : ""} onClick={() => setActiveModule(key)}>{modules[key].name} <b>{topics.filter((topic) => topic.module === key).length}</b></button>
              ))}
            </div>
            <div className="catalog-toolbar"><span>{filteredTopics.length} resultados</span><span>Ordenado por <b>sequência original</b></span></div>
            <section className="topic-grid">
              {filteredTopics.map((topic) => {
                const info = modules[topic.module];
                return (
                  <article className={`topic-card ${info.color}`} key={topic.id}>
                    <button className="topic-open" onClick={() => setSelectedTopic(topic)}>
                      <span className="topic-index">{String(topic.id).padStart(3, "0")}</span>
                      <i className="topic-module">{info.icon} {info.name}</i>
                      <h3>{topic.title}</h3>
                      <p>{topicDescription(topic)}</p>
                      <small>{topic.category}</small>
                    </button>
                    <button className="topic-add" onClick={() => addToBuilder(topic)} aria-label={`Adicionar ${topic.title} ao roteiro`}>+</button>
                  </article>
                );
              })}
            </section>
            {filteredTopics.length === 0 && <div className="empty-state"><span>⌕</span><h2>Nenhuma experiência encontrada</h2><p>Tente buscar por outro conceito ou laboratório.</p></div>}
          </div>
        )}

        {view === "aulas" && (
          <div className="page-content builder-view">
            <section className="catalog-head">
              <div><p className="eyebrow">CRIADOR DE AULAS</p><h1>Monte um roteiro investigativo</h1><p>Combine fenômenos, perguntas e pausas. A teoria entra no momento certo.</p></div>
              <button className="secondary-button" onClick={() => openCatalog("all")}>+ Adicionar experiência</button>
            </section>
            <div className="builder-layout">
              <section className="lesson-canvas">
                <div className="lesson-title-row"><span className="lesson-badge">AULA 01</span><div><h2>Respiração celular em movimento</h2><p>Ensino Médio · 35 minutos · {builder.length} experiências</p></div><button>•••</button></div>
                <div className="timeline">
                  {builder.map((topic, index) => (
                    <article key={topic.id}>
                      <span className="timeline-number">{String(index + 1).padStart(2, "0")}</span>
                      <div className={`timeline-card ${modules[topic.module].color}`}>
                        <i>{modules[topic.module].icon}</i>
                        <span><small>{modules[topic.module].name} · {topic.category}</small><strong>{topic.title}</strong><p>{topicDescription(topic)}</p></span>
                        <button onClick={() => setBuilder((items) => items.filter((item) => item.id !== topic.id))} aria-label={`Remover ${topic.title}`}>×</button>
                      </div>
                    </article>
                  ))}
                  <button className="timeline-add" onClick={() => openCatalog("all")}><span>+</span> Adicionar bloco à aula</button>
                </div>
              </section>
              <aside className="builder-panel">
                <p className="eyebrow">CONFIGURAÇÃO</p>
                <label>Título da aula<input defaultValue="Respiração celular em movimento" /></label>
                <div className="form-row"><label>Série<select defaultValue="em"><option value="em">Ensino Médio</option><option>8º ano</option><option>9º ano</option></select></label><label>Duração<select defaultValue="35"><option value="35">35 min</option><option>50 min</option><option>90 min</option></select></label></div>
                <label>Modo<select defaultValue="Aula guiada"><option>Aula guiada</option><option>Atividade em grupo</option><option>Individual</option></select></label>
                <div className="builder-summary"><span><b>{builder.length}</b> experiências</span><span><b>{builder.length + 2}</b> perguntas</span><span><b>35</b> min</span></div>
                <button className="primary-button wide" onClick={() => flash("Roteiro salvo neste protótipo")}>Salvar roteiro</button>
                <button className="secondary-button wide" onClick={() => { setLessonStep(0); setLessonOpen(true); }}>▶ Apresentar agora</button>
              </aside>
            </div>
          </div>
        )}

        {view === "favoritos" && (
          <div className="page-content simple-view"><span className="giant-icon">☆</span><p className="eyebrow">COLEÇÃO PESSOAL</p><h1>Seus favoritos</h1><p>Você ainda não marcou experiências. Abra um tópico e use a estrela para guardar os melhores.</p><button className="primary-button" onClick={() => openCatalog("all")}>Explorar experiências</button></div>
        )}

        <nav className="mobile-nav" aria-label="Navegação móvel">
          <button className={view === "inicio" ? "active" : ""} onClick={() => setView("inicio")}><span>⌂</span>Início</button>
          <button className={view === "catalogo" ? "active" : ""} onClick={() => setView("catalogo")}><span>⌕</span>Explorar</button>
          <button className={view === "aulas" ? "active" : ""} onClick={() => setView("aulas")}><span>▤</span>Aulas</button>
          <button className={view === "favoritos" ? "active" : ""} onClick={() => setView("favoritos")}><span>☆</span>Salvos</button>
        </nav>
      </main>

      {selectedTopic && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedTopic(null); }}>
          <section className={`topic-modal ${modules[selectedTopic.module].color}`} role="dialog" aria-modal="true" aria-labelledby="topic-title">
            <button className="modal-close" onClick={() => setSelectedTopic(null)} aria-label="Fechar">×</button>
            <span className="modal-kicker">EXPERIÊNCIA {String(selectedTopic.id).padStart(3, "0")}</span>
            <div className="modal-lab"><i>{modules[selectedTopic.module].icon}</i>{modules[selectedTopic.module].name} · {selectedTopic.category}</div>
            <h2 id="topic-title">{selectedTopic.title}</h2>
            <p className="modal-lead">{topicDescription(selectedTopic)}</p>
            <div className="pedagogy-flow"><span><b>1</b>Problema</span><i>→</i><span><b>2</b>Hipótese</span><i>→</i><span><b>3</b>Ação</span><i>→</i><span><b>4</b>Reflexão</span></div>
            <div className="modal-detail-grid"><div><small>MODOS INDICADOS</small><strong>Aula guiada · Grupo</strong></div><div><small>DURAÇÃO</small><strong>20–35 minutos</strong></div><div><small>NÍVEL</small><strong>Adaptável</strong></div><div><small>FOCO</small><strong>Raciocínio causal</strong></div></div>
            <div className="modal-actions"><button className="primary-button" onClick={() => { if (selectedTopic.id >= 116 && selectedTopic.id <= 130) { setSelectedTopic(null); setLessonStep(0); setLessonOpen(true); } else { addToBuilder(selectedTopic); } }}>{selectedTopic.id >= 116 && selectedTopic.id <= 130 ? "▶ Testar experiência" : "+ Adicionar ao roteiro"}</button><button className="secondary-button" onClick={() => flash("Experiência favoritada")}>☆ Favoritar</button></div>
          </section>
        </div>
      )}

      {lessonOpen && (
        <div className="lesson-player" role="dialog" aria-modal="true" aria-label="Aula guiada de respiração celular">
          <header><button onClick={() => setLessonOpen(false)}>× <span>Sair da apresentação</span></button><div><strong>Respiração celular</strong><small>{lesson.kicker}</small></div><span>{lessonStep + 1} / {lessonSteps.length}</span></header>
          <div className="lesson-progress"><i style={{ width: `${((lessonStep + 1) / lessonSteps.length) * 100}%` }} /></div>
          <main className="lesson-stage">
            <section className="lesson-copy"><p>{lesson.kicker}</p><h2>{lesson.title}</h2><div className="lesson-question">{lesson.text}</div><aside><span>?</span><p><strong>Pausa para a turma</strong>{lesson.prompt}</p></aside></section>
            <section className="lesson-simulation">
              <div className={`demo-cell oxygen-${oxygen < 35 ? "low" : "high"}`}><div className="demo-mito"><span /><span /><span /><span /></div><i className="pulse p1" /><i className="pulse p2" /><i className="pulse p3" /></div>
              {lessonStep === 1 && <div className="hypothesis-buttons"><button className={hypothesis === "more" ? "active" : ""} onClick={() => setHypothesis("more")}>↑ Mais ATP</button><button className={hypothesis === "less" ? "active" : ""} onClick={() => setHypothesis("less")}>↓ Menos ATP</button><button className={hypothesis === "same" ? "active" : ""} onClick={() => setHypothesis("same")}>= Igual</button></div>}
              {lessonStep >= 2 && <div className="oxygen-control"><div><span>Oxigênio disponível</span><strong>{oxygen}%</strong></div><input type="range" min="0" max="100" value={oxygen} onChange={(event) => setOxygen(Number(event.target.value))} /><div className="atp-output"><span>Produção estimada</span><strong>{Math.max(2, Math.round(oxygen * 0.32))} ATP</strong></div></div>}
              {lessonStep === 0 && <div className="prediction-label">?</div>}
            </section>
          </main>
          <footer><button disabled={lessonStep === 0} onClick={() => setLessonStep((step) => Math.max(0, step - 1))}>← Anterior</button><div>{lessonSteps.map((_, index) => <i key={index} className={index === lessonStep ? "active" : index < lessonStep ? "done" : ""} />)}</div><button onClick={() => { if (lessonStep === lessonSteps.length - 1) { setLessonOpen(false); flash("Aula concluída — ótimo trabalho!"); } else setLessonStep((step) => step + 1); }}>{lessonStep === lessonSteps.length - 1 ? "Concluir aula" : "Próxima etapa →"}</button></footer>
        </div>
      )}

      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </div>
  );
}
