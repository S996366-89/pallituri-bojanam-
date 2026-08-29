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
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updatePassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";


/* =========================
   FIREBASE
========================= */

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

/* =========================
   MONTHLY CUSTOMER LOGIN
========================= */

const monthlyCustomerLogin =
  document.querySelector("#monthlyCustomerLogin");

const customerLoginPhone =
  document.querySelector("#customerLoginPhone");

const customerOtp =
  document.querySelector("#customerOtp");

const sendOtpBtn =
  document.querySelector("#sendOtpBtn");

const verifyOtpBtn =
  document.querySelector("#verifyOtpBtn");

const customerOtpStep =
  document.querySelector("#customerOtpStep");

const customerLoginStatus =
  document.querySelector("#customerLoginStatus");


let confirmationResult = null;


/* =========================
   SHOW LOGIN
========================= */

function showMonthlyCustomerLogin() {

  if (!monthlyCustomerLogin) return;

  monthlyCustomerLogin.style.display =
    "block";

  monthlyCustomerLogin.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


/* =========================
   SEND OTP
========================= */

if (sendOtpBtn) {

  sendOtpBtn.addEventListener(
    "click",
    async () => {

      const phone =
        customerLoginPhone.value.trim();

      if (!/^[6-9]\d{9}$/.test(phone)) {

        customerLoginStatus.textContent =
          "దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ ఇవ్వండి.";

        return;

      }

      try {

        if (!window.recaptchaVerifier) {

          window.recaptchaVerifier =
            new RecaptchaVerifier(
              auth,
              "recaptcha-container",
              {
                size: "normal"
              }
            );

        }

        confirmationResult =
          await signInWithPhoneNumber(
            auth,
            "+91" + phone,
            window.recaptchaVerifier
          );

        customerOtpStep.style.display =
          "block";

        customerLoginStatus.textContent =
          "✅ OTP మీ మొబైల్‌కు పంపబడింది.";

      } catch (error) {

        console.error(
          "OTP ERROR:",
          error
        );

        customerLoginStatus.textContent =
          "❌ OTP పంపలేకపోయాము: " +
          (error.code || error.message);

      }

    }
  );

}


/* =========================
   VERIFY OTP
========================= */

if (verifyOtpBtn) {

  verifyOtpBtn.addEventListener(
    "click",
    async () => {

      const otp =
        customerOtp.value.trim();

      if (!otp) {

        customerLoginStatus.textContent =
          "దయచేసి OTP నమోదు చేయండి.";

        return;

      }

      try {

        await confirmationResult.confirm(
          otp
        );

        customerLoginStatus.textContent =
          "✅ మొబైల్ నంబర్ విజయవంతంగా verify అయింది.";

      } catch (error) {

        console.error(
          "OTP VERIFY ERROR:",
          error
        );

        customerLoginStatus.textContent =
          "❌ OTP సరైనది కాదు.";

      }

    }
  );

}

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
   MONTHLY LUNCH PLANS
========================= */

/* =========================
   PLAN ELEMENTS
========================= */

const plan49Card =
  document.querySelector("#plan49Card");

const plan69Card =
  document.querySelector("#plan69Card");

const select49Btn =
  document.querySelector("#select49Btn");

const select69Btn =
  document.querySelector("#select69Btn");

const selectedPlanDetails =
  document.querySelector("#selectedPlanDetails");

const selectedPlanTitle =
  document.querySelector("#selectedPlanTitle");

const selectedPlanPrice =
  document.querySelector("#selectedPlanPrice");

const plan49Details =
  document.querySelector("#plan49Details");

const plan69Details =
  document.querySelector("#plan69Details");

const monthlyPlanForm =
  document.querySelector("#monthlyPlanForm");

const selectedPlanType =
  document.querySelector("#selectedPlanType");

const selectedPlanPriceValue =
  document.querySelector("#selectedPlanPriceValue");

const planDays =
  document.querySelector("#planDays");

const planTotal =
  document.querySelector("#planTotal");

const monthlyPlanBtn =
  document.querySelector("#monthlyPlanBtn");

const monthlyPlanStatus =
  document.querySelector("#monthlyPlanStatus");

const monthlyName =
  document.querySelector("#monthlyName");

const monthlyPhone =
  document.querySelector("#monthlyPhone");

const monthlyAddress =
  document.querySelector("#monthlyAddress");

const monthlyQuantity =
  document.querySelector("#monthlyQuantity");


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
    Number(planDays?.value || 0);

  const price =
    Number(selectedPlanPriceValue?.value || 0);

  const quantity =
    Number(monthlyQuantity?.value || 1);


  /* =========================
     NO PLAN SELECTED
  ========================= */

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
      `₹${total.toLocaleString("en-IN")}`;

  }

}


/* =========================
   SELECT PLAN
========================= */

function selectMonthlyPlan(planPrice) {

  const price =
    Number(planPrice);


  /* =========================
     SET SELECTED PLAN
  ========================= */

  selectedPlanType.value =
    `₹${price}`;

  selectedPlanPriceValue.value =
    price;


  /* =========================
     RESET CARD ACTIVE STATE
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
     SHOW PLAN DETAILS
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
     ₹49 PLAN
  ========================= */

  if (price === PLAN_49_PRICE) {

    selectedPlanTitle.textContent =
      "₹49 పథకం";

    selectedPlanPrice.textContent =
      "₹49 / రోజు";

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
     ₹69 PLAN
  ========================= */

  if (price === PLAN_69_PRICE) {

    selectedPlanTitle.textContent =
      "₹69 పథకం";

    selectedPlanPrice.textContent =
      "₹69 / రోజు";

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
     UPDATE TOTAL
  ========================= */

  updatePlanTotal();


  /* =========================
     CLOSE PLAN DROPDOWN
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
     SCROLL TO DETAILS
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
        Number(
          monthlyQuantity.value
        );

      const days =
        Number(
          planDays.value
        );

      const price =
        Number(
          selectedPlanPriceValue.value
        );

      const planType =
        selectedPlanType.value;

      const total =
        days *
        price *
        quantity;


      /* =========================
         VALIDATION
      ========================= */

      if (!planType || !price) {

        monthlyPlanStatus.textContent =
          "దయచేసి ముందుగా ₹49 లేదా ₹69 పథకాన్ని ఎంచుకోండి.";

        return;

      }


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

            planType: planType,

            planDays: days,

            pricePerDay: price,

            totalAmount: total,

            status: "new",

            createdAt:
              new Date().toISOString()

          }
        );


        monthlyPlanStatus.textContent =
          "✅ నెలవారీ పథకం విజయవంతంగా నమోదు అయింది. ధన్యవాదాలు!";


        /* =========================
           CLEAR MONTHLY FIELDS
        ========================= */

        monthlyName.value = "";

        monthlyPhone.value = "";

        monthlyAddress.value = "";

        monthlyQuantity.value = 1;

        planDays.value = 26;


        /* =========================
           RESET PLAN
        ========================= */

        selectedPlanType.value = "";

        selectedPlanPriceValue.value = "";

        selectedPlanDetails.style.display =
          "none";

        monthlyPlanForm.style.display =
          "none";


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


/* =========================
   INITIAL MONTHLY TOTAL
========================= */

if (planTotal) {

  planTotal.textContent =
    "పథకాన్ని ఎంచుకోండి";

}
