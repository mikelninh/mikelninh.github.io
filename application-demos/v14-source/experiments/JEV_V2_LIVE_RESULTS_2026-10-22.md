# RETURN LOOP · Jev v2: 16 neue synthetische Grenzfälle

**Ergebnis:** 15/16 exakt richtig, ohne übersehene Qualitätsmeldungen oder falsche Qualitätsalarme. Vorab festgelegtes Forschungsziel **erfüllt**. Dies ist keine Aussage über Produktionsgenauigkeit.

**Messung:** 22.10.2026 · TypeSafe Jev `jev-1.14.0` · genau 16 zuvor erstellte `CH-001` bis `CH-016` · **5 präzisierte semantische Noul-Fragen + feste Schwelle 0,80 + deterministischer „other“-Fallback** · vier echte gebündelte API-Aufrufe. Die acht früheren Fälle waren die Entwicklungsbasis für Fragen und Schwelle; diese 16 Fälle wurden vorher nicht mit Jev ausgeführt.

## Ergebnis nach separat nachgerechneten Einzelvorhersagen

| Metrik | Einfache Regeln | Jev v2 |
|---|---:|---:|
| Vollständig richtige Multilabel-Zuordnungen | 7/16 (43,75 %) | **15/16 (93,75 %)** |
| Übersehene `quality`-Hinweise (6 Soll-Fälle) | 3/6 | **0/6** |
| Falsche `quality`-Alarme | 0 | **0** |
| Zusätzliche falsche Kategorien (über alle Fälle) | 8 | **0** |
| Fehlende Soll-Kategorien (über alle Fälle) | 10 | **1** |

Jev löste die acht Fälle `CH-001`, `CH-002`, `CH-004`, `CH-005`, `CH-007`, `CH-008`, `CH-011` und `CH-012`, die die Regeln nicht vollständig erkannten. Kein Fall wurde gegenüber einer zuvor vollständig richtigen Regel-Zuordnung verschlechtert. Beide Verfahren scheiterten an `CH-006`.

**Einziger Jev-v2-Fehler, CH-006:** „Kann ich Größe L statt S erhalten und dafür die kleinere zurückschicken?“; eingefrorene Soll-Kategorien: `fit` und `return`. Jev erkannte nur `return` (`0,99`); der `fit`-Score blieb bei `0,30` und damit unter 0,80. Die Soll-Beschriftung kann sprachlich diskutiert werden; sie wird **nicht nachträglich korrigiert**.

## Was hat sich gegenüber Jev v1 geändert?

Das erste Jev-Experiment zeigte bei 0,50 auf acht **anderen** bekannten Entwicklungsfällen nur **3/8** vollständig richtige Klassifikationen und **6 falsche Zusatzkategorien**. Für v2 wurden **gleichzeitig** die Fragen enger formuliert, der Schwellenwert auf 0,80 gesetzt und `other` ausschließlich aus dem Fall ohne passende Fachkategorie abgeleitet.

Die positiven v2-Ergebnisse sind auf einem anderen synthetischen Set erhoben. Deshalb dürfen wir weder „v2 hat v1 um 56 Prozentpunkte verbessert“ noch „die höhere Schwelle war alleine ursächlich“ behaupten. Welcher Teil der Änderung wie viel beigetragen hat, ist nicht isoliert getestet.

## Vorab definierte Erfolgskriterien – alle erfüllt

Der Forschungsplan `JEV_V2_PRECOMMIT_2026-10-22.md` verlangte für weiteren Jev-Routing-Forschungsbedarf:

- mindestens **8/16** vollständige Fälle → **15/16**;
- höchstens **3/6** verpasste Qualitätshinweise → **0/6**;
- **0** falsche Qualitätsalarme → **0**.

Die vier tatsächlichen Aufrufe enthalten insgesamt **80 Noul-Entscheidungen** (20 pro Batch) und **16.218 ausgewiesene Input-Tokens**. Der Durchschnitt der vier vom Server gemessenen Vierer-Batch-Latenzen beträgt **100 ms** (153, 96, 77, 74 ms). Dies ist **keine Einzelfall-Latenz** und wurde nicht gleichzeitig gegen die frühere OpenAI-Messung gebenchmarkt.

**Kosten unbekannt:** In allen vier API-Antworten fehlt der ausgewiesene Preis (`cost_usd_reported: null`); daher **keine v2-Kostenbehauptung**.

## Engineering-Entscheidung

**Jev ist ein interessanter Kandidat für schnelle, strukturierte Support-Klassifikation in einem Pilot – nicht für einen unkontrollierten Produktivbetrieb.** Die Kombination aus fünf klar abgegrenzten Fragen und einer festen Policy hat auf dieser Stichprobe ihre vorab gesetzte Forschungs-Schwelle bestanden. Zusätzliche Entwicklung ist damit begründet; eine autonome Freigabe oder allgemeine Qualitätsbehauptung nicht.

**Vor einem produktiven Einsatz** benötigen wir unabhängig beschriftete echte bzw. datenschutzgerecht anonymisierte Supportfälle, Label-Konsistenzprüfung (insbesondere Größenwechsel vs. Passform), eine hinreichend große Blindprüfung, realistische Kosten- und Latenzmessungen im Gesamtworkflow, Sicherheitsfreigaben und menschliche Eskalation. Der zuvor erwogene Jev-**Antwortentwurfs-Sicherheitscheck** wurde in v2 **nicht getestet**: Hier ging es ausschließlich um Routing-Kategorien.

## Belege, Code und Methodik

- [Originale, vollständig archivierte Jev-v2-Messergebnisse mit Fall-Scores und Request-Hashes](../public/jev-v2-live-evidence.json)
- [Vorab registrierte Hypothese, Datensatz und Erfolgskriterien](./JEV_V2_PRECOMMIT_2026-10-22.md)
- [Originaler eingefrorener 16-Fälle-Datensatz](./jev_holdout_v1.json)
- [Fragen, Modell, Policy 80 %, Validierung, „other“-Fallback](../lib/jev_v2.js)
- [Server-Endpunkt mit Demo-Authentifizierung und begrenzten API-Aufrufen](../api/jev-v2.js)
- [Acht echte Node-Regressionstests mit gemocktem Anbieter](../tests/jev-v2.test.mjs)

**Integrität:** Die veröffentlichten Falltexte und Soll-Labels wurden vor der Veröffentlichung des Messergebnisses gegen den eingefrorenen Datensatz überprüft. Der berichtete Datensatz-Fingerprint lautet `d6bdd47fe81ea811e792ad9084a0cc90b2d2333b8ca843e893ff7282fe489291`. Vier Batches, 16 eindeutige IDs und die Fallkennzahlen wurden unabhängig nachgerechnet. Quelle sind exportierte API-Antworten aus dem RETURN-LOOP-Prototyp; ein externer, unabhängiger Audit der Anbietertransaktionen hat nicht stattgefunden.

> **Für Hiring Manager:** Ich habe nicht das schnellste KI-Modell einfach eingesetzt. Ich habe zuerst gemessen, wo eine erste Version scheitert, konkrete Hypothesen formuliert, die Policy vor dem nächsten Experiment eingefroren und sie anschließend an zuvor ungetesteten Fällen überprüft. Das Ergebnis war vielversprechend – mit klar dokumentierten Grenzen.
