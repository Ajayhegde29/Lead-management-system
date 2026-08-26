const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const { FOLLOW_UP_TYPES } = require('../constants/leadOptions');

function isValidDate(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

async function findLeadOrRespond(leadId, res) {
  if (!mongoose.isValidObjectId(leadId)) {
    res.status(400).json({ success: false, message: 'Lead ID is invalid' });
    return null;
  }

  const lead = await Lead.findById(leadId).select('_id');
  if (!lead) {
    res.status(404).json({ success: false, message: 'Lead not found' });
    return null;
  }

  return lead;
}

function validateFollowUp(body) {
  const errors = [];
  const date = typeof body.date === 'string' ? body.date : '';
  const followUpType = typeof body.followUpType === 'string' ? body.followUpType : '';
  const remarks = typeof body.remarks === 'string' ? body.remarks.trim() : '';
  const nextFollowUpDate = body.nextFollowUpDate;

  if (!isValidDate(date)) errors.push({ field: 'date', message: 'Follow-up date must be valid' });
  if (!FOLLOW_UP_TYPES.includes(followUpType)) {
    errors.push({ field: 'followUpType', message: 'Follow-up type is invalid' });
  }
  if (!remarks) errors.push({ field: 'remarks', message: 'Remarks are required' });
  if (remarks.length > 2000) {
    errors.push({ field: 'remarks', message: 'Remarks must be 2,000 characters or fewer' });
  }
  if (nextFollowUpDate !== undefined && nextFollowUpDate !== null && nextFollowUpDate !== '' && !isValidDate(nextFollowUpDate)) {
    errors.push({ field: 'nextFollowUpDate', message: 'Next follow-up date must be valid' });
  }
  if (isValidDate(date) && isValidDate(nextFollowUpDate) && new Date(nextFollowUpDate) < new Date(date)) {
    errors.push({ field: 'nextFollowUpDate', message: 'Next follow-up date cannot be before the follow-up date' });
  }

  return { errors, date, followUpType, remarks, nextFollowUpDate };
}

async function addFollowUp(req, res, next) {
  try {
    const lead = await findLeadOrRespond(req.params.id, res);
    if (!lead) return undefined;

    const { errors, date, followUpType, remarks, nextFollowUpDate } = validateFollowUp(req.body);
    if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors });

    const followUp = await FollowUp.create({
      leadId: lead._id,
      date,
      followUpType,
      remarks,
      nextFollowUpDate: nextFollowUpDate || null,
    });

    return res.status(201).json({ success: true, data: followUp });
  } catch (error) {
    return next(error);
  }
}

async function getFollowUps(req, res, next) {
  try {
    const lead = await findLeadOrRespond(req.params.id, res);
    if (!lead) return undefined;

    const followUps = await FollowUp.find({ leadId: lead._id }).sort({ date: -1, _id: -1 });
    return res.json({ success: true, data: followUps });
  } catch (error) {
    return next(error);
  }
}

module.exports = { addFollowUp, getFollowUps };
