const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  groupName: String,
  leaderName: String,
  leaderPhone: String,
  schoolName: String,
  email: String,
  ign1: String,
  uid1: String,
  ign2: String,
  uid2: String,
  ign3: String,
  uid3: String,
  ign4: String,
  uid4: String,
  ign5: String,
  uid5: String,
  paymentSS: String,
  agreed: Boolean
});

module.exports = mongoose.model('Registration', registrationSchema);
