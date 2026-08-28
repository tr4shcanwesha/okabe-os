/* ============================================================
  IMAGE VIEWER
  ============================================================ */
function openImage(winId, image){
  const w = openWindows[winId].el;
  const isEvidence = isEvidenceFile(image);
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
      <button class="btn95 image-back" type="button" onclick="closeImage('${winId}')">&laquo; Back</button>
      ${isEvidence ? '<button class="btn95 image-lamp-source" type="button" aria-label="Toggle lamp" title="Toggle lamp" onclick="toggleImageLamp(\'' + winId + '\')"><span aria-hidden="true">💡</span></button>' : ''}
      <span class="image-name">${image.name}</span>
    </div>
    <div class="image-canvas sunken ${isEvidence ? 'evidence-canvas' : ''}">
      <img class="image-preview" src="${image.src}" alt="${image.name}">
      ${isEvidence ? '<div class="image-darkness" aria-hidden="true"></div><div class="image-lamps"></div>' : ''}
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
  let previousCanvasWidth = 0;
  let previousCanvasHeight = 0;

  const updateLampLight = ()=>{
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;

    if(previousCanvasWidth && previousCanvasHeight &&
       (canvasWidth !== previousCanvasWidth || canvasHeight !== previousCanvasHeight)){
      const relativeX = (lamp.offsetLeft + lamp.offsetWidth / 2) / previousCanvasWidth;
      const relativeY = (lamp.offsetTop + lamp.offsetHeight / 2) / previousCanvasHeight;
      const maxLeft = Math.max(0, canvasWidth - lamp.offsetWidth);
      const maxTop = Math.max(0, canvasHeight - lamp.offsetHeight);
      lamp.style.left = `${Math.max(0, Math.min(maxLeft, relativeX * canvasWidth - lamp.offsetWidth / 2))}px`;
      lamp.style.top = `${Math.max(0, Math.min(maxTop, relativeY * canvasHeight - lamp.offsetHeight / 2))}px`;
    }

    const x = lamp.offsetLeft + lamp.offsetWidth / 2;
    const y = lamp.offsetTop + lamp.offsetHeight / 2;
    const radius = Math.min(canvasWidth, canvasHeight) * 2 / 9;
    darkness.style.setProperty('--lamp-x', `${x}px`);
    darkness.style.setProperty('--lamp-y', `${y}px`);
    darkness.style.setProperty('--lamp-radius', `${radius}px`);
    previousCanvasWidth = canvasWidth;
    previousCanvasHeight = canvasHeight;
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
  if(listEl) listEl.style.display = '';
}

function closeDoc(winId){
  const w = openWindows[winId].el;
  const viewer = w.querySelector('.doc-view');

  if(viewer){
    viewer.style.display = 'none';
  }

  const listEl = document.getElementById(winId + '-list');

  if(listEl){
    listEl.style.display = '';
  }
}