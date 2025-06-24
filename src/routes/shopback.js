const express = require('express');
const { createDynamicQrOrder } = require('../controllers/shopbackController');

const router = express.Router();

router.post('/create-dynamic-qr-order', createDynamicQrOrder);

module.exports = router;