// backend/src/models/User.js
const db = require('../utils/db');
const bcrypt = require('bcrypt');

class User {
  constructor(data) {
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
  }

  static async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [result] = await db.execute(
      'INSERT INTO users SET ?',
      { ...userData, password: hashedPassword }
    );
    return result.insertId;
  }

  static async findByUsername(username) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;