const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database("./.database/datasource.db");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.post("/add-review", (req, res) => {
  const { food_id, rating, comment } = req.body;
  const sql = `INSERT INTO reviews (food_id, rating, comment) VALUES (?, ?, ?)`;

  db.run(sql, [food_id, rating, comment], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.get("/reviews/:foodId", (req, res) => {
  const sql = `SELECT rating, comment, created_at 
               FROM reviews 
               WHERE food_id = ? 
               ORDER BY id DESC`;

  db.all(sql, [req.params.foodId], (err, rows) => {
    if (err) return res.json([]);
    res.json(rows);
  });
});

app.listen(8000, () => {
  console.log(`Server running at: http://localhost:8000`);
});
