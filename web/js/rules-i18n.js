/* Regolamento nelle altre lingue: stessa struttura di rules-data.js. */
(function (root) {
  'use strict';
  root.RULES_I18N = {
    en: [
      { sec: 'The goal', items: [
        { t: 'What you have to do', a: 'Each round you predict how many tricks you will take. If you get the exact number you score points, otherwise you lose some. Whoever has the most points at the end wins.', k: 'goal aim how to play win objective' },
        { t: 'What is a trick', a: 'Each player plays one card in turn: the cards played form a trick. If everyone has five cards, the round has five tricks.', k: 'trick round of cards' },
        { t: 'What is a round', a: 'A round is the whole cycle: dealing, bids, tricks and scoring. In the first round you get one card, in the second two, and so on.', k: 'round hand cycle' }
      ]},
      { sec: 'The deck', items: [
        { t: 'Which cards it has', a: '60 cards: four suits (yellow, red, green, blue) with values from 1 to 13, plus 4 Wizards and 4 Jesters. Wizards and Jesters have no suit.', k: 'cards deck how many wizard jester numbers suits colours', cards: ['y7', 'r13', 'W1', 'J1'] }
      ]},
      { sec: 'Setup and dealing', items: [
        { t: 'How many players and rounds', a: '3 to 6 players. The number of rounds depends on the players: 3 players 20 rounds, 4 players 15, 5 players 12, 6 players 10.', k: 'number of players length how many rounds long game' },
        { t: 'Who is the dealer', a: 'The first dealer is the first player in the waiting room list. After each round the role passes to the next player clockwise.', k: 'dealer who deals first' },
        { t: 'How many cards you get', a: 'One card each in the first round, two in the second, three in the third, up to the last round, when the whole deck is dealt.', k: 'dealing cards how many receive' },
        { t: 'How trump is decided', a: 'The leftover cards form the deck and the top one is turned face up. Its suit is trump for the round.', k: 'trump suit turned up', cards: ['r8'] },
        { t: 'If a Wizard is turned up', a: 'The dealer looks at their cards, picks one of the four suits, and that becomes trump.', k: 'wizard turned up trump choice dealer chooses', cards: ['W2'] },
        { t: 'If a Jester is turned up', a: 'There is no trump this round.', k: 'jester turned up no trump', cards: ['J2'] },
        { t: 'The last round', a: 'In the last round all cards are dealt, so nothing is left to turn up and there is no trump.', k: 'last round final trump all cards' }
      ]},
      { sec: 'Bids', items: [
        { t: 'Who bids first', a: 'The player to the dealer\'s left, then the others clockwise. The dealer bids last.', k: 'bid who starts order prediction' },
        { t: 'Can I bid zero?', a: 'Yes. Bidding zero tricks and taking none is worth 20 points.', k: 'zero no tricks bid 0' },
        { t: 'Must the total add up?', a: 'No. The sum of the bids can be higher or lower than the number of tricks, and several players may bid the same number. The Plus or minus one variant is the exception.', k: 'sum total bids equal number of tricks same' },
        { t: 'Can I see the others\' bids?', a: 'Yes. Bids are public: next to each player\'s photo on the table there is a red seal with the number bid, and a small stack of cards with the tricks already taken. The seal turns green when tricks taken equal the bid, grey when they exceed it. In the box at the top, next to each name, you see tricks won / bid and the points.', k: 'see bids others public seal stack tricks photo box names points' }
      ]},
      { sec: 'Playing tricks', items: [
        { t: 'Who plays first', a: 'In the first trick the player to the dealer\'s left leads. In later tricks whoever won the previous trick leads. Play goes clockwise.', k: 'who starts first card lead turn' },
        { t: 'Following suit', a: 'The leader may play any card. The others must follow the suit of the first card if they have at least one. The suit to follow does not change during the trick.', k: 'follow suit must obligation' },
        { t: 'If I don\'t have the suit led', a: 'You may play any card: a trump or another suit. You don\'t have to play trump.', k: 'no suit missing trump discard' },
        { t: 'Wizards and Jesters can always be played', a: 'Yes, at any time, even if you have the suit led, because they have no suit.', k: 'can I play wizard jester even if I have the suit always exception', cards: ['W3', 'J3'] },
        { t: 'Can I play trump if I have the suit?', a: 'No, unless trump is the suit led. If you have the suit led you must play it, or a Wizard or a Jester.', k: 'trump ruff have the suit can I' },
        { t: 'Tricks won', a: 'Whoever wins a trick keeps it face down. The number of tricks taken is always visible: it is the small stack of cards next to each player\'s photo.', k: 'tricks won face down count look' }
      ]},
      { sec: 'Who wins the trick', items: [
        { t: 'Order of strength', a: 'The first Wizard played wins. If there are no Wizards, the highest trump wins. If there are no trumps either, the highest card of the suit led wins.', k: 'who wins trick strength order rank beats highest' },
        { t: 'Several Wizards in one trick', a: 'The first Wizard played wins. Later Wizards don\'t count.', k: 'two wizards several wizards second wizard same trick', cards: ['W1', 'W4'] },
        { t: 'Jesters always lose', a: 'A Jester loses to any other card. The only exception: if the trick has only Jesters, the first Jester played wins.', k: 'jester loses wins only jesters all', cards: ['J1', 'J4'] },
        { t: 'A card of another suit', a: 'A card that is neither trump nor the suit led cannot win, even with the highest number.', k: 'other suit high number does not win thirteen 13' }
      ]},
      { sec: 'Leading with a Wizard or a Jester', items: [
        { t: 'If a Wizard is led', a: 'Everyone else may play any card, including Wizards or Jesters. The trick goes to whoever led the Wizard.', k: 'lead wizard first starts free', cards: ['W1'] },
        { t: 'If a Jester is led', a: 'The suit is not decided yet. The first numbered card played sets it: from then on the others must follow it.', k: 'lead jester first starts suit decided', cards: ['J1', 'r7'] },
        { t: 'Jester followed by a Wizard', a: 'If a Wizard is played after the Jester, the remaining players may play any card and that Wizard wins, if it is the first.', k: 'jester then wizard after free' },
        { t: 'Jester followed by another Jester', a: 'The suit is still to be set. The first numbered card or the first Wizard played afterwards decides.', k: 'two jesters in a row suit still' }
      ]},
      { sec: 'Scoring', items: [
        { t: 'Exact bid', a: 'You get a 20-point bonus plus 10 points for every trick taken. Example: bid 3 and take 3, you score 50 points.', k: 'points score exact right bonus calculation how much' },
        { t: 'Wrong bid', a: 'You lose 10 points for every trick of difference, over or under. Example: bid 1 and take 4, you lose 30 points.', k: 'points wrong lose penalty minus difference' },
        { t: 'Can the score be negative?', a: 'Yes, the total can go below zero.', k: 'negative below zero score' },
        { t: 'Who keeps score', a: 'The game calculates everything. With the Score sheet button you see the points and bids of every round.', k: 'score keeper sheet count automatic table' }
      ]},
      { sec: 'End of the game', items: [
        { t: 'When it ends and who wins', a: 'After the last round the player with the most points wins.', k: 'end game winner finish' },
        { t: 'In case of a tie', a: 'If several players share the top score, they all win.', k: 'tie draw same score' }
      ]},
      { sec: 'Variants', items: [
        { t: 'Plus or minus one', a: 'It is on by default and can be turned off in the waiting room. The total of the bids cannot equal the number of tricks in the round: the dealer, bidding last, cannot pick the number that would make it add up. The game blocks it automatically.', k: 'variant plus minus one total different forbidden dealer rule' },
        { t: 'Blind first round', a: 'It is on by default and can be turned off in the waiting room. Only in the first round, when everyone has one card, your own card stays face down: you see the others\' cards, next to their photos, but not yours. Bid by looking at theirs. On your turn tap the face-down card and play it without knowing what it is: you discover it on the table.', k: 'variant blind face down first round indian I cannot see my card others' },
        { t: 'Variants in the global search', a: 'Before searching, pick the variants: you are seated only with players who chose the same ones.', k: 'variants global search online choose' }
      ]},
      { sec: 'How the app works', items: [
        { t: 'Turn order and the dealer', a: 'The players\' photos sit around the table in their order, and the arrows show the clockwise direction. Whoever must play or bid lights up, on the table and in the names box at the top. Before the bids, a small number next to each photo (1°, 2°…) shows the bidding order. The D token marks the dealer. At the start of each round a banner says who deals and who bids first.', k: 'turn order whose turn dealer token clockwise next first box photo' },
        { t: 'Time to bid', a: '1 minute each by default, changeable in the waiting room. When time runs out the game enters a bid estimated from your cards.', k: 'time limit minute timer expired automatic bid' },
        { t: 'Time to play a card', a: '30 seconds by default, changeable in the waiting room. When time runs out the game plays a valid card for you.', k: 'time card limit timer expired automatic seconds' },
        { t: 'Profile and stats', a: 'Open the profile from the home page: choose a name and picture and see your stats, kept separate for games with other players and games against bots.', k: 'profile photo avatar stats wins record' },
        { t: 'Music, sounds and effects', a: 'In the menu, under Sound and effects, you can turn off or lower the music, the card sounds, the tap effects and vibration.', k: 'music sounds volume effects vibration silence turn off' },
        { t: 'Language', a: 'On the home page and in the menu, under Sound and effects, you can switch the app between Italian, English, Spanish, French and German. Each player sees the game in their own language.', k: 'language italian english spanish french german translate' },
        { t: 'How to play a card', a: 'Tap a card once to lift it and again to play it, or drag it towards the table. When it is your turn, cards you can\'t play are darkened.', k: 'play card tap drag darkened cannot' },
        { t: 'If the connection drops', a: 'The game reconnects by itself and gets your seat back. If you are away for more than 30 seconds on your turn, the game plays for you until you return. If you close the page, open the game again: you will find the button to rejoin.', k: 'connection dropped disconnected left rejoin resume internet offline phone locked' },
        { t: 'iPhone and mobile data', a: 'When two devices cannot reach each other directly, as often happens with iPhones or on mobile data, the game switches by itself to a backup connection through a secure web service. It takes a few seconds longer to join, then you play normally. Messages are encrypted with the game code.', k: 'iphone ios safari mobile data cannot join connection backup relay' },
        { t: 'Global search', a: 'From the home page, Find players online seats you with whoever is searching at the same time, including people you don\'t know. With 3 or more players the game starts by itself after 15 seconds without new arrivals; with 2 after 45 seconds, adding a bot; 6 at most. Anyone can press Start now. One of the devices found hosts the table for everyone. Voice chat stays off until you turn it on.', k: 'global search online strangers find players matchmaking game' },
        { t: 'Who creates the game', a: 'The device that creates the game hosts the table for everyone: it must stay on, with the page open. If it reloads, the game resumes where it was.', k: 'host creator main device on close page' },
        { t: 'Voice chat with people in the same room', a: 'People in the same place pick the same Place letter. Only one device per Place can be in voice chat, so the audio doesn\'t overlap. The others at the table play without joining voice.', k: 'voice microphone audio same room place echo overlap together distance' },
        { t: 'If the microphone doesn\'t work', a: 'Check that you allowed the browser to use the microphone. If you deny it, you can still join and listen to the others.', k: 'microphone permission not working cannot hear audio problem listen' }
      ]}
    ],
    es: [
      { sec: 'El objetivo', items: [
        { t: 'Qué hay que hacer', a: 'En cada mano predices cuántas bazas harás. Si aciertas el número exacto ganas puntos; si no, los pierdes. Al final gana quien tenga más puntos.', k: 'objetivo cómo se juega ganar' },
        { t: 'Qué es una baza', a: 'Cada jugador juega una carta por turno: las cartas jugadas forman una baza. Si todos tienen cinco cartas, en la mano hay cinco bazas.', k: 'baza ronda de cartas' },
        { t: 'Qué es una mano', a: 'Una mano es el ciclo completo: reparto, predicciones, bazas y puntuación. En la primera mano se recibe una carta, en la segunda dos, y así sucesivamente.', k: 'mano ronda ciclo' }
      ]},
      { sec: 'La baraja', items: [
        { t: 'Qué cartas tiene', a: '60 cartas: cuatro palos (amarillo, rojo, verde, azul) con valores del 1 al 13, más 4 Magos y 4 Bufones. Magos y Bufones no tienen palo.', k: 'cartas baraja cuántas mago bufón números palos colores', cards: ['y7', 'r13', 'W1', 'J1'] }
      ]},
      { sec: 'Preparación y reparto', items: [
        { t: 'Cuántos jugadores y cuántas manos', a: 'Se juega de 3 a 6. Las manos dependen de los jugadores: 3 jugadores 20 manos, 4 jugadores 15, 5 jugadores 12, 6 jugadores 10.', k: 'número jugadores duración cuántas manos partida larga' },
        { t: 'Quién reparte', a: 'El primer repartidor es el primer jugador de la lista de la sala de espera. Tras cada mano el papel pasa al siguiente en sentido horario.', k: 'repartidor quién reparte primero' },
        { t: 'Cuántas cartas se reciben', a: 'Una carta cada uno en la primera mano, dos en la segunda, tres en la tercera, hasta la última, en la que se reparte toda la baraja.', k: 'reparto cartas cuántas recibir' },
        { t: 'Cómo se decide el triunfo', a: 'Las cartas sobrantes forman el mazo y la primera se pone boca arriba. Su palo es el triunfo de la mano.', k: 'triunfo palo descubierta', cards: ['r8'] },
        { t: 'Si sale un Mago', a: 'El repartidor mira sus cartas, elige uno de los cuatro palos y ese pasa a ser el triunfo.', k: 'mago descubierto triunfo elección repartidor elige', cards: ['W2'] },
        { t: 'Si sale un Bufón', a: 'En esta mano no hay triunfo.', k: 'bufón descubierto sin triunfo', cards: ['J2'] },
        { t: 'La última mano', a: 'En la última mano se reparten todas las cartas, así que no queda nada por descubrir y no hay triunfo.', k: 'última mano final triunfo todas las cartas' }
      ]},
      { sec: 'Las predicciones', items: [
        { t: 'Quién predice primero', a: 'El jugador a la izquierda del repartidor, y luego los demás en sentido horario. El repartidor predice el último.', k: 'predicción quién empieza orden apuesta' },
        { t: '¿Se puede predecir cero?', a: 'Sí. Predecir cero bazas y no hacer ninguna vale 20 puntos.', k: 'cero ninguna baza predicción 0' },
        { t: '¿Tiene que cuadrar el total?', a: 'No. La suma de las predicciones puede ser mayor o menor que el número de bazas, y varios jugadores pueden predecir lo mismo. La excepción es la variante Más o menos uno.', k: 'suma total predicciones igual número de bazas mismo' },
        { t: '¿Se ven las predicciones de los demás?', a: 'Sí. Son públicas: junto a la foto de cada jugador en la mesa hay un sello rojo con el número previsto y un montoncito de cartas con las bazas ya hechas. El sello se vuelve verde cuando las bazas hechas igualan la predicción, gris cuando la superan. En el recuadro de arriba, junto a cada nombre, ves bazas hechas / previstas y los puntos.', k: 'ver predicciones otros públicas sello montón bazas foto recuadro nombres puntos' }
      ]},
      { sec: 'Jugar las bazas', items: [
        { t: 'Quién juega primero', a: 'En la primera baza sale el jugador a la izquierda del repartidor. En las siguientes sale quien ganó la baza anterior. Se sigue en sentido horario.', k: 'quién empieza primera carta salida turno' },
        { t: 'La obligación de seguir el palo', a: 'Quien sale puede jugar cualquier carta. Los demás deben seguir el palo de la primera carta si tienen al menos una. El palo a seguir no cambia durante la baza.', k: 'seguir palo obligación tengo que' },
        { t: 'Si no tengo el palo pedido', a: 'Puedes jugar cualquier carta: un triunfo u otro palo. No estás obligado a jugar triunfo.', k: 'no tengo palo falla triunfo descartar' },
        { t: 'Magos y Bufones se pueden jugar siempre', a: 'Sí, en cualquier momento, aunque tengas el palo pedido, porque no tienen palo.', k: 'puedo jugar mago bufón aunque tenga el palo siempre excepción', cards: ['W3', 'J3'] },
        { t: '¿Puedo jugar triunfo si tengo el palo?', a: 'No, salvo que el triunfo sea justo el palo a seguir. Si tienes el palo pedido debes jugarlo, o un Mago o un Bufón.', k: 'triunfo fallar tengo el palo puedo' },
        { t: 'Las bazas ganadas', a: 'Quien gana una baza la guarda boca abajo. El número de bazas hechas siempre está a la vista: es el montoncito de cartas junto a la foto de cada jugador.', k: 'bazas ganadas boca abajo contar mirar' }
      ]},
      { sec: 'Quién gana la baza', items: [
        { t: 'El orden de fuerza', a: 'Gana el primer Mago jugado. Si no hay Magos, gana el triunfo más alto. Si tampoco hay triunfos, gana la carta más alta del palo a seguir.', k: 'quién gana baza fuerza orden jerarquía gana más alta' },
        { t: 'Varios Magos en la misma baza', a: 'Gana el primer Mago jugado. Los siguientes no cuentan.', k: 'dos magos varios magos segundo mago misma baza', cards: ['W1', 'W4'] },
        { t: 'Los Bufones siempre pierden', a: 'Un Bufón pierde contra cualquier otra carta. Única excepción: si en la baza solo hay Bufones, gana el primero jugado.', k: 'bufón pierde gana solo bufones todos', cards: ['J1', 'J4'] },
        { t: 'Carta de otro palo', a: 'Una carta que no es triunfo ni del palo a seguir no puede ganar, aunque tenga el número más alto.', k: 'otro palo número alto no gana trece 13' }
      ]},
      { sec: 'Salir con un Mago o un Bufón', items: [
        { t: 'Si se sale con un Mago', a: 'Los demás pueden jugar cualquier carta, también Magos o Bufones. La baza es de quien salió con el Mago.', k: 'salida mago primero empieza libre', cards: ['W1'] },
        { t: 'Si se sale con un Bufón', a: 'El palo aún no está decidido. Lo fija la primera carta numerada jugada: desde entonces los demás deben seguirlo.', k: 'salida bufón primero empieza palo decidido', cards: ['J1', 'r7'] },
        { t: 'Bufón seguido de un Mago', a: 'Si después del Bufón se juega un Mago, los que quedan pueden jugar cualquier carta y gana ese Mago, si es el primero.', k: 'bufón luego mago después libre' },
        { t: 'Bufón seguido de otro Bufón', a: 'El palo sigue sin decidir. Lo fija la primera carta numerada o el primer Mago jugado después.', k: 'dos bufones seguidos palo todavía' }
      ]},
      { sec: 'La puntuación', items: [
        { t: 'Predicción exacta', a: 'Ganas 20 puntos de bonificación más 10 por cada baza hecha. Ejemplo: predices 3 y haces 3, obtienes 50 puntos.', k: 'puntos puntuación exacta acierto bonificación cálculo cuánto vale' },
        { t: 'Predicción equivocada', a: 'Pierdes 10 puntos por cada baza de diferencia, de más o de menos. Ejemplo: predices 1 y haces 4, pierdes 30 puntos.', k: 'puntos equivocada pierdo penalización menos diferencia' },
        { t: '¿La puntuación puede ser negativa?', a: 'Sí, el total puede bajar de cero.', k: 'negativa bajo cero puntuación' },
        { t: 'Quién lleva la cuenta', a: 'El juego lo calcula todo. Con el botón Hoja de puntos ves los puntos y las predicciones de cada mano.', k: 'anotador hoja cuenta cálculo automático tabla' }
      ]},
      { sec: 'Final de la partida', items: [
        { t: 'Cuándo termina y quién gana', a: 'Tras la última mano gana quien tiene más puntos.', k: 'final partida ganador termina' },
        { t: 'En caso de empate', a: 'Si varios jugadores comparten la puntuación máxima, ganan todos.', k: 'empate misma puntuación' }
      ]},
      { sec: 'Variantes', items: [
        { t: 'Más o menos uno', a: 'Está activa por defecto y se puede quitar en la sala de espera. El total de las predicciones no puede ser igual al número de bazas de la mano: el repartidor, que predice el último, no puede elegir el número que haría cuadrar la cuenta. El juego lo bloquea automáticamente.', k: 'variante más menos uno total distinto prohibido repartidor regla' },
        { t: 'Primera mano a ciegas', a: 'Está activa por defecto y se puede quitar en la sala de espera. Solo en la primera mano, cuando cada uno tiene una carta, la tuya queda boca abajo: ves las cartas de los demás, junto a sus fotos, pero no la tuya. Predice mirando las suyas. En tu turno tocas la carta boca abajo y la juegas sin saber cuál es: la descubres en la mesa.', k: 'variante ciegas boca abajo primera mano india no veo mi carta otros' },
        { t: 'Variantes en la búsqueda global', a: 'Antes de buscar eliges las variantes: solo te siento con quien haya elegido las mismas.', k: 'variantes búsqueda global en línea elegir' }
      ]},
      { sec: 'Cómo funciona la app', items: [
        { t: 'El turno y el repartidor', a: 'Las fotos de los jugadores están alrededor de la mesa en su orden, y las flechas recuerdan el sentido horario. Quien debe jugar o predecir se ilumina, en la mesa y en el recuadro de nombres de arriba. Antes de las predicciones, un numerito junto a cada foto (1°, 2°…) indica el orden. La ficha R indica el repartidor. Al empezar cada mano un cartel dice quién reparte y quién predice primero.', k: 'turno orden a quién le toca repartidor ficha sentido horario siguiente primero recuadro foto' },
        { t: 'Tiempo para predecir', a: '1 minuto por defecto, modificable en la sala de espera. Al acabarse, el juego pone una predicción estimada según tus cartas.', k: 'tiempo límite minuto temporizador agotado predicción automática' },
        { t: 'Tiempo para jugar una carta', a: '30 segundos por defecto, modificable en la sala de espera. Al acabarse, el juego juega por ti una carta válida.', k: 'tiempo carta límite temporizador agotado automático segundos' },
        { t: 'Perfil y estadísticas', a: 'Abre el perfil desde la página de inicio: elige nombre e imagen y mira tus estadísticas, separadas entre partidas con otros jugadores y partidas contra bots.', k: 'perfil foto avatar estadísticas victorias récord' },
        { t: 'Música, sonidos y efectos', a: 'En el menú, en Sonido y efectos, puedes apagar o bajar la música, los sonidos de las cartas, los efectos al tocar y la vibración.', k: 'música sonidos volumen efectos vibración silencio apagar' },
        { t: 'Idioma', a: 'En la página de inicio y en el menú, en Sonido y efectos, puedes cambiar la app entre italiano, inglés, español, francés y alemán. Cada jugador ve el juego en su idioma.', k: 'idioma italiano inglés español francés alemán traducir' },
        { t: 'Cómo se juega una carta', a: 'Toca una vez la carta para levantarla y otra vez para jugarla, o arrástrala hacia la mesa. Cuando te toca, las cartas que no puedes jugar aparecen oscurecidas.', k: 'jugar carta tocar arrastrar oscurecidas no puedo' },
        { t: 'Si se cae la conexión', a: 'El juego se reconecta solo y recupera tu sitio. Si estás ausente más de 30 segundos en tu turno, el juego juega por ti hasta que vuelvas. Si cierras la página, vuelve a abrir el juego: encontrarás el botón para volver a entrar.', k: 'conexión caída desconectado salir volver a entrar internet sin conexión teléfono bloqueado' },
        { t: 'iPhone y datos móviles', a: 'Cuando dos dispositivos no pueden comunicarse directamente, como pasa a menudo con los iPhone o con datos móviles, el juego pasa solo a una conexión de reserva a través de un servicio web seguro. Entrar tarda unos segundos más y luego se juega con normalidad. Los mensajes van cifrados con el código de la partida.', k: 'iphone ios safari datos móviles no puedo entrar conexión reserva' },
        { t: 'Búsqueda global', a: 'Desde la página de inicio, Buscar jugadores en línea te sienta con quien esté buscando al mismo tiempo, también personas que no conoces. Con 3 o más jugadores la partida empieza sola tras 15 segundos sin nuevas llegadas; con 2, tras 45 segundos y con un bot más; máximo 6. Cualquiera puede pulsar Empezar ya. Uno de los dispositivos encontrados hace de mesa para todos. El chat de voz sigue apagado hasta que lo actives.', k: 'búsqueda global en línea desconocidos buscar jugadores emparejamiento partida' },
        { t: 'Quién crea la partida', a: 'El dispositivo que crea la partida hace de mesa para todos: debe seguir encendido, con la página abierta. Si se recarga, la partida sigue donde estaba.', k: 'anfitrión creador dispositivo principal encendido cerrar página' },
        { t: 'Chat de voz con personas en la misma habitación', a: 'Quien está en el mismo sitio elige la misma letra de Lugar. Solo un dispositivo por Lugar puede estar en la voz, así el audio no se solapa. Los demás juegan sin entrar en la voz.', k: 'voz micrófono audio misma habitación lugar eco solapa juntos distancia' },
        { t: 'Si el micrófono no funciona', a: 'Comprueba que has dado permiso al navegador para usar el micrófono. Si lo niegas, aun así puedes entrar y escuchar a los demás.', k: 'micrófono permiso no funciona no oigo audio problema escuchar' }
      ]}
    ],
    fr: [
      { sec: 'Le but du jeu', items: [
        { t: 'Ce qu\'il faut faire', a: 'À chaque manche, tu annonces combien de plis tu vas faire. Si tu trouves le nombre exact tu marques des points, sinon tu en perds. À la fin, celui qui a le plus de points gagne.', k: 'but objectif comment jouer gagner' },
        { t: 'Qu\'est-ce qu\'un pli', a: 'Chaque joueur joue une carte à son tour : les cartes jouées forment un pli. Si chacun a cinq cartes, la manche compte cinq plis.', k: 'pli tour de cartes' },
        { t: 'Qu\'est-ce qu\'une manche', a: 'Une manche est le cycle complet : distribution, annonces, plis et score. À la première manche on reçoit une carte, à la deuxième deux, et ainsi de suite.', k: 'manche tour cycle' }
      ]},
      { sec: 'Le paquet', items: [
        { t: 'Quelles cartes il contient', a: '60 cartes : quatre couleurs (jaune, rouge, vert, bleu) de valeur 1 à 13, plus 4 Magiciens et 4 Bouffons. Magiciens et Bouffons n\'ont pas de couleur.', k: 'cartes paquet combien magicien bouffon nombres couleurs', cards: ['y7', 'r13', 'W1', 'J1'] }
      ]},
      { sec: 'Préparation et distribution', items: [
        { t: 'Combien de joueurs et de manches', a: 'De 3 à 6 joueurs. Le nombre de manches dépend des joueurs : 3 joueurs 20 manches, 4 joueurs 15, 5 joueurs 12, 6 joueurs 10.', k: 'nombre joueurs durée combien manches longue partie' },
        { t: 'Qui est le donneur', a: 'Le premier donneur est le premier joueur de la liste de la salle d\'attente. Après chaque manche, le rôle passe au voisin dans le sens horaire.', k: 'donneur qui distribue premier' },
        { t: 'Combien de cartes on reçoit', a: 'Une carte chacun à la première manche, deux à la deuxième, trois à la troisième, jusqu\'à la dernière où tout le paquet est distribué.', k: 'distribution cartes combien recevoir' },
        { t: 'Comment l\'atout est décidé', a: 'Les cartes restantes forment la pioche et la première est retournée. Sa couleur est l\'atout de la manche.', k: 'atout couleur retournée', cards: ['r8'] },
        { t: 'Si un Magicien est retourné', a: 'Le donneur regarde ses cartes, choisit une des quatre couleurs et elle devient l\'atout.', k: 'magicien retourné atout choix donneur choisit', cards: ['W2'] },
        { t: 'Si un Bouffon est retourné', a: 'Il n\'y a pas d\'atout pour cette manche.', k: 'bouffon retourné sans atout', cards: ['J2'] },
        { t: 'La dernière manche', a: 'À la dernière manche toutes les cartes sont distribuées : il ne reste rien à retourner et il n\'y a pas d\'atout.', k: 'dernière manche finale atout toutes les cartes' }
      ]},
      { sec: 'Les annonces', items: [
        { t: 'Qui annonce en premier', a: 'Le voisin de gauche du donneur, puis les autres dans le sens horaire. Le donneur annonce en dernier.', k: 'annonce qui commence ordre pari' },
        { t: 'Peut-on annoncer zéro ?', a: 'Oui. Annoncer zéro pli et n\'en faire aucun vaut 20 points.', k: 'zéro aucun pli annonce 0' },
        { t: 'Le total doit-il tomber juste ?', a: 'Non. La somme des annonces peut être supérieure ou inférieure au nombre de plis, et plusieurs joueurs peuvent annoncer le même nombre. Sauf avec la variante Plus ou moins un.', k: 'somme total annonces égal nombre de plis même' },
        { t: 'Voit-on les annonces des autres ?', a: 'Oui. Les annonces sont publiques : à côté de la photo de chaque joueur sur la table, un sceau rouge porte le nombre annoncé et un petit tas de cartes montre les plis déjà faits. Le sceau devient vert quand les plis faits égalent l\'annonce, gris quand ils la dépassent. Dans le cadre en haut, à côté de chaque nom, tu vois plis faits / annoncés et les points.', k: 'voir annonces autres publiques sceau tas plis photo cadre noms points' }
      ]},
      { sec: 'Jouer les plis', items: [
        { t: 'Qui joue en premier', a: 'Au premier pli, le voisin de gauche du donneur entame. Aux plis suivants, celui qui a remporté le pli précédent entame. On tourne dans le sens horaire.', k: 'qui commence première carte entame tour' },
        { t: 'L\'obligation de fournir', a: 'Celui qui entame peut jouer n\'importe quelle carte. Les autres doivent fournir la couleur de la première carte s\'ils en ont au moins une. La couleur à fournir ne change pas pendant le pli.', k: 'fournir couleur obligation suivre dois' },
        { t: 'Si je n\'ai pas la couleur demandée', a: 'Tu peux jouer n\'importe quelle carte : un atout ou une autre couleur. Tu n\'es pas obligé de couper.', k: 'pas la couleur manque atout couper défausser' },
        { t: 'Magiciens et Bouffons se jouent toujours', a: 'Oui, à tout moment, même si tu as la couleur demandée, car ils n\'ont pas de couleur.', k: 'puis-je jouer magicien bouffon même si j\'ai la couleur toujours exception', cards: ['W3', 'J3'] },
        { t: 'Puis-je couper si j\'ai la couleur ?', a: 'Non, sauf si l\'atout est justement la couleur demandée. Si tu as la couleur demandée, tu dois la jouer, ou un Magicien ou un Bouffon.', k: 'atout couper j\'ai la couleur puis-je' },
        { t: 'Les plis gagnés', a: 'Celui qui gagne un pli le garde face cachée. Le nombre de plis faits est toujours visible : c\'est le petit tas de cartes à côté de la photo de chaque joueur.', k: 'plis gagnés face cachée compter regarder' }
      ]},
      { sec: 'Qui remporte le pli', items: [
        { t: 'L\'ordre de force', a: 'Le premier Magicien joué gagne. Sans Magicien, l\'atout le plus fort gagne. Sans atout non plus, la carte la plus forte de la couleur demandée gagne.', k: 'qui gagne pli force ordre hiérarchie bat plus forte' },
        { t: 'Plusieurs Magiciens dans un pli', a: 'Le premier Magicien joué gagne. Les suivants ne comptent pas.', k: 'deux magiciens plusieurs magiciens second même pli', cards: ['W1', 'W4'] },
        { t: 'Les Bouffons perdent toujours', a: 'Un Bouffon perd contre n\'importe quelle autre carte. Seule exception : si le pli ne contient que des Bouffons, le premier joué gagne.', k: 'bouffon perd gagne seulement bouffons tous', cards: ['J1', 'J4'] },
        { t: 'Carte d\'une autre couleur', a: 'Une carte qui n\'est ni atout ni de la couleur demandée ne peut pas gagner, même avec le plus grand nombre.', k: 'autre couleur nombre fort ne gagne pas treize 13' }
      ]},
      { sec: 'Entamer avec un Magicien ou un Bouffon', items: [
        { t: 'Si on entame avec un Magicien', a: 'Tous les autres peuvent jouer n\'importe quelle carte, même des Magiciens ou des Bouffons. Le pli revient à celui qui a entamé avec le Magicien.', k: 'entame magicien premier commence libre', cards: ['W1'] },
        { t: 'Si on entame avec un Bouffon', a: 'La couleur n\'est pas encore fixée. C\'est la première carte numérotée jouée qui la fixe : dès lors, les autres doivent la fournir.', k: 'entame bouffon premier commence couleur fixée', cards: ['J1', 'r7'] },
        { t: 'Bouffon suivi d\'un Magicien', a: 'Si un Magicien est joué après le Bouffon, les joueurs restants peuvent jouer n\'importe quelle carte et ce Magicien gagne, s\'il est le premier.', k: 'bouffon puis magicien après libre' },
        { t: 'Bouffon suivi d\'un autre Bouffon', a: 'La couleur reste à fixer. C\'est la première carte numérotée ou le premier Magicien joué ensuite qui décide.', k: 'deux bouffons de suite couleur encore' }
      ]},
      { sec: 'Le score', items: [
        { t: 'Annonce exacte', a: 'Tu gagnes un bonus de 20 points plus 10 points par pli fait. Exemple : tu annonces 3 et tu en fais 3, tu marques 50 points.', k: 'points score exacte juste bonus calcul combien' },
        { t: 'Annonce ratée', a: 'Tu perds 10 points par pli d\'écart, en plus ou en moins. Exemple : tu annonces 1 et tu en fais 4, tu perds 30 points.', k: 'points ratée fausse perds pénalité moins écart' },
        { t: 'Le score peut-il être négatif ?', a: 'Oui, le total peut descendre sous zéro.', k: 'négatif sous zéro score' },
        { t: 'Qui tient les comptes', a: 'Le jeu calcule tout. Avec le bouton Feuille de score, tu vois les points et les annonces de chaque manche.', k: 'feuille compte calcul automatique tableau' }
      ]},
      { sec: 'Fin de la partie', items: [
        { t: 'Quand elle se termine et qui gagne', a: 'Après la dernière manche, celui qui a le plus de points gagne.', k: 'fin partie gagnant termine' },
        { t: 'En cas d\'égalité', a: 'Si plusieurs joueurs partagent le meilleur score, ils gagnent tous.', k: 'égalité même score' }
      ]},
      { sec: 'Variantes', items: [
        { t: 'Plus ou moins un', a: 'Elle est active par défaut et se désactive dans la salle d\'attente. Le total des annonces ne peut pas égaler le nombre de plis de la manche : le donneur, qui annonce en dernier, ne peut pas choisir le nombre qui ferait tomber le compte juste. Le jeu le bloque automatiquement.', k: 'variante plus moins un total différent interdit donneur règle' },
        { t: 'Première manche à l\'aveugle', a: 'Elle est active par défaut et se désactive dans la salle d\'attente. Seulement à la première manche, quand chacun a une carte, la tienne reste face cachée : tu vois les cartes des autres, à côté de leurs photos, mais pas la tienne. Annonce en regardant les leurs. À ton tour, touche la carte cachée et joue-la sans savoir ce que c\'est : tu la découvres sur la table.', k: 'variante aveugle face cachée première manche indienne je ne vois pas ma carte autres' },
        { t: 'Variantes dans la recherche globale', a: 'Avant de chercher, choisis les variantes : tu es placé seulement avec ceux qui ont choisi les mêmes.', k: 'variantes recherche globale en ligne choisir' }
      ]},
      { sec: 'Comment fonctionne l\'app', items: [
        { t: 'Le tour et le donneur', a: 'Les photos des joueurs sont disposées autour de la table dans leur ordre, et les flèches rappellent le sens horaire. Celui qui doit jouer ou annoncer s\'illumine, sur la table et dans le cadre des noms en haut. Avant les annonces, un petit numéro à côté de chaque photo (1°, 2°…) indique l\'ordre. Le jeton D désigne le donneur. Au début de chaque manche, un bandeau dit qui distribue et qui annonce en premier.', k: 'tour ordre à qui donneur jeton sens horaire suivant premier cadre photo' },
        { t: 'Temps pour annoncer', a: '1 minute par défaut, modifiable dans la salle d\'attente. À la fin du temps, le jeu inscrit une annonce estimée d\'après tes cartes.', k: 'temps limite minute minuteur écoulé annonce automatique' },
        { t: 'Temps pour jouer une carte', a: '30 secondes par défaut, modifiable dans la salle d\'attente. À la fin du temps, le jeu joue une carte valide à ta place.', k: 'temps carte limite minuteur écoulé automatique secondes' },
        { t: 'Profil et statistiques', a: 'Ouvre le profil depuis la page d\'accueil : choisis un nom et une image et consulte tes statistiques, séparées entre parties avec d\'autres joueurs et parties contre des bots.', k: 'profil photo avatar statistiques victoires record' },
        { t: 'Musique, sons et effets', a: 'Dans le menu, sous Sons et effets, tu peux couper ou baisser la musique, les sons des cartes, les effets au toucher et la vibration.', k: 'musique sons volume effets vibration silence couper' },
        { t: 'Langue', a: 'Sur la page d\'accueil et dans le menu, sous Sons et effets, tu peux passer l\'app en italien, anglais, espagnol, français ou allemand. Chaque joueur voit le jeu dans sa langue.', k: 'langue italien anglais espagnol français allemand traduire' },
        { t: 'Comment jouer une carte', a: 'Touche une fois la carte pour la soulever et une seconde fois pour la jouer, ou fais-la glisser vers la table. Quand c\'est ton tour, les cartes injouables sont assombries.', k: 'jouer carte toucher glisser assombries impossible' },
        { t: 'Si la connexion coupe', a: 'Le jeu se reconnecte tout seul et reprend ta place. Si tu es absent plus de 30 secondes pendant ton tour, le jeu joue pour toi jusqu\'à ton retour. Si tu fermes la page, rouvre le jeu : tu trouveras le bouton pour revenir.', k: 'connexion coupée déconnecté sorti revenir reprendre internet hors ligne téléphone verrouillé' },
        { t: 'iPhone et données mobiles', a: 'Quand deux appareils ne peuvent pas communiquer directement, comme souvent avec les iPhone ou en données mobiles, le jeu passe tout seul à une connexion de secours via un service web sécurisé. Rejoindre prend quelques secondes de plus, puis on joue normalement. Les messages sont chiffrés avec le code de la partie.', k: 'iphone ios safari données mobiles impossible rejoindre connexion secours' },
        { t: 'Recherche globale', a: 'Depuis la page d\'accueil, Trouver des joueurs en ligne t\'installe avec ceux qui cherchent au même moment, y compris des inconnus. À 3 joueurs ou plus, la partie démarre seule après 15 secondes sans nouvelle arrivée ; à 2, après 45 secondes avec un bot en plus ; 6 au maximum. Tout le monde peut appuyer sur Commencer maintenant. Un des appareils trouvés sert de table pour tous. Le chat vocal reste coupé tant que tu ne l\'actives pas.', k: 'recherche globale en ligne inconnus trouver joueurs matchmaking partie' },
        { t: 'Qui crée la partie', a: 'L\'appareil qui crée la partie sert de table pour tous : il doit rester allumé, avec la page ouverte. S\'il se recharge, la partie reprend où elle en était.', k: 'hôte créateur appareil principal allumé fermer page' },
        { t: 'Chat vocal avec des personnes dans la même pièce', a: 'Les personnes au même endroit choisissent la même lettre de Lieu. Un seul appareil par Lieu peut être en vocal, pour que le son ne se chevauche pas. Les autres jouent sans rejoindre le vocal.', k: 'voix vocal micro audio même pièce lieu écho chevauche ensemble distance' },
        { t: 'Si le micro ne marche pas', a: 'Vérifie que tu as autorisé le navigateur à utiliser le micro. Si tu refuses, tu peux quand même rejoindre et écouter les autres.', k: 'micro permission ne marche pas n\'entends pas audio problème écouter' }
      ]}
    ],
    de: [
      { sec: 'Ziel des Spiels', items: [
        { t: 'Was man tun muss', a: 'In jeder Runde sagst du voraus, wie viele Stiche du machst. Triffst du die Zahl genau, bekommst du Punkte, sonst verlierst du welche. Am Ende gewinnt, wer die meisten Punkte hat.', k: 'ziel wie spielt man gewinnen' },
        { t: 'Was ist ein Stich', a: 'Jeder spielt reihum eine Karte: Die gespielten Karten bilden einen Stich. Hat jeder fünf Karten, gibt es in der Runde fünf Stiche.', k: 'stich karten' },
        { t: 'Was ist eine Runde', a: 'Eine Runde ist der ganze Ablauf: Austeilen, Ansagen, Stiche und Wertung. In der ersten Runde bekommt man eine Karte, in der zweiten zwei und so weiter.', k: 'runde ablauf' }
      ]},
      { sec: 'Die Karten', items: [
        { t: 'Welche Karten es gibt', a: '60 Karten: vier Farben (gelb, rot, grün, blau) mit Werten von 1 bis 13, dazu 4 Zauberer und 4 Narren. Zauberer und Narren haben keine Farbe.', k: 'karten deck wie viele zauberer narr zahlen farben', cards: ['y7', 'r13', 'W1', 'J1'] }
      ]},
      { sec: 'Vorbereitung und Austeilen', items: [
        { t: 'Wie viele Spieler und Runden', a: '3 bis 6 Spieler. Die Rundenzahl hängt von den Spielern ab: 3 Spieler 20 Runden, 4 Spieler 15, 5 Spieler 12, 6 Spieler 10.', k: 'anzahl spieler dauer wie viele runden langes spiel' },
        { t: 'Wer ist Geber', a: 'Erster Geber ist der erste Spieler der Liste im Warteraum. Nach jeder Runde geht die Rolle im Uhrzeigersinn weiter.', k: 'geber wer teilt aus zuerst' },
        { t: 'Wie viele Karten man bekommt', a: 'In der ersten Runde eine Karte pro Person, in der zweiten zwei, in der dritten drei, bis zur letzten, in der das ganze Deck verteilt wird.', k: 'austeilen karten wie viele bekommen' },
        { t: 'Wie Trumpf bestimmt wird', a: 'Die übrigen Karten bilden den Stapel, die oberste wird aufgedeckt. Ihre Farbe ist Trumpf für die Runde.', k: 'trumpf farbe aufgedeckt', cards: ['r8'] },
        { t: 'Wenn ein Zauberer aufgedeckt wird', a: 'Der Geber schaut in seine Karten, wählt eine der vier Farben, und diese wird Trumpf.', k: 'zauberer aufgedeckt trumpf wahl geber wählt', cards: ['W2'] },
        { t: 'Wenn ein Narr aufgedeckt wird', a: 'In dieser Runde gibt es keinen Trumpf.', k: 'narr aufgedeckt kein trumpf', cards: ['J2'] },
        { t: 'Die letzte Runde', a: 'In der letzten Runde werden alle Karten verteilt. Es bleibt nichts zum Aufdecken, also gibt es keinen Trumpf.', k: 'letzte runde trumpf alle karten' }
      ]},
      { sec: 'Die Ansagen', items: [
        { t: 'Wer zuerst ansagt', a: 'Der linke Nachbar des Gebers, dann die anderen im Uhrzeigersinn. Der Geber sagt zuletzt an.', k: 'ansage wer beginnt reihenfolge vorhersage' },
        { t: 'Darf man null ansagen?', a: 'Ja. Null Stiche ansagen und keinen machen bringt 20 Punkte.', k: 'null kein stich ansage 0' },
        { t: 'Muss die Summe aufgehen?', a: 'Nein. Die Summe der Ansagen kann höher oder niedriger als die Zahl der Stiche sein, und mehrere dürfen dieselbe Zahl ansagen. Ausnahme ist die Variante Plus minus eins.', k: 'summe ansagen gleich anzahl stiche' },
        { t: 'Sieht man die Ansagen der anderen?', a: 'Ja. Ansagen sind öffentlich: Neben dem Foto jedes Spielers auf dem Tisch steht ein rotes Siegel mit der angesagten Zahl und ein kleiner Kartenstapel mit den gemachten Stichen. Das Siegel wird grün, wenn die Stiche der Ansage entsprechen, grau, wenn es mehr sind. Im Feld oben siehst du neben jedem Namen Stiche gemacht / angesagt und die Punkte.', k: 'ansagen sehen andere öffentlich siegel stapel stiche foto feld namen punkte' }
      ]},
      { sec: 'Stiche spielen', items: [
        { t: 'Wer zuerst spielt', a: 'Beim ersten Stich spielt der linke Nachbar des Gebers aus. Danach spielt aus, wer den vorigen Stich gemacht hat. Es geht im Uhrzeigersinn weiter.', k: 'wer beginnt erste karte ausspielen zug' },
        { t: 'Farbe bedienen', a: 'Wer ausspielt, darf jede Karte legen. Die anderen müssen die Farbe der ersten Karte bedienen, wenn sie eine haben. Die zu bedienende Farbe ändert sich im Stich nicht.', k: 'bedienen farbe pflicht muss' },
        { t: 'Wenn ich die Farbe nicht habe', a: 'Du darfst jede Karte spielen: Trumpf oder eine andere Farbe. Du musst nicht trumpfen.', k: 'farbe nicht fehlt trumpf abwerfen' },
        { t: 'Zauberer und Narren gehen immer', a: 'Ja, jederzeit, auch wenn du die verlangte Farbe hast, denn sie haben keine Farbe.', k: 'darf ich zauberer narr spielen auch wenn ich die farbe habe immer ausnahme', cards: ['W3', 'J3'] },
        { t: 'Darf ich trumpfen, wenn ich die Farbe habe?', a: 'Nein, außer Trumpf ist die verlangte Farbe. Hast du die verlangte Farbe, musst du sie spielen, oder einen Zauberer oder Narren.', k: 'trumpf stechen farbe habe darf ich' },
        { t: 'Gewonnene Stiche', a: 'Wer einen Stich gewinnt, legt ihn verdeckt vor sich ab. Die Zahl der Stiche ist immer sichtbar: Es ist der kleine Kartenstapel neben dem Foto jedes Spielers.', k: 'stiche gewonnen verdeckt zählen anschauen' }
      ]},
      { sec: 'Wer den Stich gewinnt', items: [
        { t: 'Die Rangfolge', a: 'Der erste gespielte Zauberer gewinnt. Gibt es keinen Zauberer, gewinnt der höchste Trumpf. Gibt es auch keinen Trumpf, gewinnt die höchste Karte der verlangten Farbe.', k: 'wer gewinnt stich rangfolge schlägt höchste' },
        { t: 'Mehrere Zauberer im Stich', a: 'Der erste gespielte Zauberer gewinnt. Spätere zählen nicht.', k: 'zwei zauberer mehrere zweiter zauberer gleicher stich', cards: ['W1', 'W4'] },
        { t: 'Narren verlieren immer', a: 'Ein Narr verliert gegen jede andere Karte. Einzige Ausnahme: Liegen im Stich nur Narren, gewinnt der erste.', k: 'narr verliert gewinnt nur narren alle', cards: ['J1', 'J4'] },
        { t: 'Karte einer anderen Farbe', a: 'Eine Karte, die weder Trumpf noch die verlangte Farbe ist, kann nicht gewinnen, auch nicht mit der höchsten Zahl.', k: 'andere farbe hohe zahl gewinnt nicht dreizehn 13' }
      ]},
      { sec: 'Mit Zauberer oder Narr ausspielen', items: [
        { t: 'Wenn ein Zauberer ausgespielt wird', a: 'Alle anderen dürfen jede Karte spielen, auch Zauberer oder Narren. Den Stich bekommt, wer den Zauberer ausgespielt hat.', k: 'ausspielen zauberer erster beginnt frei', cards: ['W1'] },
        { t: 'Wenn ein Narr ausgespielt wird', a: 'Die Farbe steht noch nicht fest. Die erste gespielte Zahlenkarte legt sie fest: Ab dann müssen die anderen sie bedienen.', k: 'ausspielen narr erster beginnt farbe fest', cards: ['J1', 'r7'] },
        { t: 'Narr, dann Zauberer', a: 'Wird nach dem Narren ein Zauberer gespielt, dürfen die übrigen jede Karte spielen, und dieser Zauberer gewinnt, wenn er der erste ist.', k: 'narr dann zauberer danach frei' },
        { t: 'Narr, dann noch ein Narr', a: 'Die Farbe ist weiter offen. Es entscheidet die erste Zahlenkarte oder der erste Zauberer danach.', k: 'zwei narren hintereinander farbe noch' }
      ]},
      { sec: 'Die Wertung', items: [
        { t: 'Genaue Ansage', a: 'Du bekommst 20 Bonuspunkte plus 10 Punkte pro gemachtem Stich. Beispiel: Du sagst 3 an und machst 3, du bekommst 50 Punkte.', k: 'punkte wertung genau richtig bonus berechnung wie viel' },
        { t: 'Falsche Ansage', a: 'Du verlierst 10 Punkte pro Stich Unterschied, nach oben oder unten. Beispiel: Du sagst 1 an und machst 4, du verlierst 30 Punkte.', k: 'punkte falsch verliere strafe minus unterschied' },
        { t: 'Kann der Punktestand negativ sein?', a: 'Ja, die Summe kann unter null fallen.', k: 'negativ unter null punktestand' },
        { t: 'Wer zählt mit', a: 'Das Spiel rechnet alles selbst. Mit der Schaltfläche Punkteblock siehst du Punkte und Ansagen jeder Runde.', k: 'punkteblock zählen berechnung automatisch tabelle' }
      ]},
      { sec: 'Spielende', items: [
        { t: 'Wann es endet und wer gewinnt', a: 'Nach der letzten Runde gewinnt, wer die meisten Punkte hat.', k: 'ende spiel sieger' },
        { t: 'Bei Gleichstand', a: 'Haben mehrere die höchste Punktzahl, gewinnen alle.', k: 'gleichstand unentschieden gleiche punkte' }
      ]},
      { sec: 'Varianten', items: [
        { t: 'Plus minus eins', a: 'Sie ist standardmäßig aktiv und lässt sich im Warteraum abschalten. Die Summe der Ansagen darf nicht der Zahl der Stiche entsprechen: Der Geber, der zuletzt ansagt, darf die Zahl nicht wählen, mit der es aufgehen würde. Das Spiel sperrt sie automatisch.', k: 'variante plus minus eins summe anders verboten geber regel' },
        { t: 'Blinde erste Runde', a: 'Sie ist standardmäßig aktiv und lässt sich im Warteraum abschalten. Nur in der ersten Runde, wenn jeder eine Karte hat, bleibt deine eigene verdeckt: Du siehst die Karten der anderen neben ihren Fotos, aber nicht deine. Sag an, indem du ihre anschaust. Bist du dran, tippst du auf die verdeckte Karte und spielst sie, ohne zu wissen, welche es ist: Du siehst sie erst auf dem Tisch.', k: 'variante blind verdeckt erste runde indianer sehe meine karte nicht andere' },
        { t: 'Varianten bei der weltweiten Suche', a: 'Vor der Suche wählst du die Varianten: Du kommst nur an einen Tisch mit Spielern, die dieselben gewählt haben.', k: 'varianten weltweite suche online wählen' }
      ]},
      { sec: 'So funktioniert die App', items: [
        { t: 'Reihenfolge und Geber', a: 'Die Fotos der Spieler stehen in ihrer Reihenfolge um den Tisch, und die Pfeile zeigen den Uhrzeigersinn. Wer spielen oder ansagen muss, leuchtet auf, auf dem Tisch und im Namensfeld oben. Vor den Ansagen zeigt eine kleine Zahl neben jedem Foto (1°, 2°…) die Reihenfolge. Der G-Marker zeigt den Geber. Zu Beginn jeder Runde sagt ein Banner, wer gibt und wer zuerst ansagt.', k: 'reihenfolge wer ist dran geber marker uhrzeigersinn nächster erster feld foto' },
        { t: 'Zeit für die Ansage', a: 'Standardmäßig 1 Minute, im Warteraum änderbar. Ist die Zeit um, setzt das Spiel eine aus deinen Karten geschätzte Ansage.', k: 'zeit limit minute timer abgelaufen ansage automatisch' },
        { t: 'Zeit zum Ausspielen', a: 'Standardmäßig 30 Sekunden, im Warteraum änderbar. Ist die Zeit um, spielt das Spiel eine gültige Karte für dich.', k: 'zeit karte limit timer abgelaufen automatisch sekunden' },
        { t: 'Profil und Statistik', a: 'Öffne das Profil auf der Startseite: Wähle Name und Bild und sieh dir deine Statistik an, getrennt nach Spielen mit anderen Spielern und Spielen gegen Bots.', k: 'profil foto avatar statistik siege rekord' },
        { t: 'Musik, Töne und Effekte', a: 'Im Menü unter Ton und Effekte kannst du Musik, Kartengeräusche, Effekte beim Tippen und Vibration ausschalten oder leiser stellen.', k: 'musik töne lautstärke effekte vibration stumm ausschalten' },
        { t: 'Sprache', a: 'Auf der Startseite und im Menü unter Ton und Effekte kannst du die App auf Italienisch, Englisch, Spanisch, Französisch oder Deutsch stellen. Jeder Spieler sieht das Spiel in seiner eigenen Sprache.', k: 'sprache italienisch englisch spanisch französisch deutsch übersetzen' },
        { t: 'Wie man eine Karte spielt', a: 'Tippe einmal auf die Karte, um sie anzuheben, und noch einmal, um sie zu spielen, oder ziehe sie zum Tisch. Bist du dran, sind nicht spielbare Karten abgedunkelt.', k: 'karte spielen tippen ziehen abgedunkelt nicht möglich' },
        { t: 'Wenn die Verbindung abbricht', a: 'Das Spiel verbindet sich von selbst neu und gibt dir deinen Platz zurück. Bist du in deinem Zug länger als 30 Sekunden weg, spielt das Spiel für dich, bis du zurück bist. Schließt du die Seite, öffne das Spiel erneut: Du findest den Knopf zum Wiedereinstieg.', k: 'verbindung abgebrochen getrennt zurück wiedereinstieg internet offline handy gesperrt' },
        { t: 'iPhone und mobile Daten', a: 'Wenn zwei Geräte sich nicht direkt erreichen, wie oft bei iPhones oder mit mobilen Daten, wechselt das Spiel von selbst zu einer Ersatzverbindung über einen sicheren Webdienst. Der Beitritt dauert ein paar Sekunden länger, danach spielt man normal. Die Nachrichten sind mit dem Spielcode verschlüsselt.', k: 'iphone ios safari mobile daten kann nicht beitreten verbindung ersatz' },
        { t: 'Weltweite Suche', a: 'Auf der Startseite bringt dich Mitspieler online suchen an einen Tisch mit allen, die gerade suchen, auch mit Unbekannten. Ab 3 Spielern startet das Spiel nach 15 Sekunden ohne Neuzugang von selbst; zu zweit nach 45 Sekunden mit einem zusätzlichen Bot; höchstens 6. Jeder kann Jetzt starten drücken. Eines der gefundenen Geräte ist Tisch für alle. Der Sprachchat bleibt aus, bis du ihn einschaltest.', k: 'weltweite suche online unbekannte mitspieler finden matchmaking spiel' },
        { t: 'Wer das Spiel erstellt', a: 'Das Gerät, das das Spiel erstellt, ist der Tisch für alle: Es muss eingeschaltet bleiben, mit offener Seite. Lädt es neu, geht das Spiel dort weiter, wo es war.', k: 'host ersteller hauptgerät eingeschaltet seite schließen' },
        { t: 'Sprachchat mit Leuten im selben Raum', a: 'Wer am selben Ort ist, wählt denselben Ort-Buchstaben. Pro Ort darf nur ein Gerät im Sprachchat sein, damit sich der Ton nicht überlagert. Die anderen spielen ohne Sprachchat mit.', k: 'sprache mikrofon audio selber raum ort echo überlagert zusammen entfernung' },
        { t: 'Wenn das Mikrofon nicht geht', a: 'Prüfe, ob du dem Browser den Mikrofonzugriff erlaubt hast. Lehnst du ab, kannst du trotzdem beitreten und den anderen zuhören.', k: 'mikrofon erlaubnis geht nicht höre nichts audio problem zuhören' }
      ]}
    ]
  };
})(typeof self !== 'undefined' ? self : this);
