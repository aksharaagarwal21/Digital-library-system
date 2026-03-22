require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const { User, Category, Book, Borrow } = require('../models/index');

const categories = [
  { name: 'Fiction', icon: '📖', color: '#6366F1', description: 'Novels, short stories and fictional works' },
  { name: 'Science & Technology', icon: '🔬', color: '#0EA5E9', description: 'Science, engineering and technology' },
  { name: 'History', icon: '🏛️', color: '#F59E0B', description: 'Historical events and biographies' },
  { name: 'Philosophy', icon: '🧠', color: '#8B5CF6', description: 'Philosophy, ethics and logic' },
  { name: 'Mathematics', icon: '📐', color: '#10B981', description: 'Pure and applied mathematics' },
  { name: 'Business', icon: '💼', color: '#F97316', description: 'Business, economics and management' },
  { name: 'Arts & Literature', icon: '🎨', color: '#EC4899', description: 'Art, literature and creative works' },
  { name: 'Health & Medicine', icon: '⚕️', color: '#14B8A6', description: 'Medical and health sciences' },
  { name: 'Self Help', icon: '🌱', color: '#84CC16', description: 'Personal development and motivation' },
  { name: 'Computer Science', icon: '💻', color: '#3B82F6', description: 'Programming, algorithms and CS theory' },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL');

    await sequelize.sync({ force: true });
    console.log('✅ Tables created');

    const createdCats = await Category.bulkCreate(categories);
    console.log(`✅ Created ${createdCats.length} categories`);

    const catMap = {};
    createdCats.forEach(c => { catMap[c.name] = c.id; });

    const adminPass = await bcrypt.hash('admin123', 12);
    const libPass = await bcrypt.hash('librarian123', 12);
    const memPass = await bcrypt.hash('member123', 12);

    const users = await User.bulkCreate([
      { name: 'Admin User', email: 'admin@library.com', password: adminPass, role: 'admin', membershipId: 'ADMIN001', phone: '+91-9876543210', joinedAt: new Date() },
      { name: 'Dr. Priya Nair', email: 'librarian@library.com', password: libPass, role: 'librarian', membershipId: 'LIB001', phone: '+91-9876543211', joinedAt: new Date() },
      { name: 'Arjun Kumar', email: 'arjun@example.com', password: memPass, role: 'member', membershipId: 'MEM001', phone: '+91-9123456789', membershipType: 'premium', borrowLimit: 10, joinedAt: new Date() },
      { name: 'Priya Sharma', email: 'priya@example.com', password: memPass, role: 'member', membershipId: 'MEM002', phone: '+91-9234567890', membershipType: 'basic', joinedAt: new Date() },
      { name: 'Rahul Verma', email: 'rahul@example.com', password: memPass, role: 'member', membershipId: 'MEM003', phone: '+91-9345678901', membershipType: 'vip', borrowLimit: 15, joinedAt: new Date() },
      { name: 'Anjali Singh', email: 'anjali@example.com', password: memPass, role: 'member', membershipId: 'MEM004', membershipType: 'basic', joinedAt: new Date() },
      { name: 'Vikram Nair', email: 'vikram@example.com', password: memPass, role: 'member', membershipId: 'MEM005', membershipType: 'premium', borrowLimit: 10, joinedAt: new Date() },
    ], { hooks: false });
    console.log(`✅ Created ${users.length} users`);

    const adminId = users[0].id;

    const books = await Book.bulkCreate([
      { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', categoryId: catMap['Fiction'], publisher: 'Scribner', publishedYear: 1925, pages: 180, description: 'A story of wealth, love, and the American Dream set in the Roaring Twenties.', totalCopies: 5, availableCopies: 3, borrowedCopies: 2, tags: JSON.stringify(['classic', 'american', 'romance']), rating: 4.2, totalRatings: 150, totalBorrows: 89, price: 299, addedBy: adminId },
      { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0061935466', categoryId: catMap['Fiction'], publisher: 'HarperCollins', publishedYear: 1960, pages: 336, description: 'A gripping tale of racial injustice and childhood innocence in the American South.', totalCopies: 4, availableCopies: 2, borrowedCopies: 2, tags: JSON.stringify(['classic', 'justice', 'social']), rating: 4.8, totalRatings: 230, totalBorrows: 112, price: 349, addedBy: adminId },
      { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '978-0553380163', categoryId: catMap['Science & Technology'], publisher: 'Bantam Books', publishedYear: 1988, pages: 212, description: "Hawking's landmark work on cosmology, black holes, and the nature of time.", totalCopies: 6, availableCopies: 4, borrowedCopies: 2, tags: JSON.stringify(['physics', 'cosmology', 'space']), rating: 4.6, totalRatings: 312, totalBorrows: 178, price: 449, addedBy: adminId },
      { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', isbn: '978-0062316097', categoryId: catMap['History'], publisher: 'Harper', publishedYear: 2011, pages: 443, description: 'A sweeping narrative of the history of the human species from the Stone Age.', totalCopies: 8, availableCopies: 5, borrowedCopies: 3, tags: JSON.stringify(['history', 'anthropology', 'evolution']), rating: 4.7, totalRatings: 445, totalBorrows: 234, price: 599, addedBy: adminId },
      { title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', categoryId: catMap['Computer Science'], publisher: 'Prentice Hall', publishedYear: 2008, pages: 431, description: 'A handbook of agile software craftsmanship for writing clean, maintainable code.', totalCopies: 7, availableCopies: 3, borrowedCopies: 4, tags: JSON.stringify(['programming', 'software', 'agile']), rating: 4.5, totalRatings: 280, totalBorrows: 195, price: 799, addedBy: adminId },
      { title: 'The Republic', author: 'Plato', isbn: '978-0140455113', categoryId: catMap['Philosophy'], publisher: 'Penguin Classics', publishedYear: -380, pages: 448, description: "Plato's masterwork on justice, the ideal state, and the philosopher-king.", totalCopies: 3, availableCopies: 2, borrowedCopies: 1, tags: JSON.stringify(['philosophy', 'politics', 'ancient']), rating: 4.3, totalRatings: 198, totalBorrows: 67, price: 249, addedBy: adminId },
      { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '978-0374533557', categoryId: catMap['Self Help'], publisher: 'Farrar Straus Giroux', publishedYear: 2011, pages: 499, description: 'A groundbreaking exploration of the two systems that drive the way we think.', totalCopies: 5, availableCopies: 4, borrowedCopies: 1, tags: JSON.stringify(['psychology', 'decision-making', 'behavior']), rating: 4.6, totalRatings: 367, totalBorrows: 156, price: 549, addedBy: adminId },
      { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', categoryId: catMap['Computer Science'], publisher: 'MIT Press', publishedYear: 2009, pages: 1292, description: 'The comprehensive guide to algorithms and data structures.', totalCopies: 6, availableCopies: 2, borrowedCopies: 4, tags: JSON.stringify(['algorithms', 'programming', 'data-structures']), rating: 4.7, totalRatings: 412, totalBorrows: 289, price: 1299, addedBy: adminId },
      { title: 'Zero to One', author: 'Peter Thiel', isbn: '978-0804139021', categoryId: catMap['Business'], publisher: 'Crown Business', publishedYear: 2014, pages: 224, description: 'Notes on startups and how to build the future.', totalCopies: 5, availableCopies: 3, borrowedCopies: 2, tags: JSON.stringify(['startup', 'entrepreneurship', 'innovation']), rating: 4.4, totalRatings: 289, totalBorrows: 143, price: 499, addedBy: adminId },
      { title: 'Calculus: Early Transcendentals', author: 'James Stewart', isbn: '978-1285741550', categoryId: catMap['Mathematics'], publisher: 'Cengage Learning', publishedYear: 2015, pages: 1368, description: 'Comprehensive textbook for single and multivariable calculus.', totalCopies: 10, availableCopies: 6, borrowedCopies: 4, tags: JSON.stringify(['mathematics', 'calculus', 'textbook']), rating: 4.2, totalRatings: 189, totalBorrows: 198, price: 1499, addedBy: adminId },
      { title: 'The Alchemist', author: 'Paulo Coelho', isbn: '978-0062315007', categoryId: catMap['Fiction'], publisher: 'HarperOne', publishedYear: 1988, pages: 197, description: "A philosophical novel about following one's dreams.", totalCopies: 8, availableCopies: 6, borrowedCopies: 2, tags: JSON.stringify(['philosophy', 'inspirational', 'journey']), rating: 4.5, totalRatings: 523, totalBorrows: 267, price: 299, addedBy: adminId },
      { title: 'Deep Work', author: 'Cal Newport', isbn: '978-1455586691', categoryId: catMap['Self Help'], publisher: 'Grand Central Publishing', publishedYear: 2016, pages: 296, description: 'Rules for focused success in a distracted world.', totalCopies: 4, availableCopies: 3, borrowedCopies: 1, tags: JSON.stringify(['productivity', 'focus', 'work']), rating: 4.5, totalRatings: 312, totalBorrows: 134, price: 449, addedBy: adminId },
      { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', isbn: '978-0135957059', categoryId: catMap['Computer Science'], publisher: 'Addison-Wesley', publishedYear: 2019, pages: 352, description: 'Your journey to mastery in software development.', totalCopies: 5, availableCopies: 2, borrowedCopies: 3, tags: JSON.stringify(['programming', 'software-engineering', 'best-practices']), rating: 4.7, totalRatings: 356, totalBorrows: 178, price: 899, addedBy: adminId },
      { title: 'Atomic Habits', author: 'James Clear', isbn: '978-0735211292', categoryId: catMap['Self Help'], publisher: 'Avery', publishedYear: 2018, pages: 320, description: 'An easy and proven way to build good habits and break bad ones.', totalCopies: 6, availableCopies: 4, borrowedCopies: 2, tags: JSON.stringify(['habits', 'productivity', 'self-improvement']), rating: 4.8, totalRatings: 678, totalBorrows: 312, price: 499, addedBy: adminId },
      { title: 'The Lean Startup', author: 'Eric Ries', isbn: '978-0307887894', categoryId: catMap['Business'], publisher: 'Crown Business', publishedYear: 2011, pages: 336, description: 'How constant innovation creates radically successful businesses.', totalCopies: 4, availableCopies: 3, borrowedCopies: 1, tags: JSON.stringify(['startup', 'lean', 'innovation']), rating: 4.3, totalRatings: 267, totalBorrows: 145, price: 549, addedBy: adminId },
    ]);
    console.log(`✅ Created ${books.length} books`);

    // Create some borrow records
    const now = new Date();
    const pastDate = (days) => new Date(now - days * 24 * 60 * 60 * 1000);
    const futureDate = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    await Borrow.bulkCreate([
      { bookId: books[0].id, memberId: users[2].id, issuedBy: users[1].id, borrowDate: pastDate(5), dueDate: futureDate(9), status: 'active' },
      { bookId: books[1].id, memberId: users[3].id, issuedBy: users[1].id, borrowDate: pastDate(10), dueDate: futureDate(4), status: 'active' },
      { bookId: books[4].id, memberId: users[4].id, issuedBy: users[1].id, borrowDate: pastDate(20), dueDate: pastDate(6), status: 'overdue', fine: 30 },
      { bookId: books[2].id, memberId: users[2].id, issuedBy: users[1].id, borrowDate: pastDate(30), dueDate: pastDate(16), returnDate: pastDate(15), status: 'returned' },
      { bookId: books[3].id, memberId: users[5].id, issuedBy: users[1].id, borrowDate: pastDate(7), dueDate: futureDate(7), status: 'active' },
      { bookId: books[7].id, memberId: users[6].id, issuedBy: users[1].id, borrowDate: pastDate(3), dueDate: futureDate(11), status: 'active' },
    ]);
    console.log('✅ Created borrow records');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📋 Login Credentials:');
    console.log('   Admin:     admin@library.com     / admin123');
    console.log('   Librarian: librarian@library.com / librarian123');
    console.log('   Member:    arjun@example.com     / member123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seed();
