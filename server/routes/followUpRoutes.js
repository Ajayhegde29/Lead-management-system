const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { addFollowUp, getFollowUps } = require('../controllers/followUpController');

const router = express.Router({ mergeParams: true });

router.use(authenticate);
router.route('/').get(getFollowUps).post(addFollowUp);

module.exports = router;
