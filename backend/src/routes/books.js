const express = require('express');
const router = express.Router();
const { getBooks, getBook, createBook, updateBook, deleteBook, getFeaturedBooks } = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');

router.get('/featured', getFeaturedBooks);
router.get('/', protect, getBooks);
router.get('/:id', protect, getBook);
router.post('/', protect, authorize('admin', 'librarian'), createBook);
router.put('/:id', protect, authorize('admin', 'librarian'), updateBook);
router.delete('/:id', protect, authorize('admin', 'librarian'), deleteBook);

module.exports = router;
