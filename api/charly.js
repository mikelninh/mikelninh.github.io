import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const provider = 'openrouter';
const apiKey = process.env.OPENROUTER_API_KEY;
const model = process.env.LLM_MODEL || 'deepseek/deepseek-chat-v3.1';

const client = new OpenAI({
  apiKey,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.SITE_URL || 'https://mikelninh.github.io/zaitgeist-v2/',
    'X-OpenRouter-Title': 'Michael Ninh Charly Micro-Sandbox'
  }
});

function loadKnowledge() {
  const file = path.join(process.cwd(), 'zaitgeist-v2', 'knowledge.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const stop = 'ich du er sie es wir ihr der die das ein eine einen und oder ist bin sind was wie wo wann muss brauche mit zu für fuer nach in von am im beim bitte hallo'.split(' ');
function tok(s = '') {
  return s.toLowerCase().replace(/[ä]/g, 'ae').replace(/[ö]/g, 'oe').replace(/[ü]/g, 'ue').replace(/[ß]/g, 'ss').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stop.includes(w));
}
function score(query, chunk) {
  const q = tok(query);
  const hay = tok([chunk.topic, chunk.title, chunk.department, chunk.text, (chunk.steps || []).join(' ')].join(' '));
  let n = 0;
  for (const term of q) {
    if (hay.includes(term)) n += 3;
    else if (hay.some(h => h.includes(term) || term.includes(h))) n += 1;
  }
  return n;
}
function retrieve(question, chunks) {
  const ranked = chunks.map(c => ({ ...c, score: score(question, c) })).sort((a, b) => b.score - a.score);
  return ranked[0]?.score ? ranked.slice(0, 3) : [];
}
function fallback() {
  return {
    mode: 'fallback',
    provider,
    model,
    citizen_answer: 'Ich bin mir nicht ganz sicher, welches Anliegen Sie meinen. Geht es um Ausweis, Ummeldung, Öffnungszeiten, Termin, Rückruf oder eine Mängelmeldung?',
    intent: 'unklar',
    department: 'Telefonzentrale / menschliche Übergabe',
    action: 'callback',
    confidence: 0.35,
    sources: [],
    next_steps: ['Rückfrage stellen', 'keine Antwort erfinden', 'Rückrufbitte anbieten'],
    receipt: 'Fallback: keine sichere Quelle gefunden. Human handoff empfohlen.',
    simulated: true
  };
}
function extractJson(text) {
  try { return JSON.parse(text); } catch {}
  const match = String(text).match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  return null;
}
async function callLlm(prompt) {
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: 'Return valid JSON only. No markdown.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' }
  });
  const raw = completion.choices?.[0]?.message?.content || '{}';
  return { raw, usage: completion.usage || null };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  if (!apiKey) return res.status(500).json({ error: 'OPENROUTER_API_KEY is not configured on the server.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const question = String(body.question || '').slice(0, 1200).trim();
    if (!question) return res.status(400).json({ error: 'Missing question.' });

    const kb = loadKnowledge();
    const hits = retrieve(question, kb.chunks || []);
    if (!hits.length) return res.status(200).json(fallback());

    const context = hits.map((h, i) => `[${i + 1}] ${h.id}\nTitle: ${h.title}\nDepartment: ${h.department}\nAction: ${h.action}\nSource: ${h.source}\nText: ${h.text}\nSteps: ${(h.steps || []).join(' | ')}`).join('\n\n');

    const prompt = `You are a careful German municipal service assistant prototype for the fictional city Beispielsburg. Answer only using the provided context. If the context is insufficient, ask a clarifying question and recommend human handoff. Return valid JSON only with these keys: mode, citizen_answer, intent, department, action, confidence, sources, next_steps, receipt, simulated.\n\nUser question: ${question}\n\nRetrieved context:\n${context}\n\nRules:\n- citizen_answer must be plain German, helpful for a normal citizen, no jargon.\n- sources must cite chunk ids and source names from context.\n- action must be one of appointment, ticket, callback, answer, eval, appointment_or_callback.\n- receipt must explain what would be logged for quality: intent, source coverage, routing, next action.\n- simulated is true for appointment, ticket and callback integrations.\n- Do not invent opening hours, documents, fees, laws or contacts beyond context.`;

    const { raw, usage } = await callLlm(prompt);
    let data = extractJson(raw);
    if (!data) data = { mode: 'llm_rag', citizen_answer: raw, intent: hits[0].topic, department: hits[0].department, action: hits[0].action, confidence: Math.min(0.9, 0.55 + hits[0].score / 20), sources: hits.map(h => ({ id: h.id, source: h.source, score: h.score })), next_steps: hits[0].steps || [], receipt: 'LLM output was not JSON. Fallback wrapper used.', simulated: true };

    data.mode = data.mode || 'llm_rag';
    data.provider = provider;
    data.model = model;
    data.usage = usage;
    data.sources = Array.isArray(data.sources) && data.sources.length ? data.sources : hits.map(h => ({ id: h.id, source: h.source, score: h.score }));
    data.retrieved = hits.map(h => ({ id: h.id, title: h.title, source: h.source, score: h.score, action: h.action, department: h.department }));
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'LLM RAG endpoint failed.', provider, model, detail: e.message });
  }
}
