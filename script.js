/* =================================
   SK MARKET - SESSION + CART
================================= */

import {
    getAuth,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    firebaseConfig
} from "./config.js";


/* =================================
   FIREBASE
================================= */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);


/* =================================
   10 MINUTE AWAY SESSION
================================= */

const AWAY_LIMIT =
    10 * 60 * 1000;

let hiddenTime = null;


document.addEventListener(
    "visibilitychange",
    function () {

        if (
            document.visibilityState ===
            "hidden"
        ) {

            hiddenTime =
                Date.now();

        }


        if (
            document.visibilityState ===
            "visible"
        ) {

            if (
                hiddenTime === null
            ) {

                return;

            }


            const awayTime =
                Date.now() -
                hiddenTime;


            hiddenTime = null;


            if (
                awayTime >=
                AWAY_LIMIT
            ) {

                localStorage.removeItem(
                    "skMarketLoginTime"
                );


                signOut(auth)
                    .then(
                        function () {

                            alert(
                                "You have been away from SK Market for 10 minutes. Please log in again."
                            );


                            window.location.href =
                                "Login.html";

                        }
                    )
                    .catch(
                        function (error) {

                            console.error(
                                error
                            );


                            window.location.href =
                                "Login.html";

                        }
                    );

            }

        }

    }
);


/* =================================
   SHOPPING CART
================================= */

let cart =
    JSON.parse(
        localStorage.getItem(
            "skMarketCart"
        )
    ) || [];


/* =================================
   UPDATE CART COUNT
================================= */

function updateCartCount() {

    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (!cartCount) {

        return;

    }


    cartCount.textContent =
        cart.reduce(
            function (
                total,
                item
            ) {

                return (
                    total +
                    Number(
                        item.quantity
                    )
                );

            },
            0
        );

}


/* =================================
   ADD PRODUCT TO CART
================================= */

window.addToCart =
    function (productId) {

        if (
            !Array.isArray(
                window.products
            )
        ) {

            alert(
                "Products are still loading. Please refresh the page."
            );

            return;

        }


        const product =
            window.products.find(
                function (item) {

                    return (
                        item.id ===
                        productId
                    );

                }
            );


        if (!product) {

            alert(
                "Product not found."
            );

            return;

        }


        const existingProduct =
            cart.find(
                function (item) {

                    return (
                        item.id ===
                        productId
                    );

                }
            );


        if (existingProduct) {

            existingProduct.quantity += 1;

        }

        else {

            cart.push({

                id:
                    product.id,

                name:
                    product.name,

                price:
                    product.price,

                quantity:
                    1,

                /* =========================
                   PRODUCT DELIVERY TYPE
                ========================= */

                deliveryType:
                    product.deliveryType || ""

            });

        }


        localStorage.setItem(
            "skMarketCart",
            JSON.stringify(
                cart
            )
        );


        updateCartCount();


        alert(
            product.name +
            " has been added to your cart."
        );

    };


/* =================================
   CART BUTTON
================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateCartCount();


        const cartButton =
            document.getElementById(
                "cartButton"
            );


        if (cartButton) {

            cartButton.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "cart.html";

                }
            );

        }

    }
);