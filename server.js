require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/UserRoutes");
const CorpRoutes = require("./routes/CorpRoutes");
const MessageRoutes = require("./routes/MessageRoutes");
const socketServer = require("./socketServer"); // Import the socketServer module

//express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize socket.io server
socketServer(server); // Use the socketServer module

//middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use("/api/users", userRoutes);
app.use("/", CorpRoutes);
app.use("/message", MessageRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT, () => {
      // Use server.listen instead of app.listen
      console.log(
        `Connected to MongoDB and Server is listening on port: ${process.env.PORT}`
      );
    });
  })
  .catch((error) => {
    console.log(error);
  });
