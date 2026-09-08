import { DEFAULT_COHORT, analyzeCohort, filterRows } from './analysis.js';

const state = { device: 'All', provider: 'All' };
const fmt = new Intl.NumberFormat('de-DE');
const one = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const pct = (value) => `${one.format(value)} %`;

function renderFilters() {
  document.querySelectorAll('[data-filter-group]').forEach((group) => {
    const key = group.dataset.filterGroup;
    group.querySelectorAll('button').forEach((button) => {
      const selected = state[key] === button.dataset.value;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
      button.onclick = () => {
        state[key] = button.dataset.value;
        renderFilters();
        renderAnalysis();
      };
    });
  });
}

function funnelMarkup(analysis) {
  const max = analysis.funnel[0].count;
  return analysis.funnel.map((stage, index) => {
    const width = Math.max(18, (stage.count / max) * 100);
    const drop = index === 0 ? '' : `<span class="drop">−${fmt.format(stage.dropFromPrevious)} · ${pct(stage.dropRateFromPrevious)}</span>`;
    return `<div class="funnel-row">
      <div class="funnel-label"><strong>${stage.label}</strong><span>${fmt.format(stage.count)}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
      <div class="funnel-meta"><strong>${pct(stage.conversion)}</strong>${drop}</div>
    </div>`;
  }).join('');
}

function issueMarkup(analysis) {
  const max = Math.max(...analysis.issues.map((item) => item.count));
  return analysis.issues.slice(0, 5).map((issue, index) => `
    <div class="issue-row ${index === 0 ? 'top-issue' : ''}">
      <div><strong>${issue.label}</strong><span>${fmt.format(issue.count)} Fälle</span></div>
      <div class="mini-track"><div class="mini-fill" style="width:${(issue.count / max) * 100}%"></div></div>
      <b>${pct(issue.rate)}</b>
    </div>`).join('');
}

function segmentMarkup(analysis) {
  return analysis.timeoutSegments.slice(0, 6).map((segment, index) => `
    <div class="segment-row ${index === 0 ? 'top-segment' : ''}">
      <span>${segment.device}</span><strong>${segment.provider}</strong><b>${pct(segment.timeoutRate)}</b>
    </div>`).join('');
}

function renderAnalysis() {
  const rows = filterRows(DEFAULT_COHORT, state);
  const analysis = analyzeCohort(rows);
  const diagnosis = analysis.diagnosis;

  document.querySelector('#cohortLabel').textContent = `${fmt.format(rows.length)} synthetische Signups`;
  document.querySelector('#completionMetric').textContent = pct(analysis.completionRate);
  document.querySelector('#completionSub').textContent = `${fmt.format(analysis.opened)} Depot-Eröffnungen`;
  document.querySelector('#largestDropMetric').textContent = fmt.format(diagnosis.largestStageDrop.dropFromPrevious);
  document.querySelector('#largestDropSub').textContent = `${diagnosis.largestStageDrop.label} · größter Stage-Drop`;
  document.querySelector('#timeoutMetric').textContent = fmt.format(diagnosis.largestRecoverableIssue?.count ?? 0);
  document.querySelector('#timeoutSub').textContent = `${pct(diagnosis.largestRecoverableIssue?.rate ?? 0)} aller Starts`;

  document.querySelector('#funnel').innerHTML = funnelMarkup(analysis);
  document.querySelector('#issues').innerHTML = issueMarkup(analysis);
  document.querySelector('#segments').innerHTML = segmentMarkup(analysis);

  const high = diagnosis.highestTimeoutSegment;
  document.querySelector('#diagnosisSentence').innerHTML = high
    ? `Der größte vermeidbare Verlust liegt in der Identitätsprüfung. Besonders auffällig: <strong>${high.device} + ${high.provider}</strong> mit <strong>${pct(high.timeoutRate)}</strong> Timeout-Rate.`
    : 'Für diese Filterkombination liegt kein Identitäts-Timeout vor.';

  const opportunity = analysis.opportunity;
  document.querySelector('#upliftMetric').textContent = `+${one.format(opportunity.modeledUpliftPp)} pp`;
  document.querySelector('#upliftText').textContent = `${fmt.format(opportunity.modeledRecoveredAccounts)} zusätzliche Eröffnungen im Modell`;
  document.querySelector('#modelNote').textContent = 'Modellannahme: 55 % der Timeout-Fälle schaffen den Retry; danach gilt die beobachtete Downstream-Conversion des synthetischen Cohorts. Kein gemessener Business-Uplift.';
}

renderFilters();
renderAnalysis();
