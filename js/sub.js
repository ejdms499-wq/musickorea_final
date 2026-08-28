const mount = document.querySelector("#subPageMount");

fetch("json/sub.json")
  .then((response) => {
    if (!response.ok) throw new Error("sub.json load failed");
    return response.json();
  })
  .then((data) => {
    const params = new URLSearchParams(location.search);
    const id = params.get("id") || data.defaultId;
    const page = data.pages[id];

    if (!page) {
      mount.innerHTML = `
        <div class="mk-detail-error">
          <h1>상품을 찾을 수 없습니다.</h1>
          <a href="index.html">메인으로 돌아가기</a>
        </div>
      `;
      return;
    }

    document.title = `${page.name} | MusicKorea`;

    if (["preorder-8","preorder-9","preorder-10","preorder-11","preorder-12","preorder-13","preorder-14","preorder-15","preorder-16","rank-1","rank-2","rank-3","rank-4","rank-5","rank-6","new-1","new-2","new-3","new-4","new-5","new-6","new-7","new-8","new-9","new-10","new-11","new-12","new-13","new-14","new-15","new-16"].includes(id)) {
      renderPhotobookExact(page);
      return;
    }

    if (page.template === "musickorea-detail") {
      renderMusicKoreaDetail(page);
      return;
    }

    renderSimple(page);
  })
  .catch((error) => {
    console.error(error);
    mount.innerHTML = `<div class="mk-detail-error"><h1>상세페이지를 불러오지 못했습니다.</h1></div>`;
  });


function money(value) {
  return `${Number(value).toLocaleString("ko-KR")}원`;
}


function renderMusicKoreaDetail(page) {
  mount.innerHTML = `
    <div class="mk-detail-container">

      <nav class="mk-detail-breadcrumb" aria-label="현재 위치">
        ${(page.breadcrumb || []).map((item, index) => `
          <span>${item}</span>${index < page.breadcrumb.length - 1 ? "<i>›</i>" : ""}
        `).join("")}
      </nav>

      <section class="mk-detail-product">

        <!-- 원본처럼 대표 상품 이미지만 크게 표시.
             왼쪽 세로 썸네일/배너는 사용하지 않음 -->
        <div class="mk-detail-gallery mk-detail-gallery-single">
          <div class="mk-detail-main-image">
            <img id="mkDetailMainImage" src="${page.image}" alt="${page.name}">
          </div>
        </div>

        <div class="mk-detail-info">
          <h1>${page.name}</h1>

          <div class="mk-detail-price">
            <strong>${money(page.price)}</strong>
            <del>${money(page.originalPrice)}</del>
            <span>${page.discount}%</span>
          </div>

          <dl class="mk-detail-meta">
            ${meta("아티스트", page.artist)}
            ${meta("상품코드", page.productCode)}
            ${meta("발매일", page.releaseDate)}
            ${meta("미디어", page.media)}
            ${meta("배송방법", page.shippingMethod)}
            ${meta("배송비", page.shippingFee)}
            ${meta("적립금", page.mileage)}
          </dl>

          <div class="mk-detail-qty-line">
            <span>수량</span>

            <div class="mk-detail-qty">
              <button id="qtyMinus" type="button">−</button>
              <input id="qtyInput" type="text" value="1" inputmode="numeric" aria-label="수량">
              <button id="qtyPlus" type="button">＋</button>
            </div>
          </div>

          <div class="mk-detail-total">
            <span>총 상품 금액</span>
            <strong id="totalPrice">0 원</strong>
          </div>

          <div class="mk-detail-actions">
            <button type="button" class="mk-detail-cart">장바구니 담기</button>
            <button type="button" class="mk-detail-buy">상품 구매하기</button>
          </div>
        </div>
      </section>

      <nav class="mk-detail-tabs">
        <a class="is-active" href="#productDetail">상품상세</a>
        <a href="#exchangeReturn">교환/반품</a>
      </nav>

      <section id="productDetail" class="mk-product-detail-section">
        <h2>상품상세정보</h2>

        ${(page.noticeImages || []).map((src) => `
          <div class="mk-product-detail-notice">
            <img src="${src}" alt="상품 유의사항">
          </div>
        `).join("")}

        <!-- 사용자가 지정한 실제 상세 이미지 -->
        <div class="mk-product-detail-hero">
          <img src="${page.detailHeroImage}" alt="detail product - 상품상세설명">
        </div>

        ${page.detailImageOnly ? "" : `
        <div class="mk-product-detail-copy">
          ${page.trackListTitle ? `
            <h3>${page.trackListTitle}</h3>
            ${page.trackNote ? `<p class="mk-track-note">${page.trackNote}</p>` : ""}
            <ul class="mk-track-list">
              ${(page.trackList || []).map((track) => `<li>- ${track}</li>`).join("")}
            </ul>
          ` : ""}

          ${page.detailInfoTitle ? `<h3>${page.detailInfoTitle}</h3>` : ""}

          ${(page.versions || []).map((version) => `
            <div class="mk-detail-info-version">
              ${version.title ? `<h4>${version.title}</h4>` : ""}
              <ul>
                ${version.items.map((item) => `<li>- ${item}</li>`).join("")}
              </ul>
            </div>
          `).join("")}

          ${(page.albumDescription || []).length ? `
            <div class="mk-album-description">
              ${page.albumDescription.map((line) => `<p>${line}</p>`).join("")}
            </div>
          ` : ""}
        </div>
        `}
      </section>

      <section class="mk-detail-policy">
        <article>
          <h2>배송 정보</h2>
          <ul>${page.shipping.map((line) => `<li>${line}</li>`).join("")}</ul>
        </article>

        <article>
          <h2>상품 결제 정보</h2>
          <ul>${page.payment.map((line) => `<li>${line}</li>`).join("")}</ul>
        </article>

        <article id="exchangeReturn">
          <h2>교환 및 반품 안내</h2>

          <h3>교환 및 반품이 가능한 경우</h3>
          <ul>${page.returnsPossible.map((line) => `<li>${line}</li>`).join("")}</ul>

          <h3>교환 및 반품이 불가능한 경우</h3>
          <ul>${page.returnsImpossible.map((line) => `<li>${line}</li>`).join("")}</ul>

          <div class="mk-return-note">
            ${page.returnsNote.map((line) => `<p>${line}</p>`).join("")}
          </div>
        </article>
      </section>

    </div>
  `;

  initQuantity(page.price);
}


function meta(key, value) {
  return `
    <div>
      <dt>${key}</dt>
      <dd>${value}</dd>
    </div>
  `;
}


function initQuantity(unitPrice) {
  const minus = document.querySelector("#qtyMinus");
  const plus = document.querySelector("#qtyPlus");
  const input = document.querySelector("#qtyInput");
  const total = document.querySelector("#totalPrice");

  function qty() {
    const n = parseInt(input.value, 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }

  function update() {
    input.value = qty();
    total.textContent = `${(qty() * unitPrice).toLocaleString("ko-KR")} 원`;
  }

  minus.addEventListener("click", () => {
    input.value = Math.max(1, qty() - 1);
    update();
  });

  plus.addEventListener("click", () => {
    input.value = qty() + 1;
    update();
  });

  input.addEventListener("change", update);
}



function renderPhotobookExact(page) {
  mount.innerHTML = `
    <div class="mk-pb-page">

      <section class="mk-pb-product">
        <div class="mk-pb-image-area">
          <img class="mk-pb-main-image" src="${page.image}" alt="${page.name}">
        </div>

        <div class="mk-pb-info">
          <h1>${page.name}</h1>

          <div class="mk-pb-price-row">
            <strong>${money(page.price)}</strong>
            <del>${money(page.originalPrice)}</del>
            <span>${page.discount}%</span>
          </div>

          <dl class="mk-pb-meta">
            ${pbMeta("아티스트", page.artist)}
            ${pbMeta("상품코드", page.productCode)}
            ${pbMeta("발매일", page.releaseDate)}
            ${pbMeta("미디어", page.media)}
            ${pbMeta("배송방법", page.shippingMethod)}
            ${pbMeta("배송비", page.shippingFee)}
            ${pbMeta("적립금", page.mileage)}
          </dl>

          <div class="mk-pb-qty-row">
            <span>수량</span>
            <div class="mk-pb-qty">
              <button type="button" id="qtyMinus">−</button>
              <input id="qtyInput" value="1" inputmode="numeric" aria-label="수량">
              <button type="button" id="qtyPlus">＋</button>
            </div>
          </div>

          <div class="mk-pb-total">
            <span>총 상품 금액</span>
            <strong id="totalPrice">0 원</strong>
          </div>

          <div class="mk-pb-buttons">
            <button type="button" class="mk-pb-cart">장바구니 담기</button>
            <button type="button" class="mk-pb-buy">상품 구매하기</button>
          </div>
        </div>
      </section>

      <nav class="mk-pb-tabs">
        <a class="is-active" href="#productDetail">상품상세</a>
        <a href="#exchangeReturn">교환/반품</a>
      </nav>

      <section id="productDetail" class="mk-pb-detail">
        <h2>상품상세정보</h2>

        <div class="mk-pb-detail-images">
          ${(page.detailImages && page.detailImages.length
            ? page.detailImages
            : [page.detailHeroImage]
          ).filter(Boolean).map((src, index) => `
            <img class="mk-pb-detail-image"
                 src="${src}"
                 alt="${page.name} 상품상세설명 ${index + 1}">
          `).join("")}
        </div>

        <div class="mk-pb-copy">
          <h3>${page.trackListTitle}</h3>
          <ol class="mk-pb-track">
            ${(page.trackList || []).map(item => `<li>${item}</li>`).join("")}
          </ol>

          <h3>${page.detailInfoTitle}</h3>
          <ul class="mk-pb-detail-list">
            ${(page.versions?.[0]?.items || []).map(item => `<li>${item}</li>`).join("")}
          </ul>

          <div class="mk-pb-description">
            ${(page.albumDescription || []).map(line => `<p>${line}</p>`).join("")}
          </div>
        </div>
      </section>

      <section class="mk-pb-policy">
        <article>
          <h2>배송 정보</h2>
          <ul>${page.shipping.map(line => `<li>${line}</li>`).join("")}</ul>
        </article>

        <article>
          <h2>상품 결제 정보</h2>
          <ul>${page.payment.map(line => `<li>${line}</li>`).join("")}</ul>
        </article>

        <article id="exchangeReturn">
          <h2>교환 및 반품 안내</h2>

          <h3>교환 및 반품이 가능한 경우</h3>
          <ul>${page.returnsPossible.map(line => `<li>${line}</li>`).join("")}</ul>

          <h3>교환 및 반품이 불가능한 경우</h3>
          <ul>${page.returnsImpossible.map(line => `<li>${line}</li>`).join("")}</ul>

          <div class="mk-pb-note">
            ${page.returnsNote.map(line => `<p>※ ${line}</p>`).join("")}
          </div>
        </article>
      </section>

    </div>
  `;

  initQuantity(page.price);
}

function pbMeta(label, value) {
  return `
    <div>
      <dt>${label}</dt>
      <dd>${value}</dd>
    </div>
  `;
}

function renderSimple(page) {
  mount.innerHTML = `
    <div class="mk-detail-container">
      <section class="mk-simple-detail">
        <img src="${page.image}" alt="${page.name}">
        <h1>${page.name}</h1>
        <a href="index.html">메인으로 돌아가기</a>
      </section>
    </div>
  `;
}
