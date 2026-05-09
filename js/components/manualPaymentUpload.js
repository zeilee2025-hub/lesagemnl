// ==========================
//  IMPORTS
// ==========================
import { uploadProof } from "../services/uploadService.js";
import { updateOrderProof } from "../services/orderService.js";


// ==========================
//  MANUAL PAYMENT UPLOAD
// ==========================
export function initManualPaymentUpload(orderId) {

  let selectedFile = null;

  const fileInput =
    document.getElementById("proof-input");

  const uploadBtn =
    document.getElementById("upload-btn");

  const fileName =
    document.getElementById("file-name");

  const submitBtn =
    document.getElementById("submit-proof");


  // ==========================
  //  INITIAL BUTTON STATE
  // ==========================
  if (submitBtn) {

    submitBtn.disabled = true;

    submitBtn.classList.add("is-disabled");

  }


  // ==========================
  //  OPEN FILE PICKER
  // ==========================
  if (uploadBtn && fileInput) {

    uploadBtn.addEventListener("click", () => {

      fileInput.click();

    });

  }


  // ==========================
  //  FILE SELECT
  // ==========================
  if (fileInput) {

    fileInput.addEventListener("change", (e) => {

      selectedFile = e.target.files[0];

      if (!selectedFile) return;

      fileName.textContent =
        selectedFile.name;

      if (submitBtn) {

        submitBtn.disabled = false;

        submitBtn.classList.remove("is-disabled");

      }

    });

  }


  // ==========================
  //  SUBMIT UPLOAD
  // ==========================
  if (submitBtn) {

    submitBtn.addEventListener("click", async () => {

      try {

        // ==========================
        //  VALIDATION
        // ==========================
        if (!selectedFile) {

          alert("Please select a payment screenshot.");

          return;
        }

        if (!orderId) {

          alert("Missing order ID.");

          return;
        }


        // ==========================
        //  LOADING STATE
        // ==========================
        submitBtn.textContent =
          "Uploading...";

        submitBtn.disabled = true;

        submitBtn.classList.add("is-disabled");


        // ==========================
        // UPLOAD TO CLOUDINARY
        // ==========================
        const url =
          await uploadProof(
            selectedFile,
            orderId
          );


        // ==========================
        //  SAVE TO FIRESTORE
        // ==========================
        await updateOrderProof(
          orderId,
          url
        );


        // ==========================
        //  SUCCESS UI
        // ==========================
        submitBtn.textContent =
          "Under review";

        fileName.textContent =
          "Payment proof uploaded";

        selectedFile = null;

        fileInput.value = "";

        submitBtn.disabled = true;

        submitBtn.classList.add("is-disabled");


      } catch (error) {

        // ==========================
        //  ERROR
        // ==========================
        console.error(
          "Upload failed:",
          error
        );

        submitBtn.textContent =
          "Confirm payment";

        submitBtn.disabled = false;

        submitBtn.classList.remove("is-disabled");

      }

    });

  }

}