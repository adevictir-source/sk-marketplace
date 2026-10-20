import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { auth } from "./auth.js";

const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const emailInput = document.getElementById("email");
const resetMessage = document.getElementById("resetMessage");

forgotPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();

    if (!email) {
        resetMessage.textContent = "Please enter your email address.";
        return;
    }

    resetMessage.textContent = "Sending reset link...";

    try {
        await sendPasswordResetEmail(auth, email);

        resetMessage.textContent =
            "Password reset link sent! Please check your email.";

        forgotPasswordForm.reset();

    } catch (error) {
        console.error("Password reset error:", error);

        if (error.code === "auth/user-not-found") {
            resetMessage.textContent =
                "No SK Market account was found with this email.";
        } else if (error.code === "auth/invalid-email") {
            resetMessage.textContent =
                "Please enter a valid email address.";
        } else {
            resetMessage.textContent =
                "Unable to send the reset link. Please try again.";
        }
    }
});