// ==========================
// 📄 MODAL COMPONENT
// ==========================

const policyContent = {

  refund: {
    title: "Refund Policy",
    body: `
      <p>All sales are final. We do not offer returns, exchanges, or refunds once payment has been confirmed.</p>

      <h4>Order Responsibility</h4>
      <p>Please review your order carefully before completing payment. This includes product selection, sizing, and shipping details. Once verified, orders are processed immediately and cannot be modified.</p>

      <h4>Quality Assurance</h4>
      <p>Each item is carefully inspected and packed before shipment to ensure it meets our standards. We take quality control seriously to maintain consistency across all orders.</p>

      <h4>Exceptions</h4>
      <p>In rare cases involving a clearly defective or incorrect item, you may contact us within 48 hours of receiving your order. Requests will be reviewed individually and approval is not guaranteed.</p>

      <h4>Final Agreement</h4>
      <p>By completing your purchase, you acknowledge and agree to these terms.</p>
    `
  },

  privacy: {
    title: "Privacy Policy",
    body: `
      <p>LÉ SAGE MNL collects personal data when you interact with our online store.</p>

      <h4>Information We Collect</h4>
      <ul>
        <li><strong>Personal Information:</strong> Name, email address, phone number, and shipping address.</li>
        <li><strong>Payment Data:</strong> Payments are processed through third-party providers (such as GCash, Maya, or other available options). We do not store full payment details.</li>
        <li><strong>Device Data:</strong> IP address, browser type, and cookies used to improve your browsing experience and remember preferences.</li>
      </ul>

      <h4>How Your Data Is Used</h4>
      <ul>
        <li><strong>Order Fulfillment:</strong> To process payments and deliver your order via couriers such as J&T or LBC.</li>
        <li><strong>Communication:</strong> To send order confirmations, updates, and (if you opt in) information about new drops and releases.</li>
        <li><strong>Security:</strong> To detect and prevent fraudulent or unauthorized transactions.</li>
      </ul>

      <h4>Third-Party Sharing</h4>
      <p>We do not sell your personal information. However, we may share necessary data with trusted service providers:</p>
      <ul>
        <li><strong>Logistics Partners:</strong> To deliver your order using your provided address and contact details.</li>
        <li><strong>Marketing Platforms:</strong> Such as Meta or Google, only when you interact with our ads or content.</li>
      </ul>

      <h4>Your Rights</h4>
      <p>Under the Data Privacy Act, you have the right to:</p>
      <ul>
        <li><strong>Access:</strong> Request a copy of the data we hold about you.</li>
        <li><strong>Correction:</strong> Update or correct your personal information.</li>
        <li><strong>Erasure:</strong> Request deletion of your data, subject to legal and operational requirements.</li>
      </ul>
    `
  },

  terms: {
    title: "Terms of Service",
    body: `
      <p>By accessing our store and placing an order, you agree to the following terms and conditions.</p>

      <h4>Use of Site</h4>
      <p>You agree to use this site only for lawful purposes. Any misuse, fraudulent activity, or attempt to disrupt the platform may result in denied access or order cancellation.</p>

      <h4>Orders & Payment</h4>
      <p>All orders must be paid within the given timeframe. Orders are only processed after successful payment verification. Unpaid orders will automatically expire and be cancelled.</p>

      <h4>Manual Payment System</h4>
      <p>We operate on a manual payment process. Customers are required to submit valid proof of payment. Submitting false, duplicate, or unrelated proof may result in cancellation and restriction from future purchases.</p>

      <h4>Order Processing</h4>
      <p>Once payment is verified, orders are prepared and shipped according to the selected delivery method. Processing times may vary depending on order volume and verification timing.</p>

      <h4>Product Availability</h4>
      <p>All items are subject to availability. We reserve the right to limit quantities, cancel orders, or refuse service at our discretion.</p>

      <h4>Customer Responsibility</h4>
      <p>You are responsible for providing accurate and complete shipping and contact details. We are not liable for delays, losses, or issues caused by incorrect information.</p>

      <h4>Pricing & Changes</h4>
      <p>Prices, product details, and availability may change without prior notice. We reserve the right to modify or discontinue products at any time.</p>

      <h4>Limitation of Liability</h4>
      <p>All products and services are provided “as is.” We are not liable for indirect, incidental, or consequential damages arising from the use of our service.</p>

      <h4>Updates to Terms</h4>
      <p>We reserve the right to update these terms at any time. Continued use of the site constitutes acceptance of any changes.</p>
    `
  },

  cancellations: {
    title: "Cancellations",
    body: `
      <p>This policy outlines how order cancellations are handled after checkout.</p>

      <h4>Unpaid Orders</h4>
      <p>All orders are reserved for a limited time. If payment is not completed within the given timeframe, the order will automatically expire and be cancelled.</p>

      <h4>Pending Payments</h4>
      <p>If you have submitted payment proof, your order cannot be cancelled while verification is in progress.</p>

      <h4>After Payment Confirmation</h4>
      <p>Once payment has been verified, cancellations are no longer allowed as order processing begins immediately.</p>

      <h4>Need Assistance</h4>
      <p>If you made a mistake or need urgent changes, contact us as soon as possible and we will do our best to assist before the order is finalized.</p>
    `
  }

};


// ==========================
// 🚀 INIT MODAL
// ==========================
export function initPolicyModal() {
  const modal = document.getElementById("policy-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");
  const modalClose = document.getElementById("modal-close");
  const modalOverlay = document.getElementById("modal-overlay");

  if (!modal || !modalTitle || !modalBody) {
    console.warn("Modal elements not found");
    return;
  }

  function open(policyKey) {
    const content = policyContent[policyKey];
    if (!content) {
      console.warn("Invalid policy key:", policyKey);
      return;
    }

    modalTitle.textContent = content.title;
    modalBody.innerHTML = content.body;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function close() {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest(".legal-link");
    if (!link) return;

    e.preventDefault();
    open(link.dataset.policy);
  });

  if (modalClose) modalClose.addEventListener("click", close);
  if (modalOverlay) modalOverlay.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}