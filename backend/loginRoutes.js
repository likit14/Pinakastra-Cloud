const express = require('express');
const router = express.Router();
const db = require('./db');

router.post('/login', (req, res) => {
  const { id, companyName, password } = req.body;

  const query = 'SELECT * FROM users WHERE id = ? AND companyName = ? AND password = ?';
  db.query(query, [id, companyName, password], (err, results) => {
    if (err) {
      console.error('Error fetching user from database:', err);
      return res.status(500).send('Error logging in');
    }
    if (results.length > 0) {
      res.status(200).send({ success: true, message: 'Login successful' });
    } else {
      res.status(401).send({ success: false, message: 'Invalid credentials' });
    }
  });
});

module.exports = router;
