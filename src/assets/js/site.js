const header = document.querySelector("[data-header]");
const toggle = document.querySelector("[data-menu-toggle]");
const panel = document.querySelector("[data-menu-panel]");

function setMenu(open) {
  if (!toggle || !panel) return;
  toggle.setAttribute("aria-expanded", String(open));
  panel.classList.toggle("is-open", open);
  document.body.classList.toggle("nav-open", open);
}

function menuFocusables() {
  if (!toggle || !panel) return [];
  return [toggle, ...panel.querySelectorAll("a[href], button:not([disabled])")];
}

toggle?.addEventListener("click", () => {
  setMenu(toggle.getAttribute("aria-expanded") !== "true");
});

panel?.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && toggle?.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    toggle?.focus();
  }

  if (event.key !== "Tab" || toggle?.getAttribute("aria-expanded") !== "true") return;

  const focusables = menuFocusables();
  const first = focusables[0];
  const last = focusables.at(-1);

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
});

window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 8);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
