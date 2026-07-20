import Project from "../models/project.js";
import Client from "../models/Client.js";
import TimeLog from "../models/Timelog.js";

const getUserId = (req) => {
    return req.user?._id || req.user?.id;
};

// CREATE PROJECT
export const createProject = async (req, res) => {
    try {
        const userId = getUserId(req);

        const {
            projectName,
            clientId,
            budget,
            status
        } = req.body;

        if (!userId) {
            return res.status(401).json({
                message: "User not authorized"
            });
        }

        if (!projectName || !projectName.trim()) {
            return res.status(400).json({
                message: "Project name is required"
            });
        }

        if (!clientId) {
            return res.status(400).json({
                message: "Please select a client"
            });
        }

        const client = await Client.findOne({
            _id: clientId,
            userId
        });

        if (!client) {
            return res.status(404).json({
                message:
                    "Client not found or does not belong to your account"
            });
        }

        const project = await Project.create({
            userId,
            clientId,
            projectName: projectName.trim(),
            budget: Number(budget) || 0,
            status: status || "Active"
        });

        const populatedProject =
            await Project.findById(project._id)
                .populate("clientId");

        return res.status(201).json(
            populatedProject
        );
    } catch (error) {
        console.error(
            "Create project error:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Failed to create project"
        });
    }
};

// GET ALL PROJECTS
export const getProjects = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                message: "User not authorized"
            });
        }

        const projects = await Project.find({
            userId
        })
            .populate("clientId")
            .sort({ createdAt: -1 });

        console.log(
            `Projects found for user ${userId}:`,
            projects.length
        );

        return res.status(200).json(projects);
    } catch (error) {
        console.error(
            "Get projects error:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Failed to load projects"
        });
    }
};

// UPDATE PROJECT
export const updateProject = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                message: "User not authorized"
            });
        }

        const updateData = {
            ...req.body
        };

        if (updateData.budget !== undefined) {
            updateData.budget =
                Number(updateData.budget) || 0;
        }

        const project =
            await Project.findOneAndUpdate(
                {
                    _id: req.params.id,
                    userId
                },
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            ).populate("clientId");

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        return res.status(200).json(project);
    } catch (error) {
        console.error(
            "Update project error:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Failed to update project"
        });
    }
};

// DELETE PROJECT
export const deleteProject = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                message: "User not authorized"
            });
        }

        const project =
            await Project.findOneAndDelete({
                _id: req.params.id,
                userId
            });

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        return res.status(200).json({
            message: "Project deleted successfully"
        });
    } catch (error) {
        console.error(
            "Delete project error:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Failed to delete project"
        });
    }
};

// GET PROJECT BURN RATE
export const getBurnRate = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                message: "User not authorized"
            });
        }

        const project = await Project.findOne({
            _id: req.params.id,
            userId
        }).populate("clientId");

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const logs = await TimeLog.find({
            projectId: project._id,
            userId
        });

        const totalHours = logs.reduce(
            (total, log) =>
                total +
                (Number(log.duration) || 0),
            0
        );

        const hourlyRate = Number(
            project.clientId?.hourlyRate ??
            project.clientId?.defaultHourlyRate ??
            0
        );

        const spent =
            totalHours * hourlyRate;

        const budget =
            Number(project.budget) || 0;

        const burnPercent =
            budget > 0
                ? Math.min(
                    (spent / budget) * 100,
                    100
                )
                : 0;

        return res.status(200).json({
            totalHours:
                Math.round(totalHours * 100) /
                100,

            hourlyRate,

            spent:
                Math.round(spent * 100) /
                100,

            budget,

            burnPercent:
                Math.round(burnPercent)
        });
    } catch (error) {
        console.error(
            "Burn-rate error:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Failed to calculate burn rate"
        });
    }
};