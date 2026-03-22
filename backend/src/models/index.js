const User = require('./User');
const Category = require('./Category');
const Book = require('./Book');
const Borrow = require('./Borrow');

// Associations
Book.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Book, { foreignKey: 'categoryId', as: 'books' });

Book.belongsTo(User, { foreignKey: 'addedBy', as: 'addedByUser' });

Borrow.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });
Book.hasMany(Borrow, { foreignKey: 'bookId', as: 'borrows' });

Borrow.belongsTo(User, { foreignKey: 'memberId', as: 'member' });
User.hasMany(Borrow, { foreignKey: 'memberId', as: 'borrows' });

Borrow.belongsTo(User, { foreignKey: 'issuedBy', as: 'issuedByUser' });

module.exports = { User, Category, Book, Borrow };
