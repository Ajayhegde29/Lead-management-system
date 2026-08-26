const Lead = require('../models/Lead');
const { LEAD_STATUSES } = require('../constants/leadOptions');

const activePipelineStatuses = ['New', 'Contacted', 'Proposal Sent', 'Negotiation'];

async function getStats(_req, res, next) {
  try {
    const [result] = await Lead.aggregate([
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalLeads: { $sum: 1 },
                potentialBusinessValue: {
                  $sum: {
                    $cond: [
                      { $in: ['$leadStatus', activePipelineStatuses] },
                      { $ifNull: ['$estimatedValue', 0] },
                      0,
                    ],
                  },
                },
              },
            },
          ],
          byStatus: [{ $group: { _id: '$leadStatus', count: { $sum: 1 } } }],
        },
      },
    ]);

    const statusBreakdown = Object.fromEntries(LEAD_STATUSES.map((status) => [status, 0]));
    result.byStatus.forEach(({ _id: status, count }) => {
      statusBreakdown[status] = count;
    });

    const totals = result.totals[0] || { totalLeads: 0, potentialBusinessValue: 0 };

    return res.json({
      success: true,
      data: {
        totalLeads: totals.totalLeads,
        newLeads: statusBreakdown.New,
        proposalSent: statusBreakdown['Proposal Sent'],
        won: statusBreakdown.Won,
        lost: statusBreakdown.Lost,
        potentialBusinessValue: totals.potentialBusinessValue,
        statusBreakdown,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getStats };
