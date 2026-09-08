export const COHORT_SIZE = 10000;
export const SEED = 20260908;

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateCohort(size = COHORT_SIZE, seed = SEED) {
  const random = mulberry32(seed);
  const rows = [];

  for (let i = 0; i < size; i += 1) {
    const device = random() < 0.68 ? 'Mobile' : 'Desktop';
    const providerRoll = random();
    const provider = providerRoll < 0.45 ? 'NovaID' : providerRoll < 0.80 ? 'VerifyNow' : 'IDentix';
    const applicationId = `S-${String(i + 1).padStart(5, '0')}`;

    const detailsCompletion = device === 'Mobile' ? 0.91 : 0.955;
    if (random() > detailsCompletion) {
      rows.push({ applicationId, device, provider, stage: 'details', issue: 'details_incomplete' });
      continue;
    }

    const timeoutRate = {
      'Mobile|NovaID': 0.075,
      'Desktop|NovaID': 0.035,
      'Mobile|VerifyNow': 0.165,
      'Desktop|VerifyNow': 0.065,
      'Mobile|IDentix': 0.095,
      'Desktop|IDentix': 0.04,
    }[`${device}|${provider}`];
    const mismatchRate = 0.022;
    const unsupportedRate = 0.012;
    const abandonRate = device === 'Mobile' ? 0.035 : 0.02;
    const identityRoll = random();

    if (identityRoll < timeoutRate) {
      rows.push({ applicationId, device, provider, stage: 'identity', issue: 'provider_timeout' });
      continue;
    }
    if (identityRoll < timeoutRate + mismatchRate) {
      rows.push({ applicationId, device, provider, stage: 'identity', issue: 'identity_mismatch' });
      continue;
    }
    if (identityRoll < timeoutRate + mismatchRate + unsupportedRate) {
      rows.push({ applicationId, device, provider, stage: 'identity', issue: 'unsupported_document' });
      continue;
    }
    if (identityRoll < timeoutRate + mismatchRate + unsupportedRate + abandonRate) {
      rows.push({ applicationId, device, provider, stage: 'identity', issue: 'user_abandon' });
      continue;
    }

    const kycRoll = random();
    if (kycRoll < 0.024) {
      rows.push({ applicationId, device, provider, stage: 'kyc', issue: 'manual_review' });
      continue;
    }
    if (kycRoll < 0.037) {
      rows.push({ applicationId, device, provider, stage: 'kyc', issue: 'kyc_failed' });
      continue;
    }

    if (random() > 0.97) {
      rows.push({ applicationId, device, provider, stage: 'account', issue: 'technical_open_failure' });
      continue;
    }

    rows.push({ applicationId, device, provider, stage: 'opened', issue: null });
  }

  return rows;
}

function pct(value, denominator) {
  return denominator ? (value / denominator) * 100 : 0;
}

export function analyzeCohort(rows) {
  const started = rows.length;
  const stoppedAt = (stage) => rows.filter((row) => row.stage === stage).length;
  const detailsComplete = started - stoppedAt('details');
  const identityVerified = detailsComplete - stoppedAt('identity');
  const kycCleared = identityVerified - stoppedAt('kyc');
  const opened = stoppedAt('opened');

  const funnel = [
    { key: 'started', label: 'Signup gestartet', count: started },
    { key: 'details', label: 'Angaben vollständig', count: detailsComplete },
    { key: 'identity', label: 'Identität bestätigt', count: identityVerified },
    { key: 'kyc', label: 'Prüfung abgeschlossen', count: kycCleared },
    { key: 'opened', label: 'Depot eröffnet', count: opened },
  ].map((stage, index, list) => ({
    ...stage,
    conversion: pct(stage.count, started),
    dropFromPrevious: index === 0 ? 0 : list[index - 1].count - stage.count,
    dropRateFromPrevious: index === 0 ? 0 : pct(list[index - 1].count - stage.count, list[index - 1].count),
  }));

  const issueOrder = [
    'provider_timeout',
    'details_incomplete',
    'user_abandon',
    'technical_open_failure',
    'identity_mismatch',
    'manual_review',
    'unsupported_document',
    'kyc_failed',
  ];
  const issueLabels = {
    provider_timeout: 'Identitätsprovider: Timeout',
    details_incomplete: 'Angaben unvollständig',
    user_abandon: 'Abbruch bei Identitätsprüfung',
    technical_open_failure: 'Technischer Fehler bei Eröffnung',
    identity_mismatch: 'Identitätsdaten stimmen nicht überein',
    manual_review: 'Manuelle Prüfung erforderlich',
    unsupported_document: 'Dokument nicht unterstützt',
    kyc_failed: 'Prüfung nicht bestanden',
  };

  const issues = issueOrder.map((key) => {
    const count = rows.filter((row) => row.issue === key).length;
    return { key, label: issueLabels[key], count, rate: pct(count, started) };
  }).filter((item) => item.count > 0);

  const reachedIdentity = rows.filter((row) => row.stage !== 'details');
  const segmentMap = new Map();
  for (const row of reachedIdentity) {
    const key = `${row.device}|${row.provider}`;
    if (!segmentMap.has(key)) segmentMap.set(key, { device: row.device, provider: row.provider, reached: 0, timeouts: 0 });
    const segment = segmentMap.get(key);
    segment.reached += 1;
    if (row.issue === 'provider_timeout') segment.timeouts += 1;
  }
  const timeoutSegments = [...segmentMap.values()]
    .map((segment) => ({ ...segment, timeoutRate: pct(segment.timeouts, segment.reached) }))
    .sort((a, b) => b.timeoutRate - a.timeoutRate);

  const timeoutCount = issues.find((item) => item.key === 'provider_timeout')?.count ?? 0;
  const downstreamSuccess = identityVerified ? opened / identityVerified : 0;
  const assumedRetrySuccess = 0.55;
  const modeledRecoveredAccounts = Math.round(timeoutCount * assumedRetrySuccess * downstreamSuccess);
  const modeledCompletion = pct(opened + modeledRecoveredAccounts, started);

  return {
    started,
    opened,
    completionRate: pct(opened, started),
    funnel,
    issues,
    timeoutSegments,
    diagnosis: {
      largestStageDrop: funnel.slice(1).sort((a, b) => b.dropFromPrevious - a.dropFromPrevious)[0],
      largestRecoverableIssue: issues.find((item) => item.key === 'provider_timeout'),
      highestTimeoutSegment: timeoutSegments[0],
    },
    opportunity: {
      assumedRetrySuccess,
      downstreamSuccess,
      modeledRecoveredAccounts,
      modeledCompletion,
      modeledUpliftPp: modeledCompletion - pct(opened, started),
    },
  };
}

export function filterRows(rows, { device = 'All', provider = 'All' } = {}) {
  return rows.filter((row) => (device === 'All' || row.device === device) && (provider === 'All' || row.provider === provider));
}

export const DEFAULT_COHORT = generateCohort();
export const DEFAULT_ANALYSIS = analyzeCohort(DEFAULT_COHORT);
