const express = require('express');
const { protect, authorize } = require('../middleware/auth');

// Members
const membersRouter = express.Router();
const { getMembers, getMember, updateMember, deleteMember } = require('../controllers/memberController');
membersRouter.get('/', protect, authorize('admin', 'librarian'), getMembers);
membersRouter.get('/:id', protect, authorize('admin', 'librarian'), getMember);
membersRouter.put('/:id', protect, authorize('admin', 'librarian'), updateMember);
membersRouter.delete('/:id', protect, authorize('admin'), deleteMember);

// Borrows
const borrowsRouter = express.Router();
const { borrowBook, returnBook, renewBook, getBorrows, getMyBorrows } = require('../controllers/borrowController');
borrowsRouter.get('/', protect, authorize('admin', 'librarian'), getBorrows);
borrowsRouter.get('/my', protect, getMyBorrows);
borrowsRouter.post('/borrow', protect, authorize('admin', 'librarian'), borrowBook);
borrowsRouter.post('/return', protect, authorize('admin', 'librarian'), returnBook);
borrowsRouter.put('/:id/renew', protect, renewBook);

// Categories
const categoriesRouter = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
categoriesRouter.get('/', protect, getCategories);
categoriesRouter.post('/', protect, authorize('admin', 'librarian'), createCategory);
categoriesRouter.put('/:id', protect, authorize('admin', 'librarian'), updateCategory);
categoriesRouter.delete('/:id', protect, authorize('admin'), deleteCategory);

// Dashboard
const dashboardRouter = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
dashboardRouter.get('/stats', protect, authorize('admin', 'librarian'), getDashboardStats);

module.exports = { membersRouter, borrowsRouter, categoriesRouter, dashboardRouter };
