function initExpandCards(rootSel = "#framework-expands", oneOpen = true){
  const root = document.querySelector(rootSel);
  if (!root || root.dataset.inited) return;
  root.dataset.inited = "1";

  const cards = Array.from(root.querySelectorAll(".expand-card"));

  function setOpen(card, open){
    card.classList.toggle("is-open", open);
    card.setAttribute("aria-expanded", open ? "true" : "false");
    const body = card.querySelector(".expand-body");
    if (body) body.setAttribute("aria-hidden", open ? "false" : "true");
    const hint = card.querySelector(".expand-hint");
    if (hint) hint.textContent = open ? "Click anywhere to collapse" : "Click anywhere to expand";
  }

  function closeAll(except){
    cards.forEach(c => { if (c !== except) setOpen(c, false); });
  }

  function toggle(card){
    const willOpen = !card.classList.contains("is-open");
    if (oneOpen && willOpen) closeAll(card);
    setOpen(card, willOpen);
  }

  // 点击任意处展开（但点到链接/可交互元素不抢事件）
  root.addEventListener("click", (e) => {
    if (e.target.closest("a, button, input, textarea, select, pre, code")) return;
    const card = e.target.closest(".expand-card");
    if (!card) return;
    toggle(card);
  });

  // 键盘可访问性
  root.addEventListener("keydown", (e) => {
    const card = e.target.closest(".expand-card");
    if (!card) return;
    if (e.key === "Enter" || e.key === " "){
      e.preventDefault();
      toggle(card);
    }
    if (e.key === "Escape"){
      setOpen(card, false);
      card.blur();
    }
  });

  // init
  cards.forEach(c => setOpen(c, c.classList.contains("is-open")));
}

window.addEventListener("partials:loaded", () => initExpandCards("#framework-expands", true));
document.addEventListener("DOMContentLoaded", () => initExpandCards("#framework-expands", true));
