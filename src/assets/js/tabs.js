// Team-Profile als Tabs (WAI-ARIA Tabs-Muster). Ohne JavaScript stehen alle Profile untereinander.
(() => {
  const tablist = document.querySelector("[data-tablist]");
  if (!tablist) return;
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));

  panels.forEach((panel, i) => {
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tabs[i].id);
    panel.tabIndex = -1;
  });
  tablist.hidden = false;

  const select = (index, { focusTab = false, focusPanel = false } = {}) => {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
    });
    if (focusTab) tabs[index].focus();
    if (focusPanel) panels[index].focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(i));
    tab.addEventListener("keydown", (event) => {
      const last = tabs.length - 1;
      const map = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last };
      if (event.key in map) {
        event.preventDefault();
        select(map[event.key], { focusTab: true });
      }
    });
  });

  // Links wie "Vorstellung lesen" und "Weiter: …" wählen den passenden Tab.
  document.querySelectorAll("[data-tab-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const index = tabs.findIndex((tab) => tab.getAttribute("aria-controls") === `profil-${link.dataset.tabLink}`);
      if (index < 0) return;
      event.preventDefault();
      select(index);
      document.getElementById("team").scrollIntoView({ block: "start" });
      panels[index].focus({ preventScroll: true });
      history.replaceState(null, "", `#profil-${link.dataset.tabLink}`);
    });
  });

  const fromHash = tabs.findIndex((tab) => `#${tab.getAttribute("aria-controls")}` === location.hash);
  select(fromHash >= 0 ? fromHash : 0);
})();
