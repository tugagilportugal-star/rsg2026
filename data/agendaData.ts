export interface AgendaItem {
  id: string;
  start: string;
  speaker?: string;
  speakerBio?: string;
  title: string;
  description?: string;
  language?: 'PT' | 'EN';
}

export const agenda2026: AgendaItem[] = [
  {
    id: '1',
    start: '09:30',
    speaker: 'Joana Silva',
    speakerBio: 'Engineering Leader with 8+ years of experience in software quality and high-performing teams. Specialist in technology strategy, scaling QA operations, and aligning technical execution with business goals.',
    title: 'QA na era da IA: O que mudou — e o que continua a falhar',
    language: 'PT',
    description: 'Uma análise pragmática sobre o que realmente funciona na interseção entre QA e IA. Joana partilha casos reais e aprendizagens sobre automação assistida, estratégia de testes em produtos com componentes de inteligência artificial, riscos e governance.'
  },
  {
    id: '2',
    start: '10:05',
    speaker: 'Lyssa Adkins',
    speakerBio: 'Author of "Coaching Agile Teams" and foundational figure in the agile movement. Systems coach and architect of capacity, Lyssa focuses on helping leaders become Future-Fit by navigating complexity.',
    title: 'Agilists and Our World Work: What if we were made for this time?',
    language: 'EN',
    description: 'In this keynote, Lyssa Adkins explores the planetary-scale challenges of our era. She shares insights on why agilists are uniquely positioned to make a massively positive impact, suggesting that agility emerged exactly when needed to help us meet today’s paradigm shifts.'
  },
  {
    id: '3',
    start: '10:55',
    title: '☕ Coffee Break & Networking',
    description: 'Pausa para café e partilha de ideias entre a comunidade.'
  },
  {
    id: '4',
    start: '11:20',
    speaker: 'Patrícia Alves',
    speakerBio: 'Líder de transformações em People, focada em talento, tecnologia e cultura. Implementou Agile em contextos não tecnológicos, transformando Talent Acquisition através de Product Thinking.',
    title: 'People & Future: Redesenhar o trabalho em equipa fora do mundo "tech"',
    language: 'PT',
    description: 'Patrícia desafia a dependência de processos e foca na coragem necessária para repensar equipas. Uma visão real sobre a transformação fora do mundo tech, onde a segurança psicológica e as relações humanas são os únicos motores capazes de sustentar a evolução.'
  },
  {
    id: '5',
    start: '11:55',
    speaker: 'Matheus Haddad, Coca Pitzer, Ricardo Fernandes, Anabela Ferreira',
    speakerBio: 'Painel de especialistas em liderança, coaching sistémico e comportamento organizacional em ambientes de alta complexidade.',
    title: 'Mesa Redonda: A IA está a matar ou salvar a agilidade?',
    language: 'PT',
    description: 'Um debate multifacetado sobre o impacto da IA na essência da agilidade. Os painelistas exploram se a tecnologia está a potenciar a entrega de valor ou se ameaça a colaboração humana, focando na tomada de decisão sob incerteza.'
  },
  {
    id: '6',
    start: '13:00',
    title: '🍽️ Almoço',
    description: 'Momento de pausa para almoço e recarregar energias.'
  },
  {
    id: '7',
    start: '14:20',
    speaker: 'David Anderson',
    speakerBio: 'Originator of the Kanban Method and CEO of Mauvius Group. With over 30 years’ experience at IBM and Microsoft, he is a management innovator and author focused on modern management for knowledge-driven organizations.',
    title: 'Satisficing: How to Succeed at Scale',
    language: 'EN',
    description: 'David Anderson argues that large-scale agility isn’t achieved through frameworks. Instead, he explores network science and the concept of "satisficing"—adapting locally to optimize globally—allowing organizations to evolve into their best fit for performance.'
  },
  {
    id: '8',
    start: '14:55',
    speaker: 'Ricardo Caldas',
    speakerBio: 'Product Owner na VWGDS, especialista em liderança de equipas e melhoria sistémica. Atua na interseção entre produto e agilidade, focando em otimização de fluxos de valor em ambientes de escala.',
    title: 'Let IT Flow: Delivering More Features using Flight Levels Dependency Management',
    language: 'PT',
    description: 'Ricardo partilha aprendizagens sobre como tratar dependências como um problema de sistema e não apenas de equipas. A talk foca em como utilizar o Flight Levels para desbloquear o fluxo e garantir o alinhamento em contextos complexos.'
  },
  {
    id: '9',
    start: '16:00',
    title: '☕ Coffee Break & Networking',
    description: 'Pausa para café e networking antes da reta final do evento.'
  },
  {
    id: '10',
    start: '16:25',
    speaker: 'Paulo Caroli + Manuel Pais',
    speakerBio: 'Paulo é criador da Lean Inception. Manuel é co-autor de "Team Topologies". Juntos, ajudam organizações mundiais a alinhar sistemas técnicos e sociais para acelerar a entrega de valor sustentável.',
    title: 'Direction, Flow, and Commitment: Strategy, Team Design, and Team Ownership',
    language: 'EN',
    description: 'Many organizations reorganize teams without improving outcomes because strategy and team design are disconnected. This talk explores how Strategic OKRs, Team Topologies, and Team OKRs work together to connect direction and ownership.'
  },
  {
    id: '11',
    start: '17:10',
    speaker: 'César Ribeiro + Carlos Paz',
    speakerBio: 'César é Head of IT Governance nos CTT. Carlos é especialista em agilidade em escala e transformação digital, focado na melhoria de fluxo e modelos operativos em ambientes de larga escala.',
    title: 'Transformar para Entregar: a evolução ágil nos CTT',
    language: 'PT',
    description: 'Uma partilha sem filtros sobre a jornada de transformação dos CTT. César e Carlos abordam as tensões reais, as decisões imperfeitas e o impacto de alinhar Flight Levels e produto em contextos logísticos de grande escala.'
  },
  {
    id: '12',
    start: '17:45',
    speaker: 'Sara Cruz',
    speakerBio: 'Head of Product na Wells com 15 anos de experiência (Farfetch, OutSystems). Especialista em maturidade digital e gestão estratégica de produtos de larga escala.',
    title: 'Real World Product Management',
    language: 'PT',
    description: 'Sara explora o gap entre a "cultura de produto perfeita" e as trincheiras do dia a dia. Mostra como transformar wishlists em intenção estratégica, equilibrando dados e empatia para construir produtos que geram valor real.'
  },
  {
    id: '13',
    start: '18:20',
    speaker: 'Nádia Miranda',
    speakerBio: 'Doutorada em Engenharia Informática e mentora na Portuguese Women in Tech. Diretora de IT com vasta experiência em liderança multicultural e transformação digital.',
    title: 'Closing Talk: TBD',
    language: 'PT',
    description: 'No encerramento do evento, Nádia apresenta uma síntese inspiradora dos temas abordados. Uma reflexão sobre o percurso da agilidade e como a trajetória académica e executiva nos prepara para os novos desafios do impacto humano na tecnologia.'
  }
];