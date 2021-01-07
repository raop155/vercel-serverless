const express = require('express');
const crypto = require('crypto');
const Users = require('../models/Users');
const router = express.Router();

router.post('/register', (req, res) => {
  const { email, password } = req.body;
  crypto.randomBytes(16, (err, salt) => {
    const newSalt = salt.toString('base64');
    crypto.pbkdf2(password, newSalt, 10000, 64, 'sha1', (err, key) => {
      const encryptedPassword = key.toString('base64');

      Users.findOne({ email }).then((user) => {
        if (user) {
          return res.send('User already exist');
        }

        Users.create({
          email,
          password: encryptedPassword,
          salt,
          newSalt,
        }).then(() => {
          return res.send('User created successfully');
        });
      });
    });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  Users.findOne({ email }).then((user) => {
    if (!user) {
      return res.send('User or password incorrect');
    }

    crypto.pbkdf2(password, user.salt, 10000, 64, 'sha1', (err, key) => {
      const encryptedPassword = key.toString('base64');
      if (user.password === encryptedPassword) {
        const token = signToken(user._id);
        return res.send({ token });
      }

      return res.send('User or password incorrect');
    });
  });
});

module.exports = router;