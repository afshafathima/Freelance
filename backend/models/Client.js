import mongoose from "mongoose";


const clientSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: {
    type: String,
    required: true
  },


  email: {
    type: String
  },


  phone: {
    type: String
  },


  hourlyRate: {
    type: Number,
    default: 0
  },
  clientName: {
    type: String
  }

}, {
  timestamps: true
});


const Client = mongoose.models.Client || mongoose.model("Client", clientSchema);
export default Client;