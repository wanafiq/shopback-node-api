const crypto = require("crypto");
const moment = require("moment");
require("dotenv").config();

const ACCESS_KEY = process.env.SHOPBACK_ACCESS_KEY;
const ACCESS_KEY_SECRET = process.env.SHOPBACK_ACCESS_KEY_SECRET;

function createSHA256Digest(sortedBody) {
  if (!sortedBody || Object.keys(sortedBody).length === 0) {
    return "";
  }
  const bodyString = JSON.stringify(sortedBody);
  console.log("Sorted body for hashing:", bodyString);
  const hash = crypto.createHash("sha256");
  hash.update(bodyString);
  const digest = hash.digest("hex");
  console.log("Content digest:", digest);
  return digest;
}

function createHmacSignature(str, secret) {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(str);
  return hmac.digest("hex");
}

function computeRequestSignature(req, secret) {
  const { method, pathWithQuery, body, contentType, date } = req;
  const contentDigest = createSHA256Digest(body);
  const payload = `${method.toUpperCase()}\n${contentType}\n${date}\n${pathWithQuery}\n${contentDigest}`;
  console.log("");
  console.log("Payload to sign:");
  console.log("---");
  console.log(payload);
  console.log("---");
  const signature = createHmacSignature(payload, secret);
  console.log("Signature: ", signature);
  console.log("");
  return signature;
}

function alphabeticallySortBody(body) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return body;
  }

  const sortedKeys = Object.keys(body).sort();
  const sortedObj = {};

  sortedKeys.forEach((key) => {
    if (
      typeof body[key] === "object" &&
      body[key] !== null &&
      !Array.isArray(body[key])
    ) {
      sortedObj[key] = alphabeticallySortBody(body[key]);
    } else {
      sortedObj[key] = body[key];
    }
  });

  return sortedObj;
}

function generateShopBackSignature(
  method,
  pathWithQuery,
  body = {},
  contentType = "application/json",
) {
  // const date = moment().toISOString();
  const date = moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
  const sortedBody = alphabeticallySortBody(body);

  const req = {
    method,
    pathWithQuery,
    body: sortedBody,
    contentType,
    date,
  };

  const signature = computeRequestSignature(req, ACCESS_KEY_SECRET);

  return {
    signature,
    date,
    authorizationHeader: `SB1-HMAC-SHA256 ${ACCESS_KEY}:${signature}`,
  };
}

module.exports = {
  generateShopBackSignature,
};
