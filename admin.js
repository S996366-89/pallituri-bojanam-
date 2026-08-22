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


/* =========================
   ADMIN LOGIN
========================= */

document.querySelector("#loginBtn").onclick = async () => {

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;

  if (!email || !password) {
    loginStatus.textContent =
      "Email మరియు Password ఇవ్వండి.";
    return;
  }

  loginStatus.textContent = "Login అవుతోంది...";

  try {

    const result = await signInWithEmailAndPassword(
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

    loginStatus.textContent = "Login విజయవంతమైంది.";

  } catch (e) {

    console.error("Firebase login error:", e);

    loginStatus.textContent =
      `Login error: ${e.code || e.message}`;
  }
};


/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(auth, async (user) => {

  if (
    user &&
    user.email &&
    user.email.toLowerCase() ===
    ADMIN_EMAIL.toLowerCase()
  ) {

    loginBox.classList.add("hidden");
    panel.classList.remove("hidden");

    if (loginStatus) {
      loginStatus.textContent = "";
    }

    try {
      await loadMenu();
      await loadOrders();
    } catch (e) {
      console.error("Load error:", e);
    }

  } else {

    if (user) {
      await signOut(auth);
    }

    loginBox.classList.remove("hidden");
    panel.classList.add("hidden");
  }

});


/* =========================
   ADD MENU ITEM
========================= */

document.querySelector("#menuForm").addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    const name =
      document.querySelector("#itemName").value.trim();

    const price =
      Number(document.querySelector("#itemPrice").value);

    const image =
      document.querySelector("#itemImage").value.trim();

    if (!name || !price) {
      alert("కూర పేరు మరియు ధర ఇవ్వండి.");
      return;
    }

    try {

      await addDoc(collection(db, "menu"), {
        name: name,
        price: price,
        image: image,
        createdAt: new Date().toISOString()
      });

      e.target.reset();

      await loadMenu();

      alert("Menu item విజయవంతంగా save అయింది.");

    } catch (e) {

      console.error("Menu save error:", e);

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

  const el = document.querySelector("#adminMenu");

  try {

    const snap = await getDocs(
      query(
        collection(db, "menu"),
        orderBy("createdAt", "desc")
      )
    );

    if (snap.empty) {
      el.innerHTML = "Menu ఇంకా లేదు.";
      return;
    }

    el.innerHTML = snap.docs.map((d) => {

      const x = d.data();

      return `
        <article class="card">

          <img
            src="${x.image || "https://placehold.co/600x600"}"
            alt="${x.name || "Menu item"}"
          >

          <div class="card-body">

            <h3>${x.name || ""}</h3>

            <div class="price">
              ₹${x.price || 0}
            </div>

            <button
              type="button"
              data-id="${d.id}"
              class="delete"
            >
              తొలగించు
            </button>

          </div>

        </article>
      `;

    }).join("");

    el.querySelectorAll(".delete").forEach((button) => {

      button.onclick = async () => {

        const ok = confirm(
          "ఈ Menu item తొలగించాలా?"
        );

        if (!ok) return;

        try {

          await deleteDoc(
            doc(db, "menu", button.dataset.id)
          );

          await loadMenu();

        } catch (e) {

          console.error("Delete error:", e);

          alert("తొలగించలేకపోయాము.");

        }

      };

    });

  } catch (e) {

    console.error("Menu load error:", e);

    el.innerHTML =
      "Menu load కాలేదు. Firebase settings check చేయండి.";

  }

}


/* =========================
   LOAD ORDERS
========================= */

async function loadOrders() {

  const el = document.querySelector("#orders");

  try {

    const snap = await getDocs(
      query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
      )
    );

    if (snap.empty) {

      el.innerHTML = "ఆర్డర్లు ఇంకా లేవు.";

      return;
    }

    el.innerHTML = snap.docs.map((d) => {

      const x = d.data();

      return `
        <div class="order">

          <b>${x.name || "పేరు లేదు"}</b>
          · ${x.phone || ""}

          <br>

          భోజనాలు:
          ${x.quantity || 0}

          <br>

          ${x.address || "Address లేదు"}

        </div>
      `;

    }).join("");

  } catch (e) {

    console.error("Orders load error:", e);

    el.innerHTML =
      "Orders load కాలేదు.";

  }

}
