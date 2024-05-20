const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user');

const router = express.Router();

router.get('/users', userController.getAllUserIds);
router.delete('/deleteUser/:email', userController.deleteUser);
router.get('/user/:userId/enrolledCampaigns', userController.getEnrolledCampaigns)
router.post('/enrolledCampaign/:campaignId', userController.postEnrolledCampaign);
router.delete('/removeCampaign/:campaignId', userController.unEnrolledFromCampaign);

module.exports = router;