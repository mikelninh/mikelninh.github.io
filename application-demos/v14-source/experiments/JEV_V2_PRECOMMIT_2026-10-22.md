# Jev v2 · Vorab registrierter 16-Fälle-Abschlusstest

**Stand: 22. Oktober 2026 – eingefroren vor dem ersten Jev-Aufruf auf CH-001 bis CH-016.**

## Geschäftsfrage

Kann die überarbeitete TypeSafe-Jev-Entscheidungslogik die Kundenanliegen in neuen synthetischen Support-Nachrichten mindestens so zuverlässig erkennen wie eine kostenlose Regex-Regelbaseline – ohne mehr falsche Qualitätshinweise auszulösen?

## Einfrieren und Abgrenzung

- Fixe 16 Fälle: `experiments/jev_holdout_v1.json`; unveränderte Sätze CH-001 … CH-016 aus dem zuvor erstellten Testpaket. SHA256 der ursprünglichen ZIP-Datei-Textfassung: `384252e0fbd45a23f8399e9123f0fea4298a292837f47e0bea344e1a81c73ac0`.
- **Kein unabhängig erhobenes oder von einer fremden Person verblindet beschriftetes Holdout.** Es handelt sich um zuvor erfundene synthetische Grenzfälle, die aber noch nicht mit Jev evaluiert wurden.
- Fragen ausschließlich aus den **alten acht** Fehlermustern abgeleitet: nicht bestätigter Retourenwunsch, Lieferabweichung versus Passform, unvollständige Bestellung versus Produktmangel, ungeprüfte Mehrfachkategorien.
- **Fester Wert: 0,80 für alle fünf unabhängigen Noul-Fachfragen**, ohne nachträgliche Änderung; sechste Kategorie `other` wird **nur bei null über-0,80-Kandidaten** deterministisch vergeben.
- Modell `jev-1.14.0`, direkt über TypeSafe `/v1/systemone`, in vier geschützten POST-Aufrufen mit jeweils 4 Fällen und 20 Entscheidungen.
- Keine Gold-Labels, Kundendaten, Shop-Aktionen oder Live-Rechnungsinformationen gehen in TypeSafe-Anfragen. Alles sind synthetische Texte.

## Vorab gemessene kostenlose Baseline

| Kennzahl | Regex-Regeln, CH-001 bis CH-016 |
|---|---:|
| Vollständig exakt richtige Fälle | **7/16** |
| Übersehene Qualitätshinweise | **3/6** |
| Falsche Qualitätshinweise | **0** |

Diese Baseline wurde **vor** dem Test erhoben und bleibt unverändert.

## Vorab festgelegtes Entscheidungskriterium

**Weiterführende Forschung zum Jev-Routing** lohnt sich nur, wenn Jev auf den 16 Fällen (a) mindestens **8/16** exakte Fälle erzielt, (b) maximal **3/6** Qualitätsfälle übersieht und (c) **keinen** falschen Qualitätsalarm erzeugt. Auch das wäre kein Produktionsnachweis.

**Jev als Qualitätshinweisgeber** könnte selbst bei weniger als 8/16 Exakt-Treffern interessant bleiben, aber nur, wenn es **weniger als 3/6** Qualitätshinweise übersieht und **keinen** falschen Qualitätsalarm hat; dies wäre eine engere beratende Rolle, nicht allgemeines Routing.

Andernfalls bleiben Regeln und das generative LLM die gewählte Architektur. Jeder zusätzliche Schwellwert, jede umformulierte Frage oder geänderte Fallauswahl würde eine **neue, zuvor unberührte Testmenge** erfordern.

## Messung und Nachvollziehbarkeit

Alle 16 Fälle werden einmal vollständig durchgeführt. Ergebnisdatei enthält: individuelle Scores für quality/fit/shipping/return/order_issue, Jev-Kategorien, menschliche Labels, Baseline, falsche Zusätze, ausgelassene Kategorien, API-Latenz **pro Vierer-Batch**, gemeldete Kosten und Request-Hash. Ein teilweiser Durchlauf wird explizit als **unvollständig** ausgegeben. Gegenüber früheren 8 Einzelfällen ist Batch-Latenz **nicht 1:1 vergleichbar**.

## Sicherheits- und UX-Regeln

- Der Schlüssel `TYPESAFE_API_KEY` bleibt serverseitig, das Passwort `DEMO_ACCESS_TOKEN` wird nur zur Authentifizierung im Browser genutzt.
- Jede bezahlte Untersuchung braucht vorherige aktive Zustimmung; maximal vier externe Aufrufe je vollem Versuch, mit Stoppen-Funktion und lokaler Wiederaufnahme.
- Unvollständige, invalide oder unerreichbare Modellantworten werden **nicht als Score gezählt**; Ergebnisse bereits abgeschlossener Vierergruppen werden lokal gespeichert.
- Keine automatische Bearbeitung von Reklamationen, kein Versand von Antworten und keine Shopänderungen.

**Fazit steht erst nach der vollständigen echten Jev-Messung fest.**
