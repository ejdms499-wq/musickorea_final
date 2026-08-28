/* ============================================================
   SEARCH.JS
   MusicKorea EVAN 검색결과 페이지
   ============================================================ */

const mount = document.querySelector("#mkSearchResultMount");

fetch("json/search.json")
  .then((response) => {
    if (!response.ok) throw new Error("search.json load failed");
    return response.json();
  })
  .then((data) => {
    renderSearchPage(data);
    startReleaseCountdown();
  })
  .catch((error) => {
    console.error(error);
    mount.innerHTML = `
      <section class="mk-search-results">
        <div class="mk-search-results-inner">
          <p class="mk-search-error">검색결과를 불러오지 못했습니다.</p>
        </div>
      </section>
    `;
  });

function money(value) {
  return `${Number(value).toLocaleString("ko-KR")} 원`;
}

function renderSearchPage(data) {
  const params = new URLSearchParams(window.location.search);
  const keyword = params.get("keyword") || data.keyword || "";

  const searchInput = document.querySelector("#mkSearchInput");
  if (searchInput) searchInput.value = keyword;

  mount.innerHTML = `
    <section class="mk-search-results">
      <div class="mk-search-results-inner">

        <h1 class="mk-search-heading">SEARCH FOR "${keyword}"</h1>

        <div class="mk-search-total">
          TOTAL ${data.total} Items.
        </div>

        <div class="mk-search-grid">
          ${data.products.map((product) => `
            <a class="mk-search-product" href="${product.href}">
              <div class="mk-search-product-image">
                <img src="${product.image}" alt="${product.name}">
                <span
                  class="mk-search-countdown"
                  data-release="2026-09-07T00:00:00+09:00"
                >9Day 08 : 45 : 14</span>
              </div>

              <h2 class="mk-search-product-name">${product.name}</h2>

              <p class="mk-search-product-notice">${product.notice}</p>

              <p class="mk-search-product-period">${product.period}</p>

              <div class="mk-search-product-price">
                <span class="mk-search-discount">${product.discount}%</span>
                <strong>${money(product.price)}</strong>
                <del>${money(product.originalPrice)}</del>
              </div>
            </a>
          `).join("")}
        </div>

      </div>
    </section>
  `;
}

function startReleaseCountdown() {
  const nodes = [...document.querySelectorAll(".mk-search-countdown")];

  function update() {
    const now = new Date();

    nodes.forEach((node) => {
      const release = new Date(node.dataset.release);
      let diff = Math.max(0, release.getTime() - now.getTime());

      const day = Math.floor(diff / 86400000);
      diff %= 86400000;

      const hour = Math.floor(diff / 3600000);
      diff %= 3600000;

      const minute = Math.floor(diff / 60000);
      diff %= 60000;

      const second = Math.floor(diff / 1000);

      node.textContent =
        `${day}Day ${String(hour).padStart(2, "0")} : ${String(minute).padStart(2, "0")} : ${String(second).padStart(2, "0")}`;
    });
  }

  update();
  window.setInterval(update, 1000);
}
