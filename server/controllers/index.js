const userController = require('./userController')
const valveController = require('./valveController')
const greenhouseController = require('./greenhouseController')

const solutionHistoryController = require('./solutionHistoryController')
const wateringHistoryController = require('./wateringHistoryController')
const drainHistoryController = require('./drainHistoryController')

// Добавляйте новые по мере создания:
// const tankController = require('./tankController')
// const tankPurposeController = require('./tankPurposeController')
// const additiveController = require('./additiveController')
// const dailyConditionController = require('./dailyConditionController')
// const solutionCompositionController = require('./solutionCompositionController')
// const greenhouseValveController = require('./greenhouseValveController')

module.exports = {
    userController,
    valveController,
    greenhouseController,
    solutionHistoryController,
    wateringHistoryController,
    drainHistoryController,
    // tankController,
    // tankPurposeController,
    // additiveController,
    // dailyConditionController,
    // solutionCompositionController,
    // greenhouseValveController,
}