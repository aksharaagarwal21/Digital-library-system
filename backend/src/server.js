const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { connectDB, sequelize } = require('./config/database');
require('./models/index'); // load associations
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const { membersRouter, borrowsRouter, categoriesRouter, dashboardRouter } = require('./routes/other');

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/members', membersRouter);
app.use('/api/borrows', borrowsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/dashboard', dashboardRouter);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'Digital Library API running', db: 'MySQL', timestamp: new Date() }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  // Sync all models (alter: true updates schema without dropping data)
  await sequelize.sync({ alter: false });
  console.log('✅ Database tables synced');

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    console.log(`📚 Digital Library Management System`);
    console.log(`🗄️  Database: MySQL`);
    console.log(`🔗 http://localhost:${PORT}/api/health\n`);
  });
};

startServer();
module.exports = app;
