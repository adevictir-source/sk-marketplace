/* =================================
   SK MARKET - WALLET
================================= */

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    firebaseConfig
} from "./config.js";


const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getFirestore(app);


/* =================================
   PAGE ELEMENTS
================================= */

const walletBalance =
    document.getElementById(
        "walletBalance"
    );

const fundWalletButton =
    document.getElementById(
        "fundWalletButton"
    );

const depositAmount =
    document.getElementById(
        "depositAmount"
    );

const depositStatus =
    document.getElementById(
        "depositStatus"
    );

const transactionList =
    document.getElementById(
        "transactionList"
    );

const transactionCount =
    document.getElementById(
        "transactionCount"
    );


/* =================================
   FORMAT MONEY
================================= */

function formatMoney(amount) {

    return (
        "₦" +
        Number(amount).toLocaleString()
    );

}


/* =================================
   SHOW BALANCE
================================= */

function showBalance(balance) {

    if (!walletBalance) {
        return;
    }

    walletBalance.textContent =
        formatMoney(balance);

}


/* =================================
   LOAD WALLET
================================= */

async function loadWallet(user) {

    try {

        const walletRef =
            doc(
                db,
                "wallets",
                user.uid
            );


        const walletSnapshot =
            await getDoc(
                walletRef
            );


        if (
            !walletSnapshot.exists()
        ) {

            await setDoc(
                walletRef,
                {
                    balance: 0,
                    createdAt:
                        serverTimestamp()
                }
            );

            showBalance(0);

            return;

        }


        const walletData =
            walletSnapshot.data();


        const balance =
            Number(
                walletData.balance || 0
            );


        showBalance(
            balance
        );

    }

    catch (error) {

        console.error(
            "Wallet loading error:",
            error
        );


        if (walletBalance) {

            walletBalance.textContent =
                "Unable to load";

        }

    }

}


/* =================================
   CREATE DEPOSIT REQUEST
================================= */

async function createDepositRequest(
    user
) {

    if (!depositAmount) {

        return;

    }


    const amount =
        Number(
            depositAmount.value
        );


    /* =============================
       VALIDATE AMOUNT
    ============================= */

    if (
        !amount ||
        isNaN(amount)
    ) {

        depositStatus.textContent =
            "❌ Please enter a valid amount.";

        return;

    }


    /* =============================
       MINIMUM DEPOSIT
    ============================= */

    if (
        amount < 100
    ) {

        depositStatus.textContent =
            "❌ Minimum deposit is ₦100.";

        return;

    }


    /* =============================
       WHOLE NAIRA AMOUNT
    ============================= */

    if (
        !Number.isInteger(amount)
    ) {

        depositStatus.textContent =
            "❌ Please enter a whole naira amount.";

        return;

    }


    /* =============================
       CHECK LOGIN
    ============================= */

    if (!user) {

        window.location.href =
            "Login.html";

        return;

    }


    try {

        /* =========================
           DISABLE BUTTON
        ========================= */

        fundWalletButton.disabled =
            true;

        fundWalletButton.textContent =
            "⏳ Preparing payment...";


        depositStatus.textContent =
            "Creating your secure deposit request...";


        /* =========================
           CREATE PENDING DEPOSIT
        ========================= */

        const depositData = {

            userId:
                user.uid,

            customerEmail:
                user.email || "",

            amount:
                amount,

            currency:
                "NGN",

            status:
                "pending",

            paymentProvider:
                "paystack",

            paymentReference:
                "",

            createdAt:
                serverTimestamp()

        };


        const depositRef =
            await addDoc(
                collection(
                    db,
                    "walletDeposits"
                ),
                depositData
            );


        console.log(
            "Deposit request created:",
            depositRef.id
        );


        /* =========================
           SHOW STATUS
        ========================= */

        depositStatus.textContent =
            "✅ Deposit request created. Payment connection is next.";


        fundWalletButton.textContent =
            "💳 Continue to Payment";


        fundWalletButton.disabled =
            false;


        /* =========================
           CLEAR INPUT
        ========================= */

        depositAmount.value =
            "";


    }

    catch (error) {

        console.error(
            "Deposit request error:",
            error
        );


        depositStatus.textContent =
            "❌ Unable to create deposit request.";


        fundWalletButton.textContent =
            "💳 Continue to Payment";


        fundWalletButton.disabled =
            false;

    }

}


/* =================================
   BUTTON
================================= */

if (
    fundWalletButton
) {

    fundWalletButton.addEventListener(
        "click",
        function () {

            const user =
                auth.currentUser;


            if (!user) {

                window.location.href =
                    "Login.html";

                return;

            }


            createDepositRequest(
                user
            );

        }
    );

}


/* =================================
   AUTH STATE
================================= */

onAuthStateChanged(
    auth,
    function (user) {

        if (!user) {

            window.location.href =
                "Login.html";

            return;

        }


        loadWallet(
            user
        );

    }
);