window.SAFETRACE_DATA = {
  meta: { caseId: "DE-UVGO-2026", updated: "2026-08-24", consultationDeadline: "2026-08-28T23:59:59+02:00" },
  changes: [
    {id:"c1", type:"official", status:"Entwurf", title:"Regelwerk wird stark verkürzt", before:"54 Paragrafen", after:"24 Paragrafen", evidence:"Das BMWE beschreibt die Reduktion von 54 auf 24 Paragrafen als Kern der Neufassung.", source:"s1", confidence:"hoch"},
    {id:"c2", type:"official", status:"Reformrichtung", title:"Direktaufträge bis 50.000 € auf Bundesebene", before:"niedrigere bzw. temporär abweichende Grenzen", after:"50.000 € allgemeine Bundes-Wertgrenze", evidence:"Offizielle BMWE-Materialien zum Vergabebeschleunigungsgesetz nennen eine allgemeine Bundes-Wertgrenze von 50.000 €.", source:"s3", confidence:"hoch"},
    {id:"c3", type:"official", status:"Reformrichtung", title:"Verhandlungsvergabe bis 100.000 € vereinfacht", before:"stärker an Voraussetzungen gebunden", after:"bis 100.000 € voraussetzungslos nutzbar", evidence:"BMWE beschreibt die Verhandlungsvergabe ohne Teilnahmewettbewerb bis 100.000 € als vereinfachtes Verfahren.", source:"s4", confidence:"hoch"},
    {id:"c4", type:"analysis", status:"Sekundäranalyse", title:"Mehr Bekanntmachung durch öffentliche Verhandlungsvergabe", before:"bestimmte beschränkte Verfahren nicht öffentlich sichtbar", after:"potenziell mehr Beschaffungsvorgänge öffentlich bekannt", evidence:"Eine vergaberechtliche Analyse von Pinsent Masons sieht hierin einen Transparenzgewinn für Bieter.", source:"s5", confidence:"mittel"},
    {id:"c5", type:"analysis", status:"Sekundäranalyse", title:"Öffentlich-öffentliche Zusammenarbeit als Wettbewerbsfrage", before:"engere Voraussetzungen", after:"potenziell vereinfachte Zusammenarbeit", evidence:"Die Analyse weist darauf hin, dass mehr Beschaffungsvolumen dem Wettbewerb entzogen werden könnte; das ist eine Risikoanalyse, kein festgestellter Effekt.", source:"s5", confidence:"mittel"},
    {id:"c6", type:"gap", status:"Offene Evidenz", title:"Welche Transparenzpflichten ändern sich final?", before:"heutige Veröffentlichungspflichten", after:"finale Fassung noch unbekannt", evidence:"Bis Abschluss der Konsultation und Veröffentlichung der Endfassung ist keine belastbare Vorher/Nachher-Bewertung möglich.", source:"s1", confidence:"offen"},
    {id:"c7", type:"gap", status:"Offene Evidenz", title:"Wie stark steigt der Anteil von Direktvergaben?", before:"Baseline noch nicht im Tracker", after:"Outcome nach Inkrafttreten", evidence:"Eine höhere Wertgrenze schafft mehr rechtliche Möglichkeit; daraus folgt nicht automatisch eine tatsächliche Zunahme. Diese muss gemessen werden.", source:"s3", confidence:"offen"},
    {id:"c8", type:"gap", status:"Offene Evidenz", title:"Wird Beschaffung messbar schneller?", before:"Baseline fehlt", after:"nach Reform messbar", evidence:"Das politische Ziel ist Beschleunigung. SafeTrace bewertet Erfolg erst anhand späterer Verfahrensdaten.", source:"s1", confidence:"offen"}
  ],
  evidence: [
    {date:"2025-12-04", kind:"official", title:"Föderale Modernisierungsagenda", detail:"Bund und Länder vereinbaren eine substanzielle Vereinfachung und möglichst einheitliche Handhabung im Unterschwellenbereich.", source:"s1"},
    {date:"2026-06-10", kind:"official", title:"BMWE konkretisiert Vereinfachungen", detail:"BMWE beschreibt u. a. 100.000-€-Grenze für Verhandlungsvergaben ohne Teilnahmewettbewerb und Startup-Erleichterungen.", source:"s4"},
    {date:"2026-06-30", kind:"official", title:"UVgO-Neuentwurf veröffentlicht", detail:"BMWE legt den Entwurf vor; Reduktion von 54 auf 24 Paragrafen.", source:"s1"},
    {date:"2026-07-01", kind:"official", title:"Downloadseite für Entwurf und Erläuterungen", detail:"BMWE stellt Entwurf und gesonderte Erläuterungen öffentlich bereit.", source:"s2"},
    {date:"2026-07-18", kind:"analysis", title:"Erste strukturierte Fachanalyse", detail:"Vergaberechtliche Analyse ordnet mögliche Transparenz- und Wettbewerbswirkungen ein.", source:"s5"},
    {date:"2026-08-24", kind:"verification", title:"SafeTrace Quellencheck", detail:"BMWE-Seite nennt weiterhin 28. August 2026 als Frist für Stellungnahmen. Finale Fassung noch nicht veröffentlicht.", source:"s1"},
    {date:"2026-08-28", kind:"deadline", title:"Ende der Konsultationsfrist", detail:"Bis zu diesem Datum können Stellungnahmen zum Entwurf beim BMWE eingereicht werden.", source:"s1"}
  ],
  stakeholders: [
    {name:"Bundesministerium für Wirtschaft und Energie (BMWE)", role:"Regelungsgeber / Konsultation", stance:"Vereinfachung und Beschleunigung; 54 → 24 Paragrafen.", topics:["Beschleunigung","Vereinfachung","Digitalisierung"], source:"s1", type:"official"},
    {name:"Pinsent Masons", role:"Öffentliche Fachanalyse", stance:"Sieht Chancen durch öffentliche Verhandlungsvergabe und weist zugleich auf Wettbewerbsfragen bei öffentlich-öffentlicher Zusammenarbeit hin.", topics:["Wettbewerb","Transparenz","Verfahren"], source:"s5", type:"analysis"}
  ],
  sources: {
    s1:{tier:1, label:"BMWE · Unterschwellenvergabeordnung (UVgO)", url:"https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Artikel/Service/unterschwellenvergabeordnung-uvgo.html", note:"Primärquelle · Entwurf, Frist und Reformziel"},
    s2:{tier:1, label:"BMWE · Entwurf & Erläuterungen", url:"https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Downloads/U/uvgo-neufassung-entwurf.html", note:"Primärquelle · offizieller Downloadbereich"},
    s3:{tier:1, label:"BMWE · Vergabebeschleunigungsgesetz", url:"https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Downloads/Gesetz/2025/20250806-gesetzentwurf-vergabebeschleunigungsgesetz-kabinettsvorlage.pdf?__blob=publicationFile&v=12", note:"Primärquelle · 50.000-€-Direktauftragsgrenze im Bundesrahmen"},
    s4:{tier:1, label:"BMWE · Beschaffung vereinfachen, 10.06.2026", url:"https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Pressemitteilungen/2026/06/20260610-bmwe-vereinfacht-oeffentliche-beschaffung.html", note:"Primärquelle · Verhandlungsvergabe und Startup-Regeln"},
    s5:{tier:2, label:"Pinsent Masons · Analyse UVgO-Reform", url:"https://www.pinsentmasons.com/de-de/out-law/analyse/neustart-im-unterschwellenbereich-reform-uvgo-folgen-auftraggeber-bieter", note:"Reputable Sekundäranalyse · praktische Folgen"}
  }
};