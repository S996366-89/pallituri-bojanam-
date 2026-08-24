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

const menuEl = document.querySelector("#menuGrid");

const orderForm = document.querySelector("#orderForm");

const orderStatus = document.querySelector("#orderStatus");


/* =========================
   SECURITY
========================= */

function escapeHtml(value) {

  return String(value).replace(
    /[&<>"']/g,
    (char) => {

      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char];

    }
  );

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


    /* =========================
       NO MENU
    ========================= */

    if (snap.empty) {

      menuEl.innerHTML = `
        <div class="empty-menu">

          <p class="muted">
            ఇవాళ మెనూ ఇంకా పెట్టలేదు.
          </p>

        </div>
      `;

      return;
    }


    /* =========================
       VEG / NON-VEG
    ========================= */

    const vegItems = [];

    const nonVegItems = [];


    snap.docs.forEach((docSnap) => {

      const item = docSnap.data();


      if (
        String(item.category || "").toLowerCase() ===
        "nonveg"
      ) {

        nonVegItems.push(item);

      } else {

        vegItems.push(item);

      }

    });


    /* =========================
       MENU UI
    ========================= */

    menuEl.innerHTML = `

      <!-- =====================
           VEG BOX
      ====================== -->

      <section
        class="customer-menu-section"
        data-category="veg"
      >

        <h3 class="customer-menu-title veg-title">
          🥬 Veg
        </h3>


        <div class="today-menu">

          <div class="menu-heading">

            <span>
              కూర పేరు
            </span>

            <span>
              ధర
            </span>

          </div>


          ${
            vegItems.length

              ? vegItems.map((item) => `

                  <div class="today-menu-item">

                    <span class="item-name">
                      ${escapeHtml(
                        item.name || "కూర"
                      )}
                    </span>

                    <span class="item-price">
                      ₹${Number(
                        item.price || 0
                      )}
                    </span>

                  </div>

                `).join("")

              : `

                  <p class="muted menu-empty">
                    Veg మెనూ ఇంకా లేదు.
                  </p>

                `
          }

        </div>

      </section>


      <!-- =====================
           NON-VEG BOX
      ====================== -->

      <section
        class="customer-menu-section"
        data-category="nonveg"
      >

        <h3 class="customer-menu-title nonveg-title">
          🍗 Non-Veg
        </h3>


        <div class="today-menu">

          <div class="menu-heading">

            <span>
              కూర పేరు
            </span>

            <span>
              ధర
            </span>

          </div>


          ${
            nonVegItems.length

              ? nonVegItems.map((item) => `

                  <div class="today-menu-item">

                    <span class="item-name">
                      ${escapeHtml(
                        item.name || "కూర"
                      )}
                    </span>

                    <span class="item-price">
                      ₹${Number(
                        item.price || 0
                      )}
                    </span>

                  </div>

                `).join("")

              : `

                  <p class="muted menu-empty">
                    Non-Veg మెనూ ఇంకా లేదు.
                  </p>

                `
          }

        </div>

      </section>

    `;


  } catch (error) {

    console.error(
      "MENU ERROR:",
      error
    );


    menuEl.innerHTML = `

      <div class="empty-menu">

        <p class="muted">
          మెనూ లోడ్ కాలేదు.
        </p>

      </div>

    `;

  }

}


/* =========================
   ORDER
========================= */

orderForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    orderStatus.textContent =
      "ఆర్డర్ పంపుతోంది...";


    const name =
      document
        .querySelector("#name")
        .value
        .trim();


    const phone =
      document
        .querySelector("#phone")
        .value
        .trim();


    const address =
      document
        .querySelector("#address")
        .value
        .trim();


    const quantity =
      Number(
        document
          .querySelector("#quantity")
          .value
      );


    /* =========================
       VALIDATION
    ========================= */

    if (
      !name ||
      !phone ||
      !address ||
      quantity < 1
    ) {

      orderStatus.textContent =
        "దయచేసి అన్ని వివరాలు సరిగ్గా ఇవ్వండి.";

      return;

    }


    /* =========================
       SAVE ORDER
    ========================= */

    try {

      await addDoc(
        collection(db, "orders"),
        {

          name: name,

          phone: phone,

          address: address,

          quantity: quantity,

          status: "new",

          createdAt:
            new Date().toISOString()

        }
      );


      orderStatus.textContent =
        "✅ ఆర్డర్ విజయవంతంగా పంపబడింది. ధన్యవాదాలు!";


      orderForm.reset();


      document.querySelector(
        "#quantity"
      ).value = 1;


    } catch (error) {

      console.error(
        "ORDER ERROR:",
        error
      );


      orderStatus.textContent =
        "❌ ఆర్డర్ పంపలేకపోయాం: " +
        (error.code || error.message);

    }

  }
);


/* =========================
   START
========================= */

loadMenu();


console.log(
  "పల్లెటూరు భోజనం website started successfully."
);
/* =========================
   MONTHLY VEG PLAN
========================= */

const planDays =
  document.querySelector("#planDays");

const planTotal =
  document.querySelector("#planTotal");

const monthlyPlanBtn =
  document.querySelector("#monthlyPlanBtn");

const monthlyPlanStatus =
  document.querySelector("#monthlyPlanStatus");


const VEG_PRICE_PER_DAY = 69;
const monthlyName =
  document.querySelector("#monthlyName");

const monthlyPhone =
  document.querySelector("#monthlyPhone");

const monthlyAddress =
  document.querySelector("#monthlyAddress");

const monthlyQuantity =
  document.querySelector("#monthlyQuantity");


/* =========================
   UPDATE MONTHLY TOTAL
========================= */

function updatePlanTotal() {

  const days =
    Number(planDays.value);

  const quantity =
    Number(monthlyQuantity.value);

  const total =
    days *
    VEG_PRICE_PER_DAY *
    quantity;

  planTotal.textContent =
    `₹${total.toLocaleString("en-IN")}`;
}


/* =========================
   PLAN TOTAL EVENTS
========================= */

if (planDays) {

  planDays.addEventListener(
    "change",
    updatePlanTotal
  );

}

if (monthlyQuantity) {

  monthlyQuantity.addEventListener(
    "input",
    updatePlanTotal
  );

}


/* =========================
   INITIAL TOTAL
========================= */

updatePlanTotal();


/* =========================
   MONTHLY PLAN ORDER
========================= */

if (monthlyPlanBtn) {

  monthlyPlanBtn.addEventListener(
    "click",
    async () => {

      const name =
        monthlyName.value.trim();

      const phone =
        monthlyPhone.value.trim();

      const address =
        monthlyAddress.value.trim();

      const quantity =
        Number(monthlyQuantity.value);

      const days =
        Number(planDays.value);

      const total =
        days *
        VEG_PRICE_PER_DAY *
        quantity;


      /* =========================
         VALIDATION
      ========================= */

      if (
        !name ||
        !phone ||
        !address ||
        quantity < 1 ||
        days < 1
      ) {

        monthlyPlanStatus.textContent =
          "దయచేసి పేరు, ఫోన్ నంబర్, చిరునామా మరియు భోజనాల సంఖ్య ఇవ్వండి.";

        return;
      }


      monthlyPlanStatus.textContent =
        "నెలవారీ పథకం పంపుతోంది...";


      /* =========================
         SAVE MONTHLY ORDER
      ========================= */

      try {

        await addDoc(
          collection(
            db,
            "monthlyOrders"
          ),
          {

            name: name,

            phone: phone,

            address: address,

            quantity: quantity,

            planType: "Veg",

            planDays: days,

            pricePerDay:
              VEG_PRICE_PER_DAY,

            totalAmount:
              total,

            status: "new",

            createdAt:
              new Date().toISOString()

          }
        );


        monthlyPlanStatus.textContent =
          "✅ నెలవారీ పథకం విజయవంతంగా నమోదు అయింది. ధన్యవాదాలు!";


        /* clear ONLY monthly fields */

        monthlyName.value = "";

        monthlyPhone.value = "";

        monthlyAddress.value = "";

        monthlyQuantity.value = 1;

        planDays.value = 26;

        updatePlanTotal();


      } catch (error) {

        console.error(
          "MONTHLY PLAN ERROR:",
          error
        );

        monthlyPlanStatus.textContent =
          "❌ నెలవారీ పథకం నమోదు కాలేదు: " +
          (error.code || error.message);

      }

    }
  );

}
