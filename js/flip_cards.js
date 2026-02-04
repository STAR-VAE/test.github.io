function initFlipCards(rootSel = "#framework-flips"){
  const root = document.querySelector(rootSel);
  if (!root || root.dataset.inited) return;
  root.dataset.inited = "1";

  const cards = Array.from(root.querySelectorAll(".flip-card"));

  function closeAll(){
    cards.forEach(c => {
      c.classList.remove("is-flipped");
      c.setAttribute("aria-expanded", "false");
    });
  }

  function toggle(card){
    const open = card.classList.toggle("is-flipped");
    card.setAttribute("aria-expanded", open ? "true" : "false");
  }

  root.addEventListener("click", (e) => {
    const closeBtn = e.target.closest(".flip-close");
    if (closeBtn){
      const card = closeBtn.closest(".flip-card");
      card.classList.remove("is-flipped");
      card.setAttribute("aria-expanded", "false");
      e.stopPropagation();
      return;
    }
    const card = e.target.closest(".flip-card");
    if (!card) return;
    toggle(card);
  });

  root.addEventListener("keydown", (e) => {
    const card = e.target.closest(".flip-card");
    if (!card) return;

    if (e.key === "Enter" || e.key === " "){
      e.preventDefault();
      toggle(card);
    }
    if (e.key === "Escape"){
      closeAll();
      card.blur();
    }
  });
}

window.addEventListener("partials:loaded", () => initFlipCards("#framework-flips"));
document.addEventListener("DOMContentLoaded", () => initFlipCards("#framework-flips"));
