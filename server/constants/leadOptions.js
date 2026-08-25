/**
 * Centralized lead option values.
 * Frontend should mirror these; backend validation is the source of truth.
 * Add new services here (e.g. "AI Application Development") instead of scattering strings.
 */
const SERVICE_REQUIRED = [
  'Website Development',
  'Web Application',
  'Mobile Application',
  'E-Commerce',
  'SEO',
  'Digital Marketing',
  'Other',
];

const LEAD_SOURCES = [
  'Website',
  'WhatsApp',
  'Referral',
  'LinkedIn',
  'Google',
  'Facebook',
  'Other',
];

const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
];

const FOLLOW_UP_TYPES = ['Call', 'Email', 'Meeting', 'WhatsApp', 'Other'];

module.exports = {
  SERVICE_REQUIRED,
  LEAD_SOURCES,
  LEAD_STATUSES,
  FOLLOW_UP_TYPES,
};
