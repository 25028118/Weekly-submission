const connection = require('../config/db');

function createUser(username, hashedPassword, name, role, callback) {
  const sql = 'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)';
  connection.query(sql, [username, hashedPassword, name, role], callback);
}

function findByCredentials(username, hashedPassword, callback) {
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(sql, [username, hashedPassword], callback);
}

function getAllUsers(callback) {
  const sql = 'SELECT id, name, username, role FROM users';
  connection.query(sql, callback);
}

function getUserById(userId, callback) {
  const sql = 'SELECT id, name, username, role FROM users WHERE id = ?';
  connection.query(sql, [userId], callback);
}

function deleteUser(userId, callback) {
  const sql = 'DELETE FROM users WHERE id = ?';
  connection.query(sql, [userId], callback);
}

module.exports = {
  createUser,
  findByCredentials,
  getAllUsers,
  getUserById,
  deleteUser
};
