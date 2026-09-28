const Notification = require('../models/NotificationSchema')



exports.getAllNotifications_AdminView = async (req, res) => {
    try {
        const newNotifications = await Notification.find({
            $or: [
                { newPolicy: true },
                { newAgent: true },
            ],
            source: 'Agent'
        }).sort({ createdAt: -1 });

        const unReadNotifications = await Notification.find({
            $and: [
                {
                    $or: [
                        { newPolicy: true },
                        { newAgent: true },
                    ],
                },
                { source: 'Agent' },
                { unRead: true }
            ]
        })

        const noOfUnReadNotification = unReadNotifications.length
        // console.log("noOfNewNotification", noOfUnReadNotification);

        res.status(200).send({
            notifications: newNotifications,
            noOfUnReadNotification: noOfUnReadNotification
        })

    } catch (error) {
        // console.error('Error retrieving and checking notifications:', error);
    }
}

exports.getAllNotifications_AgentView = async (req, res) => {
    try {
        const agentCode = req.params.agentCode;
        const newNotifications = await Notification.find({
            source: 'Admin',
            agentCode: agentCode
        }).sort({ createdAt: -1 });

        const unReadNotifications = await Notification.find({
            $and: [
                {
                    agentCode: agentCode,
                    source: 'Admin'
                },
                {
                    unRead: true
                }
            ]
        })

        const noOfUnReadNotification = unReadNotifications.length
        // console.log("noOfNewNotification", noOfUnReadNotification);

        res.status(200).send({
            notifications: newNotifications,
            noOfUnReadNotification: noOfUnReadNotification
        })

    } catch (error) {
        // console.error('Error retrieving and checking notifications:', error);
        res.status(500).send(error.message)
    }

}

exports.getAllNotifications_FinanceView = async (req, res) => {
    try {
        const newNotifications = await Notification.find({
            source: 'Admin',
            isPaidOut:true
        }).sort({ createdAt: -1 });

        const unReadNotifications = await Notification.find({
            $and: [
                {
                    isPaidOut:true,
                    source: 'Admin'
                },
                {
                    unRead: true
                }
            ]
        })

        const noOfUnReadNotification = unReadNotifications.length

        res.status(200).send({
            notifications: newNotifications,
            noOfUnReadNotification: noOfUnReadNotification
        })

    } catch (error) {
        res.status(500).send(error.message)
    }

}


exports.updateNotification = async (req, res) => {
    try {
        const id = req.params.id;

        const notification = await Notification.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    unRead: false
                }
            },
            {
                new: true
            }
        )

        if (notification) {
            res.status(200).send(notification)
        }

    } catch (error) {
        res.status(400).send(error.message)
    }
}