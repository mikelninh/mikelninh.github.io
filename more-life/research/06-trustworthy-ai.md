# MORE LIFE Research Dossier 6 — Gemeinwohl-KI: Nützlich ist nur, was überprüfbar funktioniert

**Forschungsstand: 23.11.2026** · Querschnittswerkzeug · Hohes technisches Team-Fit · Reale Sicherheitsrisiken · [Öffentlicher Atlas](https://mikelninh.github.io/more-life/atlas/) · [Offene Aufgabe #163](https://github.com/mikelninh/mikelninh.github.io/issues/163)

**Kurz:** Diese Untersuchung liefert eine überprüfbare Ausgangsbasis und testbare Hypothesen. Keine Partnerzusage, keine Feldwirkung, kein Projektcommitment.

## 1. Warum nicht einfach eine Agentenplattform bauen?
Der [Stanford AI Index 2026](https://hai.stanford.edu/ai-index/2026-ai-index-report/technical-performance) berichtet für OSWorld eine Bestleistung von **66,3 % Task-Erfolg** gegenüber einer dort verwendeten menschlichen Baseline von **72,35 %** (Benchmarkdaten 2025). Das ist eine strukturierte Computer-Aufgaben-Evaluation und **keine** weltweite Fehlerwahrscheinlichkeit in realen sozialen Anwendungen. Andere Benchmarks und echte Einsatzsituationen unterscheiden sich erheblich.

## 2. Forschungsstand
- [NIST Generative AI Profile, 2024](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence) fordert anwendungsbezogenes Risiko-Management über Funktionen und Lebenszyklus, nicht nur Modell-Punktzahlen.
- [NIST ARIA Evaluation Planning Manual, 2026](https://www.nist.gov/publications/aria-evaluation-planning-manual-elements-aria-style-ai-evaluations) kombiniert Modelltests, adversariale Tests und Nutzertests. Das passt zu unserem Prinzip, Ergebnisse, Sicherheitsgrenzen und menschliches Urteil getrennt zu bewerten.
- Die EU hat 2026 den **AI Act durch die AI-Omnibus-Regelung geändert**. Hochrisiko-Anwendungsfristen und Pflichten richten sich nach konkretem Einsatzfeld; insbesondere sind Fristen nun gestaffelt. Vor einem realen Test sind die aktuellen Anforderungen der [EU-Kommission](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai) und Datenschutzpflichten zu prüfen.

## 3. Typische Schadenspfade
Falsche Quelle wird als Beleg interpretiert; Empfehlung wird für verbindliche Entscheidung gehalten; personenbezogene Daten landen in Logs oder externen APIs; Agenten setzen im Hintergrund nicht autorisierte Aktionen um; ein Fehler wird über mehrere Schritte nicht entdeckt; Ressourcenaufwand wächst ohne verbessertes Ergebnis.

## 4. Kandidaten für einen echten, begrenzten Einsatz
**Kein Chatbot für alles.** Wir brauchen zunächst eine von einer Organisation definierte, häufig wiederkehrende, **risikoarme** Aufgabe. Beispiele nur bei Einwilligung: öffentliche Förderinformationen klassifizieren, veröffentlichte Berichte zusammenfassen, barrierearme Terminbeschreibung aus bereitgestellten Materialien erstellen. Keine automatische Leistungsentscheidung, Diagnostik, Geldtransfers oder unkontrolliertes Outsourcing personenbezogener Kommunikation.

## 5. Evaluationsdesign: Human vs. Simple Rules vs. AI
- Vorab: Owner, Ziel, Ein-/Ausschlusskriterien, Datenschema, dokumentierte Baseline und fachliches Bewertungsschema.
- **Pilot mit 30 geeigneten, zulässig erhobenen Fällen**: bestehender Arbeitsweg (A), einfachste regelbasierte Verbesserung (B), KI-gestützter Entwurf mit menschlicher Freigabe (C). Aufgaben möglichst zufällig gleichmäßig zuweisen oder bei identischem Input verblindet gegentesten; Lerneffekte dokumentieren.
- **Primärmetrik:** fachlich korrekte, vollständig geprüfte Ergebnisse pro menschlicher Arbeitsstunde. **Sekundär:** kritische *unerkannte* Fehler, Nacharbeit, p50/p95 Latenz, Kosten pro korrekter Aufgabe, Zufriedenheit und Fairness. Eintrag im Audit-Log: Inputquelle, Version, abgeleitetes Ergebnis, verifizierbare Belege, Freigabe, abweichende Expertenbewertung. **Keine Offenlegung von privaten chain-of-thought-Inhalten erforderlich.**
- **Statistische Grenze:** Selbst **0 kritische Fehler in 30 Fällen** würde grob nur eine einseitige 95%-Obergrenze von etwa **9,5 %** für die zugrundeliegende Fehlerrate erlauben (bei unabhängigen identisch verteilten Fällen). Damit ist ein kleines Pilotprojekt **kein Sicherheitsnachweis** für seltene Ereignisse.
- **Vorab festgelegte Stop-Kriterien:** Jede unerlaubte externe Aktion, unkontrollierter Datenabfluss oder ein unerkannter schwerwiegender Fehler stoppt den Test. Automatisierung nur nach separater Review-/Freigaberunde und erheblich größerer Evaluation.

## 6. Technische Architektur
Eingaben und Datenquellen → eng begrenzter Task Runner → menschlich lesbares Ergebnis mit zitierfähiger Evidenz → **separater unabhängiger Validator** → menschliche Freigabe → protokolliertes Endergebnis → regelmäßige Evaluation. Least privilege, kein autonomer Versand oder sensible Write-Aktionen im Pilot, datensparsame Logs und nachvollziehbare Löschfristen.

## 7. Realistischer 30-Tage-Weg
**Woche 1:** NGO-Aufgabe und Freigabe, Sicherheits- und Datenschutzprüfung. **Woche 2:** 30 Fälle und Baseline. **Woche 3:** einfachen Vergleich bauen. **Woche 4:** verblindete Bewertung, offene Resultate *mit Einschränkungen* und klare Stop/Improve/Scale-Entscheidung.

**Wer hilft?** AI Engineering, Fachpersonen, UX, unabhängige Evaluation, Security/Datenschutz. **Partnerstatus:** unbestätigt. **Erfolgsvoraussetzung:** realer Bedarf statt einer eindrucksvollen Demo.

## Quellen
1. [Stanford HAI, AI Index 2026, Technical Performance](https://hai.stanford.edu/ai-index/2026-ai-index-report/technical-performance).
2. [NIST GenAI Risk Profile, 2024](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence).
3. [NIST ARIA Evaluations Manual, 2026](https://www.nist.gov/publications/aria-evaluation-planning-manual-elements-aria-style-ai-evaluations).
4. [EU-Kommission, AI Act und Änderungen 2026](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai).


---
## Wie diese Forschung zu lesen ist
**Status:** Desk Research vom 23.11.2026, kein systematischer Review, keine eigene Feldstudie. Primärquellen, fachliche Reviews und Organisationseigenangaben sind gekennzeichnet. Publikationsjahr ≠ Datenjahr. Wo ein kausaler Nachweis fehlt, steht ausdrücklich *Hypothese*.

**MORE-LIFE-Testprinzip:** Erst (1) Problem und Betroffene, (2) Partner und bestehende Lösungen, (3) Baseline, (4) Intervention, (5) primären Outcome und Schutzmetriken, (6) unabhängige Prüfung und (7) Entscheidung *Stop / Improve / Scale* definieren. Aktivitäten wie Anfragen, KI-Tokens und Klicks nicht als gesellschaftliche Wirkung ausgeben.

**Status-Interpretation:** »Recherche abgeschlossen« bedeutet, dass eine zitierfähige, handlungsfähige Erstanalyse erstellt ist. *Nicht* dass Partner, fehlende Daten, Feldtests, Finanzierung oder eine messbare Wirkung schon vorliegen.
