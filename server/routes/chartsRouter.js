const Router = require('express');
const router = new Router();
const chartsController = require('../controllers/chartsController');

router.get('/available-range', chartsController.getAvailableRange);
router.get('/:chartId', chartsController.getChartData);

module.exports = router;