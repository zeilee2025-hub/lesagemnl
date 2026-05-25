// ===============================
// AUTH SERVICE
// ===============================


// ===============================
// FIREBASE CORE
// ===============================
import {
  auth,
  db
} from "../core/firebase.js";


// ===============================
// FIREBASE AUTH
// ===============================
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


// ===============================
// FIRESTORE
// ===============================
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ===============================
// AUTH STATE
// ===============================
let currentUser = null;


// ===============================
// GET CURRENT USER
// ===============================
export function getCurrentUser() {
  return currentUser;
}

// ===============================
// INIT AUTH LISTENER
// ===============================
export function initAuthListener(callback = null) {

  onAuthStateChanged(auth, async (user) => {

    try {

      // ===============================
      // NOT LOGGED IN
      // ===============================
      if (!user) {

        currentUser = null;


        if (typeof callback === "function") {
          callback(null);
        }

        return;

      }

      // ===============================
      // GET USER PROFILE
      // ===============================
      const userRef =
        doc(db, "users", user.uid);

      const snapshot =
        await getDoc(userRef);

      // ===============================
      // BUILD USER OBJECT
      // ===============================
      currentUser = {

        uid:
          user.uid,

        email:
          user.email,

        ...(snapshot.exists()
          ? snapshot.data()
          : {})

      };

      console.log(
        "Authenticated user:",
        currentUser
      );

      // ===============================
      // CALLBACK
      // ===============================
      if (typeof callback === "function") {
        callback(currentUser);
      }

    }

    catch (error) {

      console.error(
        "AUTH LISTENER ERROR:",
        error
      );

    }

  });

}

// ===============================
// CREATE USER PROFILE
// ===============================
async function createUserProfile(user, data = {}) {

  try {

    if (!user?.uid) {
      throw new Error("Missing user");
    }

    const userRef =
      doc(db, "users", user.uid);

    const snapshot =
      await getDoc(userRef);

    // ===============================
    // PREVENT DUPLICATES
    // ===============================
    if (snapshot.exists()) {
      return snapshot.data();
    }

    // ===============================
    // USER DOCUMENT
    // ===============================
    const userData = {

      uid:
        user.uid,

      email:
        user.email || "",

      firstName:
        data.firstName || "",

      lastName:
        data.lastName || "",

      role:
        "customer",

      stats: {
        totalOrders: 0,
        totalSpent: 0
      },

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp()

    };

    // ===============================
    // SAVE USER
    // ===============================
    await setDoc(
      userRef,
      userData
    );

    console.log(
      "User profile created"
    );

    return userData;

  }

  catch (error) {

    console.error(
      "CREATE USER PROFILE ERROR:",
      error
    );

    throw error;

  }

}

// ===============================
// SIGN UP USER
// ===============================
export async function signupUser({

  email,
  password,
  firstName = "",
  lastName = ""

}) {

  try {

    // ===============================
    // VALIDATION
    // ===============================
    if (!email || !password) {

      throw new Error(
        "Email and password are required"
      );

    }

    // ===============================
    // CREATE AUTH ACCOUNT
    // ===============================
    const credentials =
      await createUserWithEmailAndPassword(

        auth,
        email,
        password

      );

    const user =
      credentials.user;

    // ===============================
    // CREATE USER PROFILE
    // ===============================
    await createUserProfile(user, {

      firstName,
      lastName

    });

    console.log(
      "User signup successful"
    );

    return user;

  }

  catch (error) {

    console.error(
      "SIGNUP ERROR:",
      error
    );

    throw error;

  }

}

// ===============================
// LOGIN USER
// ===============================
export async function loginUser({

  email,
  password

}) {

  try {

    // ===============================
    // VALIDATION
    // ===============================
    if (!email || !password) {

      throw new Error(
        "Email and password are required"
      );

    }

    // ===============================
    // LOGIN
    // ===============================
    const credentials =
      await signInWithEmailAndPassword(

        auth,
        email,
        password

      );

    console.log(
      "User login successful"
    );

    return credentials.user;

  }

  catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );

    throw error;

  }

}

// ===============================
// LOGOUT USER
// ===============================
export async function logoutUser() {

  try {

    await signOut(auth);

    console.log(
      "User logged out"
    );

  }

  catch (error) {

    console.error(
      "LOGOUT ERROR:",
      error
    );

    throw error;

  }

}