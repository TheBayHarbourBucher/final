// ------------------------------------------------------------
// 1. Select elements

const container = document.getElementById("the_foods");
const searchBox = document.querySelector(".searchinside");
const searchSection = document.querySelector(".search_bar");
const filterBar = document.querySelector(".filterbar");

let allFoods = [];  // store all foods for filtering
let favourites = []; // store favourite IDs

const MENU_FAV_HASH = "#favourites";

function toggleDiscoverControls(show) {
    [searchSection, filterBar].forEach(section => {
        if (!section) return;
        section.classList.toggle("is-hidden", !show);
    });
}

toggleDiscoverControls(window.location.hash !== MENU_FAV_HASH);

document.addEventListener("menu-action", event => {
    if (!event.detail || event.detail.action !== "fav") return;
    event.preventDefault();
    showFavouriteFoods();
});

function clearFavouriteHash() {
    if (window.location.hash !== MENU_FAV_HASH) return;
    toggleDiscoverControls(true);
    if (window.history && window.history.replaceState) {
        const base = window.location.pathname + window.location.search;
        window.history.replaceState(null, "", base || "index.html");
    } else {
        window.location.hash = "";
    }
}

function showFavouriteFoods() {
    if (!allFoods.length) return;
    favourites = getFavouritesSQL();
    const favFoods = allFoods.filter(food => favourites.includes(food.id));
    showFoods(favFoods);
    toggleDiscoverControls(false);
    if (window.location.hash !== MENU_FAV_HASH) {
        window.location.hash = MENU_FAV_HASH;
    }
}

window.addEventListener("hashchange", () => {
    if (window.location.hash === MENU_FAV_HASH) {
        showFavouriteFoods();
    } else {
        toggleDiscoverControls(true);
        if (!searchBox.value) {
            showFoods(allFoods);
        }
    }
});


fetch("data/foods.json")
    .then(response => response.json())
    .then(function (foods) {

        allFoods = foods;

// Load SQL favourites before showing foods
loadFavDB().then(() => {
    favourites = getFavouritesSQL();
    showFoods(allFoods);
    if (window.location.hash === MENU_FAV_HASH) {
        showFavouriteFoods();
    }
});


    })
    .catch(error => {
        console.error("Error loading foods:", error);
        container.innerHTML = "<p>Could not load foods.</p>";
    });


// ------------------------------------------------------------
// 3. Function to show foods (YOUR CARD DESIGN)
// ------------------------------------------------------------
function showFoods(list) {
    container.innerHTML = "";

    for (let i = 0; i < list.length; i++) {
        const food = list[i];

        const card = document.createElement("article");
        card.className = "foodcard";
 // <div class="rating-badge">⭐ ${food.rating || ""}</div>//
card.innerHTML = `
    <a href="disc.html?id=${food.id}" class="card-link">
        <div class="image-wrapper">
            <img src="${food.image}" class="foodpic">
            <button class="card-heart" aria-label="Toggle favourite">
                <svg class="heart-svg" title="Like Bag2 SVG File" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path class="heart-path" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </button>
           

            
        </div>

        <div class="foodstuff">
            <h2 class="food-title">${food.name}</h2>
            <p class="fooddisc">${food.description}</p>

            <div class="foodstats">
                <span>${food.calories} Calories</span>
                <span>${food.time}</span>
                <span>${food.difficulty}</span>
            </div>
        </div>
    </a>
`;


        container.appendChild(card);

        // ---------------------------
        // FAVOURITE BUTTON LOGIC
        // ---------------------------
        // ---------------------------
// FAVOURITE BUTTON (SQL)
// ---------------------------
let heart = card.querySelector(".card-heart");

const setHeartState = (isFav) => {
    heart.classList.toggle("active", isFav);
    heart.setAttribute("aria-pressed", String(isFav));
};

// highlight heart if this food ID is inside SQL favourites
setHeartState(favourites.includes(food.id));

heart.addEventListener("click", function(event) {
    event.preventDefault(); // stop the link from opening

    if (favourites.includes(food.id)) {
        // REMOVE from SQL favourites
        removeFavouriteSQL(food.id);

        // update JS list from SQL
        favourites = getFavouritesSQL();

        // update heart icon
        setHeartState(false);

    } else {
        // ADD to SQL favourites
        addFavouriteSQL(food.id);

        // update JS list from SQL
        favourites = getFavouritesSQL();

        // update heart icon
        setHeartState(true);
    }
});
    }
}


searchBox.addEventListener("input", function () {
    clearFavouriteHash();
    const text = searchBox.value.toLowerCase();

    const filteredFoods = allFoods.filter(function(food) {
        return food.name.toLowerCase().includes(text);
    });

    showFoods(filteredFoods);
});

function filterFoods(type) {
    clearFavouriteHash();
    let filteredList = [];

    for (let i = 0; i < allFoods.length; i++) {
        let food = allFoods[i];

        if (type === "all") {
            filteredList.push(food);
        }
        else {
            if (food.tags && food.tags[0] === type) {
                filteredList.push(food);
            }
        }
    }

    showFoods(filteredList);
}


// 6. filter buttons
const buttons = document.querySelectorAll(".filterbtn");

buttons.forEach(btn => {
    btn.addEventListener("click", function () {
        buttons.forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        let text = this.textContent.toLowerCase();
        filterFoods(text);
    });
});
const menuBtn = document.getElementById("menu-btn");
const dropdown = document.getElementById("dropdown-menu");

menuBtn.addEventListener("click", function () {
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "block";
    }
});

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
    if (!event.target.closest(".dropdown")) {
        dropdown.style.display = "none";
    }
});
const button = document.querySelectorAll(".filterbtn");

for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
        let text = this.textContent.toLowerCase();
        filterFoods(text);
    });
}


