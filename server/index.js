const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

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
});

// GET all books
app.get('/api/books', (req, res) => {
    db.query('SELECT * FROM books', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// POST a new book (with cover_image support)
app.post('/api/books', (req, res) => {
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
app.delete('/api/books/id/:id', (req, res) => {
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
app.put('/api/books/:id', (req, res) => {
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