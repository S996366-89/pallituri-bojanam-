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

const loginBox =
  document.querySelector("#loginBox");

const panel =
  document.querySelector("#panel");

const loginStatus =
  document.querySelector("#loginStatus");

const loginBtn =
  document.querySelector("#loginBtn");

const logoutBtn =
  document.querySelector("#logoutBtn");

const menuForm =
  document.querySelector("#menuForm");

const adminMenu =
  document.querySelector("#adminMenu");


/* =========================
   ADMIN LOGIN
========================= */

if (loginBtn) {

  loginBtn.addEventListener(
    "click",
    async () => {

      const email =
        document
          .querySelector("#email")
          .value
          .trim();

      const password =
        document
          .querySelector("#password")
          .value;


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
          "LOGIN ERROR:",
          error
        );

        loginStatus.textContent =
          "Login కాలేదు: " +
          (error.code || error.message);

      }

    }
  );

}


/* =========================
   LOGOUT
========================= */

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      try {

        await signOut(auth);

        loginStatus.textContent =
          "లాగౌట్ విజయవంతమైంది.";

      } catch (error) {

        console.error(
          "LOGOUT ERROR:",
          error
        );

      }

    }
  );

}


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
          "ADMIN LOAD ERROR:",
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

if (menuForm) {

  menuForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const name =
        document
          .querySelector("#itemName")
          .value
          .trim();


      const price =
        Number(
          document
            .querySelector("#itemPrice")
            .value
        );


      const category =
        document
          .querySelector("#itemCategory")
          .value;


      if (
        !name ||
        price <= 0 ||
        !category
      ) {

        alert(
          "కూర పేరు, ధర మరియు వర్గం ఇవ్వండి."
        );

        return;
      }


      try {

        await addDoc(
          collection(db, "menu"),
          {

            name: name,

            price: price,

            category: category,

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
          "MENU SAVE ERROR:",
          error
        );

        alert(
          "Menu save కాలేదు."
        );

      }

    }
  );

}


/* =========================
   LOAD MENU
========================= */

async function loadMenu() {

  if (!adminMenu) return;


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

      adminMenu.innerHTML =
        `<p class="muted">
          Menu ఇంకా లేదు.
        </p>`;

      return;
    }


    adminMenu.innerHTML =
      snap.docs
        .map((itemDoc) => {

          const item =
            itemDoc.data();


          const categoryText =
            item.category === "nonveg"
              ? "🍗 Non-Veg"
              : "🥬 Veg";

       const categoryClass =
  item.category === "veg"
    ? "veg"
    : "nonveg";

return `
  <div class="admin-menu-row">

    <div class="admin-curry-name">
      ${item.name || ""}
    </div>

    <div class="admin-curry-price">
      ₹${item.price || 0}
    </div>

    <div class="admin-category ${categoryClass}">
      ${categoryText}
    </div>

    <button
      type="button"
      class="delete"
      data-id="${itemDoc.id}"
    >
      తొలగించు
    </button>

  </div>
`;
        
   })
        .join("");


    adminMenu
      .querySelectorAll(".delete")
      .forEach((button) => {

        button.addEventListener(
          "click",
          async () => {

            const ok =
              confirm(
                "ఈ Menu item తొలగించాలా?"
              );


            if (!ok) return;


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
                "DELETE ERROR:",
                error
              );

              alert(
                "తొలగించలేకపోయాము."
              );

            }

          }
        );

      });

  } catch (error) {

    console.error(
      "MENU LOAD ERROR:",
      error
    );

    adminMenu.innerHTML =
      "Menu load కాలేదు.";

  }

}


/* =========================
   LOAD ALL ORDERS
========================= */

async function loadOrders() {

  await loadMonthlyOrders();

  await loadDailyOrders();

}

/* =========================
   MONTHLY ORDERS TOGGLE
========================= */

const monthlyOrdersToggle =
  document.querySelector("#monthlyOrdersToggle");

const monthlyOrdersPanel =
  document.querySelector("#monthlyOrdersPanel");

if (monthlyOrdersToggle && monthlyOrdersPanel) {

  monthlyOrdersToggle.addEventListener(
    "click",
    () => {

      const isHidden =
        monthlyOrdersPanel.style.display === "none";

      monthlyOrdersPanel.style.display =
        isHidden ? "block" : "none";

      const arrow =
        monthlyOrdersToggle.querySelector("span");

      if (arrow) {
        arrow.textContent =
          isHidden ? "▲" : "▼";
      }

    }
  );

}

/* =========================
   MONTHLY PLAN ORDERS
========================= */

async function loadMonthlyOrders() {

  const el =
    document.querySelector(
      "#monthlyOrders"
    );


  if (!el) return;


  try {

    const snap =
      await getDocs(
        query(
          collection(
            db,
            "monthlyOrders"
          ),
          orderBy(
            "createdAt",
            "desc"
          )
        )
      );
     
      const monthlyOrdersCount =
        document.querySelector("#monthlyOrdersCount");

       if (monthlyOrdersCount) {
          monthlyOrdersCount.textContent =
           `మొత్తం నెలవారీ కస్టమర్లు: ${snap.size}`;
     }

    if (snap.empty) {

      el.innerHTML =
        `<p class="muted">
          నెలవారీ పథకం ఆర్డర్లు ఇంకా లేవు.
        </p>`;

      return;
    }


    el.innerHTML =
      snap.docs
        .map((orderDoc) => {

          const order =
            orderDoc.data();

         const dateTime =
           order.createdAt
            ? order.createdAt.toDate
           ? order.createdAt.toDate()
           : new Date(order.createdAt)
           : null;


          const date =
            dateTime
              ? dateTime.toLocaleDateString(
                  "en-IN"
                )
              : "";


          const time =
            dateTime
              ? dateTime.toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "2-digit",
                    minute: "2-digit"
                  }
                )
              : "";
return `
  <div class="order monthly-order-row">

    <span>
      👤 ${order.name || "పేరు లేదు"}
    </span>

    <span>
      📞 ${order.phone || ""}
    </span>

    <span>
      📅 ${date}
    </span>

    <span>
      ⏰ ${time}
    </span>

     <span>
       💰 ${order.plan || ""}
     </span>

    <span>
      🍱 ${order.quantity || 0}
    </span>

  </div>
`;
  
        })
        .join("");

  } catch (error) {

    console.error(
      "MONTHLY ORDERS ERROR:",
      error
    );

    el.innerHTML =
      "నెలవారీ ఆర్డర్లు load కాలేదు.";

  }

}


/* =========================
   DAILY FOOD ORDERS
========================= */

async function loadDailyOrders() {

  const el =
    document.querySelector(
      "#orders"
    );


  if (!el) return;


  try {

    const snap =
      await getDocs(
        query(
          collection(
            db,
            "orders"
          ),
          orderBy(
            "createdAt",
            "desc"
          )
        )
      );


    if (snap.empty) {

      el.innerHTML =
        `<p class="muted">
          రోజువారీ ఆర్డర్లు ఇంకా లేవు.
        </p>`;

      return;
    }


    el.innerHTML =
      snap.docs
        .map((orderDoc) => {

          const order =
            orderDoc.data();


         const dateTime =
         order.createdAt
         ? new Date(
            order.createdAt
          )
           : null;


          const date =
            dateTime
              ? dateTime.toLocaleDateString(
                  "en-IN"
                )
              : "";


          const time =
            dateTime
              ? dateTime.toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "2-digit",
                    minute: "2-digit"
                  }
                )
              : "";

         return `
  <div class="order daily-order-row">

    <span>
      👤 ${order.name || "పేరు లేదు"}
    </span>

    <span>
      📞 ${order.phone || ""}
    </span>

    <span>
      📅 ${date}
    </span>

    <span>
      ⏰ ${time}
    </span>

    <span>
      🍱 ${order.quantity || 0}
    </span>

  </div>
`;
        })
        .join("");

  } catch (error) {

    console.error(
      "DAILY ORDERS ERROR:",
      error
    );

    el.innerHTML =
      "రోజువారీ ఆర్డర్లు load కాలేదు.";

  }

}


console.log(
  "పల్లెటూరు భోజనం Admin started successfully."
);
