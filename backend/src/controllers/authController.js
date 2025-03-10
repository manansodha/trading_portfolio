const db = require('../utils/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');


const applyAdjustments = async (username) => {
  try {
      const adjustments = await db.execute(`SELECT * FROM stock_adjustments`);
      console.log('Adjustments:', adjustments);

      for (let adj of adjustments) {
          // Check if this adjustment was already applied
          const exists = await db.execute(
              `SELECT * FROM user_adjustments_applied WHERE username = ? AND adjustment_id = ?`,
              [username, adj.id]
          );

          if (exists.length > 0) {
              console.log(`Adjustment ${adj.id} already applied for ${username}`);
              continue; // Skip if already applied
          }

          if (adj.new_symbol) {
              await db.execute(
                  `UPDATE portfolio_${username} SET symbol = ? WHERE symbol = ?`,
                  [adj.new_symbol, adj.symbol]
              );
          }

          if (adj.split_ratio) {
              await db.execute(
                  `UPDATE portfolio_${username} 
                  SET quantity = quantity * ?, average_price = average_price / ? 
                  WHERE symbol = ? AND date < ?`,
                  [adj.split_ratio, adj.split_ratio, adj.symbol, adj.date]
              );
          }

          if (adj.bonus_ratio) {
            await db.execute(
                `UPDATE portfolio_${username} 
                SET 
                    quantity = quantity * (1 + ?),  
                    average_price = average_price / (1 + ?)  
                WHERE symbol = ? AND date < ?`,
                [adj.bonus_ratio, adj.bonus_ratio, adj.symbol, adj.date] 
            );
        }        

          // Mark adjustment as applied
          await db.execute(
              `INSERT INTO user_adjustments_applied (username, adjustment_id) VALUES (?, ?)`,
              [username, adj.id]
          );
      }
  } catch (error) {
      console.error("Error applying stock adjustments:", error);
  }
};


exports.login = async (req, res) => {
  const { username, password } = req.body;
  // console.log('Login request received:', req.body);

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const rows = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    
    // console.log('DB Query Result:', rows); 

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = rows[0]; 

    // console.log('Fetched user:', user); 

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, fname: user.f_name },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );
    console.log('Hello')
    applyAdjustments(username);
    res.json({token, user: { id: user.id, username: user.username, fname: user.f_name, role:user.role } });
  } catch (error) {

    res.status(500).json({ error: 'Internal server error' });
  }
};



function generateUserId() {
    const prefix = "USR";
    const randomStr = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}${randomStr}`;
}


exports.register = async (req, res) => {
  const { fname, lname, username, password } = req.body;

  try {
    // Generate a unique user ID
    const userId = generateUserId();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    await db.execute(
      'INSERT INTO users (id, f_name, l_name, username, password) VALUES (?, ?, ?, ?, ?)',
      [userId, fname, lname, username, hashedPassword]
    );

    const tableName = `portfolio_${username}`;
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS ${tableName} (
                trade_id INT PRIMARY KEY,
                date DATE NOT NULL,
                symbol VARCHAR(100) NOT NULL,
                trade_type ENUM('buy', 'sell') NOT NULL,
                quantity INT DEFAULT 0,
                average_price DECIMAL(10,2) DEFAULT 0.00
            )
        `;
    await db.execute(createTableQuery);

    const tableName2 = `dividend_${username}`;
        const createTableQuery2 = `
            CREATE TABLE IF NOT EXISTS ${tableName2} (
                id INT AUTO_INCREMENT,
                date DATE NOT NULL,
                symbol VARCHAR(100) NOT NULL,
                trade_type NOT NULL default 'dividend',
                quantity INT DEFAULT 0,
                dividend_per_share DECIMAL(10,2) DEFAULT 0.00,
                Primary Key (date, symbol, dividend_per_share)
            )
        `;
    await db.execute(createTableQuery2);
    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username already taken. Please choose a different one.' });
    }

    res.status(500).json({ error: 'Registration failed due to a server error.' });
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logout successful' });
};