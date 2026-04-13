[save.js](https://github.com/user-attachments/files/26665339/save.js)

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database
const db = new sqlite3.Database('./dreamery.db');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS shops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id INTEGER,
    name TEXT,
    phone TEXT,
    service TEXT,
    time TEXT
  )`);
});

// Register
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  db.run(
    `INSERT INTO shops (name, email, password) VALUES (?, ?, ?)`,
    [name, email, password],
    function (err) {
      if (err) return res.send(err);
      res.send({ id: this.lastID });
    }
  );
});

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get(
    `SELECT * FROM shops WHERE email=? AND password=?`,
    [email, password],
    (err, row) => {
      if (row) res.send(row);
      else res.status(401).send('Sai tài khoản');
    }
  );
});

// Add booking
app.post('/booking', (req, res) => {
  const { shop_id, name, phone, service, time } = req.body;

  db.run(
    `INSERT INTO bookings (shop_id, name, phone, service, time)
     VALUES (?, ?, ?, ?, ?)`,
    [shop_id, name, phone, service, time],
    function (err) {
      if (err) return res.send(err);
      res.send({ success: true });
    }
  );
});

// Get bookings
app.get('/bookings/:shop_id', (req, res) => {
  db.all(
    `SELECT * FROM bookings WHERE shop_id=?`,
    [req.params.shop_id],
    (err, rows) => {
      res.send(rows);
    }
  );
});

// PORT (QUAN TRỌNG khi deploy)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
