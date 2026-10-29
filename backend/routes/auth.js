const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { mysqlService } = require('../db/mysql');
const { mongoService } = require('../db/mongo');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'logistics-enterprise-secret-key-2026';

// Register User
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, full_name } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    const existing = await mysqlService.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'User with this email or username already exists' });
    }
    const user = await mysqlService.createUser({ username, email, password, role: role || 'customer', full_name });
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    await mongoService.logActivity(`User registered: ${user.username} (${user.role})`, 'INFO', { userId: user.id });
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await mysqlService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const { password_hash, ...safeUser } = user;
    await mongoService.logActivity(`User logged in: ${safeUser.username} (${safeUser.role})`, 'INFO', { userId: safeUser.id });
    res.json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Current User Info
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await mysqlService.findUserByEmail(decoded.email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
