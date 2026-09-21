// Пример роутера
const {Example} = require('../models/models')
const ApiError = require('../error/ApiError');


class ExampleRouter {
    async create(req, res) {
        const {name} = req.body
        const brand = await Example.create({name})
        return res.json(brand)
    }

    async getAll(req, res) {
        const brands = await Example.findAll()
        return res.json(brands)
    }

}

module.exports = new ExampleRouter()