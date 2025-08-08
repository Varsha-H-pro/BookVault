# 🗄️ BookVault Database Setup Guide

## 📋 Prerequisites
- MySQL Server 5.7+ or 8.0+
- MySQL client or phpMyAdmin
- Administrative access to MySQL

## 🚀 Quick Setup Instructions

### Step 1: Run the Main Database Setup
```bash
# Connect to MySQL as root
mysql -u root -p

# Run the main setup script
source database-setup.sql
```

### Step 2: Create Dedicated Database User (Recommended)
```bash
# Still connected as root, run:
source create-database-user.sql
```

### Step 3: Test the Setup
```bash
# Test with the new user
mysql -u bookvault_user -p bookvault

# Run test queries
source database-connection-test.sql
```

### Step 4: Update Your Application Configuration
Update your `server/index.js` database connection:

```javascript
const db = mysql.createConnection({
    host: 'localhost',
    user: 'bookvault_user',        // Use the dedicated user
    password: 'BookVault2024!',    // Use the secure password
    database: 'bookvault'
});
```

## 📊 Database Structure

### Tables Created:
1. **users** - User authentication and roles
2. **books** - Book inventory management
3. **cart** - User shopping cart
4. **orders** - Order management (for future use)
5. **order_items** - Order details (for future use)

### Default Users Created:
- **Admin User**: 
  - Email: `admin@bookvault.com`
  - Password: `admin123`
  - Role: `admin`

- **Test User**: 
  - Email: `user@bookvault.com`
  - Password: `user123`
  - Role: `user`

### Sample Books:
- 10 popular books with stock and pricing
- Includes classics like "The Great Gatsby", "1984", "Harry Potter", etc.

## 🔧 Manual Setup (Alternative)

If you prefer to run commands manually:

### 1. Create Database
```sql
CREATE DATABASE bookvault;
USE bookvault;
```

### 2. Create Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Create Books Table
```sql
CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    publicationYear INT,
    genre VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    stockQuantity INT NOT NULL DEFAULT 0,
    cover_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Create Cart Table
```sql
CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_book (user_id, book_id)
);
```

## 🔐 Security Considerations

### Production Setup:
1. **Change Default Passwords**: Update admin and test user passwords
2. **Use Environment Variables**: Store database credentials in `.env` file
3. **Create Dedicated User**: Don't use root user for application
4. **Enable SSL**: Use SSL connections for database
5. **Regular Backups**: Set up automated database backups

### Environment Variables (.env):
```env
# Database Configuration
DB_HOST=localhost
DB_USER=bookvault_user
DB_PASSWORD=BookVault2024!
DB_NAME=bookvault
DB_PORT=3306

# JWT Secret (generate using generate-jwt-secret.js)
JWT_SECRET=your_generated_jwt_secret_here
```

## 🧪 Testing the Setup

### Verify Tables:
```sql
SHOW TABLES;
DESCRIBE users;
DESCRIBE books;
DESCRIBE cart;
```

### Test Data:
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM books;
SELECT title, price, stockQuantity FROM books LIMIT 5;
```

### Test Authentication:
```sql
SELECT id, username, email, role FROM users WHERE role = 'admin';
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Connection Refused**:
   - Check if MySQL service is running
   - Verify port 3306 is open

2. **Access Denied**:
   - Check username/password
   - Verify user permissions

3. **Database Not Found**:
   - Ensure database was created successfully
   - Check database name spelling

4. **Foreign Key Constraints**:
   - Ensure parent tables exist before creating child tables
   - Check referential integrity

### Reset Database:
```sql
DROP DATABASE IF EXISTS bookvault;
-- Then run the setup script again
```

## 📞 Support

If you encounter any issues:
1. Check MySQL error logs
2. Verify all prerequisites are met
3. Ensure proper permissions are set
4. Test connection with MySQL client first

---

**Note**: Remember to change default passwords and secure your database before deploying to production!