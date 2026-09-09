import type { LockDefinition } from '@are/engine/mechanisms/locks';

export type LockPreset = {
  icon: string;
  label: string;
  artifact: string;
  description: string;
  instruction: string;
  solutionLabel: string;
  definition: LockDefinition;
};

export const LOCK_PRESETS: readonly LockPreset[] = [
  {
    icon: '🔢', label: 'Numérico', artifact: 'Teclado de cofre',
    description: 'Código clássico de quatro dígitos, operável pelo teclado na tela ou pelo teclado físico.',
    instruction: 'Digite os quatro dígitos e valide.', solutionLabel: '1234',
    definition: { id: 'numeric', kind: 'numeric', solution: '1234' },
  },
  {
    icon: '✋', label: 'Esquema', artifact: 'Grade gestual 3×3',
    description: 'Padrão inspirado no desbloqueio de smartphones, formado ao ligar pontos em uma ordem precisa.',
    instruction: 'Trace ou toque nos pontos 1, 5, 9 e 7, nessa ordem.', solutionLabel: '1 → 5 → 9 → 7',
    definition: { id: 'pattern', kind: 'pattern', solution: ['1', '5', '9', '7'], columns: 3 },
  },
  {
    icon: '🕹️', label: 'Direção', artifact: 'Pad de quatro direções',
    description: 'Sequência espacial de cima, direita, baixo e esquerda para mapas e instruções de movimento.',
    instruction: 'Reproduza a rota indicada e valide.', solutionLabel: 'Cima · direita · baixo · esquerda',
    definition: { id: 'direction', kind: 'direction', solution: ['↑', '→', '↓', '←'], columns: 4 },
  },
  {
    icon: '🧭', label: 'Bússola', artifact: 'Rosa dos ventos',
    description: 'Versão de oito direções que inclui os pontos cardeais e as diagonais.',
    instruction: 'Registre a rota pelos oito rumos disponíveis.', solutionLabel: 'N → NE → E → SE',
    definition: { id: 'compass', kind: 'compass', solution: ['N', 'NE', 'E', 'SE'], columns: 4 },
  },
  {
    icon: '🎨', label: 'Cores', artifact: 'Painel cromático',
    description: 'Sequência visual entre dez cores, adequada a pistas em bandeiras, quadros e sinais luminosos.',
    instruction: 'Selecione a sequência cromática correta.', solutionLabel: 'Vermelho → Azul → Verde → Amarelo',
    definition: { id: 'colors', kind: 'colors', solution: ['Vermelho', 'Azul', 'Verde', 'Amarelo'], columns: 5 },
  },
  {
    icon: '🎹', label: 'Musical', artifact: 'Piano de uma oitava',
    description: 'Teclas sonoras e rótulos visuais reproduzem uma melodia sem tornar o áudio obrigatório.',
    instruction: 'Toque as quatro notas da melodia e valide.', solutionLabel: 'Dó4 → Mi4 → Sol4 → Dó4',
    definition: { id: 'musical', kind: 'musical', solution: ['Dó4', 'Mi4', 'Sol4', 'Dó4'], columns: 7 },
  },
  {
    icon: '🔑', label: 'Senha', artifact: 'Campo de palavra-chave',
    description: 'Resposta textual para nomes, lugares ou frases curtas; espaços e maiúsculas são normalizados.',
    instruction: 'Digite a palavra-chave encontrada na pista.', solutionLabel: 'atlas',
    definition: { id: 'password', kind: 'password', solution: 'atlas' },
  },
  {
    icon: '👤', label: 'Login', artifact: 'Terminal de credenciais',
    description: 'Identificador e senha são entradas independentes, apropriadas a cenários de infiltração.',
    instruction: 'Preencha os dois campos e valide o acesso.', solutionLabel: 'Identificador professor · senha escape',
    definition: { id: 'login', kind: 'login', solution: 'professor:escape' },
  },
  {
    icon: '🔲', label: 'Interruptores', artifact: 'Matriz binária 4×4',
    description: 'Combinação de chaves ligadas e desligadas; a ordem de ativação não altera o resultado.',
    instruction: 'Ligue somente os interruptores indicados.', solutionLabel: '1, 4, 6, 11, 13 e 16 ligados',
    definition: { id: 'switches', kind: 'switches', solution: ['1', '4', '6', '11', '13', '16'], columns: 4 },
  },
  {
    icon: '🔢', label: 'Interruptores ordenados', artifact: 'Matriz sequencial 4×4',
    description: 'Além do conjunto correto, registra a ordem em que cada interruptor foi acionado.',
    instruction: 'Ative os interruptores na ordem exata.', solutionLabel: '2 → 5 → 9 → 14',
    definition: { id: 'ordered-switches', kind: 'ordered-switches', solution: ['2', '5', '9', '14'], columns: 4 },
  },
  {
    icon: '⬛', label: 'Grade 4×4', artifact: 'Matriz compacta',
    description: 'Grade de dezesseis células para reproduzir coordenadas, símbolos ou um trajeto curto.',
    instruction: 'Selecione as células da diagonal principal.', solutionLabel: '1 → 6 → 11 → 16',
    definition: { id: 'grid-4x4', kind: 'grid-4x4', solution: ['1', '6', '11', '16'], columns: 4 },
  },
  {
    icon: '⬜', label: 'Grade 5×5', artifact: 'Matriz expandida',
    description: 'Grade de vinte e cinco células para padrões mais detalhados e códigos de coordenadas.',
    instruction: 'Selecione as células da diagonal principal.', solutionLabel: '1 → 7 → 13 → 19 → 25',
    definition: { id: 'grid-5x5', kind: 'grid-5x5', solution: ['1', '7', '13', '19', '25'], columns: 5 },
  },
  {
    icon: '🗺️', label: 'Geoloc. virtual', artifact: 'Mapa cartográfico',
    description: 'Um mapa virtual transforma um ponto escolhido em coordenadas e aplica uma tolerância espacial.',
    instruction: 'Marque o centro do mapa ou use o alvo de teste acessível.', solutionLabel: '-19.9245, -43.9352 · tolerância 180 m',
    definition: {
      id: 'virtual-geolocation', kind: 'virtual-geolocation', solution: '-19.9245,-43.9352',
      location: { latitude: -19.9245, longitude: -43.9352, toleranceMeters: 180 }, allowLocationSimulation: true,
    },
  },
  {
    icon: '📍', label: 'Geoloc. real', artifact: 'Receptor GPS',
    description: 'Compara a localização física do dispositivo com um destino e sua tolerância configurável.',
    instruction: 'Autorize o GPS ou use a simulação explícita do Lab.', solutionLabel: '-19.9323, -43.9376 · tolerância 150 m',
    definition: {
      id: 'real-geolocation', kind: 'real-geolocation', solution: '-19.9323,-43.9376',
      location: { latitude: -19.9323, longitude: -43.9376, toleranceMeters: 150 }, allowLocationSimulation: true,
    },
  },
] as const;
