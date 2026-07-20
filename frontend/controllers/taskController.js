import Task from "../models/task.js";

// CREATE TASK
export const createTask = async (req, res) => {
    try {
        const task = await Task.create({
            userId: req.user._id,
            ...req.body
        });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET TASKS (scoped to user, optionally filter by project)
export const getTasks = async (req, res) => {
    try {
        const filter = { userId: req.user._id };
        if (req.query.projectId) filter.projectId = req.query.projectId;

        const tasks = await Task.find(filter)
            .populate("projectId", "projectName")
            .sort({ dueDate: 1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE TASK
export const updateTask = async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );
        if (!task) return res.status(404).json({ message: "Task not found" });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE TASK
export const deleteTask = async (req, res) => {
    try {
        await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        res.json({ message: "Task deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};