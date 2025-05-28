const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', verifyToken, isAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role: role || 'user' });
    await newUser.save();

    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  const { name, email, role } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'Usuário não encontrado' });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'Usuário não encontrado' });

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;