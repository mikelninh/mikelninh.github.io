# RETURN LOOP · Jev-Abschlussmessung
*22. Oktober 2026 · 8 echte Jev-1.14-Aufrufe · 8 synthetische, handbeschriftete Entwicklungsfälle*

> **Entscheidung:** Jev **nicht** als alleinigen Support-Router mit der getesteten Schwelle von 0,50 einsetzen. Auf diesen acht bekannten Fällen ist die vollständige Zuordnung schlechter als mit einfachen Regeln. Jev liefert sehr schnelle und kostengünstige strukturierte Signale, benötigt aber eine validierte Routing-Policy und darf keine Kundennachrichten eigenständig freigeben.

## Ausgangsfrage

**Ist Jev gegenüber deterministischen Regeln und einem generativen LLM ein sinnvoller Baustein für Support-Routing?**

Alle drei Ansätze wurden auf denselben 8 Fall-IDs bewertet. Die LLM-Antworten stammen aus einem **früheren**, archivierten OpenAI-Test. Keine echten Kundendaten, keine externen Shopaktionen.

| Echte bzw. lokal berechnete Messwerte | Regeln | Jev (Live, TypeSafe; Schwelle 0,50) | OpenAI LLM (früher archiviert) |
|---|---:|---:|---:|
| Vollständig richtig klassifizierte Fälle | **5/8** | **3/8** | **7/8** |
| Übersehene Qualitätsmeldungen | 1 | 0 | 0 |
| Falsche Qualitätsalarme | 0 | **1** | 0 |
| Zusätzliche falsche Kategorien | 2 | **6** | 1 |
| Fehlende erwartete Kategorien (alle Anliegen) | 3 | 0 | 0 |
| Durchschnittliche API-Latenz | lokal | **106,25 ms** | **1.621 ms** |
| Geschätzter API-Preis der 8 Aufrufe | $0 | **$0,000185262** | **$0,0036384** |

**Preise:** Jev-Kosten entsprechen der Summe der providerseitig im Export angegebenen *Schätzwerte*. Für die acht OpenAI-Aufrufe wurden 5.632 Input- und 866 Output-Tokens aus der archivierten Testdatei abgelesen und mit den [öffentlichen gpt-4.1-mini-Tarifen](https://developers.openai.com/api/docs/models/gpt-4.1-mini) ($0,40/$1,60 je 1 Mio. Tokens) überschlägig berechnet. Die OpenAI-Abfrage generierte **zusätzlich Kundenantworten**, Jev nur Entscheidungen. Daraus lässt sich keine pauschale 20-fache End-to-End-Ersparnis ableiten. Die Durchschnittslatenzen stammen aus verschiedenen Testzeitpunkten und sind kein kontrollierter Lasttest.

## Die wichtigsten Fallbelege

- **RL-301:** Menschliches Label `quality`; Regeln `other`; Jev `quality` (Score **0,97**); OpenAI `quality`. Jev erkennt hier den subtilen Hinweis auf ungewöhnlichen Verschleiß.
- **RL-302:** Menschliches Label `quality`; Jev zusätzlich `return` (**0,77**), obwohl kein ausdrücklicher Rückgabe- oder Umtauschwunsch genannt wird.
- **RL-308:** Menschliche Labels `order_issue + return`; Jev zusätzlich `fit` (**0,95**), obwohl die falsche gelieferte Größe nicht automatisch eine Passformbeschwerde ist.
- **RL-314:** Menschliche Labels `quality + fit`; Jev zusätzlich `return` (**0,75**).
- **RL-316:** Menschliches Label `order_issue`; Jev außerdem `quality` (**0,67**) und `return` (**0,67**). Das ist der einzige falsche **Qualitätsalarm**.
- **RL-324:** Menschliche Labels `quality + return`; Jev zusätzlich `order_issue` (**0,59**).

Auf den übrigen zwei Fällen stimmt Jev mit den menschlichen Labels überein. Jev hat keine erwartete Kategorie weggelassen; es war auf dieser Auswahl eher **überinklusiv**.

## Nachträgliche Schwellenanalyse – ausdrücklich **kein zweiter Modelltest**

Aus denselben bereits gemessenen Jev-Scores wurde eine strengere Schwelle durchgespielt. Dabei gilt als ausdrücklich eingeführte Routingregel: Wenn **keine fachliche Kategorie** (quality, fit, shipping, return, order_issue) die Schwelle überschreitet, wird `other` vergeben.

| Schwelle | Exakt richtige Fälle | Übersehene Qualitätshinweise | Falsche Qualitätsalarme |
|---|---:|---:|---:|
| **0,50** (originaler Lauf) | 3/8 | 0 | 1 |
| 0,70 | 5/8 | 0 | 0 |
| **0,80** (nachträgliches Szenario) | **7/8** | 0 | 0 |

Bei 0,80 bleibt vor allem **RL-308** fehlerhaft (Jev ordnet die falsch gelieferte Größe immer noch zusätzlich als `fit` ein). **Achtung:** Die 0,80 wurden anhand derselben acht Fälle gefunden. Das ist *Datenanpassung* – **kein unabhängiger Leistungsnachweis**. Ohne den neu eingeführten `other`-Fallback hätte die bisherige reine Score-Schwellwertlogik bei 0,80 für RL-317 gar keine Kategorie ergeben und nur **6/8** exakt erkannt.

## Konsequenz für die Architektur

**Heute:** Regeln für einfache Fälle und unverzichtbare Policy-Grenzen; das generative Modell gezielt zur differenzierten Klassifikation und zur **Vorbereitung** menschlich geprüfter Antworten. Jev nicht als autonome Router- oder Freigabeinstanz.

**Forschungswürdig:** Jev könnte mit einer *vorab definierten* höheren Schwelle in einem selektiven Qualitäts-Check helfen. Ein unabhängiger, unveränderter Challenge-Satz muss vor einer solchen Entscheidung erneut geprüft werden. Auch die Sicherheitsprüfung von generierten Entwürfen mit Jev ist **noch nicht live getestet** – die acht Aufrufe prüften nur Support-Kategorien.

**Nächste Messung nur bei tatsächlichem Bedarf:** Auf einem *anderen*, zuvor gelabelten synthetischen Testset dieselben drei Verfahren bewerten und Review-Anteile, gefährliche Fehlklassifikationen sowie vollständige Workflow-Kosten messen. Schwelle vorab festlegen; keine weiteren Post-hoc-Änderungen auf demselben Set.

## Nachvollziehbarkeit

- Input: hochgeladene `return-loop-jev-live-ergebnisse.json`, `measured_at=2026-10-22T10:08:27.520Z`; 8 echte Jev-Aufrufe inklusive Scores, providerseitig geschätzten Kosten und Laufzeiten.
- Referenz: archivierte `return-loop-v14-reale-ki-auswertung.json`; 8 OpenAI-Aufrufe, dieselben Fall-IDs.
- **Grenzen:** Synthetische bekannte Entwicklungsfälle; keine blind erhobenen echten Supportdaten; keine unabhängig bewerteten Kundenantworten; unkalibrierte Scores; verschiedene Testzeitpunkte; keine realen Prozesseingriffe.

**Fazit für SNOCKS:** Wir haben *nicht* nachträglich Jev zum Gewinner erklärt, sondern trotz beeindruckender Geschwindigkeit den schwächeren Routing-Ausgang offengelegt und einen falschen Qualitätsalarm dokumentiert. Diese Architekturentscheidung ist die eigentliche Engineering-Leistung.
