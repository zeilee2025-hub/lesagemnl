import {
  loginUser
} from "../services/authService.js"


// ===============================
// LOGIN FORM
// ===============================
const loginForm =
  document.getElementById("login-form");

const emailInput =
  document.getElementById("login-email");

const passwordInput =
  document.getElementById("login-password");

const errorText =
  document.getElementById("login-error");


// ===============================
// SUBMIT
// ===============================
loginForm?.addEventListener(
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
      const email =
        emailInput.value.trim();

      const password =
        passwordInput.value;

      // ===============================
      // LOGIN
      // ===============================
      await loginUser({

        email,
        password

      });

      // ===============================
      // SUCCESS REDIRECT
      // ===============================
      window.location.href =
        "./index.html";

    }

    catch (error) {

      console.error(error);

      errorText.textContent =
        "Invalid email or password.";

    }

  }
);