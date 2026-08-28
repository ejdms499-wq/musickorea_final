/* ============================================================
   MAIN.JS
   메인 페이지 전체 기능
   HERO + EVENT + PREORDER + RANK + NEW + GENRE
   ============================================================ */

fetch("json/main.json")
  .then((response) => {
    if (!response.ok) throw new Error("main.json load failed");
    return response.json();
  })
  .then((data) => {
    initHero(data.hero);
    initEventProducts(data.eventProducts);
    initPreorderProducts(data.preorderProducts);
    initRankProducts(data.rankProducts);
    initNewProducts(data.newProducts);
    initGenreMusic(data.genreMusic);
  })
  .catch((error) => console.error(error));


/* ============================================================
   HERO CAROUSEL
   ============================================================ */

function initHero(carouselData) {
  const stage = document.querySelector(".mk-top-stage");
  const colorField = document.querySelector("#mkColorField");
  const track = document.querySelector("#eventTrack");
  const progressThumb = document.querySelector("#progressThumb");
  const prevArrow = document.querySelector("#prevArrow");
  const nextArrow = document.querySelector("#nextArrow");

  if (!stage || !colorField || !track || !carouselData) return;

  const state = {
    slides: carouselData.slides || [],
    rendered: [],
    virtualIndex: 0,
    timer: null,
    autoplayMs: carouselData.autoplayMs || 3200
  };

  function renderCarousel() {
    state.rendered = [...state.slides, ...state.slides, ...state.slides];

    track.innerHTML = state.rendered.map((slide, index) => `
      <article
        class="event-card"
        data-virtual-index="${index}"
        data-real-index="${index % state.slides.length}"
        data-href="${slide.href || "#"}"
        aria-label="${slide.title}"
      >
        <img src="${slide.image}" alt="${slide.title}">
      </article>
    `).join("");

    track.querySelectorAll(".event-card").forEach((card) => {
      card.addEventListener("click", () => {
        const href = card.dataset.href;

        if (href && href !== "#") {
          window.location.href = href;
        }
      });
    });

    track.addEventListener("transitionend", normalizeInfinitePosition);
  }

  function getMetrics() {
    const carousel = document.querySelector(".event-carousel");
    const carouselWidth = carousel.getBoundingClientRect().width;
    const card = track.querySelector(".event-card");
    const cardW = card ? card.getBoundingClientRect().width : 513;
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap) || 74;

    const isDesktopPair = window.innerWidth > 1200;
    const focusStart = isDesktopPair
      ? 0
      : ((carouselWidth - cardW) / 2) + (window.innerWidth > 650 ? 29 : 0);

    return {
      cardW,
      gap,
      step: cardW + gap,
      focusStart
    };
  }

  function currentRealIndex() {
    const count = state.slides.length;
    return ((state.virtualIndex % count) + count) % count;
  }

  function applyPosition(animated = true) {
    const { step, focusStart } = getMetrics();

    track.style.transition = animated
      ? "transform .76s cubic-bezier(.22,.82,.24,1)"
      : "none";

    const x = focusStart - state.virtualIndex * step;
    track.style.transform = `translate3d(${x}px,0,0)`;

    track.querySelectorAll(".event-card").forEach((card) => {
      card.classList.toggle(
        "is-active",
        Number(card.dataset.virtualIndex) === state.virtualIndex
      );
    });

    if (!animated) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        track.style.transition = "transform .76s cubic-bezier(.22,.82,.24,1)";
      }));
    }
  }

  function applyTheme() {
    const active = state.slides[currentRealIndex()];
    if (!active) return;

    stage.dataset.theme = active.id;
    colorField.style.backgroundColor = active.theme;
  }

  function updateProgress() {
    if (!progressThumb) return;
    progressThumb.style.transform =
      `translate3d(${currentRealIndex() * 60}px,0,0)`;
  }

  function applyAll(animated = true) {
    applyPosition(animated);
    applyTheme();
    updateProgress();
  }

  function nextSlide() {
    state.virtualIndex += 1;
    applyAll(true);
  }

  function previousSlide() {
    state.virtualIndex -= 1;
    applyAll(true);
  }

  function normalizeInfinitePosition() {
    const count = state.slides.length;

    if (state.virtualIndex >= count * 2) {
      state.virtualIndex -= count;
      applyPosition(false);
    } else if (state.virtualIndex < count) {
      state.virtualIndex += count;
      applyPosition(false);
    }
  }

  function startAutoplay() {
    stopAutoplay();
    state.timer = window.setInterval(nextSlide, state.autoplayMs);
  }

  function stopAutoplay() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
  }

  function restartAutoplay() {
    startAutoplay();
  }

  renderCarousel();

  const initialReal = carouselData.initialIndex ?? 1;
  state.virtualIndex = state.slides.length + initialReal;

  applyAll(false);
  startAutoplay();

  if (prevArrow) {
    prevArrow.addEventListener("click", () => {
      previousSlide();
      restartAutoplay();
    });
  }

  if (nextArrow) {
    nextArrow.addEventListener("click", () => {
      nextSlide();
      restartAutoplay();
    });
  }

  window.addEventListener("resize", () => applyPosition(false));

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      nextSlide();
      restartAutoplay();
    } else if (event.key === "ArrowLeft") {
      previousSlide();
      restartAutoplay();
    }
  });
}


/* ============================================================
   EVENT PRODUCTS
   ============================================================ */

function initEventProducts(data) {
  const eventHeading = document.querySelector("#mkEventHeading");
  const eventWindow = document.querySelector("#mkEventProductsWindow");
  const eventTrack = document.querySelector("#mkEventProductsTrack");

  if (!eventHeading || !eventWindow || !eventTrack || !data) return;

  const state = {
    items: data.items || [],
    rendered: [],
    groupSize: data.section.groupSize || 3,
    virtualGroup: 1,
    peekPx: data.section.peekPx ?? 50,
    dragging: false,
    startX: 0,
    dragX: 0,
    wheelLocked: false
  };

  eventHeading.innerHTML = `
    <div class="mk-event-logo-line">
      <span class="mk-event-muko">${data.section.kickerPink}</span>
      <span class="mk-event-script">${data.section.kickerScript}</span>
    </div>

    <h2 class="mk-event-title">
      ${data.section.titleLine1}<br>
      ${data.section.titleLine2}
    </h2>
  `;

  function renderCards() {
    const size = state.groupSize;
    const firstGroup = state.items.slice(0, size);
    const secondGroup = state.items.slice(size, size * 2);

    state.rendered = [
      ...secondGroup.map((item) => ({ ...item, clone: true })),
      ...firstGroup.map((item) => ({ ...item, clone: false })),
      ...secondGroup.map((item) => ({ ...item, clone: false })),
      ...firstGroup.map((item) => ({ ...item, clone: true }))
    ];

    eventTrack.innerHTML = state.rendered.map((item) => `
      <a
        href="${item.href || "#"}"
        class="mk-event-product-card"
        aria-label="${item.name}"
        draggable="false"
      >
        <div class="mk-event-circle">
          <img
            src="${item.image}"
            alt="${item.name}"
            draggable="false"
          >

          <div class="mk-event-countdown">
            <span class="mk-event-diamond">♦</span>
            <span>${item.countdown || `${item.days}Day 11 : 36 : 58`}</span>
          </div>
        </div>

        <div class="mk-event-product-name">${item.name}</div>
        <div class="mk-event-product-notice">${item.notice}</div>
        <div class="mk-event-product-period">${item.period}</div>

        <div class="mk-event-price-line">
          <strong class="mk-event-price">
            ${item.price.toLocaleString("ko-KR")} 원
          </strong>

          <span class="mk-event-original-price">
            ${item.originalPrice.toLocaleString("ko-KR")} 원
          </span>
        </div>
      </a>
    `).join("");

    eventTrack.addEventListener("transitionend", normalizeLoop);
  }

  function getMetrics() {
    const firstCard = eventTrack.querySelector(".mk-event-product-card");

    if (!firstCard) {
      return {
        groupStep: 834,
        peek: 50
      };
    }

    const cardW = firstCard.getBoundingClientRect().width;
    const styles = getComputedStyle(eventTrack);
    const gap = parseFloat(styles.columnGap || styles.gap) || 30;
    const groupStep = (cardW + gap) * state.groupSize;

    let peek = state.peekPx;

    if (window.innerWidth <= 720) {
      peek = 12;
    } else if (window.innerWidth <= 1100) {
      peek = 34;
    }

    return { groupStep, peek };
  }

  function applyPosition(animated = true, extraDrag = 0) {
    const { groupStep, peek } = getMetrics();

    eventTrack.style.transition = animated
      ? "transform .78s cubic-bezier(.22,.82,.24,1)"
      : "none";

    const x =
      -(state.virtualGroup * groupStep) +
      peek +
      extraDrag;

    eventTrack.style.transform =
      `translate3d(${x}px, 0, 0)`;

    if (!animated) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          eventTrack.style.transition =
            "transform .78s cubic-bezier(.22,.82,.24,1)";
        });
      });
    }
  }

  function nextGroup() {
    if (state.dragging) return;
    state.virtualGroup += 1;
    applyPosition(true);
  }

  function previousGroup() {
    if (state.dragging) return;
    state.virtualGroup -= 1;
    applyPosition(true);
  }

  function normalizeLoop(event) {
    if (event.propertyName && event.propertyName !== "transform") return;

    if (state.virtualGroup >= 3) {
      state.virtualGroup = 1;
      applyPosition(false);
    } else if (state.virtualGroup <= 0) {
      state.virtualGroup = 2;
      applyPosition(false);
    }
  }

  function finishDrag(event) {
    if (!state.dragging) return;

    const threshold = Math.min(95, window.innerWidth * 0.09);
    const dragDistance = state.dragX;

    state.dragging = false;
    state.dragX = 0;

    eventWindow.classList.remove("is-dragging");

    try {
      eventWindow.releasePointerCapture(event.pointerId);
    } catch (_) {}

    if (dragDistance <= -threshold) {
      nextGroup();
    } else if (dragDistance >= threshold) {
      previousGroup();
    } else {
      applyPosition(true);
    }
  }

  renderCards();
  applyPosition(false);

  window.addEventListener("resize", () => applyPosition(false));

  eventWindow.addEventListener("pointerdown", (event) => {
    state.dragging = true;
    state.startX = event.clientX;
    state.dragX = 0;

    eventWindow.classList.add("is-dragging");
    eventWindow.setPointerCapture(event.pointerId);
    eventTrack.style.transition = "none";
  });

  eventWindow.addEventListener("pointermove", (event) => {
    if (!state.dragging) return;

    state.dragX = event.clientX - state.startX;
    applyPosition(false, state.dragX);
  });

  eventWindow.addEventListener("pointerup", finishDrag);
  eventWindow.addEventListener("pointercancel", finishDrag);

  eventWindow.addEventListener(
    "wheel",
    (event) => {
      if (state.wheelLocked) return;

      const dx = event.deltaX;
      const dy = event.deltaY;

      if (Math.abs(dx) < 10 && Math.abs(dy) < 18) return;

      event.preventDefault();
      state.wheelLocked = true;

      const direction =
        Math.abs(dx) > Math.abs(dy)
          ? Math.sign(dx)
          : Math.sign(dy);

      if (direction > 0) nextGroup();
      else previousGroup();

      window.setTimeout(() => {
        state.wheelLocked = false;
      }, 650);
    },
    { passive: false }
  );

  eventWindow.setAttribute("tabindex", "0");

  eventWindow.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextGroup();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previousGroup();
    }
  });
}


/* ============================================================
   PREORDER PRODUCTS
   ============================================================ */

function initPreorderProducts(data) {
  const title = document.querySelector("#mkPreorderTitle");
  const grid = document.querySelector("#mkPreorderGrid");

  if (!title || !grid || !data) return;

  title.textContent = data.section.title;

  grid.innerHTML = data.items.map((item) => {
    const badges = (item.badges || []).map((badge, index) => `
      <span class="mk-preorder-badge ${index > 0 ? "is-secondary" : ""}">
        ${badge}
      </span>
    `).join("");

    return `
      <a
        class="mk-preorder-card"
        href="${item.href || "#"}"
        ${item.href && item.href.startsWith("http")
          ? 'target="_blank" rel="noopener"'
          : ""}
      >
        <div class="mk-preorder-image">
          <img
            src="${item.image}"
            alt="${item.name}"
            loading="lazy"
          >
        </div>

        <div class="mk-preorder-badges">
          ${badges}
        </div>

        <div class="mk-preorder-name">
          ${item.name}
        </div>

        <div class="mk-preorder-price-row">
          <strong class="mk-preorder-price">
            ${item.price.toLocaleString("ko-KR")} 원
          </strong>

          <span class="mk-preorder-original">
            ${item.originalPrice.toLocaleString("ko-KR")} 원
          </span>
        </div>
      </a>
    `;
  }).join("");
}


/* ============================================================
   POPULAR RANK
   ============================================================ */

function initRankProducts(data) {
  const heading = document.querySelector("#mkRankHeading");
  const grid = document.querySelector("#mkRankGrid");

  if (!heading || !grid || !data) return;

  heading.innerHTML = `
    <div class="mk-rank-logo-line">
      <span class="mk-rank-muko">${data.section.kickerPink}</span>
      <span class="mk-rank-script">${data.section.kickerScript}</span>
    </div>

    <h2 class="mk-rank-title">
      ${data.section.titleLine1}<br>
      ${data.section.titleLine2}
    </h2>
  `;

  grid.innerHTML = [...data.items]
    .sort((a, b) => a.rank - b.rank)
    .map((item) => `
      <a
        class="mk-rank-card"
        data-rank="${item.rank}"
        href="${item.href || "#"}"
        aria-label="${item.rank}위 ${item.name}"
      >
        <strong class="mk-rank-number">
          ${item.rank}
        </strong>

        <div class="mk-rank-thumb">
          <img
            src="${item.image}"
            alt="${item.name}"
            loading="lazy"
          >
        </div>

        <div class="mk-rank-name">
          ${item.name}
        </div>
      </a>
    `)
    .join("");
}


/* ============================================================
   NEW PRODUCTS
   ============================================================ */

function initNewProducts(data) {
  const title = document.querySelector("#mkNewProductsTitle");
  const grid = document.querySelector("#mkNewProductsGrid");

  if (!title || !grid || !data) return;

  title.textContent = data.section.title;

  grid.innerHTML = data.items.map((item) => `
    <a
      class="mk-new-product-card"
      href="${item.href || "#"}"
    >
      <div class="mk-new-product-image">
        <img
          src="${item.image}"
          alt="${item.name}"
          loading="lazy"
        >
      </div>

      <div class="mk-new-product-name">
        ${item.name}
      </div>

      <div class="mk-new-product-price-row">
        <strong class="mk-new-product-price">
          ${item.price.toLocaleString("ko-KR")} 원
        </strong>

        <span class="mk-new-product-original">
          ${item.originalPrice.toLocaleString("ko-KR")} 원
        </span>
      </div>
    </a>
  `).join("");
}


/* ============================================================
   GENRE MUSIC
   ============================================================ */

function initGenreMusic(data) {
  const title = document.querySelector("#mkGenreTitle");
  const tabs = document.querySelector("#mkGenreTabs");
  const grid = document.querySelector("#mkGenreGrid");

  if (!title || !tabs || !grid || !data) return;

  title.textContent = data.section.title;

  tabs.innerHTML = data.section.tabs.map((tab) => `
    <button
      type="button"
      class="mk-genre-tab ${tab.active ? "is-active" : ""}"
      aria-pressed="${tab.active ? "true" : "false"}"
    >
      ${tab.label}
    </button>
  `).join("");

  grid.innerHTML = data.genres.map((genre) => `
    <article class="mk-genre-column">

      <a
        class="mk-genre-banner"
        href="${genre.href || "#"}"
        aria-label="${genre.id.toUpperCase()} 장르 상세"
      >
        <img
          src="${genre.banner}"
          alt="${genre.id.toUpperCase()}"
          draggable="false"
        >
      </a>

      <div class="mk-genre-list">
        ${genre.items.map((item) => `
          <a class="mk-genre-product" href="${item.href || "#"}">
            <div class="mk-genre-thumb">
              <img
                src="${item.image}"
                alt="${item.name}"
                loading="lazy"
              >
            </div>

            <div class="mk-genre-info">
              <div class="mk-genre-name">
                ${item.name}
              </div>

              <div class="mk-genre-price-row">
                <strong class="mk-genre-price">
                  ${item.price.toLocaleString("ko-KR")} 원
                </strong>

                <span class="mk-genre-original">
                  ${item.originalPrice.toLocaleString("ko-KR")} 원
                </span>
              </div>
            </div>
          </a>
        `).join("")}
      </div>

    </article>
  `).join("");
}
