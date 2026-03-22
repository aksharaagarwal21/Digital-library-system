const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  icon: { type: DataTypes.STRING(10), defaultValue: '📚' },
  color: { type: DataTypes.STRING(20), defaultValue: '#4F46E5' },
  slug: { type: DataTypes.STRING(120), unique: true },
  bookCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'categories',
  hooks: {
    beforeCreate: (cat) => {
      if (!cat.slug) cat.slug = cat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
  }
});

module.exports = Category;
