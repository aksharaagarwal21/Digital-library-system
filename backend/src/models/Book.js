const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Book = sequelize.define('Book', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(300), allowNull: false },
  author: { type: DataTypes.STRING(200), allowNull: false },
  isbn: { type: DataTypes.STRING(20), unique: true, allowNull: true },
  categoryId: { type: DataTypes.INTEGER, allowNull: false },
  publisher: { type: DataTypes.STRING(200), allowNull: true },
  publishedYear: { type: DataTypes.INTEGER, allowNull: true },
  edition: { type: DataTypes.STRING(50), allowNull: true },
  language: { type: DataTypes.STRING(50), defaultValue: 'English' },
  pages: { type: DataTypes.INTEGER, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  coverImage: { type: DataTypes.STRING(255), allowNull: true },
  tags: { type: DataTypes.JSON, defaultValue: [] },
  shelfLocation: { type: DataTypes.STRING(50), allowNull: true },
  rowLocation: { type: DataTypes.STRING(10), allowNull: true },
  columnLocation: { type: DataTypes.STRING(10), allowNull: true },
  totalCopies: { type: DataTypes.INTEGER, defaultValue: 1, allowNull: false },
  availableCopies: { type: DataTypes.INTEGER, defaultValue: 1, allowNull: false },
  borrowedCopies: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('available', 'borrowed', 'reserved', 'maintenance', 'lost'), defaultValue: 'available' },
  rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0.00 },
  totalRatings: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalBorrows: { type: DataTypes.INTEGER, defaultValue: 0 },
  price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  isDigital: { type: DataTypes.BOOLEAN, defaultValue: false },
  digitalUrl: { type: DataTypes.STRING(500), allowNull: true },
  addedBy: { type: DataTypes.INTEGER, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'books',
  indexes: [
    { fields: ['title'] },
    { fields: ['author'] },
    { fields: ['isbn'] },
    { fields: ['categoryId'] },
    { fields: ['status'] },
    { type: 'FULLTEXT', fields: ['title', 'author'] }
  ]
});

module.exports = Book;
