// Import htmx
import type htmx from "htmx.org";

// Expose globally (optional)
declare global {
  interface Window {
    htmx: typeof htmx;
  }
}

window.htmx = require('htmx.org');
import { initFetchableButtonsGlobalState, initPasswordToggles, setButtonIdle, setButtonLoading } from './utils';

// Initialize password toggle buttons
initPasswordToggles();
document.body.addEventListener("htmx:afterSwap", (e) => {
  const target = e.target;
  if (target instanceof HTMLElement || target instanceof Document) {
    console.log("htmx:afterSwap event detected, re-initializing password toggles.");
    initPasswordToggles(target);
    initFetchableButtonsGlobalState()
  }
});

document.body.addEventListener("htmx:historyRestore", () => {
  initFetchableButtonsGlobalState();


  const button = document.querySelector<HTMLButtonElement>("#settings-button");
  if (button) {
    console.log("htmx:historyRestore event detected, resetting fetchable button.", button);
    setButtonIdle(button);
  }
});


window.addEventListener("popstate", (event) => {
  console.log("User navigated back or forward", document.querySelector<HTMLButtonElement>("#settings-button"));
  // setButtonIdle();
});


document.addEventListener("DOMContentLoaded", () => {
  initFetchableButtonsGlobalState();

  // User menu handler and data-user-menu state is close by default or user click outside
  const userMenu = document.querySelector("[data-user-menu]");

  userMenu?.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent the click from bubbling to window
    const isOpen = userMenu.getAttribute("data-user-menu") === "open";
    userMenu.setAttribute("data-user-menu", isOpen ? "close" : "open");
  });

  window.addEventListener("click", () => {
    userMenu?.setAttribute("data-user-menu", "close");
  });





});
