// OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO

/* ============================================================
   FULLSCREEN ENFORCEMENT
   Fullscreen requests must originate from a user gesture. The boot
   Enter key and the penalty dialog OK button provide those gestures.
   ============================================================ */
(function initFullscreenEnforcement(){
  const root = document.documentElement;
  const supported = typeof root.requestFullscreen === 'function';
  const violationKey = 'okabe.fullscreen.violations';
  const penaltyKey = 'okabe.fullscreen.penaltyEndsAt';
  let fullscreenWasEntered = false;
  let penaltyOverlay = null;
  let penaltyTimer = null;
  let requestPending = false;

  function isFullscreen(){
    return document.fullscreenElement === root;
  }

  function formatRemaining(milliseconds){
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function setPenaltyClock(text){
    window.__fullscreenPenaltyDisplay = text;
    const clock = document.getElementById('clock');
    if(clock) clock.textContent = text;
  }

  function clearPenaltyClock(){
    window.__fullscreenPenaltyDisplay = '';
  }

  function requestFullscreen(){
    if(!supported || isFullscreen() || requestPending) return;

    requestPending = true;
    const request = root.requestFullscreen({navigationUI: 'hide'});

    if(request && typeof request.catch === 'function'){
      request.catch(()=>{}).finally(()=>{
        requestPending = false;
      });
    } else {
      requestPending = false;
    }
  }

  function removePenaltyOverlay(){
    if(penaltyTimer){
      clearInterval(penaltyTimer);
      penaltyTimer = null;
    }

    if(penaltyOverlay){
      penaltyOverlay.remove();
      penaltyOverlay = null;
    }

    clearPenaltyClock();
  }

  function showPenaltyComplete(violationNumber){
    if(!penaltyOverlay) return;

    const dialog = penaltyOverlay.querySelector('.fullscreen-dialog');
    const penaltyText = violationNumber === 1
      ? 'You exited fullscreen. The next violation will cause a 10 minute freeze.'
      : 'You exited fullscreen again. The next violation will cause another 10 minute freeze.';

    dialog.innerHTML = `
      <div class="titlebar">
        <div class="ttext">OKABE-OS Security Notice</div>
      </div>
      <div class="fullscreen-body">
        <div class="fullscreen-icon">!</div>
        <div>${penaltyText}</div>
      </div>
      <div class="fullscreen-actions">
        <button class="btn95 fullscreen-ok">OK</button>
      </div>
    `;

    dialog.querySelector('.fullscreen-ok').addEventListener('click', ()=>{
      removePenaltyOverlay();
      requestFullscreen();
    });
  }

  function showPenalty(violationNumber, endsAt){
    if(penaltyOverlay) return;

    penaltyOverlay = document.createElement('div');
    penaltyOverlay.id = 'fullscreen-penalty';
    penaltyOverlay.innerHTML = `
      <div class="fullscreen-dialog raised">
        <div class="titlebar">
          <div class="ttext">OKABE-OS Access Frozen</div>
        </div>
        <div class="fullscreen-body fullscreen-freeze-body">
          <div class="fullscreen-icon">!</div>
          <div>
            <div>Fullscreen violation detected.</div>
            <strong class="fullscreen-remaining"></strong>
          </div>
        </div>
        <div class="fullscreen-meter"><div></div></div>
      </div>
    `;

    document.body.appendChild(penaltyOverlay);

    const duration = Math.max(1, endsAt - Date.now());
    const remaining = penaltyOverlay.querySelector('.fullscreen-remaining');
    const meter = penaltyOverlay.querySelector('.fullscreen-meter div');

    function updatePenalty(){
      const millisecondsLeft = endsAt - Date.now();
      if(millisecondsLeft <= 0){
        setPenaltyClock('READY');
        showPenaltyComplete(violationNumber);
        clearInterval(penaltyTimer);
        penaltyTimer = null;
        sessionStorage.removeItem(penaltyKey);
        return;
      }

      remaining.textContent = `Access returns in ${formatRemaining(millisecondsLeft)}`;
      meter.style.width = `${Math.max(0, Math.min(100, (millisecondsLeft / duration) * 100))}%`;
      setPenaltyClock(`LOCK ${formatRemaining(millisecondsLeft)}`);
    }

    updatePenalty();
    penaltyTimer = setInterval(updatePenalty, 250);
  }

  function beginViolation(){
    if(penaltyOverlay) return;

    const violationNumber = Number(sessionStorage.getItem(violationKey) || 0) + 1;
    const duration = violationNumber === 1 ? 60 * 1000 : 10 * 60 * 1000;
    const endsAt = Date.now() + duration;

    sessionStorage.setItem(violationKey, String(violationNumber));
    sessionStorage.setItem(penaltyKey, String(endsAt));
    showPenalty(violationNumber, endsAt);
  }

  window.__requestOkabeFullscreen = requestFullscreen;

  document.addEventListener('fullscreenchange', ()=>{
    if(isFullscreen()){
      fullscreenWasEntered = true;
    } else if(fullscreenWasEntered){
      beginViolation();
    }
  });

  document.addEventListener('pointerdown', ()=>{
    if(!isFullscreen() && !penaltyOverlay) requestFullscreen();
  }, true);

  const storedPenaltyEnd = Number(sessionStorage.getItem(penaltyKey) || 0);
  if(storedPenaltyEnd > Date.now()){
    showPenalty(Number(sessionStorage.getItem(violationKey) || 1), storedPenaltyEnd);
  } else if(storedPenaltyEnd){
    sessionStorage.removeItem(penaltyKey);
  }
})();