# FINAL v10 · Zwei Arbeitsproben, zwei klare Aufgaben

**A11:** [BIDPILOT direkt öffnen](https://mikelninh.github.io/application-demos/bidpilot/)  
**SNOCKS:** [RETURN LOOP direkt öffnen](https://mikelninh.github.io/application-demos/return-loop/)

Die bisherigen URLs mit \`?demo=bidpilot\` und \`?demo=return-loop\` bleiben weiterhin benutzbar.

## Designprinzip

Eine **Frage**, ein **sofort sichtbares Ergebnis**, ein **sinnvoller nächster Schritt**. Erklärungen, technische Details, Ausnahmen und Uploads liegen in optionalen aufklappbaren Bereichen.

### BIDPILOT – für A11
Frage: **Welche Aufträge lohnen unsere Zeit?**

1. Webstudio / KI-Team / IT-Betrieb wählen.
2. Fachlich passendes Projekt und mögliche Teilnahmehürde nebeneinander prüfen; beides führt zu einer echten Originalquelle.
3. Entscheidung dokumentieren und exportieren.

Die Suche nutzt den datierten Snapshot mit 549 Bekanntmachungen vom 20.10.2026. Nur für einen Auftrag liegen einige veröffentlichte Teilnahmebedingungen separat vor. Die Lösung führt *keinen* vollständigen Eignungscheck aus, liefert keine rechtliche Garantie und hat noch keine gemessene Zeitersparnis. Bei Ausfall des Datensatzes werden drei klar gekennzeichnete Offline-Beispiele verwendet.

### RETURN LOOP – für SNOCKS
Frage: **Welche Kundenprobleme häufen sich?**

1. 20 synthetische Nachrichten ergeben sieben übereinstimmend erkannte Materialhinweise, acht Verfahrenskonflikte und zwei Nachrichten ohne Produktzuordnung.
2. Betroffene Nachrichten öffnen und automatische Kategorien oder Produktzuordnung manuell korrigieren.
3. Qualitätsnotiz freigeben und nachvollziehbaren Bericht herunterladen.

Kern: Regeln und ein auf 136 synthetischen Sätzen trainiertes Naive-Bayes-Textmodell. In 29 **bereits untersuchten** synthetischen Tests lagen 19 Modell- und 15 Regelzuordnungen richtig. Auf fünf Größen-/Passform-Fällen lag das Modell nur zweimal richtig. Die Testfälle sind nach Fehleranalyse **nicht mehr unberührt** und dürfen nicht als unabhängiger Abschlussbeweis angeführt werden.

Die Klassifikatoren geben keine kalibrierten Wahrscheinlichkeiten zurück. Es gibt keinen realen Shopzugriff, keine automatische Antwort, keine Rückerstattung und keine bewiesene Defektrate.

## Wie wir die Modellqualität tatsächlich verbessern

1. **Labels und Fehlerkosten definieren.** Anliegen wie Lieferung, Größe, Material und Rückgabe können gleichzeitig auftreten. Mehrfachlabels sind für gemischte Nachrichten geeigneter als eine erzwungene sechste Klasse. Falsche Materialwarnungen und verpasste schwerwiegende Fälle sind gesondert zu betrachten.
2. **Sauberes neues Datenmaterial.** Unabhängig formulierte, idealerweise freigegebene und anonymisierte Supportnachrichten; Beispiele von ähnlichen Aufträgen / Produkten müssen zwischen Trainings- und Testset getrennt bleiben. Ein festes finales Testset nach dem Split nicht mehr zum Entwickeln verwenden.
3. **Vergleich auf demselben Entwicklungsset.** Regeln; bisheriges Naive Bayes; TF-IDF + Logistic Regression oder linear SVM; gegebenenfalls multilinguale Embeddings. Gleiche Daten und gleichen Evaluationsprozess verwenden. Eine teure LLM-Anbindung ist kein Selbstzweck.
4. **Sicherheitsmetriken vor Accuracy.** Precision und Recall je Anliegen, Macro-F1, Fehlalarme pro 100 Tickets, Testabdeckung, Anteil manueller Reviews, Abbruch/Enthaltung und Korrektheit nach menschlicher Freigabe. Keine automatischen Shop-Aktionen bei Unsicherheit.
5. **Einmalige Abschlussmessung.** Nach Auswahl der Lösung einmal auf dem vorher unberührten Testset bewerten, Fehlerfälle dokumentieren und Ergebnisse unabhängig von ihrem Niveau veröffentlichen. Keine Überanpassung an die bekannten 29 Nachrichten.

**Qualitätsziele, keine gemessenen Ergebnisse:** Material-Precision mindestens 95 %, Material-Recall möglichst über 80 %, alle automatisch zurückgestellten Fälle für menschliches Review sichtbar. Die genauen Schwellen sind vor einem Pilot mit Fachpersonen und geeigneten Daten zu vereinbaren.

## Code und Tests

Die fachlichen Funktionen liegen in:
- \`application-demos/bid-screening.js\`
- \`application-demos/return-triage.js\`
- \`application-demos/ml-triage.js\`
- \`application-demos/v9-core.js\`

Die reduzierte Oberfläche liegt in \`application-demos/v10.js\` und \`v10.css\`. Reproduzierbarer Testlauf: \`node application-demos/tests-v10.cjs\`.

**Offenes Release-Gate:** unabhängiger Browser-/Mobile-Test und mindestens fünf Testpersonen, die ohne Erklärung selbst einen Fall lösen. Der veröffentlichte Code und automatisierte Interaktionstests sind kein Ersatz für echten Nutzernachweis.