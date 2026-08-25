const mongoose = require('mongoose');
const {
  LEAD_SOURCES,
  LEAD_STATUSES,
  SERVICE_REQUIRED,
} = require('../constants/leadOptions');

const phonePattern = /^[0-9+()\-\s]{7,20}$/;

const leadSchema = new mongoose.Schema(
  {
    leadName: { type: String, required: true, trim: true, maxlength: 100 },
    companyName: { type: String, required: true, trim: true, maxlength: 150 },
    mobile: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate: {
        validator: (value) => phonePattern.test(value),
        message: 'Mobile must be a valid phone number',
      },
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email must be valid'],
    },
    serviceRequired: { type: String, required: true, enum: SERVICE_REQUIRED },
    leadSource: { type: String, required: true, enum: LEAD_SOURCES },
    estimatedValue: { type: Number, min: 0, default: null },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    remarks: { type: String, trim: true, maxlength: 2000, default: '' },
    leadStatus: { type: String, required: true, enum: LEAD_STATUSES, default: 'New' },
  },
  { timestamps: true }
);

leadSchema.index({ leadStatus: 1, createdAt: -1 });
leadSchema.index({ serviceRequired: 1, createdAt: -1 });
leadSchema.index({ assignedTo: 1, createdAt: -1 });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
