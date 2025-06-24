const express = require("express");
const {
  createDynamicQrOrder,
  scanConsumerQr,
  getOrderStatus,
} = require("../controllers/shopbackController");

const router = express.Router();

router.post("/create-dynamic-qr-order", createDynamicQrOrder);
router.post("/scan-consumer-qr", scanConsumerQr);
router.get("/order-status/:referenceId", getOrderStatus);

module.exports = router;
