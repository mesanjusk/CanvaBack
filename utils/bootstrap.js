const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function bootstrapSuperAdmin() {
  const existing = await User.findOne({ username: 'admin', role: 'super_admin' });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash('admin', 10);
  const user = await User.create({
    name: 'Platform Super Admin',
    username: 'admin',
    passwordHash,
    role: 'super_admin',
    isActive: true,
  });

  console.log('Default super admin created: admin/admin');
  return user;
}

module.exports = { bootstrapSuperAdmin };
