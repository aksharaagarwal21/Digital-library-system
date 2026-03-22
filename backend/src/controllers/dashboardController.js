const { Op, fn, col, literal } = require('sequelize');
const { Book, User, Borrow, Category } = require('../models/index');

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalBooks, totalMembers, activeBorrows, overdueCount,
      newBooksThisMonth, newMembersThisMonth, totalCategories,
      recentBorrows, topBooks, categoryStats
    ] = await Promise.all([
      Book.count({ where: { isActive: true } }),
      User.count({ where: { role: 'member', isActive: true } }),
      Borrow.count({ where: { status: { [Op.in]: ['active', 'renewed'] } } }),
      Borrow.count({ where: { status: 'overdue' } }),
      Book.count({ where: { isActive: true, createdAt: { [Op.gte]: startOfMonth } } }),
      User.count({ where: { role: 'member', joinedAt: { [Op.gte]: startOfMonth } } }),
      Category.count({ where: { isActive: true } }),

      Borrow.findAll({
        where: { status: { [Op.in]: ['active', 'overdue', 'renewed'] } },
        include: [
          { model: Book, as: 'book', attributes: ['id', 'title', 'author', 'coverImage'] },
          { model: User, as: 'member', attributes: ['id', 'name', 'membershipId'] }
        ],
        order: [['borrowDate', 'DESC']],
        limit: 5
      }),

      Book.findAll({
        where: { isActive: true },
        include: [{ model: Category, as: 'category', attributes: ['name', 'icon'] }],
        order: [['totalBorrows', 'DESC']],
        limit: 5
      }),

      Category.findAll({
        where: { isActive: true },
        order: [['bookCount', 'DESC']],
        limit: 8
      })
    ]);

    const fineResult = await Borrow.sum('fine') || 0;
    const availableResult = await Book.sum('availableCopies', { where: { isActive: true } }) || 0;

    // Monthly borrows for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBorrows = await Borrow.findAll({
      attributes: [
        [fn('YEAR', col('borrowDate')), 'year'],
        [fn('MONTH', col('borrowDate')), 'month'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: { borrowDate: { [Op.gte]: sixMonthsAgo } },
      group: [fn('YEAR', col('borrowDate')), fn('MONTH', col('borrowDate'))],
      order: [[fn('YEAR', col('borrowDate')), 'ASC'], [fn('MONTH', col('borrowDate')), 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalBooks, totalMembers, activeBorrows, overdueCount,
          newBooksThisMonth, newMembersThisMonth, totalCategories,
          totalFines: fineResult, availableBooks: availableResult
        },
        recentBorrows, topBooks, categoryStats, monthlyBorrows
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
