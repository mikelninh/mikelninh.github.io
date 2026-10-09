/* OUT OF PANEL 0.6 — discovery, private feedback, inviting friends. */
(() => {
  'use strict';
  const ROOT = 'https://mikelninh.github.io/beyond-cv/out-of-panel/';
  const API = 'https://htffcvdopavknnylbowl.supabase.co/functions/v1/out-of-panel-v06';
  // Preserve the 0.5 fully-offline share/email flows; QA may opt into the public UI.
  if (location.hostname !== 'mikelninh.github.io' && !new URLSearchParams(location.search).has('v06test')) return;
  const $ = (s, root = document) => root.querySelector(s);
  const safe = s => String(s ?? '').slice(0, 800);
  const state = { feedbackOpen: false, shareOpen: false, feeling: '', submitting: false };
  const metricsSeen = new Set();
  let activeModal = null;
  const copyText = async text => {
    if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
  };
  function createDialog(id, html) {
    const d = document.createElement('dialog');
    d.id = id;
    d.className = 'oop06-dialog';
    d.innerHTML = html;
    d.addEventListener('click', e => {
      if (e.target === d) d.close();
    });
    d.addEventListener('close', () => { activeModal = null; });
    document.body.append(d);
    return d;
  }
  const feedbackDialog = createDialog('oop06-feedback',
    `<div class="oop06-content"><div class="oop06-top"><span class="oop06-eyebrow">A SMALL NOTE / 0.6</span><button class="oop06-close" type="button" aria-label="Close feedback">×</button></div>
    <h2>How did it <em>feel?</em></h2>
    <p class="oop06-lead">A couple of taps are enough. Your response helps shape the next chapter.</p>
    <form id="oop06-form">
      <fieldset><legend>What was your first reaction? <span aria-hidden="true">*</span></legend>
      <div class="oop06-reactions">
        <label><input type="radio" name="feeling" value="Loved it" required><span>✦ Loved it</span></label>
        <label><input type="radio" name="feeling" value="Curious"><span>◌ Curious</span></label>
        <label><input type="radio" name="feeling" value="Needs work"><span>↗ Needs work</span></label>
      </div></fieldset>
      <label class="oop06-label" for="oop06-moment">What caught your attention?</label>
      <select name="moment" id="oop06-moment"><option value="">Choose a moment (optional)</option><option value="coin">Turning the coin</option><option value="rooftop">Entering the rooftop</option><option value="mia">Meeting Mia</option><option value="game">Playing the game</option><option value="comic">Reading the comic</option><option value="other">Something else</option></select>
      <label class="oop06-label" for="oop06-note">One thought for the creator <span>(optional)</span></label>
      <textarea id="oop06-note" name="note" maxlength="700" rows="3" placeholder="What made you smile—or what broke the spell?"></textarea>
      <label class="oop06-honeypot" aria-hidden="true">Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
      <div id="oop06-form-status" class="oop06-status" role="status" aria-live="polite"></div>
      <button id="oop06-send" type="submit" class="oop06-primary">Send feedback ↗</button>
      <p class="oop06-privacy">No account or email required. Your response is stored privately, not published. A short-lived daily pseudonymous anti-spam token is kept for at most two days. No advertising trackers. <a href="#oop06-privacy-note">Privacy details</a>.</p>
    </form>
    <div class="oop06-success" hidden><div class="oop06-star">✧</div><h3>Thank you for looking closer.</h3><p>Your note has been saved. It will help shape the next release.</p><button type="button" class="oop06-primary" data-oop06-close>Back to the world ↗</button></div>
    <div class="oop06-fallback" hidden><p>Couldn't save this time. Your words are still here.</p><button type="button" id="oop06-copy-feedback">Copy your feedback</button><a id="oop06-email-feedback" href="mailto:mikel_ninh@yahoo.de?subject=OUT%20OF%20PANEL%20feedback">Open email draft ↗</a></div>
    </div>`);
  const shareDialog = createDialog('oop06-share',
    `<div class="oop06-content oop06-invitation"><div class="oop06-top"><span class="oop06-eyebrow">PASS A LITTLE MAGIC ON</span><button class="oop06-close" type="button" aria-label="Close invitation">×</button></div>
    <div class="oop06-gift"><div class="oop06-gift-moon">☾</div><div class="oop06-gift-cat" aria-hidden="true">🐈‍⬛</div><span>HYPERSPACE / OUT OF PANEL</span><h2>Something is waiting for you <em>on the inside.</em></h2><p>A strange little coin. A rooftop. A very curious cat.</p></div>
    <p class="oop06-lead">Send an invitation straight to the coin. No account, no purchase—just a small surprise.</p>
    <div class="oop06-share-actions"><button id="oop06-copy-invite" class="oop06-primary" type="button">Copy invitation ↗</button><button id="oop06-native-share" type="button">Share with a friend</button></div>
    <label class="oop06-label" for="oop06-link">Invitation link</label>
    <input id="oop06-link" readonly aria-label="Shareable invitation URL">
    <p id="oop06-share-status" class="oop06-status" role="status" aria-live="polite"></p>
    <p class="oop06-privacy">This passes a link to a playful moment, not ownership of a digital asset.</p></div>`);
  function show(d) {
    if (activeModal?.open) activeModal.close();
    const existing = $('#dialog');
    if (existing?.open) existing.close();
    if (d.showModal) d.showModal(); else d.setAttribute('open','');
    activeModal = d;
  }
  function openFeedback() {
    feedbackDialog.querySelector('.oop06-success').hidden = true;
    feedbackDialog.querySelector('#oop06-form').hidden = false;
    feedbackDialog.querySelector('.oop06-fallback').hidden = true;
    $('#oop06-form-status').textContent = '';
    show(feedbackDialog);
  }
  function invitationURL() {
    return ROOT + '?gift=window#object';
  }
  function openShare() {
    const url = invitationURL();
    $('#oop06-link').value = url;
    $('#oop06-share-status').textContent = '';
    $('#oop06-native-share').hidden = !navigator.share;
    show(shareDialog);
  }
  document.querySelectorAll('#feedback-open,#share,#share-footer').forEach(b => {
    b.onclick = b.id === 'feedback-open' ? openFeedback : openShare;
  });
  document.addEventListener('click', e => {
    const physical = e.target.closest?.('#physical-feedback');
    if (physical) { e.preventDefault(); e.stopImmediatePropagation(); openFeedback(); }
  }, true);
  document.querySelectorAll('.oop06-dialog').forEach(d => d.querySelectorAll('.oop06-close,[data-oop06-close]').forEach(b => b.onclick = () => d.close()));
  const feedbackForm = $('#oop06-form');
  feedbackForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (state.submitting || !feedbackForm.reportValidity()) return;
    const fd = new FormData(feedbackForm);
    const payload = {kind:'feedback',feeling:fd.get('feeling'),moment:fd.get('moment'),note:safe(fd.get('note')).trim(),website:safe(fd.get('website'))};
    const status = $('#oop06-form-status'), button = $('#oop06-send');
    state.submitting = true; button.disabled = true; button.textContent = 'Sending…'; status.textContent = 'Saving your feedback…';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);
      let res;
      try { res = await fetch(API, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal,cache:'no-store'}); }
      finally {clearTimeout(timeout);}
      const answer = await res.json().catch(() => ({}));
      if (!res.ok || answer.saved !== true) throw new Error(answer.error || 'Save did not complete');
      feedbackForm.hidden = true;
      feedbackDialog.querySelector('.oop06-fallback').hidden = true;
      feedbackDialog.querySelector('.oop06-success').hidden = false;
      status.textContent = '';
      feedbackForm.reset();
    } catch (error) {
      status.textContent = 'Not saved: ' + (error?.name === 'AbortError' ? 'connection timed out.' : String(error?.message || 'Connection unavailable.'));
      feedbackDialog.querySelector('.oop06-fallback').hidden = false;
      const message = 'OUT OF PANEL / Feedback\\nReaction: '+payload.feeling+'\\nMoment: '+(payload.moment || 'Not selected')+'\\n\\n'+payload.note;
      $('#oop06-copy-feedback').onclick = async () => {
        try {await copyText(message);status.textContent = 'Copied. You can send it to Michael.';}catch{status.textContent='Copy manually from the fields above.';}
      };
      $('#oop06-email-feedback').href='mailto:mikel_ninh@yahoo.de?subject='+encodeURIComponent('OUT OF PANEL 0.6 feedback')+'&body='+encodeURIComponent(message);
    } finally { state.submitting = false; button.disabled = false; button.textContent = 'Send feedback ↗';}
  });
  function privacyOff(){return navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true || navigator.msDoNotTrack === '1';}
  function metric(event){
    if (privacyOff() || metricsSeen.has(event) || !/^https:$/.test(location.protocol) || location.hostname !== 'mikelninh.github.io') return;
    metricsSeen.add(event);
    try { if(sessionStorage.getItem('oop06-count-'+event)==='1') return; sessionStorage.setItem('oop06-count-'+event,'1'); } catch {}
    // Anonymous aggregate count only; no visitor ID, cookie, fingerprint, or user profile.
    fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'event',event}),keepalive:true,cache:'no-store'}).catch(()=>{});
  }
  $('#oop06-copy-invite').onclick = async () => {
    const message = 'I found a tiny world hidden inside a coin. The cat might be expecting you. 🐈‍⬛\\n' + invitationURL();
    const st=$('#oop06-share-status');
    try {await copyText(message);st.textContent='Invitation copied. Pass the magic on.';metric('invite_copy');}
    catch {$('#oop06-link').focus();$('#oop06-link').select();st.textContent='Select and copy the link above.';}
  };
  $('#oop06-native-share').onclick = async () => {
    if(!navigator.share)return;
    try {await navigator.share({title:'OUT OF PANEL — a small impossible world',text:'I found a world hiding inside a coin. Come meet the cat.',url:invitationURL()});$('#oop06-share-status').textContent='Invitation shared.';metric('invite_copy');}
    catch(e){if(e.name!=='AbortError')$('#oop06-share-status').textContent='Sharing unavailable. Try copying the invitation instead.';}
  };
  const privacy = document.createElement('details');
  privacy.id='oop06-privacy-note';privacy.className='oop06-privacy-details';
  privacy.innerHTML='<summary>Privacy & feedback</summary><p>The game and reading position remain on your device. If you choose to send feedback, we store only the reaction, optional moment and words, in a private database accessible to the creator. We do not request your identity or email. To limit automated spam, the server temporarily stores a daily HMAC-derived pseudonym of the requesting network address; it is deleted within two days. Some interactions are counted in daily anonymous totals, without a visitor identifier or raw network address retained by our application. We honour Do Not Track / Global Privacy Control signals. Hosting and infrastructure providers may separately process technical request data. Contact: <a href="mailto:mikel_ninh@yahoo.de">mikel_ninh@yahoo.de</a> to request deletion of a feedback entry (include the words you sent).</p>';
  const f=$('.footer'); if(f) f.after(privacy);
  const nudge=document.createElement('p');
  nudge.className='oop06-nudge';nudge.setAttribute('aria-hidden','true');nudge.textContent='↔ Drag the coin · Tap Look inside';
  const obj=$('#object-scene');
  if(obj) obj.append(nudge);
  const dismissNudge=()=>document.body.classList.add('oop06-explored');
  $('#coin')?.addEventListener('pointerdown',dismissNudge,{once:true});
  $('#look-inside')?.addEventListener('click',()=>{
    dismissNudge();
    // The transition is tracked only once the existing scene enters.
    setTimeout(()=>{if(window.OutOfPanelJourney?.getState()?.entered)metric('portal_enter');},350);
  });
  $('#give-back')?.addEventListener('click',()=>metric('story_return'));
  // Actual view state is checked on the next frame instead of counting the click in advance.
  document.addEventListener('click',e=>{
    const t=e.target.closest?.('[data-view]');
    if(!t||!['play','read'].includes(t.dataset.view))return;
    requestAnimationFrame(()=>{if(document.body.dataset.view===t.dataset.view)metric(t.dataset.view==='play'?'game_start':'read_start');});
  },true);
  $('#first-move')?.addEventListener('click',()=>requestAnimationFrame(()=>{if(document.body.dataset.view==='play')metric('game_start');}));
  const previousSessionVisit = (()=>{try{const k='oop06-seen-session';let had=sessionStorage.getItem(k)==='1';sessionStorage.setItem(k,'1');return had}catch{return false}})();
  if (!previousSessionVisit && location.search.includes('gift=window')) document.body.classList.add('oop06-invited');
  window.OutOfPanel06 = Object.freeze({version:'0.6.0',invitationURL,openFeedback,openShare});
})();
