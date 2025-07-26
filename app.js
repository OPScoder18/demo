const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const multer = require('multer');
require('dotenv').config();

const Admin = require('./models/Admin');
const Registration = require('./models/Registration');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));
app.set('view engine', 'ejs');

// Session
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
}));

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// ROUTES

// Home
app.get('/', (req, res) => {
  res.render('index');
});

// Notice form
app.get('/notice', (req, res) => {
  res.render('notice');
});

// Admin login form
app.get('/admin/login', (req, res) => {
  res.render('admin-login', { error: null });
});

// Admin login handler
app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return res.render('admin-login', { error: 'Invalid credentials' });
  }
  req.session.admin = admin._id;
  res.redirect('/admin/dashboard');
});

// Admin dashboard
app.get('/admin/dashboard', async (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  const data = await Registration.find();
  res.render('admin-dashboard', { total: data.length, data });
});

// Admin logout
app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Handle registration with file upload
app.post('/notice/register', upload.single('paymentSS'), async (req, res) => {
  try {
    const {
      groupName, leaderName, leaderPhone, schoolName, email,
      ign1, uid1, ign2, uid2, ign3, uid3, ign4, uid4,
      ign5, uid5, agreed
    } = req.body;

    const newRegistration = new Registration({
      groupName, leaderName, leaderPhone, schoolName, email,
      ign1, uid1, ign2, uid2, ign3, uid3, ign4, uid4,
      ign5: ign5 || '', uid5: uid5 || '',
      paymentSS: req.file ? req.file.filename : '',
      agreed: agreed === 'on'
    });

    await newRegistration.save();
    res.send('✅ Registration successful! <a href="/">Go Home</a>');
  } catch (err) {
    console.error('❌ Error saving registration:', err);
    res.status(500).send('❌ Error while saving registration.');
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
