const express = require('express');
const { requestToLogin, requestToSignUpUser } = require('../controllers/login');
const { verifyToken } = require('../middlewares');

const router = express.Router();

// signUp route
router.post('/signup', requestToSignUpUser);

// Login route
router.post('/login', requestToLogin);

// Sample protected route
router.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route', userId: req.userId });
});

module.exports = router;
