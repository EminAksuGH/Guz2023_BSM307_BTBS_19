const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const bcrypt = require('bcrypt');

router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send({ error: 'Error fetching users from the database' });
  }
});

router.post('/', async (req, res) => {
  const { username, mail, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ username, mail, password: hashedPassword });
    res.status(201).send({ message: 'User created successfully', newUser });
  } catch (error) {
    console.error('Error creating a new user:', error);
    res.status(500).send({ error: 'Error creating a new user' });
  }
});

router.put('/:id', async (req, res) => {
  const { username, mail, password } = req.body;
  const userId = req.params.id;

  try {
    let updatedUser;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedUser = await User.update(
        { username, mail, password: hashedPassword },
        { where: { id: userId }, returning: true }
      );
    } else {
      updatedUser = await User.update(
        { username, mail },
        { where: { id: userId }, returning: true }
      );
    }

    if (updatedUser[0] > 0) {
      res.send({ message: 'User information updated successfully', updatedUser: updatedUser[1][0] });
    } else {
      res.status(404).send({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user information:', error);
    res.status(500).send({ error: 'Error updating user information in the database' });
  }
});

router.delete('/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const deletedRows = await User.destroy({ where: { id: userId } });

    if (deletedRows > 0) {
      res.send({ message: 'User deleted successfully' });
    } else {
      res.status(404).send({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send({ error: 'Error deleting user from the database' });
  }
});

module.exports = router;
