/* ==========================================
   SK MARKET — BOOST SERVICES
   Paystack Payment Connection
   ========================================== */

"use strict";

const MARKUP = 500;
const SERVER_URL = "http://localhost:3000";

/*
  IMPORTANT:
  These are placeholder prices, not confirmed supplier prices.
  The server independently calculates the real checkout price.
*/

const services = [
    { code: "tiktok_followers", name: "TikTok Followers", platform: "TikTok", price: 1500 },
    { code: "tiktok_likes", name: "TikTok Likes", platform: "TikTok", price: 1000 },
    { code: "tiktok_views", name: "TikTok Views", platform: "TikTok", price: 500 },

    { code: "instagram_followers", name: "Instagram Followers", platform: "Instagram", price: 2000 },
    { code: "instagram_likes", name: "Instagram Likes", platform: "Instagram", price: 1500 },
    { code: "instagram_views", name: "Instagram Views", platform: "Instagram", price: 800 },

    { code: "facebook_followers", name: "Facebook Followers", platform: "Facebook", price: 1800 },
    { code: "facebook_likes", name: "Facebook Likes", platform: "Facebook", price: 1200 },

    { code: "youtube_subscribers", name: "YouTube Subscribers", platform: "YouTube", price: 3500 },
    { code: "youtube_views", name: "YouTube Views", platform: "YouTube", price: 1500 },

    { code: "x_followers", name: "X Followers", platform: "X", price: 2500 },
    { code: "x_likes", name: "X Likes", platform: "X", price: 1500 }
];

/* PAGE ELEMENTS */

const form = document.getElementById("boostForm");

const nameInput = document.getElementById("customerName");
const emailInput = document.getElementById("customerEmail");
const phoneInput = document.getElementById("customerPhone");

const serviceSelect = document.getElementById("service");
const quantityInput = document.getElementById("quantity");
const targetInput = document.getElementById("target");

const selectedService = document.getElementById("selectedService");
const pricePer1000 = document.getElementById("pricePer1000");
const totalPrice = document.getElementById("totalPrice");
const buyButton = document.getElementById("buyBtn");

/* FORMAT NAIRA */

function formatNaira(amount) {
    return "₦" + Number(amount).toLocaleString("en-NG");
}

/* SELECTED PLATFORM */

function getSelectedPlatform() {
    const params = new URLSearchParams(window.location.search);

    let platform =
        params.get("platform") ||
        params.get("category") ||
        "";

    if (!platform) {
        const keys = [
            "skMarketSelectedPlatform",
            "selectedBoostPlatform",
            "selectedPlatform",
            "boostPlatform",
            "promotionPlatform"
        ];

        for (const key of keys) {
            const saved = localStorage.getItem(key);

            if (saved) {
                platform = saved;
                break;
            }
        }
    }

    platform = String(platform).trim().toLowerCase();

    if (platform.includes("tiktok") || platform.includes("tik tok")) {
        return "TikTok";
    }

    if (platform.includes("instagram")) return "Instagram";
    if (platform.includes("facebook")) return "Facebook";
    if (platform.includes("youtube")) return "YouTube";

    if (platform === "x" || platform.includes("twitter")) {
        return "X";
    }

    return "";
}

/* LOAD SERVICES */

function loadServices() {
    if (!serviceSelect) {
        console.error("Service dropdown not found.");
        return;
    }

    const platform = getSelectedPlatform();

    const availableServices = platform
        ? services.filter(service => service.platform === platform)
        : services;

    serviceSelect.innerHTML = "";

    const firstOption = document.createElement("option");
    firstOption.value = "";
    firstOption.textContent = availableServices.length
        ? "Choose a service"
        : "No services available";

    serviceSelect.appendChild(firstOption);

    availableServices.forEach(service => {
        const option = document.createElement("option");
        option.value = service.code;
        option.textContent = service.name;
        serviceSelect.appendChild(option);
    });

    if (quantityInput) {
        quantityInput.min = "100";
        quantityInput.max = "20000";
        quantityInput.step = "100";

        if (!quantityInput.value) {
            quantityInput.value = "100";
        }
    }

    updatePrice();
}

/* GET SELECTED SERVICE */

function getCurrentService() {
    return services.find(
        service => service.code === serviceSelect?.value
    ) || null;
}

/* DISPLAY ESTIMATED PRICE */

function updatePrice() {
    const service = getCurrentService();
    const quantity = Number(quantityInput?.value);

    if (selectedService) {
        selectedService.textContent = service
            ? service.name
            : "No service selected";
    }

    if (!service) {
        if (pricePer1000) pricePer1000.textContent = "—";
        if (totalPrice) totalPrice.textContent = formatNaira(0);
        return;
    }

    const estimatedPricePer1000 = service.price + MARKUP;

    const validQuantity =
        Number.isInteger(quantity) &&
        quantity >= 100 &&
        quantity <= 20000 &&
        quantity % 100 === 0;

    const total = validQuantity
        ? Math.round(estimatedPricePer1000 * quantity / 1000)
        : 0;

    if (pricePer1000) {
        pricePer1000.textContent =
            formatNaira(estimatedPricePer1000) + " per 1,000 (estimate)";
    }

    if (totalPrice) {
        totalPrice.textContent = formatNaira(total);
    }
}

/* INITIALIZE PAYMENT */

async function startPayment(event) {
    event.preventDefault();

    if (!form || !form.reportValidity()) {
        return;
    }

    const customerName = nameInput.value.trim();
    const customerEmail = emailInput.value.trim();
    const customerPhone = phoneInput.value.trim();

    const service = getCurrentService();
    const quantity = Number(quantityInput.value);
    const target = targetInput.value.trim();

    if (!customerName || !customerEmail || !customerPhone) {
        alert("Please enter your name, email address, and phone number.");
        return;
    }

    if (!service) {
        alert("Please choose a boost service.");
        return;
    }

    if (
        !Number.isInteger(quantity) ||
        quantity < 100 ||
        quantity > 20000 ||
        quantity % 100 !== 0
    ) {
        alert("Enter a quantity from 100 to 20,000 in increments of 100.");
        return;
    }

    if (!target) {
        alert("Please enter your profile link or username.");
        return;
    }

    if (buyButton) {
        buyButton.disabled = true;
        buyButton.textContent = "Connecting to Paystack...";
    }

    try {
        const response = await fetch(
            SERVER_URL + "/api/paystack/initialize",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: customerEmail,
                    serviceCode: service.code,
                    quantity: quantity,
                    target: target,
                    customerName: customerName,
                    customerPhone: customerPhone
                })
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Unable to start payment."
            );
        }

        if (!result.authorization_url) {
            throw new Error("Paystack did not return a payment link.");
        }

        window.location.href = result.authorization_url;

    } catch (error) {
        console.error("SK Market payment error:", error);

        alert(
            error.message ||
            "Unable to connect to the payment server. Please try again."
        );

    } finally {
        if (buyButton) {
            buyButton.disabled = false;
            buyButton.textContent = "Pay Now";
        }
    }
}

/* CONNECT EVENTS */

if (serviceSelect) {
    serviceSelect.addEventListener("change", updatePrice);
}

if (quantityInput) {
    quantityInput.addEventListener("input", updatePrice);
}

if (form) {
    form.addEventListener("submit", startPayment);
}

/* START */

loadServices();