// nodemailer подключается лениво: если пакет не установлен или SMTP не настроен,
// регистрация не падает, а ссылка активации выводится в консоль.
class MailService {
    constructor() {
        this.transporter = null
    }

    getTransporter() {
        if (this.transporter) return this.transporter
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null
        try {
            const nodemailer = require('nodemailer')
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: Number(process.env.SMTP_PORT) === 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD
                }
            })
        } catch (e) {
            console.warn('nodemailer не установлен (npm i nodemailer), письма не отправляются')
            return null
        }
        return this.transporter
    }

    // Возвращает true, если письмо отправлено. Ошибка почты не должна ломать регистрацию.
    async sendActivationMail(to, link) {
        const transporter = this.getTransporter()
        if (!transporter) {
            console.log(`[mail] Ссылка активации для ${to}: ${link}`)
            return false
        }
        try {
            await transporter.sendMail({
                from: process.env.SMTP_USER,
                to,
                subject: 'Активация аккаунта на ' + (process.env.API_URL || 'сайте'),
                text: `Для активации перейдите по ссылке: ${link}`,
                html: `
                    <div>
                        <h1>Для активации перейдите по ссылке</h1>
                        <a href="${link}">${link}</a>
                    </div>
                `
            })
            return true
        } catch (e) {
            console.error('[mail] Не удалось отправить письмо:', e.message)
            return false
        }
    }
}

module.exports = new MailService()
