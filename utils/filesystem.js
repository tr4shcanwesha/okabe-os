/* ============================================================
   CONTENT: FILE SYSTEM FOR RINTARO OKABE
   ============================================================ */
/* ============================================================
  BRIEFCASE / DOCUMENT FILES
  ============================================================ */
const DOCS = {
  lab: [
    {
      name: 'lab_notes.txt',
      body:
`ENTRY #217 — OKABE LABORATORY, SUB-BASEMENT

The barometric sensor spiked at 3:14 AM again. Three
nights in a row now, always 3:14. Working theory #1: a
genuine fluctuation in ambient causality. Working theory
#2: the mini-fridge compressor is dying.

Ran the numbers. It's probably the fridge. It is
never NOT the fridge. And yet I wrote "causality" first,
which tells you everything about how this lab is run.

Cat (see: Fourier) sat on the keyboard for eleven
minutes and contributed absolutely nothing to the data,
which is still a better hit rate than my last three
grant proposals.

— R.O.`
    },

    {
      name: 'experiment_log_042.txt',
      body:
`EXPERIMENT 042: "Can a Toaster Remember?"

Hypothesis: Repeated exposure to identical toast
settings creates a measurable preference in the
nichrome coil.

Method: Toasted 40 slices of bread at setting 4.
Then switched to setting 2 and monitored coil
"reluctance."

Result: Inconclusive. Toast was, however, excellent.

Conclusion: I have accidentally made breakfast into
a controlled study for the ninth time this month. The
Board will not fund this. I will not be telling the
Board about this.`
    },

    {
      name: 'grant_proposal_REJECTED.doc',
      body:
`RE: Application for Continued Funding — Okabe Laboratory

Summary of prior year's findings: three patents,
one minor electrical fire, and a working prototype
of a device that reliably predicts nothing.

Committee response (attached separately) used the
phrase "concerning" four times. This is, if anything,
an improvement over last year's "alarming," used six
times.

Request: More funding. Less supervision. A new
mini-fridge.`
    },
  ],

  personal: [
    {
      name: 'diary_do_not_read.txt',
      body:
`If you are reading this and you are not me, please
stop. If you are reading this and you ARE me, then I
have once again forgotten my own filing system, and
frankly that is the more concerning outcome.

K called again today. Didn't pick up. We only ever
talk about the old project, and I am tired of being
asked questions I answered years ago, in a lab that
doesn't exist anymore, about a version of me who
believed all of this would work out cleanly.

Fed the cat. Fourier remains unimpressed by
everything, which I respect enormously.`
    },

    {
      name: 'resignation_letter_draft_v9.doc',
      body:
`To the Board of Directors,

After lengthy and careful consideration, I am writing
to inform you that I —

[NOTE TO SELF: this is draft nine. I keep stopping at
the same sentence. It is not the severance. It is not
even the work. I think I am just bad at endings.]

— NOT SENT —`
    },

    {
      name: 'shopping_list.txt',
      body:
`- solder (the good kind, not the good-for-you kind)
- coffee, black, structural
- cat food (Fourier prefers the tuna; Fourier is
  wrong about most things but not about this)
- 9V batteries, many
- one (1) new fridge, quietly, before it becomes
  a load-bearing part of the experiment log`
    },

  ]
};

/* ============================================================
  IMAGE VIEWER FILES
  ============================================================ */
const imageFileTypes = ['image/png', 'image/jpeg'];

const IMAGE_FILES = [
  {
    name: 'IMG_19980821_031427.jpeg (LOCKED)',
    type: 'image',
    mimeType: 'image/jpeg',
    src: 'images/IMG_19980821_031427.jpeg'
  }
];

const EVIDENCE_UNLOCK_KEY = 'okabe.evidence.unlocked';
const IMG_PASSWORD = 'SPLIT314';

if(localStorage.getItem(EVIDENCE_UNLOCK_KEY) === 'true'){
  IMAGE_FILES[0].name = 'IMG_19980821_031427.jpeg (UNLOCKED)';
}

function isImageFile(file){
  return file.type === 'image' || imageFileTypes.includes(file.mimeType);
}

function fileIcon(file){
  return isImageFile(file) ? (file.mimeType === 'image/png' ? ICON_URLS['cat'] : ICON_URLS['doc']) : ICON_URLS['doc'];
}

function isEvidenceFile(file){
  return file.src === 'images/IMG_19980821_031427.jpeg';
}

function docListWindow(winId, title, iconKey, docs, statusText){
  const rows = docs.map((d,i)=>
    `<div class="file-row" ondblclick="openFile('${winId}',${i})">
      <img class="fico" src="${fileIcon(d)}" alt="">
      <span>${d.name}</span>
    </div>`
  ).join('');

  openWindow(winId, {
    title,
    icon: iconKey,
    width: 340,
    height: 280,
    menu: ['File','Edit','View','Help'],
    status: statusText || (docs.length + ' object(s)'),
    bodyHTML: `<div id="${winId}-list">${rows}</div>`
  });

  window['__docs_' + winId] = docs;
}

function openFile(winId, idx){
  const file = window['__docs_' + winId][idx];
  if(isEvidenceFile(file) && localStorage.getItem(EVIDENCE_UNLOCK_KEY) !== 'true'){
    requestEvidencePassword(winId, file);
  } else if(isImageFile(file)) openImage(winId, file);
  else openDoc(winId, idx);
}

function requestEvidencePassword(winId, file){
  const overlay = document.createElement('div');
  overlay.className = 'msgbox-overlay';

  const box = document.createElement('div');
  box.className = 'msgbox';
  box.style.left = '50%';
  box.style.top = '38%';
  box.style.transform = 'translate(-50%,-50%)';
  box.innerHTML = `
    <div class="titlebar">
      <div class="ttext">Password Required</div>
      <div class="tbtn mb-close">×</div>
    </div>

    <form class="msgbox-body">
      <img src="${ICON_URLS['cat']}" width="32" height="32" alt="">
      <div class="txt">
        <div>Enter the password to open:</div>
        <div class="password-field">
          <input class="evidence-password" type="password" maxlength="10" autocomplete="off" autofocus>
          <button class="password-toggle" type="button" aria-label="Show password" title="Show password">&#128065;</button>
        </div>
      </div>
    </form>

    <div class="evidence-error"></div>

    <div class="msgbox-buttons">
      <button class="btn95 mb-ok" type="submit">Open</button>
      <button class="btn95 mb-cancel" type="button">Cancel</button>
    </div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const close = ()=>overlay.remove();
  const form = box.querySelector('form');
  const password = box.querySelector('.evidence-password');
  const error = box.querySelector('.evidence-error');
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

    if(password.value !== IMG_PASSWORD){
      error.textContent = 'Incorrect password.';
      password.select();
      return;
    }

    localStorage.setItem(EVIDENCE_UNLOCK_KEY, 'true');
    file.name = 'IMG_19980821_031427.jpeg (UNLOCKED)';
    close();
    openImage(winId, file);
  };

  password.focus();
}

function openDoc(winId, idx){
  const doc = window['__docs_' + winId][idx];

  const listEl = document.getElementById(winId + '-list');

  if(listEl){
    listEl.style.display = 'none';
  }

  const w = openWindows[winId].el;

  let viewer = w.querySelector('.doc-view');

  if(!viewer){
    viewer = document.createElement('div');
    viewer.className = 'doc-view';
    w.querySelector('.win-body').appendChild(viewer);
  }

  viewer.style.display = 'block';

  viewer.innerHTML = `
    <button class="btn95 backbtn" onclick="closeDoc('${winId}')">
      &laquo; Back
    </button>

    <h3>${doc.name}</h3>
    <pre>${doc.body}</pre>
  `;
}

/* ============================================================
  IMAGE VIEWER
  ============================================================ */
function openImage(winId, image){
  const w = openWindows[winId].el;
  const listEl = document.getElementById(winId + '-list');
  if(listEl) listEl.style.display = 'none';

  let viewer = w.querySelector('.image-view');
  if(!viewer){
    viewer = document.createElement('div');
    viewer.className = 'image-view';
    w.querySelector('.win-body').appendChild(viewer);
  }

  viewer.style.display = 'flex';
  viewer.innerHTML = `
    <div class="image-toolbar">
      <button class="btn95" type="button" onclick="closeImage('${winId}')">&laquo; Back</button>
      <button class="btn95 image-lamp-source" type="button" aria-label="Toggle lamp" title="Toggle lamp" onclick="toggleImageLamp('${winId}')"><span aria-hidden="true">💡</span></button>
      <span class="image-name">${image.name}</span>
    </div>
    <div class="image-canvas sunken ${isEvidenceFile(image) ? 'evidence-canvas' : ''}">
      <img class="image-preview" src="${image.src}" alt="${image.name}">
      <div class="image-darkness" aria-hidden="true"></div>
      <div class="image-lamps"></div>
    </div>
  `;

  const canvas = viewer.querySelector('.image-canvas');
}

function toggleImageLamp(winId){
  const viewer = openWindows[winId]?.el.querySelector('.image-view');
  if(!viewer) return;

  const canvas = viewer.querySelector('.image-canvas');
  const preview = viewer.querySelector('.image-preview');
  const lampLayer = viewer.querySelector('.image-lamps');
  const source = viewer.querySelector('.image-lamp-source');
  const darkness = viewer.querySelector('.image-darkness');
  if(lampLayer.firstElementChild){
    if(viewer.__lampMessageTimer) clearTimeout(viewer.__lampMessageTimer);
    lampLayer.replaceChildren();
    source.classList.remove('is-lit');
    darkness.classList.remove('is-lit');
    return;
  }

  const lamp = document.createElement('div');
  lamp.className = 'image-lamp';
  lamp.innerHTML = '<span aria-hidden="true">💡</span>';
  lampLayer.appendChild(lamp);
  source.classList.add('is-lit');
  darkness.classList.add('is-lit');

  const centerLampOnImage = ()=>{
    const canvasBounds = canvas.getBoundingClientRect();
    const imageBounds = preview.getBoundingClientRect();
    lamp.style.left = `${imageBounds.left - canvasBounds.left + (imageBounds.width - lamp.offsetWidth) / 2}px`;
    lamp.style.top = `${imageBounds.top - canvasBounds.top + (imageBounds.height - lamp.offsetHeight) / 2}px`;
  };

  let moved = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  const updateLampLight = ()=>{
    const x = lamp.offsetLeft + lamp.offsetWidth / 2;
    const y = lamp.offsetTop + lamp.offsetHeight / 2;
    const radius = Math.min(canvas.clientWidth, canvas.clientHeight) * 2 / 9;
    darkness.style.setProperty('--lamp-x', `${x}px`);
    darkness.style.setProperty('--lamp-y', `${y}px`);
    darkness.style.setProperty('--lamp-radius', `${radius}px`);
  };

  lamp.addEventListener('pointerdown', (event)=>{
    moved = false;
    startX = event.clientX;
    startY = event.clientY;
    startLeft = lamp.offsetLeft;
    startTop = lamp.offsetTop;
    lamp.setPointerCapture(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
  });

  lamp.addEventListener('pointermove', (event)=>{
    if(!lamp.hasPointerCapture(event.pointerId)) return;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if(Math.hypot(deltaX, deltaY) > 4) moved = true;
    if(!moved) return;

    const maxLeft = canvas.clientWidth - lamp.offsetWidth;
    const maxTop = canvas.clientHeight - lamp.offsetHeight;
    lamp.style.left = `${Math.max(0, Math.min(maxLeft, startLeft + deltaX))}px`;
    lamp.style.top = `${Math.max(0, Math.min(maxTop, startTop + deltaY))}px`;
    updateLampLight();
  });

  lamp.addEventListener('pointerup', (event)=>{
    if(!lamp.hasPointerCapture(event.pointerId)) return;
    lamp.releasePointerCapture(event.pointerId);
    updateLampLight();
  });

  lamp.addEventListener('pointercancel', (event)=>{
    if(lamp.hasPointerCapture(event.pointerId)) lamp.releasePointerCapture(event.pointerId);
  });

  centerLampOnImage();
  updateLampLight();
  new ResizeObserver(updateLampLight).observe(canvas);
  if(localStorage.getItem(INBOX_IMAGE_FOUND_KEY) === 'true') return;
  viewer.__lampMessageTimer = setTimeout(()=>{
    showMessageBox(
      'OKABE-OS 95',
      '(1) new message in Inbox.',
      'mail',
      addFoundImageMessage
    );
  }, 5000);
}

function closeImage(winId){
  const w = openWindows[winId].el;
  const viewer = w.querySelector('.image-view');
  if(viewer) viewer.style.display = 'none';
  const listEl = document.getElementById(winId + '-list');
  if(listEl) listEl.style.display = 'block';
}

function closeDoc(winId){
  const w = openWindows[winId].el;
  const viewer = w.querySelector('.doc-view');

  if(viewer){
    viewer.style.display = 'none';
  }

  const listEl = document.getElementById(winId + '-list');

  if(listEl){
    listEl.style.display = 'block';
  }
}