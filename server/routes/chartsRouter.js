const Router = require('express');
const router = new Router();
const chartsController = require('../controllers/chartsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get(
    '/available-range',
    authMiddleware,
    chartsController.getAvailableRange
);

router.get(
    '/:chartId',
    authMiddleware,
    chartsController.getChartData
);

module.exports = router;