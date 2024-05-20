const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Campaign = require('../models/campaign');
const User = require('../models/user');
const asyncLock = require('async-lock');

const lock = new asyncLock();

exports.getCampaigns = async (req, res) => {
    try {
        let  campaigns;
        if(req.user){
            const user = await User.findOne({ email: req.user.email });

            if(!user){
                throw new Error("User not found!");
            }
            const userId =  user._id;
            const enrolledCampaigns = user.enrolledCampaigns;

            campaigns = await Campaign.find({
             $or:[
                    {   _id :  {$nin : enrolledCampaigns},
                        type: 'public'     
                    }
                    , { 
                        type: 'private', 
                        _id :  {$nin : enrolledCampaigns},
                        "assignedUsers.userId": userId 
                    }  
                ]
            });
        } else{
            campaigns = await Campaign.find({type:'public'});
        }
        if (!campaigns || campaigns.length === 0) {
            throw new Error("No campaigns found!");
        }

        res.status(200).json(campaigns);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getupdateCampaigns = async (req,res) => {
    try{
        const campaigns = await Campaign.find();
        if(!campaigns){
            throw new Error("No campaigns found!");
        }
        res.status(200).json(campaigns);
    }catch(err) {
        res.status(500).json({message: err.message});
    }
}

exports.createCampaign  = async (req,res)=>{
    let { title, type, description, assignedUsers} = req.body;
    assignedUsers = assignedUsers.split(",").map(id=>id.trim());
    // assignedUsers = assignedUsers.map(id => id.toString());
    //console.log(assignedUsers);
    console.log('assignedUser:', assignedUsers);
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
    if(!req.files){
        return  res.status(400).json({msg:"Please select an image!"});
    }
    try{
        let assignedUsersDetails = [];
        if (type === 'private') {
            if (!assignedUsers || assignedUsers.length === 0) {
                return res.status(400).json({ message: 'Assigned users are required for private campaigns.' });
            }
        for (const email of assignedUsers) {
            const user = await User.find({email : email });
            if (!user) {
                return res.status(404).json({ message: `User with ID ${email} not found` });
            }
            assignedUsersDetails.push({ userId: user[0]._id, name: user[0].name, email: user[0].email });
        }
        } else {
            assignedUsers= undefined; 
        }
        const imageUrl = req.files.map((file) => file.path.replace('\\', '/'));
        const campaign = new Campaign({
            title,
            type,
            description,
            assignedUsers: assignedUsersDetails,
            imageUrl
        });
        const newCampaign = await campaign.save();
        res.status(201).json(newCampaign);
    }catch(err){
        console.log(err);
        return res.status(400).json({ message: err.message });
    }
}

exports.getCampaign = async (req,res) => {
    const campaignId = req.params.campaignId;
    try{
        const  campaign = await Campaign
        .findById(campaignId);
        // .populate('admin')
        //.populate('assignedUsers');
        if (!campaign) {
          throw new Error('campaign is not in records.');
        }
        res.status(200).json(campaign);
    }catch(err) {
        return res.status(500).json({ message: err.message });
    }
}

exports.updateCampaign = async (req, res) => {
    const campaignId = req.params.campaignId;
    let { title, type, description, oldimage } = req.body;
    const newImages = req.files;
    let imageUrl;

    if (newImages) {
        imageUrl = newImages.map((file) => file.path.replace('\\', '/'));
    }

    if (oldimage) {
        oldimage.split(",").map(old=>{
            imageUrl.push(old);
        });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let campaign = await Campaign.findById(campaignId);

        if (!campaign) {
            throw new Error("No campaign found!");
        }

        if (type === 'public') {
            campaign.assignedUsers = [];
        } else if (type === 'private') {
            let { assignedUsers } = req.body;
            assignedUsers = assignedUsers.split(",").map(id => id.trim());

            if (!assignedUsers || assignedUsers.length === 0) {
                return res.status(400).json({ message: 'Assigned users are required for private campaigns.' });
            }

            let assignedUsersDetails = [];
            for (const email of assignedUsers) {
                const user = await User.find({email: email});
                if (!user) {
                    return res.status(404).json({ message: `User with ID ${email} not found` });
                }
                assignedUsersDetails.push({ userId: user[0]._id, name: user[0].name, email: user[0].email });
            }
            campaign.assignedUsers = assignedUsersDetails;
        }

        if (imageUrl) {
            campaign.imageUrl = imageUrl;
        }
        campaign.title = title;
        campaign.type = type;
        campaign.description = description;

        const updatedCampaign = await campaign.save();
        res.status(200).json(updatedCampaign);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
}

exports.deleteCampaign = async (req,res) => {
    const campaignId = req.params.campaignId;
    try{
        const campaign = await Campaign.findById(campaignId);
        if(!campaign){
            throw new Error("No campaigns found!");
        }
        console.log(campaign.enrolledUsers.length);
        if (campaign.enrolledUsers.length > 0) {
            return res.status(403).json({ message: "Cannot delete campaign with enrolled users." });
        }else{
        await Campaign.findByIdAndDelete(campaignId);
        clearImage(campaign.imageUrl[0]);
        res.status(200).json({message: "campaign successfully deleted."})
        }
    }catch(err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
}

exports.getAssignedUsers = async (req, res) => {
    const { campaignId } = req.params;

    try {
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ msg: 'Campaign not found' });
        }

        const assignedUsers = campaign.assignedUsers.map(user => ({
            userId: user.userId,
            name: user.name,
            email: user.email
        })); 
        return res.status(200).json({ assignedUsers });
    } catch (error) {
        console.error('Error fetching assigned users:', error);
        return res.status(500).json({ msg: 'Server error' });
    }
};

exports.assignUserToCampaign = async (req, res) => {
    const { campaignId, email } = req.params;
    console.log(email);
    try {
        await lock.acquire(campaignId,async ()=>{
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }

        const user = await User.find({email: email});
        console.log(user);
        if (!user) {
            throw new Error('User not found');
        }
        const isUserAssigned = campaign.assignedUsers.some(u => u.email === email);
        if (isUserAssigned) {
            return res.status(400).json({ message: 'User is already assigned to this campaign' });
        }
        console.log(user[0]._id);
       campaign.assignedUsers.push({ userId: user[0]._id, name: user[0].name, email:  user[0].email});
        await campaign.save();
        res.status(200).json({ message: 'User assigned to campaign successfully' });
    });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.removeUserFromCampaign = async (req, res) => {
    const { campaignId, email } = req.params;
    try {
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        const userIndex = campaign.assignedUsers.findIndex(u => u.email === email);
        if (userIndex === -1) {
            throw new Error('User not found in assigned users');
        }
        campaign.assignedUsers.splice(userIndex, 1);
        await campaign.save();
        res.status(200).json({ message: 'User removed from campaign successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err))
}
