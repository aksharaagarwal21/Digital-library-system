const { Op } = require('sequelize');
const { User, Borrow, Book } = require('../models/index');

exports.getMembers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive, membershipType, sort = 'joinedAt', order = 'DESC' } = req.query;
    const where = { role: 'member' };
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (membershipType) where.membershipType = membershipType;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { membershipId: { [Op.like]: `%${search}%` } }
      ];
    }
    const offset = (page - 1) * limit;
    const { count, rows } = await User.findAndCountAll({ where, attributes: { exclude: ['password'] }, order: [[sort, order]], limit: parseInt(limit), offset });
    res.json({ success: true, data: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMember = async (req, res) => {
  try {
    const member = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    const recentBorrows = await Borrow.findAll({
      where: { memberId: req.params.id },
      include: [{ model: Book, as: 'book', attributes: ['id', 'title', 'author', 'isbn', 'coverImage'] }],
      order: [['borrowDate', 'DESC']],
      limit: 10
    });

    res.json({ success: true, data: { ...member.toJSON(), recentBorrows } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const { name, email, phone, address, membershipType, borrowLimit, isActive } = req.body;
    const [updated] = await User.update({ name, email, phone, address, membershipType, borrowLimit, isActive }, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ success: false, message: 'Member not found' });
    const member = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    res.json({ success: true, message: 'Member updated', data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const activeBorrows = await Borrow.count({ where: { memberId: req.params.id, status: { [Op.in]: ['active', 'overdue', 'renewed'] } } });
    if (activeBorrows > 0) return res.status(400).json({ success: false, message: 'Cannot delete member with active borrows' });
    await User.update({ isActive: false }, { where: { id: req.params.id } });
    res.json({ success: true, message: 'Member deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
