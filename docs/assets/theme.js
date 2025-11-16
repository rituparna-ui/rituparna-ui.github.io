const STORAGE_KEY = "portfolio-theme";
const THEME_LIGHT = "light";
const THEME_DARK = "dark";

function getStoredTheme() {
  try {
    const storedTheme = localStorage.getItem(STORAGE_KEY);

    if (storedTheme !== THEME_LIGHT && storedTheme !== THEME_DARK) {
      return null;
    }

    return storedTheme;
  } catch (e) {
    console.warn("localStorage unavailable, theme will not persist:", e);
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (e) {
    console.warn("localStorage unavailable, theme will not persist:", e);
  }
}

function applyTheme(theme) {
  const htmlElement = document.documentElement;

  if (theme === THEME_DARK) {
    htmlElement.classList.add("dark");
  } else {
    htmlElement.classList.remove("dark");
  }

  updateToggleButton(theme);

  if (typeof updateParticlesTheme === "function") {
    updateParticlesTheme(theme);
  }
}

function updateToggleButton(theme) {
  const toggleButton = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");

  if (!toggleButton || !themeIcon) {
    return;
  }

  if (theme === THEME_DARK) {
    themeIcon.className = "bi bi-sun-fill";
    toggleButton.setAttribute("aria-pressed", "true");
    toggleButton.setAttribute("aria-label", "Switch to light mode");
  } else {
    themeIcon.className = "bi bi-moon-stars-fill";
    toggleButton.setAttribute("aria-pressed", "false");
    toggleButton.setAttribute("aria-label", "Switch to dark mode");
  }
}

function toggleTheme() {
  const htmlElement = document.documentElement;
  const currentTheme = htmlElement.classList.contains("dark")
    ? THEME_DARK
    : THEME_LIGHT;
  const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;

  applyTheme(newTheme);
  saveTheme(newTheme);
}

function initTheme() {
  const storedTheme = getStoredTheme();
  const theme = storedTheme || THEME_LIGHT;

  applyTheme(theme);
}

initTheme();

document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("theme-toggle");

  if (toggleButton) {
    toggleButton.addEventListener("click", toggleTheme);
  }
});
