const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const User = require('../models/User');
const {
  LEAD_SOURCES,
  LEAD_STATUSES,
  SERVICE_REQUIRED,
} = require('../constants/leadOptions');
const { normalizeLeadPayload, validateLeadPayload } = require('../validators/leadValidator');

const sortFields = new Set(['createdAt', 'estimatedValue']);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function invalidId(res, resource = 'Lead') {
  return res.status(400).json({ success: false, message: `${resource} ID is invalid` });
}

async function ensureAssignedUser(payload, res) {
  if (!payload.assignedTo) return true;

  const user = await User.findById(payload.assignedTo);
  if (user) return true;

  res.status(400).json({
    success: false,
    message: 'Assigned user does not exist',
    errors: [{ field: 'assignedTo', message: 'Assigned user does not exist' }],
  });
  return false;
}

async function createLead(req, res, next) {
  try {
    const payload = normalizeLeadPayload(req.body);
    const errors = validateLeadPayload(payload);

    if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors });
    if (!(await ensureAssignedUser(payload, res))) return undefined;

    const lead = await Lead.create(payload);
    await lead.populate('assignedTo', 'username role');

    return res.status(201).json({ success: true, data: lead });
  } catch (error) {
    return next(error);
  }
}

async function getLeads(req, res, next) {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
    const sortBy = sortFields.has(req.query.sortBy) ? req.query.sortBy : 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const query = {};

    if (req.query.status) {
      if (!LEAD_STATUSES.includes(req.query.status)) return res.status(400).json({ success: false, message: 'Status filter is invalid' });
      query.leadStatus = req.query.status;
    }
    if (req.query.service) {
      if (!SERVICE_REQUIRED.includes(req.query.service)) return res.status(400).json({ success: false, message: 'Service filter is invalid' });
      query.serviceRequired = req.query.service;
    }
    if (req.query.source) {
      if (!LEAD_SOURCES.includes(req.query.source)) return res.status(400).json({ success: false, message: 'Source filter is invalid' });
      query.leadSource = req.query.source;
    }
    if (req.query.assignedTo) {
      if (!mongoose.isValidObjectId(req.query.assignedTo)) return invalidId(res, 'Assigned user');
      query.assignedTo = req.query.assignedTo;
    }
    if (req.query.search && typeof req.query.search === 'string') {
      const search = new RegExp(escapeRegex(req.query.search.trim()), 'i');
      query.$or = [{ leadName: search }, { companyName: search }, { email: search }, { mobile: search }];
    }

    const [data, total] = await Promise.all([
      Lead.find(query)
        .populate('assignedTo', 'username role')
        .sort({ [sortBy]: sortOrder, _id: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit),
      Lead.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
}

async function getLead(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res);
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'username role');
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    return res.json({ success: true, data: lead });
  } catch (error) {
    return next(error);
  }
}

async function updateLead(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res);
    const payload = normalizeLeadPayload(req.body);
    if (!Object.keys(payload).length) return res.status(400).json({ success: false, message: 'No lead fields were provided' });

    const errors = validateLeadPayload(payload, { isUpdate: true });
    if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors });
    if (!(await ensureAssignedUser(payload, res))) return undefined;

    const lead = await Lead.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).populate('assignedTo', 'username role');

    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    return res.json({ success: true, data: lead });
  } catch (error) {
    return next(error);
  }
}

async function deleteLead(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res);
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    await FollowUp.deleteMany({ leadId: lead._id });
    return res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { createLead, deleteLead, getLead, getLeads, updateLead };
