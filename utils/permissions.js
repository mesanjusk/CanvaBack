const roleRank = {
  super_admin: 100,
  school_admin: 90,
  principal: 80,
  teacher: 50,
  operator: 40,
  student: 10,
};

const rolePermissions = {
  super_admin: ['*'],
  school_admin: [
    'school.read', 'school.update', 'user.create', 'user.read', 'user.update',
    'student.create', 'student.read', 'student.update', 'student.delete',
    'template.create', 'template.read', 'template.update', 'template.delete',
    'card.generate', 'card.approve', 'card.review', 'edit.review', 'dashboard.read'
  ],
  principal: [
    'school.read', 'user.read', 'student.read', 'student.update',
    'template.read', 'card.generate', 'card.approve', 'card.review', 'edit.review', 'dashboard.read'
  ],
  teacher: [
    'school.read', 'student.read', 'student.update_limited',
    'template.read', 'card.review', 'edit.review', 'dashboard.read'
  ],
  operator: ['school.read', 'student.read', 'template.read', 'card.generate', 'dashboard.read'],
  student: ['student.self.read', 'student.self.update_limited', 'card.self.read'],
};

function hasPermission(user, permission) {
  const permissions = rolePermissions[user?.role] || [];
  return permissions.includes('*') || permissions.includes(permission);
}

module.exports = { roleRank, rolePermissions, hasPermission };
