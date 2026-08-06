import type { QuestContent, QuestStage, ScientificSource } from "./activity-data";

const sources: Record<string, ScientificSource> = {
  microbiology: { label: "CDC · Microbiologia e resistência", url: "https://www.cdc.gov/antimicrobial-resistance/about/index.html" },
  ecology: { label: "NASA Earth Observatory · Ecossistemas", url: "https://earthobservatory.nasa.gov/features/CarbonCycle" },
  inquiry: { label: "National Academies · Science Investigation", url: "https://nap.nationalacademies.org/resource/25216/interactive/2/" },
  physiology: { label: "NCBI Bookshelf · Human Physiology", url: "https://www.ncbi.nlm.nih.gov/books/NBK538143/" },
};

type CaseConfig = {
  title: string;
  caseText: string;
  question: string;
  concept: string;
  misconception: string;
  source: keyof typeof sources;
  evidence: Array<{ text: string; relevant: boolean; strength: "strong" | "moderate" | "ambiguous" | "weak" }>;
  correct: string;
  distractor: string;
  surprise: string;
  revision: string;
  transfer: string;
};

function option(text: string, correct: boolean, feedback: string) {
  return { text, correct, feedback };
}

function stagesFor(item: CaseConfig): QuestStage[] {
  return [
    {
      id: "problema",
      phase: "01 · PROBLEMA",
      kind: "case",
      title: "Observe antes de nomear",
      body: item.caseText,
      prompt: item.question,
      teacherNote: "Peça uma descrição do que aparece no caso. Ainda não revele o conceito.",
    },
    {
      id: "recuperacao",
      phase: "02 · RECUPERAÇÃO",
      kind: "retrieval",
      title: "O que já podemos afirmar?",
      body: "Registre uma observação do caso e uma relação causal que você considera possível.",
      prompt: "Qual pista deve orientar a investigação primeiro?",
      options: [
        option("A descrição do padrão observado", true, "Boa escolha: começar pelo padrão evita saltar direto para um nome científico."),
        option("A explicação mais familiar", false, "Uma explicação familiar pode ser uma hipótese, mas ainda precisa ser testada."),
        option("A opinião de quem observou o caso", false, "A opinião ajuda a gerar hipóteses; a evidência é que permite compará-las."),
      ],
    },
    {
      id: "hipotese",
      phase: "03 · HIPÓTESE",
      kind: "hypothesis",
      title: "Faça uma previsão",
      body: "Escolha uma explicação provisória e indique sua confiança. A hipótese poderá ser revisada.",
      prompt: "Qual hipótese explica melhor o que foi observado até agora?",
      options: [
        option(item.correct, true, `Hipótese promissora. ${item.concept}`),
        option(item.distractor, false, `É uma possibilidade inicial, mas ainda não explica as evidências. ${item.misconception}`),
      ],
    },
    {
      id: "evidencias",
      phase: "04 · EVIDÊNCIAS",
      kind: "evidence",
      title: "Leia os dados em etapas",
      body: "Selecione as principais evidências. Diferencie um dado forte de uma coincidência ou de uma informação insuficiente.",
      prompt: "INDIQUE AS PRINCIPAIS EVIDÊNCIAS",
      evidence: item.evidence,
      teacherNote: "Pergunte: qual evidência diferencia as duas hipóteses? Qual ainda é ambígua?",
    },
    {
      id: "conclusao",
      phase: "05 · CONCLUSÃO PROVISÓRIA",
      kind: "selection",
      title: "Conecte dado e explicação",
      body: "Use o conjunto de evidências selecionado para construir uma conclusão provisória.",
      prompt: "Qual explicação é mais consistente com os dados?",
      options: [
        option(item.correct, true, "A conclusão está apoiada por evidências relevantes, mas ainda é provisória."),
        option(item.distractor, false, "Essa conclusão deixa evidências importantes sem explicação. Volte aos dados."),
      ],
    },
    {
      id: "surpresa",
      phase: "06 · SURPRESA",
      kind: "surprise",
      title: "Uma nova evidência muda o quadro",
      body: item.surprise,
      prompt: "O que essa informação muda na sua explicação?",
      options: [
        option("Ela exige ajustar a explicação, sem abandonar tudo que já foi sustentado.", true, "Revisar uma hipótese é parte do raciocínio científico."),
        option("Ela prova que a primeira hipótese estava totalmente errada.", false, "Uma evidência nova pode limitar ou modificar uma hipótese sem apagar todos os dados anteriores."),
      ],
    },
    {
      id: "revisao",
      phase: "07 · REVISÃO",
      kind: "revision",
      title: "Revise seu modelo mental",
      body: "Compare a previsão inicial com a explicação que agora melhor acomoda as evidências.",
      prompt: "Como você reformularia sua hipótese em uma frase?",
      options: [
        option(item.revision, true, "Revisão coerente: ela preserva os dados fortes e incorpora a surpresa."),
        option("Nada precisa ser alterado porque a primeira resposta já foi registrada.", false, "Uma hipótese não fica protegida por ter sido registrada; ela deve responder aos novos dados."),
      ],
    },
    {
      id: "formalizacao",
      phase: "08 · CONCEITO",
      kind: "formalization",
      title: "Nomeie depois de investigar",
      body: item.concept,
      prompt: "Agora conecte a linguagem científica ao raciocínio que você construiu.",
    },
    {
      id: "transferencia",
      phase: "09 · TRANSFERÊNCIA",
      kind: "transfer",
      title: "Leve a ideia para outro contexto",
      body: item.transfer,
      prompt: "Que evidência você procuraria antes de tomar uma decisão nesse novo caso?",
      options: [
        option("Eu procuraria um padrão comparável, um controle e uma medida repetida.", true, "Transferência forte: você levou o modo de investigar, não apenas o nome do conceito."),
        option("Eu escolheria a explicação que parece mais intuitiva.", false, "Intuição pode gerar hipóteses, mas não substitui comparação e evidência."),
      ],
    },
  ];
}

const cases: CaseConfig[] = [
  {
    title: "Resistência bacteriana",
    caseText: "Após vários ciclos de antibiótico, uma população bacteriana volta a crescer.",
    question: "O que está mudando na população: o paciente ou a frequência de variantes bacterianas?",
    concept: "A pressão seletiva reduz suscetíveis e aumenta a frequência de variantes resistentes; genes também podem se espalhar horizontalmente.",
    misconception: "Quem se torna resistente é a bactéria, não o corpo do paciente.", source: "microbiology",
    evidence: [
      { text: "Antes do tratamento, poucas colônias sobrevivem a uma dose-teste.", relevant: true, strength: "strong" },
      { text: "O antibiótico elimina sobretudo as bactérias suscetíveis.", relevant: true, strength: "strong" },
      { text: "As sobreviventes deixam mais descendentes após o tratamento.", relevant: true, strength: "strong" },
      { text: "O paciente relata que o remédio pareceu mais fraco.", relevant: false, strength: "weak" },
    ],
    correct: "O antibiótico selecionou variantes resistentes que já estavam presentes ou surgiram por variação.",
    distractor: "O corpo do paciente se acostumou ao antibiótico.", surprise: "Uma bactéria resistente transfere um plasmídeo para outra espécie no mesmo ambiente.",
    revision: "A seleção explica a mudança na frequência, e a transferência horizontal pode acelerar a disseminação do gene.",
    transfer: "Uma infecção hospitalar reaparece depois de um tratamento. Como comparar resistência, adesão ao tratamento e reinfecção?",
  },
  {
    title: "Crescimento bacteriano",
    caseText: "Uma cultura cresce rapidamente, estabiliza e depois perde células viáveis em um frasco fechado.",
    question: "O platô indica que todas as bactérias pararam de se reproduzir?",
    concept: "Em uma cultura fechada, divisão e morte se equilibram quando nutrientes diminuem e resíduos se acumulam.",
    misconception: "Fase estacionária não significa que todas as células estejam inativas.", source: "microbiology",
    evidence: [
      { text: "A contagem aumenta exponencialmente no início.", relevant: true, strength: "strong" },
      { text: "Nutrientes caem e resíduos aumentam antes do platô.", relevant: true, strength: "strong" },
      { text: "Ao transferir células para meio novo, o crescimento recomeça.", relevant: true, strength: "strong" },
      { text: "O frasco fica visualmente mais turvo.", relevant: false, strength: "ambiguous" },
    ],
    correct: "O platô resulta do balanço entre divisão e morte sob recursos limitados.",
    distractor: "As bactérias decidem não se dividir quando atingem um número ideal.", surprise: "A contagem total fica estável, mas a contagem de células vivas cai lentamente.",
    revision: "É preciso distinguir número total, viabilidade e taxa de divisão; o sistema pode mudar mesmo sem mudar a turbidez.",
    transfer: "Uma cultura de levedura parou de produzir gás. Que medida separa falta de substrato, temperatura e morte celular?",
  },
  {
    title: "Ciclo de vida de um vírus",
    caseText: "Células expostas a partículas virais passam a produzir novas partículas.",
    question: "Como a célula hospedeira participa da produção viral?",
    concept: "Ligação, entrada, replicação, montagem e saída formam um ciclo dependente da célula hospedeira.",
    misconception: "Vírus não são pequenas bactérias e antibióticos não bloqueiam seu ciclo.", source: "microbiology",
    evidence: [
      { text: "Partículas virais se ligam a receptores específicos.", relevant: true, strength: "strong" },
      { text: "O genoma viral é copiado usando componentes celulares e virais.", relevant: true, strength: "strong" },
      { text: "Novas partículas são montadas e liberadas.", relevant: true, strength: "strong" },
      { text: "As partículas ficam maiores quando recebem mais nutrientes do meio.", relevant: false, strength: "weak" },
    ],
    correct: "O vírus usa a célula para produzir componentes, montar partículas e completar o ciclo.",
    distractor: "O vírus cresce sozinho consumindo nutrientes do meio.", surprise: "Uma mutação altera a proteína de superfície e reduz a entrada em células com o receptor antigo.",
    revision: "A dependência permanece, mas a especificidade de entrada muda conforme a interação entre superfície viral e receptor.",
    transfer: "Compare duas doenças: uma responde a antibiótico e outra não. Que evidências distinguem bactéria, vírus e causa não infecciosa?",
  },
  {
    title: "História de uma bactéria",
    caseText: "Uma bactéria intestinal encontra ambientes com pH, nutrientes e competidores diferentes.",
    question: "Por que a mesma espécie prospera em um local e não em outro?",
    concept: "Bactérias ocupam nichos, regulam genes conforme sinais do ambiente e interagem com uma comunidade.",
    misconception: "Bactéria não é sinônimo de patógeno.", source: "microbiology",
    evidence: [
      { text: "O crescimento muda quando a fonte de carbono é trocada.", relevant: true, strength: "strong" },
      { text: "A microbiota vizinha compete por espaço e nutrientes.", relevant: true, strength: "moderate" },
      { text: "Genes metabólicos são ativados conforme sinais ambientais.", relevant: true, strength: "strong" },
      { text: "A bactéria foi encontrada no corpo humano.", relevant: false, strength: "ambiguous" },
    ],
    correct: "O sucesso depende de recursos, condições físico-químicas, regulação gênica e interações comunitárias.",
    distractor: "Toda bactéria causa doença sempre que entra no corpo.", surprise: "A mesma bactéria produz uma molécula benéfica em um ambiente e um efeito inflamatório em outro.",
    revision: "O efeito depende do contexto, do estado do hospedeiro e da atividade dos genes, não apenas do nome da espécie.",
    transfer: "Ao avaliar um probiótico, que dados você exigiria para separar presença da bactéria, benefício e risco?",
  },
  {
    title: "Surto na escola",
    caseText: "Em uma escola, estudantes de turmas diferentes apresentam sintomas gastrointestinais ao longo de dois dias.",
    question: "O padrão aponta para uma fonte comum, transmissão entre pessoas ou mais de um processo?",
    concept: "Investigar um surto exige comparar tempo, turma, exposição, contatos e amostras; um caso isolado não define a cadeia de transmissão.",
    misconception: "Nem todo estudante doente participou da mesma refeição e correlação temporal não prova uma fonte única.", source: "inquiry",
    evidence: [
      { text: "Os primeiros casos ocorreram na mesma turma após uma atividade coletiva.", relevant: true, strength: "moderate" },
      { text: "Casos secundários aparecem depois entre contatos próximos.", relevant: true, strength: "strong" },
      { text: "A distribuição dos sintomas forma uma curva temporal compatível com propagação.", relevant: true, strength: "strong" },
      { text: "A turma com mais casos é a que tem a sala mais barulhenta.", relevant: false, strength: "weak" },
    ],
    correct: "O padrão combina exposição inicial e transmissão posterior; é preciso comparar contatos e fontes antes de concluir.",
    distractor: "Todos os casos vieram necessariamente do alimento servido no primeiro dia.",
    surprise: "Uma estudante adoece antes da atividade e teve contato com colegas de duas turmas.",
    revision: "A linha do tempo precisa incluir casos anteriores e contatos entre turmas, não apenas a refeição suspeita.",
    transfer: "Ao investigar outro surto, que registro de tempo, exposição e contato ajudaria a decidir quais amostras coletar?",
  },
  {
    title: "O alimento contaminado",
    caseText: "Várias pessoas adoecem depois de uma refeição. Nem todos comeram as mesmas porções ou os mesmos itens.",
    question: "Como investigar a origem sem confundir coincidência com causa?",
    concept: "Um surto exige comparar exposições, tempo de início dos sintomas, amostras e fontes alternativas.",
    misconception: "O alimento servido por último não é automaticamente a causa.", source: "inquiry",
    evidence: [
      { text: "A curva de início dos sintomas se concentra após a refeição.", relevant: true, strength: "moderate" },
      { text: "O item X foi consumido por quase todos os doentes.", relevant: true, strength: "strong" },
      { text: "Uma amostra do item X contém o mesmo agente encontrado em pacientes.", relevant: true, strength: "strong" },
      { text: "O item X tinha a aparência mais desagradável.", relevant: false, strength: "weak" },
    ],
    correct: "A hipótese mais forte combina exposição comum, temporalidade e evidência laboratorial compatível.",
    distractor: "O último alimento servido foi necessariamente o contaminado.", surprise: "Duas pessoas que não comeram o item X também adoeceram após contato com um manipulador.",
    revision: "A investigação precisa incluir transmissão pessoa a pessoa e não tratar um único alimento como explicação suficiente.",
    transfer: "Em um novo surto escolar, como você montaria uma tabela de exposição, controles e amostras?",
  },
  {
    title: "O antibiótico que deixou de funcionar",
    caseText: "Um antibiótico controlava uma infecção, mas a cultura coletada depois mostra crescimento mesmo na mesma dose.",
    question: "O que precisa ser testado antes de concluir que o medicamento falhou?",
    concept: "Falha aparente pode envolver resistência, dose e adesão, local da infecção, biofilme ou reinfecção por outra linhagem.",
    misconception: "Uma piora isolada não prova resistência; é preciso comparar cultura, concentração e contexto clínico.", source: "microbiology",
    evidence: [
      { text: "A concentração inibitória mínima aumentou na nova cultura.", relevant: true, strength: "strong" },
      { text: "A linhagem recuperada tem o mesmo perfil genético da anterior.", relevant: true, strength: "moderate" },
      { text: "A dose foi tomada de forma irregular em vários dias.", relevant: true, strength: "moderate" },
      { text: "A caixa do medicamento mudou de cor.", relevant: false, strength: "weak" },
    ],
    correct: "A falha deve ser investigada com teste de sensibilidade e dados de exposição, sem presumir uma causa única.",
    distractor: "O paciente criou resistência ao antibiótico.", surprise: "A cultura é sensível in vitro, mas um biofilme no local da infecção reduz a resposta no organismo.",
    revision: "Sensibilidade laboratorial e resposta no organismo são evidências diferentes; o contexto pode limitar a eficácia.",
    transfer: "Quando um tratamento não funciona, que combinação de evidências evita trocar o medicamento por tentativa e erro?",
  },
  {
    title: "CSI Biologia — morte dos peixes",
    caseText: "Peixes aparecem mortos em um lago depois de uma mudança na cor da água e de uma chuva intensa.",
    question: "Qual cadeia de eventos conecta a mudança do lago à mortalidade?",
    concept: "Excesso de nutrientes pode favorecer algas; decomposição consome oxigênio e produz uma condição hipóxica.",
    misconception: "A água verde não prova sozinha que algas causaram a morte.", source: "ecology",
    evidence: [
      { text: "O oxigênio dissolvido cai perto do fundo durante a madrugada.", relevant: true, strength: "strong" },
      { text: "Nutrientes aumentam após o escoamento da chuva.", relevant: true, strength: "strong" },
      { text: "A mortalidade se concentra onde há mais matéria orgânica.", relevant: true, strength: "moderate" },
      { text: "A água ficou com uma cor mais bonita ao entardecer.", relevant: false, strength: "weak" },
    ],
    correct: "Nutrientes, crescimento de algas, decomposição e queda de oxigênio formam uma explicação causal plausível.",
    distractor: "A chuva matou os peixes diretamente por deixá-los assustados.", surprise: "O oxigênio volta a subir à tarde, mas cai novamente antes do amanhecer.",
    revision: "O fenômeno varia no tempo: fotossíntese e respiração mudam o oxigênio em ciclos diários.",
    transfer: "Em um aquário, quais medidas diferenciariam excesso de ração, temperatura e falta de aeração?",
  },
  {
    title: "Extinção — a rã-do-brejo",
    caseText: "Uma população de rãs diminui em uma área úmida onde a água ainda parece presente.",
    question: "Como separar perda de habitat, doença e efeito de predadores?",
    concept: "Extinção local resulta da interação entre tamanho populacional, qualidade do habitat, doenças, predadores e conectividade.",
    misconception: "Encontrar água no local não garante que o habitat ainda sustente a população.", source: "ecology",
    evidence: [
      { text: "A área alagada dura menos tempo e seca antes da reprodução.", relevant: true, strength: "strong" },
      { text: "Indivíduos apresentam lesões compatíveis com uma doença emergente.", relevant: true, strength: "moderate" },
      { text: "Fragmentos vizinhos não têm conexão para recolonização.", relevant: true, strength: "moderate" },
      { text: "A rã é considerada um animal sensível por moradores.", relevant: false, strength: "weak" },
    ],
    correct: "A queda combina mudança do habitat, risco sanitário e isolamento; nenhuma pista isolada encerra o caso.",
    distractor: "A espécie desapareceu apenas porque há predadores.", surprise: "Uma área protegida mantém água, mas continua sem rãs porque não há indivíduos próximos para recolonizar.",
    revision: "Conservação precisa cuidar da qualidade local e da conectividade entre populações.",
    transfer: "Para recuperar outro anfíbio, que evidências orientariam a escolha entre restaurar água, controlar doença ou conectar fragmentos?",
  },
  {
    title: "Crime ambiental — quem matou o rio?",
    caseText: "Um rio recebe uma descarga irregular e, dias depois, apresenta espuma, odor e redução de invertebrados.",
    question: "Como atribuir a causa sem confundir presença de poluente com efeito ecológico?",
    concept: "Diagnóstico ambiental combina fonte, trajetória, concentração, temporalidade, organismos indicadores e comparação com controles.",
    misconception: "Encontrar uma substância no rio não prova sozinho que ela causou todo o impacto.", source: "ecology",
    evidence: [
      { text: "A concentração aumenta imediatamente a jusante do ponto de descarga.", relevant: true, strength: "strong" },
      { text: "A comunidade de invertebrados muda em um gradiente espacial.", relevant: true, strength: "strong" },
      { text: "A mesma substância aparece na amostra da tubulação.", relevant: true, strength: "strong" },
      { text: "O rio tinha cheiro diferente naquele mês.", relevant: false, strength: "ambiguous" },
    ],
    correct: "A atribuição fica mais forte quando fonte, gradiente espacial, tempo e resposta biológica convergem.",
    distractor: "Qualquer substância encontrada no rio é automaticamente a causa da mortandade.", surprise: "Uma segunda entrada a montante explica parte do impacto em um trecho que parecia não ter relação.",
    revision: "Sistemas ambientais têm múltiplas fontes; o mapa de entradas precisa ser atualizado com novas evidências.",
    transfer: "Em outra bacia, como você separaria um evento pontual de uma contaminação difusa?",
  },
  {
    title: "Fazenda — por que plantas estão morrendo?",
    caseText: "Plantas da mesma variedade murcham em uma faixa da fazenda, embora o solo pareça úmido.",
    question: "Que variável pode estar impedindo a absorção de água?",
    concept: "Água disponível não é o mesmo que água absorvível: salinidade, raízes, oxigenação e transporte alteram o estado hídrico.",
    misconception: "Murcha não prova falta de água no solo.", source: "ecology",
    evidence: [
      { text: "A condutividade elétrica do solo é maior na faixa afetada.", relevant: true, strength: "strong" },
      { text: "Raízes apresentam menor crescimento e danos nas pontas.", relevant: true, strength: "moderate" },
      { text: "A irrigação aumenta a umidade, mas não recupera o turgor.", relevant: true, strength: "strong" },
      { text: "As folhas das plantas afetadas são mais verdes.", relevant: false, strength: "weak" },
    ],
    correct: "Salinidade e dano radicular podem reduzir a entrada de água mesmo com o solo úmido.",
    distractor: "Basta adicionar mais água para resolver a murcha.", surprise: "Após uma chuva, a murcha piora porque sais se concentram na zona das raízes quando a água evapora.",
    revision: "O diagnóstico precisa acompanhar água, sais, raízes e transpiração, não apenas o volume irrigado.",
    transfer: "Em um vaso, como testar se a murcha vem de sal, falta de oxigênio ou doença radicular?",
  },
  {
    title: "Hospital — qual sistema está afetado?",
    caseText: "Uma pessoa apresenta respiração acelerada, cansaço e alteração no equilíbrio ácido-base após uma infecção.",
    question: "Como evidências de ventilação, troca gasosa e circulação ajudam a localizar o problema?",
    concept: "Sintomas semelhantes podem surgir por falhas diferentes; localização exige relacionar ventilação, difusão, perfusão e metabolismo.",
    misconception: "Respirar mais rápido não garante que os tecidos recebam mais oxigênio.", source: "physiology",
    evidence: [
      { text: "A saturação arterial está baixa apesar de ventilação aumentada.", relevant: true, strength: "strong" },
      { text: "A imagem mostra regiões com líquido e menor área de troca.", relevant: true, strength: "moderate" },
      { text: "A perfusão é desigual entre regiões do pulmão.", relevant: true, strength: "moderate" },
      { text: "A pessoa sente que está respirando com esforço.", relevant: false, strength: "ambiguous" },
    ],
    correct: "Ventilação, difusão e perfusão precisam ser comparadas para localizar a etapa comprometida.",
    distractor: "Como a respiração está rápida, o problema só pode estar no coração.", surprise: "A ventilação melhora, mas a saturação permanece baixa porque a barreira de troca continua espessa.",
    revision: "Aumentar o fluxo de ar não corrige automaticamente um bloqueio na difusão ou na perfusão.",
    transfer: "Ao analisar outro quadro, quais medidas diferenciariam ventilação inadequada de baixa perfusão?",
  },
  {
    title: "Zoológico — por que animais mudaram comportamento?",
    caseText: "Animais de um recinto passam a se esconder e reduzir a alimentação após uma reforma próxima.",
    question: "Como investigar estresse ambiental sem atribuir o comportamento a uma única causa?",
    concept: "Comportamento emerge da interação entre estímulos, necessidades, história individual e condições do ambiente.",
    misconception: "Uma mudança de comportamento não revela sozinha a causa nem o estado interno do animal.", source: "ecology",
    evidence: [
      { text: "A alteração começou após aumento de ruído e vibração.", relevant: true, strength: "moderate" },
      { text: "O padrão diminui quando há abrigo e previsibilidade sonora.", relevant: true, strength: "strong" },
      { text: "Indivíduos de espécies diferentes respondem de modos distintos.", relevant: true, strength: "moderate" },
      { text: "Visitantes percebem os animais como mais ariscos.", relevant: false, strength: "ambiguous" },
    ],
    correct: "A hipótese de estresse ambiental fica mais forte quando a mudança acompanha o estímulo e diminui com uma intervenção controlada.",
    distractor: "Os animais ficaram tristes por causa da reforma.", surprise: "Uma espécie mantém o comportamento porque usa um abrigo alternativo, enquanto outra não tem essa opção.",
    revision: "Respostas dependem de características da espécie, do indivíduo e das possibilidades de refúgio no ambiente.",
    transfer: "Em uma escola, como distinguir efeito de ruído, temperatura e presença de pessoas sobre o comportamento animal?",
  },
];

export const detailedBioQuestContent = Object.fromEntries(cases.map((item) => [item.title, {
  caseText: item.caseText,
  question: item.question,
  evidence: item.evidence.map(({ text, relevant }) => ({ text, relevant })),
  hypotheses: [
    { text: item.correct, correct: true, feedback: `Boa conclusão. ${item.concept}` },
    { text: item.distractor, correct: false, feedback: `Revise a explicação. ${item.misconception}` },
  ],
  concept: item.concept,
  misconception: item.misconception,
  source: sources[item.source],
  stages: stagesFor(item),
  transfer: item.transfer,
  duration: "12–18 min",
  gradeBand: "Fundamental II · Ensino Médio",
  mode: "Aula guiada",
}])) as Record<string, QuestContent>;
