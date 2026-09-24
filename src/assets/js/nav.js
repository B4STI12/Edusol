// Navigation nach dem WAI-ARIA-Disclosure-Muster (ersetzt Bootstrap-JS).
(() => {
  const setOpen = (button, target, open) => {
    button.setAttribute("aria-expanded", String(open));
    target.classList.toggle("show", open);
  };

  const toggles = [...document.querySelectorAll("[data-toggle]")].map((button) => {
    const target = document.getElementById(button.getAttribute("aria-controls"));
    return { button, target, kind: button.dataset.toggle };
  });

  for (const { button, target } of toggles) {
    if (!target) continue;
    button.addEventListener("click", () => {
      setOpen(button, target, button.getAttribute("aria-expanded") !== "true");
    });
  }

  const dropdowns = toggles.filter((t) => t.kind === "dropdown" && t.target);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    for (const { button, target } of dropdowns) {
      if (button.getAttribute("aria-expanded") === "true") {
        setOpen(button, target, false);
        button.focus();
      }
    }
  });

  for (const { button, target } of dropdowns) {
    const container = button.parentElement;
    document.addEventListener("click", (event) => {
      if (!container.contains(event.target)) setOpen(button, target, false);
    });
    container.addEventListener("focusout", (event) => {
      if (event.relatedTarget && !container.contains(event.relatedTarget)) setOpen(button, target, false);
    });
  }
})();
