// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { db, initialize } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

initialize();

app.post('/redeem', (req, res) => {
  const { code, userId } = req.body || {};
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, message: 'Código obrigatório' });
  }
  const key = code.trim().toLowerCase();

  db.serialize(() => {
    db.get('SELECT code, cards, used FROM promo_codes WHERE code = ?', [key], (err, row) => {
      if (err) return res.status(500).json({ success: false, message: 'Erro no servidor' });
      if (!row) return res.status(404).json({ success: false, message: 'Código inválido' });
      if (row.used) return res.status(400).json({ success: false, message: 'Código já utilizado' });

      // mark used and insert redemption
      const update = db.prepare('UPDATE promo_codes SET used = 1 WHERE code = ?');
      update.run(key, (uerr) => {
        if (uerr) return res.status(500).json({ success: false, message: 'Erro ao atualizar código' });

        const ins = db.prepare('INSERT INTO redemptions(code, user_id) VALUES(?,?)');
        ins.run(key, userId || null, (ierr) => {
          if (ierr) return res.status(500).json({ success: false, message: 'Erro ao registrar resgate' });
          return res.json({ success: true, cards: row.cards, message: `Sucesso — você recebeu ${row.cards} card${row.cards > 1 ? 's' : ''} dourado${row.cards > 1 ? 's' : ''}.` });
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Promo server running on http://localhost:${PORT}`);
});
