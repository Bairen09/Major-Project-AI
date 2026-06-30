const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'NODE_ENV',
  'PORT',
  'CLIENT_URL',
];

const validateEnv = () => {
  const missing = [];

  requiredEnvVars.forEach((key) => {
    if (!process.env[key] || process.env[key].trim() === '') {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error('========================================');
    console.error('  FATAL: Missing environment variables:');
    missing.forEach((key) => console.error(`  - ${key}`));
    console.error('  Check your .env file against .env.example');
    console.error('========================================');
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.error('FATAL: JWT_SECRET must be at least 32 characters');
    process.exit(1);
  }

  console.log('Environment variables validated successfully');
};

module.exports = validateEnv;
