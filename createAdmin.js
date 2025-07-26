require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin');

mongoose.connect(process.env.MONGO_URI);

const create = async () => {
  const hash = await bcrypt.hash('admin123', 10);
  await Admin.create({ username: 'admin', password: hash });
  console.log('✅ Admin created');
  process.exit();
};

create();
