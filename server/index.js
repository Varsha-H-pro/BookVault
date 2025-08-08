const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const { hashPassword, comparePassword, generateToken, authenticateToken } = require('./auth');
require('dotenv').config();

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
            role ENUM('admin', 'user') DEFAULT 'user',
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
    
    // Create cart table for users
    const createCartTable = `
        CREATE TABLE IF NOT EXISTS cart (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            book_id INT NOT NULL,
            quantity INT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
            UNIQUE KEY unique_user_book (user_id, book_id)
        )
    `;
    
    db.query(createCartTable, (err) => {
        if (err) {
            console.error('Error creating cart table:', err);
        } else {
            console.log('Cart table ready');
        }
    });
});

// Auth Routes

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, role = 'user' } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        
        // Validate role
        if (role && !['admin', 'user'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified' });
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
            const newUser = { username, email, password: hashedPassword, role };
            
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
                        email,
                        role
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
                    email: user.email,
                    role: user.role
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
    db.query('SELECT id, username, email, role FROM users WHERE id = ?', [req.userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ user: results[0] });
    });
});

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    db.query('SELECT role FROM users WHERE id = ?', [req.userId], (err, results) => {
        if (err || results.length === 0 || results[0].role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        next();
    });
};

// Book Routes (now protected)

// GET all books
app.get('/api/books', authenticateToken, (req, res) => {
    db.query('SELECT * FROM books', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// POST a new book (with cover_image support)
app.post('/api/books', authenticateToken, requireAdmin, (req, res) => {
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
app.delete('/api/books/id/:id', authenticateToken, requireAdmin, (req, res) => {
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
app.put('/api/books/:id', authenticateToken, requireAdmin, (req, res) => {
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

// Cart Routes (for users)

// GET user's cart
app.get('/api/cart', authenticateToken, (req, res) => {
    const query = `
        SELECT c.id as cart_id, c.quantity, c.created_at,
               b.id, b.title, b.author, b.price, b.cover_image, b.stockQuantity
        FROM cart c
        JOIN books b ON c.book_id = b.id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
    `;
    
    db.query(query, [req.userId], (err, results) => {
        if (err) {
            console.error('Error fetching cart:', err);
            return res.status(500).json({ message: 'Failed to fetch cart' });
        }
        res.json(results);
    });
});

// ADD item to cart
app.post('/api/cart', authenticateToken, (req, res) => {
    const { book_id, quantity = 1 } = req.body;
    
    if (!book_id) {
        return res.status(400).json({ message: 'Book ID is required' });
    }
    
    // Check if book exists and has stock
    db.query('SELECT * FROM books WHERE id = ?', [book_id], (err, bookResults) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        
        if (bookResults.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        
        const book = bookResults[0];
        if (book.stockQuantity < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }
        
        // Check if item already exists in cart
        db.query('SELECT * FROM cart WHERE user_id = ? AND book_id = ?', [req.userId, book_id], (err, cartResults) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }
            
            if (cartResults.length > 0) {
                // Update existing cart item
                const newQuantity = cartResults[0].quantity + quantity;
                if (newQuantity > book.stockQuantity) {
                    return res.status(400).json({ message: 'Insufficient stock for requested quantity' });
                }
                
                db.query('UPDATE cart SET quantity = ? WHERE user_id = ? AND book_id = ?', 
                    [newQuantity, req.userId, book_id], (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Failed to update cart' });
                    }
                    res.json({ message: 'Cart updated successfully' });
                });
            } else {
                // Add new cart item
                db.query('INSERT INTO cart (user_id, book_id, quantity) VALUES (?, ?, ?)', 
                    [req.userId, book_id, quantity], (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Failed to add to cart' });
                    }
                    res.status(201).json({ message: 'Item added to cart successfully' });
                });
            }
        });
    });
});

// REMOVE item from cart
app.delete('/api/cart/:cart_id', authenticateToken, (req, res) => {
    const { cart_id } = req.params;
    
    db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [cart_id, req.userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to remove item from cart' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        
        res.json({ message: 'Item removed from cart successfully' });
    });
});

// UPDATE cart item quantity
app.put('/api/cart/:cart_id', authenticateToken, (req, res) => {
    const { cart_id } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
        return res.status(400).json({ message: 'Valid quantity is required' });
    }
    
    // Get cart item and check stock
    const query = `
        SELECT c.*, b.stockQuantity 
        FROM cart c 
        JOIN books b ON c.book_id = b.id 
        WHERE c.id = ? AND c.user_id = ?
    `;
    
    db.query(query, [cart_id, req.userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        
        const cartItem = results[0];
        if (quantity > cartItem.stockQuantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }
        
        db.query('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', 
            [quantity, cart_id, req.userId], (err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to update cart' });
            }
            res.json({ message: 'Cart updated successfully' });
        });
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});