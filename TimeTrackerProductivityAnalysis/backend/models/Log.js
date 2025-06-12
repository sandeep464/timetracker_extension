const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  logs: [
    {
      site: {
        type: String,
        required: true,
      },
      timeSpent: {
        type: Number,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Log", logSchema);
