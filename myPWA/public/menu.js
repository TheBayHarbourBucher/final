(() => {
    const MODE_TEXT = {
        light: "🌙 Dark Mode",
        dark: "☀️ Light Mode"
    };
    const HOME_PATH = "index.html";

    function updateModeLabels() {
        const isDark = document.body.classList.contains("dark-mode");
        const text = isDark ? MODE_TEXT.dark : MODE_TEXT.light;
        document.querySelectorAll("[data-menu-action=\"mode\"]").forEach(btn => {
            btn.textContent = text;
        });
    }

    function setTheme(isDark) {
        document.body.classList.toggle("dark-mode", isDark);
        localStorage.setItem("theme", isDark ? "dark" : "light");
        updateModeLabels();
    }

    function initTheme() {
        const storedTheme = localStorage.getItem("theme");
        setTheme(storedTheme === "dark");
    }

    function notifyMenuAction(action) {
        const event = new CustomEvent("menu-action", {
            detail: { action },
            cancelable: true
        });
        return document.dispatchEvent(event);
    }

    function handleAction(action) {
        switch (action) {
            case "fav": {
                const notCancelled = notifyMenuAction(action);
                if (notCancelled) {
                    window.location.href = "index.html#favourites";
                }
                break;
            }
            case "cart":
                window.location.href = "cart.html";
                break;
            case "about":
                alert("About this app!");
                break;
            case "mode": {
                const isDark = document.body.classList.contains("dark-mode");
                setTheme(!isDark);
                break;
            }
            default:
                break;
        }
    }

    function goHome() {
        const onHomePage = window.location.pathname.endsWith(HOME_PATH);
        if (onHomePage && !window.location.hash) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        window.location.href = HOME_PATH;
    }

    function initLogoLink() {
        const logo = document.querySelector(".app-name");
        if (!logo) return;

        logo.setAttribute("role", "link");
        logo.setAttribute("tabindex", "0");
        logo.addEventListener("click", goHome);
        logo.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                goHome();
            }
        });
    }

    function initMenuLinks() {
        document.querySelectorAll("[data-menu-action]").forEach(el => {
            el.addEventListener("click", event => {
                const action = el.dataset.menuAction;
                if (!action) return;
                event.preventDefault();
                handleAction(action);
            });
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        initTheme();
        initMenuLinks();
        initLogoLink();
    });
})();
