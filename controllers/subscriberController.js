import Subscriber from "../models/Subscriber.js";

// @desc    Subscribe to newsletter
// @route   POST /api/subscribers
// @access  Public
export const subscribe = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const existingSubscriber = await Subscriber.findOne({ email });

        if (existingSubscriber) {
            return res.status(400).json({ message: "This email is already subscribed to the nexus." });
        }

        await Subscriber.create({ email });

        res.status(201).json({ message: "Vector Authorized. Welcome to the Nexus." });
    } catch (error) {
        console.error("Newsletter Subscription Error:", error);
        res.status(500).json({ message: "Failed to authorize transmission. Please try again later." });
    }
};

// @desc    Get all subscribers (Admin only)
// @route   GET /api/subscribers
// @access  Private/Admin
export const getSubscribers = async (req, res) => {
    try {
        const subscribers = await Subscriber.find({}).sort("-createdAt");
        res.json(subscribers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching subscribers" });
    }
};
