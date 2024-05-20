const mongoose = require('mongoose');
const User = require('./user');

const Schema = mongoose.Schema;

const campaignSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['public', 'private'],
        required: true
    },
    imageUrl: [{
        type: String,
        required: true
    }],
    description: {
        type: String,
        required: true
    },
    // assignedUsers:[{
    //     type: Schema.Types.ObjectId,
    //     //type: String,
    //     ref: "User"
    // }],
    assignedUsers:[{
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required:true
        }
    }],
    enrolledUsers:[{
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required:true
        }
    }]
    // user: {
    //     email:  {
    //         type: String,
    //         required: true
    //     },
    //     userId: {
    //         type: Schema.Types.ObjectId,
    //         ref: 'User',
    //     }
    // }
});

campaignSchema.pre('save', async function(next) {
    try {
        const User = mongoose.model('User');
        const users = await User.find({_id: { $in: this.assignedUsers.map(user => user.userId) }});
        this.assignedUsers = this.assignedUsers.map(user => {
            const foundUser = users.find(u => u._id.toString() === user.userId.toString());
            return { userId: user.userId, name: foundUser ? foundUser.name : 'Unknown',  email: user.email }; 
        });
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Campaign', campaignSchema);


 // admin: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true
    // },