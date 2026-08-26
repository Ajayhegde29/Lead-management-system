const mongoose = require('mongoose');
const {
  LEAD_SOURCES,
  LEAD_STATUSES,
  SERVICE_REQUIRED,
} = require('../constants/leadOptions');

const phonePattern = /^[0-9+()\-\s]{7,20}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const editableFields = [
  'leadName',
  'companyName',
  'mobile',
  'email',
  'serviceRequired',
  'leadSource',
  'estimatedValue',
  'assignedTo',
  'remarks',
  'leadStatus',
];

function normalizeLeadPayload(body) {
  const payload = {};

  editableFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      payload[field] = body[field];
    }
  });

  ['leadName', 'companyName', 'mobile', 'email', 'remarks'].forEach((field) => {
    if (typeof payload[field] === 'string') payload[field] = payload[field].trim();
  });

  if (typeof payload.email === 'string') payload.email = payload.email.toLowerCase();
  if (payload.estimatedValue === '') payload.estimatedValue = null;

  return payload;
}

function validateLeadPayload(payload, { isUpdate = false } = {}) {
  const errors = [];
  const requiredFields = [
    ['leadName', 'Lead name'],
    ['companyName', 'Company name'],
    ['mobile', 'Mobile'],
    ['email', 'Email'],
    ['serviceRequired', 'Service required'],
    ['leadSource', 'Lead source'],
    ['assignedTo', 'Assigned to'],
    ['leadStatus', 'Lead status'],
  ];

  if (!isUpdate) {
    requiredFields.forEach(([field, label]) => {
      if (payload[field] === undefined || payload[field] === '') {
        errors.push({ field, message: `${label} is required` });
      }
    });
  }

  ['leadName', 'companyName'].forEach((field) => {
    if (payload[field] !== undefined && (typeof payload[field] !== 'string' || !payload[field])) {
      errors.push({ field, message: `${field === 'leadName' ? 'Lead name' : 'Company name'} cannot be empty` });
    }
  });

  if (payload.mobile !== undefined && (typeof payload.mobile !== 'string' || !phonePattern.test(payload.mobile))) {
    errors.push({ field: 'mobile', message: 'Mobile must be a valid phone number' });
  }

  if (payload.email !== undefined && (typeof payload.email !== 'string' || !emailPattern.test(payload.email))) {
    errors.push({ field: 'email', message: 'Email must be valid' });
  }

  if (payload.serviceRequired !== undefined && !SERVICE_REQUIRED.includes(payload.serviceRequired)) {
    errors.push({ field: 'serviceRequired', message: 'Service required is invalid' });
  }

  if (payload.leadSource !== undefined && !LEAD_SOURCES.includes(payload.leadSource)) {
    errors.push({ field: 'leadSource', message: 'Lead source is invalid' });
  }

  if (payload.leadStatus !== undefined && !LEAD_STATUSES.includes(payload.leadStatus)) {
    errors.push({ field: 'leadStatus', message: 'Lead status is invalid' });
  }

  if (payload.assignedTo !== undefined && !mongoose.isValidObjectId(payload.assignedTo)) {
    errors.push({ field: 'assignedTo', message: 'Assigned user is invalid' });
  }

  if (
    payload.estimatedValue !== undefined &&
    payload.estimatedValue !== null &&
    (!Number.isFinite(Number(payload.estimatedValue)) || Number(payload.estimatedValue) < 0)
  ) {
    errors.push({ field: 'estimatedValue', message: 'Estimated value must be a non-negative number' });
  }

  if (payload.remarks !== undefined && (typeof payload.remarks !== 'string' || payload.remarks.length > 2000)) {
    errors.push({ field: 'remarks', message: 'Remarks must be 2,000 characters or fewer' });
  }

  return errors;
}

module.exports = { normalizeLeadPayload, validateLeadPayload };
