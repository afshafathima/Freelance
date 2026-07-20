import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        dueDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Completed"],
            default: "Pending",
        },
    },
    {
        timestamps: true,
    }
);

const Task =
    mongoose.models.Task || mongoose.model("Task", taskSchema);

export default Task;