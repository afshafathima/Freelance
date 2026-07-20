import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client",
            required: true
        },

        projectName: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["Active", "Completed"],
            default: "Active"
        },

        budget: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

const Project =
    mongoose.models.Project ||
    mongoose.model("Project", projectSchema);

export default Project;