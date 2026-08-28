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
    date: getCurrentMailTimestamp(),
    body: `If you're reading this, the system is still operational.

Okabe was working on something unusual before he disappeared. I don't know what went wrong, but he left pieces of his work scattered throughout this system.

Find what he left behind. Start with the files, and DO NOT TRUST THE DATES OR TIMESTAMPS.

- K`
  },
  {
    id: 'building-management', sender: 'Building Management', subject: 'RE: RE: RE: smell complaint',
    date: '08/19/2026 03:14 AM',
    body: 'This is our third notice this month regarding odors from the sub-basement. Please respond.'
  },
  {
    id: 'chem-supply', sender: 'Lab Supplies', subject: 'Chem supply order #4471',
    date: '08/17/2026 03:14 AM',
    body: 'Your order of solder, wire, and "assorted 9V batteries (many)" has shipped.'
  }
];

const mailFolders = {
  inbox: { label: 'Inbox', messages: inboxMessages },
  sent: {
    label: 'Sent Items',
    messages: [
      {
        id: 'sent-board-update', sender: 'R. Okabe', recipient: 'Board of Directors', subject: 'Weekly laboratory report',
        date: '08/18/2026 03:14 AM',
        body: `To the Board of Directors,

The latest readings remain inconclusive, which is not the same as uninteresting. The equipment is stable, the fridge is not, and the relay continues to respond to events before they occur.

— I will submit a fuller report when I have one.`
      },
      {
        id: 'sent-k-warning', sender: 'R. Okabe', recipient: 'K', subject: 'RE: Stop asking questions',
        date: '08/12/2026 03:14 AM',
        body: `K,

If you are going to keep looking, do it carefully. The obvious files are decoys, and the timestamps are worse than useless.

Do not come to the lab tonight.`
      },
      {
        id: 'sent-k-lab-door', sender: 'R. Okabe', recipient: 'K', subject: 'Do not use the west entrance',
        date: '08/11/2026 03:14 AM',
        body: `K,

  I saw the west entrance open when I know I locked it. Do not use that door, and do not call me from inside the building.

  If the lights are on, leave. If they are off, leave faster.`
      },
      {
        id: 'sent-k-timestamps', sender: 'R. Okabe', recipient: 'K', subject: 'The timestamps are wrong',
        date: '08/09/2026 03:14 AM',
        body: `K,

  The files are not being modified in the order they appear. I changed the clock twice, but the system keeps correcting it to a date that has not happened yet.

  Do not trust the newest file. It may be the oldest one.`
      },
      {
        id: 'sent-k-visitor', sender: 'R. Okabe', recipient: 'K', subject: 'Someone was in the sub-basement',
        date: '08/07/2026 03:14 AM',
        body: `K,

  There was a second mug beside the terminal this morning. It was still warm. I live alone, and the security log says I never entered the room.

  I am deleting this after you read it. Do the same.`
      }
    ]
  },
  deleted: {
    label: 'Deleted Items',
    messages: [
      {
        id: 'deleted-insurance', sender: 'Building Management', subject: 'Sub-basement access renewal',
        date: '08/05/2026 03:14 AM',
        body: 'Your sub-basement access renewal has been denied pending inspection. Please remove all unauthorized equipment from the premises.'
      },
      {
        id: 'deleted-spam', sender: 'Unknown Sender', subject: 'Congratulations, Dr. Okabe!',
        date: '07/31/2026 03:14 AM',
        body: 'You have been selected for a remarkable opportunity. This message was deleted before anyone could click the attachment.'
      }
    ]
  },
  drafts: {
    label: 'Drafts',
    messages: [
      {
        id: 'draft-fridge', sender: 'R. Okabe', subject: 'RE: Equipment replacement request',
        date: '08/20/2026 03:14 AM',
        body: `To the Board,

The mini-fridge is now load-bearing. I understand this is not a conventional equipment request, but replacing it would be cheaper than replacing the sub-basement.

[Draft not sent]`
      },
      {
        id: 'draft-pattern', sender: 'R. Okabe', subject: 'Untitled',
        date: '08/20/2026 03:14 AM',
        body: `[Draft not sent]

The pattern repeats every 314 seconds. Ask K about the missing workstation.`
      }
    ]
  }
};

let activeMailFolder = 'inbox';

function getCurrentMailTimestamp(){
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = now.getHours();
  const displayHour = hour % 12 || 12;
  const minute = String(now.getMinutes()).padStart(2, '0');
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${month}/${day}/${now.getFullYear()} ${displayHour}:${minute} ${period}`;
}

function addFoundImageMessage(){
  if(inboxMessages.some(message => message.id === 'k-image-found')) return;

  localStorage.setItem(INBOX_IMAGE_FOUND_KEY, 'true');

  inboxMessages.unshift({
    id: 'k-image-found', sender: 'K', subject: 'You found it',
    date: getCurrentMailTimestamp(),
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
  if(list && activeMailFolder === 'inbox') list.innerHTML = renderMailRows('inbox');
  const status = inbox && inbox.querySelector('.status-pane');
  if(status && activeMailFolder === 'inbox') status.textContent = inboxMessages.length + ' message(s)';
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

function getMailBody(message){
  if(message.recipient !== 'K' || message.body.trimEnd().endsWith('-R')) return message.body;
  return message.body.trimEnd() + '\n\n-R';
}

function renderMailRows(folderKey){
  const messages = mailFolders[folderKey].messages;
  const readIds = getInboxReadIds();
  const contactLabel = folderKey === 'sent' ? 'To' : 'From';
  return messages.map((message, index)=>{
    const isUnread = folderKey === 'inbox' && !readIds.includes(message.id);
    const contact = folderKey === 'sent' ? message.recipient : message.sender;
    return `
    <div class="inbox-row ${isUnread ? 'unread' : 'read'}" onclick="openMailMessage('${folderKey}', ${index})">
      <span class="inbox-status">${isUnread ? '*' : ''}</span>
      <span class="inbox-sender">${contact}</span>
      <span class="inbox-subject">${message.subject}</span>
      <span class="inbox-date">${message.date}</span>
    </div>`;
  }).join('');
}

function renderMailApp(){
  return `<div class="mail-app">
    <aside class="mail-folders">
      <div class="mail-folder-title">Private Folders</div>
      ${Object.entries(mailFolders).map(([key, folder])=>`
        <div class="mail-folder ${key === activeMailFolder ? 'active' : ''}" data-folder="${key}" onclick="selectMailFolder('${key}')">
          <img src="${ICON_URLS[key === activeMailFolder ? 'folder_open' : 'folder']}" alt="">
          <span>${folder.label}</span>
        </div>`).join('')}
    </aside>
    <section class="mail-list-pane">
      <div class="mail-list-title" id="mail-folder-title">${mailFolders[activeMailFolder].label}</div>
      <div class="inbox-columns"><span></span><span id="mail-contact-heading">${activeMailFolder === 'sent' ? 'To' : 'From'}</span><span>Subject</span><span>Received</span></div>
      <div id="inbox-list">${renderMailRows(activeMailFolder)}</div>
    </section>
  </div>`;
}

function openInbox(){
  if(openWindows.inbox){ restoreWindow('inbox'); return; }
  activeMailFolder = 'inbox';
  openWindow('inbox', {
    title: 'Microsoft Outlook - Inbox', icon: 'mail', width: 620, height: 390,
    menu: ['File', 'Edit', 'View', 'Tools', 'Help'], status: inboxMessages.length + ' message(s)',
    bodyHTML: renderMailApp()
  });
}

function selectMailFolder(folderKey){
  if(!mailFolders[folderKey]) return;
  activeMailFolder = folderKey;
  const win = openWindows.inbox && openWindows.inbox.el;
  if(!win) return;
  win.querySelectorAll('.mail-folder').forEach(folder=>folder.classList.remove('active'));
  win.querySelectorAll('.mail-folder img').forEach(icon=>{
    const folder = icon.closest('.mail-folder');
    icon.src = ICON_URLS[folder.dataset.folder === folderKey ? 'folder_open' : 'folder'];
  });
  const selectedFolder = [...win.querySelectorAll('.mail-folder')].find(folder=>folder.dataset.folder === folderKey);
  if(selectedFolder) selectedFolder.classList.add('active');
  const title = win.querySelector('#mail-folder-title');
  if(title) title.textContent = mailFolders[folderKey].label;
  const contactHeading = win.querySelector('#mail-contact-heading');
  if(contactHeading) contactHeading.textContent = folderKey === 'sent' ? 'To' : 'From';
  const list = win.querySelector('#inbox-list');
  if(list) list.innerHTML = renderMailRows(folderKey);
  const status = win.querySelector('.status-pane');
  if(status) status.textContent = mailFolders[folderKey].messages.length + ' message(s)';
}

function openMailMessage(folderKey, index){
  const message = mailFolders[folderKey]?.messages[index];
  if(!message) return;
  if(folderKey === 'inbox'){
    markInboxRead(message.id);
    const inbox = openWindows.inbox && openWindows.inbox.el;
    const list = inbox && inbox.querySelector('#inbox-list');
    if(list) list.innerHTML = renderMailRows('inbox');
  }
  const messageWindowId = 'mail-message-' + folderKey + '-' + message.id;
  openWindow(messageWindowId, {
    title: message.subject, icon: 'mail', width: 470, height: 330,
    menu: ['File', 'Edit', 'View', 'Help'], white: true,
    bodyHTML: `<div class="mail-message-view">
      <button class="btn95 mail-back" type="button" onclick="closeMailMessage('${messageWindowId}')">&laquo; Back</button>
      <div class="mail-message-header">
        <div><b>From:</b> ${message.sender}</div>
        <div><b>To:</b> ${message.recipient || 'R. Okabe'}</div>
        <div><b>Subject:</b> ${message.subject}</div>
        <div><b>Received:</b> ${message.date}</div>
      </div>
      <pre>${getMailBody(message)}</pre>
    </div>`
  });
}

function closeMailMessage(messageWindowId){
  closeWindow(messageWindowId);
  if(openWindows.inbox) bringToFront('inbox');
}

function openInboxMessage(index){
  openMailMessage('inbox', index);
}

function closeInboxMessage(){
  const messageWindow = Object.keys(openWindows).find(id=>id.startsWith('mail-message-'));
  if(messageWindow) closeMailMessage(messageWindow);
}

addDesktopIcon('inbox', 'inbox', 'Inbox', openInbox);
updateInboxIndicator();

if(localStorage.getItem(INBOX_IMAGE_FOUND_KEY) === 'true'){
  addFoundImageMessage();
}