# Il Tavolo dei Maghi

Un tavolo per giocare a Wizard con gli amici, dal browser o con l'app: previsioni a turno, punteggio automatico, chat vocale, profili con statistiche e 60 carte dipinte.

- **Gioca dal browser**: https://gruppochatgpt707-spec.github.io/tavolo-dei-maghi/
- **Scarica l'app** (Android, Mac, Windows): pagina [Releases](../../releases/latest)

## Come è fatto

| Cartella | Contenuto |
| --- | --- |
| `web/` | Il gioco: pagina, stile, codice, carte dipinte, avatar, icone |
| `art/` | Il pittore che genera le carte e gli avatar (`node art/render.js all`) |
| `native/android/` | Impacchettamento Android con Capacitor |
| `native/desktop/` | App per Mac e Windows con Electron |
| `tests/` | Test delle regole e partite simulate a più dispositivi |
| `tools/build.py` | Prepara l'elenco dei file per il gioco senza rete |

Ogni modifica caricata su `main` ricompila sito e app in **Actions**: il sito viene pubblicato su GitHub Pages e le app compaiono nella pagina Releases.

Progetto amatoriale, non affiliato all'editore del gioco di carte Wizard. Illustrazioni originali generate dal codice in `art/`.
