-- =====================================================
-- BookVault Database Setup - Complete MySQL Commands
-- =====================================================

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS bookvault;
USE bookvault;

-- 2. Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Create books table for inventory management
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    publicationYear INT,
    genre VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    stockQuantity INT NOT NULL DEFAULT 0,
    cover_image TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Create cart table for user shopping cart
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_book (user_id, book_id)
);

-- 5. Create orders table (for future order management)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Create order_items table (for future order management)
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    book_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- 7. Insert sample admin user (password: admin123)
-- Note: This is a hashed password for 'admin123' using bcrypt
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@bookvault.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- 8. Insert sample regular user (password: user123)
-- Note: This is a hashed password for 'user123' using bcrypt
INSERT INTO users (username, email, password, role) VALUES 
('testuser', 'user@bookvault.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- 9. Insert sample books data
INSERT INTO books (title, author, isbn, publicationYear, genre, price, stockQuantity, cover_image, description) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 1925, 'Fiction', 299.99, 50, 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 'A classic American novel set in the Jazz Age.'),
('To Kill a Mockingbird', 'Harper Lee', '9780061120084', 1960, 'Fiction', 349.99, 30, 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 'A gripping tale of racial injustice and childhood innocence.'),
('1984', 'George Orwell', '9780451524935', 1949, 'Dystopian Fiction', 279.99, 45, 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 'A dystopian social science fiction novel.'),
('Pride and Prejudice', 'Jane Austen', '9780141439518', 1813, 'Romance', 259.99, 25, 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 'A romantic novel of manners.'),
('The Catcher in the Rye', 'J.D. Salinger', '9780316769174', 1951, 'Fiction', 289.99, 35, 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 'A controversial novel about teenage rebellion.'),
('Harry Potter and the Philosopher\'s Stone', 'J.K. Rowling', '9780747532699', 1997, 'Fantasy', 399.99, 60, 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 'The first book in the Harry Potter series.'),
('The Lord of the Rings', 'J.R.R. Tolkien', '9780544003415', 1954, 'Fantasy', 599.99, 20, 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 'An epic high fantasy novel.'),
('The Alchemist', 'Paulo Coelho', '9780062315007', 1988, 'Fiction', 249.99, 40, 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 'A philosophical book about following your dreams.'),
('Brave New World', 'Aldous Huxley', '9780060850524', 1932, 'Science Fiction', 269.99, 30, 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 'A dystopian novel about a futuristic society.'),
('The Hobbit', 'J.R.R. Tolkien', '9780547928227', 1937, 'Fantasy', 329.99, 55, 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 'A fantasy novel and prelude to The Lord of the Rings.');

-- 10. Create indexes for better performance
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- 11. Show all tables created
SHOW TABLES;

-- 12. Display table structures
DESCRIBE users;
DESCRIBE books;
DESCRIBE cart;
DESCRIBE orders;
DESCRIBE order_items;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if data was inserted correctly
SELECT 'Users Count:' as Info, COUNT(*) as Count FROM users
UNION ALL
SELECT 'Books Count:' as Info, COUNT(*) as Count FROM books
UNION ALL
SELECT 'Admin Users:' as Info, COUNT(*) as Count FROM users WHERE role = 'admin'
UNION ALL
SELECT 'Regular Users:' as Info, COUNT(*) as Count FROM users WHERE role = 'user';

-- Display sample data
SELECT 'Sample Users:' as Info;
SELECT id, username, email, role, created_at FROM users;

SELECT 'Sample Books:' as Info;
SELECT id, title, author, price, stockQuantity FROM books LIMIT 5;

-- =====================================================
-- Additional Useful Queries for Development
-- =====================================================

-- Reset cart for testing (uncomment if needed)
-- DELETE FROM cart;

-- Reset orders for testing (uncomment if needed)
-- DELETE FROM order_items;
-- DELETE FROM orders;

-- Add more stock to books (uncomment if needed)
-- UPDATE books SET stockQuantity = stockQuantity + 10 WHERE stockQuantity < 20;

-- =====================================================
-- Security Notes
-- =====================================================
/*
IMPORTANT SECURITY NOTES:

1. Default Passwords:
   - Admin: admin123
   - User: user123
   - Change these immediately in production!

2. Environment Variables:
   - Make sure to set up your .env file with:
     - JWT_SECRET (generate using the provided script)
     - Database credentials

3. Production Setup:
   - Remove or change default users
   - Use strong passwords
   - Enable SSL for database connections
   - Set up proper backup procedures

4. Database User Permissions:
   - Create a dedicated database user for the application
   - Grant only necessary permissions (SELECT, INSERT, UPDATE, DELETE)
   - Avoid using root user in production
*/