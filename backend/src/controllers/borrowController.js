const { Op, literal } = require('sequelize');
const { Borrow, Book, User, Category } = require('../models/index');

const FINE_PER_DAY = 5;

exports.borrowBook = async (req, res) => {
  try {
    const { bookId, memberId, dueDate, notes } = req.body;

    const book = await Book.findByPk(bookId);
    if (!book || !book.isActive) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.availableCopies <= 0) return res.status(400).json({ success: false, message: 'No copies available' });

    const member = await User.findByPk(memberId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    const activeCount = await Borrow.count({ where: { memberId, status: { [Op.in]: ['active', 'overdue', 'renewed'] } } });
    if (activeCount >= member.borrowLimit) return res.status(400).json({ success: false, message: `Borrow limit reached (${member.borrowLimit})` });

    const existing = await Borrow.findOne({ where: { bookId, memberId, status: { [Op.in]: ['active', 'renewed'] } } });
    if (existing) return res.status(400).json({ success: false, message: 'Member already has this book' });

    const due = dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const borrow = await Borrow.create({ bookId, memberId, issuedBy: req.user.id, dueDate: due, notes });

    await book.update({
      availableCopies: book.availableCopies - 1,
      borrowedCopies: book.borrowedCopies + 1,
      totalBorrows: book.totalBorrows + 1,
      status: book.availableCopies - 1 === 0 ? 'borrowed' : 'available'
    });
    await User.increment('totalBorrowed', { by: 1, where: { id: memberId } });

    const populated = await Borrow.findByPk(borrow.id, {
      include: [
        { model: Book, as: 'book', attributes: ['id', 'title', 'author', 'isbn', 'coverImage'] },
        { model: User, as: 'member', attributes: ['id', 'name', 'email', 'membershipId'] },
        { model: User, as: 'issuedByUser', attributes: ['id', 'name'] }
      ]
    });
    res.status(201).json({ success: true, message: 'Book borrowed successfully', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const { borrowId, condition = 'good', notes } = req.body;
    const borrow = await Borrow.findByPk(borrowId, { include: [{ model: Book, as: 'book' }, { model: User, as: 'member' }] });
    if (!borrow) return res.status(404).json({ success: false, message: 'Borrow record not found' });
    if (borrow.status === 'returned') return res.status(400).json({ success: false, message: 'Book already returned' });

    const returnDate = new Date();
    let fine = 0;
    if (returnDate > new Date(borrow.dueDate)) {
      const daysOverdue = Math.ceil((returnDate - new Date(borrow.dueDate)) / (1000 * 60 * 60 * 24));
      fine = daysOverdue * FINE_PER_DAY;
    }

    await borrow.update({ returnDate, status: 'returned', fine, returnCondition: condition, notes: notes || borrow.notes });

    const book = await Book.findByPk(borrow.bookId);
    await book.update({
      availableCopies: book.availableCopies + 1,
      borrowedCopies: Math.max(0, book.borrowedCopies - 1),
      status: 'available'
    });

    if (fine > 0) await User.increment('finesDue', { by: fine, where: { id: borrow.memberId } });

    res.json({ success: true, message: 'Book returned successfully', fine, data: borrow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.renewBook = async (req, res) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id);
    if (!borrow) return res.status(404).json({ success: false, message: 'Borrow record not found' });
    if (borrow.status === 'returned') return res.status(400).json({ success: false, message: 'Book already returned' });
    if (borrow.renewals >= borrow.maxRenewals) return res.status(400).json({ success: false, message: 'Maximum renewals reached' });

    const newDue = new Date(borrow.dueDate);
    newDue.setDate(newDue.getDate() + 14);
    await borrow.update({ dueDate: newDue, renewals: borrow.renewals + 1, status: 'renewed' });
    res.json({ success: true, message: 'Book renewed successfully', data: borrow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBorrows = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, memberId, sort = 'borrowDate', order = 'DESC' } = req.query;
    const where = {};
    if (status) where.status = status;
    if (memberId) where.memberId = memberId;
    if (req.user.role === 'member') where.memberId = req.user.id;

    // Auto-update overdue
    await Borrow.update({ status: 'overdue' }, { where: { status: 'active', dueDate: { [Op.lt]: new Date() } } });

    const offset = (page - 1) * limit;
    const { count, rows } = await Borrow.findAndCountAll({
      where,
      include: [
        { model: Book, as: 'book', attributes: ['id', 'title', 'author', 'isbn', 'coverImage'] },
        { model: User, as: 'member', attributes: ['id', 'name', 'email', 'membershipId'] },
        { model: User, as: 'issuedByUser', attributes: ['id', 'name'] }
      ],
      order: [[sort, order]],
      limit: parseInt(limit),
      offset
    });

    res.json({ success: true, data: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyBorrows = async (req, res) => {
  try {
    await Borrow.update({ status: 'overdue' }, { where: { memberId: req.user.id, status: 'active', dueDate: { [Op.lt]: new Date() } } });
    const borrows = await Borrow.findAll({
      where: { memberId: req.user.id },
      include: [{ model: Book, as: 'book', attributes: ['id', 'title', 'author', 'isbn', 'coverImage'], include: [{ model: Category, as: 'category', attributes: ['name', 'icon'] }] }],
      order: [['borrowDate', 'DESC']],
      limit: 20
    });
    res.json({ success: true, data: borrows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
