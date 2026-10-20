// ======================================
// SK MARKET — PROMOTION.JS
// ======================================

document.addEventListener("DOMContentLoaded", function () {

  const promotionCards = document.querySelectorAll(
    ".promotion-card"
  );

  // Display the current year.
  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Handle each platform card.
  promotionCards.forEach(function (card) {

    const platform = card.dataset.name;
    const button = card.querySelector("button");

    if (!platform || !button) {
      return;
    }

    button.textContent = "Start Promotion";

    button.addEventListener("click", function () {

      // Save the customer's selected platform.
      localStorage.setItem(
        "SK_SELECTED_PLATFORM",
        platform
      );

      localStorage.setItem(
        "selectedPlatform",
        platform
      );

      // Open the Boost Services page.
      window.location.href = "boost.html";

    });

  });

});