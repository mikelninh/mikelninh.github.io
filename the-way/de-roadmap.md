# THE WAY / Deutschland-Labor – Release gates
Stand: 2026-11-28

## Leitprinzip
Gesellschaftliche Wirkung ist erst erreicht, wenn sie im Feld nachgewiesen und mit ihren Grenzen dokumentiert wurde. Keine erfundenen Agentenläufe, Partner, Messungen oder politischen Erfolge. Öffentliche Daten bleiben von Nutzerentwürfen getrennt.

| Stufe | Implementierung | Offene Abnahme |
| --- | --- | --- |
| 5 – Societal Intelligence | Leitstelle, 460/460 DIP-Metadaten der 21. Wahlperiode (Snapshot 28.11.2026), 10 Evidenzkarten, 16 Länder, zwei Rechenmodelle, Änderungshistorie | unabhängige Prüfung der Studienkarten; fortlaufende Datenaktualität prüfen |
| 6 – Research Institute | vier strukturierte Rollen, manueller KI-Runner mit Fragestellung und Evidenz-ID, JSON-Import im Studio | API-Schlüssel als Repository-Secret durch Eigentümer setzen; echte Review-Läufe und unabhängige Stichprobenprüfung |
| 7 – Mission Control | lokale Missionen mit Partnerstatus, Termin und Freigaben; kompatibler Projektexport; öffentlicher Pilot 001 im Issue #166 | schriftlich bestätigter Partner, vereinbarter Messplan, reale Baseline und unabhängige Feldmessung |
| 8 – Learning Network | versioniertes JSON-Austauschformat und öffentliches GitHub-Missionsboard mit Entwurf, Diskussion und Moderation durch Repository-Verantwortliche | private gemeinsame Online-Datenbank, Rollen und Rechte, Moderationsprozesse, mindestens zwei echte Organisationen |
| 9 – Europe | EU-27 Vergleich im World Lab anhand einheitlicher WDI-Indikatoren 2023; Recherchelinks zu Eurostat, EUR-Lex und Legislative Train | EU-spezifische Datenpipeline, Rechtsmonitor und mehrsprachige Zusammenarbeit |
| 10 – Planetary Intelligence | World Lab, 217 Länder und Gebiete, 595 Beobachtungen aus drei WDI-Indikatoren für 2023, Filter, Paarvergleich und CSV, monatlicher Aktualisierungsworkflow eingerichtet | erfolgreicher geplanter WDI-Refresh, historischer Vergleich, weitere Indikatoren, lokale Datenhoheit und grenzüberschreitender Wissensaustausch |

## Datenquellen und Aktualisierung
DIP: 21. Wahlperiode, Vorgangstyp Gesetzgebung. Vollständige Paginierung erforderlich. Bei wechselnder Gesamtzahl, ungültigen Daten oder fehlenden Seiten Abbruch ohne Veröffentlichung. Erstmalig erfasste Einträge nicht als neue Gesetzgebung ausgeben. Letzte 30 Vergleichsläufe speichern. Rechtsstand und beobachtete Wirkung separat verifizieren.
Workflow: .github/workflows/the-way-de-pipeline.yml. Vollständiger Snapshot im Repository bestätigt; dauerhafte zukünftige Verfügbarkeit nicht garantiert.

World Bank: WDI 2023, 217 Länder/Gebiete, EU-27. Lebenserwartung 217 Werte, Internetnutzung 181, BIP pro Kopf KKP (konstante internationale Dollar 2021) 197. Fehlende Werte bleiben fehlend. Stromzugang wegen Abrufausfall nicht aufgenommen. Katalog und alle drei Indikatoren werden monatlich für dasselbe Bezugsjahr erneut abgerufen, nicht mit anderen Jahren vermischt. Workflow: .github/workflows/the-way-world.yml. Erster automatischer Lauf nicht bestätigt. Quellen-API: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api

## Erstes Feldprojekt
Pflanzliche Gemeinschaftsgastronomie in Berlin: https://github.com/mikelninh/mikelninh.github.io/issues/166 . Öffentliche Diskussion, kein Partner bestätigt, keine Kontaktaufnahme erfolgt. Kontaktentwurf und Messwerkstatt verlinkt. Keine personenbezogenen Daten erheben; Kosten, Abfall, Auswahl und Zugang prüfen.

## Prüfstand
15/15 simulierte DOM-Prüfungen der Leitstelle beim vorherigen Release. 15/15 simulierte DOM- und Datenprüfungen des World Lab am 28.11.2026: Datenbestand, EU-Filter, Suche, CSV, Standardvergleich, fehlende Werte, eindeutige IDs, gültige Werte, Missionsboard-Präfix, Einreichungsentwurf und DIP-Vollständigkeit. Kein vollständiger visueller Browser- oder Mobiltest; kein echter KI-Lauf; keine Feldwirkung. Keine fremden Supabase-Projekte verändert.
