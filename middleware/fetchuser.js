const jwt = require("jsonwebtoken");
const JWT_SECRET = "mySecretI&MyBussiness@ndNotY0r";

const fetchuser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ error: "NO Authentication token present" });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({ error });
  }
};

module.exports = fetchuser;
