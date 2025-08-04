const crypto = require('crypto');

// Generate a secure random JWT secret key
const generateJWTSecret = () => {
  // Generate 64 bytes (512 bits) of random data and convert to hex
  const secret = crypto.randomBytes(64).toString('hex');
  return secret;
};

// Generate and display the secret
const jwtSecret = generateJWTSecret();

console.log('🔐 Generated JWT Secret Key:');
console.log('================================');
console.log(jwtSecret);
console.log('================================');
console.log('\n📝 Instructions:');
console.log('1. Copy the secret key above');
console.log('2. Create a .env file in your project root');
console.log('3. Add: JWT_SECRET=' + jwtSecret);
console.log('4. Restart your server');
console.log('\n⚠️  IMPORTANT: Keep this secret secure and never commit it to version control!');