const { generateShopBackSignature } = require("../utils/shopback");
const { v4: uuidv4 } = require("uuid");

// User scan merchant's QR
const createDynamicQrOrder = async (req, res) => {
  try {
    const {
      posId,
      country,
      amount,
      currency,
      referenceId,
      qrType,
      partner,
      orderMetadata,
      webhookUrl,
    } = req.body;

    // Generate referenceId if not provided
    const finalReferenceId = referenceId || uuidv4();

    // Validate required fields
    if (!posId || !country || !amount || !currency || !qrType) {
      return res.status(400).json({
        statusCode: 400,
        message:
          "Missing required fields: posId, country, amount, currency, qrType",
      });
    }

    // Prepare request body
    const requestBody = {
      posId,
      country,
      amount,
      currency,
      referenceId: finalReferenceId,
      qrType,
      webhookUrl: `${process.env.NGROK_URL}${process.env.CALLBACK_PATH}`,
    };

    // Add optional fields if provided
    if (partner) {
      requestBody.partner = partner;
    }
    if (orderMetadata) {
      orderMetadata.merchantOrderReference = finalReferenceId;
      requestBody.orderMetadata = orderMetadata;
    }
    if (webhookUrl) {
      requestBody.webhookUrl = webhookUrl;
    }

    // Generate HMAC signature with full URL path
    const pathWithQuery = `${process.env.SHOPBACK_BASE_URL}/v1/instore/order/create`;
    const signatureData = generateShopBackSignature(
      "POST",
      pathWithQuery,
      requestBody,
    );

    // Prepare headers
    const headers = {
      Authorization: signatureData.authorizationHeader,
      Date: signatureData.date,
      "Content-Type": "application/json",
    };

    // Log the HTTP request
    console.log("=== ShopBack API Request ===");
    console.log("URL:", pathWithQuery);
    console.log("Method: POST");
    console.log("Headers:", JSON.stringify(headers, null, 2));
    console.log("Body:", JSON.stringify(requestBody, null, 2));
    console.log("============================\n");

    const response = await fetch(pathWithQuery, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();

    // Log the HTTP response
    console.log("=== ShopBack API Response ===");
    console.log("Status:", response.status);
    console.log(
      "Headers:",
      JSON.stringify(Object.fromEntries(response.headers), null, 2),
    );
    console.log("Body:", JSON.stringify(responseData, null, 2));
    console.log("=============================\n");

    if (!response.ok) {
      return res.status(response.status).json({
        statusCode: response.status,
        message: responseData.message || "ShopBack API Error",
        traceId: responseData.traceId,
      });
    }

    // Return successful response
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error creating dynamic QR order:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

const paymentCallback = async (req, res) => {
  try {
    console.log("=== ShopBack API Callback ===");
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Body:", JSON.stringify(req.body, null, 2));
    console.log("============================\n");

    const splitAuthorization = req.headers.authorization.split(" ");
    const splitSignature = splitAuthorization[1].split(":");
    const shopbackSignature = splitSignature[1];
    if (!shopbackSignature) {
      throw new Error("Missing shopback signature in the header");
    }

    const date = req.headers.date;
    if (!date) {
      throw new Error("Missing required date in the header");
    }

    const signatureData = generateShopBackSignature(
      "POST",
      `${process.env.NGROK_URL}${process.env.CALLBACK_PATH}`,
      req.body,
      "application/json",
      date,
    );

    const generatedSignature = signatureData.signature;

    if (shopbackSignature !== generatedSignature) {
      console.log(`Shopback signature: ${shopbackSignature}`);
      console.log(`Generated signature: ${generatedSignature}`);
      throw new Error("Failed to verify signature");
    } else {
      console.log("Signature verified, can proceed to update trx");
    }
  } catch (error) {
    throw new Error(`Unexpected error: ${error}`);
  }
};

// Merchant scan user's QR
const scanConsumerQr = async (req, res) => {
  try {
    const {
      posId,
      country,
      amount,
      currency,
      referenceId,
      consumerQrPayload,
      partner,
      orderMetadata,
      webhookUrl,
    } = req.body;

    // Generate referenceId if not provided
    const finalReferenceId = referenceId || uuidv4();

    // Validate required fields
    if (!posId || !country || !amount || !currency || !consumerQrPayload) {
      return res.status(400).json({
        statusCode: 400,
        message:
          "Missing required fields: posId, country, amount, currency, consumerQrPayload",
      });
    }

    // Prepare request body
    const requestBody = {
      posId,
      country,
      amount,
      currency,
      referenceId: finalReferenceId,
      consumerQrPayload,
    };

    // Add optional fields if provided
    if (partner) {
      requestBody.partner = partner;
    }
    if (orderMetadata) {
      orderMetadata.merchantOrderReference = finalReferenceId;
      requestBody.orderMetadata = orderMetadata;
    }
    if (webhookUrl) {
      requestBody.webhookUrl = webhookUrl;
    }

    // Generate HMAC signature with full URL path
    const pathWithQuery = `${process.env.SHOPBACK_BASE_URL}/v1/instore/order/scan`;
    const signatureData = generateShopBackSignature(
      "POST",
      pathWithQuery,
      requestBody,
    );

    // Prepare headers
    const headers = {
      Authorization: signatureData.authorizationHeader,
      Date: signatureData.date,
      "Content-Type": "application/json",
    };

    // Log the HTTP request
    console.log("=== ShopBack API Request ===");
    console.log("URL:", pathWithQuery);
    console.log("Method: POST");
    console.log("Headers:", JSON.stringify(headers, null, 2));
    console.log("Body:", JSON.stringify(requestBody, null, 2));
    console.log("============================\n");

    const response = await fetch(pathWithQuery, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();

    // Log the HTTP response
    console.log("=== ShopBack API Response ===");
    console.log("Status:", response.status);
    console.log(
      "Headers:",
      JSON.stringify(Object.fromEntries(response.headers), null, 2),
    );
    console.log("Body:", JSON.stringify(responseData, null, 2));
    console.log("=============================\n");

    if (!response.ok) {
      return res.status(response.status).json({
        statusCode: response.status,
        message: responseData.message || "ShopBack API Error",
        traceId: responseData.traceId,
      });
    }

    // Return successful response
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error scanning consumer QR:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

const getOrderStatus = async (req, res) => {
  try {
    const { referenceId } = req.params;

    // Validate required parameter
    if (!referenceId) {
      return res.status(400).json({
        statusCode: 400,
        message: "Missing required parameter: referenceId",
      });
    }

    // Generate HMAC signature with full URL path (GET request has empty body)
    const pathWithQuery = `${process.env.SHOPBACK_BASE_URL}/v1/instore/order/${referenceId}`;
    const signatureData = generateShopBackSignature("GET", pathWithQuery, {});

    // Prepare headers
    const headers = {
      Authorization: signatureData.authorizationHeader,
      Date: signatureData.date,
      "Content-Type": "application/json",
    };

    // Log the HTTP request
    console.log("=== ShopBack API Request ===");
    console.log("URL:", pathWithQuery);
    console.log("Method: GET");
    console.log("Headers:", JSON.stringify(headers, null, 2));
    console.log("============================\n");

    const response = await fetch(pathWithQuery, {
      method: "GET",
      headers: headers,
    });

    const responseData = await response.json();

    // Log the HTTP response
    console.log("=== ShopBack API Response ===");
    console.log("Status:", response.status);
    console.log(
      "Headers:",
      JSON.stringify(Object.fromEntries(response.headers), null, 2),
    );
    console.log("Body:", JSON.stringify(responseData, null, 2));
    console.log("=============================\n");

    if (!response.ok) {
      return res.status(response.status).json({
        statusCode: response.status,
        message: responseData.message || "ShopBack API Error",
        traceId: responseData.traceId,
      });
    }

    // Return successful response
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error getting order status:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

const orderRefund = async (req, res) => {
  try {
    const { referenceId } = req.params;
    const {
      amount,
      reason,
      referenceId: bodyReferenceId,
      posId,
      refundMetadata,
    } = req.body;

    // Validate required parameter and fields
    if (!referenceId) {
      return res.status(400).json({
        statusCode: 400,
        message: "Missing required parameter: referenceId",
      });
    }

    if (!amount) {
      return res.status(400).json({
        statusCode: 400,
        message: "Missing required field: amount",
      });
    }

    // Prepare request body
    const requestBody = {
      amount,
      referenceId: bodyReferenceId || referenceId,
    };

    // Add optional fields if provided
    if (reason) {
      requestBody.reason = reason;
    }
    if (posId) {
      requestBody.posId = posId;
    }
    if (refundMetadata) {
      requestBody.refundMetadata = refundMetadata;
    }

    // Generate HMAC signature with full URL path
    const pathWithQuery = `${process.env.SHOPBACK_BASE_URL}/v1/instore/order/${referenceId}/refund`;
    const signatureData = generateShopBackSignature(
      "POST",
      pathWithQuery,
      requestBody,
    );

    // Prepare headers
    const headers = {
      Authorization: signatureData.authorizationHeader,
      Date: signatureData.date,
      "Content-Type": "application/json",
    };

    // Log the HTTP request
    console.log("=== ShopBack API Request ===");
    console.log("URL:", pathWithQuery);
    console.log("Method: POST");
    console.log("Headers:", JSON.stringify(headers, null, 2));
    console.log("Body:", JSON.stringify(requestBody, null, 2));
    console.log("============================\n");

    const response = await fetch(pathWithQuery, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();

    // Log the HTTP response
    console.log("=== ShopBack API Response ===");
    console.log("Status:", response.status);
    console.log(
      "Headers:",
      JSON.stringify(Object.fromEntries(response.headers), null, 2),
    );
    console.log("Body:", JSON.stringify(responseData, null, 2));
    console.log("=============================\n");

    if (!response.ok) {
      return res.status(response.status).json({
        statusCode: response.status,
        message: responseData.message || "ShopBack API Error",
        traceId: responseData.traceId,
      });
    }

    // Return successful response
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { referenceId } = req.params;
    const { reason } = req.body;

    // Validate required parameter
    if (!referenceId) {
      return res.status(400).json({
        statusCode: 400,
        message: "Missing required parameter: referenceId",
      });
    }

    // Prepare request body (reason is optional)
    const requestBody = {};
    if (reason) {
      requestBody.reason = reason;
    }

    // Generate HMAC signature with full URL path
    const pathWithQuery = `${process.env.SHOPBACK_BASE_URL}/v1/instore/order/${referenceId}/cancel`;
    const signatureData = generateShopBackSignature(
      "POST",
      pathWithQuery,
      requestBody,
    );

    // Prepare headers
    const headers = {
      Authorization: signatureData.authorizationHeader,
      Date: signatureData.date,
      "Content-Type": "application/json",
    };

    // Log the HTTP request
    console.log("=== ShopBack API Request ===");
    console.log("URL:", pathWithQuery);
    console.log("Method: POST");
    console.log("Headers:", JSON.stringify(headers, null, 2));
    console.log("Body:", JSON.stringify(requestBody, null, 2));
    console.log("============================\n");

    const response = await fetch(pathWithQuery, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();

    // Log the HTTP response
    console.log("=== ShopBack API Response ===");
    console.log("Status:", response.status);
    console.log(
      "Headers:",
      JSON.stringify(Object.fromEntries(response.headers), null, 2),
    );
    console.log("Body:", JSON.stringify(responseData, null, 2));
    console.log("=============================\n");

    if (!response.ok) {
      return res.status(response.status).json({
        statusCode: response.status,
        message: responseData.message || "ShopBack API Error",
        traceId: responseData.traceId,
      });
    }

    // Return successful response
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error canceling order:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createDynamicQrOrder,
  paymentCallback,
  scanConsumerQr,
  getOrderStatus,
  orderRefund,
  cancelOrder,
};
