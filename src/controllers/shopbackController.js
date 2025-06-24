const { generateShopBackSignature } = require("../utils/shopback");
const { v4: uuidv4 } = require("uuid");

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

module.exports = {
  createDynamicQrOrder,
};
