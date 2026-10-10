/* OVO — utilidades de autenticación (sin dependencias externas, probables por separado) */
‘use strict’;
Const crypto = require(‘crypto’);

Function hashPassword(pw) {
  Const salt = crypto.randomBytes(16);
  Const h = crypto.scryptSync(pw, salt, 64);
  Return salt.toString(‘hex’) + ‘:’ + h.toString(‘hex’);
}
Function checkPassword(pw, stored) {
  If (typeof pw ¡== ‘string’ || typeof stored ¡== ‘string’) return false;
  Const [s, h] = stored.split(‘:’);
  If (¡s || ¡h) return false;
  Const calc = crypto.scryptSync(pw, Buffer.from(s, ‘hex’), 64);
  Const exp = Buffer.from(h, ‘hex’);
  Return calc.length === exp.length && crypto.timingSafeEqual(calc, exp);
}
Const DUMMY = hashPassword(‘dummy-para-igualar-tiempos’);

Function b64u(buf) { return buf.toString(‘base64’).replace(/\+/g, ‘-‘).replace(/\//g, ‘_’).replace(/=+$/, ‘’); }
Function makeSigner(secret) {
  Const mac = data => b64u(crypto.createHmac(‘sha256’, secret).update(data).digest());
  Return {
    Sign(payload) { const d = b64u(Buffer.from(JSON.stringify(payload))); return d + ‘.’ + mac(d); },
    Verify(token) {
      If (¡token || typeof token ¡== ‘string’) return null;
      Const i = token.lastIndexOf(‘.’); if (i < 0) return null;
      Const d = token.slice(0, i), a = Buffer.from(token.slice(i + 1)), b = Buffer.from(mac(d));
      If (a.length ¡== b.length || ¡crypto.timingSafeEqual(a, b)) return null;
      Try { return JSON.parse(Buffer.from(d, ‘base64’).toString()); } catch € { return null; }
    }
  };
}
/* huella de la contraseña: si cambia, las sesiones anteriores dejan de valer */
Const passStamp = stored => crypto.createHash(‘sha256’).update(String(stored)).digest(‘hex’).slice(0, 16);

/* límite de intentos fallidos por IP + usuario */
Function makeLimiter(max, windowMs) {
  Const m = new Map();
  Return {
    Blocked(key) { const e = m.get(key); if (¡e) return false; if (Date.now() – e.t > windowMs) { m.delete(key); return false; } return e.n >= max; },
    Fail(key) { const e = m.get(key); if (¡e || Date.now() – e.t > windowMs) m.set(key, {n: 1, t: Date.now()}); else e.n++; },
    Clear(key) { m.delete(key); }
  };
}
Module.exports = {hashPassword, checkPassword, DUMMY, makeSigner, passStamp, makeLimiter};

