import mongoose from "mongoose";

const lineItemSchema = new mongoose.Schema({
    description: String,
    hours: Number,
    rate: Number,
    amount: Number
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
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
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    },
    amount: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ["Draft", "Sent", "Paid"],
        default: "Draft"
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },

    description: {
        type: String
    },
    lineItems: [lineItemSchema]
}, {
    timestamps: true
});

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
