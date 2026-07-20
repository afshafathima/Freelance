import TimeLog from "../models/Timelog.js";
import Project from "../models/project.js";
import Task from "../models/task.js";

const getUserId = (req) => {
    return req.user?._id || req.user?.id;
};

const validateProjectAndTask = async ({
    userId,
    projectId,
    taskId
}) => {
    const project = await Project.findOne({
        _id: projectId,
        userId
    });

    if (!project) {
        return {
            error: {
                status: 404,
                message: "Project not found"
            }
        };
    }

    const task = await Task.findById(taskId);

    if (!task) {
        return {
            error: {
                status: 404,
                message: "Task not found"
            }
        };
    }

    const taskProjectId =
        task.projectId || task.project;

    if (
        taskProjectId &&
        String(taskProjectId) !== String(projectId)
    ) {
        return {
            error: {
                status: 400,
                message:
                    "The selected task does not belong to this project"
            }
        };
    }

    if (
        task.userId &&
        String(task.userId) !== String(userId)
    ) {
        return {
            error: {
                status: 403,
                message:
                    "You are not authorized to use this task"
            }
        };
    }

    return {
        project,
        task
    };
};

/* =====================================================
   START TIMER
===================================================== */

export const startTimer = async (req, res) => {
    try {
        const userId = getUserId(req);

        const {
            projectId,
            taskId
        } = req.body;

        if (!userId) {
            return res.status(401).json({
                message: "User not authorized"
            });
        }

        if (!projectId || !taskId) {
            return res.status(400).json({
                message:
                    "Project and task are required"
            });
        }

        const existingRunningTimer =
            await TimeLog.findOne({
                userId,
                endTime: null,
                startTime: {
                    $ne: null
                }
            });

        if (existingRunningTimer) {
            return res.status(400).json({
                message:
                    "A timer is already running. Stop it before starting another timer."
            });
        }

        const validation =
            await validateProjectAndTask({
                userId,
                projectId,
                taskId
            });

        if (validation.error) {
            return res
                .status(validation.error.status)
                .json({
                    message:
                        validation.error.message
                });
        }

        const log = await TimeLog.create({
            userId,
            projectId,
            taskId,
            startTime: new Date(),
            duration: 0,
            billed: false
        });

        const populatedLog =
            await TimeLog.findById(log._id)
                .populate("projectId")
                .populate("taskId");

        return res.status(201).json(populatedLog);
    } catch (error) {
        console.error(
            "Start timer error:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Failed to start timer"
        });
    }
};

/* =====================================================
   STOP TIMER
===================================================== */

export const stopTimer = async (req, res) => {
    try {
        const userId = getUserId(req);

        const log = await TimeLog.findOne({
            _id: req.params.id,
            userId
        });

        if (!log) {
            return res.status(404).json({
                message: "Time log not found"
            });
        }

        if (!log.startTime) {
            return res.status(400).json({
                message:
                    "This time log has no start time"
            });
        }

        if (log.endTime) {
            return res.status(400).json({
                message:
                    "This timer has already been stopped"
            });
        }

        log.endTime = new Date();

        const seconds =
            (log.endTime.getTime() -
                new Date(log.startTime).getTime()) /
            1000;

        log.duration =
            Math.round(
                (seconds / 3600) * 10000
            ) / 10000;

        await log.save();

        const populatedLog =
            await TimeLog.findById(log._id)
                .populate("projectId")
                .populate("taskId");

        return res.status(200).json(populatedLog);
    } catch (error) {
        console.error(
            "Stop timer error:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Failed to stop timer"
        });
    }
};

/* =====================================================
   MANUAL TIME ENTRY
===================================================== */

export const manualEntry = async (req, res) => {
    try {
        const userId = getUserId(req);

        const {
            projectId,
            taskId,
            hours
        } = req.body;

        if (!userId) {
            return res.status(401).json({
                message: "User not authorized"
            });
        }

        if (!projectId || !taskId) {
            return res.status(400).json({
                message:
                    "Project and task are required"
            });
        }

        const numericHours = Number(hours);

        if (
            !Number.isFinite(numericHours) ||
            numericHours <= 0
        ) {
            return res.status(400).json({
                message:
                    "Hours must be greater than zero"
            });
        }

        const validation =
            await validateProjectAndTask({
                userId,
                projectId,
                taskId
            });

        if (validation.error) {
            return res
                .status(validation.error.status)
                .json({
                    message:
                        validation.error.message
                });
        }

        const log = await TimeLog.create({
            userId,
            projectId,
            taskId,
            duration: numericHours,
            billed: false
        });

        const populatedLog =
            await TimeLog.findById(log._id)
                .populate("projectId")
                .populate("taskId");

        return res.status(201).json(populatedLog);
    } catch (error) {
        console.error(
            "Manual entry error:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Failed to save manual time entry"
        });
    }
};

/* =====================================================
   GET TIME LOGS
===================================================== */

export const getLogs = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                message: "User not authorized"
            });
        }

        const logs = await TimeLog.find({
            userId
        })
            .populate("projectId")
            .populate("taskId")
            .sort({ createdAt: -1 });

        return res.status(200).json(logs);
    } catch (error) {
        console.error(
            "Get time logs error:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Failed to load time logs"
        });
    }
};