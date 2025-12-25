const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;
const JWT_SECRET = 'mySecretKey123456789012345678901234567890';

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection (using SQLite for simplicity)
const db = require('sqlite3').verbose();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create SQLite database
const dbPath = path.join(__dirname, 'quran_memorization.db');
const database = new sqlite3.Database(dbPath);

// Create database tables
database.serialize(() => {
  database.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
  )`);
  
  database.run(`CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_verses INTEGER DEFAULT 0,
    memorized_verses INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0,
    last_study_date TEXT,
    daily_goal INTEGER DEFAULT 3,
    weekly_goal INTEGER DEFAULT 15,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id)
  )`);
  
  database.run(`CREATE TABLE IF NOT EXISTS surah_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    surah_id INTEGER NOT NULL,
    completed BOOLEAN DEFAULT 0,
    completed_date TEXT,
    lines_memorized INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, surah_id)
  )`);
});

// Health check endpoint
app.get('/api/auth/health', (req, res) => {
  res.json({
    status: 'UP',
    message: 'Backend is running',
    database: 'SQLite',
    timestamp: new Date().toISOString()
  });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    
    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    
    // Check if email already exists
    database.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (row) {
        return res.status(400).json({ error: 'Email is already registered' });
      }
      
      // Hash password
      const hashedPassword = bcrypt.hashSync(password, 10);
      
      // Insert user
      database.run(
        'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
        [firstName, lastName, email, hashedPassword],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }
          
          // Generate JWT token
          const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });
          
          res.status(201).json({
            token,
            type: 'Bearer',
            id: this.lastID,
            firstName,
            lastName,
            email,
            fullName: `${firstName} ${lastName}`
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    database.get('SELECT * FROM users WHERE email = ? AND is_active = 1', [email], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Check password
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Generate JWT token
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({
        token,
        type: 'Bearer',
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        fullName: `${user.first_name} ${user.last_name}`
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Token validation endpoint
app.get('/api/auth/validate', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({ valid: true, email: decoded.email });
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Helper function to get user ID from email
const getUserIdFromEmail = (email, callback) => {
  database.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, row ? row.id : null);
    }
  });
};

// Get user progress
app.get('/api/progress', authenticateToken, (req, res) => {
  getUserIdFromEmail(req.userEmail, (err, userId) => {
    if (err || !userId) {
      return res.status(500).json({ error: 'User not found' });
    }
    
    // Get main progress
    database.get('SELECT * FROM user_progress WHERE user_id = ?', [userId], (err, progress) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Get surah progress
      database.all('SELECT * FROM surah_progress WHERE user_id = ?', [userId], (err, surahProgress) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Transform surah progress to object format
        const surahProgressObj = {};
        surahProgress.forEach(sp => {
          surahProgressObj[sp.surah_id] = {
            completed: sp.completed === 1,
            completedDate: sp.completed_date,
            linesMemorized: sp.lines_memorized
          };
        });
        
        const response = {
          totalVerses: progress?.total_verses || 0,
          memorizedVerses: progress?.memorized_verses || 0,
          streak: progress?.streak || 0,
          totalTime: progress?.total_time || 0,
          lastStudyDate: progress?.last_study_date || null,
          dailyGoal: progress?.daily_goal || 3,
          weeklyGoal: progress?.weekly_goal || 15,
          surahProgress: surahProgressObj,
          surahGoals: progress?.surah_goals ? JSON.parse(progress.surah_goals) : {}
        };
        
        res.json(response);
      });
    });
  });
});

// Save user progress
app.post('/api/progress', authenticateToken, (req, res) => {
  getUserIdFromEmail(req.userEmail, (err, userId) => {
    if (err || !userId) {
      return res.status(500).json({ error: 'User not found' });
    }
    
    const {
      totalVerses,
      memorizedVerses,
      streak,
      totalTime,
      lastStudyDate,
      dailyGoal,
      weeklyGoal,
      surahProgress,
      surahGoals
    } = req.body;
    
    // Check if progress exists, then update or insert
    database.get('SELECT id FROM user_progress WHERE user_id = ?', [userId], (err, existing) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const surahGoalsJson = surahGoals ? JSON.stringify(surahGoals) : null;
      
      const sql = existing 
        ? `UPDATE user_progress SET 
             total_verses = ?, memorized_verses = ?, streak = ?, total_time = ?, 
             last_study_date = ?, daily_goal = ?, weekly_goal = ?, surah_goals = ?, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = ?`
        : `INSERT INTO user_progress (user_id, total_verses, memorized_verses, streak, total_time, last_study_date, daily_goal, weekly_goal, surah_goals)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const params = existing
        ? [totalVerses || 0, memorizedVerses || 0, streak || 0, totalTime || 0, lastStudyDate || null, dailyGoal || 3, weeklyGoal || 15, surahGoalsJson, userId]
        : [userId, totalVerses || 0, memorizedVerses || 0, streak || 0, totalTime || 0, lastStudyDate || null, dailyGoal || 3, weeklyGoal || 15, surahGoalsJson];
      
      database.run(sql, params, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to save progress' });
        }
        
        // Update surah progress if provided
        if (surahProgress && typeof surahProgress === 'object') {
          const surahIds = Object.keys(surahProgress);
          let completed = 0;
          let errors = [];
          
          if (surahIds.length === 0) {
            return res.json({ message: 'Progress saved successfully' });
          }
          
          surahIds.forEach((surahId) => {
            const sp = surahProgress[surahId];
            const surahIdInt = parseInt(surahId);
            
            // Check if surah progress exists
            database.get('SELECT id FROM surah_progress WHERE user_id = ? AND surah_id = ?', [userId, surahIdInt], (err, existing) => {
              if (err) {
                errors.push(err);
                completed++;
                if (completed === surahIds.length) {
                  if (errors.length > 0) {
                    console.error('Some surah progress updates failed:', errors);
                  }
                  return res.json({ message: 'Progress saved successfully' });
                }
                return;
              }
              
              const sql = existing
                ? `UPDATE surah_progress SET 
                     completed = ?, completed_date = ?, lines_memorized = ?, updated_at = CURRENT_TIMESTAMP
                   WHERE user_id = ? AND surah_id = ?`
                : `INSERT INTO surah_progress (user_id, surah_id, completed, completed_date, lines_memorized)
                   VALUES (?, ?, ?, ?, ?)`;
              
              const params = existing
                ? [sp.completed ? 1 : 0, sp.completedDate || null, sp.linesMemorized || 0, userId, surahIdInt]
                : [userId, surahIdInt, sp.completed ? 1 : 0, sp.completedDate || null, sp.linesMemorized || 0];
              
              database.run(sql, params, (err) => {
                if (err) errors.push(err);
                completed++;
                if (completed === surahIds.length) {
                  if (errors.length > 0) {
                    console.error('Some surah progress updates failed:', errors);
                  }
                  return res.json({ message: 'Progress saved successfully' });
                }
              });
            });
          });
        } else {
          return res.json({ message: 'Progress saved successfully' });
        }
      });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Express server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/auth/health`);
  console.log(`🗄️ Database: SQLite (quran_memorization.db)`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  database.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});

