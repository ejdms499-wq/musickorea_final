/* ============================================================
   BOARD.JS
   MusicKorea EVENT notice detail page
   Supports multiple eventnotice articles by idx.
   ============================================================ */

const mount = document.querySelector("#mkBoardMount");

fetch("json/board.json")
  .then((response) => {
    if (!response.ok) throw new Error("board.json load failed");
    return response.json();
  })
  .then((bundle) => {
    const params = new URLSearchParams(window.location.search);
    const idx = params.get("idx") || String(bundle.defaultIdx || "");
    const data = bundle.items?.[idx] || bundle.items?.[String(bundle.defaultIdx)];

    if (!data) throw new Error(`board item not found: ${idx}`);

    document.title = `${data.title} | MusicKorea`;
    renderBoard(data);
  })
  .catch((error) => {
    console.error(error);
    mount.innerHTML = `
      <section class="mk-board">
        <div class="mk-board-inner">
          <p class="mk-board-error">이벤트 정보를 불러오지 못했습니다.</p>
        </div>
      </section>
    `;
  });

function renderBoard(data) {
  mount.innerHTML = `
    <section class="mk-board">
      <div class="mk-board-inner">

        <div class="mk-board-kicker">EVENT공지</div>

        <div class="mk-board-heading-row">
          <h1 class="mk-board-heading">${data.sectionTitle}</h1>

          <nav class="mk-board-tabs" aria-label="이벤트 게시판">
            ${data.tabs.map(tab => `
              <button
                type="button"
                class="mk-board-tab ${tab.active ? "is-active" : ""}"
              >${tab.label}</button>
            `).join("")}
          </nav>
        </div>

        <article class="mk-board-article">
          <header class="mk-board-article-head">
            <div class="mk-board-category">[${data.category}]</div>
            <h2 class="mk-board-title">${data.title}</h2>

            <div class="mk-board-meta">
              <span>${data.author}</span>
              <span class="mk-board-meta-sep"></span>
              <time>${data.date}</time>
            </div>
          </header>

          <div class="mk-board-body">
            <img
              class="mk-board-poster"
              src="${data.poster}"
              alt="${data.title}"
            >
          </div>

          <div class="mk-board-actions">
            <a class="mk-board-list-button" href="index.html">목록</a>
          </div>
        </article>

        <div class="mk-board-nearby">
          <div class="mk-board-nearby-row">
            <span class="mk-board-nearby-label">이전글</span>
            <span class="mk-board-nearby-title">이벤트 공지</span>
          </div>
          <div class="mk-board-nearby-row">
            <span class="mk-board-nearby-label">다음글</span>
            <span class="mk-board-nearby-title">이벤트 공지</span>
          </div>
        </div>

      </div>
    </section>
  `;
}
