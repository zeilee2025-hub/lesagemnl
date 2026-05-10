import {
  signupUser
} from "../services/authService.js";


// ===============================
// FORM
// ===============================
const signupForm =
  document.getElementById("signup-form");

const firstNameInput =
  document.getElementById(
    "signup-first-name"
  );

const lastNameInput =
  document.getElementById(
    "signup-last-name"
  );

const emailInput =
  document.getElementById(
    "signup-email"
  );

const passwordInput =
  document.getElementById(
    "signup-password"
  );

const errorText =
  document.getElementById(
    "signup-error"
  );


// ===============================
// SUBMIT
// ===============================
signupForm?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    try {

      // ===============================
      // RESET ERROR
      // ===============================
      errorText.textContent = "";

      // ===============================
      // VALUES
      // ===============================
      const firstName =
        firstNameInput.value.trim();

      const lastName =
        lastNameInput.value.trim();

      const email =
        emailInput.value.trim();

      const password =
        passwordInput.value;

      // ===============================
      // SIGNUP
      // ===============================
      await signupUser({

        firstName,
        lastName,
        email,
        password

      });

      // ===============================
      // REDIRECT
      // ===============================
      window.location.href =
        "./index.html";

    }

    catch (error) {

      console.error(error);

      errorText.textContent =
        "Unable to create account.";

    }

  }
);