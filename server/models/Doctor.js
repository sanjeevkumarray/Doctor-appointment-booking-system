const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  working_hours: {
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
  },
  image_url: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Doctor", doctorSchema);
