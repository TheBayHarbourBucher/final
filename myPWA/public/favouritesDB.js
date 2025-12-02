let favDB;

// Load or create favourites SQL database
async function loadFavDB() {
    const SQL = await initSqlJs({
        locateFile: file =>
            `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    let stored = localStorage.getItem("favDatabase");

    if (stored) {
        const uints = Uint8Array.from(JSON.parse(stored));
        favDB = new SQL.Database(uints);
    } else {
        favDB = new SQL.Database();

        favDB.run(`
            CREATE TABLE IF NOT EXISTS favourites (
                id INTEGER PRIMARY KEY
            );
        `);

        saveFavDB();
    }
}

// Save favourites DB to localStorage
function saveFavDB() {
    const data = favDB.export();
    localStorage.setItem("favDatabase", JSON.stringify(Array.from(data)));
}


function addFavouriteSQL(foodId) {
    favDB.run(`INSERT OR IGNORE INTO favourites (id) VALUES (${foodId});`);
    saveFavDB();
}

function removeFavouriteSQL(foodId) {
    favDB.run(`DELETE FROM favourites WHERE id=${foodId};`);
    saveFavDB();
}

// Return all favourite IDs
function getFavouritesSQL() {
    const result = favDB.exec(`SELECT id FROM favourites;`);

    if (result.length === 0) return [];

    return result[0].values.map(row => row[0]);
}
