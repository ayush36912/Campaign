const express = require('express')
const { body } = require('express-validator');
const adminController = require('../controllers/admin')
const isAuth = require('../middleware/is-auth')
const router = express.Router()

router.get('/campaigns', adminController.getCampaigns);
router.get('/updatecampaigns', adminController.getupdateCampaigns);
router.post('/campaign',[
    body('title').isString().isLength({ min: 3 }).trim(),
    body('description').isLength( {min:8 , max:200 }).trim(),
    //body('assignedUsers').matches(/^[a-z0-9]{24}$/),
], adminController.createCampaign);
//router.get('/campaign/:campaignId', adminController.getCampaign);
router.put('/campaign/:campaignId',[
    body('title').isString().isLength({ min: 3 }).trim(),
    body('description').isLength( {min:8 , max:200 }).trim(),
    // body('assignedUsers').matches(/^[a-z0-9]{24}$/),
], adminController.updateCampaign);
router.delete('/campaign/:campaignId', adminController.deleteCampaign);
router.get('/campaign/:campaignId/assignedUsers', adminController.getAssignedUsers);
router.post('/campaign/:campaignId/assignUser/:email',[

], adminController.assignUserToCampaign);
router.delete('/campaign/:campaignId/removeUser/:email',[
   // body('assignedUsers').matches(/^[a-z0-9]{24}$/),
], adminController.removeUserFromCampaign);

module.exports = router;