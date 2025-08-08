-- =====================================================
-- Create Dedicated Database User for BookVault
-- =====================================================

-- Run these commands as MySQL root user to create a dedicated user for the application

-- 1. Create a dedicated user for the BookVault application
CREATE USER IF NOT EXISTS 'bookvault_user'@'localhost' IDENTIFIED BY 'BookVault2024!';

-- 2. Grant necessary permissions to the bookvault database
GRANT SELECT, INSERT, UPDATE, DELETE ON bookvault.* TO 'bookvault_user'@'localhost';

-- 3. Grant permission to create temporary tables (needed for some operations)
GRANT CREATE TEMPORARY TABLES ON bookvault.* TO 'bookvault_user'@'localhost';

-- 4. Apply the changes
FLUSH PRIVILEGES;

-- 5. Test the new user connection
-- You can test this by connecting with:
-- mysql -u bookvault_user -p bookvault

-- 6. Show granted privileges
SHOW GRANTS FOR 'bookvault_user'@'localhost';

-- =====================================================
-- Update your .env file with these credentials:
-- =====================================================
/*
DB_HOST=localhost
DB_USER=bookvault_user
DB_PASSWORD=BookVault2024!
DB_NAME=bookvault
DB_PORT=3306
*/

-- =====================================================
-- Alternative: If you prefer to use root (NOT recommended for production)
-- =====================================================
/*
For development only, you can use:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_root_password
DB_NAME=bookvault
DB_PORT=3306
*/