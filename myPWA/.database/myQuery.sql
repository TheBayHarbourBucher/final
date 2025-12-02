-- Cart item table
CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ingredient_name TEXT,
    ingredient_image TEXT,
    food_name TEXT,
    quantity INTEGER
);
-- favourites
CREATE TABLE IF NOT EXISTS favourites (
    id INTEGER PRIMARY KEY
);


SELECT ingredient_name, ingredient_image, food_name, SUM(quantity) AS qty
FROM cart_items
GROUP BY ingredient_name, ingredient_image, food_name;


SELECT id FROM favourites;
DELETE FROM cart_items;
INSERT OR IGNORE INTO favourites (id) VALUES (?);
DELETE FROM favourites WHERE id = ?;
