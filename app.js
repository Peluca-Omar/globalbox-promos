const $ = selector => document.querySelector(selector);
const canvas = $('#canvas');
const ctx = canvas.getContext('2d');
const input = $('#image-input');
const logoInput = $('#logo-input');
const dropZone = $('#drop-zone');
const analyzeButton = $('#analyze');
const downloadButton = $('#download');
const status = $('#status');
const statusText = $('#status-text');
const progress = $('#progress');
const progressBar = $('#progress-bar');
const installButton = $('#install-app');
const fields = { product: $('#product'), oldPrice: $('#old-price'), newPrice: $('#new-price'), phrase: $('#phrase') };

const phrases = [
  '¡PONTE PILAS!',
  '¡DÍAS DE PROMOS!',
  '¡APROVECHA LA OFERTA!',
  '¡OFERTA DE TEMPORADA!',
  '¡PRECIO QUE NO SE REPITE!',
  '¡CORRE POR EL TUYO!',
  '¡HOY ES DÍA DE AHORRAR!',
  '¡TU FAVORITO A MEJOR PRECIO!',
  '¡NO DEJES PASAR ESTA OFERTA!',
  '¡PROMO POR TIEMPO LIMITADO!',
  '¡MENOS PRECIO, MÁS ESTILO!',
  '¡EL MOMENTO DE COMPRAR ES HOY!',
  '¡LLEGÓ LA PROMO QUE ESPERABAS!',
  '¡AHORRA EN GRANDE!',
  '¡DATE ESE GUSTITO!',
  '¡OFERTA IMPERDIBLE!',
  '¡PRECIOS QUE ENAMORAN!',
  '¡TU COMPRA IDEAL ESTÁ AQUÍ!',
  '¡MÁS POR MENOS!',
  '¡ESTRENA SIN GASTAR DE MÁS!',
  '¡ÚLTIMOS DÍAS DE OFERTA!',
  '¡PRECIO ESPECIAL PARA TI!',
  '¡HAZLO TUYO HOY!',
  '¡DESCUENTO QUE VALE LA PENA!',
  '¡APROVECHA ANTES QUE SE AGOTE!',
  '¡RENUEVA TU ESTILO POR MENOS!',
  '¡LA MEJOR OFERTA ESTÁ AQUÍ!',
  '¡COMPRA MÁS, AHORRA MÁS!',
  '¡TU OPORTUNIDAD DE AHORRAR!',
  '¡PROMO FLASH!',
  '¡BAJAMOS EL PRECIO PARA TI!',
  '¡LO QUIERES, LO TIENES!',
  '¡OFERTA ESPECIAL DE HOY!',
  '¡NO TE QUEDES SIN EL TUYO!',
  '¡PRECIOS BAJOS, GRANDES SONRISAS!'
];
const themes = {
  impact: { bg:'#071b33', accent:'#ffc52f', ink:'#071b33', light:'#ffffff' },
  hot: { bg:'#ef5a46', accent:'#fff0d4', ink:'#492018', light:'#ffffff' },
  fresh: { bg:'#0b5346', accent:'#cfe957', ink:'#093e35', light:'#ffffff' }
};
let sourceImage = null;
let sourceData = '';
let brandLogo = null;
let selectedStyle = 'impact';
let selectedFormat = 'post';
let installPrompt = null;

phrases.forEach(value => fields.phrase.add(new Option(value, value)));

function setStatus(message, state = '') {
  status.className = `status ${state}`;
  statusText.textContent = message;
}

function money(value) { return `$${Number(value || 0).toFixed(2)}`; }
function discount() {
  const oldPrice = Number(fields.oldPrice.value);
  const newPrice = Number(fields.newPrice.value);
  return oldPrice > newPrice && newPrice >= 0 ? Math.round((1 - newPrice / oldPrice) * 100) : 0;
}

function drawText(value, x, y, size, color, weight = 800, align = 'left') {
  ctx.save();
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.font = `${weight} ${size}px Montserrat, Arial, sans-serif`;
  ctx.fillText(value, x, y);
  ctx.restore();
}

function roundedRect(x, y, width, height, radius, color) {
  ctx.beginPath(); ctx.roundRect(x, y, width, height, radius); ctx.fillStyle = color; ctx.fill();
}

function drawOldPrice(value, centerX, baselineY, maxWidth, color) {
  const size = fit(value, maxWidth, 39, 27);
  ctx.save();
  ctx.font = `800 ${size}px Montserrat, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.fillText(value, centerX, baselineY);
  const width = Math.min(ctx.measureText(value).width + 16, maxWidth);
  ctx.strokeStyle = '#e34f42';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(centerX - width / 2, baselineY - size * .38);
  ctx.lineTo(centerX + width / 2, baselineY - size * .38);
  ctx.stroke();
  ctx.restore();
}

function drawImageCover(image, x, y, width, height) {
  const scale = Math.max(width / image.width, height / image.height);
  const w = image.width * scale; const h = image.height * scale;
  ctx.drawImage(image, x + (width - w) / 2, y + (height - h) / 2, w, h);
}

function drawBrand(theme) {
  const centerX = 92; const centerY = 82; const radius = 42;
  ctx.save();
  ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#fff'; ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
  if (brandLogo) drawImageCover(brandLogo, centerX - radius, centerY - radius, radius * 2, radius * 2);
  else {
    ctx.fillStyle = theme.accent; ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
    drawText('G', centerX, centerY + 15, 43, theme.ink, 900, 'center');
  }
  ctx.restore();
  ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.stroke(); ctx.restore();

  drawText('GLOBALBOX', 153, 80, 28, theme.light, 900);
  ctx.save(); ctx.font = '900 28px Montserrat, Arial, sans-serif'; const brandWidth = ctx.measureText('GLOBALBOX').width; ctx.restore();
  drawText('.EC', 153 + brandWidth + 3, 80, 19, theme.accent, 900);
  drawText('COURIER INTERNACIONAL', 154, 105, 12, theme.light, 700);
}

function drawContacts(theme) {
  // Subtle dark cards keep both contacts legible across every color theme.
  ctx.save();
  ctx.globalAlpha = .82; roundedRect(650, 53, 165, 54, 13, '#06172b'); roundedRect(827, 53, 160, 54, 13, '#06172b');
  ctx.globalAlpha = .42; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(650, 53, 165, 54, 13); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(827, 53, 160, 54, 13); ctx.stroke();
  ctx.restore();

  ctx.save(); ctx.fillStyle = '#25d366'; ctx.beginPath(); ctx.arc(674, 80, 18, 0, Math.PI * 2); ctx.fill();
  const whatsappPath = new Path2D('M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93a7.898 7.898 0 0 0-2.327-5.607zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.25a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.198-.099-1.17-.578-1.353-.646-.182-.066-.315-.099-.445.099-.133.198-.513.646-.63.779-.116.132-.232.148-.43.05-.198-.1-.836-.308-1.592-.985-.59-.525-.985-1.174-1.101-1.372-.116-.198-.013-.305.087-.404.09-.089.198-.232.297-.348.1-.116.133-.198.199-.33.066-.133.033-.249-.017-.348-.05-.099-.445-1.074-.61-1.47-.16-.389-.323-.335-.445-.34-.116-.007-.248-.007-.38-.007a.729.729 0 0 0-.529.248c-.182.198-.693.678-.693 1.654 0 .977.71 1.916.81 2.049.098.132 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.906.13 1.248.08.38-.058 1.171-.48 1.338-.943.164-.463.164-.86.116-.943-.05-.083-.182-.132-.38-.232z');
  ctx.translate(660.5, 66.5); ctx.scale(1.7, 1.7); ctx.fillStyle = '#fff'; ctx.fill(whatsappPath); ctx.restore();
  drawText('0939669867', 700, 86, 13, '#ffffff', 800);

  const gradient = ctx.createLinearGradient(839, 64, 871, 96);
  gradient.addColorStop(0, '#7c3aed'); gradient.addColorStop(.5, '#e84072'); gradient.addColorStop(1, '#f59e0b');
  roundedRect(839, 64, 32, 32, 9, gradient);
  ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(846, 71, 18, 18, 5); ctx.stroke();
  ctx.beginPath(); ctx.arc(855, 80, 4.5, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(862, 73, 1.8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  drawText('@globalbox.ec', 879, 85, 11, '#ffffff', 800);
}

function fit(value, maxWidth, startSize, minSize = 24) {
  let size = startSize;
  do { ctx.font = `900 ${size}px Montserrat, Arial, sans-serif`; size -= 2; } while (ctx.measureText(value).width > maxWidth && size > minSize);
  return size + 2;
}

function render() {
  const story = selectedFormat === 'story';
  const width = 1080; const height = story ? 1920 : 1080; const theme = themes[selectedStyle];
  canvas.width = width; canvas.height = height;
  ctx.fillStyle = theme.bg; ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = theme.accent; ctx.beginPath(); ctx.arc(width + 30, 50, 310, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = .09; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-80, height - 70, 300, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;

  drawBrand(theme);
  drawContacts(theme);

  const imageY = story ? 175 : 145;
  const imageHeight = story ? 980 : 460;
  roundedRect(58, imageY, 964, imageHeight, 22, '#e8e9e6');
  if (sourceImage) {
    ctx.save(); ctx.beginPath(); ctx.roundRect(58, imageY, 964, imageHeight, 22); ctx.clip();
    drawImageCover(sourceImage, 58, imageY, 964, imageHeight); ctx.restore();
  } else {
    drawText('TU IMAGEN APARECERÁ AQUÍ', 540, imageY + imageHeight / 2, 27, '#87909a', 700, 'center');
  }

  const infoY = imageY + imageHeight + (story ? 105 : 52);
  const product = fields.product.value.trim().toUpperCase() || 'PRODUCTO EN OFERTA';
  drawText(fields.phrase.value, 60, infoY, 24, theme.accent, 900);
  drawText(product, 58, infoY + (story ? 78 : 59), fit(product, 945, story ? 61 : 47), theme.light, 900);

  const priceY = infoY + (story ? 160 : 93);
  const priceHeight = story ? 220 : 190;
  roundedRect(58, priceY, 500, priceHeight, 18, theme.accent);
  roundedRect(578, priceY, 218, priceHeight, 18, theme.light);
  roundedRect(816, priceY, 206, priceHeight, 18, theme.light);

  drawText('PRECIO PROMO', 91, priceY + (story ? 55 : 45), 18, theme.ink, 900);
  const currentValue = money(fields.newPrice.value);
  drawText(currentValue, 91, priceY + (story ? 157 : 137), fit(currentValue, 430, story ? 76 : 68), theme.ink, 900);

  drawText('ANTES', 687, priceY + (story ? 55 : 45), 15, '#67727e', 800, 'center');
  drawOldPrice(money(fields.oldPrice.value), 687, priceY + (story ? 137 : 121), 180, theme.ink);

  drawText(`${discount()}%`, 919, priceY + (story ? 112 : 96), story ? 55 : 49, theme.ink, 900, 'center');
  drawText('DESCUENTO', 919, priceY + (story ? 153 : 136), 13, theme.ink, 900, 'center');

  const footerLineY = story ? height - 118 : height - 92;
  ctx.save(); ctx.globalAlpha = .35; ctx.strokeStyle = theme.accent; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(260, footerLineY); ctx.lineTo(820, footerLineY); ctx.stroke(); ctx.restore();
  drawText('LO QUE QUIERAS, TE LO TRAEMOS', 540, story ? height - 62 : height - 43, 16, theme.light, 700, 'center');
}

function parsePrice(raw) {
  let value = raw.replace(/[^0-9.,]/g, '');
  if (value.includes(',') && value.includes('.')) value = value.lastIndexOf(',') > value.lastIndexOf('.') ? value.replace(/\./g, '').replace(',', '.') : value.replace(/,/g, '');
  else value = value.replace(',', '.');
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function extractPromotion(text) {
  const clean = text.replace(/[|]/g, 'I');
  const lines = clean.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const candidates = [];
  const pricePattern = /(?:\$|USD\s*)?\s*(\d{1,4}(?:[.,]\d{1,2})?)/gi;
  lines.forEach((line, lineIndex) => {
    let match;
    while ((match = pricePattern.exec(line))) {
      const value = parsePrice(match[1]);
      const afterNumber = line.slice(match.index + match[0].length).trimStart();
      const looksLikePercentage = afterNumber.startsWith('%');
      const looksLikeYear = Number.isInteger(value) && value >= 1900 && value <= 2100;
      if (value !== null && value > 0 && value < 10000 && !looksLikePercentage && !looksLikeYear) {
        candidates.push({ value, line: line.toLowerCase(), lineIndex });
      }
    }
  });

  const unique = [...new Map(candidates.map(item => [item.value, item])).values()];
  const oldWords = /antes|regular|normal|era|pvp|precio anterior|tachado/;
  const newWords = /ahora|oferta|promo|especial|desde|hoy|sale/;
  const oldMatch = unique.find(item => oldWords.test(item.line));
  const newMatch = unique.find(item => newWords.test(item.line) && item !== oldMatch);
  const sorted = unique.map(item => item.value).sort((a, b) => b - a);
  const oldPrice = oldMatch?.value ?? sorted[0] ?? null;
  const newPrice = newMatch?.value ?? sorted.find(value => value < oldPrice) ?? sorted[1] ?? null;

  const blocked = /\$|\d|oferta|promo|descuento|antes|ahora|usd|www|@|globalbox|aprovecha/i;
  const productLine = lines
    .filter(line => line.length >= 4 && line.length <= 35 && /[a-záéíóúñ]{3}/i.test(line) && !blocked.test(line))
    .sort((a, b) => b.length - a.length)[0];
  return { oldPrice, newPrice, product: productLine };
}

async function analyzeImage() {
  if (!sourceData) return;
  if (!window.Tesseract) { setStatus('No se pudo cargar el lector gratuito. Revisa tu conexión a internet.', 'error'); return; }
  analyzeButton.disabled = true; progress.hidden = false; progressBar.style.width = '3%';
  setStatus('Leyendo textos y precios de la imagen...', 'reading');
  try {
    const result = await Tesseract.recognize(sourceData, 'spa', { logger: event => {
      if (event.status === 'recognizing text') progressBar.style.width = `${Math.max(5, Math.round(event.progress * 100))}%`;
    }});
    const found = extractPromotion(result.data.text);
    if (found.oldPrice !== null) fields.oldPrice.value = found.oldPrice.toFixed(2);
    if (found.newPrice !== null) fields.newPrice.value = found.newPrice.toFixed(2);
    if (found.product) fields.product.value = found.product.toUpperCase();
    fields.phrase.value = phrases[Math.floor(Math.random() * phrases.length)];
    render();
    const pricesFound = found.oldPrice !== null && found.newPrice !== null;
    setStatus(pricesFound ? `Listo: detecté ${money(found.oldPrice)} antes y ${money(found.newPrice)} ahora.` : 'Análisis listo. Revisa los precios porque no pude reconocer ambos con seguridad.', pricesFound ? 'success' : 'error');
  } catch (error) {
    setStatus('No pude leer esta imagen. Prueba con una foto más clara o corrige los datos manualmente.', 'error');
  } finally {
    analyzeButton.disabled = false; progress.hidden = true; progressBar.style.width = '0'; downloadButton.disabled = false;
  }
}

function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) { setStatus('Selecciona un archivo de imagen válido.', 'error'); return; }
  if (file.size > 10 * 1024 * 1024) { setStatus('La imagen supera el máximo de 10 MB.', 'error'); return; }
  const reader = new FileReader();
  reader.onload = () => {
    sourceData = reader.result;
    sourceImage = new Image();
    sourceImage.onload = () => { render(); downloadButton.disabled = false; analyzeImage(); };
    sourceImage.src = sourceData;
  };
  reader.readAsDataURL(file);
}

input.addEventListener('change', event => loadFile(event.target.files[0]));
logoInput.addEventListener('change', event => {
  const file = event.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = () => {
    brandLogo = new Image();
    brandLogo.onload = render;
    brandLogo.src = reader.result;
    $('#logo-name').textContent = file.name;
  };
  reader.readAsDataURL(file);
});
dropZone.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') input.click(); });
['dragenter','dragover'].forEach(type => dropZone.addEventListener(type, event => { event.preventDefault(); dropZone.classList.add('dragging'); }));
['dragleave','drop'].forEach(type => dropZone.addEventListener(type, event => { event.preventDefault(); dropZone.classList.remove('dragging'); }));
dropZone.addEventListener('drop', event => loadFile(event.dataTransfer.files[0]));
document.addEventListener('paste', event => { const file = [...event.clipboardData.files].find(item => item.type.startsWith('image/')); if (file) loadFile(file); });
analyzeButton.addEventListener('click', analyzeImage);

document.querySelectorAll('.style').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.style').forEach(item => item.classList.remove('selected')); button.classList.add('selected'); selectedStyle = button.dataset.style; render();
}));
document.querySelectorAll('.format').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.format').forEach(item => item.classList.remove('selected')); button.classList.add('selected'); selectedFormat = button.dataset.format;
  $('#size-label').textContent = selectedFormat === 'story' ? '1080 × 1920 PX' : '1080 × 1080 PX'; render();
}));
Object.values(fields).forEach(field => field.addEventListener('input', render));
downloadButton.addEventListener('click', () => {
  render(); const link = document.createElement('a'); link.download = `globalbox-promo-${selectedFormat}.png`; link.href = canvas.toDataURL('image/png'); link.click();
});

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault(); installPrompt = event; installButton.hidden = false;
});
installButton.addEventListener('click', async () => {
  if (installPrompt) {
    installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; installButton.hidden = true;
  } else {
    alert('En iPhone o iPad: toca Compartir y luego “Agregar a inicio”.');
  }
});
window.addEventListener('appinstalled', () => { installButton.hidden = true; });
if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !navigator.standalone) installButton.hidden = false;
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
render();
