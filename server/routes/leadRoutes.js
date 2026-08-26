const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const {
  createLead,
  deleteLead,
  getLead,
  getLeads,
  updateLead,
} = require('../controllers/leadController');

const router = express.Router();

router.use(authenticate);
router.route('/').get(getLeads).post(createLead);
router.route('/:id').get(getLead).put(updateLead).delete(deleteLead);

module.exports = router;
