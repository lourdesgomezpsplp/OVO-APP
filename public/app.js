/* =====================================================================
   UTILIDADES
   ===================================================================== */
Const esc = s => String(s == null ¿ ‘’ : s).replace(/[&<>”’]/g, c => ({‘&’:’&amp;’,’<’:’&lt;’,’>’:’&gt;’,’”’:’&quot;’,”’”:’&#39;’}[c]));
Const avg = a => a.length ¿ a.reduce((x, y) => x + y, 0) / a.length : null;
Const fmt1 = n => (Math.round(n * 10) / 10).toString().replace(‘.’, ‘,’);
Const list = arr => arr.length <= 1 ¿ (arr[0] || ‘’) : arr.slice(0, -1).join(‘, ‘) + ‘ y ‘ + arr[arr.length – 1];
Const lvl = p => p >= 75 ¿ ‘alto’ : (p >= 40 ¿ ‘medio’ : ‘bajo’);
Const lvlWord = p => p >= 75 ¿ ‘alto’ : (p >= 40 ¿ ‘medio’ : ‘bajo’);

/* =====================================================================
   PERSISTENCIA — vía API propia (Express + PostgreSQL en el servidor).
   No se usa localStorage como fuente de verdad: cada caso se guarda en
   El servidor y se trae desde ahí en cualquier dispositivo donde se
   Inicie sesión con la misma contraseña.
   ===================================================================== */
Let db = {cases: {}};
Let authed = false;
Const pending = {};    // id de caso -> timeout de guardado pendiente
Const writing = {};    // id de caso -> Promise de escritura en curso (para no solapar)

Async function api(url, opts) {
  Const r = await fetch(url, Object.assign({credentials: ‘same-origin’}, opts));
  Return r;
}
Async function checkSession() {
  Try { const r = await api(‘/api/session’); if (r.ok) { const j = await r.json(); ui.me = j.user || null; } return r.ok; } catch € { return false; }
}
Async function loadCases() {
  Const r = await api(‘/api/cases’);
  If (¡r.ok) throw new Error(‘no autorizado’);
  Const arr = await r.json();
  Db.cases = {};
  Arr.forEach(c => { db.cases[c.id] = ensure©; });
}
Async function persist(id) {
  Const c = db.cases[id]; if (¡c) return;
  Const prev = writing[id] || Promise.resolve();
  Const job = prev.then(() => api(‘/api/cases/’ + id, {method: ‘PUT’, headers: {‘Content-Type’: ‘application/json’}, body: JSON.stringify©}))
    .then(r => { if (¡r.ok) throw new Error(); })
    .catch(() => toast(‘No se pudo guardar. Revisá tu conexión e intentá de nuevo.’));
  Writing[id] = job; return job;
}
Function saveSoon() { const id = ui.id; if (¡id) return; clearTimeout(pending[id]); pending[id] = setTimeout(() => persist(id), 500); }
Function save() { const id = ui.id; if (¡id) return Promise.resolve(); clearTimeout(pending[id]); return persist(id); }
Async function deleteCase(id) {
  Try { const r = await api(‘/api/cases/’ + id, {method: ‘DELETE’}); if (¡r.ok) throw new Error(); }
  Catch € { toast(‘No se pudo borrar el caso en el servidor.’); }
}

Function blankCase(name) {
  Return {
    Id: ‘c’ + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    Created: Date.now(),
    Ficha: {nombre: name || ‘’, edad: ‘’, sexo: ‘’, curso: ‘’, inst: ‘’, situacion: ‘’, subj: {}, extra: ‘’, apoyo: ‘’, carreras: [0,1,2,3,4].map(() => ({c: ‘’, m: ‘’}))},
    Ans: {cip: Array(114).fill(null), iami: Array(69).fill(null), hol: Array(90).fill(null), cha: Array(98).fill(null), aut: Array(86).fill(null)},
    Quien: Array(9).fill(‘’),
    Auto: {pasado: ‘’, presente: ‘’, futuro: ‘’, soy: ‘’, otros: ‘’, quiero: ‘’},
    Desi: [0,1,2,3,4].map(() => ({r: ‘’, p: ‘’})),
    Obs: ‘’
  };
}
Function ensure© {
  Const b = blankCase(c.ficha && c.ficha.nombre);
  c.ficha = Object.assign(b.ficha, c.ficha || {});
  c.ficha.subj = c.ficha.subj || {};
  if (¡Array.isArray(c.ficha.carreras) || c.ficha.carreras.length < 5) c.ficha.carreras = b.ficha.carreras;
  c.ans = Object.assign(b.ans, c.ans || {});
  c.quien = Array.isArray(c.quien) && c.quien.length === 9 ¿ c.quien : b.quien;
  c.auto = Object.assign(b.auto, c.auto || {});
  c.desi = Array.isArray(c.desi) && c.desi.length === 5 ¿ c.desi : b.desi;
  c.obs = c.obs || ‘’;
  return c;
}

/* =====================================================================
   PUNTUACIÓN
   ===================================================================== */
Function pctFrom(pcts, lbs, score, floorP, floorLab) {
  For (let i = 0; i < pcts.length; i++) if (score >= lbs[i]) return {p: pcts[i], lab: String(pcts[i])};
  Return {p: floorP, lab: floorLab};
}
Function scoreCIP(a) {
  Const pts = {A: 3, I: 2, D: 1};
  Return CIP_SCALES.map(s => {
    Let raw = 0; s.items.forEach(i => { raw += pts[a[i – 1]] || 0; });
    Const r = pctFrom(CIP_PCTS, s.lb, raw, 20, ‘<40’);
    Return {k: s.k, n: s.n, raw, max: s.items.length * 3, p: r.p, lab: r.lab, lvl: lvl(r.p)};
  });
}
Function scoreIAMI(a) {
  Return IAMI_SC.map(s => {
    Const n = s.to – s.from + 1; let raw = 0;
    For (let i = s.from; i <= s.to; i++) raw += a[i – 1] || 0;
    Const r = pctFrom(IAMI_PCTS, n === 8 ¿ IAMI_LB8 : IAMI_LB9, raw, 1, ‘1’);
    Return {k: s.k, n: s.n, raw, nit: n, max: n * 10, mean: raw / n, p: r.p, lab: r.lab, lvl: lvl(r.p)};
  });
}
Function scoreHol(a) {
  Const counts = {R: 0, I: 0, A: 0, S: 0, E: 0, C: 0};
  a.forEach((v, i) => { if (v === 1) counts[HOL_TYPES[i % 6]]++; });
  const order = HOL_TYPES.slice().sort((x, y) => counts[y] – counts[x] || HOL_TYPES.indexOf(x) – HOL_TYPES.indexOf(y));
  const tie = counts[order[2]] === counts[order[3]];
  const nonzero = order.filter(l => counts[l] > 0);
  /* “weak” = el 3er tipo del código está poco diferenciado (0 o muy bajo respecto del máximo de 15) */
  Const weak = counts[order[2]] <= 2;
  Return {counts, order, code: order.slice(0, 3).join(‘’), tie, tied: order.filter(l => counts[l] === counts[order[2]]), nonzero, weak};
}
Function scoreCha(a) {
  Const int = {}, apt = {};
  CHA_KEYS.forEach(k => {
    Int[k] = CHA_INT[k].reduce((s, i) => s + (a[i – 1] === 1 ¿ 1 : 0), 0);
    Apt[k] = CHA_APT[k].reduce((s, i) => s + (a[i – 1] === 1 ¿ 1 : 0), 0);
  });
  Const sortBy = o => CHA_KEYS.slice().sort((x, y) => o[y] – o[x] || CHA_KEYS.indexOf(x) – CHA_KEYS.indexOf(y));
  Const oi = sortBy(int), oa = sortBy(apt);
  Const cut = (o, ord) => ord.filter(k => o[k] >= o[ord[1]] && o[k] > 0);
  Const topI = cut(int, oi), topA = cut(apt, oa);
  Return {int, apt, oi, oa, topI, topA, both: topI.filter(k => topA.includes(k))};
}
Const SCORERS = {cip: scoreCIP, iami: scoreIAMI, hol: scoreHol, cha: scoreCha, aut: scoreAut};

Function rankPoints(scores, keys, pts) {
  Const arr = keys.map(k => ({k, v: scores[k]})).sort((a, b) => b.v – a.v);
  Const out = {}; let i = 0;
  While (i < arr.length) {
    Let j = i; while (j + 1 < arr.length && arr[j + 1].v === arr[i].v) j++;
    Let sum = 0; for (let t = i; t <= j; t++) sum += pts[t];
    Const m = sum / (j – i + 1);
    For (let t = i; t <= j; t++) out[arr[t].k] = arr[t].v === 0 ¿ 0 : m;
    I = j + 1;
  }
  Return out;
}

/* Integración: cruza intereses, autoeficacia/aptitudes y formación previa por campo de estudio */
Const W = {cip: 30, hol: 8, aut: 8, chaI: 13, iami: 25, chaA: 8, acad: 12};
Const TH = {cip: 75, hol: 60, aut: 60, chaI: 65, iami: 75, chaA: 65, acad: 55};
Const QUAD = {
  Aa: [‘Explorar con prioridad’, ‘Interés y confianza altos: buen punto de partida para buscar información y observar a profesionales.’],
  Ab: [‘Interés alto, confianza baja’, ‘Conviene ver si la confianza puede fortalecerse con práctica, modelos cercanos y observación de profesionales.’],
  Ba: [‘Habilidad sin interés marcado’, ‘Explorar si el interés puede despertarse antes de descartarla.’],
  Bb: [‘Prioridad baja por ahora’, ‘Ni el interés ni la confianza se destacan en esta área.’]
};
Function integrate(R, ficha) {
  If (¡(R.cip || R.iami || R.hol || R.cha || R.aut)) return null;
  Const holPts = R.hol ¿ rankPoints(R.hol.counts, HOL_TYPES, [100, 80, 60, 35, 15, 0]) : null;
  Const autPts = R.aut ¿ rankPoints(R.aut.tot, AUT_ORD, [100, 80, 60, 35, 15, 0]) : null;
  Const rp = [100, 85, 65, 40, 25, 10, 0];
  Const chaI = R.cha ¿ rankPoints(R.cha.int, CHA_KEYS, rp) : null;
  Const chaA = R.cha ¿ rankPoints(R.cha.apt, CHA_KEYS, rp) : null;
  Const subj = ficha.subj || {};
  Const out = FIELDS.map(f => {
    Const comp = {}; let cipLab = null;
    If (f.cip && R.cip) { const s = R.cip.find(x => x.k === f.cip); comp.cip = s.p; cipLab = s.lab; }
    If (holPts) comp.hol = avg(f.hol.map(l => holPts[l]));
    If (autPts) comp.aut = avg(f.hol.map(l => autPts[l]));
    If (chaI) comp.chaI = avg(f.cha.map(l => chaI[l]));
    If (R.iami) comp.iami = avg(f.iami.map(k => R.iami.find(x => x.k === k).p));
    If (chaA) comp.chaA = avg(f.cha.map(l => chaA[l]));
    Const sp = f.subj.map(s => SUBJ_PTS[subj[s]]).filter(v => v ¡== undefined);
    If (sp.length) comp.acad = avg(sp);
    Let sw = 0, sv = 0, hits = 0, tot = 0;
    Object.keys(comp).forEach(k => { sw += W[k]; sv += W[k] * comp[k]; tot++; if (comp[k] >= TH[k]) hits++; });
    Const wavg = w => { let a = 0, b = 0; Object.keys(w).forEach(k => { if (comp[k] ¡= null) { a += w[k] * comp[k]; b += w[k]; } }); return b ¿ a / b : null; };
    Const ii = wavg({cip: 2, hol: 1, aut: 1, chaI: 1}), ee = wavg({iami: 2, chaA: 1});
    Const quad = (ii ¡= null && ee ¡= null) ¿ (ii >= 65 ¿ ‘a’ : ‘b’) + (ee >= 65 ¿ ‘a’ : ‘b’) : null;
    Return {f, comp, cipLab, ix: sw ¿ sv / sw : 0, hits, tot, ii, ee, quad};
  });
  Out.sort((a, b) => b.ix – a.ix);
  Return out;
}

Function computeAll© {
  Const R = {cip: null, iami: null, hol: null, cha: null, aut: null, partial: [], missing: []};
  [‘cip’, ‘hol’, ‘cha’, ‘iami’, ‘aut’].forEach(t => {
    Const a = c.ans[t], d = a.filter(v => v ¡== null).length;
    If (d === a.length) R[t] = SCORERS[t](a);
    Else { R.missing.push(t); if (d > 0) R.partial.push({t, d, n: a.length}); }
  });
  R.fields = integrate(R, c.ficha);
  R.nTests = [‘cip’, ‘hol’, ‘cha’, ‘iami’].filter(t => R[t]).length;
  Return R;
}

/* =====================================================================
   ESTADO DE LA INTERFAZ
 ===================================================================== */
Const ui = {view: ‘boot’, id: null, test: null, idx: 0, delId: null, loginError: null, me: null, users: null, msg: null};
Const C = () => db.cases[ui.id];
Let toastT;
Function toast(m) {
  Let t = document.getElementById(‘toast’);
  If (¡t) { t = document.createElement(‘div’); t.id = ‘toast’; t.setAttribute(‘role’, ‘status’); document.body.appendChild(t); }
  t.textContent = m; t.className = ‘show’;
  clearTimeout(toastT); toastT = setTimeout(() => { t.className = ‘’; }, 3200);
}
Function setPath(obj, path, val) {
  Const ks = path.split(‘.’); let o = obj;
  For (let i = 0; i < ks.length – 1; i++) o = o[ks[i]];
  O[ks[ks.length – 1]] = val;
}

/* Progreso por módulo */
Function modProg(c, id) {
  If (c.ans[id]) { const a = c.ans[id]; return {d: a.filter(v => v ¡== null).length, n: a.length}; }
  Const f = c.ficha;
  If (id === ‘ficha’) {
    Let d = 0; if (f.nombre.trim()) d++; if (String(f.edad).trim()) d++; if (f.curso.trim()) d++; if (f.situacion) d++;
    If (Object.keys(f.subj).filter(k => f.subj[k]).length >= 4) d++;
    Return {d, n: 5};
  }
  If (id === ‘quien’) return {d: c.quien.filter(x => x.trim()).length, n: 9};
  If (id === ‘auto’) return {d: Object.values(c.auto).filter(x => x.trim()).length, n: 6};
  If (id === ‘desi’) return {d: c.desi.filter(x => x.r.trim()).length, n: 5};
  Return {d: 0, n: 1};
}
Const GROUPS = [
  {t: ‘Encuentro 1: conocerte’, m: [
    {id: ‘ficha’, t: ‘Ficha y formación previa’, s: ‘Datos, materias y carreras que considerás’},
    {id: ‘quien’, t: ‘¿Quién soy?’, s: ‘9 preguntas para conocerte mejor’},
    {id: ‘auto’, t: ‘Autobiografía guiada’, s: ‘Pasado, presente y futuro’}]},
  {t: ‘Encuentro 2: intereses’, m: [
    {id: ‘cip’, t: ‘CIP-R: intereses profesionales’, s: ‘114 actividades, unos 15 minutos’},
    {id: ‘hol’, t: ‘Holland: personalidad e intereses’, s: ’90 frases, unos 10 minutos’},
    {id: ‘aut’, t: ‘Holland: autoconocimiento’, s: ’86 ítems en 4 partes, unos 15 minutos’},
    {id: ‘cha’, t: ‘CHASIDE: intereses y aptitudes’, s: ’98 preguntas, unos 12 minutos’}]},
  {t: ‘Encuentro 3: confianza en tus habilidades’, m: [
    {id: ‘iami’, t: ‘IAMI: inteligencias múltiples’, s: ’69 actividades, unos 12 minutos’}]},
  {t: ‘Encuentro 4: devolución’, m: [
    {id: ‘desi’, t: ‘Cuestionario Desiderativo Vocacional’, s: ‘5 consignas, se aplica con el orientador’}]}
];
Const ALL_MODS = GROUPS.reduce((a, g) => a.concat(g.m), []);
Const modsDone = c => ALL_MODS.filter(m => { const p = modProg(c, m.id); return p.d >= p.n; }).length;

/* =====================================================================
   COMPONENTES DE VISTA
   ===================================================================== */
Function hexSVG(counts) {
  Const cx = 110, cy = 110, R = 78, L = HOL_TYPES;
  Const pt = (i, r) => { const a = (-90 + 60 * i) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  Const ring = r => L.map((_, i) => pt(i, r).map(n => n.toFixed(1)).join(‘,’)).join(‘ ‘);
  Let s = ‘<svg class=”hex” viewBox=”0 0 220 220” role=”img” aria-label=”Hexágono de Holland”>’;
  [1, 0.66, 0.33].forEach(f => { s += `<polygon points=”${ring(R * f)}” class=”hx-ring”/>`; });
  L.forEach((_, i) => { const p = pt(i, R); s += `<line x1=”${cx}” y1=”${cy}” x2=”${p[0].toFixed(1)}” y2=”${p[1].toFixed(1)}” class=”hx-ring”/>`; });
  If (counts) {
    Const poly = L.map((l, i) => pt(i, R * Math.max(counts[l], 0.4) / 15).map(n => n.toFixed(1)).join(‘,’)).join(‘ ‘);
    S += `<polygon points=”${poly}” class=”hx-data”/>`;
  }
  L.forEach((l, i) => { const p = pt(i, R + 17); s += `<text x=”${p[0].toFixed(1)}” y=”${(p[1] + 5).toFixed(1)}” text-anchor=”middle” class=”hx-l”>${l}</text>`; });
  Return s + ‘</svg>’;
}
Function bars(rows, tick) {
  Return `<div class=”bars${tick ¿ ‘ tick’ : ‘’}”>${rows.map(r =>
    `<div class=”brow${r.top ¿ ‘ top’ : ‘’}”><div class=”bl”><span>${esc(r.l)}</span></div><div class=”trk”><i class=”lv-${r.lvl || ‘alto’}” style=”width:${Math.max(2, Math.min(100, r.p))}%”></i></div><div class=”bv”>${esc(r.v)}</div></div>`
  ).join(‘’)}</div>`;
}
Const fld = (label, path, val, type, ph) => `<label>${label}<input type=”${type || ‘text’}” data-path=”${path}” value=”${esc(val)}” placeholder=”${esc(ph || ‘’)}” autocomplete=”off”${type === ‘number’ ¿ ‘ inputmode=”numeric” min=”10” max=”99”’ : ‘’}></label>`;
Const area = (label, path, val, rows, ph) => `<label>${label}<textarea data-path=”${path}” rows=”${rows || 3}” placeholder=”${esc(ph || ‘’)}”>${esc(val)}</textarea></label>`;
Const sel = (label, path, val, opts) => `<label>${label}<select data-path=”${path}”>${opts.map(o => `<option value=”${esc(o[0])}”${o[0] === val ¿ ‘ selected’ : ‘’}>${esc(o[1])}</option>`).join(‘’)}</select></label>`;
Function topbar(title, to) {
  Return `<header class=”bar”><button class=”back” data-act=”go” data-to=”${to}”>‹ Volver</button><span class=”tb-title”>${esc(title)}</span></header>`;
}

/* =====================================================================
   VISTAS
   ===================================================================== */
Function viewLogin() {
  Return `<main class=”wrap login”><section class=”hero”><div><h1>Orientación vocacional ocupacional</h1><p class=”lead”>Ingresá con tu usuario para acceder a tus casos, desde cualquier dispositivo.</p></div>${hexSVG(null)}</section>
  <form id=”loginform” class=”newcase” autocomplete=”off”>
    <label for=”un”>Usuario</label>
    <div class=”row”><input id=”un” name=”un” type=”text” autocomplete=”username” autocapitalize=”none” required></div>
    <label for=”pw” style=”margin-top:.7em;display:block”>Contraseña</label>
    <div class=”row”><input id=”pw” name=”pw” type=”password” autocomplete=”current-password” required><button type=”button” class=”btn pri” data-act=”login”>Ingresar</button></div>
    ${ui.loginError ¿ `<p class=”warn”>${esc(ui.loginError)}</p>` : ‘’}
  </form></main>`;
}
Function viewBoot() {
  Return `<main class=”wrap home boot”><div class=”bootbox”>${hexSVG(null)}<p class=”lead”>Cargando…</p></div></main>`;
}
Function viewHome() {
  Const ids = Object.keys(db.cases).sort((a, b) => db.cases[b].created – db.cases[a].created);
  Const rows = ids.map(id => {
    Const c = db.cases[id];
    Return `<li class=”case”><button class=”case-open” data-act=”open” data-id=”${id}”><b>${esc(c.ficha.nombre || ‘Sin nombre’)}</b><small>${modsDone©} de ${ALL_MODS.length} módulos completos, creado el ${new Date(c.created).toLocaleDateString(‘es-AR’)}</small></button><button class=”btn ghost sm” data-act=”del” data-id=”${id}”>${ui.delId === id ¿ ‘Confirmar borrado’ : ‘Borrar’}</button></li>`;
  }).join(‘’);
  Return `<main class=”wrap home”>
  <section class=”hero”><div><h1>Orientación vocacional ocupacional</h1><p class=”lead”>Aplicá los tests, corregí automáticamente y obtené un informe que cruza intereses, aptitudes y formación previa.</p><span class=”badge on”>☁ Guardado en el servidor</span></div>${hexSVG(null)}</section>
  <section class=”newcase”><label for=”nn”>Nuevo caso</label><div class=”row”><input id=”nn” type=”text” placeholder=”Nombre o iniciales” autocomplete=”off”><button class=”btn pri” data-act=”new”>Crear caso</button></div></section>
  <h2>Casos guardados</h2>
  ${ids.length ¿ `<ul class=”cases”>${rows}</ul>` : ‘<p class=”empty”>Todavía no hay casos. Creá el primero con un nombre o iniciales y empezá por la ficha.</p>’}
  <details class=”bk”><summary>Respaldo de datos</summary>
    <p class=”hint”>Tus casos ya se guardan en el servidor. Este texto sirve como copia adicional, o para pasar casos entre dos instalaciones distintas.</p>
    <textarea id=”bkbox” rows=”5” spellcheck=”false”>${esc(JSON.stringify(db.cases))}</textarea>
    <div class=”row”><button class=”btn” data-act=”bkcopy”>Copiar respaldo</button><button class=”btn” data-act=”bkimport”>Importar</button></div></details>
  <p class=”foot”>Los datos quedan guardados en el servidor de esta instalación. Los resultados de los tests requieren la interpretación de un profesional.</p>
  <p class=”foot noprint”>Sesión de <b>${esc(ui.me ¿ ui.me.name : ‘’)}</b>. Cada profesional ve solo sus propios casos.</p>
  <p class=”row noprint”><button class=”btn ghost sm” data-act=”pass”>Cambiar contraseña</button>${ui.me && ui.me.role === ‘admin’ ¿ ‘<button class=”btn ghost sm” data-act=”users”>Gestionar usuarios</button>’ : ‘’}<button class=”btn ghost sm” data-act=”logout”>Cerrar sesión</button></p></main>`;
}

Function viewCase() {
  Const c = C();
  Const mod = m => {
    Const p = modProg(c, m.id), done = p.d >= p.n && p.n > 0;
    Const verb = done ¿ ‘Revisar’ : (p.d > 0 ¿ ‘Continuar’ : ‘Empezar’);
    Return `<li><button class=”mod” data-act=”mod” data-id=”${m.id}”><span class=”mark${done ¿ ‘ ok’ : ‘’}”>${done ¿ ‘✓’ : (p.d > 0 ¿ Math.round(p.d / p.n * 100) + ‘%’ : ‘’)}</span><span class=”mt”><b>${m.t}</b><small>${m.s}</small></span><span class=”go”>${verb}</span></button></li>`;
  };
  Return topbar(c.ficha.nombre || ‘Caso’, ‘home’) + `<main class=”wrap”>
  <p class=”lead”>Seguí los encuentros en orden o pasá al que necesites. Todo se guarda solo.</p>
  ${GROUPS.map(g => `<section class=”grp”><h2>${g.t}</h2><ul class=”mods”>${g.m.map(mod).join(‘’)}</ul></section>`).join(‘’)}
  <div class=”cta”><button class=”btn pri big” data-act=”report”>Ver informe integrado</button><p class=”hint”>Se arma con los tests que ya completaste.</p></div></main>`;
}

Function viewIntro() {
  Const T = TESTS[ui.test], a = C().ans[T.key];
  Const d = a.filter(v => v ¡== null).length, next = a.findIndex(v => v === null);
  Let btn;
  If (d === 0) btn = `<button class=”btn pri big” data-act=”start” data-i=”0”>Empezar</button>`;
  Else if (d < T.n) btn = `<button class=”btn pri big” data-act=”start” data-i=”${next}”>Continuar en la pregunta ${next + 1}</button>`;
  Else btn = `<button class=”btn pri big” data-act=”start” data-i=”0”>Revisar respuestas</button>`;
  Return topbar(T.short, ‘case’) + `<main class=”wrap”><h1 class=”t1”>${T.short}</h1>
  <p class=”lead”>${T.name}: ${T.n} ítems, unos ${T.min} minutos.</p>
  ${T.intro.map(p => `<p>${esc(p)}</p>`).join(‘’)}
  ${d ¿ `<p class=”hint”>Respondiste ${d} de ${T.n}.</p>` : ‘’}<div class=”cta”>${btn}</div></main>`;
}

Function viewRun() {
  Const T = TESTS[ui.test], a = C().ans[T.key], i = ui.idx, cur = a[i], d = a.filter(v => v ¡== null).length;
  Let opts;
  If (T.key === ‘iami’) {
    Opts = `<div class=”opts scale”>${[1,2,3,4,5,6,7,8,9,10].map(n => `<button class=”opt${cur === n ¿ ‘ on’ : ‘’}” data-act=”ans” data-v=”${n}”>${n}</button>`).join(‘’)}</div>
    <div class=”scale-lab”><span>No puedo hacerlo</span><span>Totalmente seguro/a</span></div>`;
  } else {
    Const OP = T.optsAt ¿ T.optsAt(i) : T.opts;
    Opts = `<div class=”opts${OP.length === 2 ¿ ‘ two’ : ‘’}”>${OP.map(o => `<button class=”opt${cur === o[0] ¿ ‘ on’ : ‘’}” data-act=”ans” data-v=”${o[0]}”>${o[1]}</button>`).join(‘’)}</div>`;
  }
  Const q = T.key === ‘cip’ ¿ ‘<p class=”qhint”>Esta actividad te resulta…</p>’ : (T.key === ‘iami’ ¿ ‘<p class=”qhint”>¿Qué confianza tenés en poder hacerlo bien?</p>’ : ‘’);
  Return `<header class=”bar”><button class=”back” data-act=”exit”>‹ Salir</button><span class=”tb-title”>${T.short}, ${i + 1} de ${T.n}</span></header>
  <main class=”wrap run”><div class=”progress” aria-hidden=”true”><i style=”width:${d / T.n * 100}%”></i></div>
  <article class=”sheet”><div class=”qnum”>${i + 1}</div><p class=”qtext”>${esc(T.txt[i])}</p>${q}${opts}</article>
  <div class=”runnav”><button class=”btn ghost” data-act=”prev”${i === 0 ¿ ‘ disabled’ : ‘’}>Anterior</button><button class=”btn ghost” data-act=”skip”${i >= T.n – 1 ¿ ‘ disabled’ : ‘’}>Saltear</button></div></main>`;
}

Function viewDone() {
  Const T = TESTS[ui.test];
  Return `<main class=”wrap done”><h1 class=”t1”>${T.short} completo</h1>
  <p class=”lead”>Las respuestas se guardaron. Los resultados se integran en el informe y se comentan con el orientador.</p>
  <div class=”cta”><button class=”btn pri big” data-act=”go” data-to=”case”>Volver al caso</button>
  <button class=”btn ghost” data-act=”start” data-i=”0”>Revisar respuestas</button></div></main>`;
}

Function viewFicha() {
  Const f = C().ficha;
  Const seg = s => `<div class=”subj”><span>${s[1]}</span><div class=”seg” role=”group” aria-label=”${esc(s[1])}”>${[‘Alto’,’Medio’,’Bajo’].map(v => `<button data-act=”seg” data-path=”ficha.subj.${s[0]}” data-val=”${v}” class=”${f.subj[s[0]] === v ¿ ‘on’ : ‘’}”>${v}</button>`).join(‘’)}</div></div>`;
  Return topbar(‘Ficha y formación previa’, ‘case’) + `<main class=”wrap”>
  <p class=”lead”>Datos básicos y cómo te va en cada materia. Sirve para cruzar tus intereses con tu formación previa.</p>
  ${fld(‘Nombre o iniciales’, ‘ficha.nombre’, f.nombre)}
  <div class=”two”>${fld(‘Edad’, ‘ficha.edad’, f.edad, ‘number’)}${sel(‘Sexo’, ‘ficha.sexo’, f.sexo, [[‘’, ‘Elegir’], [‘Femenino’, ‘Femenino’], [‘Masculino’, ‘Masculino’], [‘Otro’, ‘Otro’], [‘Sin datos’, ‘Prefiere no decirlo’]])}</div>
  ${fld(‘Curso o año’, ‘ficha.curso’, f.curso)}
  ${fld(‘Institución’, ‘ficha.inst’, f.inst)}
  ${sel(‘Situación de elección’, ‘ficha.situacion’, f.situacion, [[‘’, ‘Elegir’], [‘Sin idea’, ‘Todavía no tengo idea’], [‘Dudas’, ‘Dudo entre varias opciones’], [‘Elegida’, ‘Ya elegí y quiero confirmar’], [‘Cambio’, ‘Quiero cambiar lo que elegí’]])}
  <h2>Rendimiento por materia</h2>
  <p class=”hint”>Marcá cómo te va en cada una. Dejá sin marcar las que no cursás. Tocá de nuevo para quitar la marca.</p>
  ${SUBJECTS.map(seg).join(‘’)}
  <h2>Carreras que estás considerando</h2>
  <p class=”hint”>Hasta cinco, con el motivo de cada una.</p>
  ${f.carreras.map((r, i) => `<div class=”two car”><label>Carrera ${i + 1}<input type=”text” data-path=”ficha.carreras.${i}.c” value=”${esc(r.c)}” autocomplete=”off”></label><label>Por qué<input type=”text” data-path=”ficha.carreras.${i}.m” value=”${esc(r.m)}” autocomplete=”off”></label></div>`).join(‘’)}
  <h2>Más sobre vos</h2>
  ${area(‘Actividades, cursos, trabajos o voluntariados’, ‘ficha.extra’, f.extra, 3)}
  ${area(‘Apoyos y obstáculos para tu elección (familia, economía, ubicación, otros)’, ‘ficha.apoyo’, f.apoyo, 3)}
  <div class=”cta”><button class=”btn pri big” data-act=”go” data-to=”case”>Listo, volver al caso</button></div></main>`;
}

Function viewQuien() {
  Const c = C();
  Return topbar(‘¿Quién soy?’, ‘case’) + `<main class=”wrap”><p class=”lead”>Respondé con tus palabras, sin pensar en si está bien o mal. Podés escribir en una hoja aparte y resumir acá.</p>
  ${QUIEN_Q.map((q, i) => area(`${i + 1}. ${q}`, ‘quien.’ + i, c.quien[i], 3)).join(‘’)}
  <div class=”cta”><button class=”btn pri big” data-act=”go” data-to=”case”>Listo, volver al caso</button></div></main>`;
}

Function viewAuto() {
  Const c = C();
  Return topbar(‘Autobiografía guiada’, ‘case’) + `<main class=”wrap”><p class=”lead”>Es un relato personal. Escribí con confianza: lo que cuentes se usa para conocerte mejor y solo lo lee tu orientador.</p>
  ${AUTO_Q.map(q => `${area(q[1], ‘auto.’ + q[0], c.auto[q[0]], 5)}<p class=”hint under”>${q[2]}</p>`).join(‘’)}
  <div class=”cta”><button class=”btn pri big” data-act=”go” data-to=”case”>Listo, volver al caso</button></div></main>`;
}

Function viewDesi() {
  Const c = C();
  Return topbar(‘Cuestionario Desiderativo’, ‘case’) + `<main class=”wrap”><p class=”lead”>Se aplica de forma individual y oral: el orientador anota la respuesta y el motivo de cada consigna, tal como se dicen.</p>
  ${DESI_Q.map((q, i) => `<section class=”desi”><h3>${i + 1}. ${q[0]}</h3>${fld(‘Respuesta’, `desi.${i}.r`, c.desi[i].r)}${area(‘Por qué’, `desi.${i}.p`, c.desi[i].p, 3)}</section>`).join(‘’)}
  <div class=”cta”><button class=”btn pri big” data-act=”go” data-to=”case”>Listo, volver al caso</button></div></main>`;
}

/* =====================================================================
   INFORME
   ===================================================================== */
Function analyze(R, c) {
  Const A = {fort: [], trab: [], notas: []};
  Const subj = c.ficha.subj, sn = id => (SUBJECTS.find(s => s[0] === id) || [0, id])[1];
  Const alto = SUBJECTS.filter(s => subj[s[0]] === ‘Alto’).map(s => s[1]);
  Const bajo = SUBJECTS.filter(s => subj[s[0]] === ‘Bajo’).map(s => s[1]);
  If (R.iami) {
    Const s = R.iami.slice().sort((a, b) => b.mean – a.mean);
    A.topIami = s.slice(0, 3); A.lowIami = s.slice(-2).reverse();
    A.fort.push(`Mayor confianza relativa en ${list(A.topIami.map(x => x.n.toLowerCase() + ‘ (media ‘ + fmt1(x.mean) + ‘ de 10)’))}.`);
    A.trab.push(`Menor confianza relativa en ${list(A.lowIami.map(x => x.n.toLowerCase() + ‘ (media ‘ + fmt1(x.mean) + ‘ de 10)’))}: conviene ver si es falta de práctica o de interés.`);
  }
  If (R.cip) {
    Const s = R.cip.slice().sort((a, b) => b.p – a.p || b.raw – a.raw);
    A.topCip = s.slice(0, 3);
    A.fort.push(`Intereses profesionales más marcados: ${list(A.topCip.map(x => x.n.toLowerCase()))}.`);
  }
  If (R.hol) {
    Const strong = R.hol.nonzero.slice(0, 3);
    A.fort.push(strong.length
      ¿ `Perfil Holland ${R.hol.code}: predominan ${list(strong.map(l => HOL_INFO[l].n.toLowerCase()))}.`
      : `Perfil Holland sin tipos claramente marcados (todas las opciones con puntajes muy parejos).`);
  }
  If (R.aut) {
    A.fort.push(`Autoconocimiento Holland ${R.aut.code}: predominan ${list(R.aut.order.slice(0, 3).map(l => HOL_INFO[l].n.toLowerCase()))}.`);
    If (R.aut.tie) A.notas.push(`En el Autoconocimiento de Holland hay empate en el tercer lugar: el código de tres letras es provisorio.`);
    If (R.hol) {
      Const com = R.aut.order.slice(0, 3).filter(l => R.hol.order.slice(0, 3).includes(l));
      A.notas.push(com.length >= 2
        ¿ `Los dos instrumentos Holland coinciden en ${list(com.map(l => HOL_INFO[l].n.toLowerCase()))}: el perfil es consistente.`
        : `Los dos instrumentos Holland (${R.hol.code} y ${R.aut.code}) coinciden poco: conviene conversarlo en la devolución, porque pueden medir cosas distintas (frases frente a autodescripción).`);
    }
  }
  If (alto.length) A.fort.push(`Buen rendimiento declarado en ${list(alto.map(x => x.toLowerCase()))}.`);
  If (R.fields) {
    Const top = R.fields.slice(0, 6);
    Top.filter(x => x.quad === ‘ab’).forEach(x => A.trab.push(`En ${x.f.n.toLowerCase()} el interés es alto pero la confianza es baja: se puede trabajar con práctica y modelos.`));
    Const t3 = R.fields.slice(0, 3);
    Const weak = []; t3.forEach(x => x.f.subj.forEach(s => { if (subj[s] === ‘Bajo’ && ¡weak.includes(s)) weak.push(s); }));
    If (weak.length) A.trab.push(`Rendimiento declarado bajo en ${list(weak.map(s => sn(s).toLowerCase()))}, materias ligadas a las áreas prioritarias: pensar apoyos o estrategias de estudio.`);
  } else if (bajo.length) A.trab.push(`Rendimiento declarado bajo en ${list(bajo.map(x => x.toLowerCase()))}.`);
  If (c.quien[3].trim()) A.trab.push(‘Dificultades que el consultante refiere en “¿Quién soy?”: ver la sección de aspectos cualitativos.’);
  If (R.hol && R.hol.tie) A.notas.push(`En Holland hay empate en el tercer lugar (${R.hol.tied.join(‘, ‘)}): el código de tres letras es provisorio.`);
  If (R.hol && R.hol.weak && ¡R.hol.tie) A.notas.push(`En Holland el tercer tipo del código (${R.hol.order[2]}) tiene un puntaje muy bajo: el perfil está poco diferenciado y el código de tres letras conviene tomarlo con cautela.`);
  If (R.iami && R.iami.filter(x => x.p >= 90).length >= 5) A.notas.push(‘Casi todas las escalas del IAMI caen en percentiles muy altos. Es probable que el baremo sea exigente hacia abajo: interpretar sobre todo el orden relativo entre escalas.’);
  Return A;
}
Function fieldBlock(x, i) {
  Const f = x.f, c = x.comp;
  Const rows = [];
  Const cp = (l, k, txt) => { if (c[k] ¡= null) rows.push({l, p: c[k], v: txt, lvl: c[k] >= TH[k] ¿ ‘alto’ : (c[k] >= TH[k] – 30 ¿ ‘medio’ : ‘bajo’)}); };
  Cp(‘Interés CIP-R’, ‘cip’, x.cipLab ¿ ‘P’ + x.cipLab : ‘’);
  Cp(‘Holland’, ‘hol’, c.hol >= 60 ¿ ‘alta’ : (c.hol >= 30 ¿ ‘media’ : ‘baja’));
  Cp(‘Holland autoconocimiento’, ‘aut’, c.aut >= 60 ¿ ‘alta’ : (c.aut >= 30 ¿ ‘media’ : ‘baja’));
  Cp(‘CHASIDE intereses’, ‘chaI’, c.chaI >= 65 ¿ ‘alta’ : (c.chaI >= 30 ¿ ‘media’ : ‘baja’));
  Cp(‘IAMI confianza’, ‘iami’, c.iami ¡= null ¿ ‘P’ + Math.round(c.iami) : ‘’);
  Cp(‘CHASIDE aptitudes’, ‘chaA’, c.chaA >= 65 ¿ ‘alta’ : (c.chaA >= 30 ¿ ‘media’ : ‘baja’));
  Cp(‘Formación previa’, ‘acad’, c.acad >= 75 ¿ ‘alto’ : (c.acad >= 35 ¿ ‘medio’ : ‘bajo’));
  Const q = x.quad ¿ QUAD[x.quad] : null;
  Return `<details class=”field${i < 3 ¿ ‘ prio’ : ‘’}”${i < 3 ¿ ‘ open’ : ‘’}><summary><span class=”rk”>${i + 1}</span><span class=”fn”>${f.n}</span><span class=”fi”>${Math.round(x.ix)}</span></summary>
  <div class=”fbody”>${q ¿ `<p class=”quad q-${x.quad}”><b>${q[0]}.</b> ${q[1]}</p>` : ‘’}
  ${bars(rows, false)}
  <p class=”src”>Coincidencia alta en ${x.hits} de ${x.tot} fuentes.</p>
  <p class=”car”><b>Carreras para explorar:</b> ${f.car.join(‘, ‘)}.</p></div></details>`;
}

Function viewReport() {
  Const c = C(), f = c.ficha, R = computeAll©, A = analyze(R, c);
  Const names = {cip: ‘CIP-R’, hol: ‘Holland’, cha: ‘CHASIDE’, iami: ‘IAMI’, aut: ‘Holland autoconocimiento’};
  Let h = topbar(‘Informe’, ‘case’) + `<main class=”wrap rep”>
  <div class=”rep-head”><h1>Informe de orientación vocacional ocupacional</h1>
  <p class=”who”><b>${esc(f.nombre || ‘Sin nombre’)}</b>${f.edad ¿ ‘, ‘ + esc(f.edad) + ‘ años’ : ‘’}${f.curso ¿ ‘, ‘ + esc(f.curso) : ‘’}${f.inst ¿ ‘, ‘ + esc(f.inst) : ‘’}. Informe del ${new Date().toLocaleDateString(‘es-AR’)}.</p>
  <div class=”row noprint”><button class=”btn” data-act=”copyrep”>Copiar informe</button><button class=”btn” data-act=”print”>Imprimir o guardar PDF</button></div></div>`;

  If (R.missing.length) {
    H += `<p class=”warn”>Informe parcial. ${R.missing.map(t => { const p = R.partial.find(x => x.t === t); return `${names[t]}: ${p ¿ ‘incompleto (‘ + p.d + ‘ de ‘ + p.n + ‘)’ : ‘sin responder’}`; }).join(‘; ‘)}. Solo se integran los tests completos.</p>`;
  }
  If (¡R.fields) {
    Return h + ‘<p class=”empty”>Todavía no hay ningún test completo. Completá al menos uno para ver resultados.</p></main>’;
  }

  /* Síntesis */
  Const top3 = R.fields.slice(0, 3).map(x => x.f.n.toLowerCase());
  H += `<h2>Síntesis</h2><p class=”syn”>Según los ${R.nTests} test${R.nTests > 1 ¿ ‘s’ : ‘’} completado${R.nTests > 1 ¿ ‘s’ : ‘’} y la formación previa declarada, la mayor convergencia entre intereses, confianza en las propias habilidades y antecedentes académicos aparece en ${list(top3)}.</p><div class=”chips”>`;
  If (R.hol) h += `<span class=”chip”>Holland ${R.hol.code}</span>`;
  If (R.aut) h += `<span class=”chip”>Autoconocimiento ${R.aut.code}</span>`;
  If (A.topCip) h += `<span class=”chip”>CIP-R: ${list(A.topCip.map(x => x.n))}</span>`;
  If (A.topIami) h += `<span class=”chip”>IAMI: ${list(A.topIami.map(x => x.n))}</span>`;
  If (R.cha) h += `<span class=”chip”>CHASIDE: ${list(R.cha.topI.map(k => CHA_INFO[k]))}</span>`;
  H += ‘</div>’;
  If (R.nTests < 3) h += ‘<p class=”hint”>Con pocos tests el cruce es limitado. Completar el resto afina las recomendaciones.</p>’;

  /* Convergencia por campo */
  H += `<h2>Áreas para explorar</h2><p class=”hint”>Ordenadas por un índice de convergencia de 0 a 100 que combina intereses, confianza en las habilidades y formación previa. Tocá cada área para ver el detalle.</p>
  <div class=”fields”>${R.fields.slice(0, 8).map((x, i) => fieldBlock(x, i)).join(‘’)}</div>`;
  Const rest = R.fields.slice(8);
  If (rest.length) h += `<details class=”more”><summary>Ver las otras ${rest.length} áreas</summary><div class=”fields”>${rest.map((x, i) => fieldBlock(x, i + 8)).join(‘’)}</div></details>`;

  /* Perfiles por instrumento */
  H += ‘<h2>Resultados por test</h2>’;
  If (R.cip) {
    Const s = R.cip.slice().sort((a, b) => b.p – a.p || b.raw – a.raw);
    H += `<section class=”test”><h3>CIP-R: intereses profesionales</h3><p class=”hint”>Percentil por escala. La línea roja marca el percentil 75: desde ahí el interés se considera alto.</p>${bars(s.map((x, i) => ({l: x.n, p: x.p, v: ‘P’ + x.lab, lvl: x.lvl, top: i < 3 && x.p >= 75})), true)}</section>`;
  }
  If (R.aut) {
    H += `<section class=”test”><h3>Holland: autoconocimiento</h3><div class=”holl”>${hexSVG(R.aut.tot)}<div><p class=”code”>${R.aut.code}</p><p class=”hint”>Suma de las partes A, B, C y D de la hoja de corrección (máximo 15 por tipo).${R.aut.tie ¿ ‘ Hay empate en el tercer lugar: el código es provisorio.’ : ‘’}</p></div></div>
    ${bars(R.aut.order.map((l, i) => ({l: HOL_INFO[l].n, p: R.aut.tot[l] / 15 * 100, v: R.aut.tot[l] + ‘ (A’ + R.aut.parts.A[l] + ‘ B’ + R.aut.parts.B[l] + ‘ C’ + R.aut.parts.C[l] + ‘ D’ + R.aut.parts.D[l] + ‘)’, lvl: i < 3 ¿ ‘alto’ : ‘medio’, top: i < 3})), false)}
    <ul class=”desc”>${R.aut.order.slice(0, 3).map(l => `<li><b>${HOL_INFO[l].n}.</b> ${HOL_INFO[l].d} <i>La persona tiende a mostrarse: ${HOL_INFO[l].t}.</i></li>`).join(‘’)}</ul></section>`;
  }
  If (R.iami) {
    Const s = R.iami.slice().sort((a, b) => b.p – a.p || b.mean – a.mean);
    H += `<section class=”test”><h3>IAMI: confianza en tus habilidades</h3><p class=”hint”>Percentil por escala, con la media por ítem sobre 10 entre paréntesis.</p>${bars(s.map((x, i) => ({l: x.n, p: x.p, v: ‘P’ + x.lab + ‘ (‘ + fmt1(x.mean) + ‘)’, lvl: x.lvl, top: i < 3 && x.p >= 75})), true)}</section>`;
  }
  If (R.hol) {
    H += `<section class=”test”><h3>Holland: personalidad e intereses</h3><div class=”holl”>${hexSVG(R.hol.counts)}<div><p class=”code”>${R.hol.code}</p><p class=”hint”>Puntaje de 0 a 15 por tipo.</p></div></div>
    ${bars(R.hol.order.map((l, i) => ({l: HOL_INFO[l].n, p: R.hol.counts[l] / 15 * 100, v: R.hol.counts[l] + ‘ de 15’, lvl: i < 3 ¿ ‘alto’ : ‘medio’, top: i < 3})), false)}
    <ul class=”desc”>${R.hol.order.slice(0, 3).map(l => `<li><b>${HOL_INFO[l].n}.</b> ${HOL_INFO[l].d} <i>La persona tiende a mostrarse: ${HOL_INFO[l].t}.</i></li>`).join(‘’)}</ul></section>`;
  }
  If (R.cha) {
    H += `<section class=”test”><h3>CHASIDE: intereses y aptitudes por área</h3><p class=”sub”>Intereses (0 a 10)</p>${bars(R.cha.oi.map(k => ({l: CHA_INFO[k], p: R.cha.int[k] * 10, v: String(R.cha.int[k]), lvl: R.cha.topI.includes(k) ¿ ‘alto’ : ‘medio’, top: R.cha.topI.includes(k)})), false)}
    <p class=”sub”>Aptitudes (0 a 4)</p>${bars(R.cha.oa.map(k => ({l: CHA_INFO[k], p: R.cha.apt[k] * 25, v: String(R.cha.apt[k]), lvl: R.cha.topA.includes(k) ¿ ‘alto’ : ‘medio’, top: R.cha.topA.includes(k)})), false)}
    <p class=”hint”>${R.cha.both.length ¿ ‘Áreas con interés y aptitud entre las más altas: ‘ + list(R.cha.both.map(k => CHA_INFO[k].toLowerCase())) + ‘.’ : ‘Ningún área coincide entre las más altas de intereses y de aptitudes.’} Las aptitudes de CHASIDE tienen solo 4 preguntas por área y generan muchos empates.</p></section>`;
  }

  /* Fortalezas y aspectos a trabajar */
  H += `<h2>Fortalezas y aspectos a trabajar</h2><div class=”cols”><section><h3>Fortalezas</h3><ul class=”pts”>${A.fort.map(x => `<li>${esc(x)}</li>`).join(‘’) || ‘<li>Se completa al sumar tests.</li>’}</ul></section>
  <section><h3>A trabajar o profundizar</h3><ul class=”pts”>${A.trab.map(x => `<li>${esc(x)}</li>`).join(‘’) || ‘<li>Sin puntos destacados con los datos actuales.</li>’}</ul></section></div>`;
  If (A.notas.length) h += `<p class=”note”>${A.notas.map(esc).join(‘ ‘)}</p>`;

  /* Cualitativo */
  Const filled = c.ficha.carreras.filter(r => r.c.trim());
  Const q = c.quien.map((t, i) => t.trim() ¿ `<dt>${QUIEN_Q[i]}</dt><dd>${esc(t)}</dd>` : ‘’).join(‘’);
  Const au = AUTO_Q.map(a => c.auto[a[0]].trim() ¿ `<dt>${a[1]}</dt><dd>${esc(c.auto[a[0]])}</dd>` : ‘’).join(‘’);
  Const de = DESI_Q.map((d, i) => (c.desi[i].r.trim() || c.desi[i].p.trim()) ¿ `<dt>${d[0]}</dt><dd>${esc(c.desi[i].r)}${c.desi[i].p.trim() ¿ ‘. ‘ + esc(c.desi[i].p) : ‘’}<span class=”ev”>${d[1]}</span></dd>` : ‘’).join(‘’);
  H += `<h2>Aspectos cualitativos</h2><p class=”hint”>Material para leer con el orientador. No se puntúa: se interpreta.</p>`;
  If (filled.length) h += `<section class=”qual”><h3>Carreras que considera</h3><ul class=”pts”>${filled.map(r => `<li><b>${esc(r.c)}</b>${r.m.trim() ¿ ‘: ‘ + esc(r.m) : ‘’}</li>`).join(‘’)}</ul></section>`;
  If (f.situacion) h += `<p class=”hint”>Situación de elección: ${esc(f.situacion)}.</p>`;
  If (f.apoyo.trim()) h += `<section class=”qual”><h3>Apoyos y obstáculos</h3><p>${esc(f.apoyo)}</p></section>`;
  If (q) h += `<details class=”qual”><summary>¿Quién soy?</summary><dl>${q}</dl></details>`;
  If (au) h += `<details class=”qual”><summary>Autobiografía</summary><dl>${au}</dl></details>`;
  If (de) h += `<details class=”qual”><summary>Desiderativo Vocacional</summary><dl>${de}</dl><p class=”sub”>Guía de análisis</p><ul class=”pts”>${DESI_GUIA.map(g => `<li>${g}</li>`).join(‘’)}</ul></details>`;
  H += `<label class=”obs”>Observaciones del orientador<textarea data-path=”obs” rows=”5” placeholder=”Hipótesis, conflictos, recomendaciones para la devolución”>${esc(c.obs)}</textarea></label>`;

  /* Plan */
  Const t1 = R.fields[0].f, t3c = R.fields.slice(0, 3).map(x => x.f.car[0]);
  H += `<h2>Plan de exploración sugerido</h2><ol class=”plan”>
  <li><b>Informarse.</b> Leer planes de estudio, duración y campo laboral de ${list(R.fields.slice(0, 3).map(x => x.f.car.slice(0, 2).join(‘ y ‘)))}.</li>
  <li><b>Observar a profesionales.</b> Pasar una jornada con alguien que ejerza en ${t1.n.toLowerCase()}, sobre todo donde la confianza sea baja: ver a otros resolver el mismo desafío la fortalece.</li>
  <li><b>Conversar con estudiantes y egresados</b> de ${list(t3c)}.</li>
  <li><b>Comparar por escrito.</b> Armar una grilla con 2 o 3 opciones y criterios propios puntuados de -3 a 3 (creatividad, ingresos, variedad de tareas, trabajo al aire libre, posibilidad de viajar, duración).</li>
  <li><b>Revisar apoyos y obstáculos</b> (familia, economía, ubicación) y volver a conversar con el orientador antes de decidir.</li></ol>`;

  /* Notas técnicas */
  H += `<h2>Notas técnicas</h2><ul class=”pts tech”>
  <li>El informe es una herramienta auxiliar: no reemplaza el proceso de orientación ni la interpretación de un profesional. Los intereses no predicen el éxito académico y la autoeficacia no reemplaza a las aptitudes medidas de forma objetiva; conviene sumar el historial académico o un test de aptitudes.</li>
  <li>Índice de áreas: pesos relativos CIP-R 30, IAMI 25, CHASIDE intereses 13, formación previa 12, CHASIDE aptitudes 8, Holland autoconocimiento 8 y Holland 90 frases 8. Los pesos se normalizan según los tests completados.</li>
  <li>CIP-R: el baremo cargado no está diferenciado por sexo, aunque el manual indica normas separadas. Las filas de percentil 25 o menos no se leen con claridad en el material, por eso los puntajes bajos se informan como “P&lt;40”. La escala Cálculo tiene 7 ítems (máximo 21) pero el baremo llega a 24.</li>
  <li>IAMI: en el baremo cargado las columnas Interpersonal e Intrapersonal parecen intercambiadas; se asignaron según la cantidad de ítems de cada escala (9 y 8). Las medianas del baremo son bajas frente a las medias del manual. Verificar contra la fuente antes de usar los percentiles con fines diagnósticos.</li>
  <li>El índice de convergencia, los umbrales y la correspondencia entre instrumentos y áreas (excepto las equivalencias CIP-R y Holland del manual SOVI-3) son criterios propuestos por este sistema y pueden ajustarse.</li></ul>`;
  H += `<details class=”qual noprint”><summary>Texto del informe (para copiar)</summary><textarea id=”reptxt” rows=”8” readonly>${esc(reportText(c, R, A))}</textarea></details></main>`;
  Return h;
}

Function reportText(c, R, A) {
  Const f = c.ficha, L = [];
  L.push(‘INFORME DE ORIENTACIÓN VOCACIONAL OCUPACIONAL’);
  L.push(`${f.nombre || ‘Sin nombre’}${f.edad ¿ ‘, ‘ + f.edad + ‘ años’ : ‘’}${f.curso ¿ ‘, ‘ + f.curso : ‘’}`);
  L.push(‘’);
  If (¡R.fields) return L.concat([‘Sin tests completos.’]).join(‘\n’);
  L.push(‘ÁREAS PARA EXPLORAR (índice 0-100)’);
  R.fields.slice(0, 8).forEach((x, i) => L.push(`${i + 1}. ${x.f.n}: ${Math.round(x.ix)}${x.quad ¿ ‘ – ‘ + QUAD[x.quad][0] : ‘’}. Carreras: ${x.f.car.join(‘, ‘)}.`));
  L.push(‘’);
  If (R.hol) L.push(`HOLLAND: ${R.hol.code} (${R.hol.order.map(l => l + ‘ ‘ + R.hol.counts[l]).join(‘, ‘)})`);
  If (R.aut) L.push(`HOLLAND AUTOCONOCIMIENTO: ${R.aut.code} (${R.aut.order.map(l => l + ‘ ‘ + R.aut.tot[l]).join(‘, ‘)})`);
  If (R.cip) L.push(‘CIP-R (percentil): ‘ + R.cip.slice().sort((a, b) => b.p – a.p || b.raw – a.raw).map(x => `${x.n} P${x.lab}`).join(‘, ‘));
  If (R.iami) L.push(‘IAMI (percentil, media): ‘ + R.iami.slice().sort((a, b) => b.p – a.p || b.mean – a.mean).map(x => `${x.n} P${x.lab} (${fmt1(x.mean)})`).join(‘, ‘));
  If (R.cha) { L.push(‘CHASIDE intereses: ‘ + R.cha.oi.map(k => `${k} ${R.cha.int[k]}`).join(‘, ‘)); L.push(‘CHASIDE aptitudes: ‘ + R.cha.oa.map(k => `${k} ${R.cha.apt[k]}`).join(‘, ‘)); }
  L.push(‘’);
  L.push(‘FORTALEZAS’); A.fort.forEach(x => L.push(‘- ‘ + x));
  L.push(‘A TRABAJAR’); A.trab.forEach(x => L.push(‘- ‘ + x));
  If (c.obs.trim()) { L.push(‘’); L.push(‘OBSERVACIONES DEL ORIENTADOR’); L.push(c.obs); }
  Return L.join(‘\n’);
}

/* =====================================================================
   RENDER Y EVENTOS
   ===================================================================== */
Function render(top) {
  Const app = document.getElementById(‘app’);
  Const V = {boot: viewBoot, login: viewLogin, home: viewHome, case: viewCase, intro: viewIntro, run: viewRun, done: viewDone, ficha: viewFicha, quien: viewQuien, auto: viewAuto, desi: viewDesi, report: viewReport, pass: viewPass, users: viewUsers};
  App.innerHTML = (V[ui.view] || viewHome)();
  If (top && typeof window ¡== ‘undefined’ && window.scrollTo) window.scrollTo(0, 0);
  If (ui.view === ‘login’) { const un = document.getElementById(‘un’); if (un) un.focus(); }
}
Function answer(v) {
  Const a = C().ans[ui.test];
  A[ui.idx] = v; saveSoon();
  If (ui.idx < a.length – 1) ui.idx++;
  Else {
    Const un = a.findIndex(x => x === null);
    If (un >= 0) { ui.idx = un; toast(‘Quedan preguntas sin responder’); } else { ui.view = ‘done’; save(); }
  }
  Render(true);
}
Function copyText(t) {
  Const fallback = () => {
    Const ta = document.createElement(‘textarea’); ta.value = t; ta.style.position = ‘fixed’; ta.style.opacity = ‘0’;
    Document.body.appendChild(ta); ta.select(); let ok = false;
    Try { ok = document.execCommand(‘copy’); } catch € {}
    Ta.remove(); toast(ok ¿ ‘Copiado’ : ‘No se pudo copiar. Seleccioná el texto y copialo a mano.’);
  };
  Try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t).then(() => toast(‘Copiado’), fallback); return; } } catch € {}
  Fallback();
}
Async function createCase() {
  Const inp = document.getElementById(‘nn’);
  Const name = inp ¿ inp.value.trim() : ‘’;
  If (¡name) { toast(‘Escribí un nombre o iniciales para crear el caso’); if (inp) inp.focus(); return; }
  Const c = blankCase(name); db.cases[c.id] = c;
  Ui.id = c.id; ui.view = ‘case’; render(true);
  Await persist(c.id);
}

Function msgHTML() { return ui.msg ¿ `<p class=”${ui.msg.ok ¿ ‘hint’ : ‘warn’}”>${esc(ui.msg.t)}</p>` : ‘’; }
Function viewPass() {
  Return `<header class=”bar”><button class=”back” data-act=”go” data-to=”home”>‹ Volver</button><span class=”tb-title”>Cambiar contraseña</span></header>
  <main class=”wrap”><form class=”newcase” autocomplete=”off”>
    <label for=”cp”>Contraseña actual</label><div class=”row”><input id=”cp” type=”password” autocomplete=”current-password”></div>
    <label for=”np” style=”margin-top:.7em;display:block”>Contraseña nueva (mínimo 8 caracteres)</label><div class=”row”><input id=”np” type=”password” autocomplete=”new-password”></div>
    <label for=”np2” style=”margin-top:.7em;display:block”>Repetir contraseña nueva</label><div class=”row”><input id=”np2” type=”password” autocomplete=”new-password”><button type=”button” class=”btn pri” data-act=”savepass”>Guardar</button></div>
    ${msgHTML()}</form></main>`;
}
Function viewUsers() {
  Const rows = (ui.users || []).map(u => `<li><b>${esc(u.name)}</b> <small>(${esc(u.username)}${u.role === ‘admin’ ¿ ‘, administrador’ : ‘’}${u.active ¿ ‘’ : ‘, desactivado’}) · ${u.cases} casos</small>
    <div class=”row”><input id=”rp-${u.id}” type=”text” placeholder=”Nueva contraseña” autocomplete=”off”><button class=”btn ghost sm” data-act=”rstuser” data-id=”${u.id}”>Restablecer</button>
    ${ui.me && u.id ¡== ui.me.id ¿ `<button class=”btn ghost sm” data-act=”toguser” data-id=”${u.id}” data-to=”${u.active ¿ 0 : 1}”>${u.active ¿ ‘Desactivar’ : ‘Activar’}</button>` : ‘’}</div></li>`).join(‘’);
  Return `<header class=”bar”><button class=”back” data-act=”go” data-to=”home”>‹ Volver</button><span class=”tb-title”>Usuarios</span></header>
  <main class=”wrap”><p class=”hint”>Los administradores gestionan las cuentas pero no pueden leer los casos de los demás. Al desactivar a alguien, su sesión se cierra y sus casos se conservan.</p>
  <form class=”newcase” autocomplete=”off”><label>Nuevo usuario</label>
    <div class=”row”><input id=”un-name” type=”text” placeholder=”Nombre y apellido”></div>
    <div class=”row” style=”margin-top:.5em”><input id=”un-user” type=”text” placeholder=”Usuario (ej. Mgomez)” autocapitalize=”none”></div>
    <div class=”row” style=”margin-top:.5em”><input id=”un-pw” type=”text” placeholder=”Contraseña inicial (8 o más)”></div>
    <div class=”row” style=”margin-top:.5em”><select id=”un-role”><option value=”pro”>Profesional</option><option value=”admin”>Administrador</option></select><button type=”button” class=”btn pri” data-act=”mkuser”>Crear usuario</button></div>
    ${msgHTML()}</form>
  <ul class=”users”>${rows}</ul></main>`;
}
Async function jsonApi(url, method, body) {
  Const r = await api(url, {method, headers: {‘Content-Type’: ‘application/json’}, body: body ¿ JSON.stringify(body) : undefined});
  Let j = {}; try { j = await r.json(); } catch € {}
  Return {ok: r.ok, j};
}
Async function loadUsers() { const r = await jsonApi(‘/api/users’, ‘GET’); ui.users = r.ok ¿ r.j : []; }
Const val = id => { const e = document.getElementById(id); return e ¿ e.value : ‘’; };
Async function userAction(act, el) {
  Let r;
  If (act === ‘savepass’) {
    If (val(‘np’) ¡== val(‘np2’)) { ui.msg = {ok: false, t: ‘Las contraseñas nuevas no coinciden.’}; return render(false); }
    R = await jsonApi(‘/api/me/password’, ‘POST’, {current: val(‘cp’), next: val(‘np’)});
    Ui.msg = r.ok ¿ {ok: true, t: ‘Contraseña cambiada.’} : {ok: false, t: r.j.error || ‘No se pudo cambiar.’};
  } else if (act === ‘mkuser’) {
    R = await jsonApi(‘/api/users’, ‘POST’, {name: val(‘un-name’), username: val(‘un-user’), password: val(‘un-pw’), role: val(‘un-role’)});
    Ui.msg = r.ok ¿ {ok: true, t: ‘Usuario creado. Pasale el usuario y la contraseña inicial por un canal privado.’} : {ok: false, t: r.j.error || ‘No se pudo crear.’};
    If (r.ok) await loadUsers();
  } else if (act === ‘toguser’) {
    R = await jsonApi(‘/api/users/’ + el.dataset.id, ‘PATCH’, {active: el.dataset.to === ‘1’});
    Ui.msg = r.ok ¿ {ok: true, t: ‘Listo.’} : {ok: false, t: r.j.error || ‘No se pudo actualizar.’};
    If (r.ok) await loadUsers();
  } else if (act === ‘rstuser’) {
    R = await jsonApi(‘/api/users/’ + el.dataset.id, ‘PATCH’, {password: val(‘rp-‘ + el.dataset.id)});
    Ui.msg = r.ok ¿ {ok: true, t: ‘Contraseña restablecida. La persona deberá ingresar de nuevo.’} : {ok: false, t: r.j.error || ‘No se pudo restablecer.’};
  }
  Render(false);
}
Async function doLogin() {
  Const pw = document.getElementById(‘pw’), un = document.getElementById(‘un’);
  Const pwv = pw ¿ pw.value : ‘’, unv = un ¿ un.value : ‘’;
  Try {
    Const r = await api(‘/api/login’, {method: ‘POST’, headers: {‘Content-Type’: ‘application/json’}, body: JSON.stringify({username: unv, password: pwv})});
    If (r.ok) { try { ui.me = (await r.json()).user; } catch € {} ui.loginError = null; authed = true; ui.view = ‘boot’; render(true); await bootData(); }
    Else { let m = ‘Usuario o contraseña incorrectos.’; try { m = (await r.json()).error || m; } catch € {} ui.loginError = m; render(true); }
  } catch € { ui.loginError = ‘No se pudo conectar con el servidor.’; render(true); }
}
Async function doLogout() {
  Try { await api(‘/api/logout’, {method: ‘POST’}); } catch € {}
  Authed = false; db.cases = {}; ui.id = null; ui.me = null; ui.users = null; ui.msg = null; ui.view = ‘login’; render(true);
}

If (typeof document ¡== ‘undefined’) {
  Const app = document.getElementById(‘app’);
  App.addEventListener(‘click’, e => {
    Const el = e.target.closest(‘[data-act]’); if (¡el) return;
    Const act = el.dataset.act;
    If (act === ‘login’) { e.preventDefault(); return doLogin(); }
    If (act === ‘logout’) return doLogout();
    If (act === ‘pass’) { ui.msg = null; ui.view = ‘pass’; return render(true); }
    If (act === ‘users’) { ui.msg = null; return loadUsers().then(() => { ui.view = ‘users’; render(true); }); }
    If ([‘savepass’, ‘mkuser’, ‘toguser’, ‘rstuser’].includes(act)) return userAction(act, el);
    If (act === ‘new’) return createCase();
    If (act === ‘open’) { ui.id = el.dataset.id; ui.view = ‘case’; return render(true); }
    If (act === ‘del’) {
      If (ui.delId === el.dataset.id) {
        Const id = el.dataset.id; delete db.cases[id]; ui.delId = null; toast(‘Caso borrado’); render(false);
        Return deleteCase(id);
      }
      Ui.delId = el.dataset.id;
      Return render(false);
    }
    If (act === ‘go’) { ui.delId = null; ui.view = el.dataset.to; return render(true); }
    If (act === ‘mod’) { const id = el.dataset.id; if (TESTS[id]) { ui.test = id; ui.view = ‘intro’; } else ui.view = id; return render(true); }
    If (act === ‘start’) { ui.idx = +el.dataset.i; ui.view = ‘run’; return render(true); }
    If (act === ‘exit’) { ui.view = ‘case’; return render(true); }
    If (act === ‘ans’) { const T = TESTS[ui.test]; return answer(T.num ¿ Number(el.dataset.v) : el.dataset.v); }
    If (act === ‘prev’) { if (ui.idx > 0) ui.idx--; return render(true); }
    If (act === ‘skip’) { if (ui.idx < TESTS[ui.test].n – 1) ui.idx++; return render(true); }
    If (act === ‘report’) { ui.view = ‘report’; return render(true); }
    If (act === ‘seg’) {
      Const f = C().ficha, k = el.dataset.path.split(‘.’)[2], v = el.dataset.val;
      f.subj[k] = f.subj[k] === v ¿ ‘’ : v; saveSoon();
      el.parentNode.querySelectorAll(‘button’).forEach(b => b.classList.toggle(‘on’, b.dataset.val === f.subj[k]));
      return;
    }
    If (act === ‘copyrep’) { const t = document.getElementById(‘reptxt’); return copyText(t ¿ t.value : ‘’); }
    If (act === ‘print’) { try { window.print(); } catch (err) { toast(‘No se pudo abrir la impresión desde aquí. Copiá el informe.’); } return; }
    If (act === ‘bkcopy’) { const t = document.getElementById(‘bkbox’); return copyText(t ¿ t.value : ‘’); }
    If (act === ‘bkimport’) {
      Const t = document.getElementById(‘bkbox’);
      Let o; try { o = JSON.parse(t.value); } catch (err) { toast(‘El texto no es un respaldo válido’); return; }
      Const ids = Object.keys(o).filter(k => o[k] && o[k].ficha);
      Ids.forEach(k => { db.cases[k] = ensure(o[k]); });
      Render(false);
      Promise.all(ids.map(id => persist(id))).then(() => toast(ids.length + ‘ caso’ + (ids.length === 1 ¿ ‘’ : ‘s’) + ‘ importado’ + (ids.length === 1 ¿ ‘’ : ‘s’)));
      Return;
    }
  });
  Const onField = e => {
    Const el = e.target; if (¡el.dataset || ¡el.dataset.path || ¡C()) return;
    setPath(C(), el.dataset.path, el.value); saveSoon();
  };
  App.addEventListener(‘input’, onField);
  App.addEventListener(‘change’, onField);
  App.addEventListener(‘submit’, e => { if (e.target && e.target.id === ‘loginform’) { e.preventDefault(); doLogin(); } });
  App.addEventListener(‘keydown’, e => {
    If (e.key === ‘Enter’ && e.target.id === ‘nn’) createCase();
    If (e.key === ‘Enter’ && (e.target.id === ‘pw’ || e.target.id === ‘un’)) { e.preventDefault(); doLogin(); }
  });
  Window.addEventListener(‘beforeprint’, () => document.querySelectorAll(‘details’).forEach(d => { d.open = true; }));

  Async function bootData() {
    Try { await loadCases(); } catch € { /* sesión vencida u otro problema: se vuelve al login */ authed = false; ui.view = ‘login’; render(true); return; }
    Ui.view = ‘home’; render(true);
  }
  (async function boot() {
    Render(false);
    Const ok = await checkSession();
    If (ok) { authed = true; await bootData(); } else { authed = false; ui.view = ‘login’; render(true); }
  })();
}



