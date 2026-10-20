"use strict";

require("dotenv").config();

const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const TASKLETPAY_API_KEY = process.env.TASKLETPAY_API_KEY;

const PAYSTACK_URL = "https://api.paystack.co";
const TASKLETPAY_URL = "https://taskletpay.com/api/v2";

const MARKUP_PER_1000 = 500;

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));

// --------------------------------------------------
// BOOST SERVICE CONFIGURATION
// --------------------------------------------------

const SERVICES = {
    tiktok_followers: {
        name: "TikTok Followers",
        platform: "TikTok",
        supplierServiceId: 21,
        supplierPricePer1000: null,
        minQuantity: 50,
        maxQuantity: 1000
    },

    tiktok_likes: {
        name: "TikTok Likes",
        platform: "TikTok",
        supplierServiceId: 22,
        supplierPricePer1000: null,
        minQuantity: 50,
        maxQuantity: 1000
    },

    tiktok_comments: {
        name: "TikTok Comments",
        platform: "TikTok",
        supplierServiceId: 23,
        supplierPricePer1000: null,
        minQuantity: 50,
        maxQuantity: 1000
    },

    instagram_followers: {
        name: "Instagram Followers",
        platform: "Instagram",
        supplierServiceId: 15,
        supplierPricePer1000: null,
        minQuantity: 50,
        maxQuantity: 1000
    },

    instagram_likes: {
        name: "Instagram Likes",
        platform: "Instagram",
        supplierServiceId: 16,
        supplierPricePer1000: null,
        minQuantity: 50,
        maxQuantity: 1000
    },

    instagram_comments: {
        name: "Instagram Comments",
        platform: "Instagram",
        supplierServiceId: 17,
        supplierPricePer1000: null,
        minQuantity: 50,
        maxQuantity: 1000
    },

    instagram_views: {
        name: "Instagram Views",
        platform: "Instagram",
        supplierServiceId: 20,
        supplierPricePer1000: null,
        minQuantity: 50,
        maxQuantity: 1000
    },

    facebook_story_shares: {
        name: "Facebook Story Shares",
        platform: "Facebook",
        supplierServiceId: 76,
        supplierPricePer1000: null,
        minQuantity: 50,
        maxQuantity: 1000
    },

    facebook_post_shares: {
        name: "Facebook Post Shares",
        platform: "Facebook",
        supplierServiceId: 77,
        supplierPricePer1000: null,
        minQuantity: 50,
        maxQuantity: 1000
    },

    tiktok_story_shares: {
        name: "TikTok Story Shares",
        platform: "TikTok",
        supplierServiceId: 78,
        supplierPricePer1000: null,
        minQuantity: 50,
        maxQuantity: 1000
    },

    tiktok_sound_uses: {
        name: "TikTok Sound Uses",
        platform: "TikTok",
        supplierServiceId: 74,
        supplierPricePer1000: null,
        minQuantity: 50,
        maxQuantity: 1000
    },

    linkedin_connections: {
        name: "LinkedIn Connections",
        platform: "LinkedIn",
        supplierServiceId: 69,
        supplierPricePer1000: null,
        minQuantity: 50,
        maxQuantity: 1000
    },

    linkedin_likes: {
        name: "LinkedIn Likes",
        platform: "LinkedIn",
        supplierServiceId: 70,
        supplierPricePer1000: null,
        minQuantity: 50,
        maxQuantity: 1000
    },

    linkedin_comments: {
        name: "LinkedIn Comments",
        platform: "LinkedIn",
        supplierServiceId: 71,
        supplierPricePer1000: null,
        minQuantity: 50,
        maxQuantity: 1000
    },

    linkedin_reposts: {
        name: "LinkedIn Reposts",
        platform: "LinkedIn",
        supplierServiceId: 73,
        supplierPricePer1000: null,
        minQuantity: 50,
        maxQuantity: 1000
    },

    youtube_subscribers: {
        name: "YouTube Subscribers",
        platform: "YouTube",
        supplierServiceId: null,
        supplierPricePer1000: null,
        minQuantity: 50,
        maxQuantity: 1000
    },

    youtube_views: {
        name: "YouTube Views",
        platform: "YouTube",
        supplierServiceId: null,
        supplierPricePer1000: null,
        minQuantity: 50,
        maxQuantity: 1000
    },

    x_followers: {
        name: "X Followers",
        platform: "X",
        supplierServiceId: null,
        supplierPricePer1000: null,
        minQuantity: 50,
        maxQuantity: 1000
    },

    x_likes: {
        name: "X Likes",
        platform: "X",
        supplierServiceId: null,
        supplierPricePer1000: null,
        minQuantity: 50,
        maxQuantity: 1000
    }
};

// Temporary storage for local testing.
// Orders are lost when the server restarts.
const orders = new Map();

// --------------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------------

function calculateCustomerPrice(service, quantity) {
    if (!Number.isInteger(quantity)) {
        throw new Error("Quantity must be a whole number.");
    }

    if (
        quantity < service.minQuantity ||
        quantity > service.maxQuantity
    ) {
        throw new Error(
            `Quantity must be between ${service.minQuantity} and ${service.maxQuantity}.`
        );
    }

    if (
        !Number.isInteger(service.supplierServiceId) ||
        !Number.isFinite(service.supplierPricePer1000) ||
        service.supplierPricePer1000 <= 0
    ) {
        throw new Error(
            "This service is not available for payment yet because its supplier price has not been confirmed."
        );
    }

    return Math.ceil(
        (service.supplierPricePer1000 + MARKUP_PER_1000) *
        quantity / 1000
    );
}

function cleanEmail(email) {
    return typeof email === "string"
        ? email.trim().toLowerCase()
        : "";
}

function validTarget(target) {
    if (typeof target !== "string") {
        return false;
    }

    try {
        const url = new URL(target.trim());

        return (
            target.trim().length <= 500 &&
            target.trim().length >= 5 &&
            ["http:", "https:"].includes(url.protocol)
        );
    } catch {
        return false;
    }
}

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "SK Market API is working!"
    });
});

// --------------------------------------------------
// BOOST SERVICES
// --------------------------------------------------

app.get("/api/boost/services", (req, res) => {
    const services = Object.entries(SERVICES).map(
        ([code, service]) => ({
            code,
            name: service.name,
            platform: service.platform,
            minQuantity: service.minQuantity,
            maxQuantity: service.maxQuantity,

            paymentEnabled:
                Number.isInteger(service.supplierServiceId) &&
                Number.isFinite(service.supplierPricePer1000) &&
                service.supplierPricePer1000 > 0
        })
    );

    res.status(200).json({
        success: true,
        markupPer1000: MARKUP_PER_1000,
        services
    });
});

// --------------------------------------------------
// INITIALIZE PAYSTACK PAYMENT
// --------------------------------------------------

app.post("/api/paystack/initialize", async (req, res) => {
    try {
        if (!PAYSTACK_SECRET_KEY) {
            return res.status(503).json({
                success: false,
                message: "Paystack is not configured on the server."
            });
        }

        const email = cleanEmail(req.body.email);
        const serviceCode = req.body.serviceCode;
        const quantity = Number(req.body.quantity);
        const target = typeof req.body.target === "string"
            ? req.body.target.trim()
            : "";

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid email address."
            });
        }

        if (
            typeof serviceCode !== "string" ||
            !Object.hasOwn(SERVICES, serviceCode)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid service."
            });
        }

        const service = SERVICES[serviceCode];

        if (!validTarget(target)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid social media link."
            });
        }

        let amountNaira;

        try {
            amountNaira = calculateCustomerPrice(
                service,
                quantity
            );
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        const reference =
            "SKB_" + crypto.randomUUID().replace(/-/g, "");

        const order = {
            reference,
            email,
            serviceCode,
            serviceName: service.name,
            supplierServiceId: service.supplierServiceId,
            quantity,
            target,
            amountNaira,
            status: "payment_pending",
            createdAt: new Date().toISOString(),
            supplierOrderId: null
        };

        orders.set(reference, order);

        const response = await axios.post(
            `${PAYSTACK_URL}/transaction/initialize`,
            {
                email,
                amount: amountNaira * 100,
                currency: "NGN",
                reference,
                callback_url:
                    `${req.protocol}://${req.get("host")}/boost-payment-result.html`,
                metadata: {
                    order_reference: reference,
                    service_code: serviceCode,
                    service_name: service.name,
                    quantity
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 20000
            }
        );

        const paymentData = response.data?.data;

        if (
            response.data?.status !== true ||
            !paymentData?.authorization_url
        ) {
            orders.delete(reference);

            return res.status(502).json({
                success: false,
                message: "Paystack did not return a payment link."
            });
        }

        return res.json({
            success: true,
            reference,
            authorization_url: paymentData.authorization_url,
            amount: amountNaira,
            currency: "NGN"
        });

    } catch (error) {
        console.error(
            "Paystack initialization error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to start payment. Please try again."
        });
    }
});

// --------------------------------------------------
// VERIFY PAYMENT AND SUBMIT TASKLETPAY ORDER
// --------------------------------------------------

app.post("/api/paystack/verify", async (req, res) => {
    try {
        if (!PAYSTACK_SECRET_KEY) {
            return res.status(503).json({
                success: false,
                message: "Paystack is not configured."
            });
        }

        const reference = typeof req.body.reference === "string"
            ? req.body.reference.trim()
            : "";

        if (!reference) {
            return res.status(400).json({
                success: false,
                message: "Payment reference is required."
            });
        }

        const order = orders.get(reference);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found in this server session. Contact support before paying again."
            });
        }

        if (order.status === "submitted") {
            return res.json({
                success: true,
                status: order.status,
                supplierOrderId: order.supplierOrderId,
                message: "Your order has already been submitted."
            });
        }

        if (order.status === "processing") {
            return res.status(409).json({
                success: false,
                status: order.status,
                message: "This order is already being processed."
            });
        }

        const paymentResponse = await axios.get(
            `${PAYSTACK_URL}/transaction/verify/${encodeURIComponent(reference)}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
                },
                timeout: 20000
            }
        );

        const payment = paymentResponse.data?.data;

        if (
            paymentResponse.data?.status !== true ||
            payment?.status !== "success" ||
            payment.reference !== reference ||
            payment.currency !== "NGN" ||
            Number(payment.amount) !== order.amountNaira * 100
        ) {
            return res.status(402).json({
                success: false,
                message: "Payment has not been verified as successful."
            });
        }

        if (!TASKLETPAY_API_KEY) {
            order.status = "paid_supplier_not_configured";

            return res.status(503).json({
                success: false,
                paid: true,
                status: order.status,
                message: "Payment succeeded, but the supplier connection is not configured. Contact support and do not pay again."
            });
        }

        order.status = "processing";

        try {
            const supplierResponse = await axios.post(
                TASKLETPAY_URL,
                {
                    key: TASKLETPAY_API_KEY,
                    action: "add",
                    service: order.supplierServiceId,
                    link: order.target,
                    quantity: order.quantity
                },
                {
                    timeout: 30000
                }
            );

            const supplierOrderId =
                supplierResponse.data?.order;

            if (!supplierOrderId) {
                order.status = "paid_supplier_error";

                console.error(
                    "TaskletPay did not confirm the order:",
                    supplierResponse.data
                );

                return res.status(502).json({
                    success: false,
                    paid: true,
                    status: order.status,
                    message: "Payment succeeded, but supplier submission needs attention. Contact support and do not pay again."
                });
            }

            order.status = "submitted";
            order.supplierOrderId = String(supplierOrderId);
            order.paidAt = new Date().toISOString();

            return res.json({
                success: true,
                status: "submitted",
                supplierOrderId: order.supplierOrderId,
                message: "Payment verified and your order was submitted."
            });

        } catch (supplierError) {
            order.status = "paid_supplier_error";

            console.error(
                "TaskletPay submission error:",
                supplierError.response?.data ||
                supplierError.message
            );

            return res.status(502).json({
                success: false,
                paid: true,
                status: order.status,
                message: "Payment succeeded, but supplier submission needs attention. Contact support and do not pay again."
            });
        }

    } catch (error) {
        console.error(
            "Payment verification error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to verify payment. Do not pay again; contact support if money was deducted."
        });
    }
});

// --------------------------------------------------
// CHECK ORDER STATUS
// --------------------------------------------------

app.get("/api/boost/order/:reference", (req, res) => {
    const order = orders.get(req.params.reference);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: "Order not found in this server session."
        });
    }

    return res.json({
        success: true,
        order: {
            reference: order.reference,
            serviceName: order.serviceName,
            quantity: order.quantity,
            amountNaira: order.amountNaira,
            status: order.status,
            supplierOrderId: order.supplierOrderId,
            createdAt: order.createdAt
        }
    });
});

// --------------------------------------------------
// WEBSITE FILES
// --------------------------------------------------

app.use(express.static(path.join(__dirname)));

// --------------------------------------------------
// UNKNOWN API ROUTES
// --------------------------------------------------

app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found.",
        path: req.originalUrl
    });
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, "127.0.0.1", () => {
    console.log(`SK Market server running on http://127.0.0.1:${PORT}`);
});

app.on("error", (error) => {
    console.error("SK Market server error:", error.message);
});