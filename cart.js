/* =================================
   SK MARKET - CART
   ================================= */
let cart =
    JSON.parse(
        localStorage.getItem("skMarketCart")
    ) || [];
/* =================================
   CART ELEMENTS
   ================================= */
const cartItems =
    document.getElementById("cartItems");
const cartItemCount =
    document.getElementById("cartItemCount");
const summaryItems =
    document.getElementById("summaryItems");
const summarySubtotal =
    document.getElementById("summarySubtotal");
const summaryTotal =
    document.getElementById("summaryTotal");
const clearCartButton =
    document.getElementById("clearCartButton");
const checkoutButton =
    document.getElementById("checkoutButton");
/* =================================
   FORMAT MONEY
   ================================= */
function formatMoney(amount) {
    return "₦" +
        Number(amount).toLocaleString();
}
/* =================================
   TOTAL ITEMS
   ================================= */
function getTotalItems() {
    return cart.reduce(
        function (total, item) {
            return total + Number(item.quantity);
        },
        0
    );
}
/* =================================
   CART TOTAL
   ================================= */
function getCartTotal() {
    return cart.reduce(
        function (total, item) {
            return total +
                (
                    Number(item.price) *
                    Number(item.quantity)
                );
        },
        0
    );
}
/* =================================
   SAVE CART
   ================================= */
function saveCart() {
    localStorage.setItem(
        "skMarketCart",
        JSON.stringify(cart)
    );
}
/* =================================
   UPDATE SUMMARY
   ================================= */
function updateSummary() {
    const itemCount =
        getTotalItems();
    const total =
        getCartTotal();
    if (cartItemCount) {
        cartItemCount.textContent =
            itemCount +
            (
                itemCount === 1
                    ? " item"
                    : " items"
            );
    }
    if (summaryItems) {
        summaryItems.textContent =
            itemCount;
    }
    if (summarySubtotal) {
        summarySubtotal.textContent =
            formatMoney(total);
    }
    if (summaryTotal) {
        summaryTotal.textContent =
            formatMoney(total);
    }
}
/* =================================
   SHOW EMPTY CART
   ================================= */
function showEmptyCart() {
    if (!cartItems) {
        return;
    }
    cartItems.innerHTML = `
        <div class="empty-cart">
            <div class="empty-cart-icon">
                🛒
            </div>
            <h2>
                Your cart is empty
            </h2>
            <p>
                You haven't added any products yet.
            </p>
            <a
                href="Index.html#products"
                class="empty-cart-button"
            >
                Browse Products
            </a>
        </div>
    `;
    updateSummary();
}
/* =================================
   SHOW CART
   ================================= */
function showCart() {
    if (!cartItems) {
        return;
    }
    if (cart.length === 0) {
        showEmptyCart();
        return;
    }
    cartItems.innerHTML = "";
    cart.forEach(
        function (item, index) {
            const itemTotal =
                Number(item.price) *
                Number(item.quantity);
            const card =
                document.createElement("div");
            card.className =
                "cart-item";
            card.innerHTML = `
                <div class="cart-item-icon">
                    🛍️
                </div>
                <div class="cart-item-info">
                    <h3>
                        ${item.name}
                    </h3>
                    <p>
                        ${formatMoney(item.price)}
                        each
                    </p>
                </div>
                <div class="cart-item-quantity">
                    <button
                        type="button"
                        class="quantity-button"
                        data-action="decrease"
                        data-index="${index}"
                    >
                        −
                    </button>
                    <span>
                        ${item.quantity}
                    </span>
                    <button
                        type="button"
                        class="quantity-button"
                        data-action="increase"
                        data-index="${index}"
                    >
                        +
                    </button>
                </div>
                <strong class="cart-item-total">
                    ${formatMoney(itemTotal)}
                </strong>
                <button
                    type="button"
                    class="remove-cart-item"
                    data-action="remove"
                    data-index="${index}"
                >
                    Remove
                </button>
            `;
            cartItems.appendChild(card);
        }
    );
    updateSummary();
    setupCartButtons();
}
/* =================================
   CART BUTTONS
   ================================= */
function setupCartButtons() {
    const buttons =
        document.querySelectorAll(
            "[data-action]"
        );
    buttons.forEach(
        function (button) {
            button.addEventListener(
                "click",
                function () {
                    const action =
                        button.dataset.action;
                    const index =
                        Number(
                            button.dataset.index
                        );
                    if (
                        !Number.isInteger(index) ||
                        !cart[index]
                    ) {
                        return;
                    }
                    if (action === "increase") {
                        cart[index].quantity += 1;
                    }
                    if (action === "decrease") {
                        cart[index].quantity -= 1;
                        if (
                            cart[index].quantity <= 0
                        ) {
                            cart.splice(
                                index,
                                1
                            );
                        }
                    }
                    if (action === "remove") {
                        cart.splice(
                            index,
                            1
                        );
                    }
                    saveCart();
                    showCart();
                }
            );
        }
    );
}
/* =================================
   CLEAR CART
   ================================= */
if (clearCartButton) {
    clearCartButton.addEventListener(
        "click",
        function () {
            if (cart.length === 0) {
                return;
            }
            const confirmed =
                confirm(
                    "Are you sure you want to clear your cart?"
                );
            if (!confirmed) {
                return;
            }
            cart = [];
            saveCart();
            showCart();
        }
    );
}
/* =================================
   PROCEED TO CHECKOUT
   ================================= */
if (checkoutButton) {
    checkoutButton.addEventListener(
        "click",
        function () {
            if (cart.length === 0) {
                alert(
                    "Your cart is empty."
                );
                return;
            }
            window.location.href =
                "checkout.html";
        }
    );
}
/* =================================
   START CART
   ================================= */
document.addEventListener(
    "DOMContentLoaded",
    function () {
        showCart();
    }
);