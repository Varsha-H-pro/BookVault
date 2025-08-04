const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const { hashPassword, comparePassword, generateToken, authenticateToken } = require('./auth');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',     // your MySQL username
    password: '',     // your MySQL password
    database: 'bookvault'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Database connected!');
    
    // Create users table if it doesn't exist
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    db.query(createUsersTable, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
        } else {
            console.log('Users table ready');
        }
    });
});

// Auth Routes

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        
        // Check if user already exists
        db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Database error' });
            }
            
            if (results.length > 0) {
                return res.status(400).json({ message: 'User already exists with this email or username' });
            }
            
            // Hash password and create user
            const hashedPassword = await hashPassword(password);
            const newUser = { username, email, password: hashedPassword };
            
            db.query('INSERT INTO users SET ?', newUser, (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Failed to create user' });
                }
                
                const token = generateToken(results.insertId);
                res.status(201).json({
                    message: 'User created successfully',
                    token,
                    user: {
                        id: results.insertId,
                        username,
                        email
                    }
                });
            });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login user
app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        // Find user by email
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Database error' });
            }
            
            if (results.length === 0) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            
            const user = results[0];
            const isPasswordValid = await comparePassword(password, user.password);
            
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            
            const token = generateToken(user.id);
            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify token endpoint
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    db.query('SELECT id, username, email FROM users WHERE id = ?', [req.userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ user: results[0] });
    });
});

// Book Routes (now protected)

// GET all books
app.get('/api/books', authenticateToken, (req, res) => {
    db.query('SELECT * FROM books', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// POST a new book (with cover_image support)
app.post('/api/books', authenticateToken, (req, res) => {
    const { title, author, isbn, publicationYear, genre, price, stockQuantity, cover_image } = req.body;
    const book = { title, author, isbn, publicationYear, genre, price, stockQuantity, cover_image };
    
    console.log('Adding book:', book); // For debugging
    
    db.query('INSERT INTO books SET ?', book, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send(err);
        }
        res.status(201).json({ id: results.insertId, ...book });
    });
});

// DELETE a book by ID
app.delete('/api/books/id/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM books WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json({ message: 'Book deleted successfully' });
    });
});

// Update a book by ID
app.put('/api/books/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { title, author, isbn, publicationYear, genre, price, stockQuantity, cover_image } = req.body;
    const book = { title, author, isbn, publicationYear, genre, price, stockQuantity, cover_image };
    db.query('UPDATE books SET ? WHERE id = ?', [book, id], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json({ message: 'Book updated successfully', ...book });
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});