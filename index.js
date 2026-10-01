require("dotenv").config();

const express = require("express");
require("./db");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const recruitsRoutes = require("./routes/recruitsRoutes");
const agentsRoutes = require("./routes/agentRoutes");
const policiesRoutes = require("./routes/policiesRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const supportRoutes = require("./routes/supportRoutes");
const supportController = require("./controller/supportController");

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/recruits", recruitsRoutes);
app.use("/api/agents", agentsRoutes);
app.use("/api/policies", policiesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/support", supportRoutes);
app.get("/support", supportController.renderTechnicalSupportForm);
app.get("/forms/technical-support", supportController.renderTechnicalSupportForm);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the  JOPTIMAN CRM API " });
});

app.get("/api", (req, res) => {
  res.json({ message: "Welcome to the JOPTIMAN CRM API" });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
  });
}
