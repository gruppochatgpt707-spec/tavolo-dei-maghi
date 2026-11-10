/* Regolamento riscritto in italiano. Ogni voce è cercabile: k contiene sinonimi e modi di dire. */
(function (root) {
  'use strict';
  root.RULES = [
    { sec: 'Lo scopo del gioco', items: [
      { t: 'Che cosa si deve fare', a: 'A ogni mano prevedi quante prese farai. Se indovini il numero esatto guadagni punti, altrimenti ne perdi. A fine partita vince chi ha più punti.', k: 'obiettivo scopo come si gioca vincere' },
      { t: 'Che cos\'è una presa', a: 'Ogni giocatore gioca una carta a turno: le carte giocate formano una presa. Se ogni giocatore ha cinque carte, nella mano si fanno cinque prese.', k: 'trick presa giro' },
      { t: 'Che cos\'è una mano', a: 'Una mano è l\'intero ciclo: distribuzione, previsioni, prese e punteggio. Nella prima mano si riceve una carta, nella seconda due, e così via.', k: 'round mano turno ciclo' }
    ]},
    { sec: 'Il mazzo', items: [
      { t: 'Da quali carte è formato', a: '60 carte: quattro colori (giallo, rosso, verde, blu) con valori da 1 a 13, più 4 Maghi e 4 Giullari. Maghi e Giullari non hanno colore.', k: 'carte mazzo composizione quante wizard jester numeri colori', cards: ['y7', 'r13', 'W1', 'J1'] }
    ]},
    { sec: 'Preparazione e distribuzione', items: [
      { t: 'Quanti giocatori e quante mani', a: 'Si gioca da 3 a 6. Le mani totali dipendono dai giocatori: 3 giocatori 20 mani, 4 giocatori 15, 5 giocatori 12, 6 giocatori 10.', k: 'numero giocatori durata quante mani partita lunga' },
      { t: 'Chi è il mazziere', a: 'Il primo mazziere è il primo giocatore della lista nella sala d\'attesa. Dopo ogni mano il ruolo passa al vicino in senso orario.', k: 'mazziere dealer chi distribuisce primo saggio' },
      { t: 'Quante carte si ricevono', a: 'Nella prima mano una carta a testa, nella seconda due, nella terza tre, fino all\'ultima, in cui si distribuisce tutto il mazzo.', k: 'distribuzione carte quante ricevere dare' },
      { t: 'Come si decide la briscola', a: 'Le carte avanzate formano il mazzo e la prima viene scoperta. Il suo colore è la briscola della mano.', k: 'briscola atout trump seme comanda scoperta girata', cards: ['r8'] },
      { t: 'Se viene scoperto un Mago', a: 'Il mazziere guarda le proprie carte, sceglie uno dei quattro colori e quello diventa la briscola.', k: 'mago girato scoperto briscola scelta mazziere sceglie wizard', cards: ['W2'] },
      { t: 'Se viene scoperto un Giullare', a: 'In questa mano non c\'è briscola.', k: 'giullare girato scoperto senza briscola jester nessuna', cards: ['J2'] },
      { t: 'L\'ultima mano', a: 'Nell\'ultima mano si distribuiscono tutte le carte, quindi non resta nulla da scoprire e non c\'è briscola.', k: 'ultima mano finale briscola tutte le carte' }
    ]},
    { sec: 'Le previsioni', items: [
      { t: 'Chi inizia a prevedere', a: 'Il vicino di sinistra del mazziere, poi gli altri in senso orario. Il mazziere prevede per ultimo.', k: 'previsione chi inizia ordine scommessa puntata bid' },
      { t: 'Si può prevedere zero?', a: 'Sì. Prevedere zero prese e non farne nessuna vale 20 punti.', k: 'zero nessuna presa previsione 0' },
      { t: 'Il totale deve tornare?', a: 'No. La somma delle previsioni può essere più alta o più bassa del numero di prese, e più giocatori possono prevedere lo stesso numero. Fa eccezione la variante Più o meno uno.', k: 'somma totale previsioni uguale numero prese stesso' },
      { t: 'Si vedono le previsioni degli altri?', a: 'Sì. Le previsioni sono pubbliche: accanto alla foto di ogni giocatore sul tavolo c\'è un sigillo rosso con il numero previsto, e un mazzetto di carte con le prese già fatte. Il sigillo diventa verde quando le prese fatte sono uguali alla previsione, grigio quando le ha superate. Nel riquadro in alto, accanto a ogni nome, trovi prese fatte / previste e i punti.', k: 'vedere previsioni altri pubbliche sigillo mazzetto prese accanto foto riquadro nomi punti' }
    ]},
    { sec: 'Giocare le prese', items: [
      { t: 'Chi gioca per primo', a: 'Nella prima presa inizia il vicino di sinistra del mazziere. Nelle prese successive inizia chi ha vinto la presa precedente. Si prosegue in senso orario.', k: 'chi inizia prima carta apre uscita attacca turno' },
      { t: 'L\'obbligo di seguire il colore', a: 'Chi apre può giocare qualsiasi carta. Gli altri devono rispondere con il colore della prima carta, se ne hanno almeno una. Il colore da seguire non cambia durante la presa.', k: 'rispondere seguire colore obbligo seme devo per forza' },
      { t: 'Se non ho il colore richiesto', a: 'Puoi giocare qualsiasi carta: una briscola o un altro colore. Non sei obbligato a giocare briscola.', k: 'non ho colore mancante taglio obbligo briscola scartare' },
      { t: 'Maghi e Giullari si possono sempre giocare', a: 'Sì, in qualsiasi momento, anche se avresti il colore richiesto, perché non hanno colore.', k: 'posso giocare mago giullare anche se ho il colore sempre eccezione wizard jester', cards: ['W3', 'J3'] },
      { t: 'Posso giocare briscola se ho il colore?', a: 'No, a meno che la briscola sia proprio il colore da seguire. Se hai il colore richiesto devi giocare quello, oppure un Mago o un Giullare.', k: 'briscola tagliare ho il colore posso' },
      { t: 'Le prese vinte', a: 'Chi vince una presa la tiene davanti a sé coperta. Il numero di prese fatte è sempre visibile: è il mazzetto di carte accanto alla foto di ogni giocatore.', k: 'prese vinte coperte contare guardare ultima' }
    ]},
    { sec: 'Chi vince la presa', items: [
      { t: 'L\'ordine di forza', a: 'Vince il primo Mago giocato. Se non ci sono Maghi, vince la briscola più alta. Se non ci sono nemmeno briscole, vince la carta più alta del colore da seguire.', k: 'chi vince presa forza ordine gerarchia batte più alta' },
      { t: 'Più Maghi nella stessa presa', a: 'Vince il primo Mago giocato. I Maghi successivi non contano.', k: 'due maghi più maghi secondo mago wizard stessa presa', cards: ['W1', 'W4'] },
      { t: 'I Giullari perdono sempre', a: 'Un Giullare perde contro qualsiasi altra carta. Unica eccezione: se nella presa ci sono solo Giullari, vince il primo Giullare giocato.', k: 'giullare perde vince solo giullari tutti jester', cards: ['J1', 'J4'] },
      { t: 'Carta di colore diverso', a: 'Una carta che non è briscola e non è del colore da seguire non può vincere, anche se ha il numero più alto.', k: 'colore diverso numero alto non vince tredici 13' }
    ]},
    { sec: 'Aprire con un Mago o un Giullare', items: [
      { t: 'Se si apre con un Mago', a: 'Tutti gli altri possono giocare qualsiasi carta, anche Maghi o Giullari. La presa la vince chi ha aperto con il Mago.', k: 'apertura mago primo inizia wizard libero', cards: ['W1'] },
      { t: 'Se si apre con un Giullare', a: 'Il colore non è ancora deciso. Lo stabilisce la prima carta numerata giocata: da quel momento gli altri devono seguirlo.', k: 'apertura giullare primo inizia jester colore deciso', cards: ['J1', 'r7'] },
      { t: 'Giullare seguito da un Mago', a: 'Se dopo il Giullare viene giocato un Mago, chi resta può giocare qualsiasi carta e vince quel Mago, se è il primo.', k: 'giullare poi mago dopo libero' },
      { t: 'Giullare seguito da un altro Giullare', a: 'Il colore resta da stabilire. Decide la prima carta numerata o il primo Mago giocato dopo.', k: 'due giullari di seguito colore ancora' }
    ]},
    { sec: 'Il punteggio', items: [
      { t: 'Previsione esatta', a: 'Guadagni 20 punti di bonus più 10 punti per ogni presa fatta. Esempio: prevedi 3 e fai 3, ottieni 50 punti.', k: 'punti punteggio esatta giusta bonus calcolo indovinato quanto vale' },
      { t: 'Previsione sbagliata', a: 'Perdi 10 punti per ogni presa di differenza, in più o in meno. Esempio: prevedi 1 e fai 4, perdi 30 punti.', k: 'punti sbagliata errata perdo penalità meno differenza' },
      { t: 'Il punteggio può essere negativo?', a: 'Sì, il totale può scendere sotto lo zero.', k: 'negativo sotto zero punteggio' },
      { t: 'Chi tiene il conto', a: 'Il gioco calcola tutto da solo. Con il pulsante Registro vedi punti e previsioni di ogni mano.', k: 'segnapunti registro conto calcolo automatico tabella' }
    ]},
    { sec: 'Fine della partita', items: [
      { t: 'Quando finisce e chi vince', a: 'Dopo l\'ultima mano vince chi ha più punti.', k: 'fine partita vincitore finisce' },
      { t: 'In caso di parità', a: 'Se più giocatori hanno lo stesso punteggio massimo, vincono tutti.', k: 'parità pareggio stesso punteggio spareggio' }
    ]},
    { sec: 'Variante', items: [
      { t: 'Più o meno uno', a: 'Si attiva nella sala d\'attesa. Il totale delle previsioni non può essere uguale al numero di prese della mano: il mazziere, ultimo a prevedere, non può scegliere il numero che farebbe tornare il conto. Il gioco lo blocca in automatico.', k: 'variante più meno uno plus minus totale diverso vietato mazziere regola' }
    ]},
    { sec: 'Come funziona il gioco', items: [
      { t: 'Il giro e il mazziere', a: 'Le foto dei giocatori sono disposte attorno al tavolo nel loro ordine, e le frecce ricordano il senso orario. Chi deve giocare o prevedere si illumina, sul tavolo e nel riquadro dei nomi in alto. Prima delle previsioni, accanto a ogni foto un numerino (1°, 2°…) indica l\'ordine in cui si prevede. Il gettone M indica il mazziere. A inizio mano un cartiglio dice chi distribuisce e chi prevede per primo.', k: 'giro ordine turno chi tocca mazziere gettone senso orario dopo prima riquadro foto' },
      { t: 'Tempo per la previsione', a: 'Di base 1 minuto a testa, modificabile nella sala d\'attesa. Allo scadere il gioco inserisce una previsione stimata in base alle carte.', k: 'tempo limite minuto timer scaduto previsione automatica' },
      { t: 'Tempo per giocare una carta', a: 'Di base 30 secondi, modificabile nella sala d\'attesa. Allo scadere il gioco gioca una carta valida al posto tuo.', k: 'tempo carta limite timer scaduto automatico secondi' },
      { t: 'Profilo e statistiche', a: 'Dalla pagina iniziale apri il profilo: scegli nome e immagine e guarda le statistiche, separate tra partite con altri giocatori e partite contro i bot.', k: 'profilo foto avatar statistiche vittorie record' },
      { t: 'Musica, suoni ed effetti', a: 'Nel menu, alla voce Suoni ed effetti, puoi spegnere o abbassare la musica, i suoni delle carte, gli effetti al tocco e la vibrazione.', k: 'musica suoni volume effetti vibrazione silenzio spegnere' },
      { t: 'Come si gioca una carta', a: 'Tocca una volta la carta per sollevarla e una seconda volta per giocarla, oppure trascinala verso il tavolo. Quando tocca a te le carte non giocabili sono scurite.', k: 'giocare carta toccare trascinare scurite non posso' },
      { t: 'Se cade la connessione', a: 'Il gioco si ricollega da solo e riprende il tuo posto. Se resti assente più di 30 secondi durante il tuo turno, il gioco gioca per te finché non torni. Se chiudi la pagina, riapri il gioco: troverai il pulsante per rientrare.', k: 'connessione caduta disconnesso uscito rientrare riprendere internet offline telefono bloccato' },
      { t: 'Ricerca globale', a: 'Dalla pagina iniziale, Cerca giocatori online ti mette allo stesso tavolo con chi sta cercando nello stesso momento, anche persone che non conosci. Con 3 o più giocatori la partita parte da sola dopo 15 secondi senza nuovi arrivi; in 2 dopo 45 secondi, con un bot in più; al massimo 6. Chiunque può premere Inizia subito. Uno dei dispositivi trovati fa da tavolo per tutti. La chat vocale resta spenta finché non la attivi tu.', k: 'ricerca globale online sconosciuti cerca giocatori matchmaking trovare partita' },
      { t: 'Chi crea la partita', a: 'Il dispositivo che crea la partita fa da tavolo per tutti: deve restare acceso, con la pagina aperta. Se si ricarica, la partita riprende dal punto in cui era.', k: 'host creatore dispositivo principale acceso chiudere pagina' },
      { t: 'Chat vocale con persone nella stessa stanza', a: 'Chi è nello stesso posto sceglie la stessa lettera di Luogo. Solo un dispositivo per Luogo può stare in voce, così l\'audio non si accavalla. Gli altri al tavolo giocano senza entrare in voce.', k: 'voce vocale microfono audio stessa stanza luogo eco accavalla insieme presenza distanza' },
      { t: 'Se il microfono non funziona', a: 'Controlla di aver concesso il permesso al browser per il microfono. Se lo neghi puoi comunque entrare e ascoltare gli altri.', k: 'microfono permesso non funziona non sento audio problema ascolto' }
    ]}
  ];
})(typeof self !== 'undefined' ? self : this);
