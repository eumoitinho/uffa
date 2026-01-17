const express = require('express');
const router = express.Router();
const openFinanceController = require('../controllers/openFinanceController');
const authMiddleware = require('../middleware/auth');

router.post('/webhook', openFinanceController.webhook);

router.use(authMiddleware);
router.post('/widget-token', openFinanceController.widgetToken);
router.post('/links', openFinanceController.registerLink);
router.get('/links', openFinanceController.listLinks);
router.post('/sync', openFinanceController.sync);

module.exports = router;
