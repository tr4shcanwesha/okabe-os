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

// DO NOT TRY TO DECLUTTER THIS FILE. I TRIED AND IT WAS BAD.

// OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO

/* ============================================================
   ICON URLS
   Replace each placeholder URL with the real icon URL.
   ============================================================ */
const ICON_URLS = {
  computer: "https://win98icons.alexmeub.com/icons/png/computer_explorer_cool-0.png",
  briefcase: "https://win98icons.alexmeub.com/icons/png/briefcase-4.png",
  network: "https://win98icons.alexmeub.com/icons/png/connected_world-0.png",
  online: "https://win98icons.alexmeub.com/icons/png/channels-2.png",
  recycle_empty: "https://win98icons.alexmeub.com/icons/png/recycle_bin_empty-4.png",
  recycle_full: "https://win98icons.alexmeub.com/icons/png/recycle_bin_full-4.png",
  inbox: "https://win98icons.alexmeub.com/icons/png/directory_fonts-0.png",
  internet: "https://win98icons.alexmeub.com/icons/png/msie1-2.png",
  msn: "https://win98icons.alexmeub.com/icons/png/msagent-4.png",
  folder: "https://win98icons.alexmeub.com/icons/png/directory_closed-4.png",
  folder_open: "https://win98icons.alexmeub.com/icons/png/directory_open_file_mydocs-4.png",
  doc: "https://win98icons.alexmeub.com/icons/png/address_book_pad.png",
  exe: "https://win98icons.alexmeub.com/icons/png/help_question_mark-0.png",
  mail: "https://win98icons.alexmeub.com/icons/png/directory_explorer-5.png",
  drive: "https://win98icons.alexmeub.com/icons/png/standby_monitor_moon-3.png",
  disk: "https://win98icons.alexmeub.com/icons/png/removable_disk_drive-2.png",
  cat: "https://win98icons.alexmeub.com/icons/png/kodak_imaging_file-0.png"
};

/* ============================================================
   WINDOW MANAGER
   ============================================================ */
let zTop = 10;
const openWindows = {}; // id -> {el, taskbtn, minimized}

function bringToFront(id){
  Object.values(openWindows).forEach(w=>{
    w.el.classList.add('inactive');
    w.taskbtn.classList.remove('active');
  });

  const w = openWindows[id];
  zTop += 1;
  w.el.style.zIndex = zTop;
  w.el.classList.remove('inactive');
  w.taskbtn.classList.add('active');
}

function closeWindow(id){
  const w = openWindows[id];
  if(!w) return;

  w.el.remove();
  w.taskbtn.remove();
  delete openWindows[id];
}

function minimizeWindow(id){
  const w = openWindows[id];

  w.el.style.display = 'none';
  w.minimized = true;
  w.taskbtn.classList.remove('active');
}

function restoreWindow(id){
  const w = openWindows[id];

  w.el.style.display = 'flex';
  w.minimized = false;
  bringToFront(id);
}

function toggleWindow(id){
  const w = openWindows[id];
  if(!w) return;

  if(w.minimized) {
    restoreWindow(id);
  } else if(w.el.style.zIndex == zTop) {
    minimizeWindow(id);
  } else {
    bringToFront(id);
  }
}

function openWindow(id, opts){
  if(openWindows[id]){
    restoreWindow(id);
    return;
  }

  const win = document.createElement('div');
  win.className = 'win';

  win.style.left =
    (opts.x != null ? opts.x : 80 + Object.keys(openWindows).length * 26) + 'px';

  win.style.top =
    (opts.y != null ? opts.y : 60 + Object.keys(openWindows).length * 22) + 'px';

  win.style.width = (opts.width || 420) + 'px';
  win.style.height = (opts.height || 320) + 'px';

  const menuHTML = opts.menu
    ? `<div class="menubar">${opts.menu.map(m => `<span>${m}</span>`).join('')}</div>`
    : '';

  const statusHTML = opts.status
    ? `<div class="win-statusbar sunken" style="box-shadow:inset 1px 1px 0 #808080;">
         <div class="status-pane sunken">${opts.status}</div>
       </div>`
    : '';

  win.innerHTML = `
    <div class="titlebar">
      <img class="ticon" src="${ICON_URLS[opts.icon]}">
      <div class="ttext">${opts.title}</div>
      <div class="tbtn tb-min">-</div>
      <div class="tbtn tb-max">□</div>
      <div class="tbtn tb-close">×</div>
    </div>

    ${menuHTML}

    <div class="win-body ${opts.white ? 'white' : ''}">
      ${opts.bodyHTML}
    </div>

    ${statusHTML}
  `;

  document.body.appendChild(win);

  /* dragging */
  const titlebar = win.querySelector('.titlebar');
  let drag = null;

  titlebar.addEventListener('mousedown', (e)=>{
    if(e.target.classList.contains('tbtn')) return;

    bringToFront(id);

    drag = {
      sx: e.clientX,
      sy: e.clientY,
      ox: win.offsetLeft,
      oy: win.offsetTop
    };

    e.preventDefault();
  });

  document.addEventListener('mousemove', (e)=>{
    if(!drag) return;

    win.style.left =
      Math.max(0, drag.ox + (e.clientX - drag.sx)) + 'px';

    win.style.top =
      Math.max(0, drag.oy + (e.clientY - drag.sy)) + 'px';
  });

  document.addEventListener('mouseup', ()=>{
    drag = null;
  });

  win.querySelector('.tb-close').addEventListener('click', ()=>{
    closeWindow(id);
  });

  win.querySelector('.tb-min').addEventListener('click', ()=>{
    minimizeWindow(id);
  });

  win.querySelector('.tb-max').addEventListener('click', ()=>{
    if(win.dataset.max === '1'){
      win.style.width = win.dataset.pw;
      win.style.height = win.dataset.ph;
      win.style.left = win.dataset.px;
      win.style.top = win.dataset.py;
      win.dataset.max = '0';
    } else {
      win.dataset.pw = win.style.width;
      win.dataset.ph = win.style.height;
      win.dataset.px = win.style.left;
      win.dataset.py = win.style.top;

      win.style.left = '0px';
      win.style.top = '0px';
      win.style.width = '100%';
      win.style.height = 'calc(100% - 36px)';

      win.dataset.max = '1';
    }
  });

  win.addEventListener('mousedown', ()=>{
    bringToFront(id);
  });

  /* taskbar button */
  const taskbtn = document.createElement('div');
  taskbtn.className = 'taskbtn raised';

  taskbtn.innerHTML = `
    <img src="${ICON_URLS[opts.icon]}">
    ${opts.title}
  `;

  taskbtn.addEventListener('click', ()=>{
    toggleWindow(id);
  });

  document.getElementById('tb-tasks').appendChild(taskbtn);

  openWindows[id] = {
    el: win,
    taskbtn,
    minimized: false
  };

  bringToFront(id);

  return win;
}

/* ============================================================
   MESSAGE BOX
   ============================================================ */
function showMessageBox(title, text, icon){
  const overlay = document.createElement('div');
  overlay.className = 'msgbox-overlay';

  const box = document.createElement('div');
  box.className = 'msgbox';

  box.style.left = '50%';
  box.style.top = '38%';
  box.style.transform = 'translate(-50%,-50%)';

  box.innerHTML = `
    <div class="titlebar">
      <div class="ttext">${title}</div>
      <div class="tbtn mb-close">×</div>
    </div>

    <div class="msgbox-body">
      <img src="${ICON_URLS[icon || 'exe']}" width="32" height="32">
      <div class="txt">${text}</div>
    </div>

    <div class="msgbox-buttons">
      <button class="btn95 mb-ok">OK</button>
    </div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const close = ()=>overlay.remove();

  box.querySelector('.mb-close').onclick = close;
  box.querySelector('.mb-ok').onclick = close;
}

/* ============================================================
   DESKTOP ICON FACTORY
   ============================================================ */
function addDesktopIcon(id, iconKey, label, onOpen){
  const el = document.createElement('div');
  el.className = 'icon';

  el.innerHTML = `
    <img class="glyph" src="${ICON_URLS[iconKey]}">
    <div class="label">${label}</div>
  `;

  el.addEventListener('click', (e)=>{
    document
      .querySelectorAll('.icon.selected')
      .forEach(i => i.classList.remove('selected'));

    el.classList.add('selected');
    e.stopPropagation();
  });

  el.addEventListener('dblclick', (e)=>{
    onOpen();
    e.stopPropagation();
  });

  document.getElementById('desktop').appendChild(el);
}

document.getElementById('desktop').addEventListener('click', ()=>{
  document
    .querySelectorAll('.icon.selected')
    .forEach(i => i.classList.remove('selected'));
});

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
    name: 'workstation-okabe.png',
    type: 'image',
    mimeType: 'image/png',
    src: 'images/workstation-okabe.png'
  }
];

function isImageFile(file){
  return file.type === 'image' || imageFileTypes.includes(file.mimeType);
}

function fileIcon(file){
  return isImageFile(file) ? (file.mimeType === 'image/png' ? ICON_URLS['cat'] : ICON_URLS['doc']) : ICON_URLS['doc'];
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
  if(isImageFile(file)) openImage(winId, file);
  else openDoc(winId, idx);
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

/* ============================================================
   ICON DEFINITIONS / OPEN HANDLERS
   ============================================================ */

addDesktopIcon('mycomputer', 'computer', 'My Computer', ()=>{
  openWindow('mycomputer', {
    title: 'My Computer',
    icon: 'computer',
    width: 380,
    height: 260,
    menu: ['File','Edit','View','Help'],
    status: '4 object(s)',

    bodyHTML: `
      <div class="file-row"
           onclick="showMessageBox('3½ Floppy (A:)','0 bytes free of 1.44 MB. Nothing important was ever saved here on purpose.','disk')">
        <img class="fico" src="${ICON_URLS['disk']}">
        <span>3½ Floppy (A:)</span>
      </div>

      <div class="file-row"
           onclick="showMessageBox('Local Disk (C:)','1.2 GB free of 2.1 GB. Mostly lab notes, toast data, and one (1) undeleted mini-fridge manual.','drive')">
        <img class="fico" src="${ICON_URLS['drive']}">
        <span>Local Disk (C:)</span>
      </div>

      <div class="file-row"
           onclick="showMessageBox('Okabe Laboratory (D:)','Network drive. Contains everything the Board pretends not to have read.','drive')">
        <img class="fico" src="${ICON_URLS['drive']}">
        <span>Okabe Laboratory (D:)</span>
      </div>

      <div class="file-row"
           onclick="showMessageBox('Control Panel','Settings for a machine that has never once needed adjusting, according to its owner.','folder')">
        <img class="fico" src="${ICON_URLS['folder']}">
        <span>Control Panel</span>
      </div>
    `
  });
});

addDesktopIcon('myfiles', 'folder', 'My Files', ()=>{
  docListWindow(
    'myfiles',
    "R. Okabe's Files",
    'folder_open',
    DOCS.lab.concat(DOCS.personal, IMAGE_FILES),
    (DOCS.lab.length + DOCS.personal.length + IMAGE_FILES.length) + ' object(s)'
  );
});

addDesktopIcon('briefcase', 'briefcase', 'My Briefcase', ()=>{
  docListWindow(
    'briefcase',
    'My Briefcase',
    'briefcase',
    DOCS.lab,
    'Synced last: never'
  );
});

let recycleHasItems = true;

addDesktopIcon('recyclebin', 'recycle_full', 'Recycle Bin', ()=>{
  const deleted = [
    {
      name: 'budget_report_REAL.xls',
      body: 'Recovered twice. Deleted a third time on purpose. Some numbers are better forgotten.'
    },
    {
      name: 'why_the_smoke_alarm_went_off.txt',
      body: 'Short version: the toaster experiment. Long version: also the toaster experiment.'
    },
    {
      name: 'resume_just_in_case.doc',
      body: 'Last updated three years ago. Objective: "Seeking a research position where nobody asks too many questions." Never sent.'
    },
    {
      name: 'cat_photos_backup.zip',
      body: '214 photographs of Fourier looking unimpressed, taken from every conceivable angle.'
    }
  ];

  docListWindow(
    'recyclebin',
    'Recycle Bin',
    recycleHasItems ? 'recycle_full' : 'recycle_empty',
    deleted,
    deleted.length + ' object(s) — 0 bytes will be freed'
  );
});

addDesktopIcon('network', 'network', 'Network', ()=>{
  openWindow('network', {
    title: 'Network Neighborhood',
    icon: 'network',
    width: 340,
    height: 220,
    status: '2 object(s)',

    bodyHTML: `
      <div class="file-row"
           onclick="showMessageBox('OKABE-LAB-01','This computer. You are already here.','computer')">
        <img class="fico" src="${ICON_URLS['computer']}">
        <span>OKABE-LAB-01</span>
      </div>

      <div class="file-row"
           onclick="showMessageBox('K-WORKSTATION','Connection refused. It has been refused for a long time.','computer')">
        <img class="fico" src="${ICON_URLS['computer']}">
        <span>K-WORKSTATION</span>
      </div>
    `
  });
});

addDesktopIcon('online', 'online', 'Online Services', ()=>{
  showMessageBox(
    'Online Services',
    'Your modem dials, screeches, and connects at a proud 28,800 bps. Please enjoy the sound of the future.',
    'online'
  );
});

addDesktopIcon('inbox', 'inbox', 'Inbox', ()=>{
  const mail = [
    {
      name: 'RE: RE: RE: smell complaint (building mgmt)',
      body: 'This is our third notice this month regarding odors from sub-basement. Please respond. — Building Management'
    },
    {
      name: 'chem supply order #4471',
      body: 'Your order of solder, wire, and "assorted 9V batteries (many)" has shipped.'
    },
    {
      name: 'no subject',
      body: "the numbers add up to nothing.\n\n- K"
    }
  ];

  docListWindow(
    'inbox',
    'Inbox',
    'mail',
    mail,
    mail.length + ' message(s), 1 unread'
  );
});

addDesktopIcon('internet', 'internet', 'Internet', ()=>{
  openWindow('internet', {
    title: 'Microsoft Internet Explorer',
    icon: 'internet',
    width: 460,
    height: 320,
    menu: ['File','Edit','View','Go','Favorites','Help'],
    status: 'Done',

    bodyHTML: `
      <div style="padding:16px;font-family:'Times New Roman',serif;">
        <h2 style="margin-top:0;">Welcome to the World Wide Web</h2>

        <p>You are visitor number 000,214 to this page.</p>

        <p>This page is best viewed at 800×600 resolution.</p>

        <hr>

        <p><i>Under construction. Like most things in this lab.</i></p>
      </div>
    `
  });
});

addDesktopIcon('msn', 'msn', 'The Okabe Network', ()=>{
  showMessageBox(
    'The Okabe Network',
    'You are now signed in. 0 buddies online. This has been true for a while.',
    'msn'
  );
});

/* ============================================================
   CLOCK
   ============================================================ */
function updateClock(){
  if(window.__fullscreenPenaltyDisplay){
    document.getElementById('clock').textContent = window.__fullscreenPenaltyDisplay;
    return;
  }

  const now = new Date();

  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');

  const ampm = h >= 12 ? 'PM' : 'AM';

  h = h % 12;

  if(h === 0){
    h = 12;
  }

  document.getElementById('clock').textContent = `${h}:${m} ${ampm}`;
}

updateClock();
setInterval(updateClock, 1000);

/* Open "My Files" by default so the desk feels lived-in */
setTimeout(()=>{
  showMessageBox(
    'OKABE-OS 95',
    'Welcome back, Dr. Okabe.\n\n(1) new message in Inbox.',
    'computer'
  );
}, 400);