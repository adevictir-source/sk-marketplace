/* =================================
   SK MARKET - ACCOUNT
================================= */

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

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

const db =
    getFirestore(app);


/* =================================
   ACCOUNT ELEMENTS
================================= */

const accountName =
    document.getElementById(
        "accountName"
    );

const accountEmail =
    document.getElementById(
        "accountEmail"
    );

const walletBalance =
    document.getElementById(
        "walletBalance"
    );

const ordersContainer =
    document.getElementById(
        "ordersContainer"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const backToMarket =
    document.getElementById(
        "backToMarket"
    );


/* =================================
   FACEBOOK DELIVERY
================================= */

function createFacebookDelivery() {

    return `

        <div class="facebook-delivery">

            <h4>
                FACEBOOK [USE VPN]
            </h4>

            <p>
                📺 <strong>Watch how to login</strong>
            </p>

            <p>
                🔗
                <a
                    href="https://youtu.be/miiMUq2_jfM"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Watch Tutorial
                </a>
            </p>


            <p>
                🔑 <strong>Get Login Code Here</strong>
            </p>

            <p>
                👉
                <a
                    href="http://2fa.live"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    2FA.live
                </a>
            </p>


            <p>
                ⚠️ <strong>Use Strong VPN</strong>
            </p>

        </div>

    `;

}


/* =================================
   CREATE ORDER CARD
================================= */

function createOrderCard(
    order,
    orderId
) {

    const orderCard =
        document.createElement(
            "div"
        );


    orderCard.className =
        "order-card";


    const productName =
        order.productName ||
        "Unknown Product";


    const status =
        order.status ||
        "pending";


    let deliveryHTML =
        "";


    /* =================================
       ONLY RELEASE DELIVERY AFTER
       VERIFIED PAYMENT
    ================================= */

    const paymentVerified =
        order.paymentStatus ===
            "verified" ||
        order.paymentStatus ===
            "paid" ||
        status === "paid";


    if (
        paymentVerified &&
        order.deliveryType ===
            "facebook"
    ) {

        deliveryHTML =
            createFacebookDelivery();

    }


    /* =================================
       ORDER CARD
    ================================= */

    orderCard.innerHTML = `

        <h3>
            🛍️ ${productName}
        </h3>

        <p>
            <strong>Status:</strong>
            ${status}
        </p>

        ${
            order.paymentStatus
                ? `
                    <p>
                        <strong>
                            Payment:
                        </strong>
                        ${order.paymentStatus}
                    </p>
                  `
                : ""
        }

        ${
            deliveryHTML
        }

    `;


    return orderCard;

}


/* =================================
   LOAD CUSTOMER ORDERS
================================= */

async function loadOrders(user) {

    if (!ordersContainer) {

        return;

    }


    ordersContainer.innerHTML =
        "<p>Loading orders...</p>";


    try {

        const ordersRef =
            collection(
                db,
                "orders"
            );


        const ordersQuery =
            query(
                ordersRef,
                where(
                    "userId",
                    "==",
                    user.uid
                )
            );


        const snapshot =
            await getDocs(
                ordersQuery
            );


        console.log(
            "NUMBER OF ORDERS FOUND:",
            snapshot.size
        );


        /* =================================
           NO ORDERS
        ================================= */

        if (
            snapshot.empty
        ) {

            ordersContainer.innerHTML = `

                <p class="empty-orders">

                    You don't have any orders yet.

                </p>

            `;

            return;

        }


        /* =================================
           CLEAR LOADING
        ================================= */

        ordersContainer.innerHTML =
            "";


        /* =================================
           SHOW ORDERS
        ================================= */

        snapshot.forEach(
            function (orderDocument) {

                const order =
                    orderDocument.data();


                const orderCard =
                    createOrderCard(
                        order,
                        orderDocument.id
                    );


                ordersContainer.appendChild(
                    orderCard
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Error loading orders:",
            error
        );


        ordersContainer.innerHTML = `

            <p class="empty-orders">

                Unable to load your orders.
                Please try again later.

            </p>

        `;

    }

}


/* =================================
   CHECK LOGIN
================================= */

onAuthStateChanged(
    auth,
    async function (user) {

        if (!user) {

            window.location.href =
                "Login.html";

            return;

        }


        /* =================================
           NAME
        ================================= */

        if (accountName) {

            accountName.textContent =
                user.displayName ||
                "Customer";

        }


        /* =================================
           EMAIL
        ================================= */

        if (accountEmail) {

            accountEmail.textContent =
                user.email ||
                "No email available";

        }


        /* =================================
           WALLET
        ================================= */

        if (walletBalance) {

            walletBalance.textContent =
                "₦0";

        }


        /* =================================
           LOAD ORDERS
        ================================= */

        await loadOrders(
            user
        );

    }
);


/* =================================
   LOGOUT
================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            try {

                await signOut(
                    auth
                );


                localStorage.removeItem(
                    "skMarketLoginTime"
                );


                window.location.href =
                    "Login.html";

            }

            catch (error) {

                console.error(
                    error
                );


                alert(
                    "Logout failed. Please try again."
                );

            }

        }
    );

}


/* =================================
   BACK TO MARKET
================================= */

if (backToMarket) {

    backToMarket.addEventListener(
        "click",
        function () {

            window.location.href =
                "Index.html";

        }
    );

}