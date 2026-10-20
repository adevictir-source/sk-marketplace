import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    firebaseConfig,
    SK_CONFIG
} from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let cart = JSON.parse(
    localStorage.getItem("skMarketCart")
) || [];

const checkoutItems = document.getElementById("checkoutItems");
const checkoutItemCount = document.getElementById("checkoutItemCount");
const checkoutSummaryItems = document.getElementById("checkoutSummaryItems");
const checkoutSubtotal = document.getElementById("checkoutSubtotal");
const checkoutTotal = document.getElementById("checkoutTotal");
const checkoutMessage = document.getElementById("checkoutMessage");
const payButton = document.getElementById("payButton");

function formatMoney(amount) {
    return "₦" + Number(amount).toLocaleString();
}

function getTotalItems() {
    return cart.reduce(
        (total, item) => total + Number(item.quantity),
        0
    );
}

function getCartTotal() {
    return cart.reduce(
        (total, item) =>
            total + Number(item.price) * Number(item.quantity),
        0
    );
}

function updateSummary() {
    const count = getTotalItems();
    const total = getCartTotal();

    if (checkoutItemCount) {
        checkoutItemCount.textContent =
            count + (count === 1 ? " item" : " items");
    }

    if (checkoutSummaryItems) {
        checkoutSummaryItems.textContent = count;
    }

    if (checkoutSubtotal) {
        checkoutSubtotal.textContent = formatMoney(total);
    }

    if (checkoutTotal) {
        checkoutTotal.textContent = formatMoney(total);
    }
}

function showCheckout() {
    if (!checkoutItems) return;

    if (cart.length === 0) {
        checkoutItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h2>Your cart is empty</h2>
                <p>Add a product before checking out.</p>
                <a href="Index.html#products"
                   class="empty-cart-button">Browse Products</a>
            </div>
        `;
        updateSummary();
        return;
    }

    checkoutItems.innerHTML = "";

    cart.forEach(item => {
        const card = document.createElement("div");
        card.className = "checkout-product";

        const info = document.createElement("div");
        info.className = "checkout-product-info";

        const name = document.createElement("h3");
        name.textContent = item.name;

        const quantity = document.createElement("p");
        quantity.textContent = "Quantity: " + item.quantity;

        const price = document.createElement("strong");
        price.textContent = formatMoney(item.price) + " each";

        const itemTotal = document.createElement("strong");
        itemTotal.className = "checkout-product-total";
        itemTotal.textContent = formatMoney(
            Number(item.price) * Number(item.quantity)
        );

        info.append(name, quantity, price);

        const icon = document.createElement("div");
        icon.className = "checkout-product-icon";
        icon.textContent = "🛍️";

        card.append(icon, info, itemTotal);
        checkoutItems.appendChild(card);
    });

    updateSummary();
}

function showMessage(message) {
    if (checkoutMessage) {
        checkoutMessage.textContent = message;
    } else {
        alert(message);
    }
}

async function saveOrder(user, transaction) {
    const orderData = {
        userId: user.uid,
        customerEmail: user.email || "",
        items: cart.map(item => ({
            id: item.id || "",
            name: item.name || "",
            price: Number(item.price),
            quantity: Number(item.quantity),
            deliveryType: item.deliveryType || ""
        })),
        total: getCartTotal(),
        paymentMethod: "Paystack",
        paymentReference: transaction.reference,
        paymentStatus: "unverified",
        status: "pending"
    };

    const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
    });

    if (!response.ok) {
        throw new Error(
            "Could not save order. Server returned " + response.status
        );
    }

    return response.json();
}

async function startPayment() {
    if (cart.length === 0) {
        showMessage("Your cart is empty.");
        return;
    }

    const user = auth.currentUser;

    if (!user) {
        showMessage("Please login before making a payment.");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);
        return;
    }

    if (typeof PaystackPop === "undefined") {
        showMessage("Paystack could not load. Refresh and try again.");
        return;
    }

    const publicKey = SK_CONFIG.payment.publicKey;

    if (!publicKey || !publicKey.startsWith("pk_test_")) {
        showMessage("Your Paystack test public key is missing or incorrect.");
        return;
    }

    const total = getCartTotal();

    if (!Number.isFinite(total) || total <= 0) {
        showMessage("Your order total is invalid.");
        return;
    }

    if (payButton) {
        payButton.disabled = true;
        payButton.textContent = "Opening Payment...";
    }

    try {
        const popup = new PaystackPop();

        popup.newTransaction({
            key: publicKey,
            email: user.email,
            amount: Math.round(total * 100),
            currency: "NGN",

            metadata: {
                userId: user.uid,
                products: cart.map(item => ({
                    id: item.id || "",
                    name: item.name || "",
                    quantity: Number(item.quantity),
                    price: Number(item.price)
                }))
            },

            onSuccess: async function(transaction) {
                showMessage("Payment reported successful. Saving order...");

                try {
                    await saveOrder(user, transaction);

                    localStorage.removeItem("skMarketCart");
                    cart = [];
                    showCheckout();

                    showMessage(
                        "Order saved. Reference: " +
                        transaction.reference +
                        ". Payment still needs secure server verification."
                    );

                    if (payButton) {
                        payButton.textContent = "Order Saved";
                    }
                } catch (error) {
                    console.error("Order save error:", error);

                    showMessage(
                        "Payment was reported successful, but the order could not be saved. Keep your payment reference: " +
                        transaction.reference
                    );

                    if (payButton) {
                        payButton.disabled = false;
                        payButton.textContent = "Retry Checkout";
                    }
                }
            },

            onCancel: function() {
                showMessage("Payment was cancelled.");

                if (payButton) {
                    payButton.disabled = false;
                    payButton.textContent = "Continue to Payment";
                }
            },

            onError: function(error) {
                console.error("Paystack error:", error);
                showMessage("Payment could not be opened. Please try again.");

                if (payButton) {
                    payButton.disabled = false;
                    payButton.textContent = "Continue to Payment";
                }
            }
        });
    } catch (error) {
        console.error("Payment error:", error);
        showMessage("Something went wrong while opening payment.");

        if (payButton) {
            payButton.disabled = false;
            payButton.textContent = "Continue to Payment";
        }
    }
}

if (payButton) {
    payButton.addEventListener("click", startPayment);
}

document.addEventListener("DOMContentLoaded", showCheckout);