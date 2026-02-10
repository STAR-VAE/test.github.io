function initT2ACases(){
  const CASES = window.T2A_CASES || [];
  const root = document.getElementById("t2a-root");
  if (!root || root.dataset.inited) return;
  root.dataset.inited = "1";

  const esc = (s) => String(s).replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])
  );

  root.innerHTML = CASES.map((c, idx) => {
    const methods = Object.keys(c.clips || {});
    const active = methods[0] || "";
    const tabs = methods.map(m =>
      `<button class="tab-btn ${m===active?"active":""}" data-method="${esc(m)}" type="button">${esc(m)}</button>`
    ).join("");

    return `
      <article class="case-card" data-case="${esc(c.id)}" data-active="${esc(active)}">
        <div class="case-head">
          <div>
            <div class="case-title">${esc(c.prompt)}</div>
          </div>
        </div>

        <div class="case-tabs">${tabs}</div>
        <div class="case-now">Now: <span class="now-method">${esc(active)}</span></div>

        <audio class="case-audio" controls preload="metadata" src="${esc(c.clips[active] || "")}"></audio>
      </article>
    `;
  }).join("");

  root.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab-btn");
    if (!btn) return;

    const card = btn.closest(".case-card");
    const caseId = card?.dataset.case;
    const method = btn.dataset.method;
    const item = CASES.find(x => x.id === caseId);
    if (!item) return;

    // UI state
    card.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b === btn));
    card.querySelector(".now-method").textContent = method;

    // swap audio (keep paused state simple)
    const audio = card.querySelector(".case-audio");
    const wasPlaying = !audio.paused;
    audio.src = item.clips[method] || "";
    audio.currentTime = 0;
    if (wasPlaying) audio.play().catch(()=>{});
  });
}

// IMPORTANT: wait for partials
window.addEventListener("partials:loaded", initT2ACases);
document.addEventListener("DOMContentLoaded", initT2ACases);
