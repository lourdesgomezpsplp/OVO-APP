/* =====================================================================
   OVO — Servidor (Express + PostgreSQL)
   Sirve el frontend estático y una API sencilla para guardar los casos
   en una base de datos real, protegida con una contraseña compartida.
   ===================================================================== */
'use strict';

const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const APP_PASSWORD = process.env.APP_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET;
const COOKIE_NAME = 'ovo_session';
const COOKIE_DAYS = 30;

if (!APP_PASSWORD) {
  console.error('Falta la variable de entorno APP_PASSWORD. Definila antes de iniciar el servidor (ver .env.example).');
  process.exit(1);
}
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
// Si Postgres corta una conexión inactiva (algo normal, sobre todo en planes gratuitos),
// el Pool emite un evento "error" en segundo plano. Sin este listener, Node considera
// que es un error no manejado y TUMBA todo el proceso. Con el listener, el Pool
// simplemente descarta esa conexión y sigue funcionando con las demás.
pool.on('error', (err) => {
  console.error('Error de conexión inactiva en el pool de PostgreSQL (manejado, el servidor sigue funcionando):', err.message);
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created BIGINT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

/* ---------- Sesión: cookie firmada, sin estado en el servidor ---------- */
function b64u(buf) { return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function sign(payload) {
  const data = b64u(Buffer.from(JSON.stringify(payload)));
  const h = b64u(crypto.createHmac('sha256', SESSION_SECRET).update(data).digest());
  return data + '.' + h;
}
function verify(token) {
  if (!token || typeof token !== 'string') return null;
  const i = token.lastIndexOf('.');
  if (i < 0) return null;
  const data = token.slice(0, i), h = token.slice(i + 1);
  const expected = b64u(crypto.createHmac('sha256', SESSION_SECRET).update(data).digest());
  const a = Buffer.from(h), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try { return JSON.parse(Buffer.from(data, 'base64').toString()); } catch (e) { return null; }
}
function requireAuth(req, res, next) {
  const payload = verify(req.cookies[COOKIE_NAME]);
  if (!payload) return res.status(401).json({error: 'No autorizado'});
  next();
}

/* ---------- App ---------- */
const app = express();
app.set('trust proxy', 1); // Render está detrás de un proxy; necesario para que la cookie "secure" funcione
app.use(express.json({limit: '3mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Diagnóstico temporal: muestra en los Logs de Render qué archivos ve realmente el servidor.
try {
  const fs = require('fs');
  console.log('--- Contenido de /public según el servidor ---');
  console.log(fs.readdirSync(path.join(__dirname, 'public')));
  console.log('-----------------------------------------------');
} catch (e) {
  console.log('--- No se pudo leer la carpeta public:', e.message, '---');
}

app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (typeof password !== 'string' || password.length === 0) return res.status(400).json({error: 'Falta la contraseña'});
  // Comparación en tiempo constante para no filtrar información por temporización.
  const a = Buffer.from(password), b = Buffer.from(APP_PASSWORD);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) return res.status(401).json({error: 'Contraseña incorrecta'});
  const token = sign({iat: Date.now()});
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_DAYS * 24 * 60 * 60 * 1000
  });
  res.json({ok: true});
});

app.post('/api/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ok: true});
});

app.get('/api/session', requireAuth, (req, res) => res.json({ok: true}));

app.get('/api/cases', requireAuth, async (req, res) => {
  try {
    const r = await pool.query('SELECT data FROM cases ORDER BY created DESC');
    res.json(r.rows.map(row => row.data));
  } catch (e) {
    console.error(e);
    res.status(500).json({error: 'Error al leer los casos'});
  }
});

app.put('/api/cases/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  if (!id || !data || typeof data !== 'object') return res.status(400).json({error: 'Caso inválido'});
  data.id = id; // el id de la URL siempre manda
  const created = Number(data.created) || Date.now();
  try {
    await pool.query(
      `INSERT INTO cases (id, data, created, updated_at) VALUES ($1, $2, $3, now())
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = now()`,
      [id, data, created]
    );
    res.json({ok: true});
  } catch (e) {
    console.error(e);
    res.status(500).json({error: 'Error al guardar el caso'});
  }
});

app.delete('/api/cases/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM cases WHERE id = $1', [req.params.id]);
    res.json({ok: true});
  } catch (e) {
    console.error(e);
    res.status(500).json({error: 'Error al borrar el caso'});
  }
});

app.get('/healthz', (req, res) => res.send('ok'));

initDb()
  .then(() => {
    app.listen(PORT, () => console.log('OVO escuchando en el puerto ' + PORT));
  })
  .catch(err => {
    console.error('No se pudo inicializar la base de datos:', err.message);
    process.exit(1);
  });
