export function runBirthJourney(input) {
  const evidence = input.evidence || {};
  const conflicts = input.conflicts || [];
  const requestedActions = input.requestedActions || ['health-insurance','kindergeld','elterngeld','maternity-benefits'];
  const audit = [];

  const add = (type, detail) => audit.push({ type, detail });
  add('event.received', `birth:${input.birthEventId || 'reference'}`);

  if (!evidence.birthRecord) {
    add('gate.missing_evidence', 'birthRecord');
    return result('review-required', ['birthRecord'], [], audit, 0, false, 'Authoritative birth evidence is missing.');
  }

  if (conflicts.length) {
    conflicts.forEach(c => add('gate.conflict', c));
    return result('review-required', unique(conflicts.map(c => c.field || c)), [], audit, 0, false, 'Conflicting authoritative evidence must be resolved before consequential action.');
  }

  const missing = [];
  if (!evidence.parentIdentity) missing.push('parentIdentity');
  if (!evidence.residency) missing.push('residency');
  if (input.custodyRequired && !evidence.custody) missing.push('custody');
  if (input.incomeRequired && !evidence.income) missing.push('income');

  if (missing.length) {
    missing.forEach(m => add('question.minimum_necessary', m));
    return result('needs-citizen-input', missing, [], audit, 1, false, 'Only genuinely missing evidence is requested.');
  }

  if (input.authority && input.authority.consequentialAction === true && input.authority.approved !== true) {
    add('gate.human_authority', input.authority.action || 'consequential-action');
    return result('human-approval-required', [], [], audit, 0, false, 'Consequential action is blocked until required approval exists.');
  }

  const planned = requestedActions.map(action => ({
    action,
    evidence: ['birthRecord','parentIdentity','residency'].filter(k => evidence[k]),
    authority: input.authority?.basis || 'reference-policy',
    status: 'prepared'
  }));
  planned.forEach(p => add('action.prepared', p.action));
  add('citizen.plan_confirmation', 'single-standard-case-interaction');
  add('proof.no_certificate_transport', 'birth evidence referenced from authoritative source');

  return result('ready-for-confirmation', [], planned, audit, 1, true, 'One service plan is prepared from authoritative evidence.');
}

function result(status, questions, plannedActions, audit, citizenInteractions, noCertificateTransport, explanation) {
  return {
    status,
    questions,
    plannedActions,
    audit,
    citizenInteractions,
    citizenCarriedBirthCertificates: noCertificateTransport ? 0 : null,
    explanation
  };
}

function unique(values) { return [...new Set(values)]; }

export function evaluateGoldenCase(test) {
  const actual = runBirthJourney(test.input);
  const checks = (test.assert || []).map(assertion => {
    let pass = false;
    if (assertion.path === 'status') pass = actual.status === assertion.equals;
    if (assertion.path === 'citizenInteractions') pass = actual.citizenInteractions === assertion.equals;
    if (assertion.path === 'citizenCarriedBirthCertificates') pass = actual.citizenCarriedBirthCertificates === assertion.equals;
    if (assertion.path === 'questions') pass = JSON.stringify(actual.questions) === JSON.stringify(assertion.equals);
    if (assertion.path === 'plannedActions.length') pass = actual.plannedActions.length === assertion.equals;
    if (assertion.path === 'audit.includes') pass = actual.audit.some(a => a.type === assertion.equals);
    return { ...assertion, pass };
  });
  return { id: test.id, name: test.name, pass: checks.every(c => c.pass), checks, actual };
}