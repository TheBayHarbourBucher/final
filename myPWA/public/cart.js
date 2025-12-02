const backBtn = document.querySelector(".nav-back");
if (backBtn) {
    backBtn.addEventListener("click", () => {
        window.history.back();
    });
}


async function loadDB() {
    const SQL = await initSqlJs({
        locateFile: file =>
            `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    let stored = localStorage.getItem("foodcartDB");

    if (stored) {
        db = new SQL.Database(
            Uint8Array.from(atob(stored), c => c.charCodeAt(0))
        );
    } else {
        db = new SQL.Database();
        db.run(`
            CREATE TABLE IF NOT EXISTS cart_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ingredient_name TEXT,
                ingredient_image TEXT,
                food_name TEXT,
                quantity INTEGER
            );
        `);
        saveDB();
    }

    ensureCartSchema();
}



function saveDB() {
    const data = db.export();
    localStorage.setItem(
        "foodcartDB",
        btoa(String.fromCharCode(...data))
    );
}



function ensureCartSchema() {
    if (!db) return;

    const info = db.exec("PRAGMA table_info(cart_items);");
    if (!info.length) return;

    const hasImageColumn = info[0].values.some(
        column => column[1] === "ingredient_image"
    );

    if (!hasImageColumn) {
        db.run("ALTER TABLE cart_items ADD COLUMN ingredient_image TEXT;");
        saveDB();
    }
}


const FALLBACK_ING_IMAGE = "images/yumly-logo.png";



function buildCartItem({ name, food, qty, image }) {
    const item = document.createElement("div");
    item.className = "cart-item";

    const img = document.createElement("img");
    img.className = "cart-img";
    img.alt = name;

    const applyFallback = () => {
        if (img.dataset.fallbackApplied === "1") return;
        img.dataset.fallbackApplied = "1";
        img.src = FALLBACK_ING_IMAGE;
    };

    if (image && image.trim()) {
        img.src = image;
        img.addEventListener("error", applyFallback);
    } else {
        img.src = FALLBACK_ING_IMAGE;
    }

    const info = document.createElement("div");
    info.className = "cart-info";

    const title = document.createElement("h3");
    title.textContent = name;

    const origin = document.createElement("p");
    origin.textContent = `From: ${food}`;

    info.appendChild(title);
    info.appendChild(origin);

    const quantity = document.createElement("div");
    quantity.className = "cart-qty";
    quantity.textContent = `x${qty}`;

    item.appendChild(img);
    item.appendChild(info);
    item.appendChild(quantity);

    return item;
}



async function showCart() {
    await loadDB();

    const result = db.exec(`
        SELECT ingredient_name, ingredient_image, food_name, SUM(quantity) AS qty
        FROM cart_items
        GROUP BY ingredient_name, ingredient_image, food_name;
    `);

    const container = document.getElementById("cart-list");

    if (!result.length) {
        container.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    const rows = result[0].values;
    container.innerHTML = "";

    rows.forEach(row => {
        const name = row[0];
        const image = row[1] || "";
        const food = row[2];
        const qty = row[3];

        const item = buildCartItem({ name, food, qty, image });
        container.appendChild(item);
    });
}




async function clearCart() {
    await loadDB();
    db.run("DELETE FROM cart_items;");
    saveDB();

    document.getElementById("cart-list").innerHTML =
        "<p>Your cart is empty.</p>";

    alert("Cart cleared!");
}



document.addEventListener("DOMContentLoaded", showCart);
