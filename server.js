require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/UserRoutes");
const CorpRoutes = require("./routes/CorpRoutes");

//express app
const app = express();

//middleware
app.use(cors());
//Built-in Express middleware allows access to the request (req) properties when a request comes in.
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
    app.listen(process.env.PORT, () => {
      console.log(
        `Connected to MongoDB and Server is listening on port: ${process.env.PORT}`
      );
    });
  })
  .catch((error) => {
    console.log(error);
  });
