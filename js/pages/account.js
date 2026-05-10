import {
  auth,
  db
} from "../core/firebase.js";

import {
  logoutUser
} from "../services/authService.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ===============================
// ELEMENTS
// ===============================
const accountName =
  document.getElementById(
    "account-name"
  );

const accountEmail =
  document.getElementById(
    "account-email"
  );

const logoutButton =
  document.getElementById(
    "logout-button"
  );


// ===============================
// AUTH STATE
// ===============================
onAuthStateChanged(
  auth,
  async (user) => {

    // ===============================
    // NO USER
    // ===============================
    if (!user) {

      window.location.href =
        "./login.html";

      return;

    }

    try {

      // ===============================
      // USER DOC
      // ===============================
      const userRef =
        doc(db, "users", user.uid);

      const userSnap =
        await getDoc(userRef);

      // ===============================
      // PROFILE EXISTS
      // ===============================
      if (userSnap.exists()) {

        const userData =
          userSnap.data();

        const fullName = `
          ${userData.firstName || ""}
          ${userData.lastName || ""}
        `.trim();

        accountName.textContent =
          fullName || "Customer";

        accountEmail.textContent =
          user.email;

      }

      // ===============================
      // FALLBACK
      // ===============================
      else {

        accountName.textContent =
          "Customer";

        accountEmail.textContent =
          user.email;

      }

    }

    catch (error) {

      console.error(
        "ACCOUNT ERROR:",
        error
      );

    }

  }
);


// ===============================
// LOGOUT
// ===============================
logoutButton?.addEventListener(
  "click",
  async () => {

    try {

      await logoutUser();

      window.location.href =
        "./login.html";

    }

    catch (error) {

      console.error(
        "LOGOUT ERROR:",
        error
      );

    }

  }
);