console.log("FOOTER MODAL LOADED");

// ==========================
// ELEMENTS
// ==========================

const footerModal =
  document.getElementById("footer-modal");

const footerModalContent =
  document.getElementById(
    "footer-modal-content"
  );

const footerModalClose =
  document.getElementById(
    "footer-modal-close"
  );


// ==========================
// CONTENT
// ==========================

const modalContent = {

  privacy: `
  <h2>Privacy Policy</h2>

  <p>
    Lé Sage MNL values your privacy and is
    committed to protecting your personal
    information in accordance with applicable
    laws and regulations.
  </p>

  <h3>Information We Collect</h3>

  <p><strong>Personal Information</strong></p>

  <p>
    We may collect:
  </p>

  <ul>
    <li>Full name</li>
    <li>Email address</li>
    <li>Mobile number</li>
    <li>Shipping and billing address</li>
  </ul>

  <p><strong>Payment Information</strong></p>

  <p>
    Payments are processed through third-party
    payment providers such as:
  </p>

  <ul>
    <li>BPI</li>
    <li>QRPH</li>
    <li>GCash</li>
    <li>Maya</li>
    <li>
      Other available payment methods
      displayed during checkout
    </li>
  </ul>

  <p>
    We do not store complete banking or
    payment credentials on our systems.
  </p>

  <p><strong>Device & Usage Information</strong></p>

  <p>
    We may automatically collect:
  </p>

  <ul>
    <li>IP address</li>
    <li>Browser type</li>
    <li>Device information</li>
    <li>Cookies and site activity</li>
  </ul>

  <p>
    This information helps improve website
    performance, security, and user experience.
  </p>

  <h3>How We Use Your Information</h3>

  <p><strong>Order Fulfillment</strong></p>

  <p>
    To verify payments, process orders,
    and coordinate deliveries through
    logistics providers such as J&T Express,
    LBC, or other courier partners.
  </p>

  <p><strong>Customer Communication</strong></p>

  <p>
    To send:
  </p>

  <ul>
    <li>Order confirmations</li>
    <li>Shipping updates</li>
    <li>Customer support responses</li>
    <li>
      Promotional announcements and
      product releases (only when opted in)
    </li>
  </ul>

  <p><strong>Security & Fraud Prevention</strong></p>

  <p>
    To monitor suspicious activities and
    prevent unauthorized, fraudulent,
    or abusive transactions.
  </p>

  <h3>Third-Party Sharing</h3>

  <p>
    We do not sell or rent your personal
    information.
  </p>

  <p>
    However, limited information may be shared
    with trusted third parties strictly when
    necessary, including:
  </p>

  <ul>
    <li>Courier and logistics providers</li>
    <li>Payment processors</li>
    <li>
      Marketing and analytics platforms
      such as Meta or Google
    </li>
  </ul>

  <h3>Data Protection</h3>

  <p>
    Reasonable administrative and technical
    safeguards are implemented to help protect
    your information against unauthorized
    access, misuse, or disclosure.
  </p>

  <h3>Your Rights</h3>

  <p>
    Under the Philippine Data Privacy Act,
    you may request to:
  </p>

  <ul>
    <li>Access your personal information</li>
    <li>Correct inaccurate data</li>
    <li>Request deletion of eligible records</li>
    <li>
      Withdraw consent for marketing
      communications
    </li>
  </ul>

  <p>
    Requests may be submitted through
    our official contact channels.
  </p>

  <h3>Policy Updates</h3>

  <p>
    Lé Sage MNL reserves the right to update
    this Privacy Policy at any time.
    Continued use of the website constitutes
    acceptance of any revisions.
  </p>
`,

  terms: `
  <h2>Terms & Conditions</h2>

  <p>
    By accessing, browsing, or placing an
    order through Lé Sage MNL, you agree
    to comply with the following terms
    and conditions.
  </p>

  <h3>Use of Website</h3>

  <p>
    You agree to use this website only for
    lawful purposes. Any fraudulent activity,
    abuse, unauthorized access attempts,
    or disruption of the platform may result
    in denied access, cancelled orders,
    or legal action when necessary.
  </p>

  <h3>Orders & Payments</h3>

  <p>
    Orders are only confirmed once payment
    has been successfully verified.
  </p>

  <p>
    Unpaid orders will automatically expire
    and may be cancelled without prior notice.
  </p>

  <h3>Manual Payment Verification</h3>

  <p>
    Lé Sage MNL currently operates with
    manual payment verification. Customers
    may be required to submit valid proof
    of payment.
  </p>

  <p>
    Submitting edited, duplicate, false,
    or unrelated payment proofs may result in:
  </p>

  <ul>
    <li>Order cancellation</li>
    <li>Account restriction</li>
    <li>
      Permanent refusal of future
      transactions
    </li>
  </ul>

  <h3>Accepted Payment Methods</h3>

  <p>
    Available payment options may include:
  </p>

  <ul>
    <li>BPI</li>
    <li>QRPH</li>
    <li>GCash</li>
    <li>Maya</li>
    <li>
      Other supported payment channels
      displayed during checkout
    </li>
  </ul>

  <p>
    Payment availability may change
    without prior notice.
  </p>

  <h3>Order Processing & Shipping</h3>

  <p>
    Orders are processed after successful
    payment verification.
  </p>

  <p>
    Processing and delivery times may vary
    depending on:
  </p>

  <ul>
    <li>Order volume</li>
    <li>Courier operations</li>
    <li>Holidays and weekends</li>
    <li>Verification timing</li>
    <li>
      External delays beyond our control
    </li>
  </ul>

  <h3>Product Availability</h3>

  <p>
    All products are subject to availability.
  </p>

  <p>
    Lé Sage MNL reserves the right to:
  </p>

  <ul>
    <li>Limit purchase quantities</li>
    <li>Refuse service</li>
    <li>Cancel orders</li>
    <li>
      Discontinue products without
      prior notice
    </li>
  </ul>

  <h3>Customer Responsibility</h3>

  <p>
    Customers are responsible for providing
    complete and accurate:
  </p>

  <ul>
    <li>Shipping details</li>
    <li>Contact information</li>
    <li>Payment details</li>
  </ul>

  <p>
    Lé Sage MNL is not liable for failed
    deliveries, delays, or losses caused
    by incorrect customer-provided
    information.
  </p>

  <h3>Pricing & Product Changes</h3>

  <p>
    Prices, product descriptions,
    sizing details, and availability
    may change at any time without
    prior notice.
  </p>

  <h3>Limitation of Liability</h3>

  <p>
    All products and services are provided
    on an “as available” and “as is” basis.
  </p>

  <p>
    Lé Sage MNL shall not be held liable
    for indirect, incidental, consequential,
    or special damages arising from the use
    of the website, products, or services.
  </p>

  <h3>Policy Revisions</h3>

  <p>
    We reserve the right to update or
    modify these Terms & Conditions at any
    time. Continued use of the website
    constitutes acceptance of any updated
    terms.
  </p>
`,

  returns: `
  <h2>Returns, Exchanges & Refund Policy</h2>

  <p>
    At Lé Sage MNL, all items are carefully
    inspected and packed before shipment
    to ensure quality and accuracy.
  </p>

  <h3>Returns & Exchanges</h3>

  <p>
    Returns, exchanges, and refunds are
    generally not available once an order
    has been confirmed and paid.
  </p>

  <p>
    However, certain requests may be reviewed
    and considered for approval depending on
    the situation. Approval is strictly at
    the discretion of Lé Sage MNL.
  </p>

  <h3>Eligible Concerns</h3>

  <p>
    Requests may only be considered for
    situations involving:
  </p>

  <ul>
    <li>Incorrect item received</li>
    <li>
      Clearly defective or damaged item
    </li>
    <li>Missing item from the order</li>
  </ul>

  <p>
    All concerns must be reported within
    48 hours of receiving the package.
  </p>

  <h3>Requirements for Review</h3>

  <p>
    To request a review, customers must provide:
  </p>

  <ul>
    <li>Order number</li>
    <li>Complete unboxing video</li>
    <li>
      Clear photos showing the issue
    </li>
    <li>Proof of purchase/payment</li>
  </ul>

  <p>
    Failure to provide sufficient evidence
    may result in automatic denial of
    the request.
  </p>

  <h3>Non-Eligible Cases</h3>

  <p>
    Requests involving the following are
    typically not approved:
  </p>

  <ul>
    <li>Wrong size selection</li>
    <li>Change of mind</li>
    <li>
      Minor color variations caused by
      screen/display settings
    </li>
    <li>
      Issues caused after usage,
      washing, or mishandling
    </li>
    <li>Incomplete unboxing evidence</li>
  </ul>

  <h3>Order Responsibility</h3>

  <p>
    Customers are responsible for reviewing
    all order details before completing
    payment, including:
  </p>

  <ul>
    <li>Product selection</li>
    <li>Size chosen</li>
    <li>Shipping information</li>
    <li>Contact details</li>
  </ul>

  <p>
    Once payment is verified, orders
    immediately enter processing and
    may no longer be modified or cancelled.
  </p>

  <h3>Final Decision</h3>

  <p>
    All reviewed cases are subject to
    evaluation by Lé Sage MNL.
    Submission of a request does not
    guarantee approval for return,
    exchange, refund, or replacement.
  </p>

  <p>
    By completing your purchase,
    you acknowledge and agree
    to this policy.
  </p>
`,

  contact: `
  <div class="footer-contact">

    <p class="footer-contact__eyebrow">
      SUPPORT
    </p>

    <h2 class="footer-contact__title">
      Contact Us
    </h2>

    <p class="footer-contact__intro">
      For inquiries, orders, collaborations,
      support, or payment concerns,
      feel free to reach out through any
      of the channels below.
    </p>

    <div class="footer-contact__section">

      <p class="footer-contact__label">
        Instagram
      </p>

      <a
        class="footer-contact__link"
        href="https://www.instagram.com/_lesage.mnl/"
        target="_blank"
        rel="noopener noreferrer"
      >
        @_lesage.mnl
      </a>

    </div>

    <div class="footer-contact__section">

      <p class="footer-contact__label">
        Facebook
      </p>

      <a
        class="footer-contact__link"
        href="https://www.facebook.com/lesage.mnl"
        target="_blank"
        rel="noopener noreferrer"
      >
        Lé Sage MNL
      </a>

    </div>

    <div class="footer-contact__section">

      <p class="footer-contact__label">
        Email
      </p>

      <p class="footer-contact__value">
        lesage2k24@gmail.com
      </p>

    </div>

    <div class="footer-contact__section">

      <p class="footer-contact__label">
        Contact Number
      </p>

      <p class="footer-contact__value">
        +63 991 932 0296
      </p>

    </div>

    <div class="footer-contact__section">

      <p class="footer-contact__label">
        Customer Support Hours
      </p>

      <p class="footer-contact__value">
        Monday — Saturday
        <br>
        9:00 AM — 9:00 PM (PHT)
      </p>

    </div>

  </div>
`,
};


// ==========================
// OPEN
// ==========================

function openFooterModal(type) {

  const content = modalContent[type];

  if (!content) return;

  footerModalContent.innerHTML = content;

  footerModal.classList.remove("hidden");

}


// ==========================
// CLOSE
// ==========================

function closeFooterModal() {

  footerModal.classList.add("hidden");

}


// ==========================
// INIT
// ==========================

function initFooterModal() {

  console.log("INIT MODAL");

  const buttons =
    document.querySelectorAll(
      "[data-footer-modal]"
    );

  console.log(buttons);

  buttons.forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        console.log("CLICKED");

        const modalType =
          button.dataset.footerModal;

        openFooterModal(modalType);

      }
    );

  });

}


// ==========================
// CLOSE EVENTS
// ==========================

footerModalClose?.addEventListener(
  "click",
  closeFooterModal
);

document.addEventListener(
  "click",
  (e) => {

    if (
      e.target.classList.contains(
        "footer-modal__overlay"
      )
    ) {
      closeFooterModal();
    }

  }
);


// ==========================
// WAIT
// ==========================

window.addEventListener(
  "load",
  () => {

    setTimeout(() => {

      initFooterModal();

    }, 1000);

  }
);