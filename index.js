require("dotenv").config();
const connectToMongo = require("./db");

const express = require("express");
const cors = require("cors");
connectToMongo();

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("hello");
});
// Available routes
app.use(cors());
app.use(express.json());
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.listen(port, () => {
  console.log(`FunChat app listening on port http://localhost:${port}`);
});
