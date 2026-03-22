const { Op } = require('sequelize');
const { Book, Category, User } = require('../models/index');

exports.getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, categoryId, status, language, sort = 'createdAt', order = 'DESC' } = req.query;
    const where = { isActive: true };
    if (search) where[Op.or] = [{ title: { [Op.like]: `%${search}%` } }, { author: { [Op.like]: `%${search}%` } }, { isbn: { [Op.like]: `%${search}%` } }];
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (language) where.language = language;

    const offset = (page - 1) * limit;
    const { count, rows } = await Book.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color'] }],
      order: [[sort, order]],
      limit: parseInt(limit),
      offset
    });

    res.json({ success: true, data: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color'] },
        { model: User, as: 'addedByUser', attributes: ['id', 'name'] }
      ]
    });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    const bookData = { ...req.body, addedBy: req.user.id };
    if (!bookData.availableCopies) bookData.availableCopies = bookData.totalCopies || 1;
    const book = await Book.create(bookData);
    await Category.increment('bookCount', { by: 1, where: { id: bookData.categoryId } });
    const populated = await Book.findByPk(book.id, { include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color'] }] });
    res.status(201).json({ success: true, message: 'Book added successfully', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    const oldCategoryId = book.categoryId;
    await book.update(req.body);

    if (req.body.categoryId && req.body.categoryId != oldCategoryId) {
      await Category.decrement('bookCount', { by: 1, where: { id: oldCategoryId } });
      await Category.increment('bookCount', { by: 1, where: { id: req.body.categoryId } });
    }

    const updated = await Book.findByPk(book.id, { include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color'] }] });
    res.json({ success: true, message: 'Book updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    await book.update({ isActive: false });
    await Category.decrement('bookCount', { by: 1, where: { id: book.categoryId } });
    res.json({ success: true, message: 'Book deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeaturedBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      where: { isActive: true, availableCopies: { [Op.gt]: 0 } },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color'] }],
      order: [['totalBorrows', 'DESC'], ['rating', 'DESC']],
      limit: 8
    });
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
