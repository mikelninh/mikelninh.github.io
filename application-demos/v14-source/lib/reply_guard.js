// Conservative, auditable phrase-level checks – never a substitute for human review.
// Tests flag unsupported claims; no draft is automatically approved for sending.
const CHECKS=[
 {id:'unperformed_external_action',reason:'Entwurf behauptet, eine externe Aktion auszuführen.',pattern:/\b(?:ich|wir)\s+(?:schicke|senden|sende|verschicke|erstatte|erstatten|buchen|buche)\b/i},
 {id:'unverified_case_state',reason:'Entwurf behauptet einen nicht geprüften Vorgangsstatus.',pattern:/\b(?:dein|deine|ihr)\s+(?:widerruf|retoure|rückzahlung|erstattung|bestellung)\s+ist\s+(?:angekommen|bearbeitet|bestätigt|geprüft)\b/i},
 {id:'unverified_policy',reason:'Entwurf nennt interne Richtlinien ohne zugängliche Policy-Quelle.',pattern:/(?:rechnungen?.{0,45}nicht.{0,25}anpass|kundenkonto.{0,50}bestellungen|(?:garantiert|grundsätzlich|immer).{0,30}(?:erstattung|umtausch|widerruf))/i},
 {id:'unsupported_size_recommendation',reason:'Größenempfehlung ohne verifizierte Größentabelle.',pattern:/(?:könnte|dürfte|sollte).{0,45}(?:größe|grösse)\s*(?:XS|S|M|L|XL|XXL)\b/i},
 {id:'unsupported_care_advice',reason:'Unbestätigte Pflegeempfehlung statt neutraler Reklamationsprüfung.',pattern:/(?:erste\s+wäsche|nach\s+(?:dem\s+)?waschen.{0,30}(?:besser|hilft)|vielleicht\s+hilft.{0,25}wäsche)/i},
 {id:'unverified_resolution_promise',reason:'Entwurf verspricht einen noch nicht freigegebenen Prozess oder ein Ergebnis.',pattern:/wir\s+kümmern\s+uns\s+darum,?\s+dass.{0,75}(?:bekommst|geprüft\s+wird|erstattet\s+wird)/i}
];
export function assessDraft(draft){
 const text=typeof draft==='string'?draft:'';
 return {flags:CHECKS.filter(x=>x.pattern.test(text)).map(x=>({code:x.id,reason:x.reason})),human_approval_required:true,auto_send_allowed:false};
}
