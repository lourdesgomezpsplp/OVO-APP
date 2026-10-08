# OVO — Sistema de orientación vocacional ocupacional

Aplicación web para aplicar CIP-R, Holland, CHASIDE e IAMI, corregirlos automáticamente
y generar un informe integrado (intereses + autoeficacia/aptitudes + formación previa).
Los casos se guardan en una base de datos PostgreSQL real, protegidos por una contraseña,
así que se puede entrar desde cualquier dispositivo.

## Cómo está armado

- `server.js` — servidor Express: sirve la app y una API con 5 rutas (login, logout,
  sesión, listar/guardar/borrar casos).
- `public/` — el frontend: `index.html`, `style.css`, `data.js` (ítems, claves de
  corrección y baremos de los tests) y `app.js` (toda la lógica de la app).
- Base de datos: una sola tabla `cases` con el JSON completo de cada caso.
- Acceso: cada profesional tiene su usuario y contraseña y ve solo sus casos. El rol
  "administrador" crea y desactiva usuarios y restablece contraseñas, pero no puede leer
  los casos de los demás. Las contraseñas se guardan con hash (scrypt), hay límite de
  intentos fallidos y, al cambiar o restablecer una contraseña, las sesiones anteriores se cierran.
- `auth.js` — hash de contraseñas, firma de sesión y límite de intentos (sin dependencias).

## Paso 1 — Subir el código a GitHub

1. Creá un repositorio nuevo en GitHub (podés dejarlo privado).
2. Desde esta carpeta:
   ```bash
   git init
   git add .
   git commit -m "Primera versión de OVO"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
   git push -u origin main
   ```

## Paso 2 — Desplegar en Render

### Opción A: con un clic (Blueprint)

Este repositorio incluye un archivo `render.yaml` que arma todo junto (servidor +
base de datos).

1. Entrá a [render.com](https://render.com) e iniciá sesión (podés usar tu cuenta de GitHub).
2. **New → Blueprint**, elegí este repositorio.
3. Render va a detectar `render.yaml` y proponer crear el servicio web `ovo-app` y la
   base de datos `ovo-db`. Confirmá.
4. Te va a pedir el valor de `APP_PASSWORD` (la contraseña del primer administrador, usuario `admin`; se usa solo en el primer arranque):
   elegí una contraseña fuerte. El resto (`SESSION_SECRET`, `DATABASE_URL`) se generan solos.
5. Esperá a que termine el build (unos minutos la primera vez). Cuando el servicio
   quede "Live", entrá a la URL que te da Render (algo como `https://ovo-app.onrender.com`).

### Opción B: manual, paso a paso

1. **Base de datos**: en Render, **New → PostgreSQL**. Plan Free. Anotá el nombre.
2. **Servicio web**: **New → Web Service**, conectá tu repositorio de GitHub.
   - Build command: `npm install`
   - Start command: `npm start`
   - Plan: Free
3. En la pestaña **Environment** del servicio web, agregá:
   - `APP_PASSWORD` → la contraseña del primer administrador (usuario `admin`, o el que pongas en `ADMIN_USER`). Solo se usa si todavía no hay usuarios.
   - `SESSION_SECRET` → una cadena aleatoria larga. La podés generar corriendo en tu
     computadora: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `DATABASE_URL` → andá a la base de datos que creaste, copiá el **Internal
     Database URL** (si el servicio web y la base están en la misma región de Render)
     y pegalo acá.
   - `NODE_ENV` → `production`
4. Guardá y esperá a que despliegue. Abrí la URL que te da Render.

## Paso 3 — Usarla

1. Entrá a la URL con el usuario `admin` y la contraseña de `APP_PASSWORD`. Cambiala desde "Cambiar contraseña" y creá las cuentas de cada profesional en "Gestionar usuarios".
2. Creá casos, completá los tests, generá informes: todo se guarda en la base de datos.
3. Desde cualquier otro dispositivo, entrando a la misma URL con la misma contraseña,
   vas a ver los mismos casos.

## Cómo actualizar la app más adelante

Cualquier cambio que quieras (ajustar el cruce entre tests, cambiar textos, agregar
algo) se hace editando estos archivos y hacé:
```bash
git add .
git commit -m "Descripción del cambio"
git push
```
Render vuelve a desplegar solo con cada `push` a la rama principal.

## Migrar datos que ya tenías en la versión anterior (sin servidor)

Si veías casos guardados en la versión que corría solo en el navegador (el artefacto
de Claude), podés pasarlos a esta:
1. Abrí esa versión anterior, entrá a "Respaldo de datos" y tocá "Copiar respaldo".
2. Entrá a esta app nueva (ya con sesión iniciada), abrí "Respaldo de datos" → pegá
   el texto en el cuadro → "Importar".

## Notas y limitaciones a tener en cuenta

- **Contraseña única**: no hay usuarios separados; cualquiera que tenga la contraseña
  ve todos los casos. Para uso personal o de un equipo chico y de confianza está bien;
  para separar por profesional habría que sumar cuentas individuales.
- **Render Free**: el servicio web "se duerme" tras un rato sin uso y tarda unos
  segundos en responder la primera vez que se lo despierta; es normal. La base de
  datos PostgreSQL gratuita de Render expira a los 90 días si no la actualizás a un
  plan pago — hacé un respaldo (botón "Copiar respaldo") antes de esa fecha, o pasate
  a un plan pago de base de datos con anticipación.
- **Datos sensibles**: son casos de orientación vocacional con información personal.
  Guardá la contraseña de forma segura y no la compartas por canales inseguros.
- Todo el detalle de qué mide cada test, cómo se arma el informe y las notas técnicas
  sobre los baremos (algunas particularidades de las fuentes originales que se
  documentaron durante el desarrollo) están dentro del propio informe que genera la app.


## Migración desde la versión de contraseña única

Al arrancar, el servidor agrega la columna `owner` a `cases` y asigna todos los casos
existentes al primer administrador. Si querés repartirlos entre profesionales, que cada
uno use "Respaldo de datos" → importar desde la sesión del administrador, o pedime un
script de reasignación.
