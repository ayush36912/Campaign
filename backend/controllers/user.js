const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Campaign = require('../models/campaign');
const User = require('../models/user');

exports.getAllUserIds = async (req, res) => {
    try{
        const users = await  User.find({}, '_id email');
        let emails = users.map(user => user.email);
        let userIds = users.map(user=> user._id);
        return res.status(200).json({userIds: userIds, emails : emails});
    } catch(err){
        console.log(err);
        return res.status(500).json({msg:"Server error"});
    }
}

exports.deleteUser = async (req,res)=>{
    const email = req.params.email;
    try {
        const campaigns = await Campaign.find({ "assignedUsers.email": email });
        if (campaigns.length > 0) {
            return res.status(400).json({ msg: "Cannot delete user as the user is assigned to one or more campaigns." });
        }

        await User.deleteOne({email : email});
        return res.status(200).json({ msg: "User deleted successfully." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Server error" });
    }
}

exports.getEnrolledCampaigns = async  (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId).populate('enrolledCampaigns');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const enrolledCampaigns = user.enrolledCampaigns;
        res.status(200).json({ enrolledCampaigns });
    } catch (err) {
        console.error("Error fetching enrolled campaigns:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.postEnrolledCampaign = async (req, res) => {
    const campaignId = req.params.campaignId;
    const user = await User.findOne({ email: req.user.email });
    if (!req.user) {
        return res.status(401).json({ message: "User not logged in" });
    }
    try {
        if (!user.enrolledCampaigns) {
            user.enrolledCampaigns = [];
        }
        user.enrolledCampaigns.push(campaignId);
        await user.save();

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }
        if(!campaign.enrolledUsers){
            campaign.enrolledUsers = [];
        }
        campaign.enrolledUsers.push({
            userId: user._id,
            name: user.name,
            email: user.email
        });
        await campaign.save();

        res.status(200).json({ message: "Campaign enrolled successfully", user: user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.unEnrolledFromCampaign = async (req, res) => {
    const campaignId = req.params.campaignId;
    const user = await User.findOne({ email: req.user.email });
    if (!req.user) {
        return res.status(401).json({ message: "User not logged in" });
    }
    try {
        user.enrolledCampaigns.pull(campaignId);
        await user.save();

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }
        campaign.enrolledUsers.pull({
            userId: user._id,
            name: user.name,
            email: user.email
        });
        await campaign.save();

        res.status(200).json({ message: "User UnEnrolled successfully", user: user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}