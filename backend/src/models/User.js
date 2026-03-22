const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'librarian', 'member'), defaultValue: 'member' },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  avatar: { type: DataTypes.STRING(255), allowNull: true },
  membershipId: { type: DataTypes.STRING(20), unique: true, allowNull: true },
  membershipType: { type: DataTypes.ENUM('basic', 'premium', 'vip'), defaultValue: 'basic' },
  membershipExpiry: { type: DataTypes.DATE, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  borrowLimit: { type: DataTypes.INTEGER, defaultValue: 5 },
  totalBorrowed: { type: DataTypes.INTEGER, defaultValue: 0 },
  finesDue: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  lastLogin: { type: DataTypes.DATE, allowNull: true },
  joinedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) user.password = await bcrypt.hash(user.password, 12);
      if (user.role === 'member' && !user.membershipId) {
        user.membershipId = 'LIB' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) user.password = await bcrypt.hash(user.password, 12);
    }
  }
});

User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toSafeJSON = function() {
  const obj = this.toJSON();
  delete obj.password;
  return obj;
};

module.exports = User;
