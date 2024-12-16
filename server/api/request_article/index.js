const express = require('express');
const {reqArticle, getAllRequests,sendEmail} = require('./controller');

const router = express.Router();
router.route('/').post(reqArticle);
router.route("/email").post(sendEmail);
// router.route('/').get(getAllRequests);

module.exports = router;
