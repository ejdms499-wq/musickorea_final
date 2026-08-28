/* ============================================================
   COMMON.JS
   HEADER + FOOTER 공통 기능
   ============================================================ */

fetch("json/common.json")
  .then((response) => {
    if (!response.ok) throw new Error("common.json load failed");
    return response.json();
  })
  .then((data) => {
    initCommonHeader(data.header);
    initCommonFooter(data.footer);
  })
  .catch((error) => console.error(error));


function initCommonHeader(headerData) {
  const nav = document.querySelector("#mkNav");
  const searchInput = document.querySelector("#mkSearchInput");

  if (!nav || !searchInput || !headerData) return;

  searchInput.placeholder = headerData.searchPlaceholder || "";

  nav.innerHTML = headerData.nav.map((item) => {
    const icon = item.menuIcon
      ? '<img src="img/icon/menu.svg" alt="">'
      : "";

    return `
      <a href="#" class="mk-nav-link">
        ${icon}
        <span>${item.label}</span>
      </a>
    `;
  }).join("");
}


function initCommonFooter(data) {
  const footerMount = document.querySelector("#mkFooterMount");
  if (!footerMount || !data) return;

  const links = data.links.map((link) => `
    <a class="mk-footer-link" href="${link.href}">
      ${link.label}
    </a>
  `).join("");

  footerMount.innerHTML = `
    <div class="mk-footer-wrap">

      <div class="mk-hanteo-strip">
        <div class="mk-hanteo-inner">
          <img
            class="mk-hanteo-badge"
            src="${data.hanteo.badge}"
            alt="Hanteo Family"
          >

          <div class="mk-hanteo-copy">
            ${data.hanteo.prefix}
            <strong>${data.hanteo.label}</strong>
            <span class="mk-hanteo-number">${data.hanteo.number}</span>
          </div>
        </div>
      </div>

      <footer class="mk-footer">
        <div class="mk-footer-inner">

          <div class="mk-footer-left">
            <nav class="mk-footer-links" aria-label="하단 이용 메뉴">
              ${links}
            </nav>

            <div class="mk-footer-phone-row">
              <h2 class="mk-footer-phone">
                ${data.customer.phone}
              </h2>

              <div class="mk-footer-hours">
                ${data.customer.hours}
                &nbsp;&nbsp;
                ${data.customer.lunch}
                &nbsp;&nbsp;
                ${data.customer.closed}
              </div>
            </div>

            <div class="mk-footer-company">
              <div class="mk-footer-company-row">
                <span>${data.company.name}</span>
                <span>${data.company.address}</span>
                <span>${data.company.representative}</span>
              </div>

              <div class="mk-footer-company-row">
                <span>${data.company.businessNumber}</span>

                <a
                  class="mk-footer-business-check"
                  href="https://www.ftc.go.kr/"
                  target="_blank"
                  rel="noopener"
                >
                  ${data.company.businessCheck}
                </a>

                <span>${data.company.mailOrder}</span>
                <span>${data.company.privacyOfficer}</span>
                <span>${data.company.email}</span>
              </div>

              <div class="mk-footer-copyright">
                ${data.company.copyright}
              </div>
            </div>
          </div>

          <div class="mk-footer-right">
            <div class="mk-footer-block">
              <h3 class="mk-footer-block-title">
                ${data.right.offlineTitle}
              </h3>

              <div class="mk-footer-block-line">
                <span class="mk-footer-pin" aria-hidden="true"></span>
                <span>${data.right.offline}</span>
              </div>
            </div>

            <div class="mk-footer-block">
              <h3 class="mk-footer-block-title">
                ${data.right.csTitle}
              </h3>

              <div class="mk-footer-block-line">
                <span class="mk-footer-phone-icon" aria-hidden="true"></span>
                <span>${data.right.cs}</span>
              </div>

              <img
                class="mk-footer-payment"
                src="${data.right.paymentBadges}"
                alt="NICEPAY 결제안내"
              >
            </div>
          </div>

          <div class="mk-footer-right-last">
            <div class="mk-footer-block">
              <h3 class="mk-footer-block-title">
                ${data.right.wholesaleTitle}
              </h3>

              <div class="mk-footer-block-line">
                <span class="mk-footer-chat-icon" aria-hidden="true"></span>
                <span>${data.right.wholesale}</span>
              </div>
            </div>
          </div>

        </div>
      </footer>

      <div class="mk-footer-float" aria-label="빠른 메뉴">
        <button
          type="button"
          class="mk-footer-float-button mk-footer-plus"
          aria-label="빠른 메뉴 열기"
        >
          +
        </button>

        <button
          type="button"
          class="mk-footer-float-button mk-footer-up"
          id="mkFooterScrollTop"
          aria-label="맨 위로"
        >
          ↑
        </button>
      </div>

    </div>
  `;

  const topButton = document.querySelector("#mkFooterScrollTop");

  if (topButton) {
    topButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
}
