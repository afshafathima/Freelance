import Client from "../models/Client.js";

// Enforce Free plan: max 2 clients
const planMiddleware = async (req, res, next) => {
    try {
        if (req.user.plan === "Free") {
            const count = await Client.countDocuments({ userId: req.user._id });
            if (count >= 2) {
                return res.status(403).json({
                    message: "Free plan limit reached. Upgrade to Pro for unlimited clients.",
                    limitReached: true
                });
            }
        }
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default planMiddleware;
