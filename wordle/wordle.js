/* ============================================================
   START.EXE DESKTOP ICON  ->  WORDLE
   This file relies on the core OS globals loaded by /script.js:
   addDesktopIcon, openWindow, openWindows, showMessageBox, ICON_URLS
   ============================================================ */
addDesktopIcon('startexe','exe','Wordle', ()=>showWordleIntro());

function showWordleIntro(){
  if(sessionStorage.getItem('okabe.wordle.introShown')==='true'){
    openWordle();
    return;
  }

  sessionStorage.setItem('okabe.wordle.introShown','true');

  const messages = [
    'Okabe left no explanation.',
    'Only a blank field where the experiment\'s name should be.',
    'Perhaps you can restore it.'
  ];
  const overlay = document.createElement('div');
  overlay.className = 'msgbox-overlay wordle-intro';
  document.body.appendChild(overlay);

  messages.forEach((message, index)=>{
    const box = document.createElement('div');
    box.className = 'msgbox';
    box.style.left = `calc(50% - 140px + ${index * 28}px)`;
    box.style.top = `calc(38% + ${index * 24}px)`;
    box.style.zIndex = String(index + 1);
    box.innerHTML = `
      <div class="titlebar">
        <div class="ttext">WORDLE.EXE</div>
      </div>
      <div class="msgbox-body">
        <img src="${ICON_URLS.exe}" width="32" height="32" alt="">
        <div class="txt">${message}</div>
      </div>
      <div class="msgbox-buttons">
        <button class="btn95 intro-ok" type="button">OK</button>
      </div>
    `;
    overlay.appendChild(box);

    box.querySelector('.intro-ok').onclick = ()=>{
      box.querySelector('.intro-ok').disabled = true;
      if(index === messages.length - 1){
        overlay.remove();
        wordleIntroActive = false;
        openWordle();
      } else {
        showNextWordleIntro(box, index + 1);
      }
    };
  });

  const boxes = overlay.querySelectorAll('.msgbox');
  boxes.forEach((box, index)=>{
    if(index > 0) box.style.display = 'none';
  });
}

function showNextWordleIntro(previousBox, index){
  const overlay = previousBox.parentElement;
  const boxes = overlay.querySelectorAll('.msgbox');
  boxes[index].style.display = 'block';
  boxes[index].style.zIndex = String(index + 1);
}

const WORDLE_STORAGE_KEY = 'okabe.wordle.state';

let wState = null;

function loadWordleState(answer){
  try {
    const saved = JSON.parse(localStorage.getItem(WORDLE_STORAGE_KEY));
    if(
      saved && saved.answer === answer && Array.isArray(saved.guesses) &&
      typeof saved.current === 'string' && typeof saved.row === 'number' &&
      Number.isInteger(saved.tries) && saved.tries >= 0 &&
      typeof saved.done === 'boolean' && typeof saved.win === 'boolean' &&
      saved.keyStates && typeof saved.keyStates === 'object'
    ){
      return saved;
    }
  } catch(error){
    localStorage.removeItem(WORDLE_STORAGE_KEY);
  }
  return null;
}

function saveWordleState(){
  if(wState) localStorage.setItem(WORDLE_STORAGE_KEY, JSON.stringify(wState));
}

function openWordle(){
  if(openWindows['wordle']){ restoreWindow('wordle'); return; }
  const answer = "SPLIT"; // can be changed later
  if(!wState || !wState.win){
    wState = loadWordleState(answer) || { answer, guesses:[], current:'', row:0, tries:0, done:false, win:false, keyStates:{} };
    saveWordleState();
  }
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
    status:'The experiment has a name. Find it.',
    bodyHTML: body
  });
  renderWordleGrid();
  renderWordleKeyboard();
  if(wState.win) setWMsg('Correct! The word was ' + wState.answer + '.');

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
  wState.tries += 1;
  
  renderWordleGrid();
  renderWordleKeyboard();

  if(guessStr===answer){
    wState.done = true;
    wState.win = true;
    setWMsg('Correct! The word was ' + answer + '.');
    setTimeout(()=>showMessageBox('WORDLE.EXE', 'Congratulations. You solved it in '+wState.tries+' guess(es).\n\nThe word was: '+answer, 'exe'), 200);
  } else if(wState.row>=6){
    wState.done = true;
    setTimeout(()=>{
      resetWordleGame();
      showFailBox();
    }, 200);
  } else {
    setWMsg('');
  }
  saveWordleState();
}

function resetWordleGame(){
  if(!wState) return;
  const answer = wState.answer;
  wState.answer = answer;
  wState.guesses = [];
  wState.current = '';
  wState.row = 0;
  wState.done = false;
  wState.win = false;
  wState.keyStates = {};
  saveWordleState();
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
  box.querySelector('.mb-mybad').onclick = close;
}

document.addEventListener('keydown', (e)=>{
  if(!openWindows['wordle'] || openWindows['wordle'].minimized) return;
  if(e.key==='Enter') wordleKey('ENTER');
  else if(e.key==='Backspace') wordleKey('BACKSPACE');
  else if(/^[a-zA-Z]$/.test(e.key)) wordleKey(e.key.toUpperCase());
});