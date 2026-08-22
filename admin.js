import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";


/* =========================
   FIREBASE SETUP
========================= */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* =========================
   ADMIN EMAIL
========================= */

const ADMIN_EMAIL = "s09858787@gmail.com";


/* =========================
   PAGE ELEMENTS
========================= */

const loginBox = document.querySelector("#loginBox");
const panel = document.querySelector("#panel");
const loginStatus = document.querySelector("#loginStatus");
const loginBtn = document.querySelector("#loginBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const menuForm = document.querySelector("#menuForm");


/* =========================
   ADMIN LOGIN
========================= */

loginBtn.onclick = async () => {

  const email =
    document.querySelector("#email").value.trim();

  const password =
    document.querySelector("#password").value;

  if (!email || !password) {

    loginStatus.textContent =
      "Email మరియు Password ఇవ్వండి.";

    return;
  }

  loginStatus.textContent =
    "Login అవుతోంది...";

  try {

    const result =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    if (
      !result.user.email ||
      result.user.email.toLowerCase() !==
      ADMIN_EMAIL.toLowerCase()
    ) {

      await signOut(auth);

      loginStatus.textContent =
        "ఈ ఖాతాకు Admin access లేదు.";

      return;
    }

    loginStatus.textContent =
      "Login విజయవంతమైంది.";

  } catch (error) {

    console.error(
      "Firebase login error:",
      error
    );

    loginStatus.textContent =
      `Login error: ${
        error.code || error.message
      }`;
  }
};


/* =========================
   ADMIN LOGOUT
========================= */

logoutBtn.onclick = async () => {

  try {

    await signOut(auth);

    loginStatus.textContent =
      "లాగౌట్ విజయవంతమైంది.";

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

    loginStatus.textContent =
      "లాగౌట్ కాలేదు.";
  }
};


/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(
  auth,
  async (user) => {

    if (
      user &&
      user.email &&
      user.email.toLowerCase() ===
      ADMIN_EMAIL.toLowerCase()
    ) {

      loginBox.classList.add("hidden");

      panel.classList.remove("hidden");

      loginStatus.textContent = "";

      try {

        await loadMenu();

        await loadOrders();

      } catch (error) {

        console.error(
          "Admin load error:",
          error
        );
      }

    } else {

      if (user) {

        await signOut(auth);
      }

      loginBox.classList.remove("hidden");

      panel.classList.add("hidden");
    }

  }
);


/* =========================
   ADD MENU ITEM
========================= */

menuForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    const name =
      document.querySelector("#itemName")
        .value
        .trim();

    const price =
      Number(
        document.querySelector("#itemPrice")
          .value
      );

    if (!name || !price) {

      alert(
        "కూర పేరు మరియు ధర ఇవ్వండి."
      );

      return;
    }

    try {

      await addDoc(
        collection(db, "menu"),
        {
          name: name,
          price: price,
          createdAt:
            new Date().toISOString()
        }
      );

      menuForm.reset();

      await loadMenu();

      alert(
        "Menu item విజయవంతంగా save అయింది."
      );

    } catch (error) {

      console.error(
        "Menu save error:",
        error
      );

      alert(
        "Menu save కాలేదు. Admin account తో login అయ్యారా check చెయ్యండి."
      );
    }

  }
);


/* =========================
   LOAD MENU
========================= */

async function loadMenu() {

  const el =
    document.querySelector("#adminMenu");

  try {

    const snap =
      await getDocs(
        query(
          collection(db, "menu"),
          orderBy(
            "createdAt",
            "desc"
          )
        )
      );

    if (snap.empty) {

      el.innerHTML =
        "Menu ఇంకా లేదు.";

      return;
    }

    el.innerHTML =
      snap.docs
        .map((itemDoc) => {

          const item =
            itemDoc.data();

          return `
            <article class="card">

              <div class="card-body">

                <h3>
                  ${item.name || ""}
                </h3>

                <div class="price">
                  ₹${item.price || 0}
                </div>

                <button
                  type="button"
                  data-id="${itemDoc.id}"
                  class="delete"
                >
                  తొలగించు
                </button>

              </div>

            </article>
          `;

        })
        .join("");


    /* =========================
       DELETE MENU
    ========================= */

    el.querySelectorAll(
      ".delete"
    ).forEach((button) => {

      button.onclick =
        async () => {

          const ok =
            confirm(
              "ఈ Menu item తొలగించాలా?"
            );

          if (!ok) {
            return;
          }

          try {

            await deleteDoc(
              doc(
                db,
                "menu",
                button.dataset.id
              )
            );

            await loadMenu();

          } catch (error) {

            console.error(
              "Delete error:",
              error
            );

            alert(
              "తొలగించలేకపోయాము."
            );
          }

        };

    });

  } catch (error) {

    console.error(
      "Menu load error:",
      error
    );

    el.innerHTML =
      "Menu load కాలేదు. Firebase settings check చేయండి.";
  }
}


/* =========================
   LOAD ORDERS
========================= */

async function loadOrders() {

  const el =
    document.querySelector("#orders");

  try {

    const snap =
      await getDocs(
        query(
          collection(db, "orders"),
          orderBy(
            "createdAt",
            "desc"
          )
        )
      );

    if (snap.empty) {

      el.innerHTML =
        "ఆర్డర్లు ఇంకా లేవు.";

      return;
    }

    el.innerHTML =
      snap.docs
        .map((orderDoc) => {

          const order =
            orderDoc.data();

          return `
            <div class="order">

              <b>
                ${order.name || "పేరు లేదు"}
              </b>

              · ${order.phone || ""}

              <br>

              భోజనాలు:
              ${order.quantity || 0}

              <br>

              ${order.address || "Address లేదు"}

            </div>
          `;

        })
        .join("");

  } catch (error) {

    console.error(
      "Orders load error:",
      error
    );

    el.innerHTML =
      "Orders load కాలేదు.";
  }
}
