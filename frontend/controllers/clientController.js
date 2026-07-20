import Client from "../models/Client.js";

// CREATE CLIENT
export const createClient = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            hourlyRate
        } = req.body;

        const client = await Client.create({
            userId: req.user._id,
            name,
            email,
            phone,
            hourlyRate
        });

        res.status(201).json({
            message: "Client created successfully",
            client
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
};

export const getClients = async (req, res) => {
    try {
        const clients = await Client.find({ userId: req.user._id });
        res.json(clients);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// UPDATE CLIENT
export const updateClient = async (req, res) => {
    try {
        const client = await Client.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );
        if (!client) {
            return res.status(404).json({ message: "Client not found" });
        }
        res.json(client);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// DELETE CLIENT
export const deleteClient = async (req, res) => {
    try {
        const client = await Client.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!client) {
            return res.status(404).json({ message: "Client not found" });
        }
        res.json({ message: "Client deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};