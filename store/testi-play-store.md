# Testi per la scheda del Play Store

Da copiare in Play Console → Crescita → Presenza sullo Store → Scheda principale dello Store.

## Nome dell'app (max 30 caratteri)

Il Tavolo dei Maghi

## Descrizione breve (max 80 caratteri)

Prevedi quante prese farai e sfida gli amici, al tavolo o a distanza.

## Descrizione completa (max 4000 caratteri)

Il Tavolo dei Maghi è un gioco di carte di prese e previsioni da giocare con gli amici, da 3 a 6 giocatori.

A ogni mano ricevi una carta in più. Guardi le tue carte e dichiari quante prese farai: se indovini esattamente guadagni punti, se sbagli anche di una sola presa li perdi. Il colore di briscola cambia ogni mano, i Maghi vincono sempre e i Giullari non vincono mai. Basta una previsione sbagliata per cambiare la classifica.

GIOCA CON GLI AMICI, OVUNQUE SIANO
• Crei una partita e ricevi un codice di 5 caratteri: gli amici lo scrivono e si siedono al tuo tavolo.
• Funziona su telefono, tablet e computer, anche mescolati nella stessa partita.
• Niente account, niente registrazione.
• Se qualcuno perde la connessione, rientra al suo posto con le sue carte.

CHAT VOCALE PENSATA PER IL TAVOLO
• Parla con chi gioca da lontano.
• Se siete in tre nella stessa stanza, basta un solo telefono in voce: niente eco e niente rimbombi.
• Microfono spento con un tocco, e un indicatore mostra chi sta parlando.

CARTE DIPINTE A MANO
• 60 carte illustrate in stile acquerello: quattro mondi (canyon, costa, foresta e colline di girasoli), tredici personaggi per colore, quattro Maghi elementali e quattro Giullari.
• Musica di sottofondo leggera che cambia con il colore di briscola, ed effetti sonori realistici di carte e mazzo. Tutto si può spegnere.

TUTTO AUTOMATICO
• Punteggi calcolati da soli e tabellone sempre a portata di mano.
• Le previsioni di tutti sono sempre visibili accanto a ogni giocatore.
• Si vede chiaramente chi è il mazziere, a chi tocca e chi ha già dichiarato.
• Tempo per dichiarare e per giocare regolabile (predefiniti: 1 minuto e 30 secondi).
• Regolamento completo con ricerca, consultabile anche durante la partita.

PROFILO E STATISTICHE
• Scegli un personaggio o carica una tua foto.
• Statistiche separate per le partite con amici veri e per quelle contro i bot: vittorie, previsioni esatte, serie migliori e altro.

PROVA DA SOLO
• Vuoi imparare? Gioca contro i bot quando vuoi.

Nessuna pubblicità, nessun acquisto nell'app. Il tuo profilo e le statistiche restano sul tuo dispositivo.

## Categoria e dettagli

- Tipo: Gioco
- Categoria: Carte
- Tag suggeriti: Carte, Multigiocatore, Giochi di società, Offline/Contro il computer
- Email di contatto: obbligatoria (quella del tuo account sviluppatore va bene)
- Norme sulla privacy: https://gruppochatgpt707-spec.github.io/tavolo-dei-maghi/privacy.html

## Immagini (cartella store/)

- Icona 512×512: `web/icons/icon-512.png`
- Grafica in evidenza 1024×500: `store/grafica-in-evidenza-1024x500.png`
- Screenshot del telefono (almeno 2): `store/telefono-home.png`, `telefono-partita.png`, `telefono-previsione.png`, `telefono-profilo.png`

## Sicurezza dei dati: risposte consigliate

L'app non ha server propri e non usa statistiche di utilizzo, pubblicità o account. Durante una partita i dati passano direttamente fra i dispositivi dei giocatori (collegamento WebRTC cifrato). Un server pubblico gratuito (PeerJS) serve solo a far incontrare i dispositivi.

La scelta più prudente è dichiarare i dati che passano agli altri giocatori:

| Tipo di dato | Raccolto | Condiviso | Facoltativo | Perché |
|---|---|---|---|---|
| Info personali → Nome (soprannome del giocatore) | Sì | No | Sì | Funzionalità dell'app |
| Foto e video → Foto (foto profilo) | Sì | No | Sì | Funzionalità dell'app |
| Audio → Registrazioni vocali o audio (chat vocale) | Sì | No | Sì | Funzionalità dell'app |

Per tutti e tre:
- dati cifrati durante il trasferimento: **Sì**;
- trattamento temporaneo: **Sì** per l'audio, che non viene registrato;
- l'utente può chiedere l'eliminazione: i dati non restano su nessun server, le statistiche si azzerano dal Profilo e disinstallando l'app si cancella tutto.

Le regole di Google prevedono eccezioni in cui alcuni dati non vanno dichiarati. Prima di inviare, rileggi le domande del modulo.

## Altri moduli di Play Console

- **Classificazione dei contenuti** (questionario IARC). Categoria "Gioco". Niente violenza, niente gioco d'azzardo con soldi veri. Alla domanda sull'interazione tra utenti rispondi **Sì**, perché c'è la chat vocale e scritta, ma solo con chi ha il codice.
- **Pubblico di destinazione.** Scegli 13+ o 16+, non "bambini": un'app per bambini deve seguire regole molto più severe.
- **Annunci:** No.
- **Accesso all'app:** tutte le funzioni sono disponibili senza credenziali.
- **App governativa, finanziaria o sanitaria:** No.
