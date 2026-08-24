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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const menuEl = document.querySelector("#menuGrid");
const orderForm = document.querySelector("#orderForm");
const orderStatus = document.querySelector("#orderStatus");

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
        <p class="muted">ఇవాళ మెనూ ఇంకా పెట్టలేదు.</p>
      `;
      return;
    }

    const vegItems = [];
    const nonVegItems = [];

    snap.docs.forEach((docSnap) => {
      const item = docSnap.data();

      if (item.category === "nonveg") {
        nonVegItems.push(item);
      } else {
        vegItems.push(item);
      }
    });

    menuEl.innerHTML = `
      <div class="menu-filter">
        <label for="menuCategory">మెనూ ఎంచుకోండి</label>

        <select id="menuCategory">
          <option value="all">అన్ని రకాల భోజనం</option>
          <option value="veg">🥬 Veg</option>
          <option value="nonveg">🍗 Non-Veg</option>
        </select>
      </div>

      <section class="customer-menu-section" data-category="veg">
        <h3 class="customer-menu-title">🥬 Veg</h3>

        <div class="today-menu">
          <div class="menu-heading">
            <span>కూర పేరు</span>
            <span>ధర</span>
          </div>

          ${
            vegItems.length
              ? vegItems.map((item) => `
                <div class="today-menu-item">
                  <span class="item-name">
                    ${escapeHtml(item.name || "కూర")}
                  </span>
                  <span class="item-price">
                    ₹${Number(item.price || 0)}
                  </span>
                </div>
              `).join("")
              : `<p class="muted menu-empty">Veg మెనూ ఇంకా లేదు.</p>`
          }
        </div>
      </section>

      <section class="customer-menu-section" data-category="nonveg">
        <h3 class="customer-menu-title">🍗 Non-Veg</h3>

        <div class="today-menu">
          <div class="menu-heading">
            <span>కూర పేరు</span>
            <span>ధర</span>
          </div>

          ${
            nonVegItems.length
              ? nonVegItems.map((item) => `
                <div class="today-menu-item">
                  <span class="item-name">
                    ${escapeHtml(item.name || "కూర")}
                  </span>
                  <span class="item-price">
                    ₹${Number(item.price || 0)}
                  </span>
                </div>
              `).join("")
              : `<p class="muted menu-empty">Non-Veg మెనూ ఇంకా లేదు.</p>`
          }
        </div>
      </section>
    `;

    const categorySelect = document.querySelector("#menuCategory");
    const sections = document.querySelectorAll(".customer-menu-section");

    categorySelect.addEventListener("change", () => {
      const selected = categorySelect.value;

      sections.forEach((section) => {
        if (
          selected === "all" ||
          selected === section.dataset.category
        ) {
          section.style.display = "block";
        } else {
          section.style.display = "none";
        }
      });
    });

  } catch (error) {
    console.error("MENU ERROR:", error);

    menuEl.innerHTML = `
      <p class="muted">మెనూ లోడ్ కాలేదు.</p>
    `;
  }
}

orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  orderStatus.textContent = "ఆర్డర్ పంపుతోంది...";

  const name = document.querySelector("#name").value.trim();
  const phone = document.querySelector("#phone").value.trim();
  const address = document.querySelector("#address").value.trim();
  const quantity = Number(
    document.querySelector("#quantity").value
  );

  if (!name || !phone || !address || quantity < 1) {
    orderStatus.textContent =
      "దయచేసి అన్ని వివరాలు సరిగ్గా ఇవ్వండి.";
    return;
  }

  try {
    await addDoc(collection(db, "orders"), {
      name: name,
      phone: phone,
      address: address,
      quantity: quantity,
      status: "new",
      createdAt: new Date().toISOString()
    });

    orderStatus.textContent =
      "✅ ఆర్డర్ విజయవంతంగా పంపబడింది. ధన్యవాదాలు!";

    orderForm.reset();
    document.querySelector("#quantity").value = 1;

  } catch (error) {
    console.error("ORDER ERROR:", error);

    orderStatus.textContent =
      "❌ ఆర్డర్ పంపలేకపోయాం: " +
      (error.code || error.message);
  }
});

loadMenu();

console.log("పల్లెటూరు భోజనం website started successfully.");
