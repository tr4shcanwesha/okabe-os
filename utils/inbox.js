/* ============================================================
  INBOX
  Messages, unread state, rendering, and Inbox window handlers
  ============================================================ */
const INBOX_READ_KEY = 'okabe.inbox.read';
const INBOX_IMAGE_FOUND_KEY = 'okabe.inbox.image-found';
const DEFAULT_INBOX_READ_IDS = ['building-management', 'chem-supply'];
const inboxMessages = [
  {
    id: 'k-introduction', sender: 'K', subject: 'You need to see this',
    date: '08/21/2026 11:34 AM',
    body: `If you're reading this, the system is still operational.

Okabe was working on something unusual before he disappeared. I don't know what went wrong, but he left pieces of his work scattered throughout this system.

Find what he left behind. Start with the files, and DO NOT TRUST THE DATES OR TIMESTAMPS.

-- K`
  },
  {
    id: 'building-management', sender: 'Building Management', subject: 'RE: RE: RE: smell complaint',
    date: '08/19/2026 04:12 PM',
    body: 'This is our third notice this month regarding odors from the sub-basement. Please respond.'
  },
  {
    id: 'chem-supply', sender: 'Lab Supplies', subject: 'Chem supply order #4471',
    date: '08/17/2026 09:05 AM',
    body: 'Your order of solder, wire, and "assorted 9V batteries (many)" has shipped.'
  }
];

function addFoundImageMessage(){
  if(inboxMessages.some(message => message.id === 'k-image-found')) return;

  localStorage.setItem(INBOX_IMAGE_FOUND_KEY, 'true');

  inboxMessages.unshift({
    id: 'k-image-found', sender: 'K', subject: 'You found it',
    date: '08/23/2026 08:00 PM',
    body: `So you opened the image.
Honestly, I wasn't sure the file would still be there.

There's something you should understand before you go any further. What you're looking at isn't the important part. It's what's missing from it. Okabe was very deliberate about what he kept and what he removed.

I spent a long time trying to figure out where he hid the things he didn't want anyone to find.

I think I finally understand his pattern.

There should be another workstation on the system.

Start there.

And one more thing: don't open anything just because it has his name on it. Some of those files aren't what they appear to be.

I know that sounds paranoid.

You'd be paranoid too if you knew...

— K`
  });

  updateInboxIndicator();
  const inbox = openWindows.inbox && openWindows.inbox.el;
  const list = inbox && inbox.querySelector('#inbox-list');
  if(list) list.innerHTML = renderInboxRows();
  const status = inbox && inbox.querySelector('.status-pane');
  if(status) status.textContent = inboxMessages.length + ' message(s)';
}

function getInboxReadIds(){
  const existing = localStorage.getItem(INBOX_READ_KEY);
  if(!existing) return DEFAULT_INBOX_READ_IDS;
  try {
    return [...new Set(DEFAULT_INBOX_READ_IDS.concat(JSON.parse(existing)))];
  } catch {
    return DEFAULT_INBOX_READ_IDS;
  }
}

function updateInboxIndicator(){
  const unread = inboxMessages.some(message => !getInboxReadIds().includes(message.id));
  const badge = document.getElementById('inbox-unread');
  if(badge) badge.hidden = !unread;
}

function markInboxRead(messageId){
  const readIds = getInboxReadIds();
  if(!readIds.includes(messageId)){
    readIds.push(messageId);
    localStorage.setItem(INBOX_READ_KEY, JSON.stringify(readIds));
  }
  updateInboxIndicator();
}

function renderInboxRows(){
  const readIds = getInboxReadIds();
  return inboxMessages.map((message, index)=>`
    <div class="inbox-row ${readIds.includes(message.id) ? 'read' : 'unread'}" onclick="openInboxMessage(${index})">
      <span class="inbox-status">${readIds.includes(message.id) ? '' : '*'}</span>
      <span class="inbox-sender">${message.sender}</span>
      <span class="inbox-subject">${message.subject}</span>
      <span class="inbox-date">${message.date}</span>
    </div>
  `).join('');
}

function openInbox(){
  if(openWindows.inbox){ restoreWindow('inbox'); return; }
  openWindow('inbox', {
    title: 'Inbox', icon: 'mail', width: 470, height: 330,
    menu: ['File', 'Edit', 'View', 'Help'], status: inboxMessages.length + ' message(s)',
    bodyHTML: `<div id="inbox-list">${renderInboxRows()}</div>`
  });
}

function openInboxMessage(index){
  const message = inboxMessages[index];
  markInboxRead(message.id);
  const win = openWindows.inbox && openWindows.inbox.el;
  if(!win) return;
  const list = win.querySelector('#inbox-list');
  if(list) list.style.display = 'none';
  let viewer = win.querySelector('.inbox-view');
  if(!viewer){
    viewer = document.createElement('div');
    viewer.className = 'inbox-view';
    win.querySelector('.win-body').appendChild(viewer);
  }
  viewer.style.display = 'block';
  viewer.innerHTML = `
    <button class="btn95 backbtn" type="button" onclick="closeInboxMessage()">&laquo; Back to Inbox</button>
    <div class="inbox-header"><b>From:</b> ${message.sender}<br><b>Subject:</b> ${message.subject}<br><b>Date:</b> ${message.date}</div>
    <pre>${message.body}</pre>
  `;
}

function closeInboxMessage(){
  const win = openWindows.inbox && openWindows.inbox.el;
  if(!win) return;
  const viewer = win.querySelector('.inbox-view');
  const list = win.querySelector('#inbox-list');
  if(viewer) viewer.style.display = 'none';
  if(list){ list.innerHTML = renderInboxRows(); list.style.display = 'block'; }
}

addDesktopIcon('inbox', 'inbox', 'Inbox', openInbox);
updateInboxIndicator();

if(localStorage.getItem(INBOX_IMAGE_FOUND_KEY) === 'true'){
  addFoundImageMessage();
}