import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const createToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error(
            "JWT_SECRET is missing from the .env file"
        );
    }

    return jwt.sign(
        {
            id: userId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};

const formatUser = (user) => {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan
    };
};


export const register = async (req, res) => {
    try {
        const name =
            typeof req.body.name === "string"
                ? req.body.name.trim()
                : "";

        const email =
            typeof req.body.email === "string"
                ? req.body.email.trim().toLowerCase()
                : "";

        const password =
            typeof req.body.password === "string"
                ? req.body.password
                : "";

        if (!name || !email || !password) {
            return res.status(400).json({
                message:
                    "Name, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message:
                    "Password must contain at least 6 characters"
            });
        }

        const existingUser = await User.findOne({
            email
        });

        if (existingUser) {
            return res.status(409).json({
                message:
                    "An account with this email already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            plan: "Free"
        });

        const token = createToken(user._id);

        return res.status(201).json({
            message: "Registration successful",
            token,
            user: formatUser(user)
        });
    } catch (error) {
        console.error("REGISTER ERROR:", error);

        if (error?.code === 11000) {
            return res.status(409).json({
                message:
                    "An account with this email already exists"
            });
        }

        return res.status(500).json({
            message:
                error.message ||
                "Registration failed"
        });
    }
};

/* =====================================================
   LOGIN
===================================================== */

export const login = async (req, res) => {
    try {
        const email =
            typeof req.body.email === "string"
                ? req.body.email.trim().toLowerCase()
                : "";

        const password =
            typeof req.body.password === "string"
                ? req.body.password
                : "";

        if (!email || !password) {
            return res.status(400).json({
                message:
                    "Email and password are required"
            });
        }

        const user = await User.findOne({
            email
        });

        if (!user) {
            return res.status(401).json({
                message:
                    "Invalid email or password"
            });
        }

        const passwordMatches =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatches) {
            return res.status(401).json({
                message:
                    "Invalid email or password"
            });
        }

        const token = createToken(user._id);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: formatUser(user)
        });
    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            message:
                error.message ||
                "Login failed"
        });
    }
};

export const upgradePlan = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.plan = user.plan === "Free" ? "Pro" : "Free";
        await user.save();
        return res.status(200).json({
            message: `Plan updated to ${user.plan}`,
            user: formatUser(user)
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};