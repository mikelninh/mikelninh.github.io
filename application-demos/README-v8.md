# Bewerbungsprototypen v8 — Was wurde warum gebaut?

## A11 · BIDPILOT
**Recruiter-Erlebnis, 60 Sekunden:** Eine konkrete Entscheidung statt einer Suchmaschine. Die Seite lädt das Profil eines kleinen Webstudios und zeigt unmittelbar einen fachlich interessanten öffentlichen Auftrag sowie einen Auftrag mit erkennbaren Hürden. Beim Wechsel auf „KI-Team“ verändert sich die erste Empfehlung; jede Einschätzung hat einen Original-Link und eine Erklärung.

**Produktgedanke:** Die Hypothese ist, dass kleine Teams durch früh sichtbare Ausschlussgründe Zeit sparen. Das ist noch nicht mit Kunden bewiesen. Die Datenbasis ist ein datierter, begrenzter Import mit 549 TED-Bekanntmachungen (20.10.2026). Nur zu einer Bekanntmachung sind einzelne Teilnahmebedingungen sekundär dokumentiert. Keine rechtsverbindliche Eignungsprüfung, keine garantierte Genauigkeit.

## SNOCKS · RETURN LOOP
**Recruiter-Erlebnis, 60 Sekunden:** Eine unbekannte Nachricht („Leider läuft eine Masche …“) wird von zwei Methoden eingestuft. Die Regelbaseline meldet „nicht eindeutig“, das tatsächlich trainierte Naive-Bayes-Modell „Materialproblem“. Ein Mensch prüft das Ergebnis und exportiert eine dokumentierte Entscheidung.

**Training:** 136 selbst beschriftete, synthetische Sätze. Lokales multinomiales Naive Bayes mit Wort- und Zeichen-N-Grammen; Training und Inferenz erfolgen im Browser. **Kein LLM**, kein Modellanbieter, kein Prompt, keine Shop-Anbindung.

**Vergleich auf 29 separat formulierten synthetischen Tests:**
- Trainiertes Naive-Bayes-Modell: **19/29** richtig.
- Regelbaseline: **15/29** richtig.
- Falsche Zuordnungen sind in der Demo sichtbar.

Diese Zahlen belegen weder Produktionsqualität noch eine unabhängige Evaluation an realen Supportdaten. Die Roh-Werte des Modells sind **nicht als kalibrierte Wahrscheinlichkeiten verwendbar**. Unklare oder abweichende Ergebnisse verlangen eine menschliche Prüfung. Ein separater FastAPI-/SQLite-Prototyp ist nicht an die öffentliche Seite gekoppelt.

## Reproduzieren

\`\`\`bash
node application-demos/tests-v8.cjs
\`\`\`

Tests prüfen Quell-Links, Profilwechsel, mögliche Hürden, Null-Treffer, beide Klassifikatoren und Veränderungen durch manuelle Korrektur.

**Nächster sinnvoller Qualitätsschritt:** Fünf unvorbereitete Personen testen beide 60-Sekunden-Aufgaben. Für RETURN LOOP anschließend freigegebene, anonymisierte reale Fälle als unabhängiges Testset; für BIDPILOT vollständige Teilnahmebedingungen und messbare Nutzerentscheidungen.

Live-Demos: [BIDPILOT](https://mikelninh.github.io/application-demos/?demo=bidpilot) · [RETURN LOOP](https://mikelninh.github.io/application-demos/?demo=return-loop)