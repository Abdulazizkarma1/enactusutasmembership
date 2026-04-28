const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema(
  {
    project: { type: String, required: true },
    role: { type: String, required: true },
    year: { type: String, required: true },
    impact: { type: String, required: true },
  },
  { _id: false }
);

const memberSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  token: { type: String, required: true, unique: true },
  membershipId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  faculty: { type: String, required: true },
  photo: { type: String, default: '' },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  joinDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  contributions: { type: [contributionSchema], default: [] },
  presidentRemark: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

memberSchema.set('toJSON', {
  virtuals: false,
  transform(_doc, ret) {
    const o = ret;
    delete o._id;
    delete o.__v;
    return o;
  },
});

module.exports = mongoose.model('Member', memberSchema);
