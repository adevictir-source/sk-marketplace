/* =================================
   SK MARKET - CONFIGURATION
   ================================= */

const SK_CONFIG = {
    siteName: "SK Market",

    currency: "₦",

    support: {
        whatsapp: "https://wa.link/vow6wj",
        telegram: "https://t.me/skbtclord321"
    },

    cart: {
        enabled: true
    },

    payment: {
        enabled: true,
        publicKey: "pk_test_af4aa35048dc9ebc18e77674ab26558fb435fa39"
    }
};


/* =================================
   FIREBASE CONFIGURATION
   ================================= */

const firebaseConfig = {
    apiKey: "AIzaSyDFRVBKzETujJtKds_XtaETZXPlojJ5oOM",
    authDomain: "sk-market-d8613.firebaseapp.com",
    projectId: "sk-market-d8613",
    storageBucket: "sk-market-d8613.firebasestorage.app",
    messagingSenderId: "159642492836",
    appId: "1:159642492836:web:5e9314d1f1d658cdefab31",
    measurementId: "G-Y47NJDBKFX"
};


/* =================================
   EXPORT CONFIGURATION
   ================================= */

export { firebaseConfig, SK_CONFIG };