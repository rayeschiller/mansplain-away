// Filming mode locks a selected cue; each tap restarts exactly the same recording.
if (new URLSearchParams(location.search).get('demo') === '1') {
  const params = new URLSearchParams(location.search);
  const cue = window.FILMING_CUES.find(c => c.id === params.get('cue')) || window.FILMING_CUES[0];
  const style = document.createElement('style');
  style.textContent = `.theme-switcher,.counter-row,.escalation-hint,.tip-btn,.mode-toggle,.stealth-toggle{display:none!important} *,*::before,*::after{animation:none!important;transition:none!important} .main-btn:hover,.main-btn:active{transform:none!important;top:0!important;left:0!important;box-shadow:var(--btn-shadow)!important} .card{visibility:hidden!important;opacity:0!important;transform:none!important}`;
  document.head.append(style);
  setTheme(params.get('theme') || 'dark');
  output.textContent = '';
  card.classList.remove('show');
  btn.setAttribute('aria-label', 'Replay selected filming cue');
  const clip = window.FILMING_AUDIO[cue.id];
  const recording = new Audio(clip);
  recording.preload = 'auto';
  handlePress = function () {
    // Filming cues play audio only; the response card stays hidden.
    recording.pause();
    recording.currentTime = 0;
    recording.play().catch(() => alert('Audio could not play. Check your connection and tap again.'));
  };
  stealthPress = function () { exitStealth(); handlePress(); };
  if (cue.stealth && params.get('stealth') !== '0') enterStealth();
}
