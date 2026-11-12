// CORS для запросов с cookie (credentials) требует точного совпадения origin.
// CLIENT_URL может содержать несколько адресов через запятую; слэш на конце игнорируется.
// Вне production дополнительно разрешены любые http://localhost:* и http://127.0.0.1:*.
const normalize = (u) => u.trim().replace(/\/+$/, '')
const allowed = () =>
    (process.env.CLIENT_URL || '').split(',').map(normalize).filter(Boolean)
const isLocal = (o) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)

module.exports = {
    credentials: true,
    origin(origin, cb) {
        // запросы без Origin (curl, сервер-сервер) пропускаем
        if (!origin) return cb(null, true)
        if (allowed().includes(origin)) return cb(null, true)
        if (process.env.NODE_ENV !== 'production' && isLocal(origin)) return cb(null, true)
        return cb(null, false)
    },
}
