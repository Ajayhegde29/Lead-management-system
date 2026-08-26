const env = require('../config/env');
const User = require('../models/User');

async function bootstrapAdmin() {
  if (!env.bootstrapAdminUsername && !env.bootstrapAdminPassword) return;

  if (!env.bootstrapAdminUsername || !env.bootstrapAdminPassword) {
    throw new Error('BOOTSTRAP_ADMIN_USERNAME and BOOTSTRAP_ADMIN_PASSWORD must be set together');
  }

  const username = env.bootstrapAdminUsername.trim().toLowerCase();
  const existingUser = await User.findOne({ username });
  if (existingUser) return;

  await User.create({
    username,
    password: env.bootstrapAdminPassword,
    role: 'admin',
  });

  console.log(`Bootstrap admin created: ${username}`);
}

module.exports = { bootstrapAdmin };
