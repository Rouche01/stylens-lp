// App download modal: QR code on desktop, store redirect on mobile
(function () {
  const APP_STORE_URL = "https://apps.apple.com/app/gostylens";
  const PLAY_STORE_URL =
    "https://play.google.com/store/apps/details?id=com.gostylens";

  // Inject modal HTML
  const modalHTML = `
    <div class="modal-overlay" id="appModal">
      <div class="modal">
        <button class="modal-close" aria-label="Close modal">&times;</button>
        <h3>Welcome to GoStylens</h3>
        <p>Scan the QR code with your phone to download GoStylens on the App Store or Google Play Store</p>
        <div class="modal-qr">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://gostylens.app"
            alt="QR code to download GoStylens"
            width="180"
            height="180"
          />
        </div>
        <div class="modal-stores">
          <a href="${APP_STORE_URL}" class="store-btn" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            <div class="store-label"><span>Download on the</span><strong>App Store</strong></div>
          </a>
          <a href="${PLAY_STORE_URL}" class="store-btn" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 010 1.732l-2.807 1.627L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
            <div class="store-label"><span>Get it on</span><strong>Google Play</strong></div>
          </a>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  const appModal = document.getElementById("appModal");

  function handleGetApp(e) {
    e.preventDefault();
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) {
      window.location.href = APP_STORE_URL;
    } else if (/Android/i.test(ua)) {
      window.location.href = PLAY_STORE_URL;
    } else {
      appModal.classList.add("open");
      document.body.style.overflow = "hidden";
    }
  }

  function closeModal() {
    appModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  // Attach to all download-intent CTAs (exclude store buttons inside the modal)
  document
    .querySelectorAll(".nav-cta, .plan-cta, .cta-btn, .store-btn:not(.modal-stores .store-btn)")
    .forEach(function (btn) {
      btn.addEventListener("click", handleGetApp);
    });

  // Close modal
  appModal
    .querySelector(".modal-close")
    .addEventListener("click", closeModal);
  appModal.addEventListener("click", function (e) {
    if (e.target === appModal) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });
})();
