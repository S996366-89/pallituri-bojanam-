import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";


/* =========================
   FIREBASE
========================= */

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


/* =========================
   ELEMENTS
========================= */

const menuEl =
  document.querySelector("#menuGrid");

const orderForm =
  document.querySelector("#orderForm");

const orderStatus =
  document.querySelector("#orderStatus");


/* =========================
   MONTHLY CUSTOMER
========================= */

const monthlyCustomerLogin =
  document.querySelector("#monthlyCustomerLogin");

const customerPasswordStep =
  document.querySelector("#customerPasswordStep");

const customerPassword =
  document.querySelector("#customerPassword");

const customerPasswordConfirm =
  document.querySelector("#customerPasswordConfirm");

const saveCustomerPasswordBtn =
  document.querySelector("#saveCustomerPasswordBtn");

const customerLoginStatus =
  document.querySelector("#customerLoginStatus");

const monthlyCustomerCurry =
  document.querySelector("#monthlyCustomerCurry");

/* =========================
   CUSTOMER LOGIN
========================= */

const customerLoginBtn =
  document.querySelector(
    "#customerLoginBtn"
  );

const customerLoginSection =
  document.querySelector(
    "#customerLoginSection"
  );

const customerLoginTitle =
  document.querySelector(
    "#customerLoginTitle"
  );

const loginPhone =
  document.querySelector(
    "#loginPhone"
  );

const loginPassword =
  document.querySelector(
    "#loginPassword"
  );

const customerLoginSubmitBtn =
  document.querySelector(
    "#customerLoginSubmitBtn"
  );

const customerLogoutBtn =
  document.querySelector(
    "#customerLogoutBtn"
  );
const customerLoginMessage =
  document.querySelector(
    "#customerLoginMessage"
  );

/* =========================
   OPEN CUSTOMER LOGIN
========================= */

if (customerLoginBtn) {

  customerLoginBtn.addEventListener(
    "click",
    () => {

      if (customerLoginSection) {

        customerLoginSection.style.display =
          "block";

        customerLoginSection.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

      }

    }
  );

}


/* =========================
   CUSTOMER PHONE
========================= */

let monthlyCustomerPhone = "";

/* =========================
   CUSTOMER LOGIN
========================= */

if (customerLoginSubmitBtn) {

  customerLoginSubmitBtn.addEventListener(
    "click",
    async () => {

      const phone =
        loginPhone?.value.trim() || "";

      const password =
        loginPassword?.value.trim() || "";


      /* =========================
         VALIDATION
      ========================= */

      if (!/^[6-9]\d{9}$/.test(phone)) {

        if (customerLoginMessage) {
          customerLoginMessage.textContent =
            "❌ సరైన 10 అంకెల ఫోన్ నంబర్ ఇవ్వండి.";
        }

        return;
      }


      if (!password) {

        if (customerLoginMessage) {
          customerLoginMessage.textContent =
            "❌ Password నమోదు చేయండి.";
        }

        return;
      }


      /* =========================
         FIREBASE EMAIL
      ========================= */

      const customerEmail =
        phone + "@pallituri-bojanam.com";


      try {

        if (customerLoginMessage) {
          customerLoginMessage.textContent =
            "⏳ Login అవుతోంది...";
        }


        /* =========================
           LOGIN
        ========================= */

        await signInWithEmailAndPassword(
          auth,
          customerEmail,
          password
        );
         monthlyCustomerPhone = phone;
       
       /* =========================
   SUCCESS
========================= */

if (customerLoginMessage) {

  customerLoginMessage.textContent =
    "✅ Login విజయవంతమైంది.";

}


/* =========================
   CHANGE LOGIN TO LOGOUT
========================= */

if (customerLoginTitle) {

  customerLoginTitle.textContent =
    "🚪 కస్టమర్ లాగ్ అవుట్";

}


if (loginPhone) {

  loginPhone.style.display =
    "none";

}


if (loginPassword) {

  loginPassword.style.display =
    "none";

}


if (customerLoginSubmitBtn) {

  customerLoginSubmitBtn.style.display =
    "none";

}


/* =========================
   HIDE LOGIN TEXT
========================= */

const loginDescription =
  customerLoginSection?.querySelector(
    "p"
  );

if (loginDescription) {

  loginDescription.style.display =
    "none";

}


/* =========================
   SHOW LOGOUT BUTTON
========================= */

if (customerLogoutBtn) {

  customerLogoutBtn.style.display =
    "block";

}


/* =========================
   SHOW DAILY CURRY
========================= */

if (monthlyCustomerCurry) {

  monthlyCustomerCurry.style.display =
    "block";

  monthlyCustomerCurry.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}
      } catch (error) {

        console.error(
          "CUSTOMER LOGIN ERROR:",
          error
        );

        if (customerLoginMessage) {

          customerLoginMessage.textContent =
            "❌ Login కాలేదు: " +
            (
              error.code ||
              error.message
            );

        }

      }

    }
  );

}
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

  if (!menuEl) return;

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
           VEG DROPDOWN
      ====================== -->

      <details
        class="customer-menu-section menu-dropdown"
        data-category="veg"
      >

        <summary
          class="customer-menu-title veg-title"
        >
          🥬 Veg
          <span class="menu-arrow">▼</span>
        </summary>


        <div class="today-menu">

          <div class="menu-heading">
            <span>కూర పేరు</span>
            <span>ధర</span>
          </div>


          <div class="menu-scroll">

            ${
              vegItems.length
                ? vegItems
                    .map(
                      (item) => `

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

                      `
                    )
                    .join("")

                : `
                    <p class="muted menu-empty">
                      Veg మెనూ ఇంకా లేదు.
                    </p>
                  `
            }

          </div>

        </div>

      </details>


      <!-- =====================
           NON-VEG DROPDOWN
      ====================== -->

      <details
        class="customer-menu-section menu-dropdown"
        data-category="nonveg"
      >

        <summary
          class="customer-menu-title nonveg-title"
        >
          🍗 Non-Veg
          <span class="menu-arrow">▼</span>
        </summary>


        <div class="today-menu">

          <div class="menu-heading">
            <span>కూర పేరు</span>
            <span>ధర</span>
          </div>


          <div class="menu-scroll">

            ${
              nonVegItems.length
                ? nonVegItems
                    .map(
                      (item) => `

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

                      `
                    )
                    .join("")

                : `
                    <p class="muted menu-empty">
                      Non-Veg మెనూ ఇంకా లేదు.
                    </p>
                  `
            }

          </div>

        </div>

      </details>

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
   NORMAL ORDER
========================= */

if (orderForm) {

  orderForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      if (orderStatus) {

        orderStatus.textContent =
          "ఆర్డర్ పంపుతోంది...";

      }


      const name =
        document
          .querySelector("#name")
          ?.value
          .trim() || "";


      const phone =
        document
          .querySelector("#phone")
          ?.value
          .trim() || "";


      const address =
        document
          .querySelector("#address")
          ?.value
          .trim() || "";


      const quantity =
        Number(
          document
            .querySelector("#quantity")
            ?.value || 0
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

        if (orderStatus) {

          orderStatus.textContent =
            "దయచేసి అన్ని వివరాలు సరిగ్గా ఇవ్వండి.";

        }

        return;

      }


      /* =========================
         SAVE ORDER
      ========================= */

      try {

        await addDoc(
          collection(
            db,
            "orders"
          ),
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


        if (orderStatus) {

          orderStatus.textContent =
            "✅ ఆర్డర్ విజయవంతంగా పంపబడింది. ధన్యవాదాలు!";

        }


        orderForm.reset();


        const quantityInput =
          document.querySelector(
            "#quantity"
          );


        if (quantityInput) {

          quantityInput.value = 1;

        }


      } catch (error) {

        console.error(
          "ORDER ERROR:",
          error
        );


        if (orderStatus) {

          orderStatus.textContent =
            "❌ ఆర్డర్ పంపలేకపోయాం: " +
            (
              error.code ||
              error.message
            );

        }

      }

    }
  );

}


/* =========================
   MONTHLY LUNCH PLANS
========================= */


/* =========================
   PLAN ELEMENTS
========================= */

const plan49Card =
  document.querySelector(
    "#plan49Card"
  );

const plan69Card =
  document.querySelector(
    "#plan69Card"
  );

const select49Btn =
  document.querySelector(
    "#select49Btn"
  );

const select69Btn =
  document.querySelector(
    "#select69Btn"
  );

const selectedPlanDetails =
  document.querySelector(
    "#selectedPlanDetails"
  );

const selectedPlanTitle =
  document.querySelector(
    "#selectedPlanTitle"
  );

const selectedPlanPrice =
  document.querySelector(
    "#selectedPlanPrice"
  );

const plan49Details =
  document.querySelector(
    "#plan49Details"
  );

const plan69Details =
  document.querySelector(
    "#plan69Details"
  );

const monthlyPlanForm =
  document.querySelector(
    "#monthlyPlanForm"
  );

const selectedPlanType =
  document.querySelector(
    "#selectedPlanType"
  );

const selectedPlanPriceValue =
  document.querySelector(
    "#selectedPlanPriceValue"
  );

const planDays =
  document.querySelector(
    "#planDays"
  );

const planTotal =
  document.querySelector(
    "#planTotal"
  );

const monthlyPlanBtn =
  document.querySelector(
    "#monthlyPlanBtn"
  );

const backToMonthlyDetailsBtn =
  document.querySelector(
    "#backToMonthlyDetailsBtn"
  );

const monthlyPlanStatus =
  document.querySelector(
    "#monthlyPlanStatus"
  );

const monthlyName =
  document.querySelector(
    "#monthlyName"
  );

const monthlyPhone =
  document.querySelector(
    "#monthlyPhone"
  );

const monthlyAddress =
  document.querySelector(
    "#monthlyAddress"
  );

const monthlyQuantity =
  document.querySelector(
    "#monthlyQuantity"
  );


/* =========================
   PLAN PRICES
========================= */

const PLAN_49_PRICE = 49;

const PLAN_69_PRICE = 69;


/* =========================
   UPDATE PLAN TOTAL
========================= */

function updatePlanTotal() {

  const days =
    Number(
      planDays?.value || 0
    );

  const price =
    Number(
      selectedPlanPriceValue?.value || 0
    );

  const quantity =
    Number(
      monthlyQuantity?.value || 1
    );


  if (!price) {

    if (planTotal) {

      planTotal.textContent =
        "పథకాన్ని ఎంచుకోండి";

    }

    return;

  }


  const total =
    days *
    price *
    quantity;


  if (planTotal) {

    planTotal.textContent =
      `₹${total.toLocaleString(
        "en-IN"
      )}`;

  }

}


/* =========================
   SELECT MONTHLY PLAN
========================= */

function selectMonthlyPlan(
  planPrice
) {

  const price =
    Number(planPrice);


  /* =========================
     SET PLAN
  ========================= */

  if (selectedPlanType) {

    selectedPlanType.value =
      `₹${price}`;

  }


  if (selectedPlanPriceValue) {

    selectedPlanPriceValue.value =
      price;

  }


  /* =========================
     RESET ACTIVE
  ========================= */

  if (plan49Card) {

    plan49Card.classList.remove(
      "selected"
    );

  }

  if (plan69Card) {

    plan69Card.classList.remove(
      "selected"
    );

  }


  /* =========================
     SHOW DETAILS
  ========================= */

  if (selectedPlanDetails) {

    selectedPlanDetails.style.display =
      "block";

  }


  if (monthlyPlanForm) {

    monthlyPlanForm.style.display =
      "block";

  }


  /* =========================
     ₹49
  ========================= */

  if (
    price ===
    PLAN_49_PRICE
  ) {

    if (selectedPlanTitle) {

      selectedPlanTitle.textContent =
        "₹49 పథకం";

    }


    if (selectedPlanPrice) {

      selectedPlanPrice.textContent =
        "₹49 / రోజు";

    }


    if (plan49Details) {

      plan49Details.style.display =
        "block";

    }


    if (plan69Details) {

      plan69Details.style.display =
        "none";

    }


    if (plan49Card) {

      plan49Card.classList.add(
        "selected"
      );

    }

  }


  /* =========================
     ₹69
  ========================= */

  if (
    price ===
    PLAN_69_PRICE
  ) {

    if (selectedPlanTitle) {

      selectedPlanTitle.textContent =
        "₹69 పథకం";

    }


    if (selectedPlanPrice) {

      selectedPlanPrice.textContent =
        "₹69 / రోజు";

    }


    if (plan49Details) {

      plan49Details.style.display =
        "none";

    }


    if (plan69Details) {

      plan69Details.style.display =
        "block";

    }


    if (plan69Card) {

      plan69Card.classList.add(
        "selected"
      );

    }

  }


  /* =========================
     TOTAL
  ========================= */

  updatePlanTotal();


  /* =========================
     CLOSE DROPDOWN
  ========================= */

  const openDropdown =
    document.querySelector(
      ".plan-dropdown[open]"
    );


  if (openDropdown) {

    openDropdown.removeAttribute(
      "open"
    );

  }


  /* =========================
     SCROLL
  ========================= */

  if (selectedPlanDetails) {

    selectedPlanDetails.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  }

}


/* =========================
   ₹49 BUTTON
========================= */

if (select49Btn) {

  select49Btn.addEventListener(
    "click",
    () => {

      selectMonthlyPlan(
        PLAN_49_PRICE
      );

    }
  );

}


/* =========================
   ₹69 BUTTON
========================= */

if (select69Btn) {

  select69Btn.addEventListener(
    "click",
    () => {

      selectMonthlyPlan(
        PLAN_69_PRICE
      );

    }
  );

}


/* =========================
   DAYS CHANGE
========================= */

if (planDays) {

  planDays.addEventListener(
    "change",
    updatePlanTotal
  );

}


/* =========================
   QUANTITY CHANGE
========================= */

if (monthlyQuantity) {

  monthlyQuantity.addEventListener(
    "input",
    updatePlanTotal
  );

}


/* =========================
   SHOW CUSTOMER LOGIN
========================= */

function showMonthlyCustomerLogin() {

  if (!monthlyCustomerLogin) {

    return;

  }


  monthlyCustomerLogin.style.display =
    "block";


  /* =========================
     SHOW PASSWORD
  ========================= */

  if (customerPasswordStep) {

    customerPasswordStep.style.display =
      "block";

  }


  /* =========================
     CLEAR PASSWORD
  ========================= */

  if (customerPassword) {

    customerPassword.value = "";

  }


  if (customerPasswordConfirm) {

    customerPasswordConfirm.value = "";

  }


  /* =========================
     STATUS
  ========================= */

  if (customerLoginStatus) {

    customerLoginStatus.textContent =
      "🔐 మీ Customer Account కోసం Password సెట్ చేసుకోండి.";

  }


  /* =========================
     HIDE DAILY CURRY
  ========================= */

  if (monthlyCustomerCurry) {

    monthlyCustomerCurry.style.display =
      "none";

  }


  monthlyCustomerLogin.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


/* =========================
   CREATE CUSTOMER ACCOUNT
========================= */

if (saveCustomerPasswordBtn) {

  saveCustomerPasswordBtn.addEventListener(
    "click",
    async () => {

      const password =
        customerPassword
          ?.value
          .trim() || "";


      const confirmPassword =
        customerPasswordConfirm
          ?.value
          .trim() || "";


      /* =========================
         PASSWORD VALIDATION
      ========================= */

      if (
        !password ||
        !confirmPassword
      ) {

        customerLoginStatus.textContent =
          "❌ దయచేసి Password రెండు సార్లు నమోదు చేయండి.";

        return;

      }


      if (
        password.length < 6
      ) {

        customerLoginStatus.textContent =
          "❌ Password కనీసం 6 అక్షరాలు ఉండాలి.";

        return;

      }


      if (
        password !==
        confirmPassword
      ) {

        customerLoginStatus.textContent =
          "❌ రెండు Passwordలు ఒకేలా లేవు.";

        return;

      }


      /* =========================
         PHONE CHECK
      ========================= */

      if (!monthlyCustomerPhone) {

        customerLoginStatus.textContent =
          "❌ Customer phone number కనిపించలేదు.";

        return;

      }


      try {

        customerLoginStatus.textContent =
          "⏳ Customer Account తయారవుతోంది...";


        /* =========================
           INTERNAL EMAIL
        ========================= */

        const customerEmail =
          monthlyCustomerPhone +
          "@pallituri-bojanam.com";


        /* =========================
           CREATE ACCOUNT
        ========================= */

        await createUserWithEmailAndPassword(
          auth,
          customerEmail,
          password
        );


        /* =========================
           SUCCESS
        ========================= */

        customerLoginStatus.textContent =
          "✅ మీ Customer Account విజయవంతంగా సిద్ధమైంది.";


        /* =========================
           HIDE PASSWORD
        ========================= */

        if (customerPasswordStep) {

          customerPasswordStep.style.display =
            "none";

        }

      } catch (error) {

        console.error(
          "CUSTOMER ACCOUNT ERROR:",
          error
        );


        /* =========================
           EXISTING ACCOUNT
        ========================= */

        if (
          error.code ===
          "auth/email-already-in-use"
        ) {

          customerLoginStatus.textContent =
            "ℹ️ ఈ మొబైల్ నంబర్‌తో Customer Account ఇప్పటికే ఉంది.";

          return;

        }


        /* =========================
           WEAK PASSWORD
        ========================= */

        if (
          error.code ===
          "auth/weak-password"
        ) {

          customerLoginStatus.textContent =
            "❌ Password బలంగా ఉండాలి.";

          return;

        }


        /* =========================
           OTHER ERROR
        ========================= */

        customerLoginStatus.textContent =
          "❌ Account create కాలేదు: " +
          (
            error.code ||
            error.message
          );

      }

    }
  );

}


/* =========================
   MONTHLY PLAN NEXT STEP
========================= */

if (monthlyPlanBtn) {

  monthlyPlanBtn.addEventListener(
    "click",
    () => {

      const name =
        monthlyName
          ?.value
          .trim() || "";


      const phone =
        monthlyPhone
          ?.value
          .trim() || "";


      const address =
        monthlyAddress
          ?.value
          .trim() || "";


      const quantity =
        Number(
          monthlyQuantity
            ?.value || 0
        );


      const days =
        Number(
          planDays
            ?.value || 0
        );


      const price =
        Number(
          selectedPlanPriceValue
            ?.value || 0
        );


      const planType =
        selectedPlanType
          ?.value || "";


      /* =========================
         PLAN VALIDATION
      ========================= */

      if (
        !planType ||
        !price
      ) {

        monthlyPlanStatus.textContent =
          "❌ దయచేసి ముందుగా ₹49 లేదా ₹69 పథకాన్ని ఎంచుకోండి.";

        return;

      }


      /* =========================
         CUSTOMER VALIDATION
      ========================= */

      if (
        !name ||
        !phone ||
        !address ||
        quantity < 1 ||
        days < 1
      ) {

        monthlyPlanStatus.textContent =
          "❌ దయచేసి అన్ని వివరాలు నమోదు చేయండి.";

        return;

      }


      /* =========================
         PHONE VALIDATION
      ========================= */

      if (
        !/^[6-9]\d{9}$/.test(
          phone
        )
      ) {

        monthlyPlanStatus.textContent =
          "❌ దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ ఇవ్వండి.";

        return;

      }


      /* =========================
         DON'T SAVE DATABASE YET
      ========================= */

      monthlyCustomerPhone =
        phone;


      /* =========================
         SHOW PASSWORD PAGE
      ========================= */

      showMonthlyCustomerLogin();

    }
  );

}


/* =========================
   INITIAL MONTHLY TOTAL
========================= */

if (planTotal) {

  planTotal.textContent =
    "పథకాన్ని ఎంచుకోండి";

}


/* =========================
   START WEBSITE
========================= */

loadMenu();


console.log(
  "పల్లెటూరు భోజనం website started successfully."
);

/* =========================
   DAILY CURRY SELECTION
========================= */

const curryOptions =
  document.querySelectorAll(".curry-option");

const extraCurryOptions =
  document.querySelectorAll(".extra-curry-option");

const selectedCurryStatus =
  document.querySelector("#selectedCurryStatus");

const extraCurryTotal =
  document.querySelector("#extraCurryTotal");

const saveDailyCurryBtn =
  document.querySelector("#saveDailyCurryBtn");


let selectedDailyCurry = "";

let selectedExtraCurries = [];

let selectedExtraTotal = 0;


/* =========================
   INCLUDED CURRY
========================= */

curryOptions.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      selectedDailyCurry =
        button.dataset.curry || "";


      /* =========================
         ACTIVE BUTTON
      ========================= */

      curryOptions.forEach((item) => {

        item.classList.remove(
          "selected"
        );

      });


      button.classList.add(
        "selected"
      );


      /* =========================
         STATUS
      ========================= */

      if (selectedCurryStatus) {

        selectedCurryStatus.textContent =
          `🍛 ఈరోజు కూర: ${selectedDailyCurry}`;

      }

    }
  );

});


/* =========================
   EXTRA CURRY
========================= */

extraCurryOptions.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      const curry =
        button.dataset.curry || "";

      const price =
        Number(
          button.dataset.price || 0
        );


      const existingIndex =
        selectedExtraCurries.findIndex(
          (item) =>
            item.curry === curry
        );


      /* =========================
         REMOVE IF ALREADY SELECTED
      ========================= */

      if (existingIndex !== -1) {

        selectedExtraCurries.splice(
          existingIndex,
          1
        );

        selectedExtraTotal -= price;

        button.classList.remove(
          "selected"
        );

      }

      /* =========================
         ADD EXTRA CURRY
      ========================= */

      else {

        selectedExtraCurries.push({
          curry: curry,
          price: price
        });

        selectedExtraTotal += price;

        button.classList.add(
          "selected"
        );

      }


      /* =========================
         UPDATE TOTAL
      ========================= */

      if (extraCurryTotal) {

        extraCurryTotal.textContent =
          `Extra Curry: ₹${selectedExtraTotal}`;

      }

    }
  );

});


/* =========================
   SAVE DAILY CURRY
========================= */

if (saveDailyCurryBtn) {

  saveDailyCurryBtn.addEventListener(
    "click",
    async () => {

      /* =========================
         CHECK CUSTOMER
      ========================= */

      if (!monthlyCustomerPhone) {

        if (selectedCurryStatus) {

          selectedCurryStatus.textContent =
            "❌ ముందుగా Customer Account పూర్తి చేయండి.";

        }

        return;

      }


      /* =========================
         CHECK CURRY
      ========================= */

      if (!selectedDailyCurry) {

        if (selectedCurryStatus) {

          selectedCurryStatus.textContent =
            "❌ ముందుగా ఈరోజు కూరను ఎంచుకోండి.";

        }

        return;

      }


      try {

        saveDailyCurryBtn.disabled =
          true;


        saveDailyCurryBtn.textContent =
          "⏳ సేవ్ అవుతోంది...";


        /* =========================
           SAVE TO FIRESTORE
        ========================= */

        await addDoc(
          collection(
            db,
            "dailyCurrySelections"
          ),
          {

            phone:
              monthlyCustomerPhone,

            curry:
              selectedDailyCurry,

            extraCurries:
              selectedExtraCurries,

            extraCurryTotal:
              selectedExtraTotal,

            createdAt:
              new Date().toISOString(),

            status:
              "selected"

          }
        );


        /* =========================
           SUCCESS
        ========================= */

        if (selectedCurryStatus) {

          selectedCurryStatus.textContent =
            `✅ ఈరోజు ${selectedDailyCurry} సేవ్ అయింది.`;

        }


        saveDailyCurryBtn.textContent =
          "✅ ఈరోజు కూర సేవ్ అయింది";


      } catch (error) {

        console.error(
          "DAILY CURRY ERROR:",
          error
        );


        if (selectedCurryStatus) {

          selectedCurryStatus.textContent =
            "❌ కూర సేవ్ కాలేదు: " +
            (
              error.code ||
              error.message
            );

        }


        saveDailyCurryBtn.disabled =
          false;

        saveDailyCurryBtn.textContent =
          "✅ ఈరోజు కూరను సేవ్ చేయండి";

      }

    }
  );

}
 /* =========================
   BACK TO CUSTOMER DETAILS
========================= */

if (backToMonthlyDetailsBtn) {

  backToMonthlyDetailsBtn.addEventListener(
    "click",
    () => {

      if (monthlyCustomerLogin) {

        monthlyCustomerLogin.style.display =
          "none";

      }


      if (monthlyPlanForm) {

        monthlyPlanForm.style.display =
          "block";

      }


      if (selectedPlanDetails) {

        selectedPlanDetails.style.display =
          "block";

      }


      if (customerPassword) {

        customerPassword.value = "";

      }


      if (customerPasswordConfirm) {

        customerPasswordConfirm.value = "";

      }


      if (customerLoginStatus) {

        customerLoginStatus.textContent =
          "";

      }


      if (monthlyPlanForm) {

        monthlyPlanForm.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

      }

    }
  );

}
/* =========================
   CUSTOMER LOGOUT
========================= */

if (customerLogoutBtn) {

  customerLogoutBtn.addEventListener(
    "click",
    async () => {

      try {

        await signOut(auth);


        /* =========================
           HIDE CURRY
        ========================= */

        if (monthlyCustomerCurry) {

          monthlyCustomerCurry.style.display =
            "none";

        }


        /* =========================
           SHOW LOGIN SECTION
        ========================= */

        if (customerLoginSection) {

          customerLoginSection.style.display =
            "block";

        }


        /* =========================
           RESET LOGIN TITLE
        ========================= */

        if (customerLoginTitle) {

          customerLoginTitle.textContent =
            "🔐 కస్టమర్ లాగిన్";

        }


        /* =========================
           SHOW LOGIN FIELDS
        ========================= */

        if (loginPhone) {

          loginPhone.style.display =
            "block";

          loginPhone.value = "";

        }


        if (loginPassword) {

          loginPassword.style.display =
            "block";

          loginPassword.value = "";

        }


        /* =========================
           SHOW LOGIN BUTTON
        ========================= */
       if (customerLoginSubmitBtn) {

       customerLoginSubmitBtn.textContent =
            "🚪 కస్టమర్ లాగ్ అవుట్";

        customerLoginSubmitBtn.style.display =
      "block";

      }

        /* =========================
           HIDE LOGOUT BUTTON
        ========================= */

        if (customerLogoutBtn) {

          customerLogoutBtn.style.display =
            "none";

        }


        /* =========================
           SHOW LOGIN MESSAGE
        ========================= */

        if (customerLoginMessage) {

          customerLoginMessage.textContent =
            "🚪 మీరు Logout అయ్యారు.";

        }


        /* =========================
           SCROLL TO LOGIN
        ========================= */

        if (customerLoginSection) {

          customerLoginSection.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });

        }

      } catch (error) {

        console.error(
          "CUSTOMER LOGOUT ERROR:",
          error
        );

      }

    }
  );

}
