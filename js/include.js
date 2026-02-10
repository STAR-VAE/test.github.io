// js/include.js
async function includePartials() {
  const nodes = document.querySelectorAll("[data-include]");
  await Promise.all([...nodes].map(async (el) => {
    const url = el.getAttribute("data-include");
    const res = await fetch(url);
    el.outerHTML = res.ok
      ? await res.text()
      : `<div style="color:#b91c1c">Failed to load: ${url}</div>`;
  }));

  // 通知：partials 都插入完成了
  window.dispatchEvent(new Event("partials:loaded"));

  // 让 MathJax 渲染新插入的公式
  if (window.MathJax?.typesetPromise) {
    await window.MathJax.typesetPromise();
  }
}

includePartials();
