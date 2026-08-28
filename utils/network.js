// ------------------------------------
// K - WORKSTATION
// ------------------------------------

const K_CONNECTION_KEY = 'okabe.k-workstation.connected';
const EVIDENCE_UNLOCK_STATE_KEY = 'okabe.evidence.unlocked';
const K_WORKSTATION_PASSWORD = 'okabe';
function connectKWorkstation(){
  if(localStorage.getItem(EVIDENCE_UNLOCK_STATE_KEY) !== 'true'){
    showMessageBox('K-WORKSTATION','Connection refused. It has been refused for a long time.','computer');
    return;
  }

  if(localStorage.getItem(K_CONNECTION_KEY) === 'true'){
    showMessageBox('K-WORKSTATION','K workstation connected','computer');
    return;
  }

  requestKWorkstationPassword();
}

function requestKWorkstationPassword(){
  const overlay = document.createElement('div');
  overlay.className = 'msgbox-overlay';

  const box = document.createElement('div');
  box.className = 'msgbox';
  box.style.left = '50%';
  box.style.top = '38%';
  box.style.transform = 'translate(-50%,-50%)';
  box.innerHTML = `
    <div class="titlebar">
      <div class="ttext">K-WORKSTATION Password</div>
      <div class="tbtn mb-close">×</div>
    </div>

    <form class="msgbox-body">
      <img src="${ICON_URLS['computer']}" width="32" height="32" alt="">
      <div class="txt">
        <div>Enter the password to connect:</div>
        <div class="password-field">
          <input class="k-password" type="password" maxlength="10" autocomplete="off" autofocus>
          <button class="password-toggle" type="button" aria-label="Show password" title="Show password">&#128065;</button>
        </div>
      </div>
    </form>

    <div class="k-password-error"></div>

    <div class="msgbox-buttons">
      <button class="btn95 mb-ok" type="submit">Connect</button>
      <button class="btn95 mb-cancel" type="button">Cancel</button>
    </div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const close = ()=>overlay.remove();
  const form = box.querySelector('form');
  const password = box.querySelector('.k-password');
  const error = box.querySelector('.k-password-error');
  const passwordToggle = box.querySelector('.password-toggle');

  box.querySelector('.mb-close').onclick = close;
  box.querySelector('.mb-cancel').onclick = close;
  box.querySelector('.mb-ok').onclick = ()=>form.requestSubmit();
  passwordToggle.onclick = ()=>{
    const showing = password.type === 'text';
    password.type = showing ? 'password' : 'text';
    passwordToggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    passwordToggle.title = showing ? 'Show password' : 'Hide password';
  };
  form.onsubmit = (event)=>{
    event.preventDefault();

    if(password.value !== K_WORKSTATION_PASSWORD){
      error.textContent = 'Incorrect password.';
      password.select();
      return;
    }

    localStorage.setItem(K_CONNECTION_KEY, 'true');
    close();
    showMessageBox('K-WORKSTATION','K workstation connected','computer');
  };

  password.focus();
}