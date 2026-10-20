/* =================================
   SK MARKET
   FOREIGN NUMBER ORDER
   PAYSTACK PAYMENT
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
    serverTimestamp,
    doc,
    updateDoc
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
   PAGE ELEMENTS
================================= */

const countryName =
    document.getElementById("countryName");

const countryNamePayment =
    document.getElementById("countryNamePayment");

const countryDescription =
    document.getElementById("countryDescription");

const numbersList =
    document.getElementById("numbersList");

const numberPrice =
    document.getElementById("numberPrice");

const selectedNumberElement =
    document.getElementById("selectedNumber");

const paymentAmount =
    document.getElementById("paymentAmount");

const payButton =
    document.getElementById("payButton");

const paymentMessage =
    document.getElementById("paymentMessage");

const paymentStatus =
    document.getElementById("paymentStatus");

const orderStatus =
    document.getElementById("orderStatus");

const phoneNumber =
    document.getElementById("phoneNumber");

const smsMessage =
    document.getElementById("smsMessage");

const verificationCode =
    document.getElementById("verificationCode");


/* =================================
   CURRENT USER
================================= */

let currentUser = null;


/* =================================
   SELECTED NUMBER
================================= */

let selectedNumber = null;


/* =================================
   CURRENT ORDER
================================= */

let currentOrderId = null;


/* =================================
   PAYSTACK SERVER
================================= */

const PAYMENT_SERVER =
    "http://localhost:3000";


/* =================================
   COUNTRY DATA
================================= */

const countryData = {

    usa: {
        name: "🇺🇸 USA",

        description:
            "USA virtual numbers for supported online verification services.",

        numbers: [

            {
                number: "+1 TEST USA 001",
                price: 4500
            },

            {
                number: "+1 TEST USA 002",
                price: 4500
            },

            {
                number: "+1 TEST USA 003",
                price: 5000
            }

        ]
    },


    uk: {
        name: "🇬🇧 United Kingdom",

        description:
            "UK virtual numbers for supported online verification services.",

        numbers: [

            {
                number: "+44 TEST UK 001",
                price: 4500
            },

            {
                number: "+44 TEST UK 002",
                price: 4500
            },

            {
                number: "+44 TEST UK 003",
                price: 5000
            }

        ]
    },


    canada: {
        name: "🇨🇦 Canada",

        description:
            "Canadian virtual numbers for supported online verification services.",

        numbers: [

            {
                number: "+1 TEST CANADA 001",
                price: 4500
            },

            {
                number: "+1 TEST CANADA 002",
                price: 5000
            },

            {
                number: "+1 TEST CANADA 003",
                price: 5500
            }

        ]
    },


    germany: {
        name: "🇩🇪 Germany",

        description:
            "German virtual numbers for supported online verification services.",

        numbers: [

            {
                number: "+49 TEST GERMANY 001",
                price: 4500
            },

            {
                number: "+49 TEST GERMANY 002",
                price: 5000
            },

            {
                number: "+49 TEST GERMANY 003",
                price: 5500
            }

        ]
    },


    france: {
        name: "🇫🇷 France",

        description:
            "French virtual numbers for supported online verification services.",

        numbers: [

            {
                number: "+33 TEST FRANCE 001",
                price: 4500
            },

            {
                number: "+33 TEST FRANCE 002",
                price: 5000
            },

            {
                number: "+33 TEST FRANCE 003",
                price: 5500
            }

        ]
    },


    australia: {
        name: "🇦🇺 Australia",

        description:
            "Australian virtual numbers for supported online verification services.",

        numbers: [

            {
                number: "+61 TEST AUSTRALIA 001",
                price: 4500
            },

            {
                number: "+61 TEST AUSTRALIA 002",
                price: 5000
            },

            {
                number: "+61 TEST AUSTRALIA 003",
                price: 5500
            }

        ]
    }

};


/* =================================
   SELECTED COUNTRY
================================= */

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const selectedCountry =
    (
        urlParams.get("country") ||
        "usa"
    ).toLowerCase();


/* =================================
   DISPLAY COUNTRY
================================= */

function displayCountry() {

    const country =
        countryData[selectedCountry];


    if (!country) {

        countryName.textContent =
            "📱 Country not found";

        countryDescription.textContent =
            "Please select a valid country.";

        numbersList.innerHTML =
            `<div class="numbers-loading">
                No numbers available.
            </div>`;

        numberPrice.textContent =
            "—";

        payButton.disabled =
            true;

        return;
    }


    countryName.textContent =
        country.name;


    countryNamePayment.textContent =
        country.name;


    countryDescription.textContent =
        country.description;


    displayNumbers(
        country.numbers
    );

}


/* =================================
   DISPLAY NUMBERS
================================= */

function displayNumbers(numbers) {

    if (
        !numbers ||
        numbers.length === 0
    ) {

        numbersList.innerHTML =
            `<div class="numbers-loading">
                No numbers are currently available.
            </div>`;

        return;
    }


    numbersList.innerHTML = "";


    numbers.forEach(
        function (item) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "number-option";


            button.textContent =
                item.number;


            button.addEventListener(
                "click",
                function () {

                    selectNumber(
                        item,
                        button
                    );

                }
            );


            numbersList.appendChild(
                button
            );

        }
    );

}


/* =================================
   SELECT NUMBER
================================= */

function selectNumber(
    numberData,
    selectedButton
) {

    selectedNumber =
        numberData;


    const allButtons =
        document.querySelectorAll(
            ".number-option"
        );


    allButtons.forEach(
        function (button) {

            button.classList.remove(
                "selected"
            );

        }
    );


    selectedButton.classList.add(
        "selected"
    );


    const price =
        numberData.price;


    numberPrice.textContent =
        "₦" +
        price.toLocaleString(
            "en-NG"
        );


    paymentAmount.textContent =
        "₦" +
        price.toLocaleString(
            "en-NG"
        );


    selectedNumberElement.textContent =
        numberData.number;


    phoneNumber.textContent =
        numberData.number;


    paymentStatus.textContent =
        "💳 Ready for payment";


    orderStatus.textContent =
        "✅ Number selected";


    paymentMessage.textContent =
        "Your number has been selected. You can continue to payment.";


    payButton.disabled =
        false;

}


/* =================================
   CREATE FIRESTORE ORDER
================================= */

async function createPaymentOrder() {

    if (!currentUser) {

        paymentMessage.textContent =
            "Please log in before making payment.";

        return null;
    }


    if (!selectedNumber) {

        paymentMessage.textContent =
            "Please select a number first.";

        return null;
    }


    const country =
        countryData[selectedCountry];


    if (!country) {

        paymentMessage.textContent =
            "Please select a valid country.";

        return null;
    }


    try {

        const orderRef =
            await addDoc(

                collection(
                    db,
                    "numberOrders"
                ),

                {

                    userId:
                        currentUser.uid,

                    email:
                        currentUser.email || "",

                    country:
                        selectedCountry,

                    countryName:
                        country.name,

                    phoneNumber:
                        selectedNumber.number,

                    amount:
                        selectedNumber.price,

                    currency:
                        "NGN",

                    paymentStatus:
                        "pending",

                    orderStatus:
                        "awaiting_payment",

                    createdAt:
                        serverTimestamp()

                }

            );


        currentOrderId =
            orderRef.id;


        return orderRef.id;

    }

    catch (error) {

        console.error(
            "Order creation error:",
            error
        );


        paymentMessage.textContent =
            "❌ Unable to create your order.";


        return null;

    }

}


/* =================================
   INITIALIZE PAYSTACK
================================= */

async function initializePaystackPayment(
    orderId
) {

    try {

        paymentMessage.textContent =
            "Connecting to secure payment...";


        const response =
            await fetch(

                PAYMENT_SERVER +
                "/api/paystack/initialize",

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        email:
                            currentUser.email,

                        amount:
                            selectedNumber.price,

                        metadata: {

                            orderId:
                                orderId,

                            country:
                                selectedCountry,

                            phoneNumber:
                                selectedNumber.number,

                            userId:
                                currentUser.uid

                        }

                    })

                }

            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success ||
            !data.access_code
        ) {

            console.error(
                "Paystack initialization response:",
                data
            );


            throw new Error(
                data.message ||
                "Paystack initialization failed."
            );

        }


        return data;

    }

    catch (error) {

        console.error(
            "Payment initialization error:",
            error
        );


        paymentMessage.textContent =
            "❌ Unable to connect to Paystack.";


        return null;

    }

}


/* =================================
   UPDATE ORDER
================================= */

async function updateOrderAfterInitialization(
    orderId,
    reference
) {

    try {

        await updateDoc(

            doc(
                db,
                "numberOrders",
                orderId
            ),

            {

                paymentReference:
                    reference,

                paymentStatus:
                    "initialized",

                orderStatus:
                    "payment_initialized"

            }

        );

    }

    catch (error) {

        console.error(
            "Order update error:",
            error
        );

    }

}


/* =================================
   START PAYMENT
================================= */

async function startPayment() {

    if (!currentUser) {

        paymentMessage.textContent =
            "Please log in before making payment.";

        return;

    }


    if (!selectedNumber) {

        paymentMessage.textContent =
            "Please select a number first.";

        return;

    }


    payButton.disabled =
        true;


    payButton.textContent =
        "⏳ Preparing Payment...";


    paymentMessage.textContent =
        "Creating your order...";


    const orderId =
        await createPaymentOrder();


    if (!orderId) {

        payButton.disabled =
            false;

        payButton.textContent =
            "💳 Pay Now";

        return;

    }


    const payment =
        await initializePaystackPayment(
            orderId
        );


    if (!payment) {

        payButton.disabled =
            false;

        payButton.textContent =
            "💳 Pay Now";

        return;

    }


    await updateOrderAfterInitialization(

        orderId,

        payment.reference

    );


    paymentStatus.textContent =
        "💳 Payment window ready";


    orderStatus.textContent =
        "⏳ Awaiting payment";


    paymentMessage.textContent =
        "Please complete your payment in the Paystack window.";


    payButton.textContent =
        "💳 Pay Now";


    try {

        const popup =
            new PaystackPop();


        popup.resumeTransaction(
            payment.access_code
        );

    }

    catch (error) {

        console.error(
            "Paystack popup error:",
            error
        );


        paymentMessage.textContent =
            "❌ Unable to open Paystack payment.";

        payButton.disabled =
            false;

    }

}


/* =================================
   PAYMENT BUTTON
================================= */

if (payButton) {

    payButton.addEventListener(
        "click",
        startPayment
    );

}


/* =================================
   DISPLAY PAGE
================================= */

displayCountry();


/* =================================
   AUTHENTICATION
================================= */

onAuthStateChanged(

    auth,

    function (user) {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        currentUser =
            user;


        paymentStatus.textContent =
            "⏳ Waiting for number selection";


        orderStatus.textContent =
            "⏳ Select a number to continue";

    }

);