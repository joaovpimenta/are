import type {
  AdventureSession,
  AdventureSessionSnapshot,
} from '@are/engine/session/adventureSession';
import type { AreTheme } from '@are/engine/theme';

export const LAB_REQUIRED_MECHANISMS = [
  'keypad',
  'dial',
  'inventory',
  'dialogue',
  'sequence',
  'switches',
  'reveal',
  'tuner',
  'levers',
  'cipher',
] as const;

export type LabMechanismId = typeof LAB_REQUIRED_MECHANISMS[number] | 'feedback';
export type LabRouteId = 'overview' | LabMechanismId;

export type LabEntry = {
  id: LabMechanismId;
  title: string;
  artifact: string;
  family: string;
  description: string;
  instruction: string;
  solution: string;
  hints: readonly [string, string, string];
  accessibility: string;
};

export const LAB_ENTRIES: readonly LabEntry[] = [
  {
    id: 'keypad',
    title: 'Keypad',
    artifact: 'Painel de acesso',
    family: 'Interface',
    description: 'Um terminal blindado que valida um código descoberto no ambiente.',
    instruction: 'Digite quatro números e confirme em OK.',
    solution: '1984',
    hints: ['Observe o ano marcado no arquivo.', 'Use os quatro algarismos no painel.', 'Digite 1984 e pressione OK.'],
    accessibility: 'Teclas 3D, botões DOM e teclado numérico executam as mesmas ações.',
  },
  {
    id: 'dial',
    title: 'Dial',
    artifact: 'Seletor de cofre',
    family: 'Espacial',
    description: 'Um dial físico com leitura angular e marca luminosa de alinhamento.',
    instruction: 'Arraste ao redor do centro como um relógio ou use os controles de passo.',
    solution: '07',
    hints: ['Procure a etiqueta do rolo de filme.', 'Alinhe o número com a marca superior.', 'Ajuste o dial para 07.'],
    accessibility: 'Arrasto, roda do mouse, botões grandes e setas do teclado estão disponíveis.',
  },
  {
    id: 'inventory',
    title: 'Inventory',
    artifact: 'Bandeja de evidências',
    family: 'Observação',
    description: 'Objetos descobertos permanecem disponíveis para inspeção e uso posterior.',
    instruction: 'Selecione todos os artefatos para coletá-los.',
    solution: 'Chave de latão, rolo de filme e planta dobrada.',
    hints: ['Há três evidências na bandeja.', 'Toque em cada item uma vez.', 'Colete os três artefatos.'],
    accessibility: 'Lista semântica com botões, estado pressionado e descrições textuais.',
  },
  {
    id: 'dialogue',
    title: 'Dialogue',
    artifact: 'Canal da operadora',
    family: 'Social',
    description: 'Uma transmissão curta fornece orientação narrativa sem sair do mundo.',
    instruction: 'Avance pelas mensagens e encerre a transmissão.',
    solution: 'Duas falas e Concluir.',
    hints: ['Escute toda a transmissão.', 'Use Continuar até a última fala.', 'Pressione Concluir após a segunda fala.'],
    accessibility: 'Texto persistente, ordem de foco previsível e controles nativos.',
  },
  {
    id: 'sequence',
    title: 'Sequence',
    artifact: 'Matriz de símbolos',
    family: 'Lógica',
    description: 'Uma matriz registra uma ordem descoberta na planta da sala.',
    instruction: 'Selecione cada símbolo uma vez na ordem correta.',
    solution: '◼ → ◇ → △ → ✦',
    hints: ['A planta contém quatro marcas.', 'Leia as marcas no sentido indicado.', 'Escolha ◼, ◇, △ e ✦.'],
    accessibility: 'Botões rotulados informam símbolo, posição e seleção.',
  },
  {
    id: 'switches',
    title: 'Switch bank',
    artifact: 'Quadro direcional',
    family: 'Espacial',
    description: 'Quatro interruptores reproduzem a orientação encontrada no mapa.',
    instruction: 'Ajuste cada direção para ligado ou desligado.',
    solution: 'NORTE ligado, LESTE desligado, SUL ligado, OESTE desligado.',
    hints: ['Compare o mapa com o quadro.', 'Somente duas direções recebem energia.', 'Ligue NORTE e SUL.'],
    accessibility: 'Botões anunciam direção e estado; não dependem somente de cor.',
  },
  {
    id: 'reveal',
    title: 'Reveal',
    artifact: 'Arquivo contaminado',
    family: 'Observação',
    description: 'Uma camada de ruído protege a informação até a inspeção deliberada.',
    instruction: 'Solicite a limpeza do arquivo.',
    solution: 'Revelar a pista 07.',
    hints: ['O arquivo pode ser limpo.', 'Use o controle de revelação.', 'Pressione Revelar pista.'],
    accessibility: 'O conteúdo revelado é anunciado por uma região ao vivo.',
  },
  {
    id: 'feedback',
    title: 'Feedback',
    artifact: 'Diagnóstico da sala',
    family: 'Confirmação',
    description: 'O console resume o estado real da sessão e confirma a conclusão.',
    instruction: 'Resolva os dez mecanismos obrigatórios.',
    solution: 'Todos os resultados da sessão em solved.',
    hints: ['Consulte os estados na navegação.', 'Cada mecanismo obrigatório precisa confirmar sucesso.', 'Complete as dez rotas de teste.'],
    accessibility: 'Mensagens usam texto e aria-live, não apenas cor ou animação.',
  },
  {
    id: 'tuner',
    title: 'Signal tuner',
    artifact: 'Rádio de ondas curtas',
    family: 'Interface',
    description: 'Um receptor analógico encontra a frequência da transmissão perdida.',
    instruction: 'Gire o controle ou use passo/slider até estabilizar o sinal.',
    solution: 'Banda 73',
    hints: ['A frequência aparece no relatório rasgado.', 'Ajuste a banda lentamente.', 'Sintonize 73.'],
    accessibility: 'Dial 3D, botões, slider e setas do teclado compartilham o mesmo valor.',
  },
  {
    id: 'levers',
    title: 'Lever console',
    artifact: 'Distribuidor de energia',
    family: 'Espacial',
    description: 'Alavancas mecânicas roteiam energia pelas direções da estação.',
    instruction: 'Alterne as quatro alavancas até reproduzir o diagrama.',
    solution: 'N e S ligados; E e W desligados.',
    hints: ['O diagrama destaca dois eixos.', 'As direções opostas compartilham energia.', 'Ligue N e S.'],
    accessibility: 'Cada alavanca 3D possui um botão DOM equivalente com estado anunciado.',
  },
  {
    id: 'cipher',
    title: 'Cipher rotor',
    artifact: 'Decodificador de cilindros',
    family: 'Linguagem',
    description: 'Três rotores numéricos abrem um arquivo cifrado da estação.',
    instruction: 'Ajuste cada rotor com os controles superiores/inferiores.',
    solution: '731',
    hints: ['Três dígitos aparecem em evidências separadas.', 'Cada coluna é um rotor independente.', 'Ajuste para 7, 3 e 1.'],
    accessibility: 'Cada rotor tem aumentar/diminuir em DOM, rótulo individual e leitura textual.',
  },
] as const;

export type LabRouteProps = {
  entry: LabEntry;
  theme: AreTheme;
  reducedMotion: boolean;
  resetVersion: number;
  session: AdventureSession;
  snapshot: AdventureSessionSnapshot;
};

export function parseLabRoute(pathname: string): LabRouteId {
  const marker = '/lab/';
  const markerIndex = pathname.indexOf(marker);
  if (markerIndex === -1) return 'overview';
  const remainder = pathname.slice(markerIndex + marker.length).split('/').filter(Boolean)[0];
  return LAB_ENTRIES.some((entry) => entry.id === remainder) ? remainder as LabMechanismId : 'overview';
}

export function labRouteHref(id: LabRouteId, pathname: string): string {
  const marker = '/lab/';
  const markerIndex = pathname.indexOf(marker);
  const base = markerIndex === -1 ? '/lab/' : pathname.slice(0, markerIndex + marker.length);
  return id === 'overview' ? base : base + id + '/';
}
