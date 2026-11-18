/* =========================================================
   CONFIGURACIÓN – edita aquí invitados, preguntas y actividades
   ========================================================= */
const CONFIG = {
  formspree: 'https://formspree.io/f/mqpqpyaq',
  fechaPosada: '2026-11-21T18:00:00-06:00', // 21 nov 2026, 6:00 PM hora de Monterrey
  mapa: 'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent('Novelda 105, Ancestra, San Nicolás de los Garza, Nuevo León'),

  invitados: ['Leonardo', 'Aldo', 'Andres', 'Ariadna', 'Carlo', 'Carlos', 'Daena', 'Denisse', 'Diego',
    'Estrella', 'Fernanda', 'Jair', 'Josue', 'Piño', 'David', 'Ricardo', 'Stefani', 'Marisol', 'Yuli'],

  // dupla: true → se eligen 2 personas
  preguntas: [
    { titulo: 'EL SUERTUDO', pregunta: '¿La persona que nunca estudiaba para los exámenes?' },
    { titulo: 'LA MANO ARRIBA', pregunta: '¿La persona más participativa en clase?' },
    { titulo: 'PINOCHO DEL AÑO', pregunta: '¿La persona más mentirosa?' },
    { titulo: 'EL ALMA DEL GRUPO', pregunta: '¿La persona más chistosa?' },
    { titulo: 'EL CONSENTIDO', pregunta: '¿Quién siempre se ganaba a los maestros?' },
    { titulo: 'EL FANTASMA', pregunta: '¿La persona que más faltaba a clases?' },
    { titulo: 'EL ALMA DE LA FIESTA', pregunta: '¿La persona más extrovertida?' },
    { titulo: 'MODO AVIÓN', pregunta: '¿La persona más introvertida?' },
    { titulo: 'EL INFLUENCER DE LA FACULTAD', pregunta: '¿La persona que todo mundo conocía?' },
    { titulo: 'PIES DE ORO', pregunta: '¿La persona más bailadora?' },
    { titulo: 'EL CREATIVO', pregunta: '¿La persona más ocurrente?' },
    { titulo: 'EL PODCAST', pregunta: '¿La persona que te platica 20 temas en una sola plática?' },
    { titulo: 'EL CONDUCTOR DESIGNADO', pregunta: '¿La persona que conduce más tranquilo?' },
    { titulo: 'CORRELACIÓN NEGATIVA', pregunta: '¿La dupla que es agua y aceite?', dupla: true },
    { titulo: 'CORRELACIÓN PERFECTA', pregunta: '¿La dupla que es uña y mugre?', dupla: true },
  ],

  comida: ['Puré de papa', 'Espagueti verde', 'Pechugas cordon bleu', 'Postre de manzana'],

  actividades: [
    { ico: '🪅', nombre: 'Piñata' },
    { ico: '🎁', nombre: 'Juegos con premios de regalos chuscos' },
    { ico: '🔄', nombre: 'Intercambio de regalos' },
    { ico: '🏆', nombre: 'Premiación: ¡habrá premios chuscos para los ganadores!' },
    { ico: '🎶', nombre: 'Y muchas actividades más...' },
  ],
};

/* =========================================================
   Decoración: luces y nieve
   ========================================================= */
(function luces() {
  const cont = document.querySelector('.luces');
  const n = Math.ceil(window.innerWidth / 70);
  for (let i = 0; i < n; i++) cont.appendChild(document.createElement('span'));
})();

(function nieve() {
  const c = document.getElementById('nieve');
  const ctx = c.getContext('2d');
  let copos = [];
  function size() {
    c.width = innerWidth; c.height = innerHeight;
    const total = Math.min(90, Math.floor(innerWidth / 9));
    copos = Array.from({ length: total }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 2.6 + 1, v: Math.random() * .8 + .4, d: Math.random() * Math.PI * 2,
    }));
  }
  function loop() {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    for (const f of copos) {
      f.y += f.v; f.d += .01; f.x += Math.sin(f.d) * .4;
      if (f.y > c.height + 5) { f.y = -5; f.x = Math.random() * c.width; }
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  addEventListener('resize', size);
  size(); loop();
})();

/* =========================================================
   Mapa y contador
   ========================================================= */
document.getElementById('btnMapa').href = CONFIG.mapa;

(function contador() {
  const meta = new Date(CONFIG.fechaPosada).getTime();
  const pad = n => String(n).padStart(2, '0');
  const el = id => document.getElementById(id);
  function tick() {
    let ms = meta - Date.now();
    if (ms <= 0) {
      el('contador').hidden = true; el('contadorFin').hidden = false; return;
    }
    const s = Math.floor(ms / 1000);
    el('cDias').textContent = pad(Math.floor(s / 86400));
    el('cHoras').textContent = pad(Math.floor(s % 86400 / 3600));
    el('cMin').textContent = pad(Math.floor(s % 3600 / 60));
    el('cSeg').textContent = pad(s % 60);
    setTimeout(tick, 1000);
  }
  tick();
})();

/* =========================================================
   Acceso con código (descifra el sorteo)
   ========================================================= */
const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};

async function abrirConCodigo(codigo) {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey('raw', enc.encode(codigo), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64(SORTEO.salt), iterations: SORTEO.iter, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  for (const e of SORTEO.entradas) {
    try {
      const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(e.iv) }, key, b64(e.ct));
      return JSON.parse(new TextDecoder().decode(pt));
    } catch { /* no es esta entrada */ }
  }
  return null;
}

const inputs = [...document.querySelectorAll('#digitos input')];
inputs.forEach((inp, i) => {
  inp.addEventListener('input', () => {
    inp.value = inp.value.replace(/\D/g, '').slice(-1);
    if (inp.value && i < 3) inputs[i + 1].focus();
    if (inputs.every(x => x.value)) document.getElementById('formCodigo').requestSubmit();
  });
  inp.addEventListener('keydown', e => {
    if (e.key === 'Backspace' && !inp.value && i > 0) inputs[i - 1].focus();
  });
  inp.addEventListener('paste', e => {
    const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 4);
    if (t.length) { e.preventDefault(); t.split('').forEach((d, j) => inputs[j] && (inputs[j].value = d)); inputs[Math.min(t.length, 3)].focus(); if (t.length === 4) document.getElementById('formCodigo').requestSubmit(); }
  });
});

let sesion = null; // { codigo, yo, das }
let ocupado = false;

document.getElementById('formCodigo').addEventListener('submit', async e => {
  e.preventDefault();
  if (ocupado) return;
  const codigo = inputs.map(x => x.value).join('');
  const err = document.getElementById('errorCodigo');
  const btn = document.getElementById('btnEntrar');
  if (!/^\d{4}$/.test(codigo)) { err.textContent = 'Escribe los 4 dígitos.'; return; }
  ocupado = true; btn.disabled = true; btn.textContent = 'ABRIENDO... 🎁'; err.textContent = '';
  const r = await abrirConCodigo(codigo);
  ocupado = false; btn.disabled = false; btn.textContent = 'ENTRAR';
  if (!r) {
    err.textContent = '❌ Código incorrecto, revisa e inténtalo de nuevo.';
    const d = document.getElementById('digitos');
    d.classList.remove('mal'); void d.offsetWidth; d.classList.add('mal');
    inputs.forEach(x => (x.value = '')); inputs[0].focus();
    return;
  }
  store.set('posada_codigo', codigo);
  mostrar({ codigo, ...r }, true);
});

function mostrar(s, desplazar) {
  sesion = s;
  document.getElementById('miNombre').textContent = s.yo;
  document.getElementById('suNombre').textContent = s.das;
  document.getElementById('acceso').hidden = true;
  document.getElementById('secreto').hidden = false;
  actualizarEstadoVoto();
  if (desplazar) document.getElementById('revelacion').scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('btnSalir').addEventListener('click', () => {
  store.del('posada_codigo');
  sesion = null;
  inputs.forEach(x => (x.value = ''));
  document.getElementById('secreto').hidden = true;
  document.getElementById('acceso').hidden = false;
  document.getElementById('acceso').scrollIntoView({ behavior: 'smooth' });
});

// Si ya había entrado antes en este celular, entra directo
(async () => {
  const guardado = store.get('posada_codigo');
  if (guardado) {
    const r = await abrirConCodigo(guardado);
    if (r) mostrar({ codigo: guardado, ...r }, false); else store.del('posada_codigo');
  }
})();

/* =========================================================
   Votación (Formspree)
   ========================================================= */
(function pintarPreguntas() {
  const cont = document.getElementById('preguntas');
  const nombres = [...CONFIG.invitados].sort((a, b) => a.localeCompare(b, 'es'));
  const opciones = nombres.map(n => `<option value="${n}">${n}</option>`).join('');
  const sel = (id, txt) => `<select id="${id}" required>
        <option value="" disabled selected>${txt}</option>${opciones}</select>`;
  cont.innerHTML = CONFIG.preguntas.map((p, i) => `
    <div class="pregunta">
      <p class="pregunta-titulo">🏆 ${p.titulo}</p>
      <label for="p${i}"><b>${i + 1}.</b> ${p.pregunta}</label>
      ${p.dupla
        ? `<div class="dupla">${sel('p' + i, 'Persona 1...')}<span class="dupla-y">&amp;</span>${sel('p' + i + 'b', 'Persona 2...')}</div>`
        : sel('p' + i, 'Elige a alguien...')}
    </div>`).join('');
})();

function actualizarEstadoVoto() {
  const yaVoto = sesion && store.get('posada_voto2_' + sesion.codigo);
  document.getElementById('formVotos').hidden = !!yaVoto;
  document.getElementById('yaVoto').hidden = !yaVoto;
}

document.getElementById('formVotos').addEventListener('submit', async e => {
  e.preventDefault();
  if (!sesion) return;
  const err = document.getElementById('errorVotos');
  const btn = document.getElementById('btnVotar');
  const datos = new FormData();
  datos.append('Código', sesion.codigo);
  datos.append('Persona que vota', sesion.yo);
  for (const [i, p] of CONFIG.preguntas.entries()) {
    const v1 = document.getElementById('p' + i).value;
    let valor = v1;
    if (p.dupla) {
      const v2 = document.getElementById('p' + i + 'b').value;
      if (v1 === v2) {
        err.textContent = `⚠️ En "${p.titulo}" elige a dos personas diferentes.`;
        document.getElementById('p' + i).closest('.pregunta').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      valor = `${v1} y ${v2}`;
    }
    datos.append(`${i + 1}. ${p.titulo}`, valor);
  }
  datos.append('_subject', `🗳️ Votos de ${sesion.yo} (código ${sesion.codigo})`);

  btn.disabled = true; btn.textContent = 'ENVIANDO... 🎅'; err.textContent = '';
  try {
    const res = await fetch(CONFIG.formspree, { method: 'POST', body: datos, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(res.status);
    store.set('posada_voto2_' + sesion.codigo, new Date().toISOString());
    actualizarEstadoVoto();
    document.getElementById('yaVoto').scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch {
    err.textContent = '⚠️ No se pudieron enviar tus votos. Revisa tu internet e inténtalo otra vez.';
  } finally {
    btn.disabled = false; btn.textContent = 'ENVIAR MIS VOTOS';
  }
});

/* =========================================================
   Menú
   ========================================================= */
document.querySelectorAll('.lista-menu').forEach(ul => {
  ul.innerHTML = CONFIG.comida.map(c => `<li>${c}</li>`).join('');
});

/* =========================================================
   Actividades
   ========================================================= */
document.getElementById('listaActividades').innerHTML = CONFIG.actividades
  .map(a => `<li><span class="ico">${a.ico}</span><span>${a.nombre}</span></li>`).join('');
