// Минимальный разбор Cookie-заголовка (пакет cookie-parser не установлен).
module.exports = function cookieParser(req, res, next) {
    const cookies = {}
    const header = req.headers.cookie
    if (header) {
        for (const part of header.split(';')) {
            const i = part.indexOf('=')
            if (i < 0) continue
            const key = part.slice(0, i).trim()
            let val = part.slice(i + 1).trim()
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
            try { cookies[key] = decodeURIComponent(val) } catch { cookies[key] = val }
        }
    }
    req.cookies = cookies
    next()
}
