/* One Small Light: opt-in delight, keyboard accessible, no tracking or persistence. */
(() => {
  "use strict";
  const hero = document.querySelector(".hero");
  const seed = document.getElementById("light-seed");
  const note = document.getElementById("light-note");
  const close = document.getElementById("light-close");
  if (!hero || !seed || !note || !close) return;

  const setOpen = (open) => {
    hero.classList.toggle("light-awake", open);
    seed.setAttribute("aria-expanded", String(open));
    seed.setAttribute("aria-label", open ? "Let the little light rest" : "Find a little secret in the garden");
    const label = seed.querySelector(".light-seed-label");
    if (label) label.textContent = open ? "A little light, found." : "Psst… a little light";
    note.hidden = !open;
  };

  seed.addEventListener("click", () => setOpen(note.hidden));
  close.addEventListener("click", () => {
    setOpen(false);
    seed.focus({ preventScroll: true });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !note.hidden) {
      setOpen(false);
      seed.focus({ preventScroll: true });
    }
  });

  // A hint of living light near the cursor, never a heavy parallax or scroll trap.
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let frame = 0, pointX = 76, pointY = 37;
    hero.addEventListener("pointermove", (event) => {
      const box = hero.getBoundingClientRect();
      pointX = Math.max(0, Math.min(100, 100 * (event.clientX - box.left) / box.width));
      pointY = Math.max(0, Math.min(100, 100 * (event.clientY - box.top) / box.height));
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        hero.style.setProperty("--little-light-x", pointX.toFixed(1) + "%");
        hero.style.setProperty("--little-light-y", pointY.toFixed(1) + "%");
        frame = 0;
      });
    }, { passive: true });
    hero.addEventListener("pointerleave", () => {
      hero.style.removeProperty("--little-light-x");
      hero.style.removeProperty("--little-light-y");
    });
  }
})();