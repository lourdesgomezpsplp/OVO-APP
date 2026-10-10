/* =====================================================================
   OVO — Servidor (Express + PostgreSQL)
   Sirve el frontend estático y una API para guardar los casos en una base
   de datos real. Cada profesional tiene su usuario y ve solo sus casos;
   el rol "admin" gestiona usuarios pero no lee los casos ajenos.
   ===================================================================== */
'use strict';

const path = require('path');
const A = require('./auth');
const express = require('express');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const APP_PASSWORD = process.env.APP_PASSWORD;   // solo se usa para crear el primer administrador
const ADMIN_USER = (process.env.ADMIN_USER || 'admin').toLowerCase();
const SESSION_SECRET = process.env.SESSION_SECRET;
const COOKIE_NAME = 'ovo_session';
const COOKIE_DAYS = 30;

if (!SESSION_SECRET) {
  console.error('Falta la variable de entorno SESSION_SECRET. Definila antes de iniciar el servidor (ver .env.example).');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('Falta la variable de entorno DATABASE_URL (la conexión a PostgreSQL). En Render, se completa sola si conectás una base de datos al servicio.');
  process.exit(1);
}

/* ---------- Base de datos ---------- */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false }
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      pass TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'pro',
      active BOOLEAN NOT NULL DEFAULT true,
      created TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created BIGINT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    ALTER TABLE cases ADD COLUMN IF NOT EXISTS owner INTEGER REFERENCES users(id);
    CREATE INDEX IF NOT EXISTS cases_owner_idx ON cases(owner, created DESC);
  `);
  // Primer arranque: el administrador se crea con APP_PASSWORD y hereda los casos existentes.
  const n = (await pool.query('SELECT count(*)::int AS n FROM users')).rows[0].n;
  if (n === 0) {
    if (!APP_PASSWORD) throw new Error('No hay usuarios y falta APP_PASSWORD para crear el administrador inicial (ver .env.example).');
    await pool.query('INSERT INTO users (username, name, pass, role) VALUES ($1, $2, $3, $4)', [ADMIN_USER, 'Administración', A.hashPassword(APP_PASSWORD), 'admin']);
    console.log('Administrador inicial creado: usuario "' + ADMIN_USER + '". Cambiá la contraseña desde la app.');
  }
  // Casos anteriores a las cuentas por profesional: pasan al primer administrador.
  await pool.query(`UPDATE cases SET owner = (SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1) WHERE owner IS NULL`);
}

/* ---------- Sesión ---------- */
const signer = A.makeSigner(SESSION_SECRET);
const limiter = A.makeLimiter(8, 15 * 60 * 1000);
const publicUser = u => ({id: u.id, username: u.username, name: u.name, role: u.role});

function setSession(res, u) {
  res.cookie(COOKIE_NAME, signer.sign({uid: u.id, ph: A.passStamp(u.pass), iat: Date.now()}), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: COOKIE_DAYS * 24 * 60 * 60 * 1000
  });
}
async function requireAuth(req, res, next) {
  const p = signer.verify(req.cookies[COOKIE_NAME]);
  if (!p || !p.uid || Date.now() - p.iat > COOKIE_DAYS * 24 * 60 * 60 * 1000) return res.status(401).json({error: 'No autorizado'});
  try {
    const r = await pool.query('SELECT * FROM users WHERE id = $1 AND active = true', [p.uid]);
    const u = r.rows[0];
    if (!u || A.passStamp(u.pass) !== p.ph) return res.status(401).json({error: 'No autorizado'});
    req.user = u; next();
  } catch (e) { console.error(e); res.status(500).json({error: 'Error de servidor'}); }
}
const requireAdmin = (req, res, next) => req.user.role === 'admin' ? next() : res.status(403).json({error: 'Solo para administradores'});

/* ---------- App ---------- */
const app = express();
app.set('trust proxy', 1);
app.use(express.json({limit: '3mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) return res.status(400).json({error: 'Faltan usuario o contraseña'});
  const uname = username.trim().toLowerCase();
  const key = req.ip + '|' + uname;
  if (limiter.blocked(key)) return res.status(429).json({error: 'Demasiados intentos. Probá de nuevo en unos minutos.'});
  try {
    const u = (await pool.query('SELECT * FROM users WHERE username = $1', [uname])).rows[0];
    const ok = A.checkPassword(password, u ? u.pass : A.DUMMY) && u && u.active;
    if (!ok) { limiter.fail(key); return res.status(401).json({error: 'Usuario o contraseña incorrectos'}); }
    limiter.clear(key); setSession(res, u);
    res.json({ok: true, user: publicUser(u)});
  } catch (e) { console.error(e); res.status(500).json({error: 'Error de servidor'}); }
});
app.post('/api/logout', (req, res) => { res.clearCookie(COOKIE_NAME); res.json({ok: true}); });
app.get('/api/session', requireAuth, (req, res) => res.json({ok: true, user: publicUser(req.user)}));

app.post('/api/me/password', requireAuth, async (req, res) => {
  const { current, next } = req.body || {};
  if (typeof next !== 'string' || next.length < 8) return res.status(400).json({error: 'La contraseña nueva debe tener al menos 8 caracteres'});
  if (!A.checkPassword(current, req.user.pass)) return res.status(401).json({error: 'La contraseña actual no es correcta'});
  try {
    const hash = A.hashPassword(next);
    await pool.query('UPDATE users SET pass = $1 WHERE id = $2', [hash, req.user.id]);
    setSession(res, Object.assign({}, req.user, {pass: hash}));
    res.json({ok: true});
  } catch (e) { console.error(e); res.status(500).json({error: 'No se pudo cambiar la contraseña'}); }
});/* ---------- Usuarios (solo administradores) ---------- */
App.get(‘/api/users’, requireAuth, requireAdmin, async (req, res) => {
  Try {
    Const r = await pool.query(`SELECT u.id, u.username, u.name, u.role, u.active, u.created, (SELECT count(*)::int FROM cases c WHERE c.owner = u.id) AS cases
                                FROM users u ORDER BY u.active DESC, u.name`);
    Res.json(r.rows);
  } catch € { console.error€; res.status(500).json({error: ‘Error al leer los usuarios’}); }
});
App.post(‘/api/users’, requireAuth, requireAdmin, async (req, res) => {
  Const { username, name, password, role } = req.body || {};
  Const uname = String(username || ‘’).trim().toLowerCase();
  If (¡/^[a-z0-9._-]{3,40}$/.test(uname)) return res.status(400).json({error: ‘El usuario debe tener de 3 a 40 caracteres: letras, números, punto, guion o guion bajo’});
  If (typeof name ¡== ‘string’ || ¡name.trim() || name.length > 80) return res.status(400).json({error: ‘Falta el nombre’});
  If (typeof password ¡== ‘string’ || password.length < 8) return res.status(400).json({error: ‘La contraseña debe tener al menos 8 caracteres’});
  Const rol = role === ‘admin’ ¿ ‘admin’ : ‘pro’;
  Try {
    Const r = await pool.query(‘INSERT INTO users (username, name, pass, role) VALUES ($1, $2, $3, $4) RETURNING id’, [uname, name.trim(), A.hashPassword(password), rol]);
    Res.json({ok: true, id: r.rows[0].id});
  } catch € {
    If (e.code === ‘23505’) return res.status(409).json({error: ‘Ya existe un usuario con ese nombre de usuario’});
    Console.error€; res.status(500).json({error: ‘No se pudo crear el usuario’});
  }
});
App.patch(‘/api/users/:id’, requireAuth, requireAdmin, async (req, res) => {
  Const id = Number(req.params.id);
  Const { name, role, active, password } = req.body || {};
  If (¡Number.isInteger(id)) return res.status(400).json({error: ‘Usuario inválido’});
  If (id === req.user.id && (active === false || (role && role ¡== ‘admin’))) return res.status(400).json({error: ‘No podés desactivarte ni quitarte el rol de administrador a vos mismo’});
  If (password ¡== undefined && (typeof password ¡== ‘string’ || password.length < 8)) return res.status(400).json({error: ‘La contraseña debe tener al menos 8 caracteres’});
  Try {
    Const sets = [], vals = [];
    Const add = (col, v) => { vals.push(v); sets.push(col + ‘ = $’ + vals.length); };
    If (typeof name === ‘string’ && name.trim()) add(‘name’, name.trim().slice(0, 80));
    If (role === ‘admin’ || role === ‘pro’) add(‘role’, role);
    If (typeof active === ‘boolean’) add(‘active’, active);
    If (password ¡== undefined) add(‘pass’, A.hashPassword(password));
    If (¡sets.length) return res.status(400).json({error: ‘No hay cambios’});
    Vals.push(id);
    Const r = await pool.query(‘UPDATE users SET ‘ + sets.join(‘, ‘) + ‘ WHERE id = $’ + vals.length + ‘ RETURNING id’, vals);
    If (¡r.rowCount) return res.status(404).json({error: ‘No existe ese usuario’});
    Res.json({ok: true});
  } catch € { console.error€; res.status(500).json({error: ‘No se pudo actualizar el usuario’}); }
});

/* ---------- Casos: cada profesional ve y modifica solo los suyos ---------- */
App.get(‘/api/cases’, requireAuth, async (req, res) => {
  Try {
    Const r = await pool.query(‘SELECT data FROM cases WHERE owner = $1 ORDER BY created DESC’, [req.user.id]);
    Res.json(r.rows.map(row => row.data));
  } catch € { console.error€; res.status(500).json({error: ‘Error al leer los casos’}); }
});
App.put(‘/api/cases/:id’, requireAuth, async (req, res) => {
  Const id = req.params.id, data = req.body;
  If (¡id || ¡data || typeof data ¡== ‘object’) return res.status(400).json({error: ‘Caso inválido’});
  Data.id = id;
  Const created = Number(data.created) || Date.now();
  Try {
    Const r = await pool.query(
      `INSERT INTO cases (id, data, created, owner, updated_at) VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = now() WHERE cases.owner = $4`,
      [id, data, created, req.user.id]);
    If (¡r.rowCount) return res.status(403).json({error: ‘Ese caso pertenece a otro usuario’});
    Res.json({ok: true});
  } catch € { console.error€; res.status(500).json({error: ‘Error al guardar el caso’}); }
});
App.delete(‘/api/cases/:id’, requireAuth, async (req, res) => {
  Try { await pool.query(‘DELETE FROM cases WHERE id = $1 AND owner = $2’, [req.params.id, req.user.id]); res.json({ok: true}); }
  Catch € { console.error€; res.status(500).json({error: ‘Error al borrar el caso’}); }
});

App.get(‘/healthz’, (req, res) => res.send(‘ok’));

initDb()
  .then(() => app.listen(PORT, () => console.log(‘OVO escuchando en el puerto ‘ + PORT)))
  .catch(err => { console.error(‘No se pudo inicializar:’, err.message); process.exit(1); });

