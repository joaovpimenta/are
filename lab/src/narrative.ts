import type { LabMechanismId } from './model';

export type PuzzleStory = {
  title: string;
  scene: string;
  evidence: string;
  objective: string;
  rule: string;
  hints: readonly [string, string, string];
  solution: string;
  steps: readonly string[];
};

/** Content for the Lab only. Adventures ship their own scenario copy. */
export const LAB_STORIES: Record<LabMechanismId, PuzzleStory> = {
  keypad: {
    title: "O último turno de 1984",
    scene: "As portas da estação ECHO se fecharam durante o turno da noite. Um técnico deixou um terminal de emergência e um registro rasgado preso à parede.",
    evidence: "Registro de manutenção: instalação em 19 | 84. O terminal aceita o ano completo, sem espaços.",
    objective: "Recuperar o acesso ao corredor de manutenção.",
    rule: "Insira quatro algarismos e confirme em OK; uma tentativa errada não abre o terminal.",
    hints: [
      "Junte as duas partes do ano impresso no registro.",
      "O registro começa com 19 e termina com 84.",
      "O código completo é 1984; confirme em OK."
    ],
    solution: "1984",
    steps: [
      "Leia 19 | 84 no registro e forme o ano 1984.",
      "Digite 1, 9, 8 e 4 no teclado 3D ou nos botões.",
      "Pressione OK. O terminal deve indicar solved."
    ]
  },
  dial: {
    title: "A bobina do projetor",
    scene: "Uma película de segurança está presa em um cofre circular. O projetor só libera a bobina correta quando a marca do seletor coincide com o número do rolo.",
    evidence: "Etiqueta da bobina requisitada: ECHO / ROLO 07. Posição atual do seletor: 02.",
    objective: "Alinhar o seletor com o rolo requisitado.",
    rule: "O disco gira como um relógio; só o alinhamento exato entre 00 e 09 destrava o cofre.",
    hints: [
      "O destino está na etiqueta da bobina.",
      "Ajuste a posição até o visor indicar o mesmo número de dois dígitos.",
      "Gire de 02 para 07; são cinco passos no sentido crescente."
    ],
    solution: "07",
    steps: [
      "Localize a etiqueta ROLO 07.",
      "Arraste o dial ao redor do centro ou use o botão + cinco vezes, partindo de 02.",
      "Pare em 07. A marca fica alinhada e a missão é resolvida."
    ]
  },
  inventory: {
    title: "Três objetos antes do apagão",
    scene: "As luzes estão caindo e a equipe de resgate só pode levar uma bandeja de evidências. Um bilhete exige que nada essencial fique para trás.",
    evidence: "Lista do investigador: chave de latão E-7, rolo de filme da transmissão e planta dobrada da sala.",
    objective: "Coletar as três evidências para montar o dossiê.",
    rule: "Selecione cada objeto na bandeja; não basta apenas ler sua descrição.",
    hints: [
      "Confira os três itens mencionados na lista do investigador.",
      "Um toque em cada item o adiciona ao inventário da sessão.",
      "Colete a chave de latão, o rolo de filme e a planta dobrada."
    ],
    solution: "Chave de latão, rolo de filme e planta dobrada",
    steps: [
      "Selecione Chave de latão.",
      "Selecione Rolo de filme.",
      "Selecione Planta dobrada e confira os três itens no inventário."
    ]
  },
  dialogue: {
    title: "A voz que atravessou o ruído",
    scene: "Uma operadora ainda transmite pelo interfone, mas a conexão só permanecerá aberta por duas mensagens. Ela tem pistas sobre o destino da estação.",
    evidence: "O visor anuncia 2 mensagens recebidas. Protocolo: ouvir, avançar e encerrar a comunicação.",
    objective: "Registrar integralmente a orientação da operadora.",
    rule: "Leia as duas falas, avance por Continuar e finalize a transmissão no botão Concluir.",
    hints: [
      "A primeira fala não encerra a conversa.",
      "Avance até a mensagem sobre a banda do rolo e os eixos energizados.",
      "Depois da segunda fala, pressione Concluir."
    ],
    solution: "Duas falas lidas e transmissão concluída",
    steps: [
      "Leia a primeira mensagem da operadora.",
      "Pressione Continuar para mostrar a segunda mensagem.",
      "Pressione Concluir para registrar a transmissão como resolvida."
    ]
  },
  sequence: {
    title: "O mapa dos quatro selos",
    scene: "No subsolo da estação, uma porta exibe quatro espaços para símbolos. A planta dobrada mostra o caminho dos antigos funcionários.",
    evidence: "A inscrição na planta diz: porta fechada ◼, cristal ◇, telhado △, estrela ✦. Leia da esquerda para a direita.",
    objective: "Reproduzir os selos na ordem de passagem.",
    rule: "A ordem importa; um símbolo incorreto invalida a sequência.",
    hints: [
      "Há seis opções, mas a planta cita apenas quatro.",
      "Siga as marcas na direção de leitura da inscrição.",
      "Toque ◼, ◇, △ e ✦, nessa ordem."
    ],
    solution: "◼ → ◇ → △ → ✦",
    steps: [
      "Localize ◼ e toque nele.",
      "Em seguida toque ◇, depois △.",
      "Finalize com ✦; a sequência completa deve confirmar sucesso."
    ]
  },
  switches: {
    title: "O corredor norte–sul",
    scene: "O painel de distribuição energiza rotas perigosas. Um mapa dos túneis mostra que só o eixo principal deve ficar ativo.",
    evidence: "Mapa de emergência: NORTE e SUL = linha segura; LESTE e OESTE = circuitos de isolamento (sem energia).",
    objective: "Reativar apenas o corredor seguro.",
    rule: "Os quatro interruptores representam direções independentes; o estado final de cada um deve coincidir com o mapa.",
    hints: [
      "Os túneis laterais permanecem isolados.",
      "Os dois pólos opostos do eixo vertical recebem energia.",
      "NORTE ligado, LESTE desligado, SUL ligado, OESTE desligado."
    ],
    solution: "NORTE e SUL ligados; LESTE e OESTE desligados",
    steps: [
      "Ligue NORTE.",
      "Deixe LESTE desligado e ligue SUL.",
      "Confirme que OESTE continua desligado."
    ]
  },
  reveal: {
    title: "O arquivo sob interferência",
    scene: "Um relatório essencial foi encoberto por interferência magnética. Uma rotina de limpeza pode tornar os dados novamente legíveis.",
    evidence: "Aviso do terminal: ‘A informação não foi apagada. A camada de ruído pode ser removida com Revelar pista.’",
    objective: "Recuperar o conteúdo do relatório perdido.",
    rule: "Acione a revelação do próprio componente; ler a prévia não basta para registrar a descoberta.",
    hints: [
      "Não é necessário encontrar uma senha.",
      "Há uma ação de limpeza de ruído no arquivo.",
      "Pressione Revelar pista e leia a frequência, os rotores e os eixos."
    ],
    solution: "Revelar o arquivo ECHO 07",
    steps: [
      "Localize o painel Arquivo ECHO 07.",
      "Pressione Revelar pista.",
      "Leia FREQUÊNCIA 73, ROTORES 731 e ENERGIA N/S; o estado será confirmado."
    ]
  },
  feedback: {
    title: "O protocolo de evacuação",
    scene: "O monitor central só libera a saída quando todos os mecanismos obrigatórios da estação confirmam funcionamento. Cada sala resolvida envia um sinal.",
    evidence: "Folha de verificação: keypad, dial, inventário, diálogo, sequência, interruptores, arquivo, sintonia, alavancas, rotores e 14 cadeados.",
    objective: "Completar a sessão inteira e verificar a confirmação final.",
    rule: "O monitor é somente leitura: suas mensagens refletem o estado das outras missões, não substituem as interações.",
    hints: [
      "Veja as rotas com status pending na navegação.",
      "Resolva as missões principais e os 14 cadeados na rota Locks.",
      "Quando os 11 mecanismos obrigatórios estiverem solved, o monitor mostrará Estação sincronizada."
    ],
    solution: "Todos os 11 mecanismos obrigatórios concluídos",
    steps: [
      "Abra as rotas pelo índice do Lab e conclua keypad, dial, inventory, dialogue, sequence, switches, reveal, tuner, levers e cipher.",
      "Na rota locks, resolva os 14 cadeados.",
      "Volte ao Feedback para conferir Estação sincronizada."
    ]
  },
  tuner: {
    title: "A frequência do pedido de socorro",
    scene: "Uma mensagem repetida atravessa as ondas curtas, mas o receptor está fora de sintonia. O filme encontrado no arquivo preserva a frequência correta.",
    evidence: "Rolo de filme: ‘canal de socorro / BANDA 73’. Frequência atual do rádio: 41.",
    objective: "Estabilizar o sinal de socorro.",
    rule: "O seletor aceita valores de 00 a 99; o sinal só confirma a banda exata.",
    hints: [
      "O número está na etiqueta do filme.",
      "Aumente a frequência a partir de 41 ou ajuste diretamente o slider.",
      "Sintonize a banda 73."
    ],
    solution: "Banda 73",
    steps: [
      "Leia BANDA 73 no rolo de filme.",
      "Arraste o seletor, use os botões de passo ou mova o slider para 73.",
      "Confirme o visor em 73 para estabilizar o sinal."
    ]
  },
  levers: {
    title: "O gerador das duas extremidades",
    scene: "O gerador perdeu o equilíbrio após uma descarga. Quatro alavancas controlam os corredores, e alimentar o eixo errado sobrecarrega a rede.",
    evidence: "Diagrama pintado no metal: N — [NÚCLEO] — S. Os braços E e W estão riscados com a inscrição NÃO ENERGIZAR.",
    objective: "Restaurar o fluxo de energia seguro.",
    rule: "Cada alavanca alterna ligado/desligado; a configuração completa precisa reproduzir o diagrama.",
    hints: [
      "Evite ativar os braços laterais.",
      "As extremidades do eixo vertical trabalham em conjunto.",
      "Coloque N e S em ON e E e W em OFF."
    ],
    solution: "N = ON, E = OFF, S = ON, W = OFF",
    steps: [
      "Acione a alavanca N até ON.",
      "Acione a alavanca S até ON.",
      "Deixe E e W em OFF; o console validará a configuração."
    ]
  },
  cipher: {
    title: "Os três cilindros do cofre",
    scene: "Uma mensagem codificada foi distribuída por três peças de evidência. O decodificador mecânico exige que os dígitos sejam alinhados em colunas.",
    evidence: "Marcas encontradas: chave de latão E-7; no inventário há 3 evidências; a última linha do relatório diz ‘1 arquivo central’.",
    objective: "Montar o código que abre o arquivo cifrado.",
    rule: "Há três rotores independentes, lidos da esquerda para a direita. Só a combinação completa valida.",
    hints: [
      "Cada rotor corresponde a uma evidência diferente.",
      "Leia 7 na chave, 3 na contagem de evidências e 1 no relatório.",
      "Ajuste os rotores para 7 | 3 | 1."
    ],
    solution: "731",
    steps: [
      "Ajuste o primeiro rotor para 7.",
      "Ajuste o segundo para 3.",
      "Ajuste o terceiro para 1; o conjunto 731 abre o cofre."
    ]
  },
  locks: {
    title: "A ala dos catorze arquivos",
    scene: "Uma ala de treinamento foi lacrada com 14 fechaduras diferentes. Cada porta protege uma peça da investigação e usa uma regra própria.",
    evidence: "Registro da ala: ‘Todos os 14 selos devem confirmar abertura; as instruções e as evidências ficam junto de cada porta.’",
    objective: "Concluir os 14 minigames independentes sem perder a sequência de trabalho.",
    rule: "Cada seção contém seu próprio cadeado, narrativa, evidência, validação e ajuda opcional. A rota só fica solved quando os 14 terminarem.",
    hints: [
      "Use o índice de cadeados para encontrar seções pendentes.",
      "O botão Validar confirma a entrada de cada fechadura.",
      "Resolva todas as 14 seções; cada uma oferece sua própria solução revelável."
    ],
    solution: "14 de 14 cadeados abertos",
    steps: [
      "Percorra o índice de cadeados.",
      "Resolva cada minigame usando o controle Three.js e pressione Validar quando a fechadura pedir.",
      "Confira 14/14 seções resolvidas e a rota locks como solved."
    ]
  }
};

export const LOCK_STORIES: Record<string, PuzzleStory> = {
  numeric: {
    title: "O armário de quatro gavetas",
    scene: "Um zelador numerou quatro gavetas antes de trancar o painel central. A senha é a ordem física de abertura.",
    evidence: "Na etiqueta: ‘Abrir gavetas 1, 2, 3 e 4 — da menor para a maior’.",
    objective: "Destravar o armário numerado.",
    rule: "Digite quatro dígitos e confirme com Validar.",
    hints: [
      "A etiqueta descreve uma ordem crescente.",
      "São os quatro primeiros números positivos.",
      "Digite 1234 e pressione Validar."
    ],
    solution: "1234",
    steps: [
      "Digite 1, 2, 3 e 4 no teclado numérico.",
      "Pressione Validar.",
      "Confira a mensagem Cadeado aberto."
    ]
  },
  pattern: {
    title: "A trilha gravada no vidro",
    scene: "No vidro de um dormitório há nove pontos como em uma tela de desbloqueio. Uma linha riscada atravessa a sala em zigue-zague.",
    evidence: "Desenho: canto superior esquerdo → centro → canto inferior direito → canto inferior esquerdo.",
    objective: "Reproduzir a trilha de segurança.",
    rule: "Use a grade 3×3 numerada de 1 a 9; a ordem dos pontos é obrigatória.",
    hints: [
      "A numeração começa no canto superior esquerdo.",
      "Centro é 5; cantos inferior direito e esquerdo são 9 e 7.",
      "Ligue/toque 1 → 5 → 9 → 7 e valide."
    ],
    solution: "1 → 5 → 9 → 7",
    steps: [
      "Toque ou trace os pontos 1, 5, 9 e 7 na sequência indicada.",
      "Pressione Validar.",
      "Caso a ordem esteja errada, limpe e refaça a trilha."
    ]
  },
  direction: {
    title: "A rota do mensageiro",
    scene: "Um mensageiro deixou uma ordem de fuga em quatro setas; o pad direcional é a única forma de reproduzir seu trajeto.",
    evidence: "Bilhete: subir a escada, virar à direita, descer ao túnel e voltar para a esquerda.",
    objective: "Enviar a rota correta ao painel.",
    rule: "As setas devem ser acionadas na sequência exata.",
    hints: [
      "Traduza os verbos do bilhete em direções.",
      "A rota dá uma volta completa pelos quatro rumos.",
      "Pressione ↑, →, ↓ e ←, depois Validar."
    ],
    solution: "↑ → ↓ ←",
    steps: [
      "Toque cima (↑).",
      "Toque direita (→), depois baixo (↓) e esquerda (←).",
      "Pressione Validar."
    ]
  },
  compass: {
    title: "A agulha da torre",
    scene: "Na torre de observação, o navegador marcou uma varredura gradual do horizonte. O sensor da bússola pode registrar os rumos.",
    evidence: "Registro de vigia: começar no Norte e avançar 45° por leitura, quatro vezes, até o Sudeste.",
    objective: "Recriar a varredura angular do vigia.",
    rule: "Registre os quatro rumos em ordem. Em dispositivos compatíveis, alinhe a bússola; use o fallback visível quando necessário.",
    hints: [
      "Cada passo gira 45° no sentido horário.",
      "Os quatro primeiros rumos são norte, nordeste, leste e sudeste.",
      "N → NE → E → SE, depois Validar."
    ],
    solution: "N → NE → E → SE",
    steps: [
      "Ative a bússola, se o navegador solicitar, ou use os controles de direção alternativos.",
      "Registre N, depois NE, E e SE em sequência.",
      "Pressione Validar."
    ]
  },
  colors: {
    title: "O semáforo do laboratório",
    scene: "Quatro lâmpadas de segurança piscaram antes do blecaute. O operador anotou as cores na margem do relatório.",
    evidence: "Relatório de falha: alarme vermelho, céu azul, saída verde, sinal amarelo.",
    objective: "Repetir o código de luzes.",
    rule: "Escolha as quatro cores pela ordem das imagens descritas e valide.",
    hints: [
      "Cada substantivo do relatório corresponde a uma cor.",
      "As duas primeiras são vermelho e azul.",
      "Vermelho → Azul → Verde → Amarelo; Validar."
    ],
    solution: "Vermelho → Azul → Verde → Amarelo",
    steps: [
      "Selecione Vermelho e Azul.",
      "Selecione Verde e Amarelo.",
      "Pressione Validar."
    ]
  },
  musical: {
    title: "A melodia da caixa de música",
    scene: "Uma pequena caixa de música abre o arquivo sonoro quando reconhece o motivo escrito na partitura.",
    evidence: "Partitura: Dó da quarta oitava, Mi da quarta, Sol da quarta; voltar ao Dó da quarta.",
    objective: "Executar a frase musical correta.",
    rule: "A entrada é a sequência de quatro teclas. Som não é obrigatório: os nomes das notas identificam os controles.",
    hints: [
      "A melodia sobe duas vezes e retorna à nota inicial.",
      "As notas intermediárias são Mi4 e Sol4.",
      "Toque Dó4, Mi4, Sol4, Dó4 e valide."
    ],
    solution: "Dó4 → Mi4 → Sol4 → Dó4",
    steps: [
      "Toque a tecla Dó4.",
      "Toque Mi4, Sol4 e novamente Dó4.",
      "Pressione Validar."
    ]
  },
  password: {
    title: "A palavra na lombada",
    scene: "Uma biblioteca subterrânea esconde uma porta por trás da estante. O único livro sem poeira contém a palavra de acesso.",
    evidence: "Na lombada dourada: ATLAS. Nota de manutenção: ‘Aceita letras maiúsculas ou minúsculas’.",
    objective: "Entrar na seção proibida da biblioteca.",
    rule: "Digite a palavra inteira; não use números ou espaços adicionais.",
    hints: [
      "A resposta está escrita na lombada do livro.",
      "São cinco letras, começando por A.",
      "Digite atlas e pressione Validar."
    ],
    solution: "atlas",
    steps: [
      "Abra o campo de senha.",
      "Digite atlas.",
      "Pressione Validar."
    ]
  },
  login: {
    title: "O computador do professor",
    scene: "Um terminal escolar guarda os diários de um laboratório. Um adesivo de instruções explica as credenciais provisórias.",
    evidence: "Credencial temporária: usuário PROFESSOR, senha ESCAPE.",
    objective: "Autenticar-se no computador da sala.",
    rule: "Nome de usuário e senha são campos separados, ambos obrigatórios.",
    hints: [
      "Há dois valores no adesivo.",
      "O nome é professor e a senha é escape.",
      "Digite professor no identificador e escape na senha; Validar."
    ],
    solution: "professor / escape",
    steps: [
      "Digite professor no campo de identificador.",
      "Digite escape no campo de senha.",
      "Pressione Validar."
    ]
  },
  switches: {
    title: "O desenho das janelas",
    scene: "O laboratório possui uma parede de dezesseis luzes. A última configuração está marcada com pontos na planta.",
    evidence: "Na grade numerada 1–16, os pontos ativos estão em 1, 4, 6, 11, 13 e 16. Todos os outros são apagados.",
    objective: "Restaurar o desenho luminoso.",
    rule: "Somente o conjunto final de posições ligadas importa; a ordem de toque não altera o resultado.",
    hints: [
      "A grade tem quatro linhas e quatro colunas.",
      "Existem exatamente seis pontos acesos.",
      "Ligue 1, 4, 6, 11, 13 e 16, depois Validar."
    ],
    solution: "1, 4, 6, 11, 13 e 16 ligados",
    steps: [
      "Ative somente as células 1, 4 e 6.",
      "Ative 11, 13 e 16.",
      "Mantenha as outras desligadas e pressione Validar."
    ]
  },
  "ordered-switches": {
    title: "Os pulsos de quatro segundos",
    scene: "Um equipamento só aceita os impulsos no tempo correto, registrados em uma fita perfurada.",
    evidence: "Fita de acionamento, da primeira à última marca: 2 → 5 → 9 → 14.",
    objective: "Reproduzir a sequência de impulsos.",
    rule: "Diferente do painel binário, a ordem de ativação importa.",
    hints: [
      "Não basta deixar as mesmas casas ligadas.",
      "Siga a fita exatamente da esquerda para a direita.",
      "Acione 2 → 5 → 9 → 14 e pressione Validar."
    ],
    solution: "2 → 5 → 9 → 14",
    steps: [
      "Pressione a célula 2.",
      "Depois pressione 5, 9 e 14 nessa ordem.",
      "Pressione Validar."
    ]
  },
  "grid-4x4": {
    title: "A diagonal da câmera antiga",
    scene: "Uma câmera projetou um feixe em quatro janelas da matriz 4×4. A imagem exige reproduzir a diagonal principal.",
    evidence: "Quadrante de 4 colunas: comece no canto superior esquerdo e desça uma linha e uma coluna por vez.",
    objective: "Iluminar os quatro pontos da diagonal.",
    rule: "Selecione as quatro células corretas na matriz numerada de 1 a 16.",
    hints: [
      "A diagonal começa na posição 1.",
      "O passo entre as posições na grade é de cinco casas.",
      "Marque 1, 6, 11 e 16; Validar."
    ],
    solution: "1 → 6 → 11 → 16",
    steps: [
      "Marque as células 1 e 6.",
      "Marque 11 e 16.",
      "Pressione Validar."
    ]
  },
  "grid-5x5": {
    title: "A constelação de cinco estrelas",
    scene: "O observatório mostra 25 placas de luz. Uma constelação de cinco estrelas cruza o quadrado pelo centro.",
    evidence: "Mapa 5×5: uma estrela em cada linha e coluna, na diagonal do canto superior esquerdo ao inferior direito.",
    objective: "Acender a constelação na matriz ampliada.",
    rule: "A matriz tem cinco colunas e cinco linhas; escolha as cinco células da diagonal principal.",
    hints: [
      "Comece pela casa 1, no topo à esquerda.",
      "Avance seis posições na numeração da matriz.",
      "Marque 1, 7, 13, 19 e 25 e valide."
    ],
    solution: "1 → 7 → 13 → 19 → 25",
    steps: [
      "Selecione 1, 7 e 13.",
      "Depois selecione 19 e 25.",
      "Pressione Validar."
    ]
  },
  "virtual-geolocation": {
    title: "O ponto vermelho no mapa",
    scene: "Uma equipe precisa marcar um abrigo no mapa digital de Belo Horizonte. A coordenada está no transmissor de emergência.",
    evidence: "Sinal do abrigo: latitude −19.9245; longitude −43.9352; margem aceitável de 180 m.",
    objective: "Encontrar o ponto de encontro no mapa virtual.",
    rule: "O mapa avalia distância até a coordenada-alvo; o Lab disponibiliza um alvo de teste sem usar GPS real.",
    hints: [
      "As coordenadas estão registradas no transmissor.",
      "O ponto correto é o centro indicado no mapa de teste.",
      "Escolha o alvo de teste ou marque −19.9245, −43.9352 e valide."
    ],
    solution: "−19.9245, −43.9352 (tolerância de 180 m)",
    steps: [
      "No mapa virtual, selecione o centro ou o botão Selecionar alvo de teste.",
      "Confira as coordenadas −19.9245, −43.9352.",
      "Pressione Validar."
    ]
  },
  "real-geolocation": {
    title: "O receptor do ponto de encontro",
    scene: "Uma missão de campo exige provar chegada a uma área de segurança. Para testar de casa, o terminal inclui uma simulação explícita.",
    evidence: "Destino registrado: latitude −19.9323, longitude −43.9376; alcance de 150 m. A simulação é permitida apenas no Lab.",
    objective: "Confirmar presença virtual ou física na área delimitada.",
    rule: "Use GPS apenas se estiver no local e consentir; no Lab a simulação reproduz a localização-alvo sem exigir deslocamento.",
    hints: [
      "Não é preciso viajar para testar o componente.",
      "Há uma opção de simular posição na interface do Lab.",
      "Simule −19.9323, −43.9376 e pressione Validar."
    ],
    solution: "−19.9323, −43.9376 (tolerância de 150 m)",
    steps: [
      "Pressione Simular posição no Lab.",
      "Confira as coordenadas de destino −19.9323, −43.9376.",
      "Pressione Validar."
    ]
  }
};
