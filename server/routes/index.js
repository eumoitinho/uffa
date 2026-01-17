const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const openFinanceRoutes = require('./openfinance');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/openfinance', openFinanceRoutes);

module.exports = router;
