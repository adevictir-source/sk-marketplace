/* =================================
   SK MARKET - PRODUCTS
================================= */

const products = [

    /* =================================
       FACEBOOK PRODUCTS
    ================================= */

    {
        id: "facebook-page",

        name: "USA Facebook Page",

        price: 2500,

        description:
            "🇺🇸 USA Facebook account suitable for creating a page.",

        deliveryType:
            "facebook"
    },

    {
        id: "facebook-ads",

        name: "USA Facebook Ads Ready",

        price: 4500,

        description:
            "📢 USA Facebook account with an existing page.",

        deliveryType:
            "facebook"
    },


    /* =================================
       OTHER PRODUCTS
    ================================= */

    {
        id: "twitter",

        name: "Twitter / X New Account",

        price: 2000,

        description:
            "🐦 New Twitter/X account with 0–10 followers."
    },

    {
        id: "instagram-new",

        name: "Foreign Instagram",

        price: 3500,

        description:
            "📸 Foreign Instagram account with posts and 100–500 followers."
    },

    {
        id: "instagram-old",

        name: "Foreign Instagram 200+ Followers",

        price: 4500,

        description:
            "✨ Foreign Instagram account with existing posts and 200+ followers."
    },

    {
        id: "express-vpn",

        name: "ExpressVPN - 1 Month",

        price: 4500,

        description:
            "🛡️ ExpressVPN access for 1 month."
    },

    {
        id: "pia-vpn",

        name: "PIA VPN - 7 Days",

        price: 1500,

        description:
            "🔐 Private Internet Access VPN access for 7 days."
    },

    {
        id: "netflix",

        name: "Netflix - 1 Month",

        price: 3000,

        description:
            "🎬 Global streaming access for 1 month."
    }

];


/* =================================
   SHOW PRODUCTS
================================= */

function showProducts() {

    const container =
        document.getElementById(
            "productsGrid"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";


    products.forEach(
        function (product) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "product-card";


            card.innerHTML = `

                <div class="product-card-content">

                    <h3>
                        ${product.name}
                    </h3>

                    <p>
                        ${product.description}
                    </p>

                    <h4>
                        ₦${product.price.toLocaleString()}
                    </h4>

                    <button
                        type="button"
                        class="primary-button add-to-cart-button"
                        data-product-id="${product.id}"
                    >
                        Add to Cart
                    </button>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );


    /* =================================
       ADD TO CART BUTTONS
    ================================= */

    const buttons =
        document.querySelectorAll(
            ".add-to-cart-button"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const productId =
                        button.dataset.productId;


                    if (
                        typeof window.addToCart ===
                        "function"
                    ) {

                        window.addToCart(
                            productId
                        );

                    }

                }
            );

        }
    );

}


/* =================================
   START
================================= */

document.addEventListener(
    "DOMContentLoaded",
    showProducts
);


/* =================================
   MAKE PRODUCTS AVAILABLE TO CART
================================= */

window.products =
    products;