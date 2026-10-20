# Bewerbungslabor · Funktionsnachweis

**Eine Aufgabe statt einer Feature-Liste.**

## BIDPILOT · A11
**Problem:** Ein kleines Team verliert Zeit bei öffentlichen Aufträgen, die fachlich oder formal nicht passen.

**Was in der aktuellen Demo funktioniert:** Eigenes Teamprofil eingeben → einen *datierten, echten* TED-Datensatz mit 549 Einträgen durchsuchen → nur ausreichend lange offene Fristen und konkrete Themen-Treffer berücksichtigen → bis zu fünf begründete Ergebnisse mit Originalquelle vergleichen → mögliche Hindernisse und fehlende Nachweise erkennen → Entscheidung als TXT exportieren.

**Was wir nicht behaupten:** Kein vollständiges Lesen aller Vergabeunterlagen, kein Rechtsrat, keine verbindliche Eignungsprüfung, keine statistisch belegte Zeitersparnis. Nur für TED 714363-2026 sind zusätzlich ausgewählte Anforderungen aus einer veröffentlichten Sekundärquelle dokumentiert. Alle anderen Treffer führen explizit zur Originalquelle und enthalten offene Prüffragen.

## RETURN LOOP · SNOCKS
**Problem:** Wiederkehrende Probleme bleiben in vielen Supporttickets unsichtbar.

**Was in der aktuellen Demo funktioniert:** 20 synthetische Nachrichten aus reinem Freitext regelbasiert einordnen (Material / Lieferung / Größe / Rückgabe / mehrdeutig / unbekannt); Kategorie, Trefferwort und Unsicherheit pro Ticket erklären; mehrere Nachrichten pro Produkt zusammenfassen; manuell korrigieren; eine Prüfung vormerken und einen Bericht mit Textbelegen und Korrekturen herunterladen. Eigene anonymisierte CSV lässt sich ausschließlich im Browser bearbeiten.

**Reproduzierbare Tests** (im Repository, ohne Zusatzbibliotheken):

\`\`\`bash
node application-demos/tests-v7.cjs
\`\`\`

Es gibt 42 bewusst einfachere, selbst verfasste Regressionstests und 24 anspruchsvollere, ebenfalls synthetische Beispiele. Sie zeigen tatsächliche Regeln und Fehlerfälle – **keine unabhängige Live-Modell- oder Produktionsgenauigkeit**. Unklare Fälle erfordern Menschen. Die Meldeschwelle (4) ist demonstrativ und nicht statistisch validiert.

**Technischer Hintergrund:** Es existiert separat ein FastAPI-/SQLite-Prototyp mit menschlicher Freigabe und gespeichertem Audit. Der öffentliche Kurz-Demo-Workflow ist nicht mit diesem Backend verbunden. Er führt keine Shop-Aktionen aus, sendet keine Nachrichten und speichert keine realen Kundendaten.

## Live
- [BIDPILOT](https://mikelninh.github.io/application-demos/?demo=bidpilot)
- [RETURN LOOP](https://mikelninh.github.io/application-demos/?demo=return-loop)

**Nächster Nutzernachweis:** Fünf Personen testen lassen, wie oft sie ohne Erklärung in unter 90 Sekunden eine richtige Entscheidung treffen. Danach mit erlaubten realistischen Datensätzen messen, wie gut die Klassifikation generalisiert.