const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Borrow = sequelize.define('Borrow', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  bookId: { type: DataTypes.INTEGER, allowNull: false },
  memberId: { type: DataTypes.INTEGER, allowNull: false },
  issuedBy: { type: DataTypes.INTEGER, allowNull: true },
  borrowDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  dueDate: { type: DataTypes.DATE, allowNull: false },
  returnDate: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.ENUM('active', 'returned', 'overdue', 'lost', 'renewed'), defaultValue: 'active' },
  renewals: { type: DataTypes.INTEGER, defaultValue: 0 },
  maxRenewals: { type: DataTypes.INTEGER, defaultValue: 3 },
  fine: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  finePaid: { type: DataTypes.BOOLEAN, defaultValue: false },
  notes: { type: DataTypes.TEXT, allowNull: true },
  returnCondition: { type: DataTypes.ENUM('good', 'damaged', 'lost'), allowNull: true }
}, {
  tableName: 'borrows',
  indexes: [
    { fields: ['bookId'] },
    { fields: ['memberId'] },
    { fields: ['status'] },
    { fields: ['dueDate'] }
  ]
});

module.exports = Borrow;
