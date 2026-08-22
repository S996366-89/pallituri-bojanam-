import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";


/* =========================
   FIREBASE
========================= */

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


/* =========================
   ELEMENTS
========================= */

const menuEl = document.querySelector("#menu");
const orderForm = document.querySelector("#orderForm");
const orderStatus = document.querySelector("#orderStatus");


/* =========================
   HTML SAFETY
========================= */

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char];
  });
}


/* =========================
   LOAD MENU
========================= */

async function loadMenu() {

  try {

    const snap = await getDocs(
      query(
        collection(db, "menu"),
        orderBy("createdAt", "desc")
      )
    );

    if (snap.empty) {

      menuEl.innerHTML = `
        <h2>ఈరోజు భోజనం</h2>

        <p class="muted">
          ఇవాళ మెనూ ఇంకా పెట్టలేదు.
        </p>
      `;

      return;
    }


    menuEl.innerHTML = `
      <h2>ఈరోజు భోజనం</h2>

      <div class="menu-grid">

        ${snap.docs.map((docSnap) => {

          const item = docSnap.data();

          return `
            <article class="menu-card">

              <h3>
                ${escapeHtml(item.name || "కూర")}
              </h3>

              <p>
                ₹${Number(item.price || 0)}
              </p>

            </article>
          `;

        }).join("")}

      </div>
    `;

  } catch (error) {

    console.error("MENU ERROR:", error);

    menuEl.innerHTML = `
      <h2>ఈరోజు భోజనం</h2>

      <p class="muted">
        మెనూ లోడ్ కాలేదు.
      </p>
    `;

  }

}


/* =========================
   ORDER
========================= */

orderForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  orderStatus.textContent = "ఆర్డర్ పంపుతోంది...";


  const name =
    document.querySelector("#name").value.trim();

  const phone =
    document.querySelector("#phone").value.trim();

  const address =
    document.querySelector("#address").value.trim();

  const quantity =
    Number(document.querySelector("#quantity").value);


  /* VALIDATION */

  if (!name || !phone || !address || quantity < 1) {

    orderStatus.textContent =
      "దయచేసి అన్ని వివరాలు సరిగ్గా ఇవ్వండి.";

    return;
  }


  try {

    console.log("ORDER START");

    const orderData = {

      name: name,

      phone: phone,

      address: address,

      quantity: quantity,

      status: "new",

      createdAt: new Date().toISOString()

    };


    console.log("ORDER DATA:", orderData);


    const orderRef = await addDoc(
      collection(db, "orders"),
      orderData
    );


    console.log(
      "ORDER SAVED:",
      orderRef.id
    );


    orderStatus.textContent =
      "✅ ఆర్డర్ విజయవంతంగా పంపబడింది. ధన్యవాదాలు!";


    orderForm.reset();

    document.querySelector("#quantity").value = 1;


  } catch (error) {

    console.error(
      "ORDER ERROR:",
      error
    );


    orderStatus.textContent =
      `❌ ఆర్డర్ పంపలేకపోయాం: ${
        error.code || error.message
      }`;

  }

});


/* =========================
   START
========================= */

loadMenu();

console.log(
  "పల్లెటూరు భోజనం website started successfully."
);
