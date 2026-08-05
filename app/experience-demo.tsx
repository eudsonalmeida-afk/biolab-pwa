"use client";

import { useMemo, useState } from "react";
import {
  ActivityTopic,
  ChallengeContent,
  LabContent,
  QuestContent,
  SimContent,
  StoryContent,
  challengeContent,
  labContent,
  questContent,
  simContent,
  storyContent,
} from "./activity-data";

function level(value: number) {
  if (value < 34) return "baixo";
  if (value < 68) return "intermediário";
  return "alto";
}

function direction(label: string) {
  return /dano|falha|inibi|custo|atrito|vazamento|fragmenta|distância|isolamento|resistência|pressão de tempo|demanda|tempo em meias|rigidez|desalinhamento|estresse/i.test(label) ? -1 : 1;
}

function SimExperience({ content, compact }: { content: SimContent; compact: boolean }) {
  const [a, setA] = useState(55);
  const [b, setB] = useState(45);
  const [revealed, setRevealed] = useState(false);
  const result = Math.max(4, Math.min(96, Math.round(50 + ((a - 50) * direction(content.controlA) * .62) + ((b - 50) * direction(content.controlB) * .48))));

  const setLevel = (setter: (value: number) => void, value: number) => setter(value);
  const discrete = content.mechanic === "sequence" || content.mechanic === "system" || content.mechanic === "organ";

  return (
    <div className={`experience-demo concept-experience sim-demo mechanic-${content.mechanic} ${compact ? "compact" : ""}`}>
      <section className="focus-card">
        <span className="phase-label">1 · OBSERVE</span>
        <p>{content.phenomenon}</p>
        <h3>{content.question}</h3>
      </section>

      <section className="specific-simulator" aria-label={`Modelo conceitual de ${content.output}`}>
        <div className="sim-model" style={{ "--model-value": `${result}%`, "--control-a": `${a}%`, "--control-b": `${b}%` } as React.CSSProperties}>
          <span className="model-badge">MODELO CONCEITUAL · {content.mechanic.toUpperCase()}</span>
          <div className="model-path">
            <div><i className="node-a" /><small>{content.controlA}</small><strong>{level(a)}</strong></div>
            <b>→</b>
            <div><i className="node-b" /><small>{content.controlB}</small><strong>{level(b)}</strong></div>
            <b>→</b>
            <div className="output-node"><i /><small>{content.output}</small><strong>{result}% relativo</strong></div>
          </div>
          <div className="model-meter"><i /></div>
          <p>Compare tendências; os valores representam um modelo didático, não uma medição clínica ou laboratorial.</p>
        </div>

        <div className="specific-controls">
          <span className="phase-label">2 · INVESTIGUE</span>
          {[{ label: content.controlA, value: a, setter: setA }, { label: content.controlB, value: b, setter: setB }].map((control) => discrete ? (
            <fieldset key={control.label}>
              <legend>{control.label} <b>{level(control.value)}</b></legend>
              <div className="level-buttons">
                {[20, 50, 80].map((value) => <button key={value} className={level(control.value) === level(value) ? "selected" : ""} onClick={() => setLevel(control.setter, value)}>{level(value)}</button>)}
              </div>
            </fieldset>
          ) : (
            <label key={control.label}>
              <span>{control.label}<b>{level(control.value)}</b></span>
              <input aria-label={control.label} type="range" min="0" max="100" value={control.value} onChange={(event) => control.setter(Number(event.target.value))} />
            </label>
          ))}
          <p className="live-explanation">Com <b>{content.controlA.toLowerCase()}</b> em nível {level(a)} e <b>{content.controlB.toLowerCase()}</b> em nível {level(b)}, o modelo prevê <b>{content.output.toLowerCase()}</b> em nível {level(result)}.</p>
        </div>
      </section>

      <section className={`concept-reveal ${revealed ? "revealed" : ""}`}>
        <span className="phase-label">3 · EXPLIQUE</span>
        {!revealed ? <button onClick={() => setRevealed(true)}>Revelar explicação científica</button> : <><h4>O que o modelo representa</h4><p>{content.concept}</p><aside><b>Cuidado com esta ideia:</b> {content.misconception}</aside></>}
      </section>
      <a className="science-source" href={content.source.url} target="_blank" rel="noreferrer">Base científica: {content.source.label} ↗</a>
    </div>
  );
}

function QuestExperience({ content, compact }: { content: QuestContent; compact: boolean }) {
  const [selected, setSelected] = useState<number[]>([]);
  const [hypothesis, setHypothesis] = useState<number | null>(null);
  const relevantSelected = selected.filter((index) => content.evidence[index]?.relevant).length;
  const canConclude = relevantSelected >= 2;

  return (
    <div className={`experience-demo concept-experience quest-demo ${compact ? "compact" : ""}`}>
      <section className="focus-card"><span className="phase-label">1 · O CASO</span><p>{content.caseText}</p><h3>{content.question}</h3></section>
      <div className="quest-workspace">
        <section className="case-board">
          <span className="phase-label">2 · SEPARE EVIDÊNCIA DE DISTRAÇÃO</span>
          <div className="evidence-list">{content.evidence.map((item, index) => <button key={item.text} className={selected.includes(index) ? "selected" : ""} onClick={() => { setHypothesis(null); setSelected((items) => items.includes(index) ? items.filter((itemIndex) => itemIndex !== index) : [...items, index]); }}><b>{index + 1}</b><span>{item.text}</span></button>)}</div>
          <p>{selected.length === 0 ? "Escolha dados que realmente ajudam a diferenciar as explicações." : `${relevantSelected} evidência(s) relevante(s) selecionada(s).`}</p>
        </section>
        <section className="decision-panel">
          <span className="phase-label">3 · CONCLUA</span>
          <p>Qual hipótese explica melhor o conjunto de dados?</p>
          {content.hypotheses.map((item, index) => <button key={item.text} disabled={!canConclude} className={hypothesis === index ? "selected" : ""} onClick={() => setHypothesis(index)}>{item.text}</button>)}
          {!canConclude && <small>Selecione ao menos duas evidências relevantes para liberar a conclusão.</small>}
          {hypothesis !== null && <div className={`feedback show ${content.hypotheses[hypothesis].correct ? "correct" : "review"}`}>{content.hypotheses[hypothesis].feedback}</div>}
        </section>
      </div>
      {hypothesis !== null && <section className="concept-reveal revealed"><h4>Conceito para transferir</h4><p>{content.concept}</p><aside><b>Concepção a revisar:</b> {content.misconception}</aside></section>}
      <a className="science-source" href={content.source.url} target="_blank" rel="noreferrer">Base científica: {content.source.label} ↗</a>
    </div>
  );
}

function ChallengeExperience({ content, compact }: { content: ChallengeContent; compact: boolean }) {
  const [chosen, setChosen] = useState<number[]>([]);
  const coherence = chosen.reduce((total, index) => total + content.actions[index].effect, 50);
  const completed = chosen.length >= 2;
  return (
    <div className={`experience-demo concept-experience challenge-demo ${compact ? "compact" : ""}`}>
      <section className="focus-card"><span className="phase-label">1 · DECISÃO CIENTÍFICA</span><p>{content.mission}</p><h3>{content.question}</h3></section>
      <div className="strategy-board">
        <section>
          <span className="phase-label">2 · MONTE SUA ESTRATÉGIA</span>
          <p>Escolha ações e examine a consequência biológica de cada uma.</p>
          <div className="strategy-actions">{content.actions.map((action, index) => <button key={action.label} className={chosen.includes(index) ? "selected" : ""} onClick={() => setChosen((items) => items.includes(index) ? items.filter((item) => item !== index) : [...items, index])}><strong>{action.label}</strong>{chosen.includes(index) && <small>{action.explanation}</small>}</button>)}</div>
        </section>
        <aside>
          <small>COERÊNCIA DA ESTRATÉGIA</small>
          <div className="coherence-meter"><i style={{ width: `${Math.max(8, Math.min(96, coherence))}%` }} /></div>
          <strong>{coherence >= 75 ? "Coerente com o sistema" : coherence < 45 ? "Produz efeito contrário" : "Ainda incompleta"}</strong>
          <p>A barra organiza a comparação; não é pontuação nem competição.</p>
        </aside>
      </div>
      {completed && <section className="concept-reveal revealed"><span className="phase-label">3 · JUSTIFIQUE</span><h4>Critério de sucesso</h4><p>{content.success}</p></section>}
      <a className="science-source" href={content.source.url} target="_blank" rel="noreferrer">Base científica: {content.source.label} ↗</a>
    </div>
  );
}

function StoryExperience({ content, compact }: { content: StoryContent; compact: boolean }) {
  const [step, setStep] = useState(0);
  const atConcept = step === content.steps.length;
  return (
    <div className={`experience-demo concept-experience story-demo ${compact ? "compact" : ""}`}>
      <section className="story-frame">
        <div className="story-context"><span className="phase-label">PONTO DE VISTA</span><p>{content.role}</p><h3>{content.question}</h3></div>
        <div className="story-scene">
          <span>ETAPA {step + 1} DE {content.steps.length + 1}</span>
          {!atConcept ? <><small>{content.steps[step].title}</small><p>{content.steps[step].body}</p><div className="story-route"><i /><b>→</b><i /><b>→</b><i /></div></> : <><small>MODELO MENTAL</small><p>{content.concept}</p><div className="story-route complete"><i /><b>✓</b><i /><b>✓</b><i /></div></>}
        </div>
      </section>
      <div className="story-nav"><button disabled={step === 0} onClick={() => setStep((value) => value - 1)}>← Voltar</button><div>{[...content.steps, { title: "Conceito", body: "" }].map((_, index) => <i key={index} className={index === step ? "active" : index < step ? "done" : ""} />)}</div><button disabled={atConcept} onClick={() => setStep((value) => value + 1)}>{step === content.steps.length - 1 ? "Construir conceito →" : "Continuar →"}</button></div>
      <a className="science-source" href={content.source.url} target="_blank" rel="noreferrer">Base científica: {content.source.label} ↗</a>
    </div>
  );
}

function LabExperience({ content, compact }: { content: LabContent; compact: boolean }) {
  const [prediction, setPrediction] = useState<number | null>(null);
  const [trials, setTrials] = useState<Array<{ level: string; result: number }>>([]);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const value = useMemo(() => Math.max(8, Math.min(94, 22 + selectedLevel * 29 + ((trials.length * 7) % 11))), [selectedLevel, trials.length]);
  const addTrial = () => setTrials((items) => [...items, { level: content.levels[selectedLevel], result: value }]);
  return (
    <div className={`experience-demo concept-experience lab-demo ${compact ? "compact" : ""}`}>
      <section className="focus-card"><span className="phase-label">1 · PERGUNTA TESTÁVEL</span><p>{content.scenario}</p><h3>{content.question}</h3></section>
      <div className="lab-workspace">
        <section className="lab-bench">
          <span className="phase-label">2 · PLANEJE E COLETE</span>
          <label>Variável independente<strong>{content.independent}</strong></label>
          <div className="level-buttons">{content.levels.map((item, index) => <button key={item} className={selectedLevel === index ? "selected" : ""} onClick={() => setSelectedLevel(index)}>{item}</button>)}</div>
          <label>Variável dependente<strong>{content.dependent}</strong></label>
          <div className="prediction-row"><span>Antes de medir, em qual condição você prevê o maior resultado?</span>{content.levels.map((item, index) => <button key={item} className={prediction === index ? "selected" : ""} onClick={() => setPrediction(index)}>{item}</button>)}</div>
          <button className="collect-button" disabled={prediction === null} onClick={addTrial}>Coletar medição em {content.levels[selectedLevel]}</button>
          <aside><b>Comparação justa:</b> {content.method}</aside>
        </section>
        <section className="data-table">
          <span className="phase-label">3 · LEIA OS DADOS</span>
          <div><span>Teste</span><span>{content.independent}</span><span>{content.dependent}</span></div>
          {trials.map((trial, index) => <div key={`${trial.level}-${index}`}><b>{index + 1}</b><span>{trial.level}</span><strong>{trial.result}% relativo</strong></div>)}
          {!trials.length && <p>Registre sua previsão para liberar a primeira medição.</p>}
          {trials.length >= 3 && <aside><b>Interprete:</b> {content.concept}</aside>}
        </section>
      </div>
      <a className="science-source" href={content.source.url} target="_blank" rel="noreferrer">Base científica: {content.source.label} ↗</a>
    </div>
  );
}

export function ExperienceDemo({ topic, compact = false }: { topic: ActivityTopic; compact?: boolean }) {
  if (topic.module === "biosim") return <SimExperience content={simContent[topic.title]} compact={compact} />;
  if (topic.module === "bioquest") return <QuestExperience content={questContent[topic.title]} compact={compact} />;
  if (topic.module === "biochallenge") return <ChallengeExperience content={challengeContent[topic.title]} compact={compact} />;
  if (topic.module === "biostory") return <StoryExperience content={storyContent[topic.title]} compact={compact} />;
  return <LabExperience content={labContent[topic.title]} compact={compact} />;
}

