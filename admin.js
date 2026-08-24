/* =========================
   LOAD ALL ORDERS
========================= */

async function loadOrders() {

  await loadMonthlyOrders();

  await loadDailyOrders();

}

/* =========================
   MONTHLY PLAN ORDERS
========================= */

async function loadMonthlyOrders() {
  const el =
    document.querySelector("#monthlyOrders");

  if (!el) return;

  try {

    const snap =
      await getDocs(
        query(
          collection(db, "monthlyOrders"),
          orderBy("createdAt", "desc")
        )
      );

    if (snap.empty) {

      el.innerHTML =
        `<p class="muted">నెలవారీ పథకం ఆర్డర్లు ఇంకా లేవు.</p>`;

      return;
    }

    el.innerHTML =
      snap.docs.map((orderDoc) => {

        const order = orderDoc.data();

        return `
          <div class="order">

            <b>${order.name || "పేరు లేదు"}</b>

            · ${order.phone || ""}

            <br>

            భోజనాలు:
            ${order.quantity || 0}

            <br>

            ${order.address || "Address లేదు"}

            <br>

            పథకం:
            ${order.planDays || 0} రోజులు

            · మొత్తం:
            ₹${order.totalAmount || 0}

          </div>
        `;

      }).join("");

  } catch (error) {

    console.error(
      "Monthly orders error:",
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
    document.querySelector("#orders");

  if (!el) return;

  try {

    const snap =
      await getDocs(
        query(
          collection(db, "orders"),
          orderBy("createdAt", "desc")
        )
      );

    if (snap.empty) {

      el.innerHTML =
        `<p class="muted">రోజువారీ ఆర్డర్లు ఇంకా లేవు.</p>`;

      return;
    }

    el.innerHTML =
      snap.docs.map((orderDoc) => {

        const order =
          orderDoc.data();

        const dateTime =
          order.createdAt
            ? new Date(order.createdAt)
            : null;

        const date =
          dateTime
            ? dateTime.toLocaleDateString("en-IN")
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
          <div class="order">

            <b>${order.name || "పేరు లేదు"}</b>

            · ${order.phone || ""}

            <br>

            📅 ${date}

            · ⏰ ${time}

            <br>

            భోజనాలు:
            ${order.quantity || 0}

            <br>

            📍 ${order.address || "Address లేదు"}

          </div>
        `;

      }).join("");

  } catch (error) {

    console.error(
      "Daily orders error:",
      error
    );

    el.innerHTML =
      "రోజువారీ ఆర్డర్లు load కాలేదు.";

  }

}
