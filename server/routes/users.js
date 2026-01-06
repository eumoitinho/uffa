const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const transactionController = require('../controllers/transactionController');
const upload = require('../middleware/upload');

// Rotas de usuário
router.get('/:id', userController.getById);
router.put('/:id', userController.update);
router.get('/:id/photo', userController.getPhoto);
router.post('/:id/photo', upload.single('photo'), userController.uploadPhoto);

// Rotas de transações do usuário
router.get('/:userId/transactions', transactionController.getAll);
router.get('/:userId/transactions/:transactionId', transactionController.getById);
router.post('/:userId/transactions', transactionController.create);
router.put('/:userId/transactions/:transactionId', transactionController.update);
router.delete('/:userId/transactions/:transactionId', transactionController.delete);

module.exports = router;
