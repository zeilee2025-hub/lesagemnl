/* =========================
   CLEAR ERROR
========================= */

function clearError(input) {

  if (!input) return;

  input.classList.remove(
    "input-error"
  );

  const errorElement =
    input.parentElement.querySelector(
      ".input-error-text"
    );

  if (errorElement) {
    errorElement.remove();
  }

}


/* =========================
   SHOW FORM ERRORS
========================= */

function showFormErrors({
  errors,
  isManualCity
}) {

  Object.entries(errors).forEach(
    ([field, message]) => {

      const input =
        getInputByField({
          field,
          isManualCity
        });

      if (!input) return;


      input.classList.add(
        "input-error"
      );


      let errorElement =
        input.parentElement.querySelector(
          ".input-error-text"
        );


      if (!errorElement) {

        errorElement =
          document.createElement("div");

        errorElement.className =
          "input-error-text";

        input.parentElement.appendChild(
          errorElement
        );

      }


      errorElement.textContent =
        message;

    }
  );

}


/* =========================
   GET INPUT
========================= */

function getInputByField({
  field,
  isManualCity
}) {

  const fieldMap = {

    email:
      "checkout-email",

    phone:
      "checkout-phone",

    firstName:
      "checkout-first-name",

    lastName:
      "checkout-last-name",

    address:
      "checkout-address",

    province:
      "checkout-province-input",

    city:
      isManualCity
        ? "checkout-city-manual"
        : "checkout-city",

    postal:
      "checkout-postal"

  };

  return document.getElementById(
    fieldMap[field]
  );

}


export {
  clearError,
  showFormErrors
};