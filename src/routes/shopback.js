const express = require("express");
const {
  createDynamicQrOrder,
  scanConsumerQr,
  getOrderStatus,
  orderRefund,
} = require("../controllers/shopbackController");

const router = express.Router();

router.post("/create-dynamic-qr-order", createDynamicQrOrder);
router.post("/scan-consumer-qr", scanConsumerQr);
router.get("/order-status/:referenceId", getOrderStatus);
router.post("/order-refund/:referenceId", orderRefund);

module.exports = router;
