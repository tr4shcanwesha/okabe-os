/* ============================================================
   START.EXE DESKTOP ICON  ->  WORDLE
   This file relies on the core OS globals loaded by /script.js:
   addDesktopIcon, openWindow, openWindows, showMessageBox, ICON_URLS
   ============================================================ */
addDesktopIcon('startexe','exe','Wordle', ()=>openWordle());

const WORDS = ["LASER","GHOST","FRIDGE","TOAST","CLOCK","MOUSE","FLOPPY","CABLE","QUARK","BREAD",
  "TONER","PIXEL","SPARK","BATCH","DRIVE","CRUMB","STEAM","GLASS","PAPER","METAL",
  "CHART","BRAIN","STORM","LIGHT","NIGHT","DAWN","EARTH","OCEAN","RIVER","STONE"]
  .filter(w=>w.length===5);

let wState = null;
function openWordle(){
  if(openWindows['wordle']){ restoreWindow('wordle'); return; }
  const answer = WORDS[Math.floor(Math.random()*WORDS.length)];
  wState = { answer, guesses:[], current:'', row:0, done:false, keyStates:{} };

  const body = `
    <div class="wordle-wrap">
      <div id="wgrid" class="wgrid"></div>
      <div id="wmsg"></div>
      <div id="wkeyboard" class="wkeyboard"></div>
    </div>
  `;
  openWindow('wordle', {
    title:'WORDLE.EXE — Word Guessing Program', icon:'exe', width:360, height:430,
    menu:['Game','Help'],
    status:'Guess the 5-letter word in 6 tries',
    bodyHTML: body
  });
  renderWordleGrid();
  renderWordleKeyboard();

  // menu handlers
  const win = openWindows['wordle'].el;
  const menuSpans = win.querySelectorAll('.menubar span');
  menuSpans[0].onclick = ()=>openWordle(); // Game > New game (reopen fresh)
  menuSpans[1].onclick = ()=>showMessageBox('Help', 'GREEN = right letter, right spot.\nGOLD = right letter, wrong spot.\nGRAY = not in the word.\n\nType letters, ENTER to submit, BACKSPACE to delete.', 'exe');
}

function renderWordleGrid(){
  const grid = document.getElementById('wgrid');
  if(!grid) return;
  grid.innerHTML='';
  for(let r=0;r<6;r++){
    const rowEl = document.createElement('div');
    rowEl.className='wrow';
    const guess = wState.guesses[r];
    const letters = guess ? guess.result : (r===wState.row ? wState.current.padEnd(5,' ').split('') : ['','','','','']);
    for(let c=0;c<5;c++){
      const tile = document.createElement('div');
      tile.className='wtile';
      if(guess){
        tile.classList.add(guess.result[c].state);
        tile.textContent = guess.result[c].ch;
      } else if(r===wState.row){
        tile.textContent = wState.current[c] || '';
      }
      rowEl.appendChild(tile);
    }
    grid.appendChild(rowEl);
  }
}

function renderWordleKeyboard(){
  const kb = document.getElementById('wkeyboard');
  if(!kb) return;
  kb.innerHTML='';
  const rows = ["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"];
  rows.forEach((rowStr,i)=>{
    const rowEl = document.createElement('div');
    rowEl.className='wkrow';
    if(i===2){
      const enter = document.createElement('div');
      enter.className='wkey wide raised';
      enter.textContent='ENTER';
      enter.onclick=()=>wordleKey('ENTER');
      rowEl.appendChild(enter);
    }
    rowStr.split('').forEach(ch=>{
      const key = document.createElement('div');
      key.className='wkey raised';
      if(wState.keyStates[ch]) key.classList.add(wState.keyStates[ch]);
      key.textContent = ch;
      key.onclick = ()=>wordleKey(ch);
      rowEl.appendChild(key);
    });
    if(i===2){
      const bksp = document.createElement('div');
      bksp.className='wkey wide raised';
      bksp.textContent='DEL';
      bksp.onclick=()=>wordleKey('BACKSPACE');
      rowEl.appendChild(bksp);
    }
    kb.appendChild(rowEl);
  });
}

function wordleKey(key){
  if(!wState || wState.done) return;
  if(key==='BACKSPACE'){
    wState.current = wState.current.slice(0,-1);
  } else if(key==='ENTER'){
    if(wState.current.length!==5){
      setWMsg('Not enough letters');
      return;
    }
    submitWordleGuess();
  } else if(/^[A-Z]$/.test(key)){
    if(wState.current.length<5) wState.current += key;
  }
  renderWordleGrid();
}

function setWMsg(t){
  const el = document.getElementById('wmsg');
  if(el) el.textContent = t;
}

function submitWordleGuess(){
  const guessStr = wState.current;
  const answer = wState.answer;
  const result = new Array(5).fill(null);
  const answerArr = answer.split('');
  const used = new Array(5).fill(false);

  for(let i=0;i<5;i++){
    if(guessStr[i]===answerArr[i]){
      result[i] = {ch:guessStr[i], state:'correct'};
      used[i] = true;
    }
  }
  for(let i=0;i<5;i++){
    if(result[i]) continue;
    let foundIdx = -1;
    for(let j=0;j<5;j++){
      if(!used[j] && answerArr[j]===guessStr[i]){ foundIdx=j; break; }
    }
    if(foundIdx>=0){
      result[i] = {ch:guessStr[i], state:'present'};
      used[foundIdx] = true;
    } else {
      result[i] = {ch:guessStr[i], state:'absent'};
    }
  }

  result.forEach(r=>{
    const rank = {absent:0, present:1, correct:2};
    const cur = wState.keyStates[r.ch];
    if(!cur || rank[r.state]>rank[cur]) wState.keyStates[r.ch] = r.state;
  });

  wState.guesses.push({guess:guessStr, result});
  wState.current = '';
  wState.row += 1;

  renderWordleGrid();
  renderWordleKeyboard();

  if(guessStr===answer){
    wState.done = true;
    setWMsg('Correct! The word was ' + answer + '.');
    setTimeout(()=>showMessageBox('WORDLE.EXE', 'Congratulations. You solved it in '+wState.row+' guess(es).\n\nThe word was: '+answer, 'exe'), 200);
  } else if(wState.row>=6){
    wState.done = true;
    setWMsg('Out of guesses.');
    setTimeout(()=>showFailBox(), 200);
  } else {
    setWMsg('');
  }
}

function resetWordleGame(){
  if(!wState) return;
  const answer = WORDS[Math.floor(Math.random()*WORDS.length)];
  wState.answer = answer;
  wState.guesses = [];
  wState.current = '';
  wState.row = 0;
  wState.done = false;
  wState.keyStates = {};
  setWMsg('');
  renderWordleGrid();
  renderWordleKeyboard();
}

function showFailBox(){
  const overlay = document.createElement('div');
  overlay.className = 'msgbox-overlay';

  const box = document.createElement('div');
  box.className = 'msgbox';
  box.style.left = '50%';
  box.style.top = '38%';
  box.style.transform = 'translate(-50%,-50%)';

  box.innerHTML = `
    <div class="titlebar">
      <div class="ttext">WORDLE.EXE</div>
      <div class="tbtn mb-close">×</div>
    </div>
    <div class="msgbox-body">
      <img src="${ICON_URLS.exe}" width="32" height="32">
      <div class="txt">You can't be serious.</div>
    </div>
    <div class="msgbox-buttons">
      <button class="btn95 mb-mybad">My bad</button>
    </div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const close = ()=>overlay.remove();
  box.querySelector('.mb-close').onclick = close;
  box.querySelector('.mb-mybad').onclick = ()=>{ close(); resetWordleGame(); };
}

function showWFailBox(){
  showFailBox();
}

document.addEventListener('keydown', (e)=>{
  if(!openWindows['wordle'] || openWindows['wordle'].minimized) return;
  if(e.key==='Enter') wordleKey('ENTER');
  else if(e.key==='Backspace') wordleKey('BACKSPACE');
  else if(/^[a-zA-Z]$/.test(e.key)) wordleKey(e.key.toUpperCase());
});