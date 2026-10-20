const { onRequest } = require("firebase-functions/v2/https"); const { defineSecret } = require("firebase-functions/params"); const axios = require("axios");
const paystackSecret = defineSecret("PAYSTACK_SECRET_KEY");
/* ================================= INITIALIZE PAYSTACK PAYMENT ================================= */
exports.initializePaystackPayment = onRequest( { secrets: [paystackSecret], cors: true },
async (req, res) => {
if (req.method !== "POST") {
  return res.status(405).json({
    success: false,
    message: "Only POST requests are allowed."
  });
}

const {
  email,
  amount,
  reference,
  metadata
} = req.body || {};

if (!email) {
  return res.status(400).json({
    success: false,
    message: "Customer email is required."
  });
}

if (!amount) {
  return res.status(400).json({
    success: false,
    message: "Payment amount is required."
  });
}

try {
  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: email,
      amount: String(Number(amount) * 100),
      currency: "NGN",
      reference: reference || undefined,
      metadata: metadata || undefined
    },
    {
      headers: {
        Authorization:
          "Bearer " + paystackSecret.value(),
        "Content-Type": "application/json"
      }
    }
  );

  const payment = response.data;

  if (
    payment.status !== true ||
    !payment.data
  ) {
    return res.status(400).json({
      success: false,
      message:
        payment.message ||
        "Unable to initialize payment."
    });
  }

  return res.status(200).json({
    success: true,
    authorization_url:
      payment.data.authorization_url,
    access_code:
      payment.data.access_code,
    reference:
      payment.data.reference
  });

} catch (error) {
  console.error(
    "Paystack initialization error:",
    error.response?.data ||
    error.message
  );

  return res.status(500).json({
    success: false,
    message: "Unable to initialize payment."
  });
}
} );
/* ================================= VERIFY PAYSTACK PAYMENT ================================= */
exports.verifyPaystackPayment = onRequest( { secrets: [paystackSecret], cors: true },
async (req, res) => {
if (req.method !== "POST") {
  return res.status(405).json({
    success: false,
    message: "Only POST requests are allowed."
  });
}

const reference =
  req.body &&
  req.body.reference;

if (!reference) {
  return res.status(400).json({
    success: false,
    message: "Payment reference is required."
  });
}

try {
  const response = await axios.get(
    "https://api.paystack.co/transaction/verify/" +
    encodeURIComponent(reference),
    {
      headers: {
        Authorization:
          "Bearer " + paystackSecret.value()
      }
    }
  );

  const payment = response.data;

  if (
    payment.status === true &&
    payment.data &&
    payment.data.status === "success"
  ) {
    return res.status(200).json({
      success: true,
      verified: true,
      reference:
        payment.data.reference,
      amount:
        payment.data.amount,
      currency:
        payment.data.currency,
      status:
        payment.data.status
    });
  }

  return res.status(200).json({
    success: true,
    verified: false,
    reference: reference,
    status:
      payment.data &&
      payment.data.status
        ? payment.data.status
        : "unknown"
  });

} catch (error) {
  console.error(
    "Paystack verification error:",
    error.response?.data ||
    error.message
  );

  return res.status(500).json({
    success: false,
    message: "Unable to verify payment."
  });
}
} );