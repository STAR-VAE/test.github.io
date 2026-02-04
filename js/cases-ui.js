// cases-ui.js

function initVaeCases() {
  const CASES = window.VAE_CASES || [];
  const root = document.getElementById("cases-root");
  if (!root) return;

  // 防止重复初始化（可选）
  if (root.dataset.inited) return;
  root.dataset.inited = "1";

  const LABELS = {
    gt: "GT",
    b1: "Baseline-1",
    b2: "Baseline-2",
    ours: "Ours"
  };

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function fmt(t) {
    if (!isFinite(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function makeCaseCard(c) {
    const card = el("div", "case-card");
    const header = el("div", "case-head",
      `<div>
         <div class="case-title">${c.title ?? c.id}</div>
         ${c.note ? `<div class="case-note">${c.note}</div>` : ""}
       </div>`
    );

    // single visible audio element
    const player = document.createElement("audio");
    player.controls = true;
    player.preload = "metadata";

    // keep hidden audio elements for fast switching
    const keys = Object.keys(c.tracks);
    const audios = {};
    keys.forEach(k => {
      const a = document.createElement("audio");
      a.src = c.tracks[k];
      a.preload = "metadata";
      a.crossOrigin = "anonymous";
      audios[k] = a;
    });

    let activeKey = keys.includes("ours") ? "ours" : keys[0];

    function setActive(nextKey, keepTime = true) {
      if (!audios[nextKey]) return;

      const wasPlaying = !player.paused;
      const t = keepTime ? player.currentTime : 0;

      activeKey = nextKey;
      player.src = audios[nextKey].src;

      // restore time after metadata is ready
      const onMeta = () => {
        player.currentTime = Math.min(t, player.duration || t);
        if (wasPlaying) player.play().catch(() => {});
        player.removeEventListener("loadedmetadata", onMeta);
      };
      player.addEventListener("loadedmetadata", onMeta);
      player.load();
      updateActiveBtn();
      updateNowPlaying();
    }

    // tabs
    const tabs = el("div", "case-tabs");
    const btns = {};
    keys.forEach(k => {
      const b = el("button", "tab-btn", LABELS[k] ?? k);
      b.type = "button";
      b.addEventListener("click", () => setActive(k, true));
      btns[k] = b;
      tabs.appendChild(b);
    });

    function updateActiveBtn() {
      Object.entries(btns).forEach(([k, b]) => {
        b.classList.toggle("active", k === activeKey);
      });
    }

    const now = el("div", "case-now", "");
    function decodeEntities(str){
      const ta = document.createElement("textarea");
      ta.innerHTML = str;
      return ta.value;
    }

    function updateNowPlaying(){
      const label = LABELS[activeKey] ?? activeKey;
      now.textContent = `Now: ${decodeEntities(label)}`;
    }


    // loop controls
    const loopBox = el("div", "loop-box");
    const loopToggle = el("label", "loop-toggle",
      `<input type="checkbox" class="loop-enabled"> <span>Loop segment</span>`
    );
    const loopEnabled = loopToggle.querySelector("input");

    const rangeWrap = el("div", "loop-ranges");
    const startRow = el("div", "loop-row");
    const endRow = el("div", "loop-row");

    const startLabel = el("div", "loop-label", `Start: <span class="t">0:00</span>`);
    const endLabel   = el("div", "loop-label", `End: <span class="t">0:00</span>`);

    const start = document.createElement("input");
    start.type = "range"; start.min = 0; start.max = 1000; start.value = 0; start.step = 1;

    const end = document.createElement("input");
    end.type = "range"; end.min = 0; end.max = 1000; end.value = 1000; end.step = 1;

    startRow.append(startLabel, start);
    endRow.append(endLabel, end);
    rangeWrap.append(startRow, endRow);

    
    loopBox.append(loopToggle, rangeWrap);

    function slidersToTime() {
      const dur = player.duration || 0;
      const s = (start.value / 1000) * dur;
      const e = (end.value / 1000) * dur;
      return { s: Math.min(s, e - 0.02), e: Math.max(e, s + 0.02), dur };
    }

    function updateLoopLabels() {
      const { s, e } = slidersToTime();
      startLabel.querySelector(".t").textContent = fmt(s);
      endLabel.querySelector(".t").textContent = fmt(e);
    }

    function enforceOrder() {
      // ensure start < end
      if (+start.value >= +end.value) {
        if (this === start) start.value = Math.max(0, +end.value - 5);
        if (this === end) end.value = Math.min(1000, +start.value + 5);
      }
      updateLoopLabels();
    }

    start.addEventListener("input", enforceOrder);
    end.addEventListener("input", enforceOrder);

    player.addEventListener("loadedmetadata", () => {
      updateLoopLabels();
      // if duration is 0 until metadata, labels update here
    });

    player.addEventListener("timeupdate", () => {
      if (!loopEnabled.checked) return;
      const { s, e } = slidersToTime();
      if (player.currentTime >= e) player.currentTime = s;
    });

    // init
    updateActiveBtn();
    updateNowPlaying();
    setActive(activeKey, false);

    card.append(header, tabs, now, player, loopBox);
    return card;
  }

  // render grid
  CASES.forEach(c => root.appendChild(makeCaseCard(c)));
}

window.addEventListener("partials:loaded", initVaeCases);
document.addEventListener("DOMContentLoaded", initVaeCases);
