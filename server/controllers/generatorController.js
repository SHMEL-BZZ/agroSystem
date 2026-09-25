const path = require('path')
const { spawn } = require('child_process')
const ApiError = require('../error/ApiError')
const { DailyCondition, DrainHistory } = require('../models/models')
const { Op } = require('sequelize')

// ─────────────────────────────────────────────────────────────
// ПУТИ (generators/ лежит в корне проекта, рядом с server/)
// ─────────────────────────────────────────────────────────────
// __dirname      = D:\...\agroSystem\server\controllers
// '..'           = D:\...\agroSystem\server
// '..', '..'     = D:\...\agroSystem
// + 'generators' = D:\...\agroSystem\generators
//
const PROJECT_ROOT = path.resolve(__dirname, '..', '..')
const GENERATORS_ROOT = path.join(PROJECT_ROOT, 'generators')
const GENERATORS_SRC = path.join(GENERATORS_ROOT, 'src')

// ─────────────────────────────────────────────────────────────
// КАРТА ГЕНЕРАТОРОВ
// ─────────────────────────────────────────────────────────────
const GENERATORS = {
    'drainage': {
        file: 'generator_drenage.py',
        args: [],
        cwd: GENERATORS_SRC,
    },
    'devices-summer': {
        file: 'generator.py',
        args: ['--scenario', '1'],
        cwd: GENERATORS_SRC,
    },
    'devices-offseason': {
        file: 'generator.py',
        args: ['--scenario', '2'],
        cwd: GENERATORS_SRC,
    },
    'devices-test': {
        file: 'generator.py',
        args: ['--scenario', '3'],
        cwd: GENERATORS_SRC,
    },
}

const PYTHON = process.platform === 'win32' ? 'python' : 'python3'

const runningJobs = new Map()

class GeneratorController {
    async list(req, res) {
        return res.json(Object.keys(GENERATORS))
    }

    async run(req, res, next) {
        try {
            const { name } = req.params
            const cfg = GENERATORS[name]

            if (!cfg) {
                return next(ApiError.badRequest(`Генератор "${name}" не найден`))
            }

            if (runningJobs.has(name) && runningJobs.get(name).status === 'running') {
                return next(ApiError.badRequest(`Генератор "${name}" уже запущен`))
            }

            const scriptPath = path.join(cfg.cwd, cfg.file)

            console.log(`[${name}] spawn: ${PYTHON} ${scriptPath} ${cfg.args.join(' ')}`)
            console.log(`[${name}] cwd:   ${cfg.cwd}`)

            const child = spawn(PYTHON, [scriptPath, ...cfg.args], {
                cwd: cfg.cwd,
                env: {
                    ...process.env,
                    PYTHONIOENCODING: 'utf-8',
                    PYTHONPATH: cfg.cwd,
                },
            })

            const job = {
                status: 'running',
                startedAt: new Date(),
                stdout: '',
                stderr: '',
                pid: child.pid,
            }
            runningJobs.set(name, job)

            child.stdout.on('data', (d) => {
                const txt = d.toString('utf8')
                job.stdout += txt
                console.log(`[${name}] ${txt.trim()}`)
            })

            child.stderr.on('data', (d) => {
                const txt = d.toString('utf8')
                job.stderr += txt
                console.error(`[${name} ERROR] ${txt.trim()}`)
            })

            child.on('close', (code) => {
                job.status = code === 0 ? 'done' : 'failed'
                job.exitCode = code
                job.finishedAt = new Date()
                console.log(`[${name}] завершён с кодом ${code}`)
            })

            child.on('error', (err) => {
                job.status = 'failed'
                job.stderr += err.message
                console.error(`[${name}] не удалось запустить: ${err.message}`)
            })

            return res.json({
                message: `Генератор "${name}" запущен`,
                pid: child.pid,
                status: 'running',
            })
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async status(req, res, next) {
        try {
            const { name } = req.params
            const job = runningJobs.get(name)
            if (!job) return res.json({ status: 'idle' })
            return res.json({
                status: job.status,
                startedAt: job.startedAt,
                finishedAt: job.finishedAt,
                exitCode: job.exitCode,
                stdout: job.stdout.slice(-2000),
                stderr: job.stderr.slice(-2000),
            })
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }
    // GET /api/generators/:name/data?date=YYYY-MM-DD
    async data(req, res, next) {
        try {
            const { name } = req.params
            const { date } = req.query

            if (!date) {
                return next(ApiError.badRequest('Параметр date обязателен'))
            }

            // Диапазон суток: с 00:00:00 до 23:59:59 указанной даты
            const start = new Date(date + 'T00:00:00.000Z')
            const end = new Date(date + 'T23:59:59.999Z')

            let rows = []

            if (name === 'devices-summer' || name === 'devices-offseason' || name === 'devices-test') {
                rows = await DailyCondition.findAll({
                    where: { date: date },              // ← просто строка 'YYYY-MM-DD'
                    order: [['date', 'ASC']],
                })
            } else if (name === 'drainage') {
                rows = await DrainHistory.findAll({
                    where: {
                        measurementTime: { [Op.between]: [start, end] },
                    },
                    order: [['measurementTime', 'ASC']],
                    limit: 200,
                })
            }

            return res.json(rows)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }
}

module.exports = new GeneratorController()