(function () {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = id => document.getElementById(id);
  const fields = Array.from({length: 5}, (_, i) => $('answer-' + i));
  const headings = ['What I lose myself in', 'What I am learning', 'What I care about', 'The future I am making room for', 'Ask me about'];
  let edited = false;
  let undo = null;
  function compose() {
    return fields.map((field, i) => field.value.trim() ? headings[i] + '\n' + field.value.trim() : '').filter(Boolean).join('\n\n');
  }
  function buttons() {
    const empty = !$('intro-output').value.trim();
    $('copy-intro').disabled = empty;
    $('download-intro').disabled = empty;
  }
  fields.forEach(field => field.addEventListener('input', () => {
    if (!edited) $('intro-output').value = compose();
    else $('rebuild-details').hidden = false;
    buttons();
  }));
  $('intro-output').addEventListener('input', () => { edited = true; buttons(); });
  $('rebuild-draft').addEventListener('click', () => {
    $('intro-output').value = compose(); edited = false; $('rebuild-details').hidden = true;
    $('rebuild-details').open = false; buttons(); $('intro-output').focus(); $('gift-status').textContent = 'Introduction rebuilt from your current answers.';
  });
  $('clear-draft').addEventListener('click', () => {
    undo = {answers: fields.map(f => f.value), text: $('intro-output').value, edited};
    fields.forEach(f => { f.value = ''; }); $('intro-output').value = ''; edited = false;
    $('rebuild-details').hidden = true; $('undo-clear').hidden = false;
    $('fallback-text').value = ''; $('copy-fallback').hidden = true; $('copy-fallback').open = false;
    $('gift-status').textContent = 'Draft cleared. Undo is available until you leave this page.'; buttons();
  });
  $('undo-clear').addEventListener('click', () => {
    if (!undo) return;
    fields.forEach((f, i) => { f.value = undo.answers[i]; }); $('intro-output').value = undo.text;
    edited = undo.edited; undo = null; $('undo-clear').hidden = true; buttons(); $('intro-output').focus(); $('gift-status').textContent = 'Your draft has been restored.';
  });
  async function copy(text, status) {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text); status.textContent = 'Copied. Yours to keep.';
    } catch (_) {
      $('copy-fallback').hidden = false; $('copy-fallback').open = true;
      $('fallback-text').value = text;
      status.textContent = 'Clipboard access is unavailable. Use the selectable text in “Copy text manually” below the introduction.';
    }
  }
  $('copy-intro').addEventListener('click', () => copy($('intro-output').value, $('gift-status')));
  $('copy-prompt').addEventListener('click', () => copy($('gift-prompt').textContent.trim(), $('gift-status')));
  $('download-intro').addEventListener('click', () => {
    const text = $('intro-output').value; if (!text.trim()) return;
    const url = URL.createObjectURL(new Blob([text + '\n'], {type:'text/plain;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = 'My_Beyond_the_CV.txt';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('gift-status').textContent = 'Your text download has started.';
  });
  const questions = ['What are you happily a beginner at right now?', 'What could you talk about for twenty minutes without preparing?', 'Which meal makes you think of someone you love?', 'What kind of future are you quietly practising for?', 'Which story changed how you see other people?', 'What would you build just to make someone’s day better?', 'What do you collect — and what does it really mean to you?', 'What should technology give us more time for?'];
  let question = 0;
  $('next-question').addEventListener('click', () => {
    question = (question + 1) % questions.length; $('question-text').textContent = questions[question];
    $('question-count').textContent = String(question + 1).padStart(2, '0') + ' / 08'; $('question-status').textContent = '';
  });
  $('copy-question').addEventListener('click', () => copy(questions[question], $('question-status')));
  $('turn-artifact').addEventListener('click', () => {
    const back = $('artifact-back').hidden;
    $('artifact-back').hidden = !back; $('artifact-front').hidden = back;
    $('turn-artifact').setAttribute('aria-expanded', String(back));
    $('turn-artifact').textContent = back ? 'Back to the artwork ↶' : 'Read the concept ↗';
  });
  buttons();
}());
