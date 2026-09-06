// db.js
// Simple SQLite helper. Database file: data/promo.db
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const DB_PATH = path.join(dataDir, 'promo.db');
const db = new sqlite3.Database(DB_PATH);

function initialize() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        code TEXT PRIMARY KEY,
        cards INTEGER NOT NULL,
        used INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS redemptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL,
        user_id TEXT,
        redeemed_at TEXT DEFAULT (datetime('now'))
      )
    `);
  });
}

module.exports = {
  db,
  initialize,
};
