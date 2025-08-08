-- =====================================================
-- Database Connection Test Queries
-- =====================================================

-- Test database connection and basic functionality
USE bookvault;

-- 1. Test user authentication flow
SELECT 'Testing User Authentication...' as Status;

-- Check if users exist
SELECT id, username, email, role FROM users;

-- 2. Test book inventory
SELECT 'Testing Book Inventory...' as Status;

-- Check books with stock
SELECT id, title, author, price, stockQuantity 
FROM books 
WHERE stockQuantity > 0 
ORDER BY title;

-- 3. Test cart functionality
SELECT 'Testing Cart Functionality...' as Status;

-- Sample cart operations (these would normally be done via API)
-- Add item to cart for user ID 2 (testuser)
INSERT IGNORE INTO cart (user_id, book_id, quantity) VALUES (2, 1, 2);
INSERT IGNORE INTO cart (user_id, book_id, quantity) VALUES (2, 3, 1);

-- View cart contents
SELECT 
    c.id as cart_id,
    c.quantity,
    b.title,
    b.author,
    b.price,
    (b.price * c.quantity) as subtotal
FROM cart c
JOIN books b ON c.book_id = b.id
WHERE c.user_id = 2;

-- Calculate cart total
SELECT 
    SUM(b.price * c.quantity) as cart_total
FROM cart c
JOIN books b ON c.book_id = b.id
WHERE c.user_id = 2;

-- 4. Test data integrity
SELECT 'Testing Data Integrity...' as Status;

-- Check foreign key constraints
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'bookvault'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 5. Performance test queries
SELECT 'Performance Test Queries...' as Status;

-- Books by genre
SELECT genre, COUNT(*) as book_count, AVG(price) as avg_price
FROM books
GROUP BY genre
ORDER BY book_count DESC;

-- Most expensive books
SELECT title, author, price
FROM books
ORDER BY price DESC
LIMIT 5;

-- Books with low stock
SELECT title, author, stockQuantity
FROM books
WHERE stockQuantity < 30
ORDER BY stockQuantity ASC;

SELECT 'Database setup and testing completed successfully!' as Result;