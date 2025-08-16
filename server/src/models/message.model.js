import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // Due to group messages
  },
  messageType: {
    type: String,
    enum: ["text", "file"],
    default: "text",
    required: true
  },
  content: {
    type: String,
    required: function () { return this.messageType === "text"; },
    trim: true
  },
  fileUrl: {
    type: String,
    required: function () { return this.messageType === "file"; },
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  seen: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
