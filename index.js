const express = require("express");
const apiRoutes = require("./routes/api_routes");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/", apiRoutes);

if (process.env.NODE_ENV == "production") {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`Server running - http://localhost:${PORT}`);
  });
}
