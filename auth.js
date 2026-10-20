/* =================================
   SK MARKET - FIREBASE AUTHENTICATION
   ================================= */

import {
    getAuth,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
    GoogleAuthProvider,
    FacebookAuthProvider,
    OAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    firebaseConfig
} from "./config.js";


/* ---------------------------------
   START FIREBASE
   --------------------------------- */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


/* ---------------------------------
   7-MINUTE LOGIN SESSION
   --------------------------------- */

const SESSION_DURATION = 7 * 60 * 1000;

function startLoginSession() {

    localStorage.setItem(
        "skMarketLoginTime",
        Date.now().toString()
    );

}


/* ---------------------------------
   LOGIN
   --------------------------------- */

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                document.getElementById("email")
                    .value.trim();

            const password =
                document.getElementById("password")
                    .value;


            if (!email || !password) {

                loginMessage.textContent =
                    "Please enter your email and password.";

                return;
            }


            try {

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


                /* START 7-MINUTE SESSION */

                startLoginSession();


                loginMessage.textContent =
                    "Login successful. Opening SK Market...";


                setTimeout(function () {

                    window.location.href =
                        "index.html";

                }, 700);


            } catch (error) {

                console.error(error);

                loginMessage.textContent =
                    "Login failed. Please check your email and password.";

            }

        }
    );

}


/* ---------------------------------
   FORGOT PASSWORD
   --------------------------------- */

const forgotPassword =
    document.getElementById("forgotPassword");


if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            const email =
                document.getElementById("email")
                    .value.trim();


            if (!email) {

                loginMessage.textContent =
                    "Please enter your email address first.";

                return;
            }


            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );


                loginMessage.textContent =
                    "Password reset email sent. Check your inbox and spam folder.";


            } catch (error) {

                console.error(error);


                if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    loginMessage.textContent =
                        "Please enter a valid email address.";

                } else {

                    loginMessage.textContent =
                        "Could not send the password reset email. Please try again.";

                }

            }

        }
    );

}


/* ---------------------------------
   EMAIL REGISTRATION
   --------------------------------- */

const registerForm =
    document.getElementById("registerForm");

const registerMessage =
    document.getElementById("registerMessage");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "registerName"
                ).value.trim();


            const email =
                document.getElementById(
                    "registerEmail"
                ).value.trim();


            const password =
                document.getElementById(
                    "registerPassword"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;


            if (
                !name ||
                !email ||
                !password ||
                !confirmPassword
            ) {

                registerMessage.textContent =
                    "Please complete all fields.";

                return;
            }


            if (password.length < 8) {

                registerMessage.textContent =
                    "Password must be at least 8 characters.";

                return;
            }


            if (password !== confirmPassword) {

                registerMessage.textContent =
                    "Passwords do not match.";

                return;
            }


            try {

                /* CREATE ACCOUNT */

                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                /* SAVE USER NAME */

                await updateProfile(
                    userCredential.user,
                    {
                        displayName: name
                    }
                );


                /* LOG USER OUT */

                await signOut(auth);


                /* SHOW MESSAGE */

                registerMessage.textContent =
                    "Account created successfully. Please login.";


                /* GO TO LOGIN PAGE */

                setTimeout(function () {

                    window.location.href =
                        "login.html";

                }, 1000);


            } catch (error) {

                console.error(error);


                if (
                    error.code ===
                    "auth/email-already-in-use"
                ) {

                    registerMessage.textContent =
                        "This email is already registered.";

                } else if (
                    error.code ===
                    "auth/weak-password"
                ) {

                    registerMessage.textContent =
                        "Password must be at least 8 characters.";

                } else if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    registerMessage.textContent =
                        "Please enter a valid email address.";

                } else {

                    registerMessage.textContent =
                        "Registration failed. Please try again.";

                }

            }

        }
    );

}


/* ---------------------------------
   GOOGLE LOGIN
   --------------------------------- */

const googleLoginButton =
    document.getElementById("googleLogin");


if (googleLoginButton) {

    googleLoginButton.addEventListener(
        "click",
        async function () {

            const provider =
                new GoogleAuthProvider();


            try {

                await signInWithPopup(
                    auth,
                    provider
                );


                /* START 7-MINUTE SESSION */

                startLoginSession();


                window.location.href =
                    "index.html";


            } catch (error) {

                console.error(error);

                showSocialError(error);

            }

        }
    );

}


/* ---------------------------------
   FACEBOOK LOGIN
   --------------------------------- */

const facebookLoginButton =
    document.getElementById("facebookLogin");


if (facebookLoginButton) {

    facebookLoginButton.addEventListener(
        "click",
        async function () {

            const provider =
                new FacebookAuthProvider();


            try {

                await signInWithPopup(
                    auth,
                    provider
                );


                /* START 7-MINUTE SESSION */

                startLoginSession();


                window.location.href =
                    "index.html";


            } catch (error) {

                console.error(error);

                showSocialError(error);

            }

        }
    );

}


/* ---------------------------------
   APPLE LOGIN
   --------------------------------- */

const appleLoginButton =
    document.getElementById("appleLogin");


if (appleLoginButton) {

    appleLoginButton.addEventListener(
        "click",
        async function () {

            const provider =
                new OAuthProvider("apple.com");


            provider.addScope("email");
            provider.addScope("name");


            try {

                await signInWithPopup(
                    auth,
                    provider
                );


                /* START 7-MINUTE SESSION */

                startLoginSession();


                window.location.href =
                    "index.html";


            } catch (error) {

                console.error(error);

                showSocialError(error);

            }

        }
    );

}


/* ---------------------------------
   SOCIAL LOGIN ERROR
   --------------------------------- */

function showSocialError(error) {

    let message =
        "Sign-in could not be completed.";


    if (
        error.code ===
        "auth/popup-closed-by-user"
    ) {

        message =
            "The sign-in window was closed.";

    } else if (
        error.code ===
        "auth/account-exists-with-different-credential"
    ) {

        message =
            "An account already exists with this email using another sign-in method.";

    } else if (
        error.code ===
        "auth/operation-not-allowed"
    ) {

        message =
            "This sign-in method has not been enabled in Firebase yet.";

    }


    if (registerMessage) {

        registerMessage.textContent =
            message;

    }


    if (loginMessage) {

        loginMessage.textContent =
            message;

    }

}