export const summaryCards = [
  { label: "Negociações urgentes", value: 4, color: "red" },
  { label: "Em atenção", value: 7, color: "amber" },
  { label: "Dentro do prazo", value: 12, color: "green" },
  { label: "Tarefas pendentes", value: 9, color: "slate" },
];

export const recommendedActions = [
  {
    id: 1,
    text: "Enviar follow-up para Grupo Alfa — negociação parada há 8 dias",
    priority: "urgent",
  },
  {
    id: 2,
    text: "Agendar reunião de alinhamento com Distribuidora Beta",
    priority: "attention",
  },
  {
    id: 3,
    text: "Confirmar proposta enviada para Parceiro Gama — prazo vence amanhã",
    priority: "attention",
  },
];

export const pipelineSummary = [
  {
    id: 1,
    parceiro: "Grupo Alfa",
    status: "Proposta enviada",
    diasParado: 8,
    prioridade: "Alta",
  },
  {
    id: 2,
    parceiro: "Distribuidora Beta",
    status: "Em negociação",
    diasParado: 3,
    prioridade: "Média",
  },
  {
    id: 3,
    parceiro: "Parceiro Gama",
    status: "Aguardando retorno",
    diasParado: 12,
    prioridade: "Alta",
  },
  {
    id: 4,
    parceiro: "Rede Delta",
    status: "Contrato em revisão",
    diasParado: 1,
    prioridade: "Baixa",
  },
  {
    id: 5,
    parceiro: "Holding Epsilon",
    status: "Proposta enviada",
    diasParado: 5,
    prioridade: "Média",
  },
];

export const tasks = [
  {
    id: 1,
    titulo: "Enviar proposta revisada para Grupo Alfa",
    prazo: "07/04/2026",
    status: "Pendente",
    observacao: "Aguardando aprovação interna",
  },
  {
    id: 2,
    titulo: "Ligar para ponto focal da Distribuidora Beta",
    prazo: "08/04/2026",
    status: "Em andamento",
    observacao: "Confirmar disponibilidade de agenda",
  },
  {
    id: 3,
    titulo: "Preparar apresentação para reunião Gama",
    prazo: "10/04/2026",
    status: "Pendente",
    observacao: "Incluir análise de ROI",
  },
  {
    id: 4,
    titulo: "Revisar contrato com Rede Delta",
    prazo: "09/04/2026",
    status: "Concluída",
    observacao: "Enviado para jurídico",
  },
  {
    id: 5,
    titulo: "Follow-up Holding Epsilon",
    prazo: "07/04/2026",
    status: "Pendente",
    observacao: "Terceira tentativa de contato",
  },
  {
    id: 6,
    titulo: "Atualizar CRM com dados da última reunião",
    prazo: "06/04/2026",
    status: "Atrasada",
    observacao: "",
  },
];

export const negotiations = [
  {
    id: 1,
    parceiro: "Grupo Alfa",
    produto: "Licença Enterprise",
    status: "Proposta enviada",
    diasParado: 8,
    prioridade: "Alta",
    pontoFocal: "Carlos Mendes",
  },
  {
    id: 2,
    parceiro: "Distribuidora Beta",
    produto: "Módulo Logística",
    status: "Em negociação",
    diasParado: 3,
    prioridade: "Média",
    pontoFocal: "Ana Souza",
  },
  {
    id: 3,
    parceiro: "Parceiro Gama",
    produto: "Licença Pro",
    status: "Aguardando retorno",
    diasParado: 12,
    prioridade: "Alta",
    pontoFocal: "Rodrigo Lima",
  },
  {
    id: 4,
    parceiro: "Rede Delta",
    produto: "Consultoria",
    status: "Contrato em revisão",
    diasParado: 1,
    prioridade: "Baixa",
    pontoFocal: "Fernanda Oliveira",
  },
  {
    id: 5,
    parceiro: "Holding Epsilon",
    produto: "Licença Enterprise",
    status: "Proposta enviada",
    diasParado: 5,
    prioridade: "Média",
    pontoFocal: "Paulo Costa",
  },
  {
    id: 6,
    parceiro: "Cooperativa Zeta",
    produto: "Módulo RH",
    status: "Qualificação",
    diasParado: 0,
    prioridade: "Baixa",
    pontoFocal: "Marina Torres",
  },
  {
    id: 7,
    parceiro: "Indústria Eta",
    produto: "Licença Pro",
    status: "Aguardando retorno",
    diasParado: 15,
    prioridade: "Alta",
    pontoFocal: "Sérgio Nunes",
  },
];

export const followUps = {
  urgentes: [
    {
      id: 1,
      parceiro: "Grupo Alfa",
      status: "Proposta enviada",
      diasParado: 8,
      mensagem:
        "Olá Carlos, tudo bem? Gostaria de saber se houve alguma atualização em relação à proposta que enviamos na semana passada. Estamos à disposição para esclarecer qualquer dúvida ou ajustar o que for necessário.",
    },
    {
      id: 2,
      parceiro: "Parceiro Gama",
      status: "Aguardando retorno",
      diasParado: 12,
      mensagem:
        "Olá Rodrigo, espero que esteja bem! Já faz alguns dias desde nosso último contato e queria verificar se você teve a oportunidade de avaliar nossa proposta. Podemos agendar uma call rápida esta semana?",
    },
    {
      id: 3,
      parceiro: "Indústria Eta",
      status: "Aguardando retorno",
      diasParado: 15,
      mensagem:
        "Olá Sérgio! Passando para verificar o andamento da nossa negociação. Caso precise de mais informações ou de uma nova apresentação, estamos disponíveis para uma reunião.",
    },
  ],
  atencao: [
    {
      id: 4,
      parceiro: "Holding Epsilon",
      status: "Proposta enviada",
      diasParado: 5,
      mensagem:
        "Olá Paulo, tudo certo? Estou passando para verificar se recebeu nossa proposta e se tem algum ponto que gostaria de discutir antes de seguir adiante.",
    },
    {
      id: 5,
      parceiro: "Distribuidora Beta",
      status: "Em negociação",
      diasParado: 3,
      mensagem:
        "Oi Ana! Queria confirmar se estamos alinhados nos pontos discutidos em nossa última conversa e saber se há alguma dúvida pendente da sua parte.",
    },
  ],
};

export const meetingSummaries = [
  {
    id: 1,
    titulo: "Reunião com Grupo Alfa — Revisão de Proposta",
    data: "02/04/2026",
    resumo:
      "Discutimos os ajustes na proposta de licença Enterprise. Cliente solicitou desconto de 10% e inclusão do módulo de relatórios avançados. Próximo passo: enviar proposta revisada até 07/04.",
    tarefas: ["Enviar proposta revisada", "Incluir módulo de relatórios"],
  },
  {
    id: 2,
    titulo: "Alinhamento interno — Estratégia Q2",
    data: "31/03/2026",
    resumo:
      "Definimos foco em negociações de alto valor para Q2. Prioridade para Grupo Alfa, Parceiro Gama e Indústria Eta. Meta: fechar pelo menos 3 negociações até junho.",
    tarefas: [
      "Atualizar pipeline com prioridades Q2",
      "Preparar deck de acompanhamento",
    ],
  },
  {
    id: 3,
    titulo: "Demo para Cooperativa Zeta",
    data: "28/03/2026",
    resumo:
      "Apresentamos o módulo de RH para equipe técnica e gestores da Zeta. Boa receptividade. Solicitaram proposta formal e referências de clientes do setor.",
    tarefas: ["Enviar proposta formal", "Compartilhar cases de sucesso do setor"],
  },
];

export const chatMessages = [
  {
    id: 1,
    role: "assistant",
    text: "Olá! Sou seu assistente executivo. Como posso ajudar hoje?",
  },
  {
    id: 2,
    role: "user",
    text: "Quais negociações estão urgentes?",
  },
  {
    id: 3,
    role: "assistant",
    text: "Temos 3 negociações críticas agora:\n\n• Grupo Alfa — proposta enviada há 8 dias sem retorno\n• Parceiro Gama — aguardando retorno há 12 dias\n• Indústria Eta — parada há 15 dias\n\nRecomendo enviar follow-up para os três hoje. Quer que eu gere as mensagens?",
  },
  {
    id: 4,
    role: "user",
    text: "Sim, gera o follow-up para o Grupo Alfa.",
  },
  {
    id: 5,
    role: "assistant",
    text: 'Aqui está a mensagem sugerida para o Carlos Mendes (Grupo Alfa):\n\n"Olá Carlos, tudo bem? Gostaria de saber se houve alguma atualização em relação à proposta que enviamos. Estamos à disposição para esclarecer qualquer dúvida ou ajustar o que for necessário."\n\nDeseja copiar ou ajustar algum ponto?',
  },
];
