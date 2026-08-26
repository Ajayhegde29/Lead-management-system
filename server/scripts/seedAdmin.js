const mongoose = require('mongoose');
const { connectDb } = require('../config/db');
const User = require('../models/User');

async function seedAdmin() {
  try {
    await connectDb();

    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists; password was not changed.');
      return;
    }

    // Required assessment credentials. The User model hashes this value before persistence.
    await User.create({
      username: 'admin',
      password: 'Admin@123',
      role: 'admin',
    });

    console.log('Admin user created successfully.');
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin().catch((error) => {
  console.error(`Unable to seed admin user: ${error.message}`);
  process.exitCode = 1;
});
