/* =================================
   SK MARKET
   FOREIGN NUMBER ORDER
================================= */

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    firebaseConfig
} from "./config.js";


/* =================================
   FIREBASE
================================= */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


/* =================================
   FOREIGN NUMBER PRICES
================================= */

const NUMBER_PRICE = 3500;


/* =================================
   SELECT COUNTRY
================================= */

async function selectForeignNumber(country) {

    if (!country) {
        return;
    }

    /* Check login */

    const user = auth.currentUser;

    if (!user) {

        window.location.href =
            "Login.html";

        return;
    }


    /* Show message */

    const confirmed =
        confirm(
            "You selected a " +
            country +
            " number.\n\n" +
            "Price: ₦" +
            NUMBER_PRICE.toLocaleString() +
            "\n\n" +
            "Create this order?"
        );


    if (!confirmed) {
        return;
    }


    try {

        /* =================================
           CREATE ORDER
        ================================= */

        const orderData = {

            userId: user.uid,

            customerEmail:
                user.email || "",

            productName:
                country + " Foreign Number",

            productType:
                "foreign-number",

            country:
                country,

            price:
                NUMBER_PRICE,

            currency:
                "NGN",

            paymentStatus:
                "pending",

            status:
                "pending",

            phoneNumber:
                "",

            smsMessage:
                "",

            verificationCode:
                "",

            createdAt:
                serverTimestamp()

        };


        const orderRef =
            await addDoc(
                collection(
                    db,
                    "orders"
                ),
                orderData
            );


        console.log(
            "Order created:",
            orderRef.id
        );


        /* =================================
           OPEN ORDER PAGE
        ================================= */

        window.location.href =
            "NumberOrder.html?country=" +
            encodeURIComponent(country) +
            "&orderId=" +
            encodeURIComponent(orderRef.id);

    }

    catch (error) {

        console.error(
            "Order creation error:",
            error
        );


        alert(
            "Unable to create your order.\n\n" +
            error.message
        );

    }

}


/* =================================
   MAKE FUNCTION AVAILABLE TO HTML
================================= */

window.selectForeignNumber =
    selectForeignNumber;


/* =================================
   AUTH CHECK
================================= */

onAuthStateChanged(
    auth,
    function (user) {

        if (!user) {

            console.log(
                "Customer is not logged in."
            );

        }

    }
);