import mongoose from "mongoose";

const timeLogSchema = new mongoose.Schema(
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
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            default: null,
        },
        startTime: {
            type: Date,
            default: null,
        },
        endTime: {
            type: Date,
            default: null,
        },
        duration: {
            type: Number,
            default: 0,
            min: 0,
        },
        billed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const TimeLog =
    mongoose.models.TimeLog ||
    mongoose.model("TimeLog", timeLogSchema);

export default TimeLog;