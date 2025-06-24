const express = require('express');
const { createDynamicQrOrder, getOrderStatus } = require('../controllers/shopbackController');

const router = express.Router();

router.post('/create-dynamic-qr-order', createDynamicQrOrder);
router.get('/order-status/:referenceId', getOrderStatus);

module.exports = router;