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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = "s09858787@gmail.com";

const loginBox = document.querySelector("#loginBox");
const panel = document.querySelector("#panel");

document.querySelector("#loginBtn").onclick = async () => {
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);

    if (result.user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      await signOut(auth);
      document.querySelector("#loginStatus").textContent =
        "ఈ ఖాతాకు Admin access లేదు.";
    }
  } catch (e) {
    document.querySelector("#loginStatus").textContent =
      "లాగిన్ వివరాలు తప్పుగా ఉన్నాయి.";
  }
};
document.querySelector("#logoutBtn").onclick = () => signOut(auth);
onAuthStateChanged(auth, async user => {
  if (user && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    loginBox.classList.add("hidden");
    panel.classList.remove("hidden");
    loadMenu();
    loadOrders();
  } else {
    if (user) {
      await signOut(auth);
    }
    loginBox.classList.remove("hidden");
    panel.classList.add("hidden");
    document.querySelector("#loginStatus").textContent =
      "ఈ ఖాతాకు Admin access లేదు.";
  }
});

    await loadMenu();
    await loadOrders();
  } else {
    if (user) {
      await signOut(auth);
    }

    loginBox.classList.remove("hidden");
    panel.classList.add("hidden");
  }
});
document.querySelector("#menuForm").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    await addDoc(collection(db, "menu"), {
      name: document.querySelector("#itemName").value.trim(),
      price: Number(document.querySelector("#itemPrice").value),
      image: document.querySelector("#itemImage").value.trim(),
      createdAt: new Date().toISOString()
    });

    e.target.reset();
    await loadMenu();

  } catch (e) {
    alert("Menu save కాలేదు. Admin account తో login అయ్యారా check చెయ్యండి.");
  }
});

async function loadMenu() {
  const el = document.querySelector("#adminMenu");

  const snap = await getDocs(
    query(
      collection(db, "menu"),
      orderBy("createdAt", "desc")
    )
  );

  el.innerHTML = snap.docs.map(d => {
    const x = d.data();

    return `
      <article class="card">
        <img src="${x.image || "https://placehold.co/600x600"}">

        <div class="card-body">
          <h3>${x.name}</h3>

          <div class="price">
            ₹${x.price}
          </div>

          <button
            data-id="${d.id}"
            class="delete">
            తొలగించు
          </button>
        </div>
      </article>
    `;
  }).join("");

  el.querySelectorAll(".delete").forEach(button => {
    button.onclick = async () => {
      await deleteDoc(
        doc(db, "menu", button.dataset.id)
      );

      await loadMenu();
    };
  });
}

async function loadOrders() {
  const el = document.querySelector("#orders");

  const snap = await getDocs(
    query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    )
  );

  el.innerHTML = snap.empty
    ? "ఆర్డర్లు ఇంకా లేవు."
    : snap.docs.map(d => {
        const x = d.data();

        return `
          <div class="order">
            <b>${x.name}</b> · ${x.phone}<br>
            భోజనాలు: ${x.quantity}<br>
            ${x.address}
          </div>
        `;
      }).join("");
}
