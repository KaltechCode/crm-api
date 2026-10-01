const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Technical Support</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: "Segoe UI", Inter, Arial, sans-serif;
      background: #eef1f6;
      color: #1f2937;
    }
    .wrap {
      min-height: 100vh;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 48px 16px;
    }
    .card {
      width: 100%;
      max-width: 760px;
      background: #fff;
      border-radius: 6px;
      box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
    }
    .card-title {
      margin: 0;
      padding: 28px 24px 22px;
      text-align: center;
      font-size: 28px;
      font-weight: 650;
      letter-spacing: -0.02em;
      color: #243044;
      border-bottom: 1px solid #e6e8ee;
    }
    .card-body { padding: 28px 36px 36px; }
    .section-title {
      margin: 0 0 28px;
      padding-bottom: 12px;
      border-bottom: 1px solid #d9dde6;
      font-size: 16px;
      font-weight: 650;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 22px 28px;
    }
    .field { min-width: 0; }
    .span-2 { grid-column: 1 / -1; }
    label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 650;
    }
    .req { color: #e11d48; margin-left: 2px; }
    input, textarea {
      width: 100%;
      border: 1px solid #cfd5e1;
      border-radius: 4px;
      background: #fff;
      color: #111827;
      font: inherit;
      font-size: 14px;
      padding: 8px 10px;
    }
    input { height: 38px; }
    textarea { min-height: 118px; resize: vertical; }
    input:focus, textarea:focus {
      outline: 2px solid rgba(32, 178, 132, 0.25);
      border-color: #20b284;
    }
    .hint {
      display: block;
      margin-top: 6px;
      color: #6b7280;
      font-size: 12px;
    }
    .error {
      display: block;
      min-height: 16px;
      margin-top: 4px;
      color: #e11d48;
      font-size: 12px;
    }
    .actions { display: flex; justify-content: center; margin-top: 28px; }
    button {
      border: 0;
      border-radius: 999px;
      background: #20b284;
      color: #fff;
      font: inherit;
      font-size: 15px;
      font-weight: 650;
      padding: 10px 28px;
      cursor: pointer;
    }
    button:hover { background: #18986f; }
    button:disabled { opacity: 0.7; cursor: wait; }
    .banner {
      display: none;
      margin-bottom: 18px;
      padding: 12px 14px;
      border-radius: 6px;
      font-size: 14px;
    }
    .banner.show { display: block; }
    .banner.ok { background: #ecfdf5; color: #065f46; }
    .banner.bad { background: #fef2f2; color: #991b1b; }
    .hp {
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    }
    @media (max-width: 700px) {
      .card-body { padding: 24px 18px 28px; }
      .grid { grid-template-columns: 1fr; }
      .card-title { font-size: 24px; }
    }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="card">
      <h1 class="card-title">Technical Support</h1>
      <div class="card-body">
        <h2 class="section-title">Technical Support</h2>
        <div id="banner" class="banner" role="status"></div>
        <form id="support-form" novalidate>
          <div class="hp" aria-hidden="true">
            <label for="companyWebsite">Company website</label>
            <input id="companyWebsite" name="companyWebsite" tabindex="-1" autocomplete="off" />
          </div>
          <div class="grid">
            <div class="field">
              <label for="firstName">Name <span class="req">*</span></label>
              <input id="firstName" name="firstName" autocomplete="given-name" required />
              <span class="hint">First Name</span>
              <span class="error" data-error="firstName"></span>
            </div>
            <div class="field">
              <label for="lastName">&nbsp;</label>
              <input id="lastName" name="lastName" autocomplete="family-name" />
              <span class="hint">Last Name</span>
              <span class="error" data-error="lastName"></span>
            </div>
            <div class="field">
              <label for="email">Email <span class="req">*</span></label>
              <input id="email" name="email" type="email" autocomplete="email" required />
              <span class="error" data-error="email"></span>
            </div>
            <div class="field">
              <label for="phoneNumber">Phone Number <span class="req">*</span></label>
              <input id="phoneNumber" name="phoneNumber" type="tel" autocomplete="tel" required />
              <span class="error" data-error="phoneNumber"></span>
            </div>
            <div class="field">
              <label for="agentCode">Agent Code <span class="req">*</span></label>
              <input id="agentCode" name="agentCode" autocomplete="off" required />
              <span class="error" data-error="agentCode"></span>
            </div>
            <div class="field">
              <label for="subject">Subject <span class="req">*</span></label>
              <input id="subject" name="subject" required />
              <span class="error" data-error="subject"></span>
            </div>
            <div class="field span-2">
              <label for="description">Please describe the technical problem you are facing</label>
              <textarea id="description" name="description" required></textarea>
              <span class="error" data-error="description"></span>
            </div>
          </div>
          <div class="actions">
            <button id="submit-btn" type="submit">Submit</button>
          </div>
        </form>
      </div>
    </section>
  </main>
  <script>
    const form = document.getElementById("support-form");
    const banner = document.getElementById("banner");
    const button = document.getElementById("submit-btn");

    function showBanner(kind, message) {
      banner.className = "banner show " + kind;
      banner.textContent = message;
    }

    function clearErrors() {
      document.querySelectorAll("[data-error]").forEach((node) => {
        node.textContent = "";
      });
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearErrors();
      banner.className = "banner";
      button.disabled = true;
      button.textContent = "Submitting...";

      const payload = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        phoneNumber: form.phoneNumber.value,
        agentCode: form.agentCode.value,
        subject: form.subject.value,
        description: form.description.value,
        companyWebsite: form.companyWebsite.value,
      };

      try {
        const response = await fetch("/api/support", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          const errors = result.errors || {};
          Object.entries(errors).forEach(([field, message]) => {
            const node = document.querySelector('[data-error="' + field + '"]');
            if (node) node.textContent = message;
          });
          showBanner("bad", result.message || "Unable to submit your request.");
          return;
        }
        form.reset();
        showBanner("ok", result.message || "Your request was submitted.");
      } catch (error) {
        showBanner("bad", "Unable to reach the server. Please try again.");
      } finally {
        button.disabled = false;
        button.textContent = "Submit";
      }
    });
  </script>
</body>
</html>`;

module.exports = page;
