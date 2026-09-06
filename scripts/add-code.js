// scripts/add-code.js
// Usage: node scripts/add-code.js <code> <cards>
const { db, initialize } = require('../db');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node scripts/add-code.js <code> <cards>');
  process.exit(1);
}
const [code, cardsRaw] = args;
const cards = parseInt(cardsRaw, 10);
if (!code || Number.isNaN(cards)) {
  console.error('Invalid args. Example: node scripts/add-code.js luceroluli 12');
  process.exit(1);
}

initialize();

db.serialize(() => {
  const stmt = db.prepare('INSERT OR REPLACE INTO promo_codes(code, cards, used) VALUES(?,?,0)');
  stmt.run(code.trim().toLowerCase(), cards, function(err) {
    if (err) {
      console.error('Error inserting code:', err.message);
      process.exit(1);
    }
    console.log(`Inserted/updated code "${code}" -> ${cards} cards`);
    stmt.finalize(() => process.exit(0));
  });
});
