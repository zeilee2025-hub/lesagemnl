// ==========================
//  MANUAL PAYMENT CLIPBOARD
// ==========================
export function initManualPaymentClipboard() {

  const copyButtons =
    document.querySelectorAll(
      ".payment-method__copy-btn"
    );


  // ==========================
  //  PAYMENT METHOD COPY
  // ==========================
  copyButtons.forEach((button) => {

    button.addEventListener("click", async () => {

      const text =
        button.getAttribute("data-copy");

      if (!text) return;

      try {

        if (navigator.clipboard) {

          await navigator.clipboard.writeText(text);

        }

        const originalText =
          button.textContent;

        button.textContent = "Copied";

        button.classList.add("copied");

        setTimeout(() => {

          button.textContent =
            originalText;

          button.classList.remove("copied");

        }, 1200);

      } catch (error) {

        console.error(
          "Clipboard copy failed:",
          error
        );

      }

    });

  });


  // ==========================
  //  ORDER ID COPY
  // ==========================
  const orderCopyBtn =
    document.getElementById(
      "copy-order-btn"
    );

  const orderIdEl =
    document.getElementById(
      "order-id"
    );


  if (orderCopyBtn && orderIdEl) {

    orderCopyBtn.addEventListener(
      "click",
      async () => {

        const text =
          orderIdEl.textContent?.trim();

        if (!text) return;

        try {

          if (navigator.clipboard) {

            await navigator.clipboard.writeText(
              text
            );

          }

          const originalText =
            orderCopyBtn.textContent;

          orderCopyBtn.textContent =
            "Copied";

          orderCopyBtn.classList.add(
            "copied"
          );

          setTimeout(() => {

            orderCopyBtn.textContent =
              originalText;

            orderCopyBtn.classList.remove(
              "copied"
            );

          }, 1200);

        } catch (error) {

          console.error(
            "Order ID copy failed:",
            error
          );

        }

      }
    );

  }

}