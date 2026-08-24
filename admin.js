/* =========================
   LOAD DAILY ORDERS
========================= */

async function loadOrders() {

  const el =
    document.querySelector("#orders");

  try {

    const snap =
      await getDocs(
        query(
          collection(db, "orders"),
          orderBy(
            "createdAt",
            "desc"
          )
        )
      );

    if (snap.empty) {

      el.innerHTML =
        "రోజువారీ ఆర్డర్లు ఇంకా లేవు.";

      return;
    }


    el.innerHTML =
      snap.docs
        .map((orderDoc) => {

          const order =
            orderDoc.data();

          const dateTime =
            formatDateTime(
              order.createdAt
            );

          return `
            <div class="order">

              <b>
                ${order.name || "పేరు లేదు"}
              </b>

              · ${order.phone || ""}

              <br>

              భోజనాలు:
              <strong>
                ${order.quantity || 0}
              </strong>

              <br>

              చిరునామా:
              ${order.address || "Address లేదు"}

              <br>

              <small>
                📅 ${dateTime.date}
                &nbsp;&nbsp;
                ⏰ ${dateTime.time}
              </small>

            </div>
          `;

        })
        .join("");

  } catch (error) {

    console.error(
      "Daily orders load error:",
      error
    );

    el.innerHTML =
      "రోజువారీ Orders load కాలేదు.";
  }
}


/* =========================
   LOAD MONTHLY PLAN ORDERS
========================= */

async function loadMonthlyOrders() {

  const el =
    document.querySelector("#monthlyOrders");

  try {

    const snap =
      await getDocs(
        query(
          collection(db, "monthlyOrders"),
          orderBy(
            "createdAt",
            "desc"
          )
        )
      );

    if (snap.empty) {

      el.innerHTML =
        "నెలవారీ పథకం ఆర్డర్లు ఇంకా లేవు.";

      return;
    }


    el.innerHTML =
      snap.docs
        .map((orderDoc) => {

          const order =
            orderDoc.data();

          const dateTime =
            formatDateTime(
              order.createdAt
            );

          return `
            <div class="order">

              <b>
                ${order.name || "పేరు లేదు"}
              </b>

              · ${order.phone || ""}

              <br>

              భోజనాలు:
              <strong>
                ${order.quantity || 1}
              </strong>

              <br>

              పథకం:
              <strong>
                ${order.planType || "Veg"}
              </strong>

              <br>

              రోజులు:
              <strong>
                ${order.planDays || 0}
              </strong>

              <br>

              చిరునామా:
              ${order.address || "Address లేదు"}

              <br>

              <small>
                📅 ${dateTime.date}
                &nbsp;&nbsp;
                ⏰ ${dateTime.time}
              </small>

            </div>
          `;

        })
        .join("");

  } catch (error) {

    console.error(
      "Monthly orders load error:",
      error
    );

    el.innerHTML =
      "నెలవారీ Orders load కాలేదు.";
  }
}


/* =========================
   DATE + TIME
========================= */

function formatDateTime(value) {

  if (!value) {

    return {
      date: "-",
      time: "-"
    };

  }


  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return {
      date: "-",
      time: "-"
    };

  }


  return {

    date:
      date.toLocaleDateString(
        "en-IN"
      ),

    time:
      date.toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      )

  };

}
