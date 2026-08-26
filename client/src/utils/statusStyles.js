const statusStyles = {
  New: 'status-new',
  Contacted: 'status-contacted',
  'Proposal Sent': 'status-proposal',
  Negotiation: 'status-negotiation',
  Won: 'status-won',
  Lost: 'status-lost',
};

export function getStatusStyle(status) {
  return statusStyles[status] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
}
