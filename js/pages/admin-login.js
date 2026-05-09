import { auth }
from "../core/firebase.js";

import {

  signInWithEmailAndPassword,
  onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


/* ==============================
   ELEMENTS
============================== */

const loginBtn =
  document.getElementById(
    "admin-login-btn"
  );


/* ==============================
   AUTO REDIRECT IF ALREADY LOGGED IN
============================== */

onAuthStateChanged(

  auth,

  (user) => {

    if (user) {

      window.location.href =
        "../../admin.html";

    }

  }

);


/* ==============================
   LOGIN
============================== */

loginBtn.addEventListener(

  "click",

  async () => {

    const email =
      document.getElementById(
        "admin-email"
      ).value;

    const password =
      document.getElementById(
        "admin-password"
      ).value;

    try {

      await signInWithEmailAndPassword(

        auth,
        email,
        password

      );

      window.location.href =
        "../../admin.html";

    } catch (error) {

      console.error(error);

      alert(
        "Invalid admin credentials"
      );

    }

  }

);