const mongoose = require('mongoose');
const { FOLLOW_UP_TYPES } = require('../constants/leadOptions');

const followUpSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
      index: true,
    },
    date: { type: Date, required: true },
    followUpType: { type: String, required: true, enum: FOLLOW_UP_TYPES },
    remarks: { type: String, required: true, trim: true, maxlength: 2000 },
    nextFollowUpDate: { type: Date, default: null },
  },
  { timestamps: true }
);

followUpSchema.index({ leadId: 1, date: -1 });

module.exports = mongoose.model('FollowUp', followUpSchema);
