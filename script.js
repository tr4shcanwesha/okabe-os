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
function showMessageBox(title, text, icon, onOk){
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
  box.querySelector('.mb-ok').onclick = ()=>{
    close();
    if(onOk) onOk();
  };
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
         onclick="connectKWorkstation()">
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
  if(localStorage.getItem('okabe.inbox.image-found') === 'true') return;
  showMessageBox(
    'OKABE-OS 95',
    'Welcome back, Dr. Okabe.\n\n(1) new message in Inbox.',
    'computer'
  );
}, 400);