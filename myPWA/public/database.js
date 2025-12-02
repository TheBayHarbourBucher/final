let db;

// Load or create SQL database
async function loadDatabase() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    let stored = localStorage.getItem("cartDatabase");

    if (stored) {
        // load existing database from localStorage
        const uints = Uint8Array.from(JSON.parse(stored));
        db = new SQL.Database(uints);
    } else {
        // create new database
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

        saveDatabase();
    }
}

// Save DB to localStorage
function saveDatabase() {
    const data = db.export();
    localStorage.setItem("cartDatabase", JSON.stringify(Array.from(data)));
}