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
  signInWithEmailAndPassword
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

const customerOtpStep =
  document.querySelector("#customerOtpStep");

const customerPasswordStep =
  document.querySelector("#customerPasswordStep");

const customerOtp =
  document.querySelector("#customerOtp");

const sendOtpBtn =
  document.querySelector("#sendOtpBtn");

const verifyOtpBtn =
  document.querySelector("#verifyOtpBtn");

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

let confirmationResult = null;

let monthlyCustomerPhone = "";

let monthlyCustomerOtpVerified = false;


/* =========================
   SHOW CUSTOMER LOGIN
========================= */

function showMonthlyCustomerLogin() {

  if (!monthlyCustomerLogin) return;

  monthlyCustomerLogin.style.display =
    "block";


  /* =========================
     RESET OTP STEP
  ========================= */

  if (customerOtpStep) {

    customerOtpStep.style.display =
      "block";

  }


  /* =========================
     HIDE PASSWORD STEP
  ========================= */

  if (customerPasswordStep) {

    customerPasswordStep.style.display =
      "none";

  }


  /* =========================
     HIDE DAILY CURRY
  ========================= */

  if (monthlyCustomerCurry) {

    monthlyCustomerCurry.style.display =
      "none";

  }


  /* =========================
     STATUS
  ========================= */

  if (customerLoginStatus) {

    customerLoginStatus.textContent =
      "📱 మీ మొబైల్ నంబర్‌ను ధృవీకరించండి.";

  }


  monthlyCustomerLogin.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


/* =========================
   SEND OTP
========================= */

async function sendMonthlyCustomerOtp() {

  const monthlyPhoneInput =
    document.querySelector("#monthlyPhone");


  if (!monthlyPhoneInput) {

    console.error(
      "#monthlyPhone element not found"
    );

    return;

  }


  const phone =
    monthlyPhoneInput.value.trim();


  /* =========================
     PHONE VALIDATION
  ========================= */

  if (!/^[6-9]\d{9}$/.test(phone)) {

    customerLoginStatus.textContent =
      "❌ దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ ఇవ్వండి.";

    return;

  }


  monthlyCustomerPhone =
    phone;

  monthlyCustomerOtpVerified =
    false;


  try {

    customerLoginStatus.textContent =
      "⏳ OTP పంపడానికి సిద్ధమవుతోంది...";


    /* =========================
       CLEAR OLD RECAPTCHA
    ========================= */

    if (window.recaptchaVerifier) {

      try {

        window.recaptchaVerifier.clear();

      } catch (error) {

        console.log(
          "Old reCAPTCHA clear skipped"
        );

      }

      window.recaptchaVerifier =
        null;

    }


    /* =========================
       CREATE RECAPTCHA
    ========================= */

    window.recaptchaVerifier =
      new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "normal"
        }
      );


    /* =========================
       SEND OTP
    ========================= */

    confirmationResult =
      await signInWithPhoneNumber(
        auth,
        "+91" + phone,
        window.recaptchaVerifier
      );


    /* =========================
       OTP SENT
    ========================= */

    if (customerOtpStep) {

      customerOtpStep.style.display =
        "block";

    }


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


/* =========================
   SEND OTP BUTTON
========================= */

if (sendOtpBtn) {

  sendOtpBtn.addEventListener(
    "click",
    sendMonthlyCustomerOtp
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


      /* =========================
         OTP VALIDATION
      ========================= */

      if (!otp) {

        customerLoginStatus.textContent =
          "❌ దయచేసి 6 అంకెల OTP నమోదు చేయండి.";

        return;

      }


      if (!confirmationResult) {

        customerLoginStatus.textContent =
          "❌ ముందుగా OTP పంపండి.";

        return;

      }


      try {

        customerLoginStatus.textContent =
          "⏳ OTP verify చేస్తోంది...";


        await confirmationResult.confirm(
          otp
        );


        /* =========================
           OTP VERIFIED
        ========================= */

        monthlyCustomerOtpVerified =
          true;


        customerLoginStatus.textContent =
          "✅ మొబైల్ నంబర్ విజయవంతంగా verify అయింది.";


        /* =========================
           HIDE OTP
        ========================= */

        if (customerOtpStep) {

          customerOtpStep.style.display =
            "none";

        }


        /* =========================
           SHOW PASSWORD
        ========================= */

        if (customerPasswordStep) {

          customerPasswordStep.style.display =
            "block";

          customerPasswordStep.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });

        }

      } catch (error) {

        console.error(
          "OTP VERIFY ERROR:",
          error
        );


        monthlyCustomerOtpVerified =
          false;


        customerLoginStatus.textContent =
          "❌ OTP సరైనది కాదు. మళ్లీ ప్రయత్నించండి.";

      }

    }
  );

}


/* =========================
   CREATE CUSTOMER ACCOUNT
========================= */

if (saveCustomerPasswordBtn) {

  saveCustomerPasswordBtn.addEventListener(
    "click",
    async () => {

      const password =
        customerPassword.value.trim();

      const confirmPassword =
        customerPasswordConfirm.value.trim();


      /* =========================
         PASSWORD VALIDATION
      ========================= */

      if (!password || !confirmPassword) {

        customerLoginStatus.textContent =
          "❌ దయచేసి Password రెండు సార్లు నమోదు చేయండి.";

        return;

      }


      if (password.length < 6) {

        customerLoginStatus.textContent =
          "❌ Password కనీసం 6 అక్షరాలు ఉండాలి.";

        return;

      }


      if (password !== confirmPassword) {

        customerLoginStatus.textContent =
          "❌ రెండు Passwordలు ఒకేలా లేవు.";

        return;

      }


      /* =========================
         OTP VERIFICATION CHECK
      ========================= */

      if (
        !monthlyCustomerPhone ||
        !monthlyCustomerOtpVerified
      ) {

        customerLoginStatus.textContent =
          "❌ ముందుగా మొబైల్ OTP verify చేయాలి.";

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
           CREATE EMAIL/PASSWORD ACCOUNT
        ========================= */

        await createUserWithEmailAndPassword(
          auth,
          customerEmail,
          password
        );


        /* =========================
           ACCOUNT SUCCESS
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
          (error.code || error.message);

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

const monthlyCustomerCurry =
  document.querySelector("#monthlyCustomerCurry");


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

let monthlyCustomerPhone = "";


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

monthlyCustomerPhone =
  phone;

showMonthlyCustomerLogin();

sendMonthlyCustomerOtp();


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
