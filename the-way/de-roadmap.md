# THE WAY / Deutschland-Labor – Release gates
Stand: 2026-11-28

## Leitprinzip
Gesellschaftliche Wirkung ist erst erreicht, wenn sie im Feld nachgewiesen und mit ihren Grenzen dokumentiert wurde. Keine erfundenen Agentenläufe, Partner, Messungen oder politischen Erfolge. Öffentliche Daten bleiben von Nutzerentwürfen getrennt.

| Stufe | Vorhanden | Abnahme für nächste Reife |
| --- | --- | --- |
| 5 – Societal Intelligence | Leitstelle, 200 DIP-Metadaten von 460 gemeldeten, 10 Evidenzkarten, 16 Länder, zwei Rechenmodelle | vollständiger DIP-Abruf und erfolgreicher automatischer Refresh; Änderungshistorie; unabhängige Prüfung der Studienkarten |
| 6 – Research Institute | vier strukturierte Rollen, manueller KI-Runner mit Fragestellung und Evidenz-ID, JSON-Import im Studio | API-Schlüssel im Repository-Secret durch Eigentümer setzen; echte Review-Läufe; Stichprobenprüfung auf falsche Quellen und Aussagen; keine automatische Veröffentlichung |
| 7 – Mission Control | lokale Missionen mit Partnerstatus, Termin und Freigaben; kompatibler Projektexport | schriftlich bestätigter Pilotpartner, vereinbarter Messplan, reale Baseline, Feldmessungen, unabhängige Auswertung |
| 8 – Learning Network | versioniertes JSON-Austauschformat und Import mit zurückgesetzten Freigaben | gemeinsam nutzbare Online-Datenbank, Rollen und Rechte, Moderation, Einwilligung, Datenlöschung, mindestens zwei echte Organisationen |
| 9 – Europe | noch nicht implementiert | geprüfte EU- und Länderquellen, gemeinsame Metadatendefinitionen und Übersetzungen; Vergleichbarkeit testen |
| 10 – Planetary Intelligence | noch nicht implementiert | interkulturelle Anpassung, lokale Datenhoheit, überprüfte globale Quellen und realer grenzüberschreitender Wissensaustausch |

## Datenpipeline
DIP: 21. Wahlperiode, Vorgangstyp Gesetzgebung. Vollständige Paginierung erforderlich. Bei wechselnder Gesamtzahl, ungültigen Daten oder fehlenden Seiten Abbruch ohne Veröffentlichung. Erstmalig erfasste Einträge nicht als neue Gesetzgebung ausgeben. Letzte 30 Vergleichsläufe speichern. Rechtsstand und beobachtete Wirkung separat verifizieren.
Workflow: .github/workflows/the-way-de-pipeline.yml. Lauf und tatsächliche Veröffentlichung des automatischen Updates müssen noch bestätigt werden.

## Erstes Feldprojekt
Pflanzliche Gemeinschaftsgastronomie in Berlin. Partner nicht bestätigt. Nächste Schritte: potenziellen Partner über offizielle Kontaktkanäle anfragen, freiwilligen Pilot und Messplan gemeinsam vereinbaren, keine personenbezogenen Daten erheben, Kosten, Abfall, Auswahl und Zugang prüfen. Keine politische Einreichung ohne menschliche Prüfung.

## Prüfstand
15/15 Checks in simulierten DOM-Elementen: Datenbestände, Berlin-Ausgangswert, Zielpfad, Kantinenrechnung, fehlender Ausgangsscore, Rating, Studienübergabe, Forschungsrollen, Mission speichern, Freigaben, kompatibles Projektpaket, Netzwerkaustausch und Reset importierter Freigaben. Kein vollständiger visueller Browser- oder Mobiltest; kein echter KI-Lauf; keine Feldwirkung.
