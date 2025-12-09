
let db;

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
    localStorage.setItem("foodcartDB", btoa(String.fromCharCode(...data)));
}

function ensureCartSchema() {
    if (!db) return;
    const info = db.exec("PRAGMA table_info(cart_items);");
    if (!info.length) return;

    const hasImageColumn = info[0].values.some(column => column[1] === "ingredient_image");

    if (!hasImageColumn) {
        db.run("ALTER TABLE cart_items ADD COLUMN ingredient_image TEXT;");
        saveDB();
    }
}


const urlParams = new URLSearchParams(window.location.search);
const foodId = urlParams.get("id");

// MATCHES YOUR HTML:
const title = document.querySelector(".overlay-title");
const descBox = document.querySelector(".overlay-desc");
const mainImage = document.querySelector(".detailpic");

const caloriesBox = document.getElementById("stat-calories");
const timeBox = document.getElementById("stat-time");
const diffBox = document.getElementById("stat-difficulty");

const ingredientList = document.querySelector(".ingredients ul");
const methodList = document.querySelector(".method ol");
const addCartBtn = document.querySelector(".addcartbtn");
const cartPopup = document.getElementById("cart-popup");
const viewCartBtn = cartPopup ? cartPopup.querySelector(".view-cart-btn") : null;
const continueBtn = cartPopup ? cartPopup.querySelector(".continue-btn") : null;

const backBtn = document.querySelector(".nav-back");
const favBtn = document.querySelector(".nav-heart");
const numericFoodId = Number(foodId);
let favouriteIds = [];
let popupTimeoutId;

function updateHeartState() {
    if (!favBtn || Number.isNaN(numericFoodId)) return;
    const isFavourite = favouriteIds.includes(numericFoodId);
    favBtn.classList.toggle("active", isFavourite);
    favBtn.setAttribute("aria-pressed", String(isFavourite));
}

const favDBReady = loadFavDB().then(() => {
    favouriteIds = getFavouritesSQL();
    updateHeartState();
});

function hideCartPopup() {
    if (!cartPopup) return;
    cartPopup.classList.remove("active");
    cartPopup.setAttribute("aria-hidden", "true");
    if (popupTimeoutId) {
        clearTimeout(popupTimeoutId);
        popupTimeoutId = null;
    }
}

function showCartPopup() {
    if (!cartPopup) return;
    cartPopup.classList.add("active");
    cartPopup.setAttribute("aria-hidden", "false");
    if (popupTimeoutId) {
        clearTimeout(popupTimeoutId);
    }
    popupTimeoutId = setTimeout(() => {
        hideCartPopup();
    }, 4000);
}
 
if (continueBtn) {
    continueBtn.addEventListener("click", () => {
        hideCartPopup();
    });
}

if (viewCartBtn) {
    viewCartBtn.addEventListener("click", () => {
        window.location.href = "cart.html";
    });
}

if (cartPopup) {
    cartPopup.addEventListener("click", event => {
        if (event.target === cartPopup) {
            hideCartPopup();
        }
    });
}


fetch("data/foods.json")
    .then(res => res.json())
    .then(async foods => {
        await loadDB();

        const selectedFood = foods.find(f => f.id == foodId);

        if (!selectedFood) {
            title.textContent = "Not found";
            return;
        }

        // Banner text + image
        title.textContent = selectedFood.name;
        descBox.textContent = selectedFood.description;
        mainImage.src = selectedFood.image;

        // Stats
        caloriesBox.textContent = selectedFood.calories + " Calories";
        timeBox.textContent = selectedFood.time;
        diffBox.textContent = selectedFood.difficulty;

        // Ingredients
        ingredientList.innerHTML = "";
        selectedFood.ingredients.forEach(ing => {
            const name = ing.name || ing;
            const amount = ing.amount || "";

            const li = document.createElement("li");
            li.innerHTML = `
                <div class="ing-left">
                    <input type="checkbox" class="ing-checkbox">
                    <span>${name}</span>
                </div>
                ${amount ? `<span class="ing-amount">${amount}</span>` : ""}
            `;
            ingredientList.appendChild(li);
        });

        // Method steps
        methodList.innerHTML = "";
selectedFood.method.forEach((step, i) => {
    const li = document.createElement("li");
    li.classList.add("method-step");

    li.innerHTML = `
        <div class="step-badge">${i + 1}</div>
        <p class="step-text">${step}</p>
    `;

    methodList.appendChild(li);
});

 
        addCartBtn.addEventListener("click", () => {
            const checkboxes = document.querySelectorAll(".ingredients ul li input");

            const insert = db.prepare(`
                INSERT INTO cart_items (ingredient_name, ingredient_image, food_name, quantity)
                VALUES (?, ?, ?, ?)
            `);

            let addedCount = 0;
            checkboxes.forEach((cb, index) => {
                if (cb.checked) {
                    const ing = selectedFood.ingredients[index];
                    const ingName = ing && typeof ing === "object" ? ing.name || "" : ing;
                    const ingImage = ing && typeof ing === "object" ? ing.image || "" : "";
                    const name = ingName || "Unknown";

                    insert.run([name, ingImage, selectedFood.name, 1]);
                    addedCount++;
                }
            });

            insert.free();
            saveDB();

            if (addedCount > 0) {
                showCartPopup();
            } else {
                alert("Please select at least one ingredient.");
            }
        });
    })
    .catch(err => {
        console.error("Error loading food:", err);
        title.textContent = "Could not load food details.";
    });

// BACK BUTTON
backBtn.addEventListener("click", () => {
    window.history.back();
});

if (favBtn) {
    favBtn.addEventListener("click", async () => {
        if (Number.isNaN(numericFoodId)) return;
        await favDBReady;

        if (favouriteIds.includes(numericFoodId)) {
            removeFavouriteSQL(numericFoodId);
        } else {
            addFavouriteSQL(numericFoodId);
        }

        favouriteIds = getFavouritesSQL();
        updateHeartState();
    });
}
