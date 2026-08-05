"use client";

import { useEffect, useMemo, useState } from "react";
import { contentFor } from "./activity-data";
import { ExperienceDemo as ResearchExperienceDemo } from "./experience-demo";

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
  { id: "guided", icon: "▶", label: "Apresentar aula", detail: "Abra o roteiro em tela cheia para os alunos", color: "cyan" },
  { id: "group", icon: "◎", label: "Atividade em grupo", detail: "Investigue e decida em equipe", color: "lime" },
  { id: "individual", icon: "◌", label: "Atividade individual", detail: "Cada aluno no próprio ritmo", color: "violet" },
  { id: "create", icon: "+", label: "Criar ou editar aula", detail: "Altere textos, ordem, tempo e experiências", color: "amber" },
] as const;

const lessonSteps = [
  { kicker: "01 · Problema", title: "Uma célula precisa produzir energia", text: "O oxigênio ficou escasso. O que você acha que acontecerá com a produção de ATP?", prompt: "Faça a turma prever antes de revelar o processo." },
  { kicker: "02 · Hipótese", title: "Registre uma previsão", text: "Com menos oxigênio, a célula produzirá mais, menos ou a mesma quantidade de ATP?", prompt: "Escolha uma hipótese para comparar com o resultado." },
  { kicker: "03 · Manipulação", title: "Controle o oxigênio", text: "Altere a disponibilidade de O₂ e observe como a mitocôndria responde.", prompt: "Arraste o controle e compare os cenários." },
  { kicker: "04 · Consequência", title: "A energia despenca", text: "Sem oxigênio suficiente, a cadeia respiratória desacelera e a produção de ATP diminui.", prompt: "Peça que os alunos expliquem a relação causal." },
  { kicker: "05 · Conceito", title: "Do fenômeno à ciência", text: "O oxigênio atua como aceptor final de elétrons. Quando falta, a fosforilação oxidativa é comprometida.", prompt: "Agora formalize o conceito e transfira para o exercício físico." },
];

function topicDescription(topic: Topic) {
  const content = contentFor(topic.title);
  if (!content) return "Experiência científica em revisão.";
  if ("phenomenon" in content) return content.phenomenon;
  if ("caseText" in content) return content.caseText;
  if ("mission" in content) return content.mission;
  if ("role" in content) return content.role;
  return content.scenario;
}

function topicQuestion(topic: Topic) {
  const content = contentFor(topic.title);
  return content?.question ?? "Que evidência permite explicar este fenômeno?";
}

function topicConcept(topic: Topic) {
  const content = contentFor(topic.title);
  return content?.concept ?? "Construa uma explicação apoiada nos dados observados.";
}

function topicWhatIf(topic: Topic) {
  const content = contentFor(topic.title);
  if (content && "controlA" in content) return `E se ${content.controlA.toLowerCase()} diminuísse enquanto ${content.controlB.toLowerCase()} aumentasse? Preveja antes de testar.`;
  return `E se uma das condições do caso “${topic.title}” fosse invertida? Qual evidência mudaria primeiro?`;
}

type LessonBlock = {
  id: string;
  topicId?: number;
  title: string;
  body: string;
  category: string;
  module: ModuleKey;
  minutes: number;
};

const initialLessonBlocks: LessonBlock[] = lessonSteps.map((step, index) => ({
  id: `respiracao-${index + 1}`,
  topicId: 116 + index,
  title: step.title,
  body: step.text,
  category: "Respiração celular",
  module: "biosim",
  minutes: index === 2 ? 10 : 5,
}));

function ExperienceDemo({ topic, compact = false }: { topic: Topic; compact?: boolean }) {
  const [primary, setPrimary] = useState(60);
  const [secondary, setSecondary] = useState(35);
  const [selectedEvidence, setSelectedEvidence] = useState<number[]>([]);
  const [answer, setAnswer] = useState("");
  const [storyStep, setStoryStep] = useState(0);
  const [trials, setTrials] = useState<Array<{ variable: number; result: number }>>([]);

  const output = Math.max(2, Math.round((primary * .38) - (secondary * .08)));
  const story = [
    `Você entra no fenômeno “${topic.title}”. O que observar primeiro?`,
    "Uma mudança aparece no sistema. Compare o antes e o depois.",
    "A evidência aponta para uma relação de causa e efeito.",
    "Agora formule uma explicação científica para o que aconteceu.",
  ];

  if (topic.module === "biosim") return (
    <div className={`experience-demo sim-demo ${compact ? "compact" : ""}`}>
      <div className="sim-visual" style={{ "--activity": `${primary}%`, "--stress": `${secondary}%` } as React.CSSProperties}>
        <div className="sim-cell"><div className="sim-organelle"><i /><i /><i /><i /></div></div>
        <span className="particle particle-a" /><span className="particle particle-b" /><span className="particle particle-c" />
        <div className="sim-reading"><small>Resposta do sistema</small><strong>{output} unidades</strong></div>
      </div>
      <div className="demo-controls">
        <label><span>Variável principal <b>{primary}%</b></span><input type="range" min="0" max="100" value={primary} onChange={(e) => setPrimary(Number(e.target.value))} /></label>
        <label><span>Fator de estresse <b>{secondary}%</b></span><input type="range" min="0" max="100" value={secondary} onChange={(e) => setSecondary(Number(e.target.value))} /></label>
        <p>Altere os controles e observe a resposta imediatamente. Tente explicar por que o resultado mudou.</p>
      </div>
    </div>
  );

  if (topic.module === "bioquest") {
    const clues = ["A mudança ocorre depois do fator ambiental.", "O grupo-controle não apresenta o mesmo efeito.", "O resultado se repete em três observações."];
    return (
      <div className={`experience-demo quest-demo ${compact ? "compact" : ""}`}>
        <div className="case-board"><span className="case-label">CASO EM INVESTIGAÇÃO</span><h3>{topic.title}</h3><p>Selecione as evidências relevantes e decida qual explicação é mais consistente.</p><div className="evidence-list">{clues.map((clue, index) => <button key={clue} className={selectedEvidence.includes(index) ? "selected" : ""} onClick={() => setSelectedEvidence((items) => items.includes(index) ? items.filter((item) => item !== index) : [...items, index])}><b>{index + 1}</b>{clue}</button>)}</div></div>
        <div className="decision-panel"><small>SUA CONCLUSÃO</small><button className={answer === "causal" ? "selected" : ""} onClick={() => setAnswer("causal")}>Existe relação causal</button><button className={answer === "coincidence" ? "selected" : ""} onClick={() => setAnswer("coincidence")}>É apenas coincidência</button><div className={`feedback ${answer && selectedEvidence.length >= 2 ? "show" : ""}`}>{answer && selectedEvidence.length >= 2 ? (answer === "causal" ? "Conclusão sustentada pelas evidências selecionadas." : "Revise: controle e repetição fortalecem uma relação causal.") : "Escolha ao menos duas evidências antes de concluir."}</div></div>
      </div>
    );
  }

  if (topic.module === "biochallenge") return (
    <div className={`experience-demo challenge-demo ${compact ? "compact" : ""}`}>
      <div className="mission-map"><span>MISSÃO</span><h3>{topic.title}</h3><div className="mission-score"><i style={{ width: `${primary}%` }} /><b>{primary} pontos de equilíbrio</b></div><div className="mission-nodes"><button onClick={() => setPrimary((v) => Math.min(100, v + 12))}>+ Proteger</button><button onClick={() => setPrimary((v) => Math.max(0, v - 8))}>Usar recurso</button><button onClick={() => setSecondary((v) => Math.min(100, v + 10))}>Investigar</button></div></div>
      <div className="mission-brief"><small>OBJETIVO</small><h4>Chegue a 85 pontos sem perder o controle do sistema.</h4><p>Cada decisão altera o cenário. Compare estratégias e justifique sua escolha final.</p><strong className={primary >= 85 ? "success" : ""}>{primary >= 85 ? "Missão concluída" : "Missão em andamento"}</strong></div>
    </div>
  );

  if (topic.module === "biostory") return (
    <div className={`experience-demo story-demo ${compact ? "compact" : ""}`}>
      <div className="story-scene"><span>CAPÍTULO {storyStep + 1} DE {story.length}</span><h3>{topic.title}</h3><p>{story[storyStep]}</p><div className="story-orbit"><i /><i /><i /></div></div>
      <div className="story-nav"><button disabled={storyStep === 0} onClick={() => setStoryStep((step) => step - 1)}>← Voltar</button><div>{story.map((_, index) => <i key={index} className={index === storyStep ? "active" : ""} />)}</div><button disabled={storyStep === story.length - 1} onClick={() => setStoryStep((step) => step + 1)}>Continuar →</button></div>
    </div>
  );

  const predicted = Math.round((primary * .7) + (secondary * .22));
  return (
    <div className={`experience-demo lab-demo ${compact ? "compact" : ""}`}>
      <div className="lab-bench"><span>EXPERIMENTO</span><h3>{topic.title}</h3><label>Variável independente <b>{primary}</b><input type="range" min="10" max="100" value={primary} onChange={(e) => setPrimary(Number(e.target.value))} /></label><label>Condição de controle <b>{secondary}</b><input type="range" min="0" max="80" value={secondary} onChange={(e) => setSecondary(Number(e.target.value))} /></label><button onClick={() => setTrials((items) => [...items, { variable: primary, result: predicted }])}>Coletar medição</button></div>
      <div className="data-table"><div><span>Teste</span><span>Variável</span><span>Resultado</span></div>{trials.length ? trials.map((trial, index) => <div key={`${trial.variable}-${index}`}><b>{index + 1}</b><span>{trial.variable}</span><strong>{trial.result}</strong></div>) : <p>Altere uma variável e colete a primeira medição.</p>}</div>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<ViewKey>("inicio");
  const [activeMode, setActiveMode] = useState<(typeof modeCards)[number]["id"]>("guided");
  const [activeModule, setActiveModule] = useState<ModuleKey | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [experienceTopic, setExperienceTopic] = useState<Topic | null>(null);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [lessonStep, setLessonStep] = useState(0);
  const [lessonPaused, setLessonPaused] = useState(false);
  const [lessonConceptVisible, setLessonConceptVisible] = useState(false);
  const [lessonLegendVisible, setLessonLegendVisible] = useState(false);
  const [lessonHighlight, setLessonHighlight] = useState(false);
  const [lessonWhatIfVisible, setLessonWhatIfVisible] = useState(false);
  const [oxygen] = useState(72);
  const [lessonTitle, setLessonTitle] = useState("Respiração celular: para onde vai a energia?");
  const [lessonGrade, setLessonGrade] = useState("Ensino Médio");
  const [lessonDuration, setLessonDuration] = useState(35);
  const [lessonMode, setLessonMode] = useState("Aula guiada");
  const [lessonBlocks, setLessonBlocks] = useState<LessonBlock[]>(initialLessonBlocks);
  const [lessonLoaded, setLessonLoaded] = useState(false);
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

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("biolab-lesson");
      if (saved) {
        const lessonData = JSON.parse(saved) as { title?: string; grade?: string; duration?: number; mode?: string; blocks?: LessonBlock[] };
        if (lessonData.title) setLessonTitle(lessonData.title);
        if (lessonData.grade) setLessonGrade(lessonData.grade);
        if (lessonData.duration) setLessonDuration(lessonData.duration);
        if (lessonData.mode) setLessonMode(lessonData.mode);
        if (lessonData.blocks?.length) setLessonBlocks(lessonData.blocks);
      }
    } catch { /* Mantém o roteiro inicial se o armazenamento estiver indisponível. */ }
    setLessonLoaded(true);
  }, []);

  useEffect(() => {
    if (!lessonLoaded) return;
    window.localStorage.setItem("biolab-lesson", JSON.stringify({ title: lessonTitle, grade: lessonGrade, duration: lessonDuration, mode: lessonMode, blocks: lessonBlocks }));
  }, [lessonBlocks, lessonDuration, lessonGrade, lessonLoaded, lessonMode, lessonTitle]);

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
    if (!lessonBlocks.some((item) => item.topicId === topic.id)) {
      setLessonBlocks((items) => [...items, { id: `topic-${topic.id}-${Date.now()}`, topicId: topic.id, title: topic.title, body: topicDescription(topic), category: topic.category, module: topic.module, minutes: 8 }]);
      flash("Experiência adicionada ao roteiro editável");
    } else flash("Esta experiência já está no roteiro");
  }

  function updateLessonBlock(id: string, patch: Partial<LessonBlock>) {
    setLessonBlocks((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function moveLessonBlock(index: number, direction: -1 | 1) {
    setLessonBlocks((items) => {
      const next = [...items];
      const target = index + direction;
      if (target < 0 || target >= next.length) return items;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addBlankBlock() {
    setLessonBlocks((items) => [...items, { id: `custom-${Date.now()}`, title: "Novo momento da aula", body: "Escreva aqui o que os alunos verão nesta etapa.", category: "Bloco personalizado", module: "biolab", minutes: 5 }]);
  }

  function startLesson() {
    if (!lessonBlocks.length) return flash("Adicione pelo menos um bloco antes de apresentar");
    setLessonStep(0);
    setLessonPaused(false);
    setLessonConceptVisible(false);
    setLessonLegendVisible(false);
    setLessonHighlight(false);
    setLessonWhatIfVisible(false);
    setLessonOpen(true);
  }

  function chooseMode(mode: (typeof modeCards)[number]["id"]) {
    setActiveMode(mode);
    if (mode === "guided") return startLesson();
    if (mode === "create") return setView("aulas");
    setView("catalogo");
    flash(mode === "group" ? "Escolha uma experiência para abrir em grupo" : "Escolha uma experiência para o aluno testar");
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

  const lesson = lessonBlocks[lessonStep] ?? initialLessonBlocks[0];
  const lessonTopic = lesson.topicId ? topics.find((topic) => topic.id === lesson.topicId) ?? null : null;

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
          <p>BLOCOS PARA AS AULAS</p>
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
                <h1>Escolha o que você quer fazer</h1>
                <p>Apresente seu roteiro ou abra uma experiência dos cinco laboratórios.</p>
              </div>
              <button className="secondary-button" onClick={() => setView("aulas")}><span>▤</span> Ver meus roteiros</button>
            </section>

            <section className="mode-grid" aria-label="Modos de uso">
              {modeCards.map((mode) => (
                <button key={mode.id} className={`mode-card ${mode.color} ${activeMode === mode.id ? "selected" : ""}`} onClick={() => chooseMode(mode.id)}>
                  <span className="mode-icon">{mode.icon}</span>
                  <span><strong>{mode.label}</strong><small>{mode.detail}</small></span>
                  <i>↗</i>
                </button>
              ))}
            </section>

            <section className="spotlight">
              <div className="spotlight-copy">
                <span className="live-tag"><i /> SEU ROTEIRO ATUAL · {lessonDuration} MIN</span>
                <p className="spotlight-path">{lessonGrade} <b>›</b> {lessonMode} <b>›</b> Editável</p>
                <h2>{lessonTitle}</h2>
                <p>Este cartão acompanha todas as alterações feitas no criador de aulas. Edite os blocos e apresente quando estiver pronto.</p>
                <div className="spotlight-meta">
                  <span><b>{lessonBlocks.length}</b><small>etapas</small></span>
                  <span><b>{lessonBlocks.filter((block) => block.module === "biosim").length}</b><small>simulações</small></span>
                  <span><b>{lessonDuration}</b><small>minutos</small></span>
                </div>
                <div className="spotlight-actions">
                  <button className="primary-button" onClick={startLesson}>▶ Apresentar aos alunos</button>
                  <button className="secondary-button dark" onClick={() => setView("aulas")}>Editar roteiro</button>
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
              <div><p className="eyebrow">BLOCOS CIENTÍFICOS</p><h2>Combine experiências dentro da aula</h2></div>
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
                <div className="lesson-title-row"><span className="lesson-badge">ROTEIRO EDITÁVEL</span><div><h2>{lessonTitle}</h2><p>{lessonGrade} · {lessonDuration} minutos · {lessonBlocks.length} etapas</p></div><button onClick={addBlankBlock}>+ Bloco</button></div>
                <div className="timeline">
                  {lessonBlocks.map((block, index) => (
                    <article key={block.id}>
                      <span className="timeline-number">{String(index + 1).padStart(2, "0")}</span>
                      <div className={`timeline-card editable ${modules[block.module].color}`}>
                        <i>{modules[block.module].icon}</i>
                        <span className="block-editor"><small>{modules[block.module].name} · {block.category}</small><input value={block.title} onChange={(event) => updateLessonBlock(block.id, { title: event.target.value })} aria-label={`Título da etapa ${index + 1}`} /><textarea value={block.body} onChange={(event) => updateLessonBlock(block.id, { body: event.target.value })} aria-label={`Texto da etapa ${index + 1}`} /><label>Tempo <input type="number" min="1" max="60" value={block.minutes} onChange={(event) => updateLessonBlock(block.id, { minutes: Math.max(1, Number(event.target.value)) })} /> min</label></span>
                        <div className="block-actions"><button disabled={index === 0} onClick={() => moveLessonBlock(index, -1)} aria-label="Mover etapa para cima">↑</button><button disabled={index === lessonBlocks.length - 1} onClick={() => moveLessonBlock(index, 1)} aria-label="Mover etapa para baixo">↓</button><button onClick={() => setLessonBlocks((items) => items.filter((item) => item.id !== block.id))} aria-label={`Remover ${block.title}`}>×</button></div>
                      </div>
                    </article>
                  ))}
                  <div className="timeline-add-row"><button className="timeline-add" onClick={addBlankBlock}><span>+</span> Criar bloco livre</button><button className="timeline-add" onClick={() => openCatalog("all")}><span>+</span> Adicionar experiência</button></div>
                </div>
              </section>
              <aside className="builder-panel">
                <p className="eyebrow">CONFIGURAÇÃO</p>
                <label>Título da aula<input value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} /></label>
                <div className="form-row"><label>Série<select value={lessonGrade} onChange={(event) => setLessonGrade(event.target.value)}><option>Ensino Médio</option><option>8º ano</option><option>9º ano</option></select></label><label>Duração<input type="number" min="10" max="180" value={lessonDuration} onChange={(event) => setLessonDuration(Math.max(10, Number(event.target.value)))} /></label></div>
                <label>Modo<select value={lessonMode} onChange={(event) => setLessonMode(event.target.value)}><option>Aula guiada</option><option>Atividade em grupo</option><option>Individual</option></select></label>
                <div className="builder-summary"><span><b>{lessonBlocks.length}</b> etapas</span><span><b>{lessonBlocks.filter((block) => block.topicId).length}</b> experiências</span><span><b>{lessonBlocks.reduce((total, block) => total + block.minutes, 0)}</b> min</span></div>
                <button className="primary-button wide" onClick={() => flash("Roteiro salvo automaticamente neste dispositivo")}>Salvar roteiro</button>
                <button className="secondary-button wide" onClick={startLesson}>▶ Apresentar aos alunos</button>
                <button className="text-button wide" onClick={() => { setLessonTitle("Nova aula investigativa"); setLessonBlocks([{ id: `new-${Date.now()}`, title: "Pergunta inicial", body: "Escreva a pergunta que abrirá a aula.", category: "Bloco personalizado", module: "biolab", minutes: 5 }]); }}>Criar roteiro em branco</button>
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
            <div className="modal-driving-question"><small>PERGUNTA QUE GUIA A EXPERIÊNCIA</small><strong>{topicQuestion(selectedTopic)}</strong></div>
            <div className="modal-detail-grid"><div><small>MODOS INDICADOS</small><strong>Aula guiada · Grupo</strong></div><div><small>DURAÇÃO</small><strong>20–35 minutos</strong></div><div><small>NÍVEL</small><strong>Adaptável</strong></div><div><small>CONCEITO-ALVO</small><strong>{topicConcept(selectedTopic)}</strong></div></div>
            <div className="modal-actions"><button className="primary-button" onClick={() => { setExperienceTopic(selectedTopic); setSelectedTopic(null); }}>▶ Abrir experiência</button><button className="secondary-button" onClick={() => addToBuilder(selectedTopic)}>+ Adicionar ao roteiro</button><button className="secondary-button" onClick={() => flash("Experiência favoritada")}>☆</button></div>
          </section>
        </div>
      )}

      {experienceTopic && (
        <div className={`experience-player ${modules[experienceTopic.module].color}`} role="dialog" aria-modal="true" aria-label={`Experiência ${experienceTopic.title}`}>
          <header><button onClick={() => setExperienceTopic(null)}>× <span>Fechar experiência</span></button><div><small>{modules[experienceTopic.module].name} · {experienceTopic.category}</small><strong>{experienceTopic.title}</strong></div><button className="add-player-button" onClick={() => addToBuilder(experienceTopic)}>+ Roteiro</button></header>
          <main><div className="experience-intro"><span>EXPERIÊNCIA {String(experienceTopic.id).padStart(3, "0")}</span><h2>{experienceTopic.title}</h2><p>{topicDescription(experienceTopic)}</p><strong>{topicQuestion(experienceTopic)}</strong></div><ResearchExperienceDemo key={experienceTopic.id} topic={experienceTopic} /></main>
        </div>
      )}

      {lessonOpen && (
        <div className="lesson-player" role="dialog" aria-modal="true" aria-label={`Aula guiada ${lessonTitle}`}>
          <header><button onClick={() => setLessonOpen(false)}>× <span>Sair da apresentação</span></button><div><strong>{lessonTitle}</strong><small>{lessonGrade} · {lessonMode}</small></div><span>{lessonStep + 1} / {lessonBlocks.length}</span></header>
          <div className="lesson-progress"><i style={{ width: `${((lessonStep + 1) / lessonBlocks.length) * 100}%` }} /></div>
          <nav className="teacher-tools" aria-label="Controles do professor"><span>CONTROLE DO PROFESSOR</span><button className={lessonPaused ? "active" : ""} onClick={() => setLessonPaused((value) => !value)}>{lessonPaused ? "▶ Retomar" : "Ⅱ Pausar"}</button><button className={lessonConceptVisible ? "active" : ""} onClick={() => setLessonConceptVisible((value) => !value)}>Conceito</button><button className={lessonLegendVisible ? "active" : ""} onClick={() => setLessonLegendVisible((value) => !value)}>Legenda</button><button className={lessonHighlight ? "active" : ""} onClick={() => setLessonHighlight((value) => !value)}>Destacar</button><button className={lessonWhatIfVisible ? "active" : ""} onClick={() => setLessonWhatIfVisible((value) => !value)}>E se...?</button></nav>
          <main className={`lesson-stage ${lessonHighlight ? "highlighted" : ""}`}>
            <section className="lesson-copy"><p>ETAPA {String(lessonStep + 1).padStart(2, "0")}</p><h2>{lesson.title}</h2><div className="lesson-question">{lesson.body}</div>{lessonLegendVisible && <aside className="student-legend"><span>{lessonTopic ? modules[lessonTopic.module].icon : "✎"}</span><p><strong>{lessonTopic ? `${modules[lessonTopic.module].name} · ${lessonTopic.category}` : "Bloco do professor"}</strong>{lessonTopic ? topicDescription(lessonTopic) : "Momento de fala, discussão ou registro definido no roteiro."}</p></aside>}{lessonWhatIfVisible && lessonTopic && <aside className="what-if-card"><span>?</span><p><strong>E se...?</strong>{topicWhatIf(lessonTopic)}</p></aside>}{lessonConceptVisible && lessonTopic && <aside className="concept-card"><span>∴</span><p><strong>Explicação científica</strong>{topicConcept(lessonTopic)}</p></aside>}</section>
            <section className="lesson-simulation">
              {lessonTopic ? <ResearchExperienceDemo key={`${lesson.id}-${lessonStep}`} topic={lessonTopic} compact /> : <div className="lesson-custom-block"><span>BLOCO CRIADO PELO PROFESSOR</span><h3>{lesson.title}</h3><p>Use esta etapa para discussão, registro no quadro ou uma atividade externa. Adicione uma experiência do catálogo quando quiser incluir uma interação.</p></div>}
            </section>
            {lessonPaused && <div className="lesson-paused"><span>Ⅱ</span><h3>Aula pausada</h3><p>A tela permanece limpa enquanto a turma discute.</p></div>}
          </main>
          <footer><button disabled={lessonStep === 0 || lessonPaused} onClick={() => { setLessonConceptVisible(false); setLessonWhatIfVisible(false); setLessonStep((step) => Math.max(0, step - 1)); }}>← Anterior</button><div>{lessonBlocks.map((_, index) => <i key={index} className={index === lessonStep ? "active" : index < lessonStep ? "done" : ""} />)}</div><button disabled={lessonPaused} onClick={() => { setLessonConceptVisible(false); setLessonWhatIfVisible(false); if (lessonStep === lessonBlocks.length - 1) { setLessonOpen(false); flash("Apresentação concluída"); } else setLessonStep((step) => step + 1); }}>{lessonStep === lessonBlocks.length - 1 ? "Encerrar" : "Próxima etapa →"}</button></footer>
        </div>
      )}

      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </div>
  );
}
