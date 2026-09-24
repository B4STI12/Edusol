// Navigation nach dem WAI-ARIA-Disclosure-Muster: Hamburger-Menü und Mega-Menü.
(() => {
  document.documentElement.classList.add("js");

  const navToggle = document.querySelector('[data-toggle="nav"]');
  const nav = navToggle && document.getElementById(navToggle.getAttribute("aria-controls"));
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      navToggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    });
  }

  const menuItem = document.querySelector("[data-menu]");
  const menuButton = menuItem?.querySelector('[data-toggle="menu"]');
  const menu = menuButton && document.getElementById(menuButton.getAttribute("aria-controls"));
  if (!menuItem || !menuButton || !menu) return;

  const setMenu = (open) => {
    menuButton.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
  };

  menuButton.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      menuButton.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!menuItem.contains(event.target)) setMenu(false);
  });

  menuItem.addEventListener("focusout", (event) => {
    if (event.relatedTarget && !menuItem.contains(event.relatedTarget)) setMenu(false);
  });
})();
