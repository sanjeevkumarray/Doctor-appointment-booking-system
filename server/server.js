require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const Doctor = require("./models/Doctor");
const doctors = require("./data/doctors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Export io for use in other files
module.exports = { io, server, app };

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB and seed doctors if collection is empty
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB");

    // Check if the doctors collection is empty
    const count = await Doctor.countDocuments();
    if (count === 0) {
      try {
        const insertedDoctors = await Doctor.insertMany(doctors);
        console.log(`Inserted ${insertedDoctors.length} doctors`);
      } catch (error) {
        console.error("Error seeding doctors:", error);
      }
    } else {
      console.log("Doctors collection already has data, skipping seeding.");
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("A client connected");

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

// Routes
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
