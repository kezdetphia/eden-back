require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/UserRoutes");
const CorpRoutes = require("./routes/CorpRoutes");
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

//this works this is perfect
// require("dotenv").config();
// const express = require("express");
// const http = require("http");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const { Server } = require("socket.io");
// const userRoutes = require("./routes/UserRoutes");
// const CorpRoutes = require("./routes/CorpRoutes");

// //express app
// const app = express();

// // Create HTTP server
// const server = http.createServer(app);

// // Initialize socket.io server
// const io = new Server(server, {
//   cors: {
//     origin: "*", // Adjust this to your client's URL if needed
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   console.log("a user connected");

//   socket.on("chat message", (msg) => {
//     console.log(`Received message: ${msg}`);
//     io.emit("chat message", msg); // Broadcast message to all connected clients
//   });

//   socket.on("disconnect", (reason) => {
//     console.log(`user disconnected: ${reason}`);
//   });
// });

// //middleware
// app.use(cors());
// app.use(express.json());

// app.use((req, res, next) => {
//   console.log(req.path, req.method);
//   next();
// });

// app.use("/api/users", userRoutes);
// app.use("/", CorpRoutes);

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     server.listen(process.env.PORT, () => {
//       // Use server.listen instead of app.listen
//       console.log(
//         `Connected to MongoDB and Server is listening on port: ${process.env.PORT}`
//       );
//     });
//   })
//   .catch((error) => {
//     console.log(error);
//   });
//this works this is perfect

///origi
// require("dotenv").config();
// const express = require("express");
// const http = require("http");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const socketServer = require("./socketServer");

// const userRoutes = require("./routes/UserRoutes");
// const CorpRoutes = require("./routes/CorpRoutes");

// //express app
// const app = express();

// const server = http.createServer(app);
// socketServer(server);

// //middleware
// app.use(cors());
// //Built-in Express middleware allows access to the request (req) properties when a request comes in.
// app.use(express.json());

// app.use((req, res, next) => {
//   console.log(req.path, req.method);
//   next();
// });

// app.use("/api/users", userRoutes);
// app.use("/", CorpRoutes);

// //this works
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     app.listen(process.env.PORT, () => {
//       console.log(
//         `Connected to MongoDB and Server is listening on port: ${process.env.PORT}`
//       );
//     });
//   })
//   .catch((error) => {
//     console.log(error);
//   });
///origi
