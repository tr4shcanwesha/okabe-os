/* ============================================================
   CONTENT: FILE SYSTEM FOR RINTARO OKABE
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

const imageFileTypes = ['image/png', 'image/jpeg'];

const IMAGE_FILES = [
  {
    name: 'evidence.png (LOCKED)',
    type: 'image',
    mimeType: 'image/png',
    src: 'images/evidence.png'
  }
];

const EVIDENCE_UNLOCK_KEY = 'okabe.evidence.unlocked';

if(localStorage.getItem(EVIDENCE_UNLOCK_KEY) === 'true'){
  IMAGE_FILES[0].name = 'evidence.png (UNLOCKED)';
}

function isImageFile(file){
  return file.type === 'image' || imageFileTypes.includes(file.mimeType);
}

function fileIcon(file){
  return isImageFile(file) ? (file.mimeType === 'image/png' ? ICON_URLS['cat'] : ICON_URLS['doc']) : ICON_URLS['doc'];
}

function isEvidenceFile(file){
  return file.src === 'images/evidence.png';
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
        <input class="evidence-password" type="password" maxlength="10" autocomplete="off" autofocus>
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

  box.querySelector('.mb-close').onclick = close;
  box.querySelector('.mb-cancel').onclick = close;
  box.querySelector('.mb-ok').onclick = ()=>form.requestSubmit();
  form.onsubmit = (event)=>{
    event.preventDefault();

    if(password.value !== 'SPLIT314'){
      error.textContent = 'Incorrect password.';
      password.select();
      return;
    }

    localStorage.setItem(EVIDENCE_UNLOCK_KEY, 'true');
    file.name = 'evidence.png (UNLOCKED)';
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
      <button class="btn95" type="button" onclick="zoomImage('${winId}', -0.1)">-</button>
      <button class="btn95" type="button" onclick="fitImage('${winId}')">Fit</button>
      <button class="btn95" type="button" onclick="zoomImage('${winId}', 0.1)">+</button>
      <span class="image-name">${image.name}</span>
    </div>
    <div class="image-canvas sunken">
      <img class="image-preview" src="${image.src}" alt="${image.name}">
    </div>
  `;

  viewer.dataset.zoom = '1';
  viewer.dataset.panX = '0';
  viewer.dataset.panY = '0';

  const canvas = viewer.querySelector('.image-canvas');
  const preview = viewer.querySelector('.image-preview');
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startPanX = 0;
  let startPanY = 0;

  canvas.addEventListener('pointerdown', (event)=>{
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    startPanX = Number(viewer.dataset.panX || 0);
    startPanY = Number(viewer.dataset.panY || 0);
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add('is-dragging');
    event.preventDefault();
    event.stopPropagation();
  });

  canvas.addEventListener('pointermove', (event)=>{
    if(!dragging) return;
    viewer.dataset.panX = (startPanX + event.clientX - startX).toString();
    viewer.dataset.panY = (startPanY + event.clientY - startY).toString();
    updateImagePosition(viewer, preview);
  });

  const stopDragging = (event)=>{
    if(!dragging) return;
    dragging = false;
    canvas.releasePointerCapture(event.pointerId);
    canvas.classList.remove('is-dragging');
  };

  canvas.addEventListener('pointerup', stopDragging);
  canvas.addEventListener('pointercancel', stopDragging);
}

function updateImagePosition(viewer, image){
  const zoom = Number(viewer.dataset.zoom || 1);
  const canvas = viewer.querySelector('.image-canvas');
  const canvasStyle = getComputedStyle(canvas);
  const canvasWidth = canvas.clientWidth - parseFloat(canvasStyle.paddingLeft) - parseFloat(canvasStyle.paddingRight);
  const canvasHeight = canvas.clientHeight - parseFloat(canvasStyle.paddingTop) - parseFloat(canvasStyle.paddingBottom);
  const maxPanX = Math.abs(canvasWidth - image.offsetWidth * zoom) / 2;
  const maxPanY = Math.abs(canvasHeight - image.offsetHeight * zoom) / 2;
  const panX = Math.max(-maxPanX, Math.min(maxPanX, Number(viewer.dataset.panX || 0)));
  const panY = Math.max(-maxPanY, Math.min(maxPanY, Number(viewer.dataset.panY || 0)));
  viewer.dataset.panX = panX.toString();
  viewer.dataset.panY = panY.toString();
  image.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
}

function zoomImage(winId, change){
  const viewer = openWindows[winId]?.el.querySelector('.image-view');
  const image = viewer?.querySelector('.image-preview');
  if(!viewer || !image) return;

  const zoom = Math.min(4, Math.max(0.2, Number(viewer.dataset.zoom || 1) + change));
  viewer.dataset.zoom = zoom.toString();
  updateImagePosition(viewer, image);
}

function fitImage(winId){
  const viewer = openWindows[winId]?.el.querySelector('.image-view');
  const image = viewer?.querySelector('.image-preview');
  if(!viewer || !image) return;
  viewer.dataset.zoom = '1';
  viewer.dataset.panX = '0';
  viewer.dataset.panY = '0';
  updateImagePosition(viewer, image);
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