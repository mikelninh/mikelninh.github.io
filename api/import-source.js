function safeUrl(raw) {
  const u = new URL(raw);
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Only http(s) URLs are allowed.');
  const h = u.hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.local') || h === '127.0.0.1' || h.startsWith('10.') || h.startsWith('192.168.') || /^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) {
    throw new Error('Private or local network URLs are blocked.');
  }
  return u;
}
function stripHtml(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&uuml;/g, 'ü').replace(/&ouml;/g, 'ö').replace(/&auml;/g, 'ä').replace(/&szlig;/g, 'ß')
    .replace(/\s+/g, ' ')
    .trim();
}
function titleFrom(html, url) {
  const m = String(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return (m ? stripHtml(m[1]) : url.hostname).slice(0, 140);
}
function classifyStatement(text) {
  const low = text.toLowerCase();
  const types = [];
  if (/sollte|muss|darf|gerecht|fair|besser|schlechter|wichtig|richtig|falsch/.test(low)) types.push('value_or_norm');
  if (/glaube|bewusstsein|seele|gott|liebe|sinn|karma|spirituell/.test(low)) types.push('belief_or_metaphysical');
  if (/wird|könnte|wahrscheinlich|zukünftig|bald|wenn/.test(low)) types.push('prediction_or_condition');
  if (/ist|sind|hat|haben|benötigt|brauchen|öffnungszeiten|termin|gebühr|adresse|quelle|gesetz|antrag/.test(low)) types.push('factual_claim');
  return types.length ? types : ['unclassified'];
}
function inferTopic(text, title) {
  const s = `${text} ${title}`.toLowerCase();
  if (/personalausweis|ausweis|passfoto|reisepass/.test(s)) return ['personalausweis', 'Bürgeramt', 'appointment'];
  if (/ummeld|umzug|wohnungsgeber|melde/.test(s)) return ['ummeldung', 'Bürgerbüro', 'appointment_or_callback'];
  if (/öffnungszeiten|geöffnet|sprechzeiten|uhr/.test(s)) return ['oeffnungszeiten', 'Allgemeine Auskunft', 'answer'];
  if (/mängel|maengel|defekt|schlagloch|laterne|müll|muell/.test(s)) return ['maengelmelder', 'Bauhof / Tiefbauamt', 'ticket'];
  if (/rückruf|telefon|kontakt/.test(s)) return ['rueckruf', 'Telefonzentrale', 'callback'];
  return ['importiert', 'Fachbereich prüfen', 'answer'];
}
function stepsFrom(text, topic) {
  const base = {
    personalausweis: ['Anliegen und Alter klären', 'Unterlagen prüfen', 'Termin vorbereiten', 'Sonderfälle an Bürgeramt übergeben'],
    ummeldung: ['Zuzugsdatum klären', 'neue Adresse erfassen', 'Wohnungsgeberbestätigung prüfen', 'Termin oder Rückruf vorbereiten'],
    oeffnungszeiten: ['Fachbereich klären', 'Öffnungszeiten aus Quelle ausgeben', 'abweichende Zeiten markieren'],
    maengelmelder: ['Standort aufnehmen', 'Kategorie bestimmen', 'Dringlichkeit prüfen', 'Ticket vorbereiten'],
    rueckruf: ['Name erfassen', 'Telefonnummer erfassen', 'Zeitfenster klären', 'Kontext an Fachbereich übergeben']
  };
  return base[topic] || ['Quelle prüfen', 'Aussage in Chunk übernehmen', 'Fachbereich zuordnen', 'Eval-Frage ergänzen'];
}
function chunksFromText(text, title, sourceUrl) {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.length > 60 && s.length < 700);
  const picked = sentences.slice(0, 8);
  const joined = picked.join(' ').slice(0, 1800) || text.slice(0, 1800);
  const [topic, department, action] = inferTopic(joined, title);
  return [{
    id: `import-${Date.now()}`,
    topic,
    department,
    action,
    title: title || 'Importierte Quelle',
    text: joined,
    steps: stepsFrom(joined, topic),
    source: `Importierte Quelle: ${title || sourceUrl}`,
    source_url: sourceUrl,
    statement_types: classifyStatement(joined),
    status: 'suggested_admin_review_required'
  }];
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    let text = String(body.text || '').trim();
    let url = body.url ? safeUrl(String(body.url)) : null;
    let html = '';
    if (url) {
      const r = await fetch(url.toString(), { headers: { 'user-agent': 'CharlyKit Source Importer Demo/0.1' } });
      if (!r.ok) throw new Error(`Fetch failed with ${r.status}`);
      html = await r.text();
      text = stripHtml(html).slice(0, 12000);
    }
    if (!text || text.length < 80) return res.status(400).json({ error: 'Provide a URL or at least 80 characters of text.' });
    const title = url ? titleFrom(html, url) : String(body.title || 'Pasted source text').slice(0, 140);
    const chunks = chunksFromText(text, title, url ? url.toString() : 'pasted-text');
    const register_entry = {
      id: `source-${Date.now()}`,
      title,
      url: url ? url.toString() : null,
      imported_at: new Date().toISOString(),
      trust_level: 'unverified_admin_review_required',
      extraction: 'html_strip_or_paste_text',
      chunk_count: chunks.length,
      warnings: ['Heuristic extraction only', 'Admin approval required', 'Check date, jurisdiction and completeness before publishing']
    };
    return res.status(200).json({ ok: true, register_entry, chunks, preview_text: text.slice(0, 1200) });
  } catch (e) {
    return res.status(500).json({ error: 'Source import failed.', detail: e.message });
  }
}
